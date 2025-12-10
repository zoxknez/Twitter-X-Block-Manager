// User List Renderer Module
import { t } from './translations.js';

export class ListRenderer {
  constructor(state) {
    this.state = state;
  }

  render(users = null) {
    const listToRender = users || this.state.getBlockedUsers();
    const listContainer = document.getElementById('blockedList');
    const emptyState = document.getElementById('emptyState');
    const listCount = document.getElementById('listCount');

    if (!listContainer || !emptyState) return;
    
    if (listCount) {
      listCount.textContent = listToRender.length;
    }

    if (listToRender.length === 0) {
      listContainer.style.display = 'none';
      emptyState.style.display = 'flex';
      const selectAll = document.getElementById('selectAll');
      if (selectAll) selectAll.checked = false;
      this.state.clearSelectedUsers();
      this.updateBulkDeleteButton();
      return;
    }

    listContainer.style.display = 'flex';
    emptyState.style.display = 'none';

    const lang = this.state.getLanguage();
    listContainer.innerHTML = listToRender.map(user => this.renderUserItem(user, lang)).join('');
    
    this.attachEventListeners();
  }

  renderUserItem(user, lang) {
    const date = new Date(user.blockedAt);
    const formattedDate = date.toLocaleDateString(lang === 'sr' ? 'sr-RS' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const selectedUsers = this.state.selectedUsers;
    const isSelected = selectedUsers.has(user.username);

    return `
      <div class="blocked-item ${isSelected ? 'selected' : ''}" data-username="${user.username}">
        <div class="item-header">
          <input type="checkbox" class="item-checkbox" data-username="${user.username}" ${isSelected ? 'checked' : ''}>
          <div class="item-info">
            <div class="item-username">
              <a href="${user.profileUrl}" target="_blank">${user.username}</a>
            </div>
            ${user.displayName ? `<div class="item-display-name">${this.escapeHtml(user.displayName)}</div>` : ''}
            <div class="item-date">${formattedDate}</div>
          </div>
        </div>
        ${user.reason ? `<div class="item-reason">${this.escapeHtml(user.reason)}</div>` : ''}
        ${user.tags && user.tags.length > 0 ? `
          <div class="item-tags">
            ${user.tags.map(tag => `<span class="tag" data-tag="${this.escapeHtml(tag)}">${this.escapeHtml(tag)}</span>`).join('')}
          </div>
        ` : ''}
        <div class="item-actions">
          <button class="item-btn edit" data-username="${user.username}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            ${t('editBtn', lang)}
          </button>
          <button class="item-btn unblock" data-username="${user.username}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 8 8 12 12 16"></polyline>
              <line x1="16" y1="12" x2="8" y2="12"></line>
            </svg>
            ${t('unblockBtn', lang)}
          </button>
          <button class="item-btn delete" data-username="${user.username}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            ${t('deleteBtn', lang)}
          </button>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Will be attached by main app
  }

  updateBulkDeleteButton() {
    const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
    if (!bulkDeleteBtn) return;
    
    const count = this.state.getSelectedUsersCount();
    
    bulkDeleteBtn.style.display = count > 0 ? 'flex' : 'none';
    const span = bulkDeleteBtn.querySelector('span');
    if (span) {
      span.textContent = `${t('deleteSelectedBtn', this.state.getLanguage())} (${count})`;
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
