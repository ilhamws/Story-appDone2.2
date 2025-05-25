export class FocusManager {
  static focusFirstInteractiveElement(container) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  static trapFocus(container) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    container.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    });
  }

  static moveFocusToElement(element) {
    if (element) {
      element.focus();
      if (typeof element.select === 'function') {
        element.select();
      }
    }
  }

  static announceToScreenReader(message, politeness = 'polite') {
    const liveRegion = document.getElementById('a11y-live-region') || 
      (() => {
        const region = document.createElement('div');
        region.id = 'a11y-live-region';
        region.setAttribute('aria-live', politeness);
        region.setAttribute('role', 'status');
        region.style.position = 'absolute';
        region.style.left = '-9999px';
        document.body.appendChild(region);
        return region;
      })();
    
    liveRegion.textContent = '';
    setTimeout(() => {
      liveRegion.textContent = message;
    }, 100);
  }
}