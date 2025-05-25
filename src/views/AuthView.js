import { FocusManager } from '@/helpers/FocusManager.js';
import { NotificationService } from '@/services/NotificationService.js';

export class AuthView {
  render(mode) {
    return `
      <div class="auth-container fade-in">
        <div class="auth-form slide-up">
          <h2 class="text-center mb-4">${mode === 'login' ? 'Login' : 'Register'}</h2>
          <form id="${mode}-form" class="flex flex-col gap-4">
            ${
              mode === 'register'
                ? `
                  <div class="form-group">
                    <label for="register-name">Name</label>
                    <div class="input-wrapper">
                      <span class="input-icon">👤</span>
                      <input 
                        id="register-name" 
                        type="text" 
                        name="name" 
                        placeholder="Enter your name" 
                        required 
                        aria-describedby="name-error"
                      />
                    </div>
                  </div>
                `
                : ''
            }
            <div class="form-group">
              <label for="${mode}-email">Email</label>
              <div class="input-wrapper">
                <span class="input-icon">✉️</span>
                <input 
                  id="${mode}-email" 
                  type="email" 
                  name="email" 
                  placeholder="Enter your email" 
                  required 
                  aria-describedby="email-error"
                />
              </div>
            </div>
            <div class="form-group">
              <label for="${mode}-password">Password</label>
              <div class="input-wrapper">
                <span class="input-icon">🔒</span>
                <input 
                  id="${mode}-password" 
                  type="password" 
                  name="password" 
                  placeholder="Enter your password" 
                  required 
                  aria-describedby="password-error"
                />
              </div>
            </div>
            <button type="submit" class="button">${mode === 'login' ? 'Login' : 'Register'}</button>
          </form>
          <div class="auth-switch text-center mt-4">
            <p class="text-muted">
              ${mode === 'login' ? 'Don\'t have an account?' : 'Already have an account?'}
              <a href="#/${mode === 'login' ? 'register' : 'login'}" class="auth-switch-link">
                ${mode === 'login' ? 'Register here' : 'Login here'}
              </a>
            </p>
          </div>
        </div>
      </div>
    `;
  }

  setupLoginForm(handleSubmit, focusError) {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      handleSubmit(formData);
    });
    this.focusError = focusError;
  }

  setupRegisterForm(handleSubmit, focusError) {
    const form = document.getElementById('register-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      handleSubmit(formData);
    });
    this.focusError = focusError;
  }

  showError(message, formId) {
    NotificationService.showError(message);
    const form = document.getElementById(formId);
    if (form) {
      const existingError = form.querySelector('.form-error');
      if (existingError) existingError.remove();
      const errorDiv = document.createElement('div');
      errorDiv.className = 'form-error fade-in';
      errorDiv.textContent = message;
      form.prepend(errorDiv);
    }
    if (this.focusError) this.focusError(message);
  }

  showSuccess(message) {
    NotificationService.showSuccess(message);
  }

  goToPage(path) {
    window.location.hash = path;
  }

  focusErrorElement(elementId, message) {
    FocusManager.moveFocusToElement(document.getElementById(elementId));
    this.showError(message);
  }

  focusFirstInteractiveElement() {
    FocusManager.focusFirstInteractiveElement(document.getElementById('app'));
  }
}