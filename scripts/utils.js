// Utility functions for Twitter/X Block Manager Extension

// Storage functions
const StorageManager = {
  // Get all blocked users
  async getAllBlocked() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['blockedUsers'], (result) => {
        resolve(result.blockedUsers || []);
      });
    });
  },

  // Check if user is already blocked (returns user object or null)
  async checkDuplicate(username) {
    const blocked = await this.getAllBlocked();
    return blocked.find(user => user.username.toLowerCase() === username.toLowerCase()) || null;
  },

  // Add blocked user
  async addBlocked(userData) {
    const blocked = await this.getAllBlocked();
    const newUser = {
      username: userData.username,
      displayName: userData.displayName || '',
      userId: userData.userId || '',
      profileUrl: userData.profileUrl || '',
      blockedAt: new Date().toISOString(),
      reason: userData.reason || '',
      tags: userData.tags || []
    };
    
    blocked.unshift(newUser); // Add to beginning
    return new Promise((resolve) => {
      chrome.storage.local.set({ blockedUsers: blocked }, () => {
        resolve(newUser);
      });
    });
  },

  // Remove blocked user
  async removeBlocked(username) {
    const blocked = await this.getAllBlocked();
    const filtered = blocked.filter(user => user.username.toLowerCase() !== username.toLowerCase());
    return new Promise((resolve) => {
      chrome.storage.local.set({ blockedUsers: filtered }, () => {
        resolve(true);
      });
    });
  },

  // Update blocked user (e.g., add/edit reason)
  async updateBlocked(username, updates) {
    const blocked = await this.getAllBlocked();
    const index = blocked.findIndex(user => user.username.toLowerCase() === username.toLowerCase());
    
    if (index !== -1) {
      blocked[index] = { ...blocked[index], ...updates };
      return new Promise((resolve) => {
        chrome.storage.local.set({ blockedUsers: blocked }, () => {
          resolve(blocked[index]);
        });
      });
    }
    return null;
  },

  // Search blocked users
  async searchBlocked(query) {
    const blocked = await this.getAllBlocked();
    const lowerQuery = query.toLowerCase();
    return blocked.filter(user => 
      user.username.toLowerCase().includes(lowerQuery) ||
      user.displayName.toLowerCase().includes(lowerQuery) ||
      user.reason.toLowerCase().includes(lowerQuery) ||
      (user.tags && user.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );
  },

  // Filter by tags
  async filterByTags(tags) {
    const blocked = await this.getAllBlocked();
    if (!tags || tags.length === 0) return blocked;
    return blocked.filter(user => 
      user.tags && user.tags.some(tag => tags.includes(tag))
    );
  },

  // Get all unique tags
  async getAllTags() {
    const blocked = await this.getAllBlocked();
    const tagsSet = new Set();
    blocked.forEach(user => {
      if (user.tags) {
        user.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet).sort();
  },

  // Export to JSON
  async exportToJSON() {
    const blocked = await this.getAllBlocked();
    const dataStr = JSON.stringify(blocked, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    return URL.createObjectURL(dataBlob);
  },

  // Parse import text (supports: @username or @username | reason)
  parseImportText(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const users = [];
    
    for (const line of lines) {
      // Support multiple delimiters: | or tab
      let username, reason = '';
      
      if (line.includes('|')) {
        [username, ...reason] = line.split('|').map(s => s.trim());
        reason = reason.join('|').trim();
      } else if (line.includes('\t')) {
        [username, ...reason] = line.split('\t').map(s => s.trim());
        reason = reason.join('\t').trim();
      } else {
        username = line.trim();
      }
      
      // Ensure username starts with @
      if (!username.startsWith('@')) {
        username = '@' + username;
      }
      
      // Validate username format
      if (/^@[a-zA-Z0-9_]{1,15}$/.test(username)) {
        users.push({ username, reason });
      }
    }
    
    return users;
  },

  // Import users from parsed data
  async importUsers(users) {
    const results = { added: 0, skipped: 0, errors: [] };
    
    for (const user of users) {
      try {
        const duplicate = await this.checkDuplicate(user.username);
        if (duplicate) {
          results.skipped++;
        } else {
          await this.addBlocked({
            username: user.username,
            displayName: '',
            profileUrl: `https://x.com/${user.username.slice(1)}`,
            reason: user.reason
          });
          results.added++;
        }
      } catch (error) {
        results.errors.push(`${user.username}: ${error.message}`);
      }
    }
    
    return results;
  }
};

// Language/i18n functions
const LanguageManager = {
  // Get current language
  async getCurrentLanguage() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['language'], (result) => {
        if (result.language) {
          resolve(result.language);
        } else {
          // Detect based on timezone as quick fallback
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const defaultLang = (timezone === 'Europe/Belgrade' || timezone === 'Europe/Podgorica') ? 'sr' : 'en';
          resolve(defaultLang);
        }
      });
    });
  },

  // Set language
  async setLanguage(lang) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ language: lang }, () => {
        resolve(lang);
      });
    });
  },

  // Get translation
  async getTranslation(key, lang = null) {
    if (!lang) {
      lang = await this.getCurrentLanguage();
    }
    
    // Fallback translations if chrome.i18n is not available
    const translations = {
      sr: {
        blocked: 'Blokiran',
        alreadyBlocked: 'Već blokiran',
        blockFailed: 'Blokiranje neuspelo',
        notOnProfile: 'Niste na stranici profila',
        blockSuccess: 'Uspešno blokiran'
      },
      en: {
        blocked: 'Blocked',
        alreadyBlocked: 'Already blocked',
        blockFailed: 'Block failed',
        notOnProfile: 'Not on a profile page',
        blockSuccess: 'Successfully blocked'
      }
    };
    
    return translations[lang]?.[key] || key;
  }
};

// Profile detection functions
const ProfileDetector = {
  // Check if current URL is a Twitter/X profile page
  isProfilePage(url = window.location.href) {
    // Remove query parameters and hash for checking
    const cleanUrl = url.split('?')[0].split('#')[0];
    
    // Match profile URLs like: https://x.com/username or https://twitter.com/username
    // Exclude: /home, /explore, /notifications, /messages, /search, /i/, /compose, /settings
    const profileRegex = /^https?:\/\/(twitter|x)\.com\/([a-zA-Z0-9_]{1,15})\/?$/;
    const excludePaths = ['/home', '/explore', '/notifications', '/messages', '/search', '/i/', '/compose', '/settings', '/status/', '/with_replies', '/media', '/likes', '/following', '/followers'];
    
    const match = profileRegex.test(cleanUrl);
    const hasExcludedPath = excludePaths.some(path => cleanUrl.includes(path));
    
    return match && !hasExcludedPath;
  },

  // Extract username from URL
  getUsernameFromUrl(url = window.location.href) {
    // Remove query parameters and hash
    const cleanUrl = url.split('?')[0].split('#')[0];
    const match = cleanUrl.match(/^https?:\/\/(twitter|x)\.com\/([a-zA-Z0-9_]{1,15})\/?$/);
    return match ? '@' + match[2] : null;
  },

  // Extract profile data from DOM
  getProfileData() {
    const username = this.getUsernameFromUrl();
    if (!username) return null;

    // Try to get display name from DOM
    let displayName = '';
    
    // Method 1: Look for profile header with data-testid
    const nameElement = document.querySelector('[data-testid="UserName"]');
    if (nameElement) {
      const nameSpan = nameElement.querySelector('span');
      if (nameSpan) {
        displayName = nameSpan.textContent.trim();
      }
    }
    
    // Method 2: Fallback - look for heading with profile name
    if (!displayName) {
      const heading = document.querySelector('h2[role="heading"]');
      if (heading) {
        const spans = heading.querySelectorAll('span');
        if (spans.length > 0) {
          displayName = spans[0].textContent.trim();
        }
      }
    }

    return {
      username: username,
      displayName: displayName,
      profileUrl: window.location.href,
      userId: '' // Can be extracted from page source if needed
    };
  }
};

// DOM manipulation helpers
const DOMHelper = {
  // Random delay for human-like behavior
  randomDelay(min = 200, max = 500) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  },

  // Wait for element to appear
  waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((mutations, obs) => {
        const element = document.querySelector(selector);
        if (element) {
          obs.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  },

  // Find block button with multiple selector strategies
  async findBlockButton() {
    const selectors = [
      // Strategy 1: data-testid attributes
      '[data-testid*="block"]',
      '[data-testid*="Block"]',
      
      // Strategy 2: ARIA labels
      '[aria-label*="Block"]',
      '[aria-label*="block"]',
      
      // Strategy 3: Text content (More menu button first)
      '[data-testid="userActions"]',
      '[aria-label*="More"]',
      'button[aria-label*="More"]',
      
      // Strategy 4: Generic fallback
      'button:has(svg):has([d*="M12"])', // SVG path patterns
    ];

    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector);
        if (element) {
          return element;
        }
      } catch (e) {
        continue;
      }
    }

    return null;
  },

  // Click element with error handling
  async clickElement(element) {
    if (!element) return false;
    
    try {
      element.click();
      return true;
    } catch (error) {
      // Fallback: dispatch click event
      try {
        const event = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true
        });
        element.dispatchEvent(event);
        return true;
      } catch (e) {
        return false;
      }
    }
  }
};

// Toast notification system
const ToastNotification = {
  show(message, type = 'success', duration = 3000) {
    // Check settings first
    chrome.storage.local.get(['settings'], (result) => {
      const settings = result.settings || { notifications: true };
      if (settings.notifications === false) return;

      // Remove existing toast if any
      const existing = document.getElementById('twitter-block-toast');
      if (existing) {
        existing.remove();
      }

      // Create toast element
      const toast = document.createElement('div');
      toast.id = 'twitter-block-toast';
      toast.className = `twitter-block-toast twitter-block-toast-${type}`;
      toast.textContent = message;

      // Add to page
      document.body.appendChild(toast);

      // Trigger animation
      setTimeout(() => {
        toast.classList.add('twitter-block-toast-show');
      }, 10);

      // Auto remove
      setTimeout(() => {
        toast.classList.remove('twitter-block-toast-show');
        setTimeout(() => {
          toast.remove();
        }, 300);
      }, duration);
    });
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    StorageManager,
    LanguageManager,
    ProfileDetector,
    DOMHelper,
    ToastNotification
  };
}

// Ensure global availability for other content scripts
window.StorageManager = StorageManager;
window.LanguageManager = LanguageManager;
window.ProfileDetector = ProfileDetector;
window.DOMHelper = DOMHelper;
window.ToastNotification = ToastNotification;
