// CRUD Operations Manager Module
import { t } from './translations.js';

export class CRUDManager {
  constructor(state, listRenderer, statsManager, notificationManager) {
    this.state = state;
    this.listRenderer = listRenderer;
    this.statsManager = statsManager;
    this.notificationManager = notificationManager;
  }

  async deleteUser(username) {
    const lang = this.state.getLanguage();
    if (!confirm(t('confirmDelete', lang))) return;

    const blockedUsers = this.state.getBlockedUsers();
    const updatedUsers = blockedUsers.filter(user => user.username !== username);
    
    this.state.setBlockedUsers(updatedUsers);
    await chrome.storage.local.set({ blockedUsers: updatedUsers });

    // Send message to content script to unblock
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'unblockUser',
          username: username
        });
      }
    });

    this.listRenderer.render();
    this.statsManager.update();
    this.notificationManager.show(t('userDeleted', lang) || 'Korisnik obrisan', 'success');
  }

  async unblockUser(username) {
    const lang = this.state.getLanguage();
    if (!confirm(t('confirmUnblock', lang))) return;

    const blockedUsers = this.state.getBlockedUsers();
    const updatedUsers = blockedUsers.filter(user => user.username !== username);
    
    this.state.setBlockedUsers(updatedUsers);
    await chrome.storage.local.set({ blockedUsers: updatedUsers });

    // Send message to content script to unblock
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'unblockUser',
          username: username
        });
      }
    });

    this.listRenderer.render();
    this.statsManager.update();
  }

  async updateUser(username, updates) {
    const blockedUsers = this.state.getBlockedUsers();
    const userIndex = blockedUsers.findIndex(user => user.username === username);
    
    if (userIndex === -1) return false;

    blockedUsers[userIndex] = {
      ...blockedUsers[userIndex],
      ...updates
    };

    this.state.setBlockedUsers(blockedUsers);
    await chrome.storage.local.set({ blockedUsers });

    this.listRenderer.render();
    this.statsManager.update();
    
    return true;
  }

  async bulkDelete(usernames) {
    const lang = this.state.getLanguage();
    const count = usernames.length;
    
    if (!confirm(t('confirmBulkDelete', lang).replace('{count}', count))) return;

    const blockedUsers = this.state.getBlockedUsers();
    const updatedUsers = blockedUsers.filter(user => !usernames.includes(user.username));
    
    this.state.setBlockedUsers(updatedUsers);
    await chrome.storage.local.set({ blockedUsers: updatedUsers });

    // Send message to content script to unblock all
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        usernames.forEach(username => {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'unblockUser',
            username: username
          });
        });
      }
    });

    this.state.clearSelectedUsers();
    this.listRenderer.render();
    this.statsManager.update();
  }

  async deleteAll() {
    const lang = this.state.getLanguage();
    const blockedUsers = this.state.getBlockedUsers();
    
    if (blockedUsers.length === 0) {
      this.notificationManager.show(t('noUsersToDelete', lang), 'info');
      return;
    }

    if (!confirm(t('confirmDeleteAll', lang))) return;
    if (!confirm(t('confirmDeleteAllFinal', lang))) return;

    this.state.setBlockedUsers([]);
    await chrome.storage.local.set({ blockedUsers: [] });

    // Send message to content script to unblock all
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        blockedUsers.forEach(user => {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'unblockUser',
            username: user.username
          });
        });
      }
    });

    this.state.clearSelectedUsers();
    this.listRenderer.render();
    this.statsManager.update();
    
    this.notificationManager.show(t('allUsersDeleted', lang), 'success');
  }

  toggleSelectAll(checked) {
    if (checked) {
      const blockedUsers = this.state.getBlockedUsers();
      blockedUsers.forEach(user => {
        this.state.addSelectedUser(user.username);
      });
    } else {
      this.state.clearSelectedUsers();
    }

    this.listRenderer.render();
  }

  toggleUserSelection(username, checked) {
    if (checked) {
      this.state.addSelectedUser(username);
    } else {
      this.state.removeSelectedUser(username);
    }

    // Update select all checkbox
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
      const blockedUsers = this.state.getBlockedUsers();
      const selectedCount = this.state.getSelectedUsersCount();
      
      selectAllCheckbox.checked = selectedCount === blockedUsers.length && blockedUsers.length > 0;
      selectAllCheckbox.indeterminate = selectedCount > 0 && selectedCount < blockedUsers.length;
    }

    this.listRenderer.updateBulkDeleteButton();
  }
}
