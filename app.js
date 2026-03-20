const API_BASE = 'https://script.google.com/macros/s/AKfycbzwLE2kdkFL8nJyLdP-TLCqXHkbbeaX8aqGNDfN5iZD3ypvpx9QTSLhS00mwtGMI5Ip5A/exec';

const ACTIVITY_VIEW_MODES = {
  ALL_ROWS: 'ALL_ROWS',
  LATEST_PER_CLIENT: 'LATEST_PER_CLIENT'
};

let currentUser = null;
let personEmailToNameKey = {};
let pcData = {
  stats: null,
  followups: [],
  activities: [],
  perUserStats: {},
  routes: [],
  routeWeekStartYmd: ''
};
let countdownInterval = null;
let currentTab = 'FOLLOWUPS';

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
  if (el) el.textContent = msg;
}

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

  document.getElementById('tab-followups')
    .addEventListener('click', () => switchTab('FOLLOWUPS'));
  document.getElementById('tab-timelines')
    .addEventListener('click', () => switchTab('TIMELINES'));
  document.getElementById('tab-routes')
    .addEventListener('click', () => switchTab('ROUTES'));

  document.getElementById('search-input')
    .addEventListener('input', renderCurrentTab);
  document.getElementById('user-filter')
    .addEventListener('change', renderCurrentTab);
  document.getElementById('status-filter')
    .addEventListener('change', renderFollowups);
  document.getElementById('outcome-filter')
    .addEventListener('change', renderTimelines);
  document.getElementById('activity-view-mode')
    .addEventListener('change', renderTimelines);

  document.getElementById('btn-logout').addEventListener('click', () => {
    localStorage.removeItem('pcUser');
    currentUser = null;
    showScreen('login');
  });

  document.getElementById('btn-close-history')
    .addEventListener('click', closeHistoryModal);

  switchTab(currentTab);
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
    pcData.routes = data.routePlans || [];
    pcData.routeWeekStartYmd = data.routeWeekStartYmd || '';

    updateStatsUI();
    updateUserFilterOptions();
    renderCurrentTab();
    startCountdownTimer();
  } catch (err) {
    alert('Error loading data: ' + err.message);
  }
}

function updateStatsUI() {
  if (!pcData.stats) return;

  const { followups, activities, perUser } = pcData.stats;

  document.getElementById('stat-open').textContent = followups.open || 0;
  document.getElementById('stat-overdue').textContent = followups.overdue || 0;
  document.getElementById('stat-today').textContent = followups.today || 0;
  document.getElementById('stat-upcoming').textContent = followups.upcoming || 0;

  document.getElementById('stat-matured').textContent = activities.matured || 0;
  document.getElementById('stat-cancelled').textContent = activities.cancelled || 0;

  const topContainer = document.getElementById('stat-top-users');
  topContainer.innerHTML = '';

  const list = Object.values(perUser || {});
  if (!list.length) {
    topContainer.innerHTML = '<span style="color:#9ca3af;">No open follow-ups.</span>';
    return;
  }

  list.sort((a, b) => (b.overdue || 0) - (a.overdue || 0));

  list.slice(0, 5).forEach((u) => {
    const row = document.createElement('div');
    row.className = 'top-user-row';
    row.innerHTML = `
      <div class="top-user-name">${escapeHtml(u.name || u.email || '')}</div>
      <div class="top-user-badge">Overdue: ${u.overdue || 0} | Open: ${u.open || 0}</div>
    `;
    topContainer.appendChild(row);
  });
}

function updateUserFilterOptions() {
  const select = document.getElementById('user-filter');
  if (!select) return;

  const prevValue = select.value;
  const map = {};
  const nameToPrimaryEmailKey = {};
  personEmailToNameKey = {};

  const addPerson = (email, name, openIncrement) => {
    const normEmail = normalizeText(email);
    const normName = normalizeText(name);

    let key = '';
    if (normEmail) {
      key = `EMAIL:${normEmail}`;
      if (normName) {
        nameToPrimaryEmailKey[normName] = key;
        personEmailToNameKey[key] = `NAME:${normName}`;
      }
    } else if (normName) {
      key = nameToPrimaryEmailKey[normName] || `NAME:${normName}`;
    } else {
      return;
    }

    if (!map[key]) {
      map[key] = {
        key,
        email: email || '',
        name: name || '',
        open: 0
      };
    }

    const target = map[key];
    if (!target.email && email) target.email = email;
    if ((!target.name || target.name === target.email) && name) target.name = name;
    if (openIncrement) target.open += openIncrement;
  };

  (pcData.followups || []).forEach((f) => addPerson(f.userEmail, f.userName, 1));
  (pcData.activities || []).forEach((a) => addPerson(a.userEmail, a.userName, 0));
  (pcData.routes || []).forEach((r) => addPerson(r.userEmail, r.userName, 0));
  Object.values(pcData.perUserStats || {}).forEach((u) => addPerson(u.email, u.name, 0));

  const list = Object.values(map).sort((a, b) => {
    const left = (a.name || a.email || '').toLowerCase();
    const right = (b.name || b.email || '').toLowerCase();
    return left.localeCompare(right);
  });

  select.innerHTML = '';

  const allOption = document.createElement('option');
  allOption.value = 'ALL';
  allOption.textContent = 'All Marketing Persons';
  allOption.dataset.personLabel = 'All Marketing Persons';
  select.appendChild(allOption);

  list.forEach((u) => {
    const opt = document.createElement('option');
    opt.value = u.key;
    const personLabel = formatPersonLabel(u.name, u.email);
    const suffix = u.open ? ` - ${u.open} open` : '';
    opt.textContent = `${personLabel}${suffix}`;
    opt.dataset.personLabel = personLabel;
    select.appendChild(opt);
  });

  if (prevValue && [...select.options].some((o) => o.value === prevValue)) {
    select.value = prevValue;
  } else {
    select.value = 'ALL';
  }
}

function switchTab(tab) {
  currentTab = tab;

  document.getElementById('tab-followups').classList.toggle('active', tab === 'FOLLOWUPS');
  document.getElementById('tab-timelines').classList.toggle('active', tab === 'TIMELINES');
  document.getElementById('tab-routes').classList.toggle('active', tab === 'ROUTES');

  document.getElementById('followups-list').classList.toggle('active', tab === 'FOLLOWUPS');
  document.getElementById('timelines-list').classList.toggle('active', tab === 'TIMELINES');
  document.getElementById('routes-list').classList.toggle('active', tab === 'ROUTES');

  document.getElementById('status-filter-container').classList.toggle('hidden', tab !== 'FOLLOWUPS');
  document.getElementById('outcome-filter-container').classList.toggle('hidden', tab !== 'TIMELINES');
  document.getElementById('activity-view-mode-container').classList.toggle('hidden', tab !== 'TIMELINES');

  updateSearchPlaceholder(tab);
  renderCurrentTab();
}

function updateSearchPlaceholder(tab) {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  if (tab === 'ROUTES') {
    searchInput.placeholder = 'Search by day / station / marketing person...';
  } else if (tab === 'TIMELINES') {
    searchInput.placeholder = 'Search by client / station / mobile / marketing person...';
  } else {
    searchInput.placeholder = 'Search by client / station / mobile / marketing person...';
  }
}

function renderCurrentTab() {
  if (currentTab === 'FOLLOWUPS') {
    renderFollowups();
  } else if (currentTab === 'TIMELINES') {
    renderTimelines();
  } else if (currentTab === 'ROUTES') {
    renderRoutes();
  }
}

function renderRoutes() {
  const grid = document.getElementById('routes-grid');
  const weekLabelEl = document.getElementById('routes-week-range');
  if (!grid || !weekLabelEl) return;

  const routes = pcData.routes || [];
  grid.innerHTML = '';

  const ymd = pcData.routeWeekStartYmd;
  if (!ymd) {
    weekLabelEl.textContent = 'No route plans found for current week.';
  } else {
    const [y, m, d] = ymd.split('-').map(Number);
    const monday = new Date(y, m - 1, d);
    const sunday = new Date(y, m - 1, d + 6);

    const fmt = (dt, withYear) => dt.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: withYear ? 'numeric' : undefined
    });

    weekLabelEl.textContent = `Week of ${fmt(monday, false)} - ${fmt(sunday, true)}`;
  }

  const selectedUser = getSelectedUserFilterValue();
  const search = getSearchText();

  const perUser = {};
  let visiblePlans = 0;

  routes.forEach((r) => {
    if (!matchesMarketingPersonFilter(r, selectedUser)) return;

    const text = [r.dayName, r.station, r.userName, r.userEmail]
      .join(' ')
      .toLowerCase();
    if (search && !text.includes(search)) return;

    visiblePlans++;

    const emailKey = normalizeText(r.userEmail);
    const nameKey = normalizeText(r.userName);
    const key = emailKey ? `EMAIL:${emailKey}` : (nameKey ? `NAME:${nameKey}` : 'unknown');
    if (!perUser[key]) {
      perUser[key] = {
        email: r.userEmail || '',
        name: r.userName || r.userEmail || 'Unknown',
        days: {}
      };
    }

    const dayKey = r.dayName || '';
    const existing = perUser[key].days[dayKey];
    const existingCreated = existing ? (existing.createdAtMs || 0) : 0;
    const thisCreated = r.createdAtMs || 0;

    if (!existing || thisCreated >= existingCreated) {
      perUser[key].days[dayKey] = r;
    }
  });

  const usersList = Object.values(perUser)
    .sort((a, b) => (a.name || a.email).localeCompare(b.name || b.email));

  renderSummaryChips('routes-summary', [
    { label: 'Marketing Person', value: getSelectedMarketingPersonLabel(), className: 'person' },
    { label: 'Visible Team Members', value: usersList.length, className: 'route' },
    { label: 'Visible Route Plans', value: visiblePlans, className: 'route' }
  ]);

  if (!usersList.length) {
    grid.innerHTML = '<div class="empty-route-msg">No weekly routes match the selected filters.</div>';
    return;
  }

  const weekdayOrder = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  usersList.forEach((u) => {
    const card = document.createElement('div');
    card.className = 'route-card';
    card.innerHTML = `
      <div class="route-card-header">
        <div class="route-user-name">${escapeHtml(u.name)}</div>
        <div class="route-user-email">${escapeHtml(u.email)}</div>
      </div>
      <div class="route-days-row"></div>
    `;

    const row = card.querySelector('.route-days-row');

    weekdayOrder.forEach((day) => {
      const r = u.days[day] || null;
      const stationText = r ? (r.station || '') : 'No Plan';

      const typeClass = !r
        ? 'route-pill-empty'
        : (stationText.toLowerCase() === 'leave' ? 'route-pill-leave' : 'route-pill-normal');

      const dateStr = r && r.planDateMs
        ? new Date(r.planDateMs).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short'
          })
        : '';

      const div = document.createElement('div');
      div.className = `route-day-pill ${typeClass}`;
      div.innerHTML = `
        <div class="route-day-name">${day.slice(0, 3)}</div>
        <div class="route-station">${escapeHtml(stationText)}</div>
        ${dateStr ? `<div class="route-date">${dateStr}</div>` : ''}
      `;
      row.appendChild(div);
    });

    grid.appendChild(card);
  });
}

function renderFollowups() {
  const tbody = document.querySelector('#followups-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const search = getSearchText();
  const userFilter = getSelectedUserFilterValue();
  const statusFilter = document.getElementById('status-filter').value;
  const nowMs = Date.now();
  const todayYmd = formatYmdLocal(new Date());

  let list = pcData.followups || [];

  list = list.filter((f) => {
    if (!matchesMarketingPersonFilter(f, userFilter)) return false;

    const text = [f.clientName, f.station, f.mobile, f.userName, f.userEmail]
      .join(' ')
      .toLowerCase();
    if (search && !text.includes(search)) return false;

    if (statusFilter === 'OVERDUE' && !f.isOverdue) return false;

    if (statusFilter === 'TODAY') {
      if (!f.dueMs) return false;
      const dueYmd = formatYmdLocal(new Date(f.dueMs));
      if (dueYmd !== todayYmd) return false;
      if (f.dueMs < nowMs) return false;
    }

    if (statusFilter === 'UPCOMING') {
      if (!f.dueMs) return false;
      if (f.dueMs <= nowMs) return false;
    }

    return true;
  });

  list.sort((a, b) => {
    if (a.dueMs == null && b.dueMs == null) return 0;
    if (a.dueMs == null) return 1;
    if (b.dueMs == null) return -1;
    return a.dueMs - b.dueMs;
  });

  const visibleOverdue = list.filter((f) => f.isOverdue).length;
  const visibleToday = list.filter((f) => f.dueMs && formatYmdLocal(new Date(f.dueMs)) === todayYmd).length;

  renderSummaryChips('followups-summary', [
    { label: 'Marketing Person', value: getSelectedMarketingPersonLabel(), className: 'person' },
    { label: 'Visible Follow Ups', value: list.length },
    { label: 'Overdue', value: visibleOverdue, className: 'overdue' },
    { label: 'Due Today', value: visibleToday, className: 'today' }
  ]);

  if (!list.length) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td class="empty-row" colspan="10">No follow-ups found for current filters.</td>';
    tbody.appendChild(tr);
    return;
  }

  list.forEach((f, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'followup-row';
    if (f.isOverdue) tr.classList.add('overdue-row');
    tr.dataset.dueMs = f.dueMs || '';

    const dueDateStr = f.dueMs ? new Date(f.dueMs).toLocaleString() : '-';
    const countdownLabel = formatDueLabel(f.dueMs);

    tr.innerHTML = `
      <td class="row-index">${idx + 1}</td>
      <td class="client-cell">
        ${escapeHtml(f.clientName || '')}
        <span class="client-sub">${escapeHtml(f.station || '')}</span>
      </td>
      <td>${escapeHtml(f.mobile || '')}</td>
      <td class="mkt-person-cell">${escapeHtml(formatPersonLabel(f.userName, f.userEmail))}</td>
      <td>${escapeHtml(f.nextActionType || '')}</td>
      <td>${escapeHtml(dueDateStr)}</td>
      <td class="countdown-cell"><span class="countdown-text">${escapeHtml(countdownLabel)}</span></td>
      <td>Calls: ${f.callsBefore || 0} / Visits: ${f.visitsBefore || 0}</td>
      <td class="remark-cell" title="${escapeHtml(f.remark || '')}">${escapeHtml(f.remark || '')}</td>
      <td><a href="javascript:void(0)" class="badge-link history-link">View</a></td>
    `;

    tr.querySelector('.history-link').addEventListener('click', (ev) => {
      ev.stopPropagation();
      openHistoryModal(getClientIdentity(f), f.clientName, f.mobile);
    });

    tbody.appendChild(tr);
  });
}

function renderTimelines() {
  const tbody = document.querySelector('#timeline-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const search = getSearchText();
  const userFilter = getSelectedUserFilterValue();
  const outcomeFilter = document.getElementById('outcome-filter').value;
  const viewMode = document.getElementById('activity-view-mode').value || ACTIVITY_VIEW_MODES.ALL_ROWS;

  let filtered = (pcData.activities || []).filter((a) => {
    if (!matchesMarketingPersonFilter(a, userFilter)) return false;
    if (outcomeFilter !== 'ALL' && a.outcome !== outcomeFilter) return false;

    const text = [a.clientName, a.station, a.mobile, a.userName, a.userEmail, a.activityType, a.remark]
      .join(' ')
      .toLowerCase();

    if (search && !text.includes(search)) return false;
    return true;
  });

  filtered = filtered.sort((a, b) => (b.tsMs || 0) - (a.tsMs || 0));

  let visible = filtered;
  if (viewMode === ACTIVITY_VIEW_MODES.LATEST_PER_CLIENT) {
    visible = getLatestActivityPerClient(filtered);
  }

  const visibleMatured = visible.filter((a) => a.outcome === 'DEAL_MATURED').length;
  const visibleCancelled = visible.filter((a) => a.outcome === 'DEAL_CANCELLED').length;

  renderSummaryChips('deals-summary', [
    { label: 'Marketing Person', value: getSelectedMarketingPersonLabel(), className: 'person' },
    { label: 'View', value: viewMode === ACTIVITY_VIEW_MODES.ALL_ROWS ? 'All Activity Rows' : 'Latest Per Client' },
    { label: 'Matching Activities', value: filtered.length },
    { label: 'Visible Rows', value: visible.length },
    { label: 'Visible Matured', value: visibleMatured, className: 'matured' },
    { label: 'Visible Cancelled', value: visibleCancelled, className: 'cancelled' }
  ]);

  if (!visible.length) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td class="empty-row" colspan="9">No activities found for current filters.</td>';
    tbody.appendChild(tr);
    return;
  }

  visible.forEach((a, idx) => {
    const tr = document.createElement('tr');

    const outcomeMeta = getOutcomeMeta(a.outcome);
    if (outcomeMeta.rowClass) tr.classList.add(outcomeMeta.rowClass);

    const dateStr = a.tsMs ? new Date(a.tsMs).toLocaleString() : '-';

    tr.innerHTML = `
      <td class="row-index">${idx + 1}</td>
      <td class="client-cell">
        ${escapeHtml(a.clientName || '')}
        <span class="client-sub">${escapeHtml(a.station || '')}</span>
      </td>
      <td>${escapeHtml(a.mobile || '')}</td>
      <td class="mkt-person-cell">${escapeHtml(formatPersonLabel(a.userName, a.userEmail))}</td>
      <td>${escapeHtml(a.activityType || '')}</td>
      <td><span class="tag ${outcomeMeta.tagClass}">${escapeHtml(outcomeMeta.label)}</span></td>
      <td>${escapeHtml(dateStr)}</td>
      <td class="remark-cell" title="${escapeHtml(a.remark || '')}">${escapeHtml(a.remark || '')}</td>
      <td><a href="javascript:void(0)" class="badge-link history-link">View</a></td>
    `;

    tr.querySelector('.history-link').addEventListener('click', () => {
      openHistoryModal(getClientIdentity(a), a.clientName, a.mobile);
    });

    tbody.appendChild(tr);
  });
}

function getLatestActivityPerClient(list) {
  const grouped = {};

  list.forEach((a) => {
    const key = getClientIdentity(a);
    const existing = grouped[key];
    if (!existing || (existing.tsMs || 0) < (a.tsMs || 0)) {
      grouped[key] = a;
    }
  });

  return Object.values(grouped).sort((a, b) => (b.tsMs || 0) - (a.tsMs || 0));
}

function openHistoryModal(clientIdentity, clientName, mobile) {
  const modal = document.getElementById('history-modal');
  const title = document.getElementById('history-title');
  const container = document.getElementById('history-list');

  title.textContent = `History: ${clientName || '-'} (${mobile || '-'})`;
  container.innerHTML = '';

  const list = (pcData.activities || [])
    .filter((a) => getClientIdentity(a) === clientIdentity)
    .sort((a, b) => (b.tsMs || 0) - (a.tsMs || 0));

  if (!list.length) {
    container.innerHTML = '<div class="history-item">No activity history found.</div>';
  }

  list.forEach((a) => {
    const item = document.createElement('div');
    item.className = 'history-item';

    const dateStr = a.tsMs ? new Date(a.tsMs).toLocaleString() : '-';
    const outcomeMeta = getOutcomeMeta(a.outcome);

    item.innerHTML = `
      <div class="history-item-header">
        <div>
          ${escapeHtml(a.activityType || '')} | ${escapeHtml(dateStr)}<br/>
          <span style="font-size:0.75rem;color:#6b7280;">
            ${escapeHtml(formatPersonLabel(a.userName, a.userEmail))}
          </span>
        </div>
        <div class="history-tag">${escapeHtml(outcomeMeta.label)}</div>
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

function startCountdownTimer() {
  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    const rows = document.querySelectorAll('tr.followup-row');
    const now = Date.now();

    rows.forEach((row) => {
      const dueMs = Number(row.dataset.dueMs || '0');
      const cell = row.querySelector('.countdown-cell');
      const span = row.querySelector('.countdown-text');

      if (!dueMs || !cell || !span) return;

      const diff = dueMs - now;
      if (diff <= 0) {
        span.textContent = 'Overdue';
        cell.classList.add('overdue');
        cell.classList.remove('soon');
      } else {
        span.textContent = formatDiff(diff);
        cell.classList.remove('overdue');
        cell.classList.toggle('soon', diff <= 2 * 60 * 60 * 1000);
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

  return `${days}d ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function renderSummaryChips(containerId, chips) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  chips.forEach((chip) => {
    const span = document.createElement('span');
    span.className = `summary-chip${chip.className ? ` ${chip.className}` : ''}`;
    span.textContent = `${chip.label}: ${chip.value}`;
    container.appendChild(span);
  });
}

function getSearchText() {
  const input = document.getElementById('search-input');
  return (input && input.value ? input.value : '').trim().toLowerCase();
}

function getSelectedUserFilterValue() {
  const select = document.getElementById('user-filter');
  if (!select) return 'ALL';
  return select.value || 'ALL';
}

function getSelectedMarketingPersonLabel() {
  const select = document.getElementById('user-filter');
  if (!select) return 'All Marketing Persons';

  const selectedOption = select.options[select.selectedIndex];
  if (!selectedOption) return 'All Marketing Persons';

  return selectedOption.dataset.personLabel || selectedOption.textContent || 'All Marketing Persons';
}

function matchesMarketingPersonFilter(record, selectedValue) {
  if (selectedValue === 'ALL') return true;

  const emailKey = getEmailFilterKey(record.userEmail);
  const nameKey = getNameFilterKey(record.userName);

  if (selectedValue === emailKey || selectedValue === nameKey) return true;

  if (selectedValue.startsWith('EMAIL:') && !emailKey && nameKey) {
    return personEmailToNameKey[selectedValue] === nameKey;
  }

  return false;
}

function getEmailFilterKey(email) {
  const normalized = normalizeText(email);
  return normalized ? `EMAIL:${normalized}` : '';
}

function getNameFilterKey(name) {
  const normalized = normalizeText(name);
  return normalized ? `NAME:${normalized}` : '';
}

function formatPersonLabel(name, email) {
  const cleanName = (name || '').trim();
  const cleanEmail = (email || '').trim();

  if (cleanName && cleanEmail && cleanName.toLowerCase() !== cleanEmail.toLowerCase()) {
    return `${cleanName} (${cleanEmail})`;
  }

  return cleanName || cleanEmail || 'Unknown';
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function formatYmdLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getClientIdentity(record) {
  const key = (record.clientKey || '').trim();
  if (key) return `KEY:${key}`;

  const fallbackName = normalizeText(record.clientName);
  const fallbackMobile = normalizeText(record.mobile);
  return `FALLBACK:${fallbackName}|${fallbackMobile}`;
}

function getOutcomeMeta(outcome) {
  if (outcome === 'DEAL_MATURED') {
    return {
      label: 'Deal Matured',
      tagClass: 'tag-matured',
      rowClass: 'timeline-row-matured'
    };
  }

  if (outcome === 'DEAL_CANCELLED') {
    return {
      label: 'Deal Cancelled',
      tagClass: 'tag-cancelled',
      rowClass: 'timeline-row-cancelled'
    };
  }

  return {
    label: 'Follow Up',
    tagClass: 'tag-followup',
    rowClass: ''
  };
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';

  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
