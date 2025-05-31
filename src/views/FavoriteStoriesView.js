import { MapService } from '@/services/MapService';

export class FavoriteStoriesView {
  constructor() {
    this.app = document.querySelector('#app');
    this.maps = new Map();
  }

  showLoading() {
    this.app.innerHTML = `
      <div class="loading-state" role="alert" aria-busy="true">
        <div class="loading-spinner"></div>
        <p>Memuat cerita favorit...</p>
      </div>
    `;
  }

  showError(message) {
    this.app.innerHTML = `
      <div class="error-state" role="alert">
        <h2>Error</h2>
        <p>${message}</p>
        <button class="button retry-button">Coba Lagi</button>
      </div>
    `;
  }

  render(stories = []) {
    if (stories.length === 0) {
      this.app.innerHTML = `
        <div class="empty-state">
          <h2>Tidak Ada Cerita Favorit</h2>
          <p>Tambahkan cerita ke favorit untuk melihatnya di sini.</p>
          <a href="#/" class="button">Lihat Semua Cerita</a>
        </div>
      `;
      return;
    }

    this.app.innerHTML = `
      <style>
        .favorites-description {
          margin-bottom: 20px;
          color: #555;
          line-height: 1.5;
        }
        
        .story-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
          margin-top: 10px;
        }
        
        .story-detail-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 42px;
          text-align: center;
          font-weight: bold;
          padding: 10px 16px;
          margin: 5px 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .back-link-container {
          margin: 30px 0;
          text-align: center;
        }

        .back-link {
          padding: 12px 24px;
          font-size: 1.1rem;
        }
        
        @media (min-width: 768px) {
          .story-actions {
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: space-between;
          }
          
          .story-detail-button {
            min-width: 180px;
            width: auto;
          }
        }
      </style>
      <div id="favorite-stories" class="stories-container">
        <h1>Cerita Favorit</h1>
        <p class="favorites-description">Berikut adalah cerita-cerita yang telah Anda tambahkan ke favorit. Klik tombol "Hapus dari favorit" untuk menghapus cerita dari daftar favorit.</p>
        <div class="stories-grid">
          ${stories.map(story => this.createStoryCard(story)).join('')}
        </div>
        <div class="back-link-container">
          <a href="#/" class="button back-link">Kembali ke Halaman Utama</a>
        </div>
      </div>
    `;

    this.setupEventListeners();
    this.initializeMaps(stories);
  }

  createStoryCard(story) {
    return `
      <article class="story-card" data-story-id="${story.id}">
        <div class="story-image-container">
          <img src="${story.photoUrl}" alt="${story.description}" class="story-image">
        </div>
        ${story.lat && story.lon ? `
          <div class="story-map-container">
            <div id="map-${story.id}" class="story-map"></div>
            <p id="address-${story.id}" class="story-address" aria-live="polite">Memuat lokasi...</p>
          </div>
        ` : ''}
        <div class="story-content">
          <h2>${story.name}</h2>
          <p>${story.description}</p>
          <div class="story-meta">
            <span class="story-date">${new Date(story.createdAt).toLocaleDateString()}</span>
            <div class="story-actions">
              <a href="#/stories/${story.id}" class="button story-detail-button">Lihat Detail</a>
              <favorite-button 
                story-id="${story.id}" 
                story-data='${JSON.stringify(story).replace(/'/g, "&#39;")}'>
              </favorite-button>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  async initializeMaps(stories) {
    for (const story of stories) {
      if (story.lat && story.lon) {
        try {
          const mapElement = document.getElementById(`map-${story.id}`);
          if (mapElement) {
            const storyMap = await MapService.initSmallMap(`map-${story.id}`, {
              center: [story.lon, story.lat],
              zoom: 14,
              interactive: false
            });
            
            if (storyMap) {
              await MapService.addMarker(storyMap, story.lat, story.lon, story.name);
              this.maps.set(story.id, storyMap);
              
              try {
                const address = await MapService.getAddress(story.lat, story.lon);
                this.updateAddress(story.id, address);
              } catch (error) {
                console.error(`Failed to get address for story ${story.id}:`, error);
                this.updateAddress(story.id, `Lokasi: ${story.lat.toFixed(4)}, ${story.lon.toFixed(4)}`);
              }
            }
          }
        } catch (error) {
          console.error(`Failed to load map for story ${story.id}:`, error);
          this.showMapError(`map-${story.id}`, story.lat, story.lon);
        }
      }
    }
  }

  updateAddress(storyId, address) {
    const addressElement = document.getElementById(`address-${storyId}`);
    if (addressElement) {
      addressElement.textContent = address;
    }
  }

  showMapError(elementId, lat, lon) {
    const container = document.getElementById(elementId);
    if (container) {
      container.innerHTML = `
        <div class="map-fallback">
          ${lat && lon ? 
            `<p>Lokasi: ${lat.toFixed(4)}, ${lon.toFixed(4)}</p>` :
            `<p>Gagal memuat peta</p>`
          }
        </div>
      `;
    }
  }

  setupEventListeners() {
    const detailButtons = this.app.querySelectorAll('.story-detail-button');
    detailButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const href = button.getAttribute('href');
        window.location.hash = href;
      });
    });

    // Listen for favorite-changed events
    this.app.addEventListener('favorite-changed', (event) => {
      const { storyId, isFavorite } = event.detail;
      if (!isFavorite) {
        // Show confirmation message
        this.showNotification('Cerita berhasil dihapus dari favorit');
        
        // Remove the story card from the UI with animation
        const storyCard = this.app.querySelector(`.story-card[data-story-id="${storyId}"]`);
        
        if (storyCard) {
          // Add fade-out animation
          storyCard.style.transition = 'opacity 0.5s, transform 0.5s';
          storyCard.style.opacity = '0';
          storyCard.style.transform = 'scale(0.8)';
          
          // Remove after animation completes
          setTimeout(() => {
            storyCard.remove();
            
            // Check if there are no more stories
            const storyCards = this.app.querySelectorAll('.story-card');
            if (storyCards.length === 0) {
              this.render([]);
            }
          }, 500);
        }
      }
    });
  }

  showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('global-notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'global-notification';
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
    
    // Update message and show
    notification.textContent = message;
    
    // Show notification
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);
    
    // Hide after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(-50%) translateY(100px)';
    }, 3000);
  }

  onRetry(callback) {
    const retryButton = this.app.querySelector('.retry-button');
    if (retryButton) {
      retryButton.addEventListener('click', callback);
    }
  }

  cleanup() {
    this.maps.forEach(map => {
      if (map) {
        map.remove();
      }
    });
    this.maps.clear();
  }
} 