const ME_ID = parseInt(document.body.dataset.meId, 10);
const ME_NAME = document.body.dataset.meName;

const ICONS = {
  crown:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 8l4 3 5-6 5 6 4-3-2 10H5L3 8z"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z"/></svg>',
  gem:    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 3h12l4 6-10 12L2 9l4-6z"/></svg>',
  star:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 6.5 7 .8-5.2 4.8 1.4 7-6.2-3.6L5.8 21l1.4-7L2 9.3l7-.8L12 2z"/></svg>',
  user:   '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/></svg>',
};

const RANK_ORDER = ['owner','admin','diamond','gold','silver','bronze','member'];

let currentFilter = 'all';
let currentTab = 'members';
let searchTerm = '';
let usersCache = [];
let activeConversation = null;
let activePollTimer = null;
let collapsedSections = new Set();

function initials(name){ return name.trim().split(/\s+/).map(w => w[0]).join('').slice(0,2); }

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
  try { await api('heartbeat.php'); } catch(e){ console.error('[Heartbeat] failed:', e); }
}
heartbeat();

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
          <div class="user-sub">${u.is_online == 1 ? (u.on_mic > 0 ? '🎙 على المايك' : 'متصل الآن') : 'غير متصل'}</div>
        </div>
      `;
      row.addEventListener('click', () => openChat(u, rankColor));
      body.appendChild(row);
    });

    section.appendChild(body);
    container.appendChild(section);
  });
}

function micSvg(){ return '<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#0D1220" stroke-width="3"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/></svg>'; }
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
  document.getElementById('chat-body').innerHTML = '<div class="loading-hint">جاري تحميل المحادثة…</div>';
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
    body.innerHTML = '<div class="loading-hint">مفيش رسائل لسه، ابدأ المحادثة 👋</div>';
    return;
  }
  messages.forEach(m => appendBubble(m));
  body.scrollTop = body.scrollHeight;
}

function appendBubble(m){
  const body = document.getElementById('chat-body');
  const bubble = document.createElement('div');
  bubble.className = 'bubble ' + (m.sender_id == ME_ID ? 'out' : 'in');
  bubble.textContent = m.content;
  body.appendChild(bubble);
  body.scrollTop = body.scrollHeight;
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
});

document.getElementById('chat-send').addEventListener('click', sendMessage);
document.getElementById('chat-input').addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

async function sendMessage(){
  const input = document.getElementById('chat-input');
  const content = input.value.trim();
  if (!content || !activeConversation) return;
  input.value = '';
  try {
    const res = await api('send_message.php', { method: 'POST', body: JSON.stringify({ conversation_id: activeConversation.id, content }) });
    appendBubble({ sender_id: ME_ID, content });
    activeConversation.lastId = res.id;
  } catch(e){}
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
  document.getElementById('store-grid').innerHTML = '<div class="loading-hint">جاري التحميل…</div>';
  try {
    storeData = await api('store.php');
    document.getElementById('store-coins').textContent = `${storeData.coins} كوين`;
    document.getElementById('my-coins').textContent = `${storeData.coins} 🪙`;
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
    else btnHtml = `<button class="frame-btn buy" data-id="${item.id}" data-type="${item.type}">شراء (${item.price} 🪙)</button>`;

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
          <div class="mic-seat-number">${u.rank_icon === 'crown' ? '👑' : u.rank_icon === 'shield' ? '🛡' : u.rank_icon === 'gem' ? '💎' : ''} ${esc(u.username)}</div>
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
api('store.php').then(d => document.getElementById('my-coins').textContent = `${d.coins} 🪙`).catch(()=>{});

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
