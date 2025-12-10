// Content Script for Twitter/X Block Manager Extension
// Runs on all Twitter/X pages

console.log('Twitter/X Block Manager content script loaded');

let currentLanguage = 'sr';

// Initialize
(async function init() {
  // Get current language
  const response = await chrome.runtime.sendMessage({ action: 'getLanguage' });
  if (response && response.language) {
    currentLanguage = response.language;
  }

  // Listen for URL changes (Twitter is a SPA)
  observeUrlChanges();
})();

// Keyboard shortcut listener (Alt+B)
document.addEventListener('keydown', (e) => {
  // Check for Alt+B
  if (e.altKey && (e.key === 'b' || e.key === 'B' || e.code === 'KeyB')) {
    // Check if we are in an input field (to avoid blocking while typing)
    const activeTag = document.activeElement.tagName.toLowerCase();
    const isInput = activeTag === 'input' || activeTag === 'textarea' || document.activeElement.isContentEditable;
    
    if (!isInput) {
      e.preventDefault();
      console.log('Alt+B pressed, triggering block...');
      handleBlockUser();
    }
  }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'blockUser') {
    handleBlockUser().then(result => {
      sendResponse(result);
    });
    return true; // Keep message channel open
  }
});

// Main block function
async function handleBlockUser() {
  try {
    // Check if on profile page
    if (!ProfileDetector.isProfilePage()) {
      const message = currentLanguage === 'sr' ? 'Niste na stranici profila' : 'Not on a profile page';
      ToastNotification.show(message, 'error');
      return { success: false, error: 'Not on profile page' };
    }

    // Get profile data
    const profileData = ProfileDetector.getProfileData();
    if (!profileData || !profileData.username) {
      const message = currentLanguage === 'sr' ? 'Nije moguće pronaći korisničko ime' : 'Unable to find username';
      ToastNotification.show(message, 'error');
      return { success: false, error: 'No username found' };
    }

    // Check if already blocked
    const checkResponse = await chrome.runtime.sendMessage({
      action: 'checkDuplicate',
      username: profileData.username
    });

    if (checkResponse.isDuplicate) {
      const message = currentLanguage === 'sr' 
        ? `⚠️ ${profileData.username} je već blokiran`
        : `⚠️ ${profileData.username} is already blocked`;
      ToastNotification.show(message, 'warning', 4000);
      return { success: false, error: 'Already blocked' };
    }

    // Perform block action
    const blockSuccess = await performBlockAction();

    if (blockSuccess) {
      // Add to blocked list
      await chrome.runtime.sendMessage({
        action: 'addBlocked',
        data: profileData
      });

      const message = currentLanguage === 'sr'
        ? `✓ Blokiran ${profileData.username}`
        : `✓ Blocked ${profileData.username}`;
      ToastNotification.show(message, 'success');

      return { success: true, username: profileData.username };
    } else {
      const message = currentLanguage === 'sr'
        ? `✗ Blokiranje nije uspelo za ${profileData.username}`
        : `✗ Failed to block ${profileData.username}`;
      ToastNotification.show(message, 'error');
      return { success: false, error: 'Block action failed' };
    }

  } catch (error) {
    console.error('Error in handleBlockUser:', error);
    const message = currentLanguage === 'sr'
      ? '✗ Greška pri blokiranju'
      : '✗ Error during blocking';
    ToastNotification.show(message, 'error');
    return { success: false, error: error.message };
  }
}

// Perform the actual block action by clicking UI elements
async function performBlockAction() {
  try {
    // Step 1: Find and click "More" button (⋯) on profile
    const moreButton = await findMoreButton();
    if (!moreButton) {
      console.error('More button not found');
      return false;
    }

    await DOMHelper.clickElement(moreButton);
    await DOMHelper.randomDelay(300, 500);

    // Step 2: Find and click "Block" option in dropdown menu
    const blockMenuItem = await findBlockMenuItem();
    if (!blockMenuItem) {
      console.error('Block menu item not found');
      return false;
    }

    await DOMHelper.clickElement(blockMenuItem);
    await DOMHelper.randomDelay(300, 500);

    // Step 3: Find and click "Block" confirmation button in dialog
    const confirmButton = await findBlockConfirmButton();
    if (!confirmButton) {
      console.error('Block confirm button not found');
      return false;
    }

    await DOMHelper.clickElement(confirmButton);
    await DOMHelper.randomDelay(500, 800);

    return true;

  } catch (error) {
    console.error('Error performing block action:', error);
    return false;
  }
}

// Find "More" button with multiple strategies
async function findMoreButton() {
  const selectors = [
    '[data-testid="userActions"]',
    '[aria-label*="More"]',
    'button[aria-label*="More"]',
    '[aria-label*="Više"]', // Serbian
    'button[aria-label*="Više"]',
    'div[role="button"][aria-label*="More"]',
    'div[role="button"][aria-label*="Više"]'
  ];

  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector);
      if (element) {
        console.log('Found More button with selector:', selector);
        return element;
      }
    } catch (e) {
      continue;
    }
  }

  // Fallback: Find by icon (three dots SVG)
  const buttons = document.querySelectorAll('button, div[role="button"]');
  for (const btn of buttons) {
    const svg = btn.querySelector('svg');
    if (svg) {
      const circles = svg.querySelectorAll('circle');
      if (circles.length === 3) { // Three-dot icon
        console.log('Found More button by SVG icon');
        return btn;
      }
    }
  }

  return null;
}

// Find "Block" menu item in dropdown
async function findBlockMenuItem() {
  await DOMHelper.randomDelay(200, 400); // Wait for menu to appear

  const selectors = [
    '[data-testid*="block"]',
    '[role="menuitem"]:has-text("Block")',
    '[role="menuitem"]:has-text("Blokiraj")', // Serbian
    'div[role="menuitem"]',
    'a[role="menuitem"]'
  ];

  // First try data-testid
  let element = document.querySelector('[data-testid*="block"]');
  if (element) {
    console.log('Found Block menu item by data-testid');
    return element;
  }

  // Search through all menu items
  const menuItems = document.querySelectorAll('[role="menuitem"]');
  for (const item of menuItems) {
    const text = item.textContent.toLowerCase();
    if (text.includes('block') || text.includes('blokiraj')) {
      console.log('Found Block menu item by text content:', text);
      return item;
    }
  }

  // Fallback: search all clickable elements with "block" text
  const allElements = document.querySelectorAll('div, span, a');
  for (const el of allElements) {
    if (el.textContent.toLowerCase().includes('block @') || el.textContent.toLowerCase().includes('blokiraj @')) {
      console.log('Found Block option by text fallback');
      return el.closest('[role="menuitem"]') || el;
    }
  }

  return null;
}

// Find "Block" confirmation button in dialog
async function findBlockConfirmButton() {
  await DOMHelper.randomDelay(200, 400); // Wait for dialog to appear

  const selectors = [
    '[data-testid="confirmationSheetConfirm"]',
    'button[data-testid*="block"]',
    'div[role="button"][data-testid*="block"]'
  ];

  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector);
      if (element) {
        console.log('Found Block confirm button with selector:', selector);
        return element;
      }
    } catch (e) {
      continue;
    }
  }

  // Fallback: Find button with "Block" text in dialog
  const buttons = document.querySelectorAll('button, div[role="button"]');
  for (const btn of buttons) {
    const text = btn.textContent.toLowerCase();
    if ((text === 'block' || text === 'blokiraj') && btn.closest('[role="dialog"]')) {
      console.log('Found Block confirm button by text in dialog');
      return btn;
    }
  }

  return null;
}

// Observe URL changes for SPA navigation
function observeUrlChanges() {
  let lastUrl = location.href;
  
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      onUrlChange();
    }
  }).observe(document, { subtree: true, childList: true });
}

// Add visual indicator on blocked profiles
async function addProfileIndicator() {
  // Remove existing indicator first
  removeBlockedIndicator();
  
  // If not on profile page, no indicator needed
  if (!ProfileDetector.isProfilePage()) return;
  
  const profileData = ProfileDetector.getProfileData();
  if (!profileData || !profileData.username) return;
  
  // Check if user is blocked
  try {
    if (!chrome.runtime?.id) return;

    const checkResponse = await chrome.runtime.sendMessage({
      action: 'checkDuplicate',
      username: profileData.username
    });
    
    if (checkResponse && checkResponse.isDuplicate) {
      const user = checkResponse.user;
      showBlockedIndicator(user);
    }
  } catch (error) {
    // Handle extension context invalidation (happens on extension reload/update)
    if (error.message && error.message.includes('Extension context invalidated')) {
      console.log('Extension context invalidated. Please reload the page.');
      return;
    }
    console.error('Error checking blocked status:', error);
  }
}

// Remove blocked indicator
function removeBlockedIndicator() {
  const existing = document.getElementById('twitter-block-indicator');
  if (existing) {
    existing.remove();
  }
}

// Show blocked indicator on profile
function showBlockedIndicator(user) {
  // Create indicator
  const indicator = document.createElement('div');
  indicator.id = 'twitter-block-indicator';
  indicator.className = 'twitter-block-indicator';
  
  let indicatorHTML = `
    <div class="block-indicator-icon">🚫</div>
    <div class="block-indicator-content">
      <div class="block-indicator-title">${currentLanguage === 'sr' ? 'Blokirano preko ekstenzije' : 'Blocked via extension'}</div>
      <div class="block-indicator-date">${new Date(user.blockedAt).toLocaleDateString(currentLanguage === 'sr' ? 'sr-RS' : 'en-US')}</div>
  `;
  
  if (user.reason) {
    indicatorHTML += `<div class="block-indicator-reason">${escapeHtml(user.reason)}</div>`;
  }
  
  if (user.tags && user.tags.length > 0) {
    indicatorHTML += `
      <div class="block-indicator-tags">
        ${user.tags.map(tag => `<span class="indicator-tag">${escapeHtml(tag)}</span>`).join('')}
      </div>
    `;
  }
  
  indicatorHTML += `</div>`;
  indicator.innerHTML = indicatorHTML;
  
  // Add to page
  document.body.appendChild(indicator);
  
  // Show with animation
  setTimeout(() => {
    indicator.classList.add('show');
  }, 100);
}

// Escape HTML helper
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Add indicator on page load and URL changes
function onUrlChange() {
  console.log('URL changed:', location.href);
  addProfileIndicator();
}

// Initialize indicator
addProfileIndicator();

console.log('Content script initialization complete');
