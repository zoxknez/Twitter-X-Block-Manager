// Background Service Worker for Twitter/X Block Manager Extension

// Listen for keyboard command (Alt+B)
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'block-user') {
    try {
      // Get active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) {
        console.error('No active tab found');
        return;
      }

      // Check if tab is on Twitter/X
      if (!tab.url || (!tab.url.includes('twitter.com') && !tab.url.includes('x.com'))) {
        console.log('Not on Twitter/X page');
        return;
      }

      // Send message to content script to trigger block action
      chrome.tabs.sendMessage(tab.id, { action: 'blockUser' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending message:', chrome.runtime.lastError);
        } else {
          console.log('Block command sent to content script', response);
        }
      });
    } catch (error) {
      console.error('Error handling command:', error);
    }
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  handleMessage(request, sender, sendResponse);
  return true; // Keep message channel open for async response
});

async function handleMessage(request, sender, sendResponse) {
  try {
    switch (request.action) {
      case 'addBlocked':
        await addBlockedUser(request.data);
        sendResponse({ success: true });
        break;

      case 'checkDuplicate':
        const duplicate = await checkDuplicateUser(request.username);
        sendResponse({ isDuplicate: !!duplicate, user: duplicate });
        break;

      case 'getAllBlocked':
        const blocked = await getAllBlockedUsers();
        sendResponse({ success: true, data: blocked });
        break;

      case 'removeBlocked':
        await removeBlockedUser(request.username);
        sendResponse({ success: true });
        break;

      case 'updateBlocked':
        await updateBlockedUser(request.username, request.updates);
        sendResponse({ success: true });
        break;

      case 'searchBlocked':
        const results = await searchBlockedUsers(request.query);
        sendResponse({ success: true, data: results });
        break;

      case 'importUsers':
        const importResults = await importUsers(request.users);
        sendResponse({ success: true, data: importResults });
        break;

      case 'getLanguage':
        const lang = await getLanguage();
        sendResponse({ language: lang });
        break;

      case 'setLanguage':
        await setLanguage(request.language);
        sendResponse({ success: true });
        break;

      case 'filterByTags':
        const tagResults = await filterByTags(request.tags);
        sendResponse({ success: true, data: tagResults });
        break;

      case 'getAllTags':
        const allTags = await getAllTags();
        sendResponse({ success: true, data: allTags });
        break;

      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Error handling message:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Storage helper functions
async function getAllBlockedUsers() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['blockedUsers'], (result) => {
      resolve(result.blockedUsers || []);
    });
  });
}

async function checkDuplicateUser(username) {
  const blocked = await getAllBlockedUsers();
  return blocked.find(user => user.username.toLowerCase() === username.toLowerCase()) || null;
}

async function addBlockedUser(userData) {
  const blocked = await getAllBlockedUsers();
  const newUser = {
    username: userData.username,
    displayName: userData.displayName || '',
    userId: userData.userId || '',
    profileUrl: userData.profileUrl || '',
    blockedAt: new Date().toISOString(),
    reason: userData.reason || '',
    tags: userData.tags || []
  };
  
  blocked.unshift(newUser);
  
  return new Promise((resolve) => {
    chrome.storage.local.set({ blockedUsers: blocked }, () => {
      resolve(newUser);
      
      // Optional: Show notification
      showNotification('Block Success', `Blocked ${userData.username}`);
    });
  });
}

async function removeBlockedUser(username) {
  const blocked = await getAllBlockedUsers();
  const filtered = blocked.filter(user => user.username.toLowerCase() !== username.toLowerCase());
  
  return new Promise((resolve) => {
    chrome.storage.local.set({ blockedUsers: filtered }, () => {
      resolve(true);
    });
  });
}

async function updateBlockedUser(username, updates) {
  const blocked = await getAllBlockedUsers();
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
}

async function searchBlockedUsers(query) {
  const blocked = await getAllBlockedUsers();
  const lowerQuery = query.toLowerCase();
  
  return blocked.filter(user => 
    user.username.toLowerCase().includes(lowerQuery) ||
    user.displayName.toLowerCase().includes(lowerQuery) ||
    user.reason.toLowerCase().includes(lowerQuery) ||
    (user.tags && user.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
  );
}

async function filterByTags(tags) {
  const blocked = await getAllBlockedUsers();
  if (!tags || tags.length === 0) return blocked;
  return blocked.filter(user => 
    user.tags && user.tags.some(tag => tags.includes(tag))
  );
}

async function getAllTags() {
  const blocked = await getAllBlockedUsers();
  const tagsSet = new Set();
  blocked.forEach(user => {
    if (user.tags) {
      user.tags.forEach(tag => tagsSet.add(tag));
    }
  });
  return Array.from(tagsSet).sort();
}

async function importUsers(users) {
  const results = { added: 0, skipped: 0, errors: [] };
  
  for (const user of users) {
    try {
      const duplicate = await checkDuplicateUser(user.username);
      if (duplicate) {
        results.skipped++;
      } else {
        await addBlockedUser({
          username: user.username,
          displayName: '',
          profileUrl: `https://x.com/${user.username.slice(1)}`,
          reason: user.reason || ''
        });
        results.added++;
      }
    } catch (error) {
      results.errors.push(`${user.username}: ${error.message}`);
    }
  }
  
  return results;
}

// Language functions
async function getLanguage() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['language'], (result) => {
      if (result.language) {
        resolve(result.language);
      } else {
        // Detect language based on IP/location
        detectLanguageByLocation().then(lang => {
          resolve(lang);
        });
      }
    });
  });
}

// Detect language based on browser settings
async function detectLanguageByLocation() {
  try {
    // Use browser UI language
    const uiLang = chrome.i18n.getUILanguage();
    if (uiLang.startsWith('sr') || uiLang.startsWith('hr') || uiLang.startsWith('bs')) {
      return 'sr';
    }
    
    return 'en';
  } catch (error) {
    console.log('Could not detect language, defaulting to English:', error);
    return 'en';
  }
}

async function setLanguage(lang) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ language: lang }, () => {
      resolve(lang);
    });
  });
}

// Optional: Show browser notification
function showNotification(title, message) {
  try {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon48.png'),
      title: title,
      message: message,
      priority: 1
    });
  } catch (error) {
    console.log('Notifications not available:', error);
  }
}

// Initialize extension
chrome.runtime.onInstalled.addListener(async (details) => {
  // Create context menus
  createContextMenus();
  
  if (details.reason === 'install') {
    console.log('Twitter/X Block Manager Extension installed');
    
    // Detect language based on IP/location
    const detectedLang = await detectLanguageByLocation();
    
    chrome.storage.local.set({ 
      language: detectedLang,
      blockedUsers: []
    });
    
    console.log('Default language set to:', detectedLang);
  } else if (details.reason === 'update') {
    console.log('Twitter/X Block Manager Extension updated');
  }
});

function createContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'blockUser',
      title: 'Block with Extension',
      contexts: ['link', 'selection'],
      documentUrlPatterns: ['*://twitter.com/*', '*://x.com/*']
    });
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'blockUser') {
    let username = null;
    
    // Extract username from link URL
    if (info.linkUrl) {
      const match = info.linkUrl.match(/^https?:\/\/(twitter|x)\.com\/([a-zA-Z0-9_]{1,15})/);
      if (match) {
        username = '@' + match[2];
      }
    }
    
    // Extract username from selected text
    if (!username && info.selectionText) {
      const text = info.selectionText.trim();
      if (text.startsWith('@') && /^@[a-zA-Z0-9_]{1,15}$/.test(text)) {
        username = text;
      } else if (/^[a-zA-Z0-9_]{1,15}$/.test(text)) {
        username = '@' + text;
      }
    }
    
    if (username) {
      // Check if already blocked
      const duplicate = await checkDuplicateUser(username);
      if (duplicate) {
        showNotification('Already Blocked', `${username} is already blocked`);
      } else {
        // Add to blocked list
        await addBlockedUser({
          username: username,
          displayName: '',
          profileUrl: `https://x.com/${username.slice(1)}`,
          reason: 'Blocked via context menu'
        });
        showNotification('Blocked', `${username} added to blocked list`);
      }
    } else {
      showNotification('Error', 'Could not extract username');
    }
  }
});

console.log('Background service worker loaded');
