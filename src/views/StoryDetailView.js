import { MapService } from '@/services/MapService'

export class StoryDetailView {
  constructor() {
    this.map = null
    this.marker = null
  }

  render(story) {
    return `
      <style>
        .story-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          margin-top: 20px;
        }
        
        .story-actions .button {
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
        
        @media (min-width: 768px) {
          .story-actions {
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: flex-start;
          }
          
          .story-actions .button,
          .story-actions favorite-button {
            width: auto;
            min-width: 200px;
            max-width: 300px;
          }
        }
      </style>
      <section class="story-detail view-transition" aria-labelledby="story-heading">
        <h1 id="story-heading">${story.name}</h1>
        <img src="${story.photoUrl}" alt="${story.name}'s story" loading="lazy" class="story-image">
        <p class="story-description">${story.description}</p>
        <time datetime="${story.createdAt}">${new Date(story.createdAt).toLocaleDateString()}</time>
        <div id="story-map" style="height: 400px; width: 100%; border-radius: 8px; margin: 20px 0;"></div>
        <p id="story-address" aria-live="polite">Loading location...</p>
        <div class="story-actions">
          <a href="#/stories" class="button secondary">Back to Stories</a>
          <favorite-button 
            story-id="${story.id}" 
            story-data='${JSON.stringify(story).replace(/'/g, "&#39;")}'>
          </favorite-button>
        </div>
      </section>
    `
  }

  renderStory(story) {
    const app = document.getElementById('app')
    if (app) {
      app.innerHTML = this.render(story)
      this.setupEventListeners()
    }
  }

  setupEventListeners() {
    // Listen for favorite-changed events
    const app = document.getElementById('app')
    if (app) {
      app.addEventListener('favorite-changed', (event) => {
        const { isFavorite } = event.detail
        
        // Show notification
        const message = isFavorite ? 
          'Cerita berhasil ditambahkan ke favorit' : 
          'Cerita berhasil dihapus dari favorit'
        
        this.showNotification(message)
      })
    }
  }

  showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('global-notification')
    if (!notification) {
      notification = document.createElement('div')
      notification.id = 'global-notification'
      notification.style.position = 'fixed'
      notification.style.bottom = '20px'
      notification.style.left = '50%'
      notification.style.transform = 'translateX(-50%) translateY(100px)'
      notification.style.backgroundColor = '#2ecc71'
      notification.style.color = 'white'
      notification.style.padding = '15px 20px'
      notification.style.borderRadius = '5px'
      notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)'
      notification.style.zIndex = '1000'
      notification.style.opacity = '0'
      notification.style.transition = 'transform 0.3s, opacity 0.3s'
      document.body.appendChild(notification)
    }
    
    // Update message and show
    notification.textContent = message
    
    // Show notification
    setTimeout(() => {
      notification.style.opacity = '1'
      notification.style.transform = 'translateX(-50%) translateY(0)'
    }, 10)
    
    // Hide after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0'
      notification.style.transform = 'translateX(-50%) translateY(100px)'
    }, 3000)
  }

  async initMap(lat, lon) {
    this.map = await MapService.initMap('story-map', {
      center: [lon, lat],
      zoom: 14,
      interactive: true
    })
    if (!this.map) {
      throw new Error('Map initialization failed')
    }
  }

  async addMarker(lat, lon, title) {
    this.marker = await MapService.addMarker(this.map, lat, lon, title)
  }

  async getAddress(lat, lon) {
    return await MapService.getAddress(lat, lon)
  }

  updateAddress(address) {
    const addressElement = document.getElementById('story-address')
    if (addressElement) {
      addressElement.textContent = address
    }
  }

  showMapError(lat, lon) {
    const mapContainer = document.getElementById('story-map')
    if (mapContainer) {
      mapContainer.innerHTML = `
        <div class="map-fallback">
          <p>Location: ${lat.toFixed(4)}, ${lon.toFixed(4)}</p>
        </div>
      `
    }
  }

  showError(message) {
    const app = document.getElementById('app')
    if (app) {
      app.innerHTML = `
        <div class="error-state">
          <h1>Failed to Load Story</h1>
          <p>${message}</p>
          <a href="#/stories" class="button">Back to Stories</a>
        </div>
      `
    }
  }
}