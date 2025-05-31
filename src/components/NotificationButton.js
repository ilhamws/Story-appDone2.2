import { NotificationHelper } from '@/helpers/NotificationHelper';

export class NotificationButton extends HTMLElement {
  constructor() {
    super();
    this.isSubscribed = false;
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.checkSubscriptionStatus();
    this.attachEventListeners();
  }

  async checkSubscriptionStatus() {
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        this.isSubscribed = !!subscription;
        this.updateButtonState();
      } else {
        this.disableButton('Notifikasi tidak didukung di browser ini');
      }
    } catch (error) {
      console.error('Error checking notification status:', error);
      this.disableButton('Gagal memeriksa status notifikasi');
    }
  }

  updateButtonState() {
    const button = this.shadowRoot.querySelector('#notification-button');
    const statusText = this.shadowRoot.querySelector('#notification-status');
    
    if (!button || !statusText) return;
    
    if (this.isSubscribed) {
      button.textContent = 'Nonaktifkan Notifikasi';
      button.classList.add('subscribed');
      statusText.textContent = 'Notifikasi aktif';
    } else {
      button.textContent = 'Aktifkan Notifikasi';
      button.classList.remove('subscribed');
      statusText.textContent = 'Notifikasi tidak aktif';
    }
    
    button.disabled = false;
  }

  disableButton(message) {
    const button = this.shadowRoot.querySelector('#notification-button');
    const statusText = this.shadowRoot.querySelector('#notification-status');
    
    if (!button || !statusText) return;
    
    button.disabled = true;
    button.textContent = 'Notifikasi Tidak Tersedia';
    statusText.textContent = message;
  }

  attachEventListeners() {
    const button = this.shadowRoot.querySelector('#notification-button');
    if (!button) return;
    
    button.addEventListener('click', async () => {
      if (this.isSubscribed) {
        await this.unsubscribe();
      } else {
        await this.subscribe();
      }
    });
  }

  async subscribe() {
    try {
      const permission = await NotificationHelper.requestPermission();
      if (permission === 'granted') {
        const subscription = await NotificationHelper.subscribe();
        if (subscription) {
          this.isSubscribed = true;
          this.updateButtonState();
          this.showNotification('Notifikasi diaktifkan', 'Anda akan menerima notifikasi cerita baru');
        }
      } else {
        this.showNotification('Izin ditolak', 'Anda tidak memberikan izin untuk notifikasi');
      }
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      this.showNotification('Gagal', 'Tidak dapat mengaktifkan notifikasi');
    }
  }

  async unsubscribe() {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          await subscription.unsubscribe();
          this.isSubscribed = false;
          this.updateButtonState();
          this.showNotification('Notifikasi dinonaktifkan', 'Anda tidak akan menerima notifikasi');
        }
      }
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
      this.showNotification('Gagal', 'Tidak dapat menonaktifkan notifikasi');
    }
  }

  showNotification(title, message) {
    const notification = this.shadowRoot.querySelector('#notification-message');
    if (!notification) return;
    
    notification.innerHTML = `
      <div class="notification-title">${title}</div>
      <div class="notification-body">${message}</div>
    `;
    
    notification.classList.add('show');
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin: 10px 0;
        }
        
        .notification-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        
        #notification-button {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.3s;
        }
        
        #notification-button:hover {
          background-color: #2980b9;
        }
        
        #notification-button.subscribed {
          background-color: #e74c3c;
        }
        
        #notification-button.subscribed:hover {
          background-color: #c0392b;
        }
        
        #notification-button:disabled {
          background-color: #95a5a6;
          cursor: not-allowed;
        }
        
        #notification-status {
          font-size: 12px;
          color: #7f8c8d;
        }
        
        #notification-message {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: #2ecc71;
          color: white;
          padding: 15px;
          border-radius: 5px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          transform: translateY(100px);
          opacity: 0;
          transition: transform 0.3s, opacity 0.3s;
          z-index: 1000;
        }
        
        #notification-message.show {
          transform: translateY(0);
          opacity: 1;
        }
        
        .notification-title {
          font-weight: bold;
          margin-bottom: 5px;
        }
      </style>
      
      <div class="notification-container">
        <button id="notification-button" disabled>Memuat...</button>
        <div id="notification-status">Memeriksa status notifikasi...</div>
      </div>
      
      <div id="notification-message"></div>
    `;
  }
}

customElements.define('notification-button', NotificationButton); 