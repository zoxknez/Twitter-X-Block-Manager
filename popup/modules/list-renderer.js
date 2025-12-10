// User List Renderer Module
import { t } from './translations.js';

export class ListRenderer {
  constructor(state) {
    this.state = state;
  }

  render(users = null) {
    const listToRender = users || this.state.getBlockedUsers();
    this.currentList = listToRender; // Store for pagination
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

    const viewMode = this.state.getViewMode();
    const lang = this.state.getLanguage();

    // Handle Dashboard Mode
    if (viewMode === 'dashboard') {
      // Show only top 2 items
      const dashboardList = listToRender.slice(0, 2);
      let html = dashboardList.map(user => this.renderUserItem(user, lang)).join('');
      listContainer.innerHTML = html;
      
      // Show View All button
      const viewAllContainer = document.getElementById('viewAllContainer');
      if (viewAllContainer) viewAllContainer.style.display = 'flex';
      
      // Hide pagination
      const paginationControls = listContainer.querySelector('.pagination-controls');
      if (paginationControls) paginationControls.remove();

      this.attachEventListeners();
      return;
    }

    // Handle List Mode (Full List with Pagination)
    const viewAllContainer = document.getElementById('viewAllContainer');
    if (viewAllContainer) viewAllContainer.style.display = 'none';

    // Pagination Logic
    const currentPage = this.state.getCurrentPage();
    const itemsPerPage = this.state.getItemsPerPage();
    const totalPages = Math.ceil(listToRender.length / itemsPerPage);
    
    // Ensure current page is valid
    const validPage = Math.max(1, Math.min(currentPage, totalPages));
    if (validPage !== currentPage) {
      this.state.setCurrentPage(validPage);
    }

    const startIndex = (validPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedList = listToRender.slice(startIndex, endIndex);
    
    // Render list items
    let html = paginatedList.map(user => this.renderUserItem(user, lang, true)).join('');

    // Render Pagination Controls
    if (totalPages > 1) {
      html += this.renderPaginationControls(validPage, totalPages, lang);
    }

    listContainer.innerHTML = html;
    
    this.attachEventListeners();
    this.attachPaginationListeners();
    this.attachCompactListeners();
  }

  renderPaginationControls(currentPage, totalPages, lang) {
    return `
      <div class="pagination-controls">
        <button class="pagination-btn prev" ${currentPage === 1 ? 'disabled' : ''}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <span class="pagination-info">${currentPage} / ${totalPages}</span>
        <button class="pagination-btn next" ${currentPage === totalPages ? 'disabled' : ''}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    `;
  }

  attachPaginationListeners() {
    const listContainer = document.getElementById('blockedList');
    if (!listContainer) return;

    const prevBtn = listContainer.querySelector('.pagination-btn.prev');
    const nextBtn = listContainer.querySelector('.pagination-btn.next');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const currentPage = this.state.getCurrentPage();
        if (currentPage > 1) {
          this.state.setCurrentPage(currentPage - 1);
          this.render(this.currentList); // Pass current list to maintain search/filter state
          // Scroll to top of list
          const content = document.querySelector('.right-panel-content');
          if (content) content.scrollTop = 0;
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const currentPage = this.state.getCurrentPage();
        const currentListLength = this.currentList ? this.currentList.length : this.state.getBlockedUsers().length;
        const totalPages = Math.ceil(currentListLength / this.state.getItemsPerPage());

        if (currentPage < totalPages) {
          this.state.setCurrentPage(currentPage + 1);
          this.render(this.currentList); // Pass current list to maintain search/filter state
          const content = document.querySelector('.right-panel-content');
          if (content) content.scrollTop = 0;
        }
      });
    }
  }

  attachCompactListeners() {
    const listContainer = document.getElementById('blockedList');
    if (!listContainer) return;

    const compactItems = listContainer.querySelectorAll('.blocked-item.compact');
    compactItems.forEach(item => {
      item.addEventListener('click', (e) => {
        // Don't toggle if clicking checkbox or buttons
        if (e.target.closest('button') || e.target.closest('input[type="checkbox"]')) return;
        
        item.classList.toggle('expanded');
      });
    });
  }

  renderUserItem(user, lang, isCompact = false) {
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
    const safeUsername = this.escapeHtml(user.username);

    if (isCompact) {
      return `
        <div class="blocked-item compact ${isSelected ? 'selected' : ''}" data-username="${safeUsername}">
          <div class="item-header">
            <input type="checkbox" class="item-checkbox" data-username="${safeUsername}" ${isSelected ? 'checked' : ''}>
            <div class="item-info">
              <div class="item-username">
                <span class="username-text">${safeUsername}</span>
                <svg class="expand-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              <div class="item-date">${formattedDate}</div>
            </div>
          </div>
          
          <div class="compact-details">
            <div class="item-username-full">
              <a href="${user.profileUrl}" target="_blank">${safeUsername}</a>
            </div>
            ${user.displayName ? `<div class="item-display-name">${this.escapeHtml(user.displayName)}</div>` : ''}
            ${user.reason ? `<div class="item-reason">${this.escapeHtml(user.reason)}</div>` : ''}
            ${user.tags && user.tags.length > 0 ? `
              <div class="item-tags">
                ${user.tags.map(tag => `<span class="tag" data-tag="${this.escapeHtml(tag)}">${this.escapeHtml(tag)}</span>`).join('')}
              </div>
            ` : ''}
            <div class="item-actions">
              <button class="item-btn edit" data-username="${safeUsername}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                ${t('editBtn', lang)}
              </button>
              <button class="item-btn unblock" data-username="${safeUsername}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 8 8 12 12 16"></polyline>
                  <line x1="16" y1="12" x2="8" y2="12"></line>
                </svg>
                ${t('unblockBtn', lang)}
              </button>
              <button class="item-btn delete" data-username="${safeUsername}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                ${t('deleteBtn', lang)}
              </button>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="blocked-item ${isSelected ? 'selected' : ''}" data-username="${safeUsername}">
        <div class="item-header">
          <input type="checkbox" class="item-checkbox" data-username="${safeUsername}" ${isSelected ? 'checked' : ''}>
          <div class="item-info">
            <div class="item-username">
              <a href="${user.profileUrl}" target="_blank">${safeUsername}</a>
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
          <button class="item-btn edit" data-username="${safeUsername}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            ${t('editBtn', lang)}
          </button>
          <button class="item-btn unblock" data-username="${safeUsername}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 8 8 12 12 16"></polyline>
              <line x1="16" y1="12" x2="8" y2="12"></line>
            </svg>
            ${t('unblockBtn', lang)}
          </button>
          <button class="item-btn delete" data-username="${safeUsername}">
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
