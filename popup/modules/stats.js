// Statistics Module
export class StatsManager {
  constructor(state) {
    this.state = state;
  }

  update() {
    const users = this.state.getBlockedUsers();
    const total = users.length;
    
    const totalBlocked = document.getElementById('totalBlocked');
    const todayBlocked = document.getElementById('todayBlocked');
    const weekBlocked = document.getElementById('weekBlocked');
    const avgPerDay = document.getElementById('avgPerDay');
    
    if (totalBlocked) totalBlocked.textContent = total;
    if (todayBlocked) todayBlocked.textContent = this.getTodayCount(users);
    if (weekBlocked) weekBlocked.textContent = this.getWeekCount(users);
    if (avgPerDay) avgPerDay.textContent = this.getAvgPerDay(users);
  }

  getTodayCount(users) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return users.filter(user => {
      const blockedDate = new Date(user.blockedAt);
      blockedDate.setHours(0, 0, 0, 0);
      return blockedDate.getTime() === today.getTime();
    }).length;
  }

  getWeekCount(users) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);
    
    return users.filter(user => {
      const blockedDate = new Date(user.blockedAt);
      return blockedDate >= weekAgo;
    }).length;
  }

  getAvgPerDay(users) {
    if (users.length === 0) return '0';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const oldestBlock = new Date(Math.min(...users.map(u => new Date(u.blockedAt))));
    const daysSince = Math.max(1, Math.ceil((today - oldestBlock) / (1000 * 60 * 60 * 24)));
    
    return (users.length / daysSince).toFixed(1);
  }

  showInfo() {
    const users = this.state.getBlockedUsers();
    const modal = document.getElementById('statsModal');
    if (!modal) return;

    // Update summary numbers
    const totalBlocked = document.getElementById('modalTotalBlocked');
    const avgPerDay = document.getElementById('modalAvgPerDay');
    
    if (totalBlocked) totalBlocked.textContent = users.length;
    if (avgPerDay) avgPerDay.textContent = this.getAvgPerDay(users);

    // Generate Chart Data (Last 7 days)
    const chartContainer = document.getElementById('statsChart');
    if (chartContainer) {
      const last7Days = this.getLast7DaysData(users);
      const maxCount = Math.max(...last7Days.map(d => d.count), 1); // Avoid division by zero

      chartContainer.innerHTML = last7Days.map(day => {
        const heightPercentage = (day.count / maxCount) * 100;
        return `
          <div class="chart-bar-wrapper">
            <div class="chart-value">${day.count}</div>
            <div class="chart-bar" style="height: ${heightPercentage}%" title="${day.date}: ${day.count}"></div>
            <div class="chart-label">${day.label}</div>
          </div>
        `;
      }).join('');
    }

    // Open modal
    modal.classList.add('active');
  }

  getLast7DaysData(users) {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      
      const count = users.filter(user => {
        const blockedDate = new Date(user.blockedAt);
        blockedDate.setHours(0, 0, 0, 0);
        return blockedDate.getTime() === d.getTime();
      }).length;

      days.push({
        date: d.toLocaleDateString(),
        label: d.toLocaleDateString(undefined, { weekday: 'short' }),
        count: count
      });
    }
    return days;
  }
}
