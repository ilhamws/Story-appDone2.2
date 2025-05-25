export class AuthPresenter {
  constructor(view, model, mode = 'login') {
    this.mode = mode;
    this.view = view;
    this.model = model;
  }

  render() {
    return this.view.render(this.mode);
  }

  async init() {
    if (this.mode === 'login') {
      this.view.setupLoginForm(
        this.handleLogin.bind(this),
        (message) => this.view.focusErrorElement('login-email', message)
      );
    } else {
      this.view.setupRegisterForm(
        this.handleRegister.bind(this),
        (message) => this.view.focusErrorElement('register-name', message)
      );
    }
    this.view.focusFirstInteractiveElement();
  }

  async handleLogin(formData) {
    try {
      const email = formData.get('email');
      const password = formData.get('password');
      await this.model.login({ email, password });
      this.view.goToPage('/');
    } catch (error) {
      this.view.showError(error.message || 'Login failed', 'login-form');
    }
  }

  async handleRegister(formData) {
    try {
      const name = formData.get('name');
      const email = formData.get('email');
      const password = formData.get('password');
      await this.model.register({ name, email, password });
      this.view.showSuccess('Registration successful! Please login');
      this.view.goToPage('/login');
    } catch (error) {
      this.view.showError(error.message || 'Registration failed', 'register-form');
    }
  }
}