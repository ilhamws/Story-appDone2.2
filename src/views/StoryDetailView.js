import { MapService } from '@/services/MapService'

export class StoryDetailView {
  constructor() {
    this.map = null
    this.marker = null
  }

  render(story) {
    return `
      <section class="story-detail view-transition" aria-labelledby="story-heading">
        <h1 id="story-heading">${story.name}</h1>
        <img src="${story.photoUrl}" alt="${story.name}'s story" loading="lazy" class="story-image">
        <p class="story-description">${story.description}</p>
        <time datetime="${story.createdAt}">${new Date(story.createdAt).toLocaleDateString()}</time>
        <div id="story-map" style="height: 400px; width: 100%; border-radius: 8px; margin: 20px 0;"></div>
        <p id="story-address" aria-live="polite">Loading location...</p>
        <a href="#/stories" class="button secondary">Back to Stories</a>
      </section>
    `
  }

  renderStory(story) {
    const app = document.getElementById('app')
    if (app) {
      app.innerHTML = this.render(story)
    }
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