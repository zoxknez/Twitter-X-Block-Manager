// Tags Manager Module
import { t } from './translations.js';

export class TagsManager {
  constructor(state) {
    this.state = state;
  }

  renderEditTags() {
    const tagsContainer = document.getElementById('editTags');
    if (!tagsContainer) return;
    
    const currentTags = this.state.getCurrentEditTags();
    const lang = this.state.getLanguage();

    if (currentTags.length === 0) {
      tagsContainer.innerHTML = `<div class="no-tags">${t('noTags', lang)}</div>`;
      return;
    }

    tagsContainer.innerHTML = currentTags.map(tag => `
      <span class="edit-tag">
        ${this.escapeHtml(tag)}
        <button class="remove-tag" data-tag="${this.escapeHtml(tag)}">×</button>
      </span>
    `).join('');

    // Attach remove listeners
    tagsContainer.querySelectorAll('.remove-tag').forEach(btn => {
      btn.addEventListener('click', () => {
        const tagToRemove = btn.dataset.tag;
        this.removeTag(tagToRemove);
      });
    });
  }

  addTag() {
    const tagInput = document.getElementById('editTagInput');
    if (!tagInput) return;
    
    const tagValue = tagInput.value.trim();

    if (!tagValue) return;

    const currentTags = this.state.getCurrentEditTags();
    if (currentTags.includes(tagValue)) {
      tagInput.value = '';
      return;
    }

    currentTags.push(tagValue);
    this.state.setCurrentEditTags(currentTags);
    this.renderEditTags();
    tagInput.value = '';
  }

  removeTag(tag) {
    const currentTags = this.state.getCurrentEditTags();
    const newTags = currentTags.filter(t => t !== tag);
    this.state.setCurrentEditTags(newTags);
    this.renderEditTags();
  }

  getAllTags() {
    const blockedUsers = this.state.getBlockedUsers();
    const allTags = new Set();
    
    blockedUsers.forEach(user => {
      if (user.tags) {
        user.tags.forEach(tag => allTags.add(tag));
      }
    });

    return Array.from(allTags).sort();
  }

  renderTagFilter() {
    const tagFilterContainer = document.getElementById('tagFilter');
    if (!tagFilterContainer) return;

    const allTags = this.getAllTags();
    const lang = this.state.getLanguage();

    if (allTags.length === 0) {
      tagFilterContainer.innerHTML = `<div class="no-tags-filter">${t('noTagsAvailable', lang)}</div>`;
      return;
    }

    tagFilterContainer.innerHTML = `
      <div class="tag-filter-list">
        ${allTags.map(tag => `
          <button class="tag-filter-btn" data-tag="${this.escapeHtml(tag)}">
            ${this.escapeHtml(tag)}
          </button>
        `).join('')}
      </div>
    `;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
