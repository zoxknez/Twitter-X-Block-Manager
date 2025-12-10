// Theme Management Module
export class ThemeManager {
  constructor(state) {
    this.state = state;
  }

  async load() {
    try {
      const result = await chrome.storage.local.get(['theme']);
      if (result.theme) {
        this.state.setTheme(result.theme);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.state.setTheme(prefersDark ? 'dark' : 'light');
      }
      this.apply();
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  }

  apply() {
    const theme = this.state.getTheme();
    document.body.classList.toggle('dark-mode', theme === 'dark');
    
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    
    if (sunIcon && moonIcon) {
      if (theme === 'dark') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
      } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
      }
    }
  }

  async toggle() {
    const newTheme = this.state.getTheme() === 'light' ? 'dark' : 'light';
    this.state.setTheme(newTheme);
    this.apply();
    await chrome.storage.local.set({ theme: newTheme });
  }
}
