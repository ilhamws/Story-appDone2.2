import { MapService } from '@/services/MapService'

export class MapView {
  constructor() {
    this.styleControl = null
    this.map = null
  }

  async renderMap(elementId, options = {}) {
    const map = await MapService.initMap(elementId, options)
    this.map = map
    
    if (!map) {
      this.showMapError(elementId)
      return null
    }

    if (options.interactive !== false) {
      this.addStyleControl(map)
    }
    
    return map
  }

  showMapError(elementId) {
    const container = document.getElementById(elementId)
    if (container) {
      container.innerHTML = `
        <div class="map-fallback" role="alert">
          Failed to load map. Please check your internet connection.
        </div>
      `
    }
  }

  addStyleControl(map) {
    if (this.styleControl && this.styleControl.parentNode) {
      this.styleControl.parentNode.removeChild(this.styleControl)
    }

    this.styleControl = document.createElement('div')
    this.styleControl.className = 'map-style-control'
    this.styleControl.setAttribute('aria-label', 'Map style selector')
    
    const styleContainer = document.createElement('div')
    const availableStyles = MapService.getAvailableMapStyles()
    const currentStyle = MapService.getCurrentStyle()
    
    styleContainer.innerHTML = `
      <fieldset>
        <legend>Map Style</legend>
        ${availableStyles.map(style => `
          <label>
            <input type="radio" name="mapStyle" value="${style}" 
                  ${style === currentStyle ? 'checked' : ''}>
            ${style}
          </label>
        `).join('')}
      </fieldset>
    `

    styleContainer.querySelectorAll('input').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const newStyle = e.target.value
        const newStyleUrl = MapService.setMapStyle(newStyle)
        map.setStyle(newStyleUrl)
      })
    })

    this.styleControl.appendChild(styleContainer)
    
    const mapContainer = map.getContainer()
    const mapRect = mapContainer.getBoundingClientRect()
    this.styleControl.style.position = 'absolute'
    this.styleControl.style.top = `${mapRect.top + 10}px`
    this.styleControl.style.right = `${window.innerWidth - mapRect.right + 10}px`
    this.styleControl.style.zIndex = '1000'
    this.styleControl.style.background = 'white'
    this.styleControl.style.padding = '10px'
    this.styleControl.style.borderRadius = '8px'
    this.styleControl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
    
    document.body.appendChild(this.styleControl)
    
    map.on('remove', () => {
      this.cleanupStyleControl()
    })
  }

  cleanupStyleControl() {
    if (this.styleControl && this.styleControl.parentNode) {
      this.styleControl.parentNode.removeChild(this.styleControl)
      this.styleControl = null
    }
  }

  createPopupContent(content) {
    return `
      <div class="map-popup">
        ${content}
        <button class="popup-close" aria-label="Close popup">×</button>
      </div>
    `
  }

  async renderMarker(map, lat, lon, content = '') {
    const popupContent = content ? this.createPopupContent(content) : ''
    return await MapService.addMarker(map, lat, lon, popupContent)
  }

  cleanupMap() {
    this.cleanupStyleControl()
    if (this.map) {
      // Bersihkan event listeners atau referensi lain jika diperlukan
    }
  }
} 