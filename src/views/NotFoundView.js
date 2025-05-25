export class NotFoundView {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'not-found-container';
  }

  render() {
    return `
      <div class="container not-found">
        <h1 class="not-found-title">404</h1>
        <h2 class="not-found-subtitle">Halaman Tidak Ditemukan</h2>
        <p class="not-found-description">
          Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin halaman telah dipindahkan, dihapus, atau URL yang Anda masukkan salah.
        </p>
        <div class="not-found-actions">
          <a href="#/" class="button primary" id="back-to-home">
            <i class="fas fa-home"></i> Kembali ke Beranda
          </a>
        </div>
      </div>
    `;
  }

  init() {
    const backButton = document.getElementById('back-to-home');
    if (backButton) {
      backButton.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.hash = '/';
      });
    }
  }
} 