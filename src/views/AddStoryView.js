import { MapService } from '@/services/MapService'
import { MapView } from '@/views/MapView'

export class AddStoryView {
  constructor() {
    this.map = null
    this.marker = null
    this.cameraStream = null
    this.mapView = new MapView()
  }

  render() {
    return `
      <section class="add-story view-transition" aria-labelledby="add-story-heading">
        <h1 id="add-story-heading">Add New Story</h1>
        
        <form id="add-story-form" class="add-story-form" enctype="multipart/form-data">
          <div class="form-group">
            <label for="story-description">Description</label>
            <textarea id="story-description" name="description" required minlength="10" maxlength="1000" aria-describedby="description-help"></textarea>
            <small id="description-help" class="text-muted">Enter a description between 10 and 1000 characters.</small>
          </div>
          
          <div class="form-group">
            <label for="photo">Upload Photo (max 1MB)</label>
            <input type="file" id="photo" name="photo" accept="image/jpeg,image/png" aria-describedby="photo-help">
            <small id="photo-help" class="text-muted">Only JPEG or PNG, max size 1MB.</small>
            <div id="photo-preview-container" class="photo-preview">
              <img id="photo-preview" style="display: none;" alt="Photo preview">
            </div>
            <button type="button" id="use-camera" class="button secondary" aria-label="Open camera">
              <i class="fas fa-camera"></i> Use Camera
            </button>
          </div>
          
          <div class="form-group">
            <label>Location (click on map to select)</label>
            <div id="add-story-map" style="height: 400px; width: 100%; border-radius: 8px; margin-bottom: 20px;"></div>
            <p id="location-info" aria-live="polite">No location selected</p>
            <input type="hidden" id="lat" name="lat">
            <input type="hidden" id="lon" name="lon">
          </div>
          
          <button type="submit" class="button">Submit Story</button>
        </form>
      </section>
      
      <div id="camera-modal" class="modal" style="display: none;">
        <div class="modal-content">
          <video id="camera-feed" autoplay playsinline></video>
          <div class="flex gap-4">
            <button id="capture-photo" class="button">
              <i class="fas fa-camera"></i> Capture
            </button>
            <button id="close-camera" class="button secondary">
              <i class="fas fa-times"></i> Close
            </button>
          </div>
          <canvas id="photo-canvas" style="display: none;"></canvas>
        </div>
      </div>
    `
  }

  async init() {
    try {
      this.map = await this.mapView.renderMap('add-story-map', {
        center: [106.8456, -6.2088],
        zoom: 12,
        interactive: true
      })
      if (!this.map) {
        throw new Error('Map initialization failed')
      }
    } catch (error) {
      console.error('Map initialization failed:', error)
      this.showMapError()
      throw error
    }
  }

  async getAddress(lat, lng) {
    return await MapService.getAddress(lat, lng)
  }

  setupEventListeners(onSubmit, onPhotoUpload, onCamera, onMapClick) {
    const form = document.getElementById('add-story-form')
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault()
        const formData = new FormData(form)
        onSubmit(formData)
      })
    }
    
    const photoInput = document.getElementById('photo')
    if (photoInput) {
      photoInput.addEventListener('change', (e) => {
        onPhotoUpload(e.target.files[0])
      })
    }
    
    const cameraButton = document.getElementById('use-camera')
    if (cameraButton) {
      cameraButton.addEventListener('click', onCamera)
    }
    
    if (this.map) {
      this.map.on('click', async (e) => {
        if (this.marker) {
          this.marker.remove()
        }
        this.marker = await this.mapView.renderMarker(this.map, e.lngLat.lat, e.lngLat.lng, 'Story location')
        onMapClick(e)
      })
    } else {
      console.error('Map is not initialized. Cannot set up click event listener.')
    }
  }

  setupNavigationListener(onCleanup) {
    const handleNavigation = () => {
      this.stopCamera();
      onCleanup();
    };
    
    // Store the handler so we can remove it later
    this.navigationHandler = handleNavigation;
    window.addEventListener('hashchange', this.navigationHandler);
  }

  removeNavigationListener() {
    if (this.navigationHandler) {
      window.removeEventListener('hashchange', this.navigationHandler);
      this.navigationHandler = null;
    }
  }

  goToHomePage() {
    window.location.hash = '/'
  }

  async startCamera(onCapture) {
    try {
      // Pastikan kamera sebelumnya sudah berhenti
      await this.ensureCameraStopped();
      
      // Minta izin kamera dengan timeout
      const stream = await Promise.race([
        navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Camera access timeout')), 10000)
        )
      ]);
      
      this.cameraStream = stream;
      await this.initializeCamera(stream, onCapture);
    } catch (error) {
      console.error('Camera error:', error);
      throw new Error(
        error.name === 'NotAllowedError' ? 'Akses kamera ditolak. Mohon izinkan akses kamera di browser Anda.' :
        error.name === 'NotFoundError' ? 'Tidak dapat menemukan kamera. Pastikan perangkat Anda memiliki kamera.' :
        error.name === 'NotReadableError' ? 'Kamera sedang digunakan oleh aplikasi lain.' :
        error.message === 'Camera access timeout' ? 'Waktu permintaan akses kamera habis. Silakan coba lagi.' :
        'Gagal memulai kamera. Silakan coba lagi.'
      );
    }
  }

  async ensureCameraStopped() {
    if (this.cameraStream) {
      const tracks = this.cameraStream.getTracks();
      await Promise.all(
        tracks.map(track => 
          new Promise(resolve => {
            track.stop();
            track.onended = resolve;
            setTimeout(resolve, 1000); // Fallback timeout
          })
        )
      );
      this.cameraStream = null;
      this.hideCamera();
    }
  }

  async initializeCamera(stream, onCapture) {
    const modal = document.getElementById('camera-modal');
    const video = document.getElementById('camera-feed');
    
    if (!modal || !video) {
      throw new Error('Camera elements not found');
    }

    modal.style.display = 'flex';
    video.srcObject = stream;

    // Tunggu video siap
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Video initialization timeout'));
      }, 10000);

      video.onloadedmetadata = () => {
        clearTimeout(timeout);
        video.play()
          .then(resolve)
          .catch(reject);
      };

      video.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Failed to initialize video stream'));
      };
    });

    this.setupCameraControls(video, onCapture);
  }

  setupCameraControls(video, onCapture) {
    const captureButton = document.getElementById('capture-photo');
    const closeButton = document.getElementById('close-camera');
    
    // Bersihkan event listener lama
    if (captureButton) {
      captureButton.replaceWith(captureButton.cloneNode(true));
      document.getElementById('capture-photo').onclick = () => this.capturePhoto(video, onCapture);
    }
    
    if (closeButton) {
      closeButton.replaceWith(closeButton.cloneNode(true));
      document.getElementById('close-camera').onclick = () => this.ensureCameraStopped();
    }
  }

  async capturePhoto(video, onCapture) {
    try {
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        throw new Error('Video stream not ready');
      }

      const canvas = document.getElementById('photo-canvas');
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const blob = await new Promise(resolve => 
        canvas.toBlob(resolve, 'image/jpeg', 0.9)
      );

      if (!blob) {
        throw new Error('Failed to capture photo');
      }

      onCapture(blob);
      await this.ensureCameraStopped();
    } catch (error) {
      console.error('Error capturing photo:', error);
      this.showError('Gagal mengambil foto. Silakan coba lagi.');
    }
  }

  stopCamera() {
    return this.ensureCameraStopped();
  }

  hideCamera() {
    const modal = document.getElementById('camera-modal');
    const video = document.getElementById('camera-feed');
    if (modal && video) {
      modal.style.display = 'none';
      video.srcObject = null;
    }
  }

  showPhotoPreview(url) {
    const preview = document.getElementById('photo-preview')
    if (preview) {
      preview.src = url
      preview.style.display = 'block'
    }
  }

  updatePhotoInput(file) {
    const photoInput = document.getElementById('photo')
    if (photoInput) {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      photoInput.files = dataTransfer.files
      const event = new Event('change')
      photoInput.dispatchEvent(event)
    }
  }

  showError(message) {
    const form = document.getElementById('add-story-form')
    if (form) {
      let errorElement = form.querySelector('.form-error')
      if (!errorElement) {
        errorElement = document.createElement('div')
        errorElement.className = 'form-error'
        form.prepend(errorElement)
      }
      errorElement.textContent = message
      errorElement.focus()
    }
  }

  showSuccess(message) {
    const form = document.getElementById('add-story-form')
    if (form) {
      let successElement = form.querySelector('.form-success')
      if (!successElement) {
        successElement = document.createElement('div')
        successElement.className = 'form-success'
        form.prepend(successElement)
      }
      successElement.textContent = message
      successElement.focus()
    }
  }

  showMapError() {
    const mapContainer = document.getElementById('add-story-map')
    if (mapContainer) {
      mapContainer.innerHTML = `
        <div class="map-fallback" style="height: 400px; display: flex; align-items: center; justify-content: center;">
          <p>Map failed to load. Please enable JavaScript and refresh the page.</p>
        </div>
      `
    }
  }

  updateLocation(lat, lng, address) {
    const latInput = document.getElementById('lat')
    const lonInput = document.getElementById('lon')
    const locationInfo = document.getElementById('location-info')
    
    if (latInput && lonInput && locationInfo) {
      latInput.value = lat
      lonInput.value = lng
      locationInfo.textContent = address || `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`
    }
  }

  cleanup() {
    this.stopCamera();
    this.removeNavigationListener();
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}