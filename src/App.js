import { Router } from './Router'
import { UserSession } from './services/UserSession'

export class App {
  constructor() {
    this.router = new Router()
    this.initNavigation()
    
    // Tambahkan observer untuk memantau perubahan DOM
    this.setupDOMObserver()
  }

  initNavigation() {
    // Update navigasi segera setelah inisialisasi
    setTimeout(() => this.updateNav(), 100)
    
    // Update navigasi ketika URL berubah
    window.addEventListener('hashchange', () => {
      console.log('Hash changed, updating navigation')
      this.updateNav()
    })
    
    // Tambahkan event listener untuk tombol logout
    document.addEventListener('click', (e) => {
      if (e.target && (e.target.id === 'logout-button' || 
          (e.target.parentElement && e.target.parentElement.id === 'logout-button'))) {
        e.preventDefault();
        console.log('Logout button clicked');
        UserSession.logout();
        console.log('User logged out, auth status:', UserSession.isAuthenticated());
        this.updateNav();
        this.router.navigateTo('/login');
      }
    });
  }

  setupDOMObserver() {
    // Gunakan MutationObserver untuk memantau perubahan DOM
    const observer = new MutationObserver((mutations) => {
      const shouldUpdateNav = mutations.some(mutation => {
        return Array.from(mutation.addedNodes).some(node => {
          return node.nodeType === 1 && 
                 (node.hasAttribute('data-auth') || 
                  node.querySelector('[data-auth]') || 
                  node.id === 'logout-button');
        });
      });
      
      if (shouldUpdateNav) {
        console.log('DOM changed, updating navigation');
        this.updateNav();
      }
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['data-auth', 'data-unauth', 'id']
    });
  }

  updateNav() {
    const authElements = document.querySelectorAll('[data-auth]')
    const unauthElements = document.querySelectorAll('[data-unauth]')
    const logoutButton = document.getElementById('logout-button')
    
    console.log('Updating nav, auth status:', UserSession.isAuthenticated());
    console.log('Auth elements count:', authElements.length);
    console.log('Unauth elements count:', unauthElements.length);
    console.log('Logout button found:', !!logoutButton);
    
    if (UserSession.isAuthenticated()) {
      console.log('User is authenticated, showing auth elements');
      authElements.forEach(el => {
        el.style.display = '';
        console.log('Showing auth element:', el.tagName, el.className || el.id);
      });
      
      unauthElements.forEach(el => {
        el.style.display = 'none';
        console.log('Hiding unauth element:', el.tagName, el.className || el.id);
      });
      
      const userName = UserSession.getUserName()
      console.log('User name:', userName);
      document.querySelectorAll('[data-username]').forEach(el => {
        el.textContent = userName || 'Profile'
      });
      
      // Pastikan tombol logout terlihat
      if (logoutButton) {
        logoutButton.style.display = '';
        console.log('Explicitly showing logout button');
      } else {
        console.warn('Logout button not found in DOM');
      }
    } else {
      console.log('User is not authenticated, hiding auth elements');
      authElements.forEach(el => {
        el.style.display = 'none';
        console.log('Hiding auth element:', el.tagName, el.className || el.id);
      });
      
      unauthElements.forEach(el => {
        el.style.display = '';
        console.log('Showing unauth element:', el.tagName, el.className || el.id);
      });
      
      // Pastikan tombol logout tersembunyi
      if (logoutButton) {
        logoutButton.style.display = 'none';
        console.log('Explicitly hiding logout button');
      }
    }
  }

  start() {
    this.router.init()
    
    // Update navigasi setelah router diinisialisasi
    setTimeout(() => this.updateNav(), 500)
  }
}