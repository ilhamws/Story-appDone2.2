export class AddStoryPresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;
    this.photoFile = null;
    this.selectedLocation = null;
  }

  render() {
    return this.view.render();
  }

  async init() {
    try {
      await this.view.init();
      this.view.setupEventListeners(
        this.handleSubmit.bind(this),
        this.handlePhotoUpload.bind(this),
        this.handleCamera.bind(this),
        this.handleMapClick.bind(this)
      );
      this.view.setupNavigationListener(this.cleanup.bind(this));
    } catch (error) {
      this.view.showError('Failed to initialize. Please try again.');
    }
  }

  async handleMapClick(e) {
    try {
      const { lng, lat } = e.lngLat;
      this.selectedLocation = { lat, lng };
      const address = await this.view.getAddress(lat, lng);
      this.view.updateLocation(lat, lng, address);
    } catch (error) {
      this.view.showError('Failed to set location. Please try again.');
    }
  }

  handlePhotoUpload(file) {
    if (!file) {
      this.view.showError('No file selected.');
      return;
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      this.view.showError('Only JPEG or PNG files are allowed.');
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      this.view.showError('Photo must be less than 1MB.');
      return;
    }
    this.photoFile = file;
    this.view.showPhotoPreview(URL.createObjectURL(file));
  }

  async handleCamera() {
    try {
      await this.view.startCamera(this.handleCapture.bind(this));
    } catch (error) {
      this.view.showError(error.message);
    }
  }

  handleCapture(blob) {
    try {
      if (!blob) {
        throw new Error('Tidak ada foto yang diambil');
      }
      this.photoFile = new File([blob], 'photo.jpg', { 
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      const previewUrl = URL.createObjectURL(blob);
      this.view.showPhotoPreview(previewUrl);
      this.view.updatePhotoInput(this.photoFile);
    } catch (error) {
      this.view.showError('Gagal memproses foto. Silakan coba lagi.');
    }
  }

  async handleSubmit(formData) {
    try {
      if (!this.photoFile && !formData.get('photo')) {
        this.view.showError('Mohon unggah atau ambil foto.');
        return;
      }
      if (!this.selectedLocation) {
        this.view.showError('Mohon pilih lokasi pada peta.');
        return;
      }
      const description = formData.get('description');
      if (!description || description.length < 10) {
        this.view.showError('Deskripsi harus minimal 10 karakter.');
        return;
      }
      if (!formData.get('photo') && this.photoFile) {
        formData.set('photo', this.photoFile);
      }
      formData.set('lat', this.selectedLocation.lat.toString());
      formData.set('lon', this.selectedLocation.lng.toString());
      await this.view.stopCamera();
      await this.model.addStory(formData);
      await this.cleanup();
      this.view.goToHomePage();
    } catch (error) {
      this.view.showError(error.message || 'Gagal menambahkan story. Silakan coba lagi.');
    }
  }

  async cleanup() {
    try {
      await this.view.cleanup();
      this.photoFile = null;
      this.selectedLocation = null;
    } catch (error) {
      this.view.showError('Cleanup failed.');
    }
  }
}