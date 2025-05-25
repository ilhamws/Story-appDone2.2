export class StoryPresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;
    this.init();
  }

  async init() {
    this.view.showLoading();
    try {
      const stories = await this.model.getAllStories();
      this.view.render(stories);
    } catch (error) {
      this.view.showError(error.message);
      this.view.onRetry(() => this.init());
    }
  }
}