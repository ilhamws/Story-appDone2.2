importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

const { registerRoute } = workbox.routing;
const { CacheFirst, NetworkFirst, StaleWhileRevalidate } = workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;
const { precacheAndRoute } = workbox.precaching;

// Definisi aset statis aplikasi shell
const SHELL_ASSETS = [
  { url: '/', revision: '2' },
  { url: '/index.html', revision: '2' },
  { url: '/manifest.json', revision: '2' },
  { url: '/src/assets/styles/main.css', revision: '2' },
  { url: '/src/main.js', revision: '2' },
  { url: '/src/App.js', revision: '2' },
  { url: '/src/components/SkipToContent.js', revision: '2' },
  { url: '/src/components/NotificationButton.js', revision: '2' },
  { url: '/src/components/FavoriteButton.js', revision: '2' },
  { url: '/src/helpers/NotificationHelper.js', revision: '2' },
  { url: '/src/utils/serviceWorkerRegistration.js', revision: '2' },
  { url: '/src/utils/config.js', revision: '2' },
  { url: '/src/utils/idb.js', revision: '2' },
  { url: '/src/services/StoryDatabase.js', revision: '2' },
  { url: '/Logo.png', revision: '2' },
];

// Precache Application Shell
precacheAndRoute(SHELL_ASSETS);

// Cache page navigations (HTML) with a Network First strategy
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Cache CSS, JS, and Web Worker files with a Stale While Revalidate strategy
registerRoute(
  ({ request }) => 
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'worker',
  new StaleWhileRevalidate({
    cacheName: 'assets-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Cache images with a Cache First strategy
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Cache API responses with Network First strategy
registerRoute(
  ({ url }) => url.origin === 'https://story-api.dicoding.dev',
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60, // 1 day
      }),
    ],
    networkTimeoutSeconds: 3, // Timeout setelah 3 detik jika tidak ada koneksi
  })
);

// Cache fonts with a Cache First strategy
registerRoute(
  ({ request }) => request.destination === 'font' ||
    request.url.includes('fonts.googleapis.com') ||
    request.url.includes('fonts.gstatic.com') ||
    request.url.includes('cdnjs.cloudflare.com'),
  new CacheFirst({
    cacheName: 'fonts-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
    ],
  })
);

// Cache Font Awesome resources specifically
registerRoute(
  ({ url }) => url.href.includes('fontawesome') || url.href.includes('fa-'),
  new CacheFirst({
    cacheName: 'font-awesome-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 90, // 90 days
      }),
    ],
  })
);

// Handle push events
self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'New Story!',
    options: {
      body: 'Someone has shared a new story',
      icon: '/src/assets/icons/notification.png',
      badge: '/src/assets/icons/badge.png',
      data: { url: '/' }
    }
  };

  try {
    if (event.data) {
      notificationData = event.data.json();
    }
  } catch (error) {
    console.error('Error parsing push notification data:', error);
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData.options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // If no open window with the URL, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Handle offline fallbacks
const offlineFallbackPage = '/index.html';

// If any fetch fails, it will show the offline page.
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(offlineFallbackPage);
      })
    );
  }
});

// This is to ensure that the app works offline
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  
  event.waitUntil(
    caches.open('offline-cache').then((cache) => {
      console.log('Service Worker: Caching Offline Page');
      return cache.add(offlineFallbackPage);
    })
  );
  
  // Skip waiting and activate immediately
  self.skipWaiting();
});

// Skip waiting and claim clients to update the service worker immediately
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Delete old caches if needed
              return cacheName.startsWith('story-app-') && cacheName !== 'story-app-v2';
            })
            .map((cacheName) => {
              console.log('Service Worker: Clearing Old Cache', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
    ])
  );
});

// Sync offline stories when back online
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background Sync', event.tag);
  if (event.tag === 'sync-stories') {
    event.waitUntil(syncStories());
  }
});

// Function to sync offline stories
async function syncStories() {
  try {
    // Communicate with main thread to sync data
    const clients = await self.clients.matchAll({ type: 'window' });
    if (clients.length > 0) {
      clients[0].postMessage({
        type: 'SYNC_STORIES',
        timestamp: new Date().toISOString()
      });
    }
    return true;
  } catch (error) {
    console.error('Error syncing stories:', error);
    return false;
  }
}