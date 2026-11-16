/* ═══════════════════════════════════════════
   app.js – Admin Panel Logic
   Handles: Auth, SPA routing, API calls
═══════════════════════════════════════════ */

const API = window.location.origin + '/api';
let AUTH_TOKEN = localStorage.getItem('uni_token');
let CURRENT_USER = JSON.parse(localStorage.getItem('uni_user') || 'null');

// ── Utility ────────────────────────────────────────────────

function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  setTimeout(() => { t.className = 'toast'; }, 3200);
}

function fmt(dateStr) {
  if (!dateStr) return '–';
  return new Date(dateStr).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
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
  CURRENT_USER = { username: data.username, role: data.role };
  localStorage.setItem('uni_token', AUTH_TOKEN);
  localStorage.setItem('uni_user', JSON.stringify(CURRENT_USER));
  return { ok: true };
}

function logout() {
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

  // Hide admin-only nav items for non-admins
  if (CURRENT_USER && name !== 'login') {
    const isAdmin = CURRENT_USER.role === 'admin';
    const navUsers = document.getElementById('nav-users');
    const navLogs = document.getElementById('nav-logs');
    const navSettings = document.getElementById('nav-settings');
    if (navUsers) navUsers.style.display = isAdmin ? '' : 'none';
    if (navLogs) navLogs.style.display = isAdmin ? '' : 'none';
    if (navSettings) navSettings.style.display = isAdmin ? '' : 'none';
  }

  if (name === 'dashboard') loadDashboard();
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

// ── Dashboard ──────────────────────────────────────────────

async function loadDashboard() {
  const logsRes = await apiFetch('/admin/logs?limit=100');
  const knRes   = await apiFetch('/knowledge');
  if (!logsRes || !knRes) return;

  const logs = await logsRes.json();
  const kn   = await knRes.json();

  const total    = Array.isArray(logs) ? logs.length : 0;
  const rejected = Array.isArray(logs) ? logs.filter(l => l.was_rejected).length : 0;

  document.getElementById('stat-total-chats').textContent = total;
  document.getElementById('stat-knowledge').textContent   = Array.isArray(kn) ? kn.length : 0;
  document.getElementById('stat-answered').textContent    = total - rejected;
  document.getElementById('stat-rejected').textContent    = rejected;

  const tbody = document.getElementById('recent-logs-body');
  const recent = Array.isArray(logs) ? logs.slice(0, 10) : [];
  tbody.innerHTML = recent.length === 0
    ? '<tr><td colspan="4" class="empty-state">No conversations yet.</td></tr>'
    : recent.map(l => `
      <tr>
        <td title="${l.question}">${truncate(l.question, 50)}</td>
        <td title="${l.answer}">${truncate(l.answer, 60)}</td>
        <td>${l.sources_used || '–'}</td>
        <td>${fmt(l.timestamp)}</td>
      </tr>`).join('');
}

// ── Knowledge Base ─────────────────────────────────────────

async function loadKnowledge() {
  const res = await apiFetch('/knowledge');
  if (!res) return;
  const sources = await res.json();
  const tbody = document.getElementById('knowledge-body');

  if (!Array.isArray(sources) || sources.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No knowledge sources yet. Add your first one!</td></tr>';
    return;
  }

  tbody.innerHTML = sources.map(s => `
    <tr>
      <td><strong>${s.name}</strong><br/><small style="color:var(--text-muted)">${s.description || ''}</small></td>
      <td><span class="badge badge-user">${s.source_type}</span></td>
      <td>${s.chunk_count} chunks</td>
      <td>${fmt(s.uploaded_at)}</td>
      <td><button class="btn btn-sm btn-danger" onclick="deleteKnowledge(${s.id}, '${s.name.replace(/'/g, "\\'")}')">Delete</button></td>
    </tr>`).join('');
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
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No users found.</td></tr>';
    return;
  }

  tbody.innerHTML = users.map(u => `
    <tr>
      <td><strong>${u.username}</strong></td>
      <td>${u.full_name || '–'}</td>
      <td><span class="badge badge-${u.role}">${u.role}</span></td>
      <td><span class="badge badge-${u.is_active ? 'active' : 'inactive'}">${u.is_active ? 'Active' : 'Inactive'}</span></td>
      <td>${fmt(u.created_at)}</td>
      <td>${u.username !== CURRENT_USER?.username
        ? `<button class="btn btn-sm btn-danger" onclick="deactivateUser(${u.id}, '${u.username}')">Deactivate</button>`
        : '<span style="color:var(--text-muted);font-size:12px">You</span>'
      }</td>
    </tr>`).join('');
}

async function deactivateUser(id, username) {
  if (!confirm(`Deactivate user "${username}"?`)) return;
  const res = await apiFetch(`/admin/users/${id}`, { method: 'DELETE' });
  if (res && res.ok) { showToast(`User "${username}" deactivated`, 'success'); loadUsers(); }
  else if (res) { const e = await res.json(); showToast(e.detail || 'Failed', 'error'); }
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

async function loadLogs() {
  const res = await apiFetch('/admin/logs?limit=100');
  if (!res) return;
  const logs = await res.json();
  const tbody = document.getElementById('logs-body');

  if (!Array.isArray(logs) || logs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No conversations logged yet.</td></tr>';
    return;
  }

  tbody.innerHTML = logs.map(l => `
    <tr>
      <td title="${l.question}">${truncate(l.question, 55)}</td>
      <td title="${l.answer}">${truncate(l.answer, 70)}</td>
      <td>${l.sources_used || '–'}</td>
      <td><span class="badge badge-${l.was_rejected ? 'rejected' : 'answered'}">${l.was_rejected ? 'Rejected' : 'Answered'}</span></td>
      <td>${fmt(l.timestamp)}</td>
    </tr>`).join('');
}

// ── Settings ───────────────────────────────────────────────

async function loadSettings() {
  const res = await apiFetch('/admin/config');
  if (!res) return;
  const cfg = await res.json();
  document.getElementById('setting-system-prompt').value = cfg.system_prompt || '';
  document.getElementById('setting-uni-name').value      = cfg.university_name || '';
  document.getElementById('setting-max-chunks').value    = cfg.max_context_chunks || '5';
  document.getElementById('setting-web-search').value    = cfg.web_search_enabled || 'false';
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

function init() {
  checkServerStatus();
  setInterval(checkServerStatus, 30000);

  if (AUTH_TOKEN && CURRENT_USER) {
    document.getElementById('user-name-sidebar').textContent = CURRENT_USER.username;
    document.getElementById('user-role-sidebar').textContent = CURRENT_USER.role;
    document.getElementById('user-avatar-sidebar').textContent = CURRENT_USER.username[0].toUpperCase();
    showPage('dashboard');
  } else {
    showPage('login');
  }
}

init();
