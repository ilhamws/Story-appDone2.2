import { App } from './App';
import './components/SkipToContent';
import './assets/styles/main.css';
import { NotificationHelper } from './helpers/NotificationHelper';
import { StoryDatabase } from './services/StoryDatabase';
import { UserSession } from './services/UserSession';
import { 
  registerServiceWorker, 
  registerBackgroundSync, 
  listenForServiceWorkerMessages 
} from './utils/serviceWorkerRegistration';

// Inisialisasi database
const initDatabase = async () => {
  try {
    const storyDatabase = new StoryDatabase();
    await storyDatabase.init();
    console.log('Database initialized successfully');
    return storyDatabase;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return null;
  }
};

// Tambahkan fungsi ini
function setupViewTransitions() {
  if (!document.startViewTransition) {
    return (callback) => callback();
  }
  
  // Intercept SPA navigation
  const originalPushState = history.pushState;
  history.pushState = function() {
    document.startViewTransition(() => {
      originalPushState.apply(this, arguments);
    });
  };
  
  return (callback) => document.startViewTransition(callback);
}

// Meminta izin notifikasi
const requestNotificationPermission = async () => {
  try {
    if ('Notification' in window) {
      const permission = await NotificationHelper.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted');
        await NotificationHelper.subscribe();
      } else {
        console.log('Notification permission denied');
      }
    } else {
      console.log('Notifications not supported in this browser');
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
  }
};

// Fungsi untuk memastikan autentikasi
const ensureAuthentication = () => {
  // Jika tidak ada token auth, gunakan token dummy untuk tujuan development
  if (!UserSession.getToken()) {
    console.log('No auth token found, setting dummy token for development');
    UserSession.login('dummy_dev_token', 'Dev User');
  }
  
  console.log('Auth status:', UserSession.isAuthenticated());
  console.log('Username:', UserSession.getUserName());
};

// Setup service worker message handler
const setupServiceWorkerMessageHandler = async (storyDatabase) => {
  if (!storyDatabase) return;
  
  listenForServiceWorkerMessages(async (data) => {
    console.log('Received message from Service Worker:', data);
    
    if (data && data.type === 'SYNC_STORIES') {
      try {
        console.log('Syncing offline stories...');
        const syncResult = await storyDatabase.syncOfflineStories();
        
        if (syncResult) {
          showSyncNotification('Sinkronisasi berhasil', 'Cerita yang dibuat saat offline telah disimpan.');
        }
      } catch (error) {
        console.error('Error syncing offline stories:', error);
        showSyncNotification('Sinkronisasi gagal', 'Gagal menyimpan cerita yang dibuat saat offline.');
      }
    }
  });
};

// Fungsi untuk menampilkan notifikasi sinkronisasi
const showSyncNotification = (title, message) => {
  // Create notification element if it doesn't exist
  let notification = document.getElementById('sync-notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'sync-notification';
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%) translateY(100px)';
    notification.style.backgroundColor = '#2ecc71';
    notification.style.color = 'white';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    notification.style.zIndex = '1000';
    notification.style.opacity = '0';
    notification.style.transition = 'transform 0.3s, opacity 0.3s';
    document.body.appendChild(notification);
  }
  
  // Update notification content
  notification.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 5px;">${title}</div>
    <div>${message}</div>
  `;
  
  // Show notification
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(-50%) translateY(0)';
  }, 10);
  
  // Hide after 4 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(-50%) translateY(100px)';
  }, 4000);
};

// Setup offline/online event listeners
const setupConnectivityListeners = () => {
  window.addEventListener('online', () => {
    console.log('Device is online');
    document.body.classList.remove('offline');
    
    // Trigger background sync when back online
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      registerBackgroundSync('sync-stories')
        .catch(error => console.error('Failed to register background sync when back online:', error));
    }
  });
  
  window.addEventListener('offline', () => {
    console.log('Device is offline');
    document.body.classList.add('offline');
    showSyncNotification('Mode Offline', 'Anda sedang offline. Perubahan akan disimpan lokal dan disinkronkan saat online.');
  });
  
  // Set initial state
  if (!navigator.onLine) {
    document.body.classList.add('offline');
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  // Baris ini dihapus agar pengguna tetap terautentikasi setelah refresh halaman
  // UserSession.logout();
  
  // Pastikan selalu ada token autentikasi (untuk development)
  ensureAuthentication();
  
  const viewTransition = setupViewTransitions();
  
  // Siapkan pendeteksi online/offline
  setupConnectivityListeners();
  
  // Inisialisasi database
  const storyDatabase = await initDatabase();
  
  // Wrap the app initialization
  viewTransition(async () => {
    // Register service worker
    try {
      const registration = await registerServiceWorker();
      console.log('ServiceWorker registered:', registration.scope);
      
      // Setup service worker message handler
      await setupServiceWorkerMessageHandler(storyDatabase);
      
      // Meminta izin notifikasi setelah service worker terdaftar
      await requestNotificationPermission();
      
      // Register for background sync if available
      if ('SyncManager' in window) {
        try {
          await registerBackgroundSync('sync-stories');
        } catch (error) {
          console.error('Background sync registration failed:', error);
        }
      } else {
        console.log('Background sync not supported in this browser');
      }
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
    }

    const app = new App();
    app.start();
  });
});