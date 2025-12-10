// History Timeline Manager Module
import { t } from './translations.js';

export class HistoryManager {
  constructor(state) {
    this.state = state;
  }

  renderTimeline() {
    const timelineContainer = document.getElementById('timelineContent');
    if (!timelineContainer) return;
    
    const blockedUsers = this.state.getBlockedUsers();
    const lang = this.state.getLanguage();

    if (blockedUsers.length === 0) {
      timelineContainer.innerHTML = `
        <div class="empty-state" style="padding: 40px 20px;">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <p class="empty-title" style="margin-top: 16px;">${t('noHistoryAvailable', lang)}</p>
          <p class="empty-text">${lang === 'sr' ? 'Istorija blokiranja je prazna' : 'Blocking history is empty'}</p>
        </div>
      `;
      return;
    }

    // Group users by date
    const grouped = this.groupByDate(blockedUsers);
    
    timelineContainer.innerHTML = Object.keys(grouped)
      .sort((a, b) => new Date(b) - new Date(a))
      .map(date => this.renderDateGroup(date, grouped[date], lang))
      .join('');
  }

  groupByDate(users) {
    const grouped = {};
    
    users.forEach(user => {
      const date = new Date(user.blockedAt);
      const dateKey = date.toDateString();
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      grouped[dateKey].push(user);
    });

    return grouped;
  }

  renderDateGroup(dateKey, users, lang) {
    const date = new Date(dateKey);
    const formattedDate = this.formatDate(date, lang);
    const count = users.length;

    return `
      <div class="timeline-group">
        <div class="timeline-date">
          <span class="date-text">${formattedDate}</span>
          <span class="date-count">${count} ${count === 1 ? t('user', lang) : t('users', lang)}</span>
        </div>
        <div class="timeline-items">
          ${users.map(user => this.renderTimelineItem(user, lang)).join('')}
        </div>
      </div>
    `;
  }

  renderTimelineItem(user, lang) {
    const date = new Date(user.blockedAt);
    const time = date.toLocaleTimeString(lang === 'sr' ? 'sr-RS' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div class="timeline-item">
        <div class="timeline-marker"></div>
        <div class="timeline-content">
          <div class="timeline-header">
            <a href="${user.profileUrl}" target="_blank" class="timeline-username">
              ${user.username}
            </a>
            <span class="timeline-time">${time}</span>
          </div>
          ${user.displayName ? `<div class="timeline-display-name">${this.escapeHtml(user.displayName)}</div>` : ''}
          ${user.reason ? `<div class="timeline-reason">${this.escapeHtml(user.reason)}</div>` : ''}
          ${user.tags && user.tags.length > 0 ? `
            <div class="timeline-tags">
              ${user.tags.map(tag => `<span class="timeline-tag">${this.escapeHtml(tag)}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  formatDate(date, lang) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if same day
    if (this.isSameDay(date, today)) {
      return t('today', lang);
    }

    if (this.isSameDay(date, yesterday)) {
      return t('yesterday', lang);
    }

    return date.toLocaleDateString(lang === 'sr' ? 'sr-RS' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
