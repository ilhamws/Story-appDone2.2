export class FavoriteStoriesPresenter {
  constructor(view, storyDatabase) {
    this.view = view;
    this.storyDatabase = storyDatabase;
    this.init();
  }

  async init() {
    this.view.showLoading();
    try {
      await this.storyDatabase.init();
      const favoriteStories = await this.storyDatabase.getFavoriteStories();
      this.view.render(favoriteStories);
    } catch (error) {
      this.view.showError(error.message);
      this.view.onRetry(() => this.init());
    }
  }
} 