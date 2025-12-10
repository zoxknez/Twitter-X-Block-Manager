// UI State Management
export class UIState {
  constructor() {
    this.blockedUsers = [];
    this.selectedUsers = new Set();
    this.currentLanguage = 'sr';
    this.currentTheme = 'light';
    this.currentEditTags = [];
    this.viewMode = 'dashboard'; // 'dashboard' or 'list'
  }

  setViewMode(mode) {
    this.viewMode = mode;
  }

  getViewMode() {
    return this.viewMode;
  }

  setBlockedUsers(users) {
    this.blockedUsers = users;
  }

  getBlockedUsers() {
    return this.blockedUsers;
  }

  addSelectedUser(username) {
    this.selectedUsers.add(username);
  }

  removeSelectedUser(username) {
    this.selectedUsers.delete(username);
  }

  clearSelectedUsers() {
    this.selectedUsers.clear();
  }

  getSelectedUsersCount() {
    return this.selectedUsers.size;
  }

  setLanguage(lang) {
    this.currentLanguage = lang;
  }

  getLanguage() {
    return this.currentLanguage;
  }

  setTheme(theme) {
    this.currentTheme = theme;
  }

  getTheme() {
    return this.currentTheme;
  }

  setCurrentEditTags(tags) {
    this.currentEditTags = tags;
  }

  getCurrentEditTags() {
    return this.currentEditTags;
  }

  // Pagination
  setCurrentPage(page) {
    this.currentPage = page;
  }

  getCurrentPage() {
    return this.currentPage || 1;
  }

  setItemsPerPage(count) {
    this.itemsPerPage = count;
  }

  getItemsPerPage() {
    return this.itemsPerPage || 10;
  }
}
