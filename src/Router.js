export class Router {
  constructor() {
    this.routes = {
      '/': this.createStoryPresenter.bind(this),
      '/stories': this.createStoryPresenter.bind(this),
      '/stories/:id': this.createStoryDetailPresenter.bind(this),
      '/add-story': this.createAddStoryPresenter.bind(this),
      '/login': this.createAuthPresenter.bind(this),
      '/register': this.createAuthPresenter.bind(this),
      '/404': this.createNotFoundPresenter.bind(this)
    };
    this.modes = {
      '/login': 'login',
      '/register': 'register'
    };
    this.setupViewTransitions();
  }

  // Factory methods untuk membuat instance Presenter dengan dynamic import
  async createStoryPresenter() {
    const { StoryView } = await import('@/views/StoryView.js');
    const { StoryModel } = await import('@/models/StoryModel.js');
    const view = new StoryView();
    const model = new StoryModel();
    const { StoryPresenter } = await import('@/presenters/StoryPresenter.js');
    return new StoryPresenter(view, model);
  }

  async createStoryDetailPresenter(id) {
    const { StoryDetailView } = await import('@/views/StoryDetailView.js');
    const { StoryModel } = await import('@/models/StoryModel.js'); // Ubah dari StoryData ke StoryModel
    const view = new StoryDetailView();
    const model = new StoryModel();
    const { StoryDetailPresenter } = await import('@/presenters/StoryDetailPresenter.js');
    return new StoryDetailPresenter(view, model, id);
  }

  async createAddStoryPresenter() {
    const { AddStoryView } = await import('@/views/AddStoryView.js');
    const { StoryData } = await import('@/models/StoryData.js');
    const view = new AddStoryView();
    const model = new StoryData();
    const { AddStoryPresenter } = await import('@/presenters/AddStoryPresenter.js');
    return new AddStoryPresenter(view, model);
  }

  async createAuthPresenter(mode) {
    const { AuthView } = await import('@/views/AuthView.js');
    const { UserAuth } = await import('@/models/UserAuth.js');
    const view = new AuthView();
    const model = new UserAuth();
    const { AuthPresenter } = await import('@/presenters/AuthPresenter.js');
    return new AuthPresenter(view, model, mode);
  }

  async createNotFoundPresenter() {
    const { NotFoundView } = await import('@/views/NotFoundView.js');
    const view = new NotFoundView();
    return { view, render: () => view.render(), init: () => view.init() };
  }

  setupViewTransitions() {
    if (!document.startViewTransition) {
      this.transition = (callback) => callback();
      return;
    }
    
    this.originalHandleRoute = this.handleRoute.bind(this);
    this.handleRoute = async () => {
      document.startViewTransition(() => {
        this.originalHandleRoute();
      });
    };
  }

  init() {
    window.addEventListener('hashchange', this.handleRoute.bind(this));
    this.handleRoute();
  }

  async handleRoute() {
    try {
      const { UserSession } = await import('@/services/UserSession.js');
      const { NotificationService } = await import('@/services/NotificationService.js');
      const hash = window.location.hash.slice(1) || '/';
      
      // Penanganan khusus untuk hash '/'
      let routePath = '/';
      let id = null;
      
      if (hash !== '/') {
        const segments = hash.split('/').filter(Boolean);
        if (segments.length > 0) {
          const path = segments[0];
          id = segments[1] || null;
          routePath = id ? `/${path}/:id` : `/${path}`;
        }
      }
      
      if (routePath !== '/login' && routePath !== '/register' && routePath !== '/404' && !UserSession.isAuthenticated()) {
        NotificationService.showError('Please login to access this page');
        window.location.hash = '/login';
        return;
      }

      if ((routePath === '/login' || routePath === '/register') && UserSession.isAuthenticated()) {
        NotificationService.showSuccess('You are already logged in');
        window.location.hash = '/';
        return;
      }

      const createPresenter = this.routes[routePath];
      
      if (!createPresenter) {
        window.location.hash = '/404';
        return;
      }
      
      const mode = this.modes[routePath];
      const app = document.getElementById('app');
      
      if (!app) return;

      const presenter = id ? await createPresenter(id) : mode ? await createPresenter(mode) : await createPresenter();
      if (presenter.render) {
        app.innerHTML = presenter.render();
      }
      if (presenter.init) {
        await presenter.init();
      }
    } catch (error) {
      console.error('Routing error:', error);
      const app = document.getElementById('app');
      if (app) {
        app.innerHTML = `
          <div class="error-state">
            <h1>Error Loading Page</h1>
            <p>${error.message || 'Failed to load the requested page.'}</p>
            <a href="#/" class="button">Back to Home</a>
          </div>
        `;
      }
      const { NotificationService } = await import('@/services/NotificationService.js');
      NotificationService.showError('Failed to load page');
    }
  }

  navigateTo(path) {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        window.location.hash = path;
      });
    } else {
      window.location.hash = path;
    }
  }
}