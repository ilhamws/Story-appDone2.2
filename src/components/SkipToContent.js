export class SkipToContent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
    this.hashChangeHandler = null;
  }

  connectedCallback() {
    this.setupEventListeners();
    // Tambahkan log untuk debugging
    console.log('Skip to content component connected');
  }

  isHomeUrl() {
    const hash = window.location.hash;
    return hash === '' || hash === '#' || hash === '#/' || hash.startsWith('#/?');
  }

  setupEventListeners() {
    const skipLink = this.shadowRoot.querySelector('.skip-link');
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Cek apakah pengguna berada di halaman Home
      if (!this.isHomeUrl()) {
        console.log('Not on home page, navigating to home first');
        
        // Jika sudah ada handler lama, hapus dulu
        if (this.hashChangeHandler) {
          window.removeEventListener('hashchange', this.hashChangeHandler);
        }
        
        // Buat handler untuk menangani event hashchange setelah navigasi ke halaman Home
        this.hashChangeHandler = () => {
          // Tunggu sebentar agar konten Home dirender
          setTimeout(() => {
            const storiesSection = document.querySelector('#stories');
            if (storiesSection) {
              storiesSection.setAttribute('tabindex', '-1');
              storiesSection.focus();
              storiesSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });
              console.log('Navigated to home and focusing on stories section');
            } else {
              console.error('Stories section element not found after navigation');
            }
            // Hapus handler karena sudah tidak dibutuhkan lagi
            window.removeEventListener('hashchange', this.hashChangeHandler);
            this.hashChangeHandler = null;
          }, 500);
        };
        
        // Tambahkan event listener untuk event hashchange
        window.addEventListener('hashchange', this.hashChangeHandler);
        
        // Arahkan ke halaman Home
        window.location.hash = '/';
      } else {
        // Jika sudah di halaman Home, langsung scroll ke bagian Stories
        const storiesSection = document.querySelector('#stories');
        
        if (storiesSection) {
          // Tambahkan tabindex untuk fokus
          storiesSection.setAttribute('tabindex', '-1');
          
          // Fokuskan ke section stories
          storiesSection.focus();
          
          // Scroll ke section stories dengan smooth behavior
          storiesSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          console.log('Already on home page, focusing on stories section');
        } else {
          console.error('Stories section element not found');
        }
      }
    });
  }

  disconnectedCallback() {
    // Hapus event listener ketika komponen dilepas
    if (this.hashChangeHandler) {
      window.removeEventListener('hashchange', this.hashChangeHandler);
      this.hashChangeHandler = null;
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .skip-link {
          position: fixed;
          top: 10px; /* Ubah dari -100px menjadi 10px agar selalu terlihat */
          left: 10px;
          background: #4361ee;
          color: white;
          padding: 12px 16px;
          border-radius: 4px;
          font-weight: bold;
          text-decoration: none;
          z-index: 9999;
          transition: top 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2); /* Tambahkan bayangan agar lebih menonjol */
        }
        
        .skip-link:focus, .skip-link:hover {
          outline: 3px solid #4895ef;
          transform: scale(1.05); /* Sedikit efek membesar saat hover/focus */
        }
        
        .skip-link i {
          font-size: 14px;
        }
      </style>
      
      <a href="#stories" class="skip-link" aria-label="Skip to stories content">
        <i class="fas fa-arrow-right"></i> 
        Langsung ke Konten Stories
      </a>
    `;
  }
}

// Pastikan komponen didefinisikan hanya sekali
if (!customElements.get('skip-to-content')) {
  customElements.define('skip-to-content', SkipToContent);
  console.log('Skip to content component defined');
}