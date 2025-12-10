export class NotificationManager {
  constructor() {
    this.toast = document.getElementById('toast');
    this.messageEl = this.toast?.querySelector('.toast-message');
    this.iconEl = this.toast?.querySelector('.toast-icon');
    this.timeout = null;
  }

  show(message, type = 'info') {
    if (!this.toast || !this.messageEl) return;

    // Clear existing timeout
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    // Set content
    this.messageEl.textContent = message;
    this.toast.className = `toast show ${type}`;
    
    // Set icon based on type
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    } else {
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }
    
    if (this.iconEl) {
      this.iconEl.innerHTML = iconSvg;
    }

    // Auto hide
    this.timeout = setTimeout(() => {
      this.hide();
    }, 3000);
  }

  hide() {
    if (this.toast) {
      this.toast.classList.remove('show');
    }
  }
}
