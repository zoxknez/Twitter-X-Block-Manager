// UI State Management
export class UIState {
  constructor() {
    this.blockedUsers = [];
    this.selectedUsers = new Set();
    this.currentLanguage = 'sr';
    this.currentTheme = 'light';
    this.currentEditTags = [];
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

  setEditTags(tags) {
    this.currentEditTags = tags;
  }

  getEditTags() {
    return this.currentEditTags;
  }
}
