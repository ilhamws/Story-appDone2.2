export class LoadingIndicator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(255, 255, 255, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        
        .loading-overlay.active {
          opacity: 1;
          pointer-events: auto;
        }
        
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid #f3f3f3;
          border-top: 5px solid #4361ee;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
      
      <div class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>
    `;
  }

  show() {
    this.shadowRoot.querySelector('.loading-overlay').classList.add('active');
  }

  hide() {
    this.shadowRoot.querySelector('.loading-overlay').classList.remove('active');
  }
}

customElements.define('loading-indicator', LoadingIndicator);