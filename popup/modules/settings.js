// Settings Manager Module
import { t } from './translations.js';

export class SettingsManager {
  constructor(state, themeManager, languageManager) {
    this.state = state;
    this.themeManager = themeManager;
    this.languageManager = languageManager;
    this.defaultSettings = {
      notifications: true,
      autoClose: false
    };
  }

  async load() {
    const result = await chrome.storage.local.get(['settings']);
    this.settings = { ...this.defaultSettings, ...result.settings };
    this.applySettings();
  }

  async save(key, value) {
    this.settings[key] = value;
    await chrome.storage.local.set({ settings: this.settings });
    this.applySettings();
  }

  applySettings() {
    // Apply settings to UI if needed
    const notifCheckbox = document.getElementById('notificationsToggle');
    if (notifCheckbox) notifCheckbox.checked = this.settings.notifications;

    const autoCloseCheckbox = document.getElementById('autoCloseToggle');
    if (autoCloseCheckbox) autoCloseCheckbox.checked = this.settings.autoClose;
  }

  setupEventListeners() {
    // Open Settings Modal
    document.getElementById('quickSettingsBtn')?.addEventListener('click', () => {
      this.openModal();
    });

    // Close Settings Modal
    document.getElementById('closeSettingsModal')?.addEventListener('click', () => {
      this.closeModal();
    });

    // Shortcuts Button
    document.getElementById('openShortcutsBtn')?.addEventListener('click', () => {
      chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
    });

    // Notifications Toggle
    document.getElementById('notificationsToggle')?.addEventListener('change', (e) => {
      this.save('notifications', e.target.checked);
    });

    // Auto Close Toggle
    document.getElementById('autoCloseToggle')?.addEventListener('change', (e) => {
      this.save('autoClose', e.target.checked);
    });

    // Theme Selector (Radio)
    document.querySelectorAll('input[name="themeSelector"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.checked) {
          // This assumes themeManager has a method to set theme directly or toggles
          // For now, let's just use the existing toggle if it matches
          const isDark = e.target.value === 'dark';
          const currentIsDark = document.body.classList.contains('dark-mode');
          if (isDark !== currentIsDark) {
            this.themeManager.toggle();
          }
        }
      });
    });

    // Language Selector (Select)
    document.getElementById('settingsLangSelector')?.addEventListener('change', (e) => {
      this.languageManager.switch(e.target.value);
    });
  }

  openModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
      modal.classList.add('active');
      
      // Sync UI state when opening
      this.applySettings();
      
      // Sync Theme Radio
      const isDark = document.body.classList.contains('dark-mode');
      const themeRadio = document.querySelector(`input[name="themeSelector"][value="${isDark ? 'dark' : 'light'}"]`);
      if (themeRadio) themeRadio.checked = true;

      // Sync Language Select
      const langSelect = document.getElementById('settingsLangSelector');
      if (langSelect) langSelect.value = this.state.getLanguage();
    }
  }

  closeModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
      modal.classList.remove('active');
    }
  }
}
