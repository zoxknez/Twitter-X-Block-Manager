// Import/Export Module
export class ImportExportManager {
  constructor(state, modalManager, notificationManager, onUpdate) {
    this.state = state;
    this.modalManager = modalManager;
    this.notificationManager = notificationManager;
    this.onUpdate = onUpdate;
  }

  openImportModal() {
    this.modalManager.open('importModal');
    const textarea = document.getElementById('importTextarea');
    if (textarea) {
      textarea.value = '';
      textarea.focus();
    }
  }

  async handleImport() {
    const textarea = document.getElementById('importTextarea');
    if (!textarea) return;
    
    const text = textarea.value.trim();

    if (!text) {
      this.notificationManager.show('Nema validnih korisnika za import', 'error');
      return;
    }

    const users = this.parseImportText(text);

    if (users.length === 0) {
      this.notificationManager.show('Nema validnih korisnika za import', 'error');
      return;
    }

    const response = await chrome.runtime.sendMessage({
      action: 'importUsers',
      users: users
    });

    if (response?.success) {
      const result = response.data;
      
      let message = '';
      if (result.added > 0) {
        message += `Uspešno importovano ${result.added} korisnika`;
      }
      if (result.skipped > 0) {
        message += `\n${result.skipped} korisnika preskočeno (već postoje)`;
      }
      if (result.errors.length > 0) {
        message += '\nGreška pri importu:\n' + result.errors.join('\n');
      }

      this.notificationManager.show(message, 'success');
      this.modalManager.close('importModal');
      await this.onUpdate();
    }
  }

  parseImportText(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const users = [];

    for (const line of lines) {
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

      if (!username.startsWith('@')) {
        username = '@' + username;
      }

      if (/^@[a-zA-Z0-9_]{1,15}$/.test(username)) {
        users.push({ username, reason });
      }
    }

    return users;
  }

  async handleExport() {
    const users = this.state.getBlockedUsers();
    
    if (users.length === 0) {
      this.notificationManager.show('Nema blokiranih korisnika za export', 'info');
      return;
    }

    const dataStr = JSON.stringify(users, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `twitter-blocked-users-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.notificationManager.show('✅ Lista uspešno exportovana', 'success');
  }

  async handleBackup() {
    const users = this.state.getBlockedUsers();
    
    if (users.length === 0) {
      this.notificationManager.show('Nema podataka za backup', 'info');
      return;
    }
    
    try {
      const data = {
        blockedUsers: users,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `twitter-block-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      this.notificationManager.show('✅ Backup uspešno kreiran i preuzet!', 'success');
    } catch (error) {
      this.notificationManager.show('❌ Greška pri kreiranju backup-a: ' + error.message, 'error');
    }
  }
}
