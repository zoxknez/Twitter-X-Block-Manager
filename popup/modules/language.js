// Language Manager Module
import { translations, t } from './translations.js';

export class LanguageManager {
  constructor(state) {
    this.state = state;
  }

  async load() {
    try {
      // Detect language from browser settings
      const browserLang = chrome.i18n.getUILanguage();
      const isSerbian = browserLang.startsWith('sr') || browserLang.startsWith('hr') || browserLang.startsWith('bs');
      const detectedLang = isSerbian ? 'sr' : 'en';
      
      const result = await chrome.storage.local.get(['language']);
      const savedLang = result.language || detectedLang;
      this.state.setLanguage(savedLang);
      this.apply(savedLang);
    } catch (error) {
      console.error('Language detection failed:', error);
      this.state.setLanguage('en');
      this.apply('en');
    }
  }

  apply(lang = this.state.getLanguage()) {
    document.documentElement.lang = lang;
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = t(key, lang);
      
      if (element.tagName === 'INPUT' && element.type === 'text') {
        element.placeholder = translation;
      } else {
        element.textContent = translation;
      }
    });

    // Update elements with data-i18n-placeholder attribute
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      element.placeholder = t(key, lang);
    });

    // Update header language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      if (btn.dataset.lang === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update settings language selector if exists
    const settingsLangSelector = document.getElementById('settingsLangSelector');
    if (settingsLangSelector) {
      settingsLangSelector.value = lang;
    }
  }

  async switch(newLang) {
    this.state.setLanguage(newLang);
    await chrome.storage.local.set({ language: newLang });
    this.apply(newLang);
  }
}
