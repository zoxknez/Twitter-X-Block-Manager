// Search and Filter Manager Module
export class SearchManager {
  constructor(state, listRenderer) {
    this.state = state;
    this.listRenderer = listRenderer;
    this.currentFilter = 'all'; // all, today, week, month
  }

  search(query) {
    const searchTerm = query.toLowerCase().trim();
    const blockedUsers = this.state.getBlockedUsers();
    
    if (!searchTerm) {
      this.listRenderer.render(this.applyTimeFilter(blockedUsers));
      return;
    }

    const filtered = blockedUsers.filter(user => {
      const matchUsername = user.username.toLowerCase().includes(searchTerm);
      const matchDisplayName = user.displayName && user.displayName.toLowerCase().includes(searchTerm);
      const matchReason = user.reason && user.reason.toLowerCase().includes(searchTerm);
      const matchTags = user.tags && user.tags.some(tag => tag.toLowerCase().includes(searchTerm));
      
      return matchUsername || matchDisplayName || matchReason || matchTags;
    });

    this.listRenderer.render(this.applyTimeFilter(filtered));
  }

  filterByTag(tag) {
    const blockedUsers = this.state.getBlockedUsers();
    const filtered = blockedUsers.filter(user => 
      user.tags && user.tags.includes(tag)
    );
    this.listRenderer.render(filtered);
  }

  filterByTime(period) {
    this.currentFilter = period;
    const blockedUsers = this.state.getBlockedUsers();
    this.listRenderer.render(this.applyTimeFilter(blockedUsers));
  }

  applyTimeFilter(users) {
    if (this.currentFilter === 'all') {
      return users;
    }

    const now = new Date();
    const cutoffDate = new Date();

    switch (this.currentFilter) {
      case 'today':
        cutoffDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      default:
        return users;
    }

    return users.filter(user => {
      const userDate = new Date(user.blockedAt);
      return userDate >= cutoffDate;
    });
  }

  clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.value = '';
    }
    this.currentFilter = 'all';
    this.listRenderer.render();
  }

  setupFilterButtons() {
    const filterButtons = document.querySelectorAll('[data-filter]');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filterByTime(btn.dataset.filter);
      });
    });
  }
}
