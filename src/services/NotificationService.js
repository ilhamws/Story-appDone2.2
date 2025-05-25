import { NotificationHelper } from '@/helpers/NotificationHelper'
import { FocusManager } from '@/helpers/FocusManager'

export class NotificationService {
  static async showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'notification success';
    toast.setAttribute('role', 'alert');
    toast.textContent = message;
    
    document.body.appendChild(toast);
    FocusManager.announceToScreenReader(message);
    
    setTimeout(() => {
      toast.classList.add('fade-out');
      toast.addEventListener('animationend', () => toast.remove());
    }, 5000);
  }

  static async showError(message) {
    const toast = document.createElement('div');
    toast.className = 'notification error';
    toast.setAttribute('role', 'alert');
    toast.textContent = message;
    
    document.body.appendChild(toast);
    FocusManager.announceToScreenReader(message, 'assertive');
    
    setTimeout(() => {
      toast.classList.add('fade-out');
      toast.addEventListener('animationend', () => toast.remove());
    }, 5000);
  }

  static async requestPermission() {
    try {
      const permission = await NotificationHelper.requestPermission();
      if (permission === 'granted') {
        await NotificationHelper.subscribe();
      }
      return permission;
    } catch (error) {
      console.error('Notification permission error:', error);
      return 'denied';
    }
  }

  static async showPushNotification(title, options) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const serviceWorkerRegistration = await navigator.serviceWorker.ready;
      serviceWorkerRegistration.showNotification(title, {
        ...options,
        icon: '/src/assets/icons/notification.png',
        badge: '/src/assets/icons/badge.png'
      });
    }
  }
}