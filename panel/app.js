/* ═══════════════════════════════════════════
   app.js – Admin Panel Logic
   Handles: Auth, SPA routing, API calls
═══════════════════════════════════════════ */

const API = window.location.origin + '/api';
let AUTH_TOKEN = localStorage.getItem('uni_token');
let CURRENT_USER = JSON.parse(localStorage.getItem('uni_user') || 'null');

// ── Utility ────────────────────────────────────────────────

// ── Mobile sidebar toggle ──────────────────────────────────
function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('active');
  document.body.style.overflow = '';
}
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger-btn');
  const closeBtn  = document.getElementById('sidebar-close-btn');
  const overlay   = document.getElementById('sidebar-overlay');
  if (hamburger) hamburger.addEventListener('click', openSidebar);
  if (closeBtn)  closeBtn.addEventListener('click', closeSidebar);
  if (overlay)   overlay.addEventListener('click', closeSidebar);

  // Close sidebar when a nav item is tapped on mobile
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 768) closeSidebar();
    });
  });
});



// ── Inactivity Auto-Logout (10 minutes for admin) ─────────
const INACTIVITY_LIMIT_MS = 10 * 60 * 1000; // 10 minutes
const INACTIVITY_WARN_MS  =  9 * 60 * 1000; // Warn at 9 minutes
let inactivityTimer     = null;
let inactivityWarnTimer = null;

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  clearTimeout(inactivityWarnTimer);
  // Warn at 9 min
  inactivityWarnTimer = setTimeout(() => {
    showToast('⚠️ You will be logged out in 60 seconds due to inactivity.', 'info');
  }, INACTIVITY_WARN_MS);
  // Auto-logout at 10 min
  inactivityTimer = setTimeout(() => {
    performInactivityLogout();
  }, INACTIVITY_LIMIT_MS);
}

function performInactivityLogout() {
  localStorage.removeItem('uni_token');
  localStorage.removeItem('uni_user');
  AUTH_TOKEN = null;
  CURRENT_USER = null;
  alert('🔒 You have been automatically logged out due to 10 minutes of inactivity.');
  window.location.reload();
}

function startInactivityWatcher() {
  ['mousemove','mousedown','keydown','touchstart','scroll','click'].forEach(
    evt => document.addEventListener(evt, resetInactivityTimer, { passive: true })
  );
  resetInactivityTimer();
}

function stopInactivityWatcher() {
  clearTimeout(inactivityTimer);
  clearTimeout(inactivityWarnTimer);
}

function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  setTimeout(() => { t.className = 'toast'; }, 3200);
}

function fmt(dateStr) {
  if (!dateStr) return '–';
  // Backend stores timestamps as UTC but WITHOUT a timezone suffix.
  // Append 'Z' so the browser treats it as UTC and auto-converts to local time (e.g. IST).
  const utcStr = (dateStr.endsWith('Z') || dateStr.includes('+')) ? dateStr : dateStr + 'Z';
  return new Date(utcStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
}

function truncate(str, n = 60) {
  if (!str) return '–';
  return str.length > n ? str.slice(0, n) + '…' : str;
}

async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (AUTH_TOKEN) headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
  const res = await fetch(API + path, { ...options, headers });
  if (res.status === 401) { logout(); return null; }
  return res;
}

// ── Auth ──────────────────────────────────────────────────

async function login(username, password) {
  const form = new URLSearchParams({ username, password });
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form
  });
  if (!res.ok) {
    const err = await res.json();
    return { error: err.detail || 'Login failed' };
  }
  const data = await res.json();
  AUTH_TOKEN = data.access_token;
  CURRENT_USER = { id: data.user_id, username: data.username, role: data.role };
  localStorage.setItem('uni_token', AUTH_TOKEN);
  localStorage.setItem('uni_user', JSON.stringify(CURRENT_USER));
  startInactivityWatcher(); // Begin 10-minute inactivity timer
  return { ok: true };
}

function logout() {
  stopInactivityWatcher();
  AUTH_TOKEN = null; CURRENT_USER = null;
  localStorage.removeItem('uni_token');
  localStorage.removeItem('uni_user');
  showPage('login');
}

// ── Page Router ────────────────────────────────────────────

function showPage(name) {
  // Toggle login mode on body (controls sidebar/topbar via CSS)
  if (name === 'login') {
    document.body.classList.add('login-mode');
  } else {
    document.body.classList.remove('login-mode');
  }

  // Show correct page, hide all others
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const page = document.getElementById(`page-${name}`);
  if (page) page.classList.add('active');
  const nav = document.querySelector(`[data-page="${name}"]`);
  if (nav) nav.classList.add('active');

  const titles = { dashboard: 'Dashboard', knowledge: 'Knowledge Base', users: 'User Management', logs: 'Chat Logs', settings: 'Settings' };
  const titleEl = document.getElementById('page-title');
  if (titleEl) titleEl.textContent = titles[name] || '';

  // Role-based nav visibility
  if (CURRENT_USER && name !== 'login') {
    const isAdmin   = CURRENT_USER.role === 'admin';
    const isTeacher = CURRENT_USER.role === 'teacher';

    // Nav items - teachers can see dashboard too
    const navDashboard = document.getElementById('nav-dashboard');
    const navUsers     = document.getElementById('nav-users');
    const navLogs      = document.getElementById('nav-logs');
    const navSettings  = document.getElementById('nav-settings');
    const navKnowledge = document.getElementById('nav-knowledge');

    if (navDashboard) navDashboard.style.display = '';  // both admin & teacher see dashboard
    if (navUsers)     navUsers.style.display     = isAdmin ? '' : 'none';
    if (navLogs)      navLogs.style.display      = ''; // both can see logs
    if (navSettings)  navSettings.style.display  = ''; // both can see settings
    if (navKnowledge) navKnowledge.style.display = ''; // both can manage knowledge

    // Block teachers from admin-only pages (only users page)
    if (isTeacher && name === 'users') {
      showPage('dashboard'); // Redirect teacher to dashboard instead
      return;
    }

    // In settings, hide non-password sections for teachers
    if (isTeacher && name === 'settings') {
      // Settings page will apply its own teacher-mode class
      document.body.classList.add('teacher-mode');
    } else {
      document.body.classList.remove('teacher-mode');
    }
  }

  if (name === 'dashboard') {
    loadDashboard();
    startDashboardPolling();
  } else {
    stopDashboardPolling(); // stop polling when leaving dashboard
  }
  if (name === 'knowledge') loadKnowledge();
  if (name === 'users') loadUsers();
  if (name === 'logs') loadLogs();
  if (name === 'settings') loadSettings();
}

// ── Server Status ──────────────────────────────────────────

async function checkServerStatus() {
  try {
    const res = await fetch(`${API}/health`);
    const badge = document.getElementById('server-status');
    if (res.ok) {
      badge.textContent = '● Server Online'; badge.className = 'status-badge online';
    } else {
      badge.textContent = '● Server Error'; badge.className = 'status-badge offline';
    }
  } catch {
    const badge = document.getElementById('server-status');
    badge.textContent = '● Server Offline'; badge.className = 'status-badge offline';
  }
}

// ── Dashboard Auto-Refresh ─────────────────────────────────

let dashboardPollTimer = null;
const DASHBOARD_POLL_MS = 15000; // refresh every 15 seconds

function startDashboardPolling() {
  stopDashboardPolling(); // clear any existing
  dashboardPollTimer = setInterval(() => {
    // Only poll if dashboard page is currently active
    if (document.getElementById('page-dashboard')?.classList.contains('active')) {
      loadDashboard();
    }
  }, DASHBOARD_POLL_MS);
}

function stopDashboardPolling() {
  if (dashboardPollTimer) {
    clearInterval(dashboardPollTimer);
    dashboardPollTimer = null;
  }
}

// Refresh dashboard immediately when user switches back to this browser tab
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    if (document.getElementById('page-dashboard')?.classList.contains('active')) {
      loadDashboard();
    }
  }
});

// ── Dashboard ──────────────────────────────────────────────

async function loadDashboard() {
  const logsRes = await apiFetch('/admin/logs?limit=500');
  const knRes   = await apiFetch('/knowledge');
  if (!logsRes || !knRes) return;

  const logs = await logsRes.json();
  const kn   = await knRes.json();

  const total    = Array.isArray(logs) ? logs.length : 0;
  const rejected = Array.isArray(logs) ? logs.filter(l => l.was_rejected === true || l.was_rejected === 1).length : 0;

  document.getElementById('stat-total-chats').textContent = total;
  document.getElementById('stat-knowledge').textContent   = Array.isArray(kn) ? kn.length : 0;
  document.getElementById('stat-answered').textContent    = total - rejected;
  document.getElementById('stat-rejected').textContent    = rejected;

  // Update "last updated" badge
  const lastUpdatedEl = document.getElementById('dashboard-last-updated');
  if (lastUpdatedEl) {
    const now = new Date();
    lastUpdatedEl.textContent = `Updated ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
  }

  const tbody = document.getElementById('recent-logs-body');
  const recent = Array.isArray(logs) ? logs.slice(0, 10) : [];
  const isAdmin = CURRENT_USER?.role === 'admin';
  tbody.innerHTML = recent.length === 0
    ? '<tr><td colspan="5" class="empty-state">No conversations yet.</td></tr>'
    : recent.map(l => {
        const isRejected = l.was_rejected === true || l.was_rejected === 1;
        const deleteCell = isAdmin
          ? `<button class="btn-icon" title="Delete" onclick="deleteLog(${l.id})">🗑️</button>`
          : '';
        const statusBadge = isRejected
          ? `<span style="font-size:10px;background:rgba(239,68,68,0.15);color:#f87171;padding:2px 6px;border-radius:6px;margin-left:6px;">Off-topic</span>`
          : '';
        const sourcesCell = isRejected || !l.sources_used ? '—' : truncate(l.sources_used, 30);
        return `
        <tr style="${isRejected ? 'opacity:0.75;' : ''}">
          <td title="${l.question}">${truncate(l.question, 45)}${statusBadge}</td>
          <td title="${l.answer}">${truncate(l.answer, 55)}</td>
          <td style="color:${isRejected ? 'var(--text-muted)' : 'inherit'}">${sourcesCell}</td>
          <td>${fmt(l.timestamp)}</td>
          <td>${deleteCell}</td>
        </tr>`;
      }).join('');
}

// ── Knowledge Base ─────────────────────────────────────────

async function loadKnowledge() {
  const res = await apiFetch('/knowledge');
  if (!res) return;
  let sources = await res.json();
  const tbody = document.getElementById('knowledge-body');

  if (!Array.isArray(sources) || sources.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No knowledge sources yet. Add your first one!</td></tr>';
    return;
  }

  // Sort: current user's uploads first, then others by date
  const myId = CURRENT_USER?.id;
  sources = [
    ...sources.filter(s => s.uploaded_by === myId).sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at)),
    ...sources.filter(s => s.uploaded_by !== myId).sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at))
  ];

  const isAdmin = CURRENT_USER?.role === 'admin';
  tbody.innerHTML = sources.map(s => {
    const isOwner = myId === s.uploaded_by;
    const ownerBadge = isOwner
      ? `<span style="font-size:10px;background:rgba(99,102,241,0.18);color:#a78bfa;padding:2px 7px;border-radius:8px;margin-left:6px;">Mine</span>`
      : '';
    const deleteBtn = (isAdmin || isOwner)
      ? `<button class="btn btn-sm btn-danger" onclick="deleteKnowledge(${s.id}, '${s.name.replace(/'/g, "\\'")}')">Delete</button>`
      : '<span style="color:var(--text-muted);font-size:12px;">—</span>';
    return `
    <tr>
      <td><strong>${s.name}</strong>${ownerBadge}<br/><small style="color:var(--text-muted)">${s.description || ''}</small></td>
      <td><span class="badge badge-user">${s.source_type}</span></td>
      <td>${s.chunk_count} chunks</td>
      <td>${fmt(s.uploaded_at)}</td>
      <td>${deleteBtn}</td>
    </tr>`;
  }).join('');
}


async function deleteKnowledge(id, name) {
  if (!confirm(`Delete knowledge source "${name}"? This cannot be undone.`)) return;
  const res = await apiFetch(`/knowledge/${id}`, { method: 'DELETE' });
  if (!res) return;
  if (res.ok) { showToast('Knowledge source deleted', 'success'); loadKnowledge(); }
  else { const e = await res.json(); showToast(e.detail || 'Delete failed', 'error'); }
}

// Upload Text
document.getElementById('upload-text-form').addEventListener('submit', async e => {
  e.preventDefault();
  const name    = document.getElementById('text-name').value.trim();
  const desc    = document.getElementById('text-desc').value.trim();
  const content = document.getElementById('text-content').value.trim();
  document.getElementById('text-error').textContent = '';

  const form = new FormData();
  form.append('name', name); form.append('description', desc); form.append('content', content);

  const res = await fetch(`${API}/knowledge/upload-text`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
    body: form
  });
  if (res.ok) {
    showToast('Knowledge uploaded successfully! 🎉', 'success');
    document.getElementById('upload-modal').classList.remove('open');
    e.target.reset(); loadKnowledge();
  } else {
    const err = await res.json();
    document.getElementById('text-error').textContent = err.detail || 'Upload failed';
  }
});

// Upload File
document.getElementById('file-input').addEventListener('change', e => {
  const f = e.target.files[0];
  document.getElementById('file-selected').textContent = f ? `Selected: ${f.name}` : '';
});

document.getElementById('upload-file-form').addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('file-name').value.trim();
  const desc = document.getElementById('file-desc').value.trim();
  const file = document.getElementById('file-input').files[0];
  document.getElementById('file-error').textContent = '';

  if (!file) { document.getElementById('file-error').textContent = 'Please select a file'; return; }

  const form = new FormData();
  form.append('name', name); form.append('description', desc); form.append('file', file);

  const res = await fetch(`${API}/knowledge/upload-file`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
    body: form
  });
  if (res.ok) {
    showToast('File uploaded and indexed! 🎉', 'success');
    document.getElementById('upload-modal').classList.remove('open');
    e.target.reset(); document.getElementById('file-selected').textContent = '';
    loadKnowledge();
  } else {
    const err = await res.json();
    document.getElementById('file-error').textContent = err.detail || 'Upload failed';
  }
});

// ── Users ──────────────────────────────────────────────────

async function loadUsers() {
  const res = await apiFetch('/admin/users');
  if (!res) return;
  const users = await res.json();
  const tbody = document.getElementById('users-body');

  if (!Array.isArray(users) || users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No users found.</td></tr>';
    return;
  }

  // Show admin count badge
  const adminCount = users.filter(u => u.role === 'admin' && u.is_active).length;
  const adminCountEl = document.getElementById('admin-count-badge');
  if (adminCountEl) adminCountEl.textContent = `${adminCount}/5 Admins`;

  tbody.innerHTML = users.map(u => {
    const showPw = (u.role === 'admin' || u.role === 'teacher') && u.plain_password && CURRENT_USER?.role === 'admin';
    const pwCell = showPw
      ? `<span style="font-family:monospace;font-size:11px;color:#fbbf24;background:rgba(251,191,36,0.1);padding:2px 6px;border-radius:4px;">${u.plain_password}</span>`
      : `<span style="color:var(--text-muted);font-size:11px;">—</span>`;
    const actions = u.username !== CURRENT_USER?.username
      ? u.is_active
        ? `<div style="display:flex;gap:6px;flex-wrap:wrap;">
             <button class="btn btn-sm btn-secondary" onclick="promptResetPassword(${u.id}, '${u.username}')">🔑 Reset PW</button>
             <button class="btn btn-sm btn-danger" onclick="deactivateUser(${u.id}, '${u.username}')">Deactivate</button>
             <button class="btn btn-sm btn-danger" onclick="deleteUser(${u.id}, '${u.username}')" style="background:var(--red);">🗑️ Delete</button>
           </div>`
        : `<div style="display:flex;gap:6px;flex-wrap:wrap;">
             <button class="btn btn-sm btn-success" onclick="reactivateUser(${u.id}, '${u.username}')">✅ Reactivate</button>
             <button class="btn btn-sm btn-danger" onclick="deleteUser(${u.id}, '${u.username}')" style="background:var(--red);">🗑️ Delete</button>
           </div>`
      : '<span style="color:var(--text-muted);font-size:12px">You</span>';
    return `
    <tr>
      <td><strong>${u.username}</strong></td>
      <td>${u.full_name || '–'}</td>
      <td><span class="badge badge-${u.role}">${u.role}</span></td>
      <td>${pwCell}</td>
      <td><span class="badge badge-${u.is_active ? 'active' : 'inactive'}">${u.is_active ? 'Active' : 'Inactive'}</span></td>
      <td>${fmt(u.created_at)}</td>
      <td>${actions}</td>
    </tr>`;
  }).join('');
}

async function promptResetPassword(id, username) {
  const newPw = prompt(`Set new password for "${username}":`);
  if (!newPw) return;
  if (newPw.length < 4) { showToast('Password must be at least 4 characters', 'error'); return; }
  const res = await apiFetch(`/admin/users/${id}/reset-password`, {
    method: 'POST', body: JSON.stringify({ new_password: newPw })
  });
  if (res && res.ok) {
    showToast(`✅ Password for "${username}" reset!`, 'success');
    loadUsers();
  } else if (res) {
    const e = await res.json();
    showToast(e.detail || 'Reset failed', 'error');
  }
}

async function deactivateUser(id, username) {
  if (!confirm(`Deactivate user "${username}"?`)) return;
  const res = await apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
  if (res && res.ok) { showToast(`User "${username}" deactivated`, 'success'); loadUsers(); }
  else if (res) { const e = await res.json(); showToast(e.detail || 'Failed', 'error'); }
}

async function reactivateUser(id, username) {
  if (!confirm(`Reactivate user "${username}"?`)) return;
  const res = await apiFetch(`/admin/users/${id}/reactivate`, { method: 'POST' });
  if (res && res.ok) { showToast(`✅ User "${username}" reactivated!`, 'success'); loadUsers(); }
  else if (res) { const e = await res.json(); showToast(e.detail || 'Failed', 'error'); }
}

async function deleteUser(id, username) {
  if (!confirm(`⚠️ WARNING: Are you sure you want to PERMANENTLY delete user "${username}"? This will delete their account and cannot be undone.`)) return;
  const res = await apiFetch(`/admin/users/${id}/permanent`, { method: 'DELETE' });
  if (res && res.ok) { showToast(`✅ User "${username}" permanently deleted`, 'success'); loadUsers(); }
  else if (res) { const e = await res.json(); showToast(e.detail || 'Delete failed', 'error'); }
}

document.getElementById('add-user-form').addEventListener('submit', async e => {
  e.preventDefault();
  const body = {
    username: document.getElementById('new-username').value.trim(),
    full_name: document.getElementById('new-fullname').value.trim(),
    email: document.getElementById('new-email').value.trim(),
    password: document.getElementById('new-password').value,
    role: document.getElementById('new-role').value,
  };
  document.getElementById('user-error').textContent = '';
  const res = await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) });
  if (!res) return;
  if (res.ok) {
    showToast(`User "${body.username}" created! ✅`, 'success');
    document.getElementById('add-user-modal').classList.remove('open');
    e.target.reset(); loadUsers();
  } else {
    const err = await res.json();
    document.getElementById('user-error').textContent = err.detail || 'Failed to create user';
  }
});

// ── Logs ───────────────────────────────────────────────────

// Track current view mode ('sessions' | 'flat')
let logsViewMode = 'sessions';
// Store all loaded logs for use by both views
let allLogsCache = [];

document.getElementById('btn-toggle-logs-view').addEventListener('click', () => {
  logsViewMode = (logsViewMode === 'sessions') ? 'flat' : 'sessions';
  const btn = document.getElementById('btn-toggle-logs-view');
  if (logsViewMode === 'sessions') {
    btn.textContent = '📋 Flat View';
    document.getElementById('logs-sessions-container').style.display = '';
    document.getElementById('logs-flat-container').style.display = 'none';
  } else {
    btn.textContent = '💬 Session View';
    document.getElementById('logs-sessions-container').style.display = 'none';
    document.getElementById('logs-flat-container').style.display = '';
  }
  renderLogs(allLogsCache);
});

async function loadLogs() {
  const res = await apiFetch('/admin/logs?limit=200');
  if (!res) return;
  allLogsCache = await res.json();
  renderLogs(allLogsCache);
}

function renderLogs(logs) {
  if (logsViewMode === 'sessions') {
    renderSessionView(logs);
  } else {
    renderFlatView(logs);
  }
}

function renderSessionView(logs) {
  const container = document.getElementById('logs-sessions-container');
  const countEl = document.getElementById('logs-session-count');

  if (!Array.isArray(logs) || logs.length === 0) {
    container.innerHTML = '<div class="glass-card" style="padding:32px;text-align:center;color:var(--text-muted);">No conversations logged yet.</div>';
    if (countEl) countEl.textContent = '0 sessions';
    return;
  }

  // Group logs by session_id (fallback to individual if no session_id)
  const sessionMap = new Map();
  logs.forEach(l => {
    const key = l.session_id || `solo-${l.id}`;
    if (!sessionMap.has(key)) sessionMap.set(key, []);
    sessionMap.get(key).push(l);
  });

  // Sort sessions by latest message timestamp (newest first)
  const sessions = Array.from(sessionMap.entries()).sort((a, b) => {
    const latestA = Math.max(...a[1].map(l => new Date(l.timestamp).getTime()));
    const latestB = Math.max(...b[1].map(l => new Date(l.timestamp).getTime()));
    return latestB - latestA;
  });

  if (countEl) countEl.textContent = `${sessions.length} session${sessions.length !== 1 ? 's' : ''}`;

  const isAdmin = CURRENT_USER?.role === 'admin';
  container.innerHTML = sessions.map(([sessionId, entries]) => {
    const sorted = [...entries].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const first  = sorted[0];
    const flagged = sorted.some(e => e.is_flagged);
    const hasRejected = sorted.some(e => e.was_rejected);
    const msgCount = sorted.length;
    const flagIcon = flagged ? '🚩 ' : '';
    const escapedId = JSON.stringify(sessionId);

    const viewBtn  = `<button class="btn btn-sm btn-primary" onclick="openSessionDetail(${escapedId}); event.stopPropagation();" style="padding:5px 10px;font-size:12px;font-weight:600;">👁 View Chat</button>`;
    const flagBtn  = `<button class="btn btn-sm ${flagged ? 'btn-warning' : 'btn-secondary'}" onclick="toggleFlagSession(${escapedId}, event)" title="Flag this session for review" style="padding:5px 8px;font-size:11px;">${flagged ? '🚩 Flagged' : '🏳️ Flag'}</button>`;
    const deleteBtn = isAdmin
      ? `<button class="btn btn-sm btn-danger" onclick="deleteSession(${escapedId}, event)" style="padding:5px 8px;font-size:11px;">🗑️</button>`
      : '';

    return `
    <div class="glass-card session-card" onclick="openSessionDetail(${escapedId})" style="margin-bottom:12px;padding:16px 20px;cursor:pointer;${flagged ? 'border-left:3px solid #fbbf24;' : ''}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
            <span style="font-size:18px;">💬</span>
            <strong style="font-size:14px;line-height:1.4;">${flagIcon}${truncate(first.question, 65)}</strong>
          </div>
          <p style="color:var(--text-muted);font-size:12px;margin:0 0 10px;padding-left:26px;">${truncate(first.answer, 90)}</p>
          <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;padding-left:26px;">
            <span style="font-size:11px;color:var(--text-muted);">🕐 ${fmt(first.timestamp)}</span>
            <span style="font-size:11px;background:rgba(99,102,241,0.15);color:#a78bfa;padding:2px 8px;border-radius:8px;">${msgCount} message${msgCount !== 1 ? 's' : ''}</span>
            ${hasRejected ? '<span style="font-size:11px;background:rgba(239,68,68,0.15);color:#f87171;padding:2px 8px;border-radius:8px;">Off-topic</span>' : ''}
          </div>
        </div>
      </div>
      <!-- Action buttons row — stop propagation so card click doesn't re-fire -->
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px;padding-top:10px;border-top:1px solid var(--border);" onclick="event.stopPropagation();">
        ${viewBtn}
        ${flagBtn}
        ${deleteBtn}
      </div>
    </div>`;
  }).join('');
}

function renderFlatView(logs) {
  const tbody = document.getElementById('logs-body');
  if (!Array.isArray(logs) || logs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No conversations logged yet.</td></tr>';
    return;
  }
  const isAdmin = CURRENT_USER?.role === 'admin';
  tbody.innerHTML = logs.map(l => {
    const flagIcon = l.is_flagged ? '🚩' : '🏳️';
    const flagBtn = `<button class="btn btn-sm ${l.is_flagged ? 'btn-warning' : 'btn-secondary'}" onclick="toggleFlagLog(${l.id})" style="padding:4px 8px;font-size:11px;">${flagIcon} ${l.is_flagged ? 'Flagged' : 'Flag'}</button>`;
    const deleteBtn = isAdmin ? `<button class="btn-icon" title="Delete" onclick="deleteLog(${l.id})" style="margin-left:6px;">🗑️</button>` : '';
    const questionText = l.is_flagged ? `<span style="color:#fbbf24;font-weight:600;">⚠️ ${truncate(l.question, 50)}</span>` : truncate(l.question, 55);
    return `
      <tr style="${l.is_flagged ? 'background: rgba(251,191,36,0.04);' : ''}">
        <td title="${l.question}">${questionText}</td>
        <td title="${l.answer}">${truncate(l.answer, 70)}</td>
        <td>${l.sources_used || '–'}</td>
        <td><span class="badge badge-${l.was_rejected ? 'rejected' : 'answered'}">${l.was_rejected ? 'Rejected' : 'Answered'}</span></td>
        <td>${fmt(l.timestamp)}</td>
        <td><div style="display:flex;align-items:center;">${flagBtn}${deleteBtn}</div></td>
      </tr>`;
  }).join('');
}

// Open session detail modal
function openSessionDetail(sessionId) {
  const entries = allLogsCache.filter(l => (l.session_id || `solo-${l.id}`) === sessionId);
  const sorted = [...entries].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  document.getElementById('session-modal-title').textContent = `Session — ${sorted.length} message${sorted.length !== 1 ? 's' : ''}`;
  document.getElementById('session-modal-meta').textContent = `Started: ${fmt(sorted[0]?.timestamp)} · Session ID: ${sessionId.substring(0, 8)}...`;

  const history = sorted.map(e => {
    const status = e.was_rejected
      ? '<span style="font-size:10px;background:rgba(239,68,68,0.15);color:#f87171;padding:2px 7px;border-radius:8px;">Off-topic</span>'
      : '<span style="font-size:10px;background:rgba(34,197,94,0.15);color:#4ade80;padding:2px 7px;border-radius:8px;">Answered</span>';
    const flagMark = e.is_flagged ? '<span style="font-size:10px;color:#fbbf24;">🚩 Flagged</span>' : '';
    return `
      <div style="margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid var(--border);">
        <div style="background:rgba(99,102,241,0.1);border-radius:10px;padding:10px 14px;margin-bottom:8px;">
          <span style="font-size:11px;color:#a78bfa;font-weight:600;">👤 STUDENT</span>
          <p style="margin:6px 0 0;font-size:14px;">${e.question}</p>
        </div>
        <div style="background:rgba(0,0,0,0.2);border-radius:10px;padding:10px 14px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-size:11px;color:#34d399;font-weight:600;">🎓 BOT</span>
            <div style="display:flex;gap:6px;align-items:center;">${status} ${flagMark}</div>
          </div>
          <p style="margin:0;font-size:14px;white-space:pre-wrap;">${e.answer}</p>
          ${e.sources_used ? `<p style="margin:8px 0 0;font-size:11px;color:var(--text-muted);">📎 Sources: ${e.sources_used}</p>` : ''}
          <p style="margin:6px 0 0;font-size:11px;color:var(--text-muted);">🕐 ${fmt(e.timestamp)}</p>
        </div>
      </div>`;
  }).join('');

  document.getElementById('session-chat-history').innerHTML = history;
  document.getElementById('session-detail-modal').classList.add('open');
}

document.getElementById('close-session-modal').addEventListener('click', () => {
  document.getElementById('session-detail-modal').classList.remove('open');
});
document.getElementById('session-detail-modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
});

// Flag all entries in a session
async function toggleFlagSession(sessionId, e) {
  if (e) e.stopPropagation();
  const entries = allLogsCache.filter(l => (l.session_id || `solo-${l.id}`) === sessionId);
  const anyFlagged = entries.some(l => l.is_flagged);
  // Toggle all to opposite state
  const toFlag = entries.filter(l => l.is_flagged === anyFlagged); // if any flagged → unflag those; if none → flag all
  for (const entry of toFlag) {
    await apiFetch(`/admin/logs/${entry.id}/flag`, { method: 'POST' });
  }
  showToast(anyFlagged ? '🏳️ Session unflagged' : '🚩 Session flagged for review', 'success');
  loadLogs();
}

// Delete all entries in a session
async function deleteSession(sessionId, e) {
  if (e) e.stopPropagation();
  if (!confirm('Delete all messages in this session?')) return;
  const entries = allLogsCache.filter(l => (l.session_id || `solo-${l.id}`) === sessionId);
  for (const entry of entries) {
    await apiFetch(`/admin/logs/${entry.id}`, { method: 'DELETE' });
  }
  showToast('Session deleted', 'success');
  if (CURRENT_USER?.role === 'admin') loadDashboard();
  loadLogs();
}

async function toggleFlagLog(id) {
  const res = await apiFetch(`/admin/logs/${id}/flag`, { method: 'POST' });
  if (res && res.ok) {
    const data = await res.json();
    showToast(data.is_flagged ? '🚩 Conversation flagged for review' : '🏳️ Conversation unflagged', 'success');
    loadLogs();
    if (CURRENT_USER?.role === 'admin') {
      loadDashboard();
    }
  } else {
    showToast('Failed to toggle flag', 'error');
  }
}

async function deleteLog(id) {
  if (!confirm('Delete this conversation entry?')) return;
  const res = await apiFetch(`/admin/logs/${id}`, { method: 'DELETE' });
  if (res && res.ok) {
    showToast('Entry deleted', 'success');
    if (CURRENT_USER?.role === 'admin') {
      loadDashboard();
    }
    loadLogs();
  } else showToast('Delete failed', 'error');
}

async function clearAllLogs() {
  if (!confirm('Delete ALL conversation logs? This cannot be undone.')) return;
  const res = await apiFetch('/admin/logs/clear', { method: 'DELETE' });
  if (res && res.ok) {
    const d = await res.json();
    showToast(d.message, 'success');
    loadDashboard();
    loadLogs();
  } else showToast('Clear failed', 'error');
}

document.getElementById('btn-clear-logs').addEventListener('click', clearAllLogs);

// ── Settings ───────────────────────────────────────────────

async function loadSettings() {
  if (CURRENT_USER && CURRENT_USER.role === 'admin') {
    const res = await apiFetch('/admin/config');
    if (res && res.ok) {
      const cfg = await res.json();
      document.getElementById('setting-system-prompt').value = cfg.system_prompt || '';
      document.getElementById('setting-uni-name').value      = cfg.university_name || '';
      document.getElementById('setting-max-chunks').value    = cfg.max_context_chunks || '5';
      document.getElementById('setting-web-search').value    = cfg.web_search_enabled || 'false';
    }
  }
  // Load word filter (both roles can view/edit it)
  loadWordFilter();
}

async function saveConfig(key, value) {
  const res = await apiFetch('/admin/config', { method: 'PUT', body: JSON.stringify({ key, value }) });
  if (res && res.ok) showToast('Setting saved ✅', 'success');
  else showToast('Save failed', 'error');
}

document.getElementById('save-system-prompt').addEventListener('click', () => {
  saveConfig('system_prompt', document.getElementById('setting-system-prompt').value);
});

document.getElementById('save-general-settings').addEventListener('click', async () => {
  await saveConfig('university_name',   document.getElementById('setting-uni-name').value);
  await saveConfig('max_context_chunks', document.getElementById('setting-max-chunks').value);
  await saveConfig('web_search_enabled', document.getElementById('setting-web-search').value);
  showToast('All settings saved ✅', 'success');
});

document.getElementById('save-password').addEventListener('click', async () => {
  const cur = document.getElementById('cur-pass').value;
  const nw  = document.getElementById('new-pass').value;
  document.getElementById('pass-error').textContent = '';
  if (!cur || !nw) { document.getElementById('pass-error').textContent = 'Fill in both fields'; return; }
  const res = await apiFetch('/auth/change-password', {
    method: 'POST', body: JSON.stringify({ current_password: cur, new_password: nw })
  });
  if (res && res.ok) {
    showToast('Password updated ✅', 'success');
    document.getElementById('cur-pass').value = '';
    document.getElementById('new-pass').value = '';
  } else if (res) {
    const e = await res.json();
    document.getElementById('pass-error').textContent = e.detail || 'Failed';
  }
});

// ── Word Filter ────────────────────────────────────────────

const DEFAULT_FILTER_WORDS = [
  // English explicit/abusive
  'fuck','shit','ass','bitch','bastard','damn','crap','dick','pussy','cock',
  'asshole','motherfucker','faggot','whore','slut','porn','sex','nude','naked',
  'rape','kill','murder','suicide','drug','weed','cocaine','heroin',
  // Hindi explicit/abusive (transliterated)
  'madarchod','bhenchod','chutiya','saala','kamine','harami','randi','gaandu',
  'bhosdike','loda','lund','chut','bhadwa','kutti','haramzada','kamina',
  'chodu','maa ki','teri maa','bhen ke','gandu','sale','bsdk','mc','bc',
  'fukra','bakwas','jhant','ullu','gadha','kutte'
];

let filterWords = [];

function renderFilterChips() {
  const container = document.getElementById('filter-chips');
  if (!container) return;
  if (filterWords.length === 0) {
    container.innerHTML = '<span style="color:var(--text-muted);font-size:12px;">No words added yet. Add words below or click "Load Defaults".</span>';
    return;
  }
  container.innerHTML = filterWords.map((w, i) => `
    <span class="filter-chip">
      ${w}
      <button class="filter-chip-remove" onclick="removeFilterWord(${i})" title="Remove">&times;</button>
    </span>`).join('');
}

function removeFilterWord(index) {
  filterWords.splice(index, 1);
  renderFilterChips();
}

async function loadWordFilter() {
  const res = await apiFetch('/admin/word-filter');
  if (!res) return;
  const data = await res.json();
  filterWords = data.words ? data.words.split(',').map(w => w.trim()).filter(Boolean) : [];
  renderFilterChips();
}

document.getElementById('btn-add-filter-word')?.addEventListener('click', () => {
  const input = document.getElementById('filter-new-word');
  const val = input.value.trim().toLowerCase();
  if (!val) return;
  if (filterWords.includes(val)) {
    document.getElementById('filter-error').textContent = 'Word already in filter list.';
    return;
  }
  document.getElementById('filter-error').textContent = '';
  filterWords.push(val);
  input.value = '';
  renderFilterChips();
});

document.getElementById('filter-new-word')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btn-add-filter-word').click();
});

document.getElementById('save-word-filter')?.addEventListener('click', async () => {
  const words = filterWords.join(', ');
  const res = await apiFetch('/admin/word-filter', {
    method: 'PUT',
    body: JSON.stringify({ words })
  });
  if (res && res.ok) {
    const d = await res.json();
    showToast(`✅ Word filter saved! (${d.count} words)`, 'success');
    document.getElementById('filter-error').textContent = '';
  } else {
    showToast('Failed to save filter', 'error');
  }
});

document.getElementById('load-default-filter')?.addEventListener('click', () => {
  DEFAULT_FILTER_WORDS.forEach(w => {
    if (!filterWords.includes(w)) filterWords.push(w);
  });
  renderFilterChips();
  showToast(`Loaded ${DEFAULT_FILTER_WORDS.length} default blocked words`, 'info');
});


// ── UI Event Listeners ─────────────────────────────────────

// Login form
document.getElementById('login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  document.getElementById('login-error').textContent = '';
  const result = await login(username, password);
  if (result.error) { document.getElementById('login-error').textContent = result.error; }
  else {
    document.getElementById('user-name-sidebar').textContent = CURRENT_USER.username;
    document.getElementById('user-role-sidebar').textContent = CURRENT_USER.role;
    document.getElementById('user-avatar-sidebar').textContent = CURRENT_USER.username[0].toUpperCase();
    showPage('dashboard');
  }
});

// Nav items
document.querySelectorAll('.nav-item[data-page]').forEach(item => {
  item.addEventListener('click', e => { e.preventDefault(); showPage(item.dataset.page); });
});

document.getElementById('logout-btn').addEventListener('click', logout);

// Modals
document.getElementById('btn-open-upload').addEventListener('click', () => {
  document.getElementById('upload-modal').classList.add('open');
});
document.getElementById('close-upload-modal').addEventListener('click', () => {
  document.getElementById('upload-modal').classList.remove('open');
});
document.getElementById('btn-open-add-user').addEventListener('click', () => {
  document.getElementById('add-user-modal').classList.add('open');
});
document.getElementById('close-user-modal').addEventListener('click', () => {
  document.getElementById('add-user-modal').classList.remove('open');
});
// Close modals on backdrop click
['upload-modal', 'add-user-modal'].forEach(id => {
  document.getElementById(id).addEventListener('click', e => {
    if (e.target.id === id) document.getElementById(id).classList.remove('open');
  });
});

// Tabs
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const targetId = tab.dataset.tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(targetId).classList.add('active');
  });
});

// ── Init ───────────────────────────────────────────────────

async function init() {
  checkServerStatus();
  setInterval(checkServerStatus, 30000);

  if (AUTH_TOKEN) {
    const res = await apiFetch('/auth/me');
    if (res && res.ok) {
      const user = await res.json();
      CURRENT_USER = { id: user.id, username: user.username, role: user.role };
      localStorage.setItem('uni_user', JSON.stringify(CURRENT_USER));

      document.getElementById('user-name-sidebar').textContent = CURRENT_USER.username;
      document.getElementById('user-role-sidebar').textContent = CURRENT_USER.role;
      document.getElementById('user-avatar-sidebar').textContent = CURRENT_USER.username[0].toUpperCase();

      if (CURRENT_USER.role === 'teacher') {
        showPage('knowledge');
      } else {
        showPage('dashboard');
      }
      startInactivityWatcher(); // Resume timer for existing session
    } else {
      logout();
    }
  } else {
    showPage('login');
  }
}

init();
