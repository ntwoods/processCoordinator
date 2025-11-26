/******** CONFIG ********/

// 👇 Yahan PC API Web App URL daalna hai (PC_API.gs se deploy karke)
const API_BASE = 'https://script.google.com/macros/s/AKfycbzwLE2kdkFL8nJyLdP-TLCqXHkbbeaX8aqGNDfN5iZD3ypvpx9QTSLhS00mwtGMI5Ip5A/exec';

let currentUser = null;
let pcData = {
  stats: null,
  followups: [],
  activities: [],
  perUserStats: {}
};
let countdownInterval = null;
let currentTab = 'FOLLOWUPS';

/******** GOOGLE SIGN-IN ********/

function decodeJwtResponse(token) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const payload = parts[1]
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const decoded = atob(payload);
  return JSON.parse(decoded);
}

window.handleGoogleCredential = (response) => {
  try {
    const payload = decodeJwtResponse(response.credential);
    const email = payload.email;
    const name = payload.name || '';
    if (!email) {
      showLoginError('Email not found in Google response.');
      return;
    }
    currentUser = { email, name };
    localStorage.setItem('pcUser', JSON.stringify(currentUser));
    initAppAfterLogin();
  } catch (err) {
    showLoginError('Login failed: ' + err.message);
  }
};

function showLoginError(msg) {
  const el = document.getElementById('login-error');
  el.textContent = msg;
}

/******** INIT ********/

document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('pcUser');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      initAppAfterLogin();
    } catch (e) {
      console.warn(e);
    }
  }

  // Tabs
  document.getElementById('tab-followups')
    .addEventListener('click', () => switchTab('FOLLOWUPS'));
  document.getElementById('tab-timelines')
    .addEventListener('click', () => switchTab('TIMELINES'));

  // Filters
  document.getElementById('search-input')
    .addEventListener('input', renderCurrentTab);
  document.getElementById('user-filter')
    .addEventListener('change', renderCurrentTab);
  document.getElementById('status-filter')
    .addEventListener('change', renderFollowups);
  document.getElementById('outcome-filter')
    .addEventListener('change', renderTimelines);

  // Logout
  document.getElementById('btn-logout').addEventListener('click', () => {
    localStorage.removeItem('pcUser');
    currentUser = null;
    showScreen('login');
  });

  // History modal close
  document.getElementById('btn-close-history')
    .addEventListener('click', closeHistoryModal);
});

function showScreen(which) {
  const login = document.getElementById('login-screen');
  const main = document.getElementById('main-screen');
  if (which === 'login') {
    login.classList.add('active');
    main.classList.remove('active');
  } else {
    login.classList.remove('active');
    main.classList.add('active');
  }
}

async function initAppAfterLogin() {
  if (!currentUser) return;
  showScreen('main');

  document.getElementById('user-name').textContent = currentUser.name || '';
  document.getElementById('user-email').textContent = currentUser.email || '';

  await fetchBootstrap();
}

/******** API HELPERS ********/

async function fetchBootstrap() {
  try {
    const url = `${API_BASE}?action=pcBootstrap&email=${encodeURIComponent(currentUser.email)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'API error');

    pcData.stats = data.stats || null;
    pcData.followups = data.followups || [];
    pcData.activities = data.activities || [];
    pcData.perUserStats = (data.stats && data.stats.perUser) || {};

    updateStatsUI();
    updateUserFilterOptions();
    renderCurrentTab();
    startCountdownTimer();
  } catch (err) {
    alert('Error loading data: ' + err.message);
  }
}

/******** UI: STATS ********/

function updateStatsUI() {
  if (!pcData.stats) return;
  const { followups, activities, perUser } = pcData.stats;

  document.getElementById('stat-open').textContent = followups.open;
  document.getElementById('stat-overdue').textContent = followups.overdue;
  document.getElementById('stat-today').textContent = followups.today;
  document.getElementById('stat-upcoming').textContent = followups.upcoming;

  document.getElementById('stat-matured').textContent = activities.matured;
  document.getElementById('stat-cancelled').textContent = activities.cancelled;

  const topContainer = document.getElementById('stat-top-users');
  topContainer.innerHTML = '';

  const list = Object.values(perUser || {});
  if (!list.length) {
    topContainer.innerHTML = '<span style="color:#9ca3af;">No open follow-ups.</span>';
    return;
  }

  list.sort((a, b) => (b.overdue || 0) - (a.overdue || 0));

  list.slice(0, 5).forEach(u => {
    const row = document.createElement('div');
    row.className = 'top-user-row';
    row.innerHTML = `
      <div class="top-user-name">${escapeHtml(u.name || u.email || '')}</div>
      <div class="top-user-badge">
        Overdue: ${u.overdue || 0} • Open: ${u.open || 0}
      </div>
    `;
    topContainer.appendChild(row);
  });
}

function updateUserFilterOptions() {
  const select = document.getElementById('user-filter');
  const prevValue = select.value;
  select.innerHTML = '<option value="ALL">All Marketing Persons</option>';

  const perUser = pcData.stats ? pcData.stats.perUser || {} : {};
  const list = Object.values(perUser);

  list.sort((a, b) => (a.name || a.email || '').localeCompare(b.name || b.email || ''));

  list.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.email;
    opt.textContent = `${u.name || u.email} (${u.open} open)`;
    select.appendChild(opt);
  });

  if (prevValue && [...select.options].some(o => o.value === prevValue)) {
    select.value = prevValue;
  }
}

/******** UI: TABS ********/

function switchTab(tab) {
  currentTab = tab;

  document.getElementById('tab-followups').classList.toggle('active', tab === 'FOLLOWUPS');
  document.getElementById('tab-timelines').classList.toggle('active', tab === 'TIMELINES');

  document.getElementById('followups-list').classList.toggle('active', tab === 'FOLLOWUPS');
  document.getElementById('timelines-list').classList.toggle('active', tab === 'TIMELINES');

  // Filters: status vs outcome
  document.getElementById('status-filter-container').classList.toggle('hidden', tab !== 'FOLLOWUPS');
  document.getElementById('outcome-filter-container').classList.toggle('hidden', tab !== 'TIMELINES');

  renderCurrentTab();
}

function renderCurrentTab() {
  if (currentTab === 'FOLLOWUPS') {
    renderFollowups();
  } else {
    renderTimelines();
  }
}

/******** UI: FOLLOWUPS (ALL USERS) ********/

function renderFollowups() {
  const container = document.getElementById('followups-list');
  container.innerHTML = '';

  const search = document.getElementById('search-input').value.toLowerCase();
  const userFilter = document.getElementById('user-filter').value;
  const statusFilter = document.getElementById('status-filter').value;
  const nowMs = Date.now();

  let list = pcData.followups || [];

  list = list.filter(f => {
    if (userFilter !== 'ALL' && f.userEmail !== userFilter) return false;

    const text = (
      (f.clientName || '') + ' ' +
      (f.station || '') + ' ' +
      (f.mobile || '') + ' ' +
      (f.userName || '')
    ).toLowerCase();

    if (search && !text.includes(search)) return false;

    if (statusFilter === 'OVERDUE' && !f.isOverdue) return false;
    if (statusFilter === 'TODAY') {
      if (!f.dueMs) return false;
      const d = new Date(f.dueMs);
      const today = new Date();
      const dStr = d.toISOString().slice(0, 10);
      const tStr = today.toISOString().slice(0, 10);
      if (dStr !== tStr) return false;
      if (f.dueMs < nowMs) return false; // ensure not overdue
    }
    if (statusFilter === 'UPCOMING') {
      if (!f.dueMs) return false;
      if (f.dueMs <= nowMs) return false;
    }

    return true;
  });

  // sort by due date
  list.sort((a, b) => {
    if (a.dueMs == null && b.dueMs == null) return 0;
    if (a.dueMs == null) return 1;
    if (b.dueMs == null) return -1;
    return a.dueMs - b.dueMs;
  });

  if (!list.length) {
    container.innerHTML = '<p style="color:#9ca3af;font-size:0.9rem;">No open follow-ups.</p>';
    return;
  }

  list.forEach(f => {
    const card = document.createElement('div');
    card.className = 'card followup-card';
    card.dataset.dueMs = f.dueMs || '';
    card.dataset.clientkey = f.clientKey || '';

    const dueLabel = formatDueLabel(f.dueMs);
    const overdue = f.isOverdue;

    const statusBadgeText = overdue ? 'Overdue' :
      (f.dueMs ? 'Scheduled' : 'No Date');

    card.innerHTML = `
      <div class="card-header">
        <div>
          <div class="card-title">
            ${escapeHtml(f.clientName)} (${escapeHtml(f.mobile)})
          </div>
          <div class="card-subtitle">
            ${escapeHtml(f.station || '')}
          </div>
          <div class="badge-secondary">
            ${escapeHtml(f.userName || f.userEmail || '')}
          </div>
        </div>
        <div style="text-align:right;">
          <div class="badge ${overdue ? 'badge-overdue' : ''}">
            ${escapeHtml(statusBadgeText)}
          </div>
          <div class="badge-secondary">
            Next: ${escapeHtml(f.nextActionType || '')}
          </div>
        </div>
      </div>

      <div class="card-body">
        <div><strong>Countdown:</strong> <span class="countdown-text">${dueLabel}</span></div>
        ${f.remark ? `<div><strong>Remark:</strong> ${escapeHtml(f.remark)}</div>` : ''}
      </div>

      <div class="card-footer">
        <div class="counts-pill">
          Calls: ${f.callsBefore} &middot; Visits: ${f.visitsBefore}
        </div>
        <div>
          <span class="history-link">View History</span>
        </div>
      </div>
    `;

    // History click
    card.querySelector('.history-link').addEventListener('click', (ev) => {
      ev.stopPropagation();
      openHistoryModal(f.clientKey, f.clientName, f.mobile);
    });

    container.appendChild(card);
  });
}

/******** UI: CLIENT TIMELINES ********/

function renderTimelines() {
  const container = document.getElementById('timelines-list');
  container.innerHTML = '';

  const search = document.getElementById('search-input').value.toLowerCase();
  const userFilter = document.getElementById('user-filter').value;
  const outcomeFilter = document.getElementById('outcome-filter').value;

  let list = pcData.activities || [];

  list = list.filter(a => {
    if (userFilter !== 'ALL' && a.userEmail !== userFilter) return false;
    if (outcomeFilter !== 'ALL' && a.outcome !== outcomeFilter) return false;

    const text = (
      (a.clientName || '') + ' ' +
      (a.station || '') + ' ' +
      (a.mobile || '') + ' ' +
      (a.userName || '')
    ).toLowerCase();
    if (search && !text.includes(search)) return false;

    return true;
  });

  if (!list.length) {
    container.innerHTML = '<p style="color:#9ca3af;font-size:0.9rem;">No activities found.</p>';
    return;
  }

  // Group by clientKey, keep latest activity per client
  const grouped = {};
  list.forEach(a => {
    const key = a.clientKey || (a.clientName + '|' + a.mobile);
    if (!grouped[key] || (grouped[key].tsMs || 0) < (a.tsMs || 0)) {
      grouped[key] = a;
    }
  });

  const latestList = Object.values(grouped).sort((a, b) => (b.tsMs || 0) - (a.tsMs || 0));

  latestList.forEach(a => {
    const card = document.createElement('div');
    card.className = 'card';

    const dateStr = a.tsMs ? new Date(a.tsMs).toLocaleString() : '';

    let outcomeLabel = a.outcome;
    if (a.outcome === 'FOLLOW_UP') outcomeLabel = 'Follow Up';
    if (a.outcome === 'DEAL_MATURED') outcomeLabel = 'Deal Matured';
    if (a.outcome === 'DEAL_CANCELLED') outcomeLabel = 'Deal Cancelled';

    card.innerHTML = `
      <div class="card-header">
        <div>
          <div class="card-title">
            ${escapeHtml(a.clientName)} (${escapeHtml(a.mobile)})
          </div>
          <div class="card-subtitle">
            ${escapeHtml(a.station || '')}
          </div>
          <div class="badge-secondary">
            ${escapeHtml(a.userName || a.userEmail || '')}
          </div>
        </div>
        <div class="badge">
          ${escapeHtml(outcomeLabel)}
        </div>
      </div>

      <div class="card-body">
        <div><strong>Last Activity:</strong> ${escapeHtml(a.activityType)} on ${dateStr}</div>
        ${a.remark ? `<div><strong>Remark:</strong> ${escapeHtml(a.remark)}</div>` : ''}
        ${a.attachmentUrl ? `<div><a href="${a.attachmentUrl}" target="_blank">Association Form</a></div>` : ''}
      </div>

      <div class="card-footer">
        <span class="history-link">View Full History</span>
        <span style="font-size:0.8rem;">Use this to remind marketing person before deadline.</span>
      </div>
    `;

    card.querySelector('.history-link').addEventListener('click', () => {
      openHistoryModal(a.clientKey, a.clientName, a.mobile);
    });

    container.appendChild(card);
  });
}

/******** UI: HISTORY MODAL ********/

function openHistoryModal(clientKey, clientName, mobile) {
  const modal = document.getElementById('history-modal');
  document.getElementById('history-title').textContent =
    `History: ${clientName} (${mobile})`;

  const container = document.getElementById('history-list');
  container.innerHTML = '';

  const list = (pcData.activities || [])
    .filter(a => a.clientKey === clientKey)
    .sort((a, b) => (b.tsMs || 0) - (a.tsMs || 0));

  list.forEach(a => {
    const item = document.createElement('div');
    item.className = 'history-item';
    const dateStr = a.tsMs ? new Date(a.tsMs).toLocaleString() : '';

    let tag = a.outcome;
    if (a.outcome === 'FOLLOW_UP') tag = 'Follow Up';
    if (a.outcome === 'DEAL_MATURED') tag = 'Deal Matured';
    if (a.outcome === 'DEAL_CANCELLED') tag = 'Deal Cancelled';

    item.innerHTML = `
      <div class="history-item-header">
        <div>
          ${escapeHtml(a.activityType)} • ${dateStr}<br/>
          <span style="font-size:0.75rem;color:#6b7280;">
            ${escapeHtml(a.userName || a.userEmail || '')}
          </span>
        </div>
        <div class="history-tag">${escapeHtml(tag)}</div>
      </div>
      ${a.remark ? `<div>Remark: ${escapeHtml(a.remark)}</div>` : ''}
    `;
    container.appendChild(item);
  });

  modal.classList.remove('hidden');
}

function closeHistoryModal() {
  document.getElementById('history-modal').classList.add('hidden');
}

/******** COUNTDOWN TIMER ********/

function startCountdownTimer() {
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    const cards = document.querySelectorAll('.followup-card');
    const now = Date.now();
    cards.forEach(card => {
      const dueMs = Number(card.dataset.dueMs || '0');
      const el = card.querySelector('.countdown-text');
      if (!dueMs || !el) return;
      const diff = dueMs - now;
      if (diff <= 0) {
        el.textContent = 'Overdue';
        card.classList.add('overdue');
      } else {
        el.textContent = formatDiff(diff);
      }
    });
  }, 1000);
}

function formatDueLabel(dueMs) {
  if (!dueMs) return 'No date';
  const diff = dueMs - Date.now();
  if (diff <= 0) return 'Overdue';
  return formatDiff(diff);
}

function formatDiff(diffMs) {
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days}d ${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
}

/******** UTILS ********/

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  str = String(str);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
