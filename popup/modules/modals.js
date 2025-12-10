// Modal Management Module
export class ModalManager {
  open(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
    }
  }

  close(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  }

  setupCloseButtons() {
    // Import Modal
    document.getElementById('closeImportModal')?.addEventListener('click', () => this.close('importModal'));
    document.getElementById('cancelImport')?.addEventListener('click', () => this.close('importModal'));
    
    // Edit Modal
    document.getElementById('closeEditModal')?.addEventListener('click', () => this.close('editModal'));
    document.getElementById('cancelEdit')?.addEventListener('click', () => this.close('editModal'));
    
    // Help Modal
    document.getElementById('closeHelpModal')?.addEventListener('click', () => this.close('helpModal'));
    
    // History Modal
    document.getElementById('closeHistoryModal')?.addEventListener('click', () => this.close('historyModal'));

    // Stats Modal
    document.getElementById('closeStatsModal')?.addEventListener('click', () => this.close('statsModal'));
  }
}
