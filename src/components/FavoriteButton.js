import { StoryDatabase } from '@/services/StoryDatabase';

export class FavoriteButton extends HTMLElement {
  constructor() {
    super();
    this.storyId = '';
    this.story = null;
    this.isFavorite = false;
    this.storyDatabase = new StoryDatabase();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['story-id', 'story-data'];
  }

  async attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'story-id' && newValue !== oldValue) {
      this.storyId = newValue;
      await this.checkFavoriteStatus();
    }
    
    if (name === 'story-data' && newValue !== oldValue) {
      try {
        this.story = JSON.parse(newValue);
      } catch (error) {
        console.error('Invalid story data:', error);
      }
    }
  }

  connectedCallback() {
    this.render();
    this.attachEventListeners();
  }

  async checkFavoriteStatus() {
    try {
      await this.storyDatabase.init();
      this.isFavorite = await this.storyDatabase.isStoryFavorite(this.storyId);
      this.updateButtonState();
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  }

  updateButtonState() {
    const button = this.shadowRoot.querySelector('#favorite-button');
    const label = this.shadowRoot.querySelector('#button-label');
    if (!button || !label) return;
    
    if (this.isFavorite) {
      button.innerHTML = '<i class="fas fa-heart"></i><span id="button-label">Hapus dari favorit</span>';
      button.classList.add('favorited');
      button.setAttribute('aria-label', 'Hapus dari favorit');
      button.title = 'Hapus dari favorit';
    } else {
      button.innerHTML = '<i class="far fa-heart"></i><span id="button-label">Tambahkan ke favorit</span>';
      button.classList.remove('favorited');
      button.setAttribute('aria-label', 'Tambahkan ke favorit');
      button.title = 'Tambahkan ke favorit';
    }
  }

  attachEventListeners() {
    const button = this.shadowRoot.querySelector('#favorite-button');
    if (!button) return;
    
    button.addEventListener('click', async (event) => {
      event.stopPropagation();
      
      if (!this.storyId || !this.story) {
        console.error('Story ID or data is missing');
        return;
      }
      
      try {
        if (this.isFavorite) {
          await this.storyDatabase.removeFavoriteStory(this.storyId);
          this.showNotification('Dihapus dari favorit', 'Cerita telah dihapus dari favorit');
        } else {
          await this.storyDatabase.saveFavoriteStory(this.story);
          this.showNotification('Ditambahkan ke favorit', 'Cerita telah ditambahkan ke favorit');
        }
        
        this.isFavorite = !this.isFavorite;
        this.updateButtonState();
        
        // Dispatch event for parent components
        this.dispatchEvent(new CustomEvent('favorite-changed', {
          bubbles: true,
          detail: { storyId: this.storyId, isFavorite: this.isFavorite }
        }));
      } catch (error) {
        console.error('Error toggling favorite status:', error);
        this.showNotification('Gagal', 'Tidak dapat mengubah status favorit');
      }
    });
  }

  showNotification(title, message) {
    const notification = this.shadowRoot.querySelector('#notification');
    if (!notification) return;
    
    notification.innerHTML = `
      <div class="notification-title">${title}</div>
      <div class="notification-body">${message}</div>
    `;
    
    notification.classList.add('show');
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          width: 100%;
        }
        
        .favorite-container {
          display: flex;
          align-items: center;
          width: 100%;
        }
        
        #favorite-button {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f1f1f1;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: bold;
          color: #7f8c8d;
          transition: transform 0.3s, color 0.3s, background-color 0.3s;
          padding: 10px 16px;
          width: 100%;
          min-height: 42px;
          text-align: center;
          margin: 5px 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        #favorite-button:hover {
          transform: scale(1.05);
          background-color: #e0e0e0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        
        #favorite-button.favorited {
          color: white;
          background-color: #e74c3c;
        }
        
        #favorite-button.favorited:hover {
          background-color: #c0392b;
        }
        
        #favorite-button i {
          margin-right: 8px;
          font-size: 1.1rem;
        }
        
        #button-label {
          display: inline-block;
          font-size: 0.95rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: calc(100% - 30px);
        }
        
        #notification {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: #2ecc71;
          color: white;
          padding: 15px;
          border-radius: 5px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          transform: translateY(100px);
          opacity: 0;
          transition: transform 0.3s, opacity 0.3s;
          z-index: 1000;
        }
        
        #notification.show {
          transform: translateY(0);
          opacity: 1;
        }
        
        .notification-title {
          font-weight: bold;
          margin-bottom: 5px;
        }

        @media (min-width: 768px) {
          #favorite-button {
            min-width: 180px;
          }
          
          #button-label {
            font-size: 1rem;
          }
        }
      </style>
      
      <div class="favorite-container">
        <button id="favorite-button" aria-label="Tambahkan ke favorit" title="Tambahkan ke favorit">
          <i class="far fa-heart"></i>
          <span id="button-label">Tambahkan ke favorit</span>
        </button>
      </div>
      
      <div id="notification"></div>
    `;
  }
}

customElements.define('favorite-button', FavoriteButton); 