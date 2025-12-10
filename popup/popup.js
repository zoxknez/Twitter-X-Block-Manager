// Refactored Popup Script - Main Orchestrator
// Imports all modular components

import { UIState } from './modules/state.js';
import { ThemeManager } from './modules/theme.js';
import { LanguageManager } from './modules/language.js';
import { StatsManager } from './modules/stats.js';
import { ModalManager } from './modules/modals.js';
import { ImportExportManager } from './modules/import-export.js';
import { ListRenderer } from './modules/list-renderer.js';
import { SearchManager } from './modules/search.js';
import { TagsManager } from './modules/tags.js';
import { CRUDManager } from './modules/crud.js';
import { HistoryManager } from './modules/history.js';
import { SettingsManager } from './modules/settings.js';
import { NotificationManager } from './modules/notifications.js';
import { t } from './modules/translations.js';

// Initialize state and managers
const state = new UIState();
const notificationManager = new NotificationManager();
const themeManager = new ThemeManager(state);
const languageManager = new LanguageManager(state);
const statsManager = new StatsManager(state);
const modalManager = new ModalManager();
const listRenderer = new ListRenderer(state);
const searchManager = new SearchManager(state, listRenderer);
const tagsManager = new TagsManager(state);
const historyManager = new HistoryManager(state);
const settingsManager = new SettingsManager(state, themeManager, languageManager);

// Initialize CRUD and Import/Export managers
const crudManager = new CRUDManager(state, listRenderer, statsManager, notificationManager);
const importExportManager = new ImportExportManager(state, modalManager, notificationManager, () => {
  listRenderer.render();
  statsManager.update();
});

// Initialize app on DOM load
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Load theme and language
    await themeManager.load();
    await languageManager.load();
    await settingsManager.load();
    
    // Load data from storage
    await loadData();
    
    // Setup all event listeners
    setupEventListeners();
    settingsManager.setupEventListeners();
    
    // Initial render
    switchViewMode('dashboard'); // Start in dashboard mode
    statsManager.update();
    
    // Setup modal close buttons
    modalManager.setupCloseButtons();
    
    console.log('Block Manager initialized successfully');
  } catch (error) {
    console.error('Error initializing app:', error);
  }
});

// Load data from Chrome storage
async function loadData() {
  try {
    const result = await chrome.storage.local.get(['blockedUsers']);
    if (result.blockedUsers) {
      state.setBlockedUsers(result.blockedUsers);
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Setup all event listeners
function setupEventListeners() {
  // Theme toggle
  document.getElementById('themeToggle')?.addEventListener('click', async () => {
    await themeManager.toggle();
  });

  // Language switcher
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const lang = btn.dataset.lang;
      await languageManager.switch(lang);
      listRenderer.render();
      statsManager.update();
    });
  });

  // Search
  document.getElementById('searchInput')?.addEventListener('input', (e) => {
    // If user types, switch to list mode automatically
    if (state.getViewMode() === 'dashboard' && e.target.value.trim() !== '') {
      switchViewMode('list');
    }
    searchManager.search(e.target.value);
  });

  // View All Button
  document.getElementById('viewAllBtn')?.addEventListener('click', () => {
    switchViewMode('list');
  });

  // Select all checkbox
  document.getElementById('selectAll')?.addEventListener('change', (e) => {
    crudManager.toggleSelectAll(e.target.checked);
  });

  // Bulk delete button
  document.getElementById('bulkDeleteBtn')?.addEventListener('click', async () => {
    const selected = Array.from(state.selectedUsers);
    await crudManager.bulkDelete(selected);
  });

  // Quick action buttons
  document.getElementById('quickImportBtn')?.addEventListener('click', () => {
    importExportManager.openImportModal();
  });

  document.getElementById('quickExportBtn')?.addEventListener('click', () => {
    importExportManager.handleExport();
  });

  document.getElementById('quickStatsBtn')?.addEventListener('click', () => {
    statsManager.showInfo();
  });

  document.getElementById('quickHistoryBtn')?.addEventListener('click', () => {
    modalManager.open('historyModal');
    historyManager.renderTimeline();
  });

  document.getElementById('quickBackupBtn')?.addEventListener('click', () => {
    importExportManager.handleBackup();
  });

  document.getElementById('quickClearBtn')?.addEventListener('click', async () => {
    await crudManager.deleteAll();
  });

  document.getElementById('quickRefreshBtn')?.addEventListener('click', async () => {
    const btn = document.getElementById('quickRefreshBtn');
    btn.classList.add('rotating'); // Add CSS class for rotation if you have one, or just visual feedback
    
    await loadData();
    listRenderer.render();
    statsManager.update();
    
    setTimeout(() => btn.classList.remove('rotating'), 500);
  });

  // Help button
  document.getElementById('helpBtn')?.addEventListener('click', () => {
    modalManager.open('helpModal');
  });

  // Import modal
  document.getElementById('confirmImportBtn')?.addEventListener('click', async () => {
    await importExportManager.handleImport();
  });

  // Edit modal - Save button
  document.getElementById('saveEditBtn')?.addEventListener('click', async () => {
    await handleSaveEdit();
  });

  // Edit modal - Tag input enter key
  document.getElementById('editTagInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      tagsManager.addTag();
    }
  });

  // Edit modal - Predefined tags
  document.querySelectorAll('.predefined-tag').forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.dataset.tag;
      const currentTags = state.getCurrentEditTags ? state.getCurrentEditTags() : (state.currentEditTags || []);
      if (!currentTags.includes(tag)) {
        currentTags.push(tag);
        if (typeof state.setCurrentEditTags === 'function') {
          state.setCurrentEditTags(currentTags);
        } else {
          state.currentEditTags = currentTags;
        }
        tagsManager.renderEditTags();
      }
    });
  });

  // List item interactions - use event delegation
  document.getElementById('blockedList')?.addEventListener('click', handleListClick);
  document.getElementById('blockedList')?.addEventListener('change', handleListCheckboxChange);

  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.blockedUsers) {
      loadData().then(() => {
        listRenderer.render();
        statsManager.update();
      });
    }
  });
}

// Switch View Mode (Dashboard <-> List)
function switchViewMode(mode) {
  state.setViewMode(mode);
  
  const searchPanel = document.getElementById('searchPanel');
  const listHeader = document.getElementById('listHeader');
  const rightPanelTitle = document.querySelector('.right-panel-title span');
  const lang = state.getLanguage();

  if (mode === 'dashboard') {
    if (searchPanel) searchPanel.style.display = 'none';
    if (listHeader) listHeader.style.display = 'none';
    if (rightPanelTitle) rightPanelTitle.textContent = lang === 'sr' ? 'Nedavno blokirani' : 'Recently Blocked';
  } else {
    if (searchPanel) searchPanel.style.display = 'block';
    if (listHeader) listHeader.style.display = 'flex';
    if (rightPanelTitle) rightPanelTitle.textContent = lang === 'sr' ? 'Svi blokirani korisnici' : 'All Blocked Users';
  }

  listRenderer.render();
}

// Handle clicks on list items (edit, delete, unblock buttons)
function handleListClick(e) {
  const target = e.target.closest('button');
  if (!target) return;

  const username = target.dataset.username;
  if (!username) {
    console.warn('Button clicked but no username found', target);
    return;
  }

  console.log('List button clicked:', target.className, username);

  if (target.classList.contains('edit')) {
    openEditModal(username);
  } else if (target.classList.contains('delete')) {
    crudManager.deleteUser(username);
  } else if (target.classList.contains('unblock')) {
    crudManager.unblockUser(username);
  }
}

// Handle checkbox changes on list items
function handleListCheckboxChange(e) {
  const target = e.target;
  if (!target.classList.contains('item-checkbox')) return;

  const username = target.dataset.username;
  if (!username) return;

  crudManager.toggleUserSelection(username, target.checked);
}

// Open edit modal for a user
function openEditModal(username) {
  console.log('Opening edit modal for:', username);
  const user = state.getBlockedUsers().find(u => u.username === username);
  
  if (!user) {
    console.error('User not found in state:', username);
    return;
  }

  // Set current edit data in state
  if (typeof state.setCurrentEditTags === 'function') {
    state.setCurrentEditTags(user.tags || []);
  } else {
    state.currentEditTags = user.tags || [];
  }
  
  // Populate form
  const editUsername = document.getElementById('editUsername');
  const editReason = document.getElementById('editReason');
  const editModal = document.getElementById('editModal');
  
  if (editUsername) editUsername.value = user.username;
  if (editReason) editReason.value = user.reason || '';
  
  // Render tags
  tagsManager.renderEditTags();
  
  // Store username in modal for later use
  if (editModal) {
    editModal.dataset.username = username;
    modalManager.open('editModal');
  } else {
    console.error('Edit modal element not found');
  }
}

// Handle save edit
async function handleSaveEdit() {
  const modal = document.getElementById('editModal');
  if (!modal) return;
  
  const username = modal.dataset.username;
  
  const editReason = document.getElementById('editReason');
  if (!editReason) return;
  
  const reason = editReason.value.trim();
  const tags = state.getCurrentEditTags();

  const success = await crudManager.updateUser(username, {
    reason: reason,
    tags: tags
  });

  if (success) {
    modalManager.close('editModal');
    const lang = state.getLanguage();
    alert(t('updateSuccess', lang));
  }
}

// Utility function for HTML escaping (if needed in main file)
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
