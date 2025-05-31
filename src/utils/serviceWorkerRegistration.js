/**
 * Register service worker for PWA functionality
 * @returns {Promise} - Promise that resolves with service worker registration
 */
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'  // Gunakan jaringan untuk pembaruan service worker
      });
      
      console.log('ServiceWorker registration successful with scope:', registration.scope);
      
      // Cek update service worker saat registrasi berhasil
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('Service Worker update found!');
        
        newWorker.addEventListener('statechange', () => {
          console.log('Service Worker state changed:', newWorker.state);
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New content is available; please refresh.');
            showRefreshUI();
          }
        });
      });
      
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      throw new Error(`Service worker registration failed: ${error}`);
    }
  } else {
    console.warn('Service workers are not supported in this browser');
    throw new Error('Service workers are not supported in this browser');
  }
};

// Function to show refresh UI to user
function showRefreshUI() {
  // Create a notification element if it doesn't exist
  let notification = document.getElementById('sw-refresh-notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'sw-refresh-notification';
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = '#3498db';
    notification.style.color = 'white';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    notification.style.zIndex = '1000';
    notification.style.textAlign = 'center';
    
    notification.innerHTML = `
      <p>Versi baru tersedia!</p>
      <button id="reload-button" style="background-color: white; color: #3498db; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 10px;">
        Refresh
      </button>
    `;
    
    document.body.appendChild(notification);
    
    document.getElementById('reload-button').addEventListener('click', () => {
      window.location.reload();
    });
  }
}

/**
 * Check if the app can be installed (PWA)
 * @returns {Promise<boolean>} - Promise that resolves with whether the app can be installed
 */
export const canInstallApp = async () => {
  if ('getInstalledRelatedApps' in navigator) {
    try {
      const relatedApps = await navigator.getInstalledRelatedApps();
      return relatedApps.length === 0;
    } catch (error) {
      console.error('Error checking installed apps:', error);
      return true;
    }
  }
  return true;
};

/**
 * Check if the service worker is controlling the page
 * @returns {boolean} - Whether the service worker is controlling the page
 */
export const isServiceWorkerControllingPage = () => {
  return navigator.serviceWorker && navigator.serviceWorker.controller !== null;
};

/**
 * Update service worker
 * @returns {Promise} - Promise that resolves when service worker is updated
 */
export const updateServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers are not supported in this browser');
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    return registration;
  } catch (error) {
    throw new Error(`Service worker update failed: ${error}`);
  }
};

/**
 * Register for background sync
 * @param {string} tag - Tag for background sync
 * @returns {Promise} - Promise that resolves when background sync is registered
 */
export const registerBackgroundSync = async (tag = 'sync-stories') => {
  if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
    throw new Error('Background sync is not supported in this browser');
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register(tag);
    console.log(`Background sync registered: ${tag}`);
    return true;
  } catch (error) {
    console.error('Background sync registration failed:', error);
    throw new Error(`Background sync registration failed: ${error}`);
  }
};

/**
 * Listen for messages from service worker
 * @param {Function} callback - Callback function to handle messages
 * @returns {void}
 */
export const listenForServiceWorkerMessages = (callback) => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (callback && typeof callback === 'function') {
        callback(event.data);
      }
    });
  }
}; 