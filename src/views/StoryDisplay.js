import { MapService } from '@/services/MapService'
import { MapView } from '@/views/MapView'

export class StoryDisplay {
  constructor() {
    this.renderStories = this.renderStories.bind(this)
    this.showError = this.showError.bind(this)
    this.showMap = this.showMap.bind(this)
    this.createStoryPopup = this.createStoryPopup.bind(this)
    this.mapView = new MapView()
  }

  render() {
    return `
      <section class="story-list" aria-labelledby="stories-heading">
        <h1 id="stories-heading">Recent Stories</h1>
        <div id="stories-container" class="stories-grid"></div>
        <div id="stories-map-container" class="container" style="margin-top: 30px;">
          <h2>Stories Location</h2>
          <div id="stories-map" style="height: 500px; width: 100%; border-radius: 8px;"></div>
        </div>
      </section>
    `
  }

  renderStories(stories) {
    const container = document.getElementById('stories-container')
    if (!container) return

    if (stories.length === 0) {
      container.innerHTML = `
        <div class="empty-state" role="alert">
          <p>No stories found. Be the first to share!</p>
          <a href="#/add-story" class="button">Add Story</a>
        </div>
      `
      return
    }

    container.innerHTML = stories.map(story => `
      <article class="story-card" data-id="${story.id}">
        <div class="story-images">
          <div class="story-image-container">
            <img src="${story.photoUrl}" alt="${story.name}'s story photo" loading="lazy">
          </div>
          ${story.lat && story.lon ? `
            <div class="story-map-mini-container">
              <div id="mini-map-${story.id}" class="story-map-mini"></div>
            </div>
          ` : ''}
        </div>
        <div class="story-content">
          <h2>${story.name}</h2>
          <p class="story-description">${story.description}</p>
          <div class="story-meta">
            <time datetime="${story.createdAt}">
              ${new Date(story.createdAt).toLocaleDateString()}
            </time>
          </div>
          <a href="#/stories/${story.id}" class="button" aria-label="View ${story.name}'s story details">
            View Details
          </a>
        </div>
      </article>
    `).join('')
    
    stories.forEach(async story => {
      if (story.lat && story.lon) {
        try {
          const map = await this.mapView.renderMap(`mini-map-${story.id}`, {
            center: [story.lon, story.lat],
            zoom: 12,
            interactive: false
          })
          
          if (map) {
            await this.mapView.renderMarker(map, story.lat, story.lon)
          }
        } catch (error) {
          console.error(`Failed to load mini map for story ${story.id}:`, error)
        }
      }
    })
  }

  createStoryPopup(story) {
    return `
      <div style="max-width: 200px;">
        <h3 style="margin: 0 0 5px 0;">${story.name}</h3>
        <p style="margin: 0 0 5px 0;">${story.description.substring(0, 100)}${story.description.length > 100 ? '...' : ''}</p>
        <a href="#/stories/${story.id}" style="color: #4361ee; text-decoration: none;">View Details</a>
      </div>
    `
  }

  showMap(containerId) {
    const container = document.getElementById(containerId)
    if (container) {
      container.style.display = 'block'
    }
  }

  hideMap(containerId) {
    const container = document.getElementById(containerId)
    if (container) {
      container.style.display = 'none'
    }
  }

  showMapError(elementId) {
    const container = document.getElementById(elementId)
    if (container) {
      container.innerHTML = `
        <div class="map-fallback" style="height: 500px; display: flex; align-items: center; justify-content: center;">
          <p>Failed to load map. Please try again later.</p>
        </div>
      `
    }
  }

  showError(message) {
    const container = document.getElementById('stories-container')
    if (container) {
      container.innerHTML = `
        <div class="error-state" role="alert">
          <h1>Failed to Load Stories</h1>
          <p>${message}</p>
          <button onclick="window.location.reload()" class="button">Try Again</button>
        </div>
      `
    }
  }
}