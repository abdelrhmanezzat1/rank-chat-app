const ME_ID = parseInt(document.body.dataset.meId, 10);
const ME_NAME = document.body.dataset.meName;

const ICONS = {
  crown:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 8l4 3 5-6 5 6 4-3-2 10H5L3 8z"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z"/></svg>',
  gem:    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 3h12l4 6-10 12L2 9l4-6z"/></svg>',
  star:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 6.5 7 .8-5.2 4.8 1.4 7-6.2-3.6L5.8 21l1.4-7L2 9.3l7-.8L12 2z"/></svg>',
  user:   '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/></svg>',
  wrench: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
  trophy: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 9V2h12v7a6 6 0 0 1-12 0z"/><path d="M4 15h16v2a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-2z"/><path d="M10 2v3M14 2v3"/></svg>',
  medal:  '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="16" r="6"/><path d="M8 2l4 8 4-8"/></svg>',
  award:  '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="6"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/></svg>',
};

const NOTIF_ICONS = {
  message: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  gift:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M12 8v12"/><path d="M5 8c0-2.2 1.8-4 4-4h6c2.2 0 4 1.8 4 4"/><path d="M5 8h14"/></svg>',
  follow:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M5 20c0-4 3.5-7 7-7s7 3 7 7"/></svg>',
  mic:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 19v3"/></svg>',
  bell:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
};

const MOD_ICONS = {
  mute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="3" y1="3" x2="21" y2="21"/></svg>',
  kick: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M9 22V12h6"/><path d="M22 12L12 2 2 12"/></svg>',
  ban:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>',
  warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
};

const RANK_ICONS = {
  owner:'crown', admin:'shield', manager:'wrench', diamond:'gem', gold:'trophy',
  silver:'medal', bronze:'award', 'golden-blue':'star', normal:'user',
};

const COIN_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M8 10h8M9 14h6"/></svg>';

const RANK_ORDER = ['owner','admin','diamond','gold','silver','bronze','member'];

/* ===== Animated Background ===== */
function initBackground(){
  // Layer 1: Twinkling stars
  const starsEl = document.getElementById('bg-stars');
  if (starsEl) {
    for (let i = 0; i < 55; i++){
      const s = document.createElement('div');
      s.className = 'bg-star';
      s.style.left = Math.random() * 100 + '%';
      s.style.top = Math.random() * 100 + '%';
      s.style.setProperty('--tw-dur', (2 + Math.random() * 3) + 's');
      s.style.setProperty('--tw-delay', (Math.random() * 5) + 's');
      starsEl.appendChild(s);
    }
  }

  // Layer 2: Drifting glow orbs
  const orbsEl = document.getElementById('bg-orbs');
  if (orbsEl) {
    const orbSizes = [160, 200, 140, 240];
    for (let i = 0; i < 4; i++){
      const o = document.createElement('div');
      o.className = 'bg-orb';
      const size = orbSizes[i];
      o.style.width = size + 'px';
      o.style.height = size + 'px';
      o.style.left = (10 + Math.random() * 70) + '%';
      o.style.top = (10 + Math.random() * 70) + '%';
      o.style.background = `radial-gradient(circle, var(--orb-${i+1}), transparent 70%)`;
      o.style.setProperty('--orb-dur', (14 + Math.random() * 8) + 's');
      o.style.setProperty('--orb-delay', (Math.random() * 6) + 's');
      o.style.setProperty('--orb-dx', (20 + Math.random() * 40) + 'px');
      o.style.setProperty('--orb-dy', (15 + Math.random() * 30) + 'px');
      o.style.setProperty('--orb-scale', (0.8 + Math.random() * 0.6).toFixed(2));
      orbsEl.appendChild(o);
    }
  }

  // Layer 3: Rising particles
  const partEl = document.getElementById('bg-particles');
  if (partEl) {
    const colors = ['var(--orb-1)','var(--orb-2)','var(--orb-3)','var(--orb-4)'];
    for (let i = 0; i < 25; i++){
      const p = document.createElement('div');
      p.className = 'bg-particle';
      p.style.setProperty('--p-size', (2 + Math.random() * 3) + 'px');
      p.style.setProperty('--p-color', colors[Math.floor(Math.random() * colors.length)]);
      p.style.setProperty('--p-x', (Math.random() * 100) + '%');
      p.style.setProperty('--p-dur', (8 + Math.random() * 10) + 's');
      p.style.setProperty('--p-delay', (Math.random() * 12) + 's');
      p.style.setProperty('--p-drift', (Math.random() * 60 - 30) + 'px');
      partEl.appendChild(p);
    }
  }

  // Layer 4: Occasional shooting stars
  const metEl = document.getElementById('bg-meteors');
  if (metEl) {
    for (let i = 0; i < 3; i++){
      const m = document.createElement('div');
      m.className = 'bg-meteor';
      m.style.setProperty('--m-w', (60 + Math.random() * 80) + 'px');
      m.style.setProperty('--m-top', (5 + Math.random() * 25) + '%');
      m.style.setProperty('--m-left', (10 + Math.random() * 60) + '%');
      m.style.setProperty('--m-dur', (1.5 + Math.random() * 1.5) + 's');
      m.style.setProperty('--m-delay', (3 + Math.random() * 8 + i * 5) + 's');
      m.style.setProperty('--m-angle', (-25 - Math.random() * 15) + 'deg');
      m.style.setProperty('--m-dist', (200 + Math.random() * 150) + 'px');
      m.style.setProperty('--m-fall', (80 + Math.random() * 60) + 'px');
      metEl.appendChild(m);
    }
  }
}

/* ===== Theme System ===== */
function initTheme(){
  const saved = localStorage.getItem('chat-theme') || 'night';
  applyTheme(saved);
}

function applyTheme(theme){
  document.body.classList.remove('theme-night','theme-purple','theme-aurora');
  if (theme === 'purple') document.body.classList.add('theme-purple');
  else if (theme === 'aurora') document.body.classList.add('theme-aurora');
  else document.body.classList.add('theme-night');
  document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === theme));
  localStorage.setItem('chat-theme', theme);
}

document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
});

initBackground();
initTheme();

let currentFilter = 'all';
let currentTab = 'members';
let searchTerm = '';
let usersCache = [];
let activeConversation = null;
let activePollTimer = null;
let collapsedSections = new Set();

function initials(name){ return name.trim().split(/\s+/).map(w => w[0]).join('').slice(0,2); }

/* ===== Toast Notifications ===== */
function showToast(msg, type = 'info', duration = 3000){
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ===== Skeleton Loader ===== */
function skeleton(rows = 3){
  return `<div style="padding:16px">${Array(rows).fill('<div class="skeleton skeleton-text"></div>').join('')}<div class="skeleton skeleton-text short"></div></div>`;
}

async function api(path, opts = {}) {
  const res = await fetch(`api/${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts
  });
  if (res.status === 401) { window.location.href = 'login.php'; throw new Error('unauthorized'); }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'error');
  return data;
}

/* ===== Heartbeat ===== */
async function heartbeat(){
  try {
    await api('heartbeat.php');
    checkNotifications();
  } catch(e){ console.error('[Heartbeat] failed:', e); }
}
heartbeat();

/* ===== Notifications ===== */
let notifPanelOpen = false;

document.getElementById('notif-bell').addEventListener('click', toggleNotifPanel);
document.getElementById('notif-mark-all').addEventListener('click', markAllRead);

function toggleNotifPanel(){
  const panel = document.getElementById('notif-panel');
  if (panel.classList.contains('open')) {
    panel.classList.remove('open');
    notifPanelOpen = false;
  } else {
    panel.classList.add('open');
    notifPanelOpen = true;
    loadNotifications();
  }
}

async function checkNotifications(){
  try {
    const res = await api('notifications.php?action=count');
    const badge = document.getElementById('notif-badge');
    if (res.count > 0) {
      badge.textContent = res.count > 99 ? '99+' : res.count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  } catch(e){}
}

async function loadNotifications(){
  const list = document.getElementById('notif-list');
  try {
    const res = await api('notifications.php');
    if (res.notifications.length === 0) {
      list.innerHTML = '<div class="notif-empty">مفيش إشعارات</div>';
      return;
    }
    list.innerHTML = '';
    res.notifications.forEach(n => {
      const div = document.createElement('div');
      div.className = 'notif-item' + (n.is_read == 0 ? ' unread' : '');

      const icons = NOTIF_ICONS;
      const icon = icons[n.type] || icons.bell;
      const timeAgo = timeSince(new Date(n.created_at));

      div.innerHTML = `
        <div class="notif-icon" style="color:${n.type === 'gift' ? 'var(--gold)' : n.type === 'follow' ? 'var(--admin)' : n.type === 'mic' ? '#3CCB6F' : 'var(--muted)'}">${icon}</div>
        <div class="notif-body">
          <div class="notif-title">${esc(n.title)}</div>
          <div class="notif-text">${esc(n.body || '')}</div>
          <div class="notif-time">${timeAgo}</div>
        </div>
      `;
      div.addEventListener('click', () => {
        if (n.is_read == 0) {
          api('notifications.php', { method:'POST', body: JSON.stringify({ action:'read', id:n.id }) });
          div.classList.remove('unread');
          checkNotifications();
        }
        // Navigate based on type
        if (n.type === 'message' && n.reference_type === 'conversation') {
          // Could open the chat - for now just close panel
          document.getElementById('notif-panel').classList.remove('open');
        } else if (n.type === 'follow' && n.from_user_id) {
          openProfile(n.from_user_id);
          document.getElementById('notif-panel').classList.remove('open');
        } else if (n.type === 'gift' && n.from_user_id) {
          openProfile(n.from_user_id);
          document.getElementById('notif-panel').classList.remove('open');
        }
      });
      list.appendChild(div);
    });
  } catch(e){
    list.innerHTML = '<div class="notif-empty">حدث خطأ</div>';
  }
}

async function markAllRead(){
  try {
    await api('notifications.php', { method:'POST', body: JSON.stringify({ action:'read_all' }) });
    checkNotifications();
    loadNotifications();
  } catch(e){}
}

function timeSince(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'الآن';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `${days} يوم`;
}

/* ===== Mod Menu ===== */
const ME_RANK = document.body.dataset.meRank || 'normal';

document.getElementById('mod-menu-close').addEventListener('click', closeModMenu);
document.getElementById('mod-overlay').addEventListener('click', closeModMenu);

function closeModMenu(){
  document.getElementById('mod-menu').classList.remove('open');
  document.getElementById('mod-overlay').classList.remove('open');
}

function openModMenu(userId, username, rankKey){
  document.getElementById('mod-menu-title').textContent = 'إدارة: ' + username;
  const items = document.getElementById('mod-menu-items');
  items.innerHTML = '';

  const canMute = ['owner','admin','manager'].includes(ME_RANK);
  const canBan = ['owner','admin'].includes(ME_RANK);
  const isTarget = rankKey === 'owner' || rankKey === 'admin';

  if (canMute && !isTarget) {
    items.innerHTML += `
      <div class="mod-menu-item" onclick="modAction('mute', ${userId}, '${esc(username)}', 30)">
        <span class="mod-icon">${MOD_ICONS.mute}</span> كتم 30 دقيقة
      </div>
      <div class="mod-menu-item" onclick="modAction('mute', ${userId}, '${esc(username)}', 60)">
        <span class="mod-icon">${MOD_ICONS.mute}</span> كتم ساعة
      </div>
      <div class="mod-menu-item" onclick="modAction('kick', ${userId}, '${esc(username)}')">
        <span class="mod-icon">${MOD_ICONS.kick}</span> طرد
      </div>
    `;
  }
  if (canBan && !isTarget) {
    items.innerHTML += `
      <div class="mod-menu-item danger" onclick="modAction('ban', ${userId}, '${esc(username)}')">
        <span class="mod-icon">${MOD_ICONS.ban}</span> حظر
      </div>
    `;
  }

  if (items.innerHTML === '') {
    items.innerHTML = '<div class="mod-menu-item" style="color:var(--muted)">مفيش إجراءات متاحة</div>';
  }

  document.getElementById('mod-menu').classList.add('open');
  document.getElementById('mod-overlay').classList.add('open');
}

async function modAction(action, userId, username, duration){
  const reason = prompt(`سبب ${action === 'mute' ? 'الكتم' : action === 'kick' ? 'الطرد' : 'الحظر'} ${username}:`);
  if (reason === null) return;

  try {
    const body = { user_id: userId, reason: reason || 'بدون سبب' };
    if (action === 'mute') body.duration_minutes = duration || 30;
    await api(`${action}.php`, { method:'POST', body: JSON.stringify(body) });
    closeModMenu();
    loadUsers();
  } catch(e){ alert(e.message); }
}

/* ===== Admin Panel ===== */
let adminTab = 'stats';

document.getElementById('admin-back').addEventListener('click', () => document.getElementById('admin-screen').classList.remove('open'));

const adminBtn = document.getElementById('admin-btn');
if (adminBtn) {
  adminBtn.addEventListener('click', openAdminPanel);
}

document.querySelectorAll('[data-admin-tab]').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('[data-admin-tab]').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    adminTab = tab.dataset.adminTab;
    loadAdminTab();
  });
});

async function openAdminPanel(){
  document.getElementById('admin-screen').classList.add('open');
  loadAdminTab();
}

async function loadAdminTab(){
  const content = document.getElementById('admin-content');
  content.innerHTML = '<div class="loading-hint">جاري التحميل…</div>';

  try {
    const data = await api(`admin_panel.php?tab=${adminTab}`);
    if (adminTab === 'stats') renderAdminStats(data, content);
    else if (adminTab === 'users') renderAdminUsers(data, content);
    else if (adminTab === 'reports') renderAdminReports(data, content);
    else if (adminTab === 'mod_log') renderAdminModLog(data, content);
  } catch(e){
    content.innerHTML = '<div class="loading-hint">حدث خطأ</div>';
  }
}

function renderAdminStats(data, el){
  el.innerHTML = `
    <div class="admin-stats">
      <div class="admin-stat"><div class="stat-val">${data.total_users}</div><div class="stat-label">أعضاء</div></div>
      <div class="admin-stat"><div class="stat-val">${data.online_users}</div><div class="stat-label">متصل</div></div>
      <div class="admin-stat"><div class="stat-val">${data.mic_sessions}</div><div class="stat-label">على المايك</div></div>
      <div class="admin-stat"><div class="stat-val">${data.total_messages}</div><div class="stat-label">رسائل</div></div>
      <div class="admin-stat"><div class="stat-val">${data.messages_24h}</div><div class="stat-label">رسائل (24 ساعة)</div></div>
      <div class="admin-stat"><div class="stat-val">${data.total_gifts}</div><div class="stat-label">هدايا</div></div>
      <div class="admin-stat"><div class="stat-val">${data.total_coins_earned}</div><div class="stat-label">كوينز مكتسبة</div></div>
      <div class="admin-stat"><div class="stat-val">${data.total_coins_spent}</div><div class="stat-label">كوينز منفقة</div></div>
      <div class="admin-stat"><div class="stat-val">${data.pending_reports}</div><div class="stat-label">بلاغات معلقة</div></div>
    </div>
    <h3 style="font-size:13px;color:var(--text);margin-bottom:8px;">توزيع الرتب</h3>
    ${data.rank_distribution.map(r => `
      <div class="admin-rank-bar">
        <div class="rank-color" style="background:${r.color_hex}"></div>
        <div class="rank-name">${esc(r.label)}</div>
        <div class="rank-count">${r.cnt}</div>
      </div>
    `).join('')}
  `;
}

function renderAdminUsers(data, el){
  const ranks = ['owner','admin','manager','diamond','gold','silver','bronze','golden-blue','member'];
  const rankLabels = {owner:'المالك',admin:'مدير عام',manager:'مدير',diamond:'الماس',gold:'ذهبي',silver:'فضي',bronze:'برونزي','golden-blue':'ذهبي أزرق',member:'عضو'};

  el.innerHTML = `
    <div style="margin-bottom:12px;">
      <input type="text" id="admin-user-search" placeholder="بحث بالاسم…" style="width:100%;padding:8px 12px;background:var(--panel-2);border:1px solid var(--line);border-radius:10px;color:var(--text);font-size:13px;">
    </div>
    <div id="admin-user-list">
      ${data.users.map(u => `
        <div class="admin-user-row">
          <div class="au-name">${esc(u.username)} ${u.is_online == 1 ? '<svg viewBox="0 0 24 24" fill="#3CCB6F" width="10" height="10" style="vertical-align:middle"><circle cx="12" cy="12" r="6"/></svg>' : ''} ${u.is_muted == 1 ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10" style="vertical-align:middle"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="3" y1="3" x2="21" y2="21"/></svg>' : ''}</div>
          <div class="au-rank" style="background:${u.color_hex}22;color:${u.color_hex}">${esc(u.rank_label)}</div>
          ${ME_RANK === 'owner' ? `
          <select onchange="changeRank(${u.id}, this.value)">
            ${ranks.map(r => `<option value="${r}" ${u.rank_key === r ? 'selected' : ''}>${rankLabels[r]}</option>`).join('')}
          </select>` : ''}
        </div>
      `).join('')}
    </div>
  `;

  document.getElementById('admin-user-search').addEventListener('input', async (e) => {
    const search = e.target.value;
    const res = await api(`admin_panel.php?tab=users&search=${encodeURIComponent(search)}`);
    renderAdminUsers(res, el);
  });
}

async function changeRank(userId, rank){
  try {
    await api('admin_rank.php', { method:'POST', body: JSON.stringify({ user_id: userId, rank }) });
    loadAdminTab();
  } catch(e){ alert(e.message); }
}

function renderAdminReports(data, el){
  if (data.length === 0) {
    el.innerHTML = '<div class="loading-hint">مفيش بلاغات</div>';
    return;
  }
  el.innerHTML = data.map(r => `
    <div class="admin-report-row">
      <div class="ar-header">
        <span class="ar-users">${esc(r.reporter_name)} بلّغ عن ${esc(r.reported_name)}</span>
        <span class="ar-time">${timeSince(new Date(r.created_at))}</span>
      </div>
      <div class="ar-reason">${esc(r.reason)}</div>
      <div style="font-size:10px;color:var(--muted-2);margin-top:2px;">الحالة: ${r.status}</div>
      ${r.status === 'pending' ? `
      <div class="ar-actions">
        <button class="ar-dismiss" onclick="handleReport(${r.id}, 'dismiss_report')">تجاهل</button>
        <button class="ar-action" onclick="handleReport(${r.id}, 'action_report')">اتخذ إجراء</button>
      </div>` : ''}
    </div>
  `).join('');
}

async function handleReport(reportId, action){
  try {
    await api('admin_panel.php', { method:'POST', body: JSON.stringify({ action, report_id: reportId }) });
    loadAdminTab();
  } catch(e){ alert(e.message); }
}

function renderAdminModLog(data, el){
  if (data.length === 0) {
    el.innerHTML = '<div class="loading-hint">مفيش إجراءات</div>';
    return;
  }
  el.innerHTML = data.map(l => `
    <div class="admin-modlog-row">
      <span class="ml-action ${l.action}">${l.action}</span>
      <span style="flex:1;color:var(--text)">${esc(l.moderator_name)} → ${esc(l.target_name)}</span>
      <span>${timeSince(new Date(l.created_at))}</span>
    </div>
  `).join('');
}

/* ===== Users list ===== */
async function loadUsers(){
  try {
    const filterParam = currentTab === 'voice' ? 'voice' : (currentFilter === 'online' ? 'online' : 'all');
    usersCache = await api(`users.php?search=${encodeURIComponent(searchTerm)}&filter=${filterParam}`);
    renderList();
  } catch(e){ console.error('[Users] load failed:', e); }
}

function renderList(){
  const container = document.getElementById('rank-list');

  const totalOnline = usersCache.filter(u => u.is_online == 1).length;
  document.getElementById('online-count').textContent = totalOnline;

  if (usersCache.length === 0) {
    container.innerHTML = '<div class="loading-hint">مفيش نتائج</div>';
    return;
  }

  // Group by rank
  const groups = {};
  usersCache.forEach(u => {
    if (!groups[u.rank_key]) groups[u.rank_key] = [];
    groups[u.rank_key].push(u);
  });

  container.innerHTML = '';

  RANK_ORDER.forEach(rankKey => {
    const members = groups[rankKey];
    if (!members || members.length === 0) return;

    const rankColor = members[0].color_hex;
    const rankIcon = members[0].icon;
    const rankLabel = members[0].rank_label;
    const isCollapsed = collapsedSections.has(rankKey);

    const section = document.createElement('div');
    section.className = 'rank-section' + (isCollapsed ? ' collapsed' : '');

    // Section header
    const header = document.createElement('div');
    header.className = 'rank-section-header';
    header.innerHTML = `
      <div class="rank-icon-lg" style="background:${esc(rankColor)}; color:#0D1220">
        ${ICONS[rankIcon] || ICONS.user}
      </div>
      <span class="rank-label" style="color:${esc(rankColor)}">${esc(rankLabel)}</span>
      <span class="rank-count">${members.length}</span>
      <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M6 9l6 6 6-6"/>
      </svg>
    `;
    header.addEventListener('click', () => {
      if (isCollapsed) collapsedSections.delete(rankKey);
      else collapsedSections.add(rankKey);
      section.classList.toggle('collapsed');
    });
    section.appendChild(header);

    // User rows
    const body = document.createElement('div');
    body.className = 'rank-section-body';

    members.sort((a,b) => b.is_online - a.is_online).forEach(u => {
      const row = document.createElement('div');
      row.className = 'user-row';

      // Determine border colors: user's custom row_border > frame row colors
      const rbFrom = u.row_border_from || u.frame_row_from || null;
      const rbTo = u.row_border_to || u.frame_row_to || null;
      const hasBorder = rbFrom && rbTo && (rbFrom !== '#1A2338');
      const glowActive = u.row_border_glow == 1;

      if (hasBorder) {
        row.classList.add('has-frame-border');
        if (glowActive) row.classList.add('glow-active');
        row.style.setProperty('--rb-from', rbFrom);
        row.style.setProperty('--rb-to', rbTo);
        row.style.setProperty('--rb-glow', rbFrom);
        row.style.borderColor = rbFrom;
        // Create a subtle border glow via box-shadow
        row.style.boxShadow = `0 0 8px -2px ${rbFrom}40`;
      }

      // Frame color for avatar ring
      const frameColor = u.frame_from || rankColor;

      // Build name row: rank icon + username
      const rankIconHtml = `<span class="rank-icon-inline" style="background:${esc(rankColor)}; color:#0D1220">${ICONS[rankIcon] || ICONS.user}</span>`;
      const nameClass = u.animated_name == 1 ? ' user-name animated' : ' user-name';
      const nameStyle = u.animated_name == 1
        ? `style="--ng-from:${esc(u.name_gradient_from || rankColor)}; --ng-to:${esc(u.name_gradient_to || rankColor)}"`
        : `style="color:${esc(rankColor)}"`;
      const levelHtml = u.level > 1 ? `<span class="user-level">Lv.${u.level}</span>` : '';

      row.innerHTML = `
        <div class="avatar-wrap">
          <div class="avatar" style="--f-from:${esc(u.frame_from || '#1A2338')};--f-to:${esc(u.frame_to || '#1A2338')};--frame-color:${esc(frameColor)}">${initials(u.username)}</div>
          ${u.is_online == 1 ? '<span class="online-dot"></span>' : ''}
          ${u.on_mic > 0 ? `<span class="mic-live-dot">${micSvg()}</span>` : ''}
        </div>
        <div class="user-info">
          <div class="user-name-row">
            ${rankIconHtml}
            <span class="${nameClass}" ${nameStyle}>${esc(u.username)}</span>
            ${levelHtml}
          </div>
          <div class="user-sub">${u.is_online == 1 ? (u.on_mic > 0 ? `<span style="display:inline-flex;width:12px;height:12px;vertical-align:middle;margin-inline-start:2px">${NOTIF_ICONS.mic}</span> على المايك` : 'متصل الآن') : 'غير متصل'}</div>
        </div>
        <button class="user-profile-btn" onclick="event.stopPropagation(); openProfile(${u.id})" title="عرض البروفايل">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M5 20c0-4 3.5-7 7-7s7 3 7 7"/></svg>
        </button>
        ${ME_RANK === 'owner' || ME_RANK === 'admin' || ME_RANK === 'manager' ? `
        <button class="user-mod-btn" onclick="event.stopPropagation(); openModMenu(${u.id}, '${esc(u.username)}', '${u.rank_key}')" title="إدارة">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </button>` : ''}
      `;
      row.addEventListener('click', () => openChat(u, rankColor));
      body.appendChild(row);
    });

    section.appendChild(body);
    container.appendChild(section);
  });
}

function micSvg(){ return '<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/></svg>'; }
function esc(s){ const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

/* ===== Tab switching ===== */
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    loadUsers();
  });
});

// Sub-tab switching (Members / Voice / Top / Search)
document.querySelectorAll('.sub-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentTab = tab.dataset.tab;

    const searchBox = document.querySelector('.search');
    if (currentTab === 'search') {
      searchBox.style.display = 'block';
      document.getElementById('search-input').focus();
    } else {
      searchBox.style.display = 'none';
      searchTerm = '';
      document.getElementById('search-input').value = '';
    }
    loadUsers();
  });
});

document.getElementById('search-input').addEventListener('input', e => {
  searchTerm = e.target.value.trim();
  clearTimeout(document.getElementById('search-input')._debounce);
  document.getElementById('search-input')._debounce = setTimeout(loadUsers, 300);
});

/* ===== Chat screen ===== */
async function openChat(user, rankColor){
  document.getElementById('chat-avatar').textContent = initials(user.username);
  document.getElementById('chat-avatar').style.borderColor = rankColor;
  document.getElementById('chat-name').textContent = user.username;
  document.getElementById('chat-status').textContent = user.is_online == 1 ? 'متصل الآن' : 'غير متصل';
  document.getElementById('chat-body').innerHTML = skeleton(5);
  document.getElementById('chat-screen').classList.add('open');

  try {
    const data = await api(`conversation.php?with=${user.id}`);
    activeConversation = { id: data.conversation_id, otherId: user.id, lastId: 0 };
    renderMessages(data.messages);
    activeConversation.lastId = data.messages.length ? data.messages[data.messages.length - 1].id : 0;
    startPolling();
  } catch(e) {
    document.getElementById('chat-body').innerHTML = '<div class="loading-hint">تعذر تحميل المحادثة</div>';
  }
}

function renderMessages(messages){
  const body = document.getElementById('chat-body');
  body.innerHTML = '';
  if (messages.length === 0) {
    body.innerHTML = '<div class="loading-hint">مفيش رسائل لسه، ابدأ المحادثة</div>';
    return;
  }
  messages.forEach(m => appendBubble(m));
  body.scrollTop = body.scrollHeight;
}

function appendBubble(m){
  const body = document.getElementById('chat-body');
  const bubble = document.createElement('div');
  let classes = 'bubble ' + (m.sender_id == ME_ID ? 'out' : 'in');
  if (m.effect_css) classes += ' ' + m.effect_css;
  bubble.className = classes;

  let html = m.content;
  if (m.sender_id != ME_ID) {
    html += `<button class="bubble-report-btn" onclick="event.stopPropagation(); reportUser(${m.sender_id}, ${m.id || 0})" title="الإبلاغ">${MOD_ICONS.warn}</button>`;
  }
  bubble.innerHTML = html;
  body.appendChild(bubble);
  body.scrollTop = body.scrollHeight;
}

function reportUser(userId, messageId){
  const reason = prompt('سبب الإبلاغ:');
  if (reason === null || reason.trim() === '') return;
  api('report.php', { method:'POST', body: JSON.stringify({ reported_id: userId, message_id: messageId, reason }) })
    .then(() => showToast('تم الإبلاغ بنجاح', 'success'))
    .catch(e => showToast(e.message, 'error'));
}

function startPolling(){
  stopPolling();
  activePollTimer = setInterval(async () => {
    if (!activeConversation) return;
    try {
      const newMsgs = await api(`messages_poll.php?conversation_id=${activeConversation.id}&after_id=${activeConversation.lastId}`);
      if (newMsgs.length) {
        const wasEmpty = document.getElementById('chat-body').querySelector('.loading-hint');
        if (wasEmpty) document.getElementById('chat-body').innerHTML = '';
        newMsgs.forEach(m => appendBubble(m));
        activeConversation.lastId = newMsgs[newMsgs.length - 1].id;
      }
    } catch(e){}
  }, 2500);
}
function stopPolling(){ if (activePollTimer) clearInterval(activePollTimer); activePollTimer = null; }

document.getElementById('chat-back').addEventListener('click', () => {
  document.getElementById('chat-screen').classList.remove('open');
  activeConversation = null;
  stopPolling();
  closeGiftPanel();
});

/* ===== Gift Panel ===== */
let giftsData = [];

document.getElementById('chat-gift-btn').addEventListener('click', toggleGiftPanel);
document.getElementById('gift-panel-close').addEventListener('click', closeGiftPanel);

function toggleGiftPanel(){
  const panel = document.getElementById('gift-panel');
  if (panel.classList.contains('open')) {
    closeGiftPanel();
  } else {
    openGiftPanel();
  }
}

function closeGiftPanel(){
  document.getElementById('gift-panel').classList.remove('open');
}

async function openGiftPanel(){
  const panel = document.getElementById('gift-panel');
  panel.classList.add('open');

  // Load gifts
  try {
    const res = await fetch('api/gifts.php');
    giftsData = await res.json();
  } catch(e){
    giftsData = [];
  }

  // Load user balance
  try {
    const me = await api('me.php');
    document.getElementById('gift-balance').textContent = `رصيدك: ${me.coins} ${COIN_SVG}`;
  } catch(e){}

  renderGifts();
}

function renderGifts(){
  const list = document.getElementById('gift-list');
  list.innerHTML = '';

  giftsData.forEach(g => {
    const div = document.createElement('div');
    div.className = `gift-item ${g.rarity}`;
    div.innerHTML = `
      <div class="gift-icon">${GIFT_ICONS[g.icon] || g.icon}</div>
      <div class="gift-name">${esc(g.name)}</div>
      <div class="gift-price">${g.price} ${COIN_SVG}</div>
    `;
    div.addEventListener('click', () => sendGift(g));
    list.appendChild(div);
  });
}

async function sendGift(gift){
  if (!activeConversation) return;
  const receiverId = activeConversation.user_id;

  try {
    await api('send_gift.php', {
      method: 'POST',
      body: JSON.stringify({
        gift_id: gift.id,
        receiver_id: receiverId,
      })
    });
    const me = await api('me.php');
    document.getElementById('my-coins').textContent = `${me.coins} ${COIN_SVG}`;
    document.getElementById('gift-balance').textContent = `رصيدك: ${me.coins} ${COIN_SVG}`;
    closeGiftPanel();
    showToast(`تم إرسال ${gift.icon} ${gift.name}`, 'success');
  } catch(e){
    showToast(e.message, 'error');
  }
}

document.getElementById('chat-send').addEventListener('click', sendMessage);
document.getElementById('chat-input').addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

let selectedEffectId = null;
let myEffects = [];

async function sendMessage(){
  const input = document.getElementById('chat-input');
  const content = input.value.trim();
  if (!content || !activeConversation) return;
  input.value = '';
  try {
    const body = { conversation_id: activeConversation.id, content };
    if (selectedEffectId) body.effect_id = selectedEffectId;
    const res = await api('send_message.php', { method: 'POST', body: JSON.stringify(body) });
    appendBubble({ sender_id: ME_ID, content, effect_id: selectedEffectId, effect_css: myEffects.find(e => e.id == selectedEffectId)?.css_class });
    activeConversation.lastId = res.id;
    // Reset effect after sending
    selectedEffectId = null;
    document.querySelectorAll('.effect-chip').forEach(c => c.classList.remove('active'));
    document.getElementById('effect-selector').classList.remove('open');
  } catch(e){}
}

/* ===== Effect Selector ===== */
document.getElementById('chat-effect-btn').addEventListener('click', toggleEffectSelector);

function toggleEffectSelector(){
  const sel = document.getElementById('effect-selector');
  if (sel.classList.contains('open')) {
    sel.classList.remove('open');
  } else {
    sel.classList.add('open');
    loadEffects();
  }
}

async function loadEffects(){
  try {
    myEffects = await api('effects.php');
    renderEffects();
  } catch(e){}
}

const EFFECT_ICONS = {
  '🔥': '<svg viewBox="0 0 24 24" fill="currentColor" style="color:#FF5C7A"><path d="M12 23c-4.97 0-8-3.58-8-8 0-4.5 3.5-8.5 6-11 .5-.5 1.5.1 1.4.7-.2 1.2.8 2.3 2 2.3.4 0 .7-.3.7-.7 0-.5.4-.8.8-.5C17.5 9.5 20 13 20 15c0 4.42-3.03 8-8 8z"/></svg>',
  '✨': '<svg viewBox="0 0 24 24" fill="currentColor" style="color:#FFC94A"><path d="M12 2l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z"/></svg>',
  '🌧': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#4A9EFF"><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/><path d="M8 19v2M8 13v2M16 19v2M16 13v2M12 21v2M12 15v2"/></svg>',
  '⭐': '<svg viewBox="0 0 24 24" fill="currentColor" style="color:#FFC94A"><path d="M12 2l3 6.5 7 .8-5.2 4.8 1.4 7-6.2-3.6L5.8 21l1.4-7L2 9.3l7-.8L12 2z"/></svg>',
  '🎈': '<svg viewBox="0 0 24 24" fill="currentColor" style="color:#FF6B9D"><ellipse cx="12" cy="10" rx="6" ry="8"/><path d="M12 18v3M9 21h6"/></svg>',
  '🌈': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 17a10 10 0 0 1 20 0"/><path d="M6 17a6 6 0 0 1 12 0"/><path d="M10 17a2 2 0 0 1 4 0"/></svg>',
  '💥': '<svg viewBox="0 0 24 24" fill="currentColor" style="color:#FF5C7A"><path d="M12 2l1.5 5 5 1.5-5 1.5-1.5 5-1.5-5-5-1.5 5-1.5L12 2z"/><path d="M5 16l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" opacity=".5"/></svg>',
  '💎': '<svg viewBox="0 0 24 24" fill="currentColor" style="color:#6FE3E0"><path d="M6 3h12l4 6-10 12L2 9l4-6z"/></svg>',
};

/* ===== Gift Icons (DB has emoji, map to SVG) ===== */
const GIFT_ICONS = {
  '🌹': '<svg viewBox="0 0 24 24" fill="currentColor" style="color:#FF6B7A"><path d="M12 22c-4.97 0-8-2.69-8-6 0-4 6-8 8-8s8 4 8 8c0 3.31-3.03 6-8 6z"/><path d="M12 8V2M8 6l4-4 4 4"/></svg>',
  '❤️': '<svg viewBox="0 0 24 24" fill="currentColor" style="color:#FF5C7A"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  '🎂': '<svg viewBox="0 0 24 24" fill="currentColor" style="color:#FFC94A"><path d="M12 6a6 6 0 0 0-6 6h12a6 6 0 0 0-6-6z"/><path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/><path d="M12 2v4M8 4v2M16 4v2"/></svg>',
  '☕': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/><path d="M6 2v3M10 2v3M14 2v3"/></svg>',
  '📖': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  '🎵': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  '💎': '<svg viewBox="0 0 24 24" fill="currentColor" style="color:#6FE3E0"><path d="M6 3h12l4 6-10 12L2 9l4-6z"/></svg>',
  '🎁': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M12 8v12"/><path d="M5 8c0-2.2 1.8-4 4-4h6c2.2 0 4 1.8 4 4"/><path d="M5 8h14"/></svg>',
};

function renderEffects(){
  const grid = document.getElementById('effect-grid');
  grid.innerHTML = '';
  myEffects.forEach(e => {
    const chip = document.createElement('div');
    chip.className = 'effect-chip' + (e.owned ? '' : ' locked') + (selectedEffectId == e.id ? ' active' : '');
    chip.innerHTML = `
      <div class="effect-icon">${EFFECT_ICONS[e.icon] || e.icon}</div>
      <div class="effect-name">${esc(e.name)}</div>
      ${e.owned ? '' : `<div class="effect-price">${e.price} ${COIN_SVG}</div>`}
    `;
    if (e.owned) {
      chip.addEventListener('click', () => {
        if (selectedEffectId == e.id) {
          selectedEffectId = null;
          chip.classList.remove('active');
        } else {
          selectedEffectId = e.id;
          document.querySelectorAll('.effect-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
        }
      });
    } else {
      chip.addEventListener('click', async () => {
        if (confirm(`شراء تأثير "${e.name}" بـ ${e.price} ${COIN_SVG}؟`)) {
          try {
            await api('buy_effect.php', { method:'POST', body: JSON.stringify({ effect_id: e.id }) });
            const me = await api('me.php');
            document.getElementById('my-coins').textContent = `${me.coins} ${COIN_SVG}`;
            loadEffects();
          } catch(err){ alert(err.message); }
        }
      });
    }
    grid.appendChild(chip);
  });
}

/* ===== Store (tabbed) ===== */
let storeData = null;
let storeTab = 'frame';

document.getElementById('open-store').addEventListener('click', openStore);
document.getElementById('store-back').addEventListener('click', () => document.getElementById('store-screen').classList.remove('open'));

// Store tab switching
document.querySelectorAll('.store-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.store-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    storeTab = tab.dataset.type;
    if (storeData) renderStoreItems();
  });
});

async function openStore(){
  document.getElementById('store-screen').classList.add('open');
  document.getElementById('store-grid').innerHTML = skeleton(4);
  try {
    storeData = await api('store.php');
    document.getElementById('store-coins').textContent = `${storeData.coins} كوين`;
    document.getElementById('my-coins').textContent = `${storeData.coins} ${COIN_SVG}`;
    renderStoreItems();
  } catch(e){}
}

function renderStoreItems(){
  const grid = document.getElementById('store-grid');
  grid.innerHTML = '';

  if (!storeData) return;

  let items = [];
  if (storeTab === 'frame') {
    items = (storeData.frames || []).map(f => ({
      id: f.id, name: f.name, type: 'frame',
      from: f.gradient_from, to: f.gradient_to,
      price: f.price, rarity: f.rarity,
      owned: f.owned, equipped: f.equipped,
    }));
  } else {
    items = (storeData.items[storeTab] || []).map(i => ({
      id: i.id, name: i.name, type: i.item_type,
      from: i.gradient_from, to: i.gradient_to,
      price: i.price, rarity: i.rarity,
      owned: i.owned, equipped: i.equipped,
      preview_bg: i.preview_bg || null,
    }));
  }

  if (items.length === 0) {
    grid.innerHTML = '<div class="loading-hint">مفيش منتجات لسه</div>';
    return;
  }

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'frame-card';

    let btnHtml;
    if (item.equipped == 1) btnHtml = `<button class="frame-btn equipped" disabled>مفعّل حاليًا</button>`;
    else if (item.owned == 1) btnHtml = `<button class="frame-btn equip" data-id="${item.id}" data-type="${item.type}">تفعيل</button>`;
    else btnHtml = `<button class="frame-btn buy" data-id="${item.id}" data-type="${item.type}">شراء (${item.price} ${COIN_SVG})</button>`;

    // Different preview based on type
    let previewHtml;
    if (item.type === 'bg_skin' && item.preview_bg) {
      previewHtml = `<div class="frame-preview" style="border-color:${esc(item.from)}; background:${item.preview_bg}"></div>`;
    } else if (item.type === 'row_theme') {
      previewHtml = `<div class="frame-preview" style="border-color:${esc(item.from)}; background:linear-gradient(135deg, ${esc(item.from)}, ${esc(item.to)}); border-radius:8px;"></div>`;
    } else if (item.type === 'name_theme') {
      previewHtml = `<div class="frame-preview" style="border-color:${esc(item.from)}; background:linear-gradient(135deg, ${esc(item.from)}, ${esc(item.to)})"><span style="color:#0D1220;font-weight:900;font-size:20px">Aa</span></div>`;
    } else {
      previewHtml = `<div class="frame-preview" style="border-color:${esc(item.from)}; background:linear-gradient(135deg, ${esc(item.from)}, ${esc(item.to)})"></div>`;
    }

    const typeLabels = { frame: 'إطار', row_theme: 'لون الصف', name_theme: 'لون الاسم', bg_skin: 'خلفية' };

    card.innerHTML = `
      ${previewHtml}
      <div class="frame-name">${esc(item.name)}</div>
      <div class="frame-rarity">${typeLabels[item.type] || item.type} — ${esc(item.rarity)}</div>
      ${btnHtml}
    `;
    grid.appendChild(card);
  });

  // Buy handlers
  grid.querySelectorAll('.frame-btn.buy').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        if (btn.dataset.type === 'frame') {
          await api('buy_frame.php', { method:'POST', body: JSON.stringify({ frame_id: btn.dataset.id }) });
        } else {
          await api('buy_item.php', { method:'POST', body: JSON.stringify({ item_id: btn.dataset.id }) });
        }
        openStore(); loadUsers();
      } catch(e){ showStoreError(e.message); }
    });
  });

  // Equip handlers
  grid.querySelectorAll('.frame-btn.equip').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        if (btn.dataset.type === 'frame') {
          await api('equip_frame.php', { method:'POST', body: JSON.stringify({ frame_id: btn.dataset.id }) });
        } else {
          await api('equip_item.php', { method:'POST', body: JSON.stringify({ item_id: btn.dataset.id, equip: 1 }) });
        }
        openStore(); loadUsers();
      } catch(e){ showStoreError(e.message); }
    });
  });
}

function showStoreError(msg) {
  const err = document.getElementById('store-error');
  if (err) { err.textContent = msg; err.style.display = 'block'; setTimeout(() => err.style.display = 'none', 3000); }
}

/* ===== Profile Screen ===== */
document.getElementById('profile-back').addEventListener('click', () => document.getElementById('profile-screen').classList.remove('open'));

async function openProfile(userId){
  document.getElementById('profile-screen').classList.add('open');
  document.getElementById('profile-content').innerHTML = skeleton(6);

  try {
    const data = await api(`profile.php?user_id=${userId}`);
    renderProfile(data);
  } catch(e){
    document.getElementById('profile-content').innerHTML = '<div class="loading-hint">حدث خطأ</div>';
  }
}

function renderProfile(data){
  const { user, frame, we_follow, they_follow_us, is_mutual, is_self, recent_gifts } = data;
  const el = document.getElementById('profile-content');

  document.getElementById('profile-title').textContent = user.username;

  const rankIcons = {
    owner: ICONS.crown, admin: ICONS.shield, manager: ICONS.wrench, diamond: ICONS.gem,
    gold: ICONS.trophy, silver: ICONS.medal, bronze: ICONS.award, 'golden-blue': ICONS.star, normal: ICONS.user
  };

  const rankNames = {
    owner:'المالك', admin:'مدير عام', manager:'مدير', diamond:'الماس', gold:'ذهبي',
    silver:'فضي', bronze:'برونزي', 'golden-blue':'ذهبي أزرق', normal:'عادي'
  };

  const rankColors = {
    owner:'#FF5C7A', admin:'#FFC94A', manager:'#6FE3E0', diamond:'#B9F2FF',
    gold:'#FFC94A', silver:'#C0C0C0', bronze:'#CD7F32', 'golden-blue':'#FFC94A', member:'#8891A8'
  };

  const rc = user.rank_color || rankColors[user.rank_key] || '#8891A8';

  let frameStyle = '';
  if (frame) {
    frameStyle = `border-color:${frame.gradient_from}; background:linear-gradient(135deg, ${frame.gradient_from}, ${frame.gradient_to});`;
  }

  const initial = (user.username || '').charAt(0).toUpperCase();

  // VIP badge
  let vipHtml = '';
  if (user.vip_active && user.vip_tier) {
    vipHtml = `<div class="profile-vip-badge" style="background:${user.vip_tier.frame_gradient_from}22; color:${user.vip_tier.frame_gradient_from}; border:1px solid ${user.vip_tier.frame_gradient_from}44;">
      <span style="display:inline-flex;width:14px;height:14px;vertical-align:middle">${ICONS.gem}</span> ${esc(user.vip_tier.name)}
    </div>`;
  }

  // Profile song player
  let songHtml = '';
  if (user.profile_song_url) {
    songHtml = `<div class="profile-song">
      <audio id="profile-audio" src="${esc(user.profile_song_url)}" preload="none"></audio>
      <button class="song-play-btn" id="song-play-btn">
        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><polygon points="5,3 19,12 5,21"/></svg>
        تشغيل الأغنية
      </button>
    </div>`;
  } else if (is_self) {
    songHtml = `<div class="profile-song">
      <input type="text" id="song-url-input" placeholder="رابط أغنية (mp3/ogg)" style="width:100%;padding:8px 12px;background:var(--panel-2);border:1px solid var(--line);border-radius:8px;color:var(--text);font-size:12px;margin-bottom:6px;">
      <button class="frame-btn equip" onclick="saveProfileSong()" style="font-size:11px;padding:6px;">حفظ الأغنية</button>
    </div>`;
  }

  // Like button
  let likeHtml = '';
  if (!is_self) {
    likeHtml = `<button class="profile-like-btn ${user.i_liked ? 'liked' : ''}" id="profile-like-btn" data-user-id="${user.id}" data-liked="${user.i_liked ? 1 : 0}">
      <svg viewBox="0 0 24 24" fill="${user.i_liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>
      <span id="like-count">${user.likes_count || 0}</span>
    </button>`;
  } else {
    likeHtml = `<div class="profile-like-count">
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style="color:var(--owner)"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>
      ${user.likes_count || 0} إعجاب
    </div>`;
  }

  let actionsHtml = '';
  if (!is_self) {
    const followLabel = we_follow ? 'متابَع ✓' : 'متابعة';
    const followClass = we_follow ? 'follow-btn following' : 'follow-btn';
    actionsHtml = `
      <div class="profile-actions">
        ${likeHtml}
        <button class="${followClass}" id="profile-follow-btn" data-user-id="${user.id}" data-following="${we_follow ? 1 : 0}">
          ${followLabel}
        </button>
        <button class="message-btn" onclick="startChat(${user.id}, '${esc(user.username)}', '${esc(user.username)}', '${esc(frame?.gradient_from || '#8891A8')}', '${esc(frame?.gradient_to || '#C3CADA')}'); document.getElementById('profile-screen').classList.remove('open');">
          رسالة
        </button>
      </div>
    `;
  } else {
    actionsHtml = `<div class="profile-actions" style="justify-content:center">${likeHtml}</div>`;
  }

  let giftsHtml = '';
  if (recent_gifts.length > 0) {
    giftsHtml = `
      <div class="profile-gifts-title">الهدايا المستلمة (${user.gifts_received_count})</div>
      <div class="profile-gifts">
        ${recent_gifts.map(g => `
          <div class="profile-gift-item">
            <div class="gift-icon">${GIFT_ICONS[g.icon] || g.icon}</div>
            <div class="gift-from">من ${esc(g.sender_name)}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Wall posts
  const wallPosts = user.wall_posts || [];
  let wallHtml = `
    <div class="profile-wall">
      <div class="profile-wall-title">الجدار (${wallPosts.length})</div>
      ${is_self ? `
        <div class="wall-compose">
          <input type="text" id="wall-input" placeholder="اكتب משהו على الجدار…" maxlength="500">
          <button class="send-btn" onclick="postWall(${user.id})" style="width:32px;height:32px;min-width:32px">
            <svg viewBox="0 0 24 24" fill="none" stroke="#0D1220" stroke-width="2.2" width="14" height="14"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7Z"/></svg>
          </button>
        </div>
      ` : `
        <div class="wall-compose">
          <input type="text" id="wall-input" placeholder="اكتب على الجدار…" maxlength="500">
          <button class="send-btn" onclick="postWall(${user.id})" style="width:32px;height:32px;min-width:32px">
            <svg viewBox="0 0 24 24" fill="none" stroke="#0D1220" stroke-width="2.2" width="14" height="14"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7Z"/></svg>
          </button>
        </div>
      `}
      <div id="wall-posts">
        ${wallPosts.length === 0 ? '<div class="loading-hint">مفيش منشورات</div>' : wallPosts.map(p => `
          <div class="wall-post" data-id="${p.id}">
            <div class="wall-post-header">
              <span class="wall-post-author" style="color:${esc(p.rank_color || '#8891A8')}">${esc(p.author_id == user.id ? 'المالك' : p.username)}</span>
              <span class="wall-post-time">${timeSince(new Date(p.created_at))}</span>
              ${(p.author_id == ME_ID || ME_RANK === 'owner' || ME_RANK === 'admin') ? `<button class="wall-post-delete" onclick="deleteWallPost(${p.id})">×</button>` : ''}
            </div>
            <div class="wall-post-content">${esc(p.content)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  el.innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar" style="${frameStyle}">${initial}</div>
      <div class="profile-name">${esc(user.username)}</div>
      <div class="profile-username">@${esc(user.username)}</div>
      ${vipHtml}
      <div class="profile-rank" style="background:${rc}22; color:${rc}; border:1px solid ${rc}44;">
        <span style="display:inline-flex;width:14px;height:14px;vertical-align:middle">${rankIcons[user.rank_key] || ICONS.user}</span> ${user.rank_label || user.rank_key}
      </div>
      <div class="profile-level">المستوى ${user.level} • ${user.xp} XP</div>
    </div>

    ${songHtml}

    <div class="profile-stats">
      <div class="profile-stat">
        <div class="stat-val">${user.followers_count}</div>
        <div class="stat-label">متابِعين</div>
      </div>
      <div class="profile-stat">
        <div class="stat-val">${user.following_count}</div>
        <div class="stat-label">يتابع</div>
      </div>
      <div class="profile-stat">
        <div class="stat-val">${user.message_count}</div>
        <div class="stat-label">رسالة</div>
      </div>
      <div class="profile-stat">
        <div class="stat-val">${user.gifts_received_count}</div>
        <div class="stat-label">هدية</div>
      </div>
    </div>

    ${user.bio ? `<div class="profile-bio">${esc(user.bio)}</div>` : ''}

    ${actionsHtml}

    ${giftsHtml}

    ${wallHtml}
  `;

  // Follow button handler
  const followBtn = document.getElementById('profile-follow-btn');
  if (followBtn) {
    followBtn.addEventListener('click', async () => {
      const isFollowing = followBtn.dataset.following === '1';
      try {
        if (isFollowing) {
          await api('unfollow.php', { method:'POST', body: JSON.stringify({ user_id: user.id }) });
          followBtn.dataset.following = '0';
          followBtn.textContent = 'متابعة';
          followBtn.classList.remove('following');
          showToast('تم إلغاء المتابعة', 'info');
        } else {
          const res = await api('follow.php', { method:'POST', body: JSON.stringify({ user_id: user.id }) });
          followBtn.dataset.following = '1';
          followBtn.textContent = 'متابَع ✓';
          followBtn.classList.add('following');
          showToast(res.mutual ? 'متابعة متبادلة!' : 'تمت المتابعة', 'success');
        }
      } catch(e){ showToast(e.message, 'error'); }
    });
  }

  // Like button handler
  const likeBtn = document.getElementById('profile-like-btn');
  if (likeBtn) {
    likeBtn.addEventListener('click', async () => {
      const isLiked = likeBtn.dataset.liked === '1';
      try {
        const res = await api('like.php', { method:'POST', body: JSON.stringify({ user_id: user.id }) });
        likeBtn.dataset.liked = res.liked ? '1' : '0';
        likeBtn.classList.toggle('liked', res.liked);
        const svg = likeBtn.querySelector('svg');
        svg.setAttribute('fill', res.liked ? 'currentColor' : 'none');
        document.getElementById('like-count').textContent = res.count;
      } catch(e){ showToast(e.message, 'error'); }
    });
  }

  // Song play handler
  const songBtn = document.getElementById('song-play-btn');
  const audio = document.getElementById('profile-audio');
  if (songBtn && audio) {
    songBtn.addEventListener('click', () => {
      if (audio.paused) { audio.play(); songBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> إيقاف'; }
      else { audio.pause(); songBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><polygon points="5,3 19,12 5,21"/></svg> تشغيل الأغنية'; }
    });
  }
}

async function postWall(userId) {
  const input = document.getElementById('wall-input');
  if (!input || !input.value.trim()) return;
  try {
    await api('wall_post.php', { method:'POST', body: JSON.stringify({ user_id: userId, content: input.value.trim() }) });
    input.value = '';
    openProfile(userId);
    showToast('تم النشر', 'success');
  } catch(e) { showToast(e.message, 'error'); }
}

async function deleteWallPost(postId) {
  try {
    await api('wall_delete.php', { method:'POST', body: JSON.stringify({ post_id: postId }) });
    document.querySelector(`.wall-post[data-id="${postId}"]`)?.remove();
    showToast('تم الحذف', 'info');
  } catch(e) { showToast(e.message, 'error'); }
}

async function saveProfileSong() {
  const input = document.getElementById('song-url-input');
  if (!input || !input.value.trim()) return;
  try {
    await api('profile_song.php', { method:'POST', body: JSON.stringify({ song_url: input.value.trim() }) });
    showToast('تم حفظ الأغنية', 'success');
    openProfile(ME_ID);
  } catch(e) { showToast(e.message, 'error'); }
}

/* ===== Mic room (large circular seats) ===== */
let inMic = false;
let micPollTimer = null;

document.getElementById('open-mic').addEventListener('click', () => {
  document.getElementById('mic-screen').classList.add('open');
  refreshMic();
  micPollTimer = setInterval(refreshMic, 3000);
});
document.getElementById('mic-back').addEventListener('click', () => {
  document.getElementById('mic-screen').classList.remove('open');
  clearInterval(micPollTimer);
  if (inMic) voiceLeave();
});

async function refreshMic(){
  try {
    const data = await api('mic_status.php?room=main');
    const seats = data.seats || [];
    document.getElementById('mic-count').textContent = `${data.count || 0} على المايك`;
    const grid = document.getElementById('mic-seats-grid');

    grid.innerHTML = seats.map(seat => {
      const u = seat.user;
      if (!u) {
        // Empty seat
        const tierRing = seat.tier === 'vip' ? 'var(--admin)' : seat.tier === 'premium' ? 'var(--gold)' : 'var(--member)';
        return `
          <div class="mic-seat empty tier-${seat.tier}" style="--seat-ring:${tierRing}">
            <div class="mic-seat-circle">
              <div class="mic-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="9" y="2" width="6" height="12" rx="3"/>
                  <path d="M5 10a7 7 0 0 0 14 0"/>
                  <path d="M12 19v3"/>
                </svg>
              </div>
            </div>
            <div class="mic-seat-number">${seat.position}</div>
          </div>`;
      }

      // Occupied seat
      const isLocal = u.id === ME_ID;
      const isMuted = voiceState.mutedPeers.get(u.id) || false;
      const isSpeaking = voiceState.speakingPeers.get(u.id) || false;
      const seatClass = ['mic-seat', 'occupied', `tier-${seat.tier}`];
      if (isSpeaking) seatClass.push('speaking');
      if (isMuted) seatClass.push('muted');
      if (isLocal) seatClass.push('local');

      const ringColor = u.frame_from || u.rank_color || 'var(--admin)';
      const bgGrad = `linear-gradient(135deg, ${esc(u.frame_from || '#1A2338')}, ${esc(u.frame_to || '#1A2338')})`;

      return `
        <div class="${seatClass.join(' ')}" data-user-id="${u.id}" style="--seat-ring:${esc(ringColor)}">
          <div class="mic-seat-circle">
            <div class="mic-seat-avatar" style="--f-from:${esc(u.frame_from || '#1A2338')};--f-to:${esc(u.frame_to || '#1A2338')};--frame-color:${esc(ringColor)};--rank-color:${esc(u.rank_color)}">
              ${initials(u.username)}
            </div>
            ${isMuted ? `<div class="mic-mute-badge">${mutedSvg()}</div>` : ''}
          </div>
          <div class="mic-seat-number"><span style="display:inline-flex;width:14px;height:14px;vertical-align:middle;margin-inline-start:2px;color:var(--text)">${ICONS[RANK_ICONS[u.rank_key] || 'user'] || ''}</span> ${esc(u.username)}</div>
        </div>`;
    }).join('');

    inMic = seats.some(s => s.user && s.user.id === ME_ID);
    document.getElementById('mic-join-btn').style.display = inMic ? 'none' : 'block';
    document.getElementById('mic-leave-btn').style.display = inMic ? 'block' : 'none';
    document.getElementById('mic-mute-btn').style.display = inMic ? 'flex' : 'none';

    updateMuteBtnIcon();
  } catch(e){ console.error('[Mic] refreshMic failed:', e); }
}

function mutedSvg(){
  return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="3" y1="3" x2="21" y2="21"/></svg>';
}

function voiceShowError(msg) {
  const grid = document.getElementById('mic-seats-grid');
  if (!grid) return;
  const existing = grid.querySelector('.voice-error');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.className = 'voice-error';
  div.style.cssText = 'grid-column:1/-1;text-align:center;padding:16px;color:var(--owner);font-size:13px;';
  div.textContent = msg;
  grid.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}

/* ===== Voice (WebRTC) ===== */
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];
const VOICE_ROOM = 'main';
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 10000];
const SPEAKING_THRESHOLD = 15;
const ANALYSER_FFT = 256;

function safeWsSend(ws, data) {
  try { if (ws.readyState === 1) ws.send(data); } catch (e) { console.error('[Voice] WS send failed:', e); }
}

function isAllowedWsUrl(url) {
  if (/^wss:\/\//.test(url)) return true;
  if (/^ws:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(url)) return true;
  return false;
}

const voiceState = {
  localStream: null, ws: null, peers: new Map(), audioElements: new Map(),
  audioContexts: new Map(), mutedPeers: new Map(), speakingPeers: new Map(),
  isMuted: false, reconnectAttempt: 0, reconnectTimer: null,
  speakingLoops: new Map(), localSpeakingLoop: null,
};

async function voiceJoin() {
  try {
    voiceState.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  } catch (err) {
    console.error('[Voice] Mic access denied:', err);
    voiceShowError('مفيش صلاحية المايك — لازم تسمح للمتصفح بالوصول للمايك عشان تقدر تتكلم');
    return;
  }

  let tokenData;
  try { tokenData = await api(`voice_token.php?room=${VOICE_ROOM}`); }
  catch (err) { console.error('[Voice] Failed to get token:', err); voiceStopLocalStream(); return; }

  if (!isAllowedWsUrl(tokenData.voice_server_url)) {
    console.error('[Voice] Rejected untrusted voice server URL:', tokenData.voice_server_url);
    voiceStopLocalStream();
    return;
  }
  connectSignaling(tokenData.voice_server_url, tokenData.token);
}

function connectSignaling(url, token) {
  if (voiceState.ws) { voiceState.ws.onclose = null; voiceState.ws.close(); }
  const ws = new WebSocket(url);
  voiceState.ws = ws;
  voiceState.reconnectAttempt = 0;

  ws.onopen = () => {
    console.log('[Voice] Connected to signaling server');
    safeWsSend(ws, JSON.stringify({ type: 'auth', token }));
  };
  ws.onmessage = (evt) => { handleSignalingMessage(JSON.parse(evt.data)); };
  ws.onclose = () => { console.log('[Voice] Disconnected'); if (inMic) scheduleReconnect(); };
  ws.onerror = (err) => { console.error('[Voice] WebSocket error:', err); };
}

function scheduleReconnect() {
  if (voiceState.reconnectTimer) return;
  const delay = RECONNECT_DELAYS[Math.min(voiceState.reconnectAttempt, RECONNECT_DELAYS.length - 1)];
  voiceState.reconnectAttempt++;
  voiceState.reconnectTimer = setTimeout(async () => {
    voiceState.reconnectTimer = null;
    if (!inMic) return;
    try { const t = await api(`voice_token.php?room=${VOICE_ROOM}`); connectSignaling(t.voice_server_url, t.token); }
    catch { scheduleReconnect(); }
  }, delay);
}

function handleSignalingMessage(msg) {
  const knownTypes = ['room-peers','user-joined','offer','answer','ice-candidate','mute-state','user-left','kicked','error'];
  if (!msg || typeof msg.type !== 'string' || !knownTypes.includes(msg.type)) { console.warn('[Voice] Unknown msg:', msg); return; }

  switch (msg.type) {
    case 'room-peers':
      if (!Array.isArray(msg.peers)) return;
      msg.peers.forEach(p => { if (typeof p.user_id === 'number' && typeof p.username === 'string') createPeerConnection(p.user_id, p.username, true); });
      break;
    case 'user-joined': break;
    case 'offer': if (typeof msg.from !== 'number' || !msg.data) return; handleOffer(msg.from, msg.data); break;
    case 'answer': if (typeof msg.from !== 'number' || !msg.data) return; handleAnswer(msg.from, msg.data); break;
    case 'ice-candidate': if (typeof msg.from !== 'number' || !msg.data) return; handleIceCandidate(msg.from, msg.data); break;
    case 'mute-state': if (typeof msg.user_id !== 'number') return; voiceState.mutedPeers.set(msg.user_id, !!msg.muted); updateMicSlotMuted(msg.user_id, msg.muted); break;
    case 'user-left': if (typeof msg.user_id !== 'number') return; removePeer(msg.user_id); break;
    case 'kicked': console.warn('[Voice] Kicked:', msg.message); voiceLeave(); break;
    case 'error': console.error('[Voice] Server error:', msg.message); break;
  }
}

function createPeerConnection(remoteUserId, remoteUsername, isInitiator) {
  if (voiceState.peers.has(remoteUserId)) removePeer(remoteUserId);
  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
  voiceState.peers.set(remoteUserId, pc);

  if (voiceState.localStream) voiceState.localStream.getTracks().forEach(track => pc.addTrack(track, voiceState.localStream));

  pc.ontrack = (event) => { const [stream] = event.streams; if (stream) attachRemoteAudio(remoteUserId, stream); };
  pc.onicecandidate = (event) => {
    if (event.candidate && voiceState.ws?.readyState === 1) {
      safeWsSend(voiceState.ws, JSON.stringify({ type: 'ice-candidate', target: remoteUserId, data: event.candidate }));
    }
  };
  pc.onconnectionstatechange = () => {
    if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') { removePeer(remoteUserId); }
  };
  if (isInitiator) createAndSendOffer(remoteUserId, pc);
  return pc;
}

async function createAndSendOffer(remoteUserId, pc) {
  try {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    if (voiceState.ws?.readyState === 1) safeWsSend(voiceState.ws, JSON.stringify({ type: 'offer', target: remoteUserId, data: pc.localDescription }));
  } catch (err) { console.error(`[Voice] Failed to create offer for ${remoteUserId}:`, err); }
}

async function handleOffer(fromUserId, offerData) {
  let pc = voiceState.peers.get(fromUserId);
  if (!pc) pc = createPeerConnection(fromUserId, '', false);
  try {
    await pc.setRemoteDescription(new RTCSessionDescription(offerData));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    if (voiceState.ws?.readyState === 1) safeWsSend(voiceState.ws, JSON.stringify({ type: 'answer', target: fromUserId, data: pc.localDescription }));
  } catch (err) { console.error(`[Voice] Failed to handle offer from ${fromUserId}:`, err); }
}

async function handleAnswer(fromUserId, answerData) {
  const pc = voiceState.peers.get(fromUserId);
  if (!pc) return;
  try { await pc.setRemoteDescription(new RTCSessionDescription(answerData)); }
  catch (err) { console.error(`[Voice] Failed to handle answer from ${fromUserId}:`, err); }
}

async function handleIceCandidate(fromUserId, candidateData) {
  const pc = voiceState.peers.get(fromUserId);
  if (!pc) return;
  try { await pc.addIceCandidate(new RTCIceCandidate(candidateData)); }
  catch (err) { console.error(`[Voice] Failed to add ICE candidate from ${fromUserId}:`, err); }
}

function attachRemoteAudio(userId, stream) {
  detachRemoteAudio(userId);
  const audio = document.createElement('audio');
  audio.autoplay = true; audio.playsInline = true; audio.id = `voice-audio-${userId}`;
  audio.dataset.userId = userId;
  document.getElementById('voice-audio-container').appendChild(audio);
  audio.srcObject = stream;
  voiceState.audioElements.set(userId, audio);
  setupSpeakingDetection(userId, stream);
}

function detachRemoteAudio(userId) {
  const existing = voiceState.audioElements.get(userId);
  if (existing) { existing.srcObject = null; existing.remove(); voiceState.audioElements.delete(userId); }
  stopSpeakingDetection(userId);
}

function setupSpeakingDetection(userId, stream) {
  try {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    if (context.state === 'suspended') context.resume();
    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    analyser.fftSize = ANALYSER_FFT;
    source.connect(analyser);
    voiceState.audioContexts.set(userId, { context, source, analyser });

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    function checkVolume() {
      if (!voiceState.audioContexts.has(userId)) return;
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
      const isSpeaking = (sum / dataArray.length) > SPEAKING_THRESHOLD;
      const wasSpeaking = voiceState.speakingPeers.get(userId) || false;
      voiceState.speakingPeers.set(userId, isSpeaking);
      if (isSpeaking !== wasSpeaking) updateMicSlotSpeaking(userId, isSpeaking);
      voiceState.speakingLoops.set(userId, requestAnimationFrame(checkVolume));
    }
    voiceState.speakingLoops.set(userId, requestAnimationFrame(checkVolume));
  } catch (err) { console.warn(`[Voice] Could not set up speaking detection for ${userId}:`, err); }
}

function setupLocalSpeakingDetection() {
  if (!voiceState.localStream) return;
  setupSpeakingDetection('local', voiceState.localStream);
}

function stopSpeakingDetection(userId) {
  const loopId = voiceState.speakingLoops.get(userId);
  if (loopId) cancelAnimationFrame(loopId);
  voiceState.speakingLoops.delete(userId);
  const ctx = voiceState.audioContexts.get(userId);
  if (ctx) { ctx.source.disconnect(); ctx.context.close().catch(() => {}); voiceState.audioContexts.delete(userId); }
  voiceState.speakingPeers.delete(userId);
  voiceState.mutedPeers.delete(userId);
}

function updateMicSlotSpeaking(userId, speaking) {
  const seat = document.querySelector(`.mic-seat[data-user-id="${userId}"]`);
  if (seat) seat.classList.toggle('speaking', speaking);
}

function updateMicSlotMuted(userId, muted) {
  const seat = document.querySelector(`.mic-seat[data-user-id="${userId}"]`);
  if (!seat) return;
  seat.classList.toggle('muted', muted);
  const existingBadge = seat.querySelector('.mic-mute-badge');
  if (muted && !existingBadge) {
    const badge = document.createElement('div');
    badge.className = 'mic-mute-badge';
    badge.innerHTML = mutedSvg();
    seat.querySelector('.mic-seat-circle').appendChild(badge);
  } else if (!muted && existingBadge) existingBadge.remove();
}

function voiceToggleMute() {
  voiceState.isMuted = !voiceState.isMuted;
  if (voiceState.localStream) voiceState.localStream.getAudioTracks().forEach(track => { track.enabled = !voiceState.isMuted; });
  if (voiceState.ws?.readyState === 1) safeWsSend(voiceState.ws, JSON.stringify({ type: 'mute-state', muted: voiceState.isMuted }));
  updateMuteBtnIcon();

  const localSeat = document.querySelector(`.mic-seat[data-user-id="${ME_ID}"]`);
  if (localSeat) {
    localSeat.classList.toggle('muted', voiceState.isMuted);
    const existingBadge = localSeat.querySelector('.mic-mute-badge');
    if (voiceState.isMuted && !existingBadge) {
      const badge = document.createElement('div');
      badge.className = 'mic-mute-badge';
      badge.innerHTML = mutedSvg();
      localSeat.querySelector('.mic-seat-circle').appendChild(badge);
    } else if (!voiceState.isMuted && existingBadge) existingBadge.remove();
  }

  if (!voiceState.isMuted) { setupLocalSpeakingDetection(); }
  else {
    stopSpeakingDetection('local');
    const ls = document.querySelector(`.mic-seat[data-user-id="${ME_ID}"]`);
    if (ls) ls.classList.remove('speaking');
  }
}

function updateMuteBtnIcon() {
  const btn = document.getElementById('mic-mute-btn');
  if (!btn) return;
  if (voiceState.isMuted) {
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="3" y1="3" x2="21" y2="21"/></svg>';
    btn.classList.add('muted');
  } else {
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 19v3"/></svg>';
    btn.classList.remove('muted');
  }
}

function removePeer(userId) {
  const pc = voiceState.peers.get(userId);
  if (pc) { pc.close(); voiceState.peers.delete(userId); }
  detachRemoteAudio(userId);
  // Don't remove the seat from DOM — it stays as an occupied seat
  // The seat will be refreshed on next mic_status poll
}

function voiceLeave() {
  if (voiceState.ws?.readyState === 1) safeWsSend(voiceState.ws, JSON.stringify({ type: 'leave' }));
  if (voiceState.ws) { voiceState.ws.onclose = null; voiceState.ws.close(); voiceState.ws = null; }
  for (const [uid, pc] of voiceState.peers) pc.close();
  voiceState.peers.clear();
  for (const [uid, audio] of voiceState.audioElements) { audio.srcObject = null; audio.remove(); }
  voiceState.audioElements.clear();
  for (const [uid] of voiceState.audioContexts) stopSpeakingDetection(uid);
  voiceStopLocalStream();
  voiceState.mutedPeers.clear();
  voiceState.speakingPeers.clear();
  voiceState.isMuted = false;
  if (voiceState.reconnectTimer) { clearTimeout(voiceState.reconnectTimer); voiceState.reconnectTimer = null; }
  api('mic_leave.php?room=' + VOICE_ROOM, { method: 'POST' }).then(() => { refreshMic(); loadUsers(); }).catch(() => {});
}

function voiceStopLocalStream() {
  if (voiceState.localStream) { voiceState.localStream.getTracks().forEach(t => t.stop()); voiceState.localStream = null; }
}

document.getElementById('mic-join-btn').addEventListener('click', async () => {
  try {
    await api('mic_join.php?room=' + VOICE_ROOM, { method: 'POST' });
    await refreshMic(); loadUsers(); voiceJoin();
  } catch(e) { console.error('[Mic] join failed:', e); }
});

document.getElementById('mic-leave-btn').addEventListener('click', () => voiceLeave());
document.getElementById('mic-mute-btn').addEventListener('click', () => voiceToggleMute());

/* ===== Init ===== */
loadUsers();
let usersPollTimer = setInterval(loadUsers, 6000);
api('store.php').then(d => document.getElementById('my-coins').textContent = `${d.coins} ${COIN_SVG}`).catch(()=>{});

let heartbeatTimer = setInterval(heartbeat, 8000);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearInterval(heartbeatTimer);
    clearInterval(usersPollTimer);
    if (micPollTimer) { clearInterval(micPollTimer); micPollTimer = null; }
  } else {
    heartbeat();
    heartbeatTimer = setInterval(heartbeat, 8000);
    loadUsers();
    usersPollTimer = setInterval(loadUsers, 6000);
    if (document.getElementById('mic-screen').classList.contains('open')) {
      refreshMic();
      micPollTimer = setInterval(refreshMic, 3000);
    }
  }
});

/* ===== Announcements Banner ===== */
function loadAnnouncements() {
  api('announcements.php').then(list => {
    const el = document.getElementById('announcements-banner');
    if (!el || list.length === 0) return;
    el.innerHTML = list.map(a => `
      <div class="announcement-banner" style="background:var(--admin)15;border:1px solid var(--admin)44;border-radius:10px;padding:10px 14px;margin:8px 14px 0;">
        <div style="font-weight:700;font-size:12px;color:var(--admin);margin-bottom:2px;">${esc(a.title)}</div>
        <div style="font-size:11px;color:var(--text);">${esc(a.content)}</div>
      </div>
    `).join('');
  }).catch(() => {});
}
loadAnnouncements();
setInterval(loadAnnouncements, 60000);

/* ===== News Feed ===== */
document.querySelector('[data-tab="news"]')?.addEventListener('click', () => {
  document.getElementById('news-screen').classList.add('open');
  loadNews();
});
document.getElementById('news-back')?.addEventListener('click', () => document.getElementById('news-screen').classList.remove('open'));

async function loadNews() {
  const el = document.getElementById('news-list');
  el.innerHTML = skeleton(4);
  try {
    const data = await api('news.php');
    document.getElementById('news-count').textContent = `${data.articles.length} خبر`;
    if (data.articles.length === 0) {
      el.innerHTML = '<div class="loading-hint">مفيش أخبار لسه</div>';
      return;
    }
    el.innerHTML = data.articles.map(a => `
      <div style="background:var(--panel-2);border:1px solid var(--line);border-radius:12px;padding:14px;margin-bottom:10px;">
        <div style="font-size:10px;color:var(--muted-2);margin-bottom:4px;">${esc(a.category)} • ${timeSince(new Date(a.created_at))}</div>
        <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:6px;">${esc(a.title)}</div>
        <div style="font-size:13px;color:var(--muted);line-height:1.5;">${esc(a.content)}</div>
        ${a.author_name ? `<div style="font-size:10px;color:var(--muted-2);margin-top:6px;">بقلم: ${esc(a.author_name)}</div>` : ''}
      </div>
    `).join('');
  } catch(e) {
    el.innerHTML = '<div class="loading-hint">تعذر تحميل الأخبار</div>';
  }
}

/* ===== VIP Store ===== */
document.getElementById('open-vip')?.addEventListener('click', () => {
  document.getElementById('vip-screen').classList.add('open');
  loadVipTiers();
});
document.getElementById('vip-back')?.addEventListener('click', () => document.getElementById('vip-screen').classList.remove('open'));

async function loadVipTiers() {
  const el = document.getElementById('vip-list');
  el.innerHTML = skeleton(3);
  try {
    const data = await api('vip_tiers.php');
    if (data.my_vip.active) {
      document.getElementById('vip-status').textContent = `نشط حتى ${data.my_vip.expires_at}`;
    }
    el.innerHTML = data.tiers.map(t => `
      <div class="frame-card" style="margin-bottom:10px;">
        <div style="width:48px;height:48px;border-radius:50%;margin:0 auto 10px;background:linear-gradient(135deg,${esc(t.frame_gradient_from)},${esc(t.frame_gradient_to)});border:3px solid ${esc(t.frame_gradient_from)};"></div>
        <div class="frame-name">${esc(t.name)}</div>
        <div class="frame-rarity">${t.duration_days} يوم</div>
        <div style="font-size:11px;color:var(--muted);margin-bottom:8px;">${esc(t.perks || '')}</div>
        <button class="frame-btn buy" onclick="buyVip(${t.id}, ${t.price_coins}, '${esc(t.name)}')" ${data.my_vip.active && data.my_vip.tier_id == t.id ? 'disabled style="opacity:.5"' : ''}>
          ${data.my_vip.active && data.my_vip.tier_id == t.id ? 'نشط حاليًا' : `شراء (${t.price_coins} ${COIN_SVG})`}
        </button>
      </div>
    `).join('');
  } catch(e) {
    el.innerHTML = '<div class="loading-hint">تعذر تحميل باقات VIP</div>';
  }
}

async function buyVip(tierId, price, name) {
  if (!confirm(`شراء ${name} بـ ${price} كوين؟`)) return;
  try {
    const res = await api('buy_vip.php', { method:'POST', body: JSON.stringify({ tier_id: tierId }) });
    showToast(`تم تفعيل ${name}!`, 'success');
    const me = await api('me.php');
    document.getElementById('my-coins').textContent = `${me.coins} ${COIN_SVG}`;
    loadVipTiers();
  } catch(e) { showToast(e.message, 'error'); }
}

/* ===== Security Panel (Admin) ===== */
document.getElementById('open-security')?.addEventListener('click', () => {
  document.getElementById('security-screen').classList.add('open');
  loadSecurityPanel();
});
document.getElementById('security-back')?.addEventListener('click', () => document.getElementById('security-screen').classList.remove('open'));

let securityTab = 'devices';
document.querySelectorAll('[data-sec-tab]').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('[data-sec-tab]').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    securityTab = tab.dataset.secTab;
    loadSecurityPanel();
  });
});

async function loadSecurityPanel() {
  const el = document.getElementById('security-content');
  el.innerHTML = skeleton(4);
  try {
    const data = await api('security_panel.php');

    if (securityTab === 'devices') {
      el.innerHTML = data.fingerprints.length === 0 ? '<div class="loading-hint">مفيش أجهزة مسجلة</div>' :
        data.fingerprints.map(f => `
          <div style="padding:10px 0;border-bottom:1px solid var(--line);">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div style="font-size:12px;font-weight:600;color:var(--text);">${esc(f.username)}</div>
              <button onclick="banDevice('${esc(f.fingerprint)}','${esc(f.ip_address)}')" style="padding:4px 8px;border-radius:6px;border:none;background:var(--owner);color:#fff;font-size:10px;cursor:pointer;">حظر</button>
            </div>
            <div style="font-size:10px;color:var(--muted);margin-top:2px;">IP: ${esc(f.ip_address || 'N/A')} | FP: ${esc((f.fingerprint||'').substring(0,20))}...</div>
            <div style="font-size:10px;color:var(--muted-2);">آخر ظهور: ${timeSince(new Date(f.last_seen))}</div>
          </div>
        `).join('');
    } else if (securityTab === 'alts') {
      el.innerHTML = data.alt_groups.length === 0 ? '<div class="loading-hint">مفيش حسابات مزيفة</div>' :
        data.alt_groups.map(g => `
          <div style="padding:10px 0;border-bottom:1px solid var(--line);">
            <div style="font-size:12px;font-weight:600;color:var(--owner);">جهاز مشترك (${g.user_count} حسابات)</div>
            <div style="font-size:11px;color:var(--text);margin-top:4px;">${esc(g.usernames)}</div>
            <div style="font-size:10px;color:var(--muted-2);margin-top:2px;">FP: ${esc((g.fingerprint||'').substring(0,30))}...</div>
          </div>
        `).join('');
    } else if (securityTab === 'spam') {
      el.innerHTML = data.spam_logs.length === 0 ? '<div class="loading-hint">مفيش سبام مسجل</div>' :
        data.spam_logs.map(s => `
          <div style="padding:10px 0;border-bottom:1px solid var(--line);">
            <div style="display:flex;justify-content:space-between;">
              <span style="font-size:12px;font-weight:600;color:var(--text);">${esc(s.username)}</span>
              <span style="font-size:10px;color:var(--owner);">${esc(s.reason)}</span>
            </div>
            <div style="font-size:11px;color:var(--muted);margin-top:2px;">${esc((s.message_content||'').substring(0,100))}</div>
            <div style="font-size:10px;color:var(--muted-2);">${timeSince(new Date(s.created_at))}</div>
          </div>
        `).join('');
    } else if (securityTab === 'words') {
      el.innerHTML = `
        <div style="display:flex;gap:6px;margin-bottom:12px;">
          <input type="text" id="ban-word-input" placeholder="كلمة محظورة جديدة" style="flex:1;padding:8px 12px;background:var(--panel-2);border:1px solid var(--line);border-radius:8px;color:var(--text);font-size:12px;">
          <button onclick="addBannedWord()" style="padding:8px 14px;border-radius:8px;border:none;background:var(--admin);color:#0D1220;font-size:12px;font-weight:700;cursor:pointer;">إضافة</button>
        </div>
        ${data.banned_words.map(w => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--line);">
            <span style="font-size:12px;color:var(--text);">${esc(w.word)} ${w.is_regex ? '<span style="color:var(--muted-2);font-size:10px;">(regex)</span>' : ''}</span>
            <button onclick="deleteBannedWord(${w.id})" style="padding:4px 8px;border-radius:6px;border:none;background:var(--owner);color:#fff;font-size:10px;cursor:pointer;">حذف</button>
          </div>
        `).join('')}
      `;
    }
  } catch(e) {
    el.innerHTML = '<div class="loading-hint">تعذر تحميل بيانات الأمان</div>';
  }
}

async function banDevice(fp, ip) {
  const reason = prompt('سبب حظر الجهاز:');
  if (reason === null) return;
  try {
    await api('device_ban.php', { method:'POST', body: JSON.stringify({ fingerprint: fp, ip_address: ip, reason: reason || 'محظور من الإدارة' }) });
    showToast('تم حظر الجهاز', 'success');
    loadSecurityPanel();
  } catch(e) { showToast(e.message, 'error'); }
}

async function addBannedWord() {
  const input = document.getElementById('ban-word-input');
  if (!input || !input.value.trim()) return;
  try {
    await api('manage_banned_words.php', { method:'POST', body: JSON.stringify({ action:'add', word: input.value.trim() }) });
    input.value = '';
    loadSecurityPanel();
    showToast('تمت الإضافة', 'success');
  } catch(e) { showToast(e.message, 'error'); }
}

async function deleteBannedWord(id) {
  try {
    await api('manage_banned_words.php', { method:'POST', body: JSON.stringify({ action:'delete', id }) });
    loadSecurityPanel();
    showToast('تم الحذف', 'info');
  } catch(e) { showToast(e.message, 'error'); }
}
