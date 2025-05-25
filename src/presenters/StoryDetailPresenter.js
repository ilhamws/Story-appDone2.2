export class StoryDetailPresenter {
  constructor(view, model, storyId) {
    this.view = view;
    this.model = model;
    this.storyId = storyId;
  }

  render() {
    return this.view.render({ 
      id: this.storyId,
      name: 'Loading story...',
      description: 'Please wait while we load the story details...',
      photoUrl: '',
      createdAt: new Date().toISOString(),
      lat: null,
      lon: null
    });
  }

  async init() {
    try {
      const story = await this.model.getStoryById(this.storyId);
      if (!story) {
        throw new Error('Story not found');
      }
      this.view.renderStory(story);
      if (story.lat && story.lon) {
        await this.view.initMap(story.lat, story.lon);
        await this.view.addMarker(story.lat, story.lon, story.name);
        try {
          const address = await this.view.getAddress(story.lat, story.lon);
          this.view.updateAddress(address);
        } catch (error) {
          this.view.updateAddress(`Location: ${story.lat.toFixed(4)}, ${story.lon.toFixed(4)}`);
        }
      }
    } catch (error) {
      this.view.showError(error.message || 'An error occurred while loading the story.');
    }
  }
}