import { App } from './App';
import './components/SkipToContent';
import './assets/styles/main.css';
import { NotificationHelper } from './helpers/NotificationHelper';
import { StoryDatabase } from './services/StoryDatabase';
import { UserSession } from './services/UserSession';

// Inisialisasi database
const initDatabase = async () => {
  try {
    const storyDatabase = new StoryDatabase();
    await storyDatabase.init();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
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
      }
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

document.addEventListener('DOMContentLoaded', () => {
  // Baris ini dihapus agar pengguna tetap terautentikasi setelah refresh halaman
  // UserSession.logout();
  
  // Pastikan selalu ada token autentikasi (untuk development)
  ensureAuthentication();
  
  const viewTransition = setupViewTransitions();
  
  // Wrap the app initialization
  viewTransition(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('ServiceWorker registered:', registration.scope);
          // Meminta izin notifikasi setelah service worker terdaftar
          requestNotificationPermission();
        })
        .catch(error => {
          console.log('ServiceWorker registration failed:', error);
        });
    }

    // Inisialisasi database
    initDatabase();

    const app = new App();
    app.start();
  });
});