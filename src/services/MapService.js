import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MAP_STYLES, DEFAULT_MAP_CENTER, DEFAULT_ZOOM } from '@/utils/constants'
import axios from 'axios'

const addressCache = new Map()

export class MapService {
  static async initMap(elementId, options = {}) {
    const container = document.getElementById(elementId)
    if (!container) {
      console.error(`Map container "${elementId}" not found`)
      return null
    }

    const style = options.style || localStorage.getItem('preferredMapStyle') || 'MapTiler Streets'
    const styleUrl = MAP_STYLES[style] || MAP_STYLES['MapTiler Streets']

    try {
      const map = new maplibregl.Map({
        container: elementId,
        style: styleUrl,
        center: options.center || DEFAULT_MAP_CENTER,
        zoom: options.zoom || DEFAULT_ZOOM,
        interactive: options.interactive !== false
      })

      await new Promise((resolve) => {
        map.on('load', () => resolve())
      })

      map.addControl(new maplibregl.NavigationControl(), 'top-right')
      map.addControl(new maplibregl.ScaleControl(), 'bottom-left')

      return map
    } catch (error) {
      console.error('Map initialization failed:', error)
      return null
    }
  }

  static getAvailableMapStyles() {
    return Object.keys(MAP_STYLES)
  }

  static getStyleUrl(styleName) {
    return MAP_STYLES[styleName] || MAP_STYLES['MapTiler Streets']
  }

  static getCurrentStyle() {
    return localStorage.getItem('preferredMapStyle') || 'MapTiler Streets'
  }

  static setMapStyle(styleName) {
    localStorage.setItem('preferredMapStyle', styleName)
    return MAP_STYLES[styleName]
  }

  static async addMarker(map, lat, lon, popupContent = '') {
    if (!map) return null

    const marker = new maplibregl.Marker({
      color: '#3b82f6',
      draggable: false
    }).setLngLat([lon, lat])

    if (popupContent) {
      const popup = new maplibregl.Popup({ offset: 25 })
        .setHTML(popupContent)
      marker.setPopup(popup)
    }

    marker.addTo(map)
    return marker
  }

  static async getAddress(lat, lon) {
    const cacheKey = `${lat.toFixed(6)},${lon.toFixed(6)}`
    if (addressCache.has(cacheKey)) {
      return addressCache.get(cacheKey)
    }

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        { timeout: 5000 }
      )
      const address = response.data.display_name || `Location at ${lat.toFixed(6)}, ${lon.toFixed(6)}`
      addressCache.set(cacheKey, address)
      return address
    } catch (error) {
      console.error('Error fetching address:', error)
      return `Location at ${lat.toFixed(6)}, ${lon.toFixed(6)}`
    }
  }

  static clearMarkers(markers = []) {
    markers.forEach(marker => marker?.remove())
  }

  static async initSmallMap(elementId, options = {}) {
    const container = document.getElementById(elementId);
    if (!container) {
      console.error(`Map container "${elementId}" not found`);
      return null;
    }

    const style = options.style || localStorage.getItem('preferredMapStyle') || 'MapTiler Streets';
    const styleUrl = MAP_STYLES[style] || MAP_STYLES['MapTiler Streets'];

    try {
      const map = new maplibregl.Map({
        container: elementId,
        style: styleUrl,
        center: options.center || DEFAULT_MAP_CENTER,
        zoom: options.zoom || 12,
        interactive: options.interactive !== false,
        attributionControl: false
      });

      // Hide controls for small maps
      if (options.interactive === false) {
        map.addControl(new maplibregl.AttributionControl({
          compact: true
        }));
      }

      return map;
    } catch (error) {
      console.error('Small map initialization failed:', error);
      return null;
    }
  }
}