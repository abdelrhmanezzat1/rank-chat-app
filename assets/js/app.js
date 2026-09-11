const ME_ID = parseInt(document.body.dataset.meId, 10);
const ME_NAME = document.body.dataset.meName;

const ICONS = {
  crown:  '<svg viewBox="0 0 24 24" fill="#0D1220"><path d="M3 8l4 3 5-6 5 6 4-3-2 10H5L3 8z"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="#0D1220"><path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z"/></svg>',
  gem:    '<svg viewBox="0 0 24 24" fill="#0D1220"><path d="M6 3h12l4 6-10 12L2 9l4-6z"/></svg>',
  star:   '<svg viewBox="0 0 24 24" fill="#0D1220"><path d="M12 2l3 6.5 7 .8-5.2 4.8 1.4 7-6.2-3.6L5.8 21l1.4-7L2 9.3l7-.8L12 2z"/></svg>',
  user:   '<svg viewBox="0 0 24 24" fill="#0D1220"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/></svg>',
};

let currentFilter = 'all';
let searchTerm = '';
let usersCache = [];
let activeConversation = null;
let activePollTimer = null;

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

/* ===== Heartbeat (بديل الـ websocket presence) ===== */
async function heartbeat(){
  try { await api('heartbeat.php'); } catch(e){ console.error('[Heartbeat] failed:', e); }
}
heartbeat();

/* ===== Users list ===== */
async function loadUsers(){
  try {
    usersCache = await api(`users.php?search=${encodeURIComponent(searchTerm)}`);
    renderList();
  } catch(e){ console.error('[Users] load failed:', e); }
}

function renderList(){
  const container = document.getElementById('rank-list');
  const filtered = usersCache.filter(u => currentFilter === 'online' ? u.is_online == 1 : true);

  document.getElementById('online-count').textContent = usersCache.filter(u => u.is_online == 1).length;

  if (filtered.length === 0) {
    container.innerHTML = '<div class="loading-hint">مفيش نتائج</div>';
    return;
  }

  const groups = {};
  filtered.forEach(u => { (groups[u.rank_key] ||= []).push(u); });

  const order = Object.values(groups).length ? filtered
    .map(u => u.rank_key)
    .filter((v,i,a) => a.indexOf(v) === i)
    .sort((a,b) => groups[a][0].priority - groups[b][0].priority) : [];

  container.innerHTML = '';
  order.forEach(rankKey => {
    const members = groups[rankKey].sort((a,b) => b.is_online - a.is_online);
    const rankColor = members[0].color_hex;
    const rankIcon = members[0].icon;
    const rankLabel = members[0].rank_label;

    const group = document.createElement('div');
    group.className = 'rank-group';
    group.innerHTML = `<div class="rank-group-label" style="color:${escapeHtml(rankColor)}">
        <span class="dot" style="background:${escapeHtml(rankColor)}"></span>${escapeHtml(rankLabel)}
        <span class="rank-group-count">— ${members.length}</span>
      </div>`;
    container.appendChild(group);

    members.forEach(u => {
      const row = document.createElement('div');
      row.className = 'user-row';
      row.style.setProperty('--rank-color', rankColor);
      row.innerHTML = `
        <div class="avatar-wrap">
          <div class="avatar" style="--f-from:${escapeHtml(u.frame_from || '#1A2338')};--f-to:${escapeHtml(u.frame_to || '#1A2338')}">${initials(u.username)}</div>
          ${u.is_online == 1 ? '<span class="online-dot"></span>' : ''}
          <span class="rank-icon" style="background:${escapeHtml(rankColor)}">${ICONS[rankIcon] || ICONS.user}</span>
          ${u.on_mic > 0 ? `<span class="mic-live-dot">${micSvg()}</span>` : ''}
        </div>
        <div class="user-info">
          <div class="user-name">${escapeHtml(u.username)}</div>
          <div class="user-sub">${u.is_online == 1 ? 'متصل الآن' : 'غير متصل'}</div>
        </div>
        <div class="user-meta">${rankLabelShort(u)}</div>
      `;
      row.addEventListener('click', () => openChat(u, rankColor));
      container.appendChild(row);
    });
  });
}

function rankLabelShort(u){ return ''; }
function micSvg(){ return '<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#0D1220" stroke-width="3"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/></svg>'; }
function escapeHtml(s){ const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    renderList();
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

/* ===== Store ===== */
document.getElementById('open-store').addEventListener('click', openStore);
document.getElementById('store-back').addEventListener('click', () => document.getElementById('store-screen').classList.remove('open'));

async function openStore(){
  document.getElementById('store-screen').classList.add('open');
  document.getElementById('store-grid').innerHTML = '<div class="loading-hint">جاري التحميل…</div>';
  try {
    const data = await api('store.php');
    document.getElementById('store-coins').textContent = `${data.coins} كوين`;
    document.getElementById('my-coins').textContent = `${data.coins} 🪙`;
    renderStore(data.frames);
  } catch(e){}
}

function renderStore(frames){
  const grid = document.getElementById('store-grid');
  grid.innerHTML = '';
  frames.forEach(f => {
    const card = document.createElement('div');
    card.className = 'frame-card';
    let btnHtml;
    if (f.equipped == 1) btnHtml = `<button class="frame-btn equipped" disabled>مفعّل حاليًا</button>`;
    else if (f.owned == 1) btnHtml = `<button class="frame-btn equip" data-id="${f.id}">تفعيل</button>`;
    else btnHtml = `<button class="frame-btn buy" data-id="${f.id}">شراء (${f.price} 🪙)</button>`;

    card.innerHTML = `
      <div class="frame-preview" style="border-color:${escapeHtml(f.gradient_from)}; background:linear-gradient(135deg, ${escapeHtml(f.gradient_from)}, ${escapeHtml(f.gradient_to)})"></div>
      <div class="frame-name">${escapeHtml(f.name)}</div>
      <div class="frame-rarity">${escapeHtml(f.rarity)}</div>
      ${btnHtml}
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.frame-btn.buy').forEach(btn => btn.addEventListener('click', async () => {
    try { await api('buy_frame.php', { method:'POST', body: JSON.stringify({ frame_id: btn.dataset.id }) }); openStore(); loadUsers(); }
    catch(e){ showStoreError(e.message); }
  }));
  grid.querySelectorAll('.frame-btn.equip').forEach(btn => btn.addEventListener('click', async () => {
    try { await api('equip_frame.php', { method:'POST', body: JSON.stringify({ frame_id: btn.dataset.id }) }); openStore(); loadUsers(); }
    catch(e){ showStoreError(e.message); }
  }));
}

function showStoreError(msg) {
  const err = document.getElementById('store-error');
  if (err) { err.textContent = msg; err.style.display = 'block'; setTimeout(() => err.style.display = 'none', 3000); }
}

/* ===== Mic room (presence polling) ===== */
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
  // Auto-leave voice if screen closes while on mic
  if (inMic) voiceLeave();
});

async function refreshMic(){
  try {
    const users = await api('mic_status.php?room=main');
    document.getElementById('mic-count').textContent = `${users.length} على المايك`;
    const grid = document.getElementById('mic-grid');

    // Build grid — mark local user and track speaking state from voice system
    if (users.length === 0) {
      grid.innerHTML = '<div class="loading-hint">مفيش حد على المايك دلوقتي</div>';
    } else {
      grid.innerHTML = users.map(u => {
        const isLocal = u.id === ME_ID;
        const isMuted = voiceState.mutedPeers.get(u.id) || false;
        const isSpeaking = voiceState.speakingPeers.get(u.id) || false;
        const slotClass = ['mic-slot'];
        if (isSpeaking) slotClass.push('speaking');
        if (isMuted) slotClass.push('muted');
        if (isLocal) slotClass.push('local');
        return `
          <div class="${slotClass.join(' ')}" data-user-id="${u.id}">
            <div class="avatar" style="margin:0 auto 6px;">${initials(u.username)}</div>
            <div class="name">${escapeHtml(u.username)}</div>
            ${isMuted ? '<div class="muted-icon">' + mutedSvg() + '</div>' : ''}
          </div>`;
      }).join('');
    }

    inMic = users.some(u => u.id === ME_ID);
    document.getElementById('mic-join-btn').style.display = inMic ? 'none' : 'block';
    document.getElementById('mic-leave-btn').style.display = inMic ? 'block' : 'none';
    document.getElementById('mic-mute-btn').style.display = inMic ? 'flex' : 'none';

    // Update mute button icon
    updateMuteBtnIcon();
  } catch(e){ console.error('[Mic] refreshMic failed:', e); }
}

function mutedSvg(){
  return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF5C7A" stroke-width="2.5"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="3" y1="3" x2="21" y2="21"/></svg>';
}

function voiceShowError(msg) {
  const grid = document.getElementById('mic-grid');
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
const SPEAKING_THRESHOLD = 15; // audio volume threshold for "speaking" detection
const ANALYSER_FFT = 256;
const ALLOWED_WS_HOSTS = /^(wss?:\/\/)?(localhost|127\.0\.0\.1|.*\.(com|net|org|io))(:\d+)?$/;

function safeWsSend(ws, data) {
  try {
    if (ws.readyState === 1) ws.send(data);
  } catch (e) {
    console.error('[Voice] WS send failed:', e);
  }
}

function isAllowedWsUrl(url) {
  // Allow localhost (dev) or any wss:// host (production)
  if (/^wss:\/\//.test(url)) return true;
  if (/^ws:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(url)) return true;
  return false;
}

const voiceState = {
  localStream: null,
  ws: null,
  peers: new Map(),        // userId -> RTCPeerConnection
  audioElements: new Map(), // userId -> HTMLAudioElement
  audioContexts: new Map(), // userId -> { context, analyser }
  mutedPeers: new Map(),   // userId -> boolean
  speakingPeers: new Map(), // userId -> boolean
  isMuted: false,
  reconnectAttempt: 0,
  reconnectTimer: null,
  speakingLoops: new Map(), // userId -> animationFrame id
  localSpeakingLoop: null,
};

// ── Join voice ──────────────────────────────────────────────────────────
async function voiceJoin() {
  try {
    // 1. Get microphone access
    voiceState.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  } catch (err) {
    console.error('[Voice] Mic access denied:', err);
    voiceShowError('مفيش صلاحية المايك — لازم تسمح للمتصفح بالوصول للمايك عشان تقدر تتكلم');
    return;
  }

  // 2. Get voice token
  let tokenData;
  try {
    tokenData = await api(`voice_token.php?room=${VOICE_ROOM}`);
  } catch (err) {
    console.error('[Voice] Failed to get token:', err);
    voiceStopLocalStream();
    return;
  }

  // 3. Validate voice server URL, then connect to signaling server
  if (!isAllowedWsUrl(tokenData.voice_server_url)) {
    console.error('[Voice] Rejected untrusted voice server URL:', tokenData.voice_server_url);
    voiceStopLocalStream();
    return;
  }
  connectSignaling(tokenData.voice_server_url, tokenData.token);
}

// ── Connect to WebSocket signaling server ───────────────────────────────
function connectSignaling(url, token) {
  if (voiceState.ws) {
    voiceState.ws.onclose = null;
    voiceState.ws.close();
  }

  const ws = new WebSocket(url);
  voiceState.ws = ws;
  voiceState.reconnectAttempt = 0;

  ws.onopen = () => {
    console.log('[Voice] Connected to signaling server');
    // Send auth token as first message (not in URL to avoid log leakage)
    safeWsSend(ws, JSON.stringify({ type: 'auth', token }));
  };

  ws.onmessage = (evt) => {
    const msg = JSON.parse(evt.data);
    handleSignalingMessage(msg);
  };

  ws.onclose = () => {
    console.log('[Voice] Disconnected from signaling server');
    // If still supposed to be in mic, attempt reconnect
    if (inMic) {
      scheduleReconnect();
    }
  };

  ws.onerror = (err) => {
    console.error('[Voice] WebSocket error:', err);
  };
}

// ── Reconnect with backoff ─────────────────────────────────────────────
function scheduleReconnect() {
  if (voiceState.reconnectTimer) return;
  const delay = RECONNECT_DELAYS[Math.min(voiceState.reconnectAttempt, RECONNECT_DELAYS.length - 1)];
  voiceState.reconnectAttempt++;
  console.log(`[Voice] Reconnecting in ${delay}ms (attempt ${voiceState.reconnectAttempt})`);
  voiceState.reconnectTimer = setTimeout(async () => {
    voiceState.reconnectTimer = null;
    if (!inMic) return;
    try {
      const tokenData = await api(`voice_token.php?room=${VOICE_ROOM}`);
      connectSignaling(tokenData.voice_server_url, tokenData.token);
    } catch {
      scheduleReconnect();
    }
  }, delay);
}

// ── Handle signaling messages ──────────────────────────────────────────
function handleSignalingMessage(msg) {
  // Validate message has a known type
  const knownTypes = ['room-peers', 'user-joined', 'offer', 'answer', 'ice-candidate', 'mute-state', 'user-left', 'kicked', 'error'];
  if (!msg || typeof msg.type !== 'string' || !knownTypes.includes(msg.type)) {
    console.warn('[Voice] Unknown or malformed message:', msg);
    return;
  }

  switch (msg.type) {
    case 'room-peers':
      // We just joined — create connections to all existing peers (we initiate)
      if (!Array.isArray(msg.peers)) return;
      msg.peers.forEach(p => {
        if (typeof p.user_id === 'number' && typeof p.username === 'string') {
          createPeerConnection(p.user_id, p.username, true);
        }
      });
      break;

    case 'user-joined':
      // Someone new joined — wait for their offer (don't create here)
      // We'll create a PC when we receive their offer
      break;

    case 'offer':
      if (typeof msg.from !== 'number' || !msg.data) { console.warn('[Voice] Malformed offer:', msg); return; }
      handleOffer(msg.from, msg.data);
      break;

    case 'answer':
      if (typeof msg.from !== 'number' || !msg.data) { console.warn('[Voice] Malformed answer:', msg); return; }
      handleAnswer(msg.from, msg.data);
      break;

    case 'ice-candidate':
      if (typeof msg.from !== 'number' || !msg.data) { console.warn('[Voice] Malformed ice-candidate:', msg); return; }
      handleIceCandidate(msg.from, msg.data);
      break;

    case 'mute-state':
      if (typeof msg.user_id !== 'number') return;
      voiceState.mutedPeers.set(msg.user_id, !!msg.muted);
      updateMicSlotMuted(msg.user_id, msg.muted);
      break;

    case 'user-left':
      if (typeof msg.user_id !== 'number') return;
      removePeer(msg.user_id);
      break;

    case 'kicked':
      console.warn('[Voice] Kicked:', msg.message);
      voiceLeave();
      break;

    case 'error':
      console.error('[Voice] Server error:', msg.message);
      break;
  }
}

// ── Create RTCPeerConnection for a remote peer ─────────────────────────
function createPeerConnection(remoteUserId, remoteUsername, isInitiator) {
  // Clean up existing if any
  if (voiceState.peers.has(remoteUserId)) {
    removePeer(remoteUserId);
  }

  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
  voiceState.peers.set(remoteUserId, pc);

  // Add local stream tracks
  if (voiceState.localStream) {
    voiceState.localStream.getTracks().forEach(track => {
      pc.addTrack(track, voiceState.localStream);
    });
  }

  // Handle incoming tracks
  pc.ontrack = (event) => {
    const [stream] = event.streams;
    if (stream) {
      attachRemoteAudio(remoteUserId, stream);
    }
  };

  // Handle ICE candidates
  pc.onicecandidate = (event) => {
    if (event.candidate && voiceState.ws?.readyState === 1) {
      safeWsSend(voiceState.ws, JSON.stringify({
        type: 'ice-candidate',
        target: remoteUserId,
        data: event.candidate,
      }));
    }
  };

  pc.onconnectionstatechange = () => {
    if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
      console.warn(`[Voice] Connection to ${remoteUserId} (${remoteUsername}) ${pc.connectionState}`);
      removePeer(remoteUserId);
    }
  };

  // If we're the initiator, create and send offer
  if (isInitiator) {
    createAndSendOffer(remoteUserId, pc);
  }

  return pc;
}

// ── Create and send SDP offer ──────────────────────────────────────────
async function createAndSendOffer(remoteUserId, pc) {
  try {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    if (voiceState.ws?.readyState === 1) {
      safeWsSend(voiceState.ws, JSON.stringify({
        type: 'offer',
        target: remoteUserId,
        data: pc.localDescription,
      }));
    }
  } catch (err) {
    console.error(`[Voice] Failed to create offer for ${remoteUserId}:`, err);
  }
}

// ── Handle incoming offer ──────────────────────────────────────────────
async function handleOffer(fromUserId, offerData) {
  let pc = voiceState.peers.get(fromUserId);
  if (!pc) {
    pc = createPeerConnection(fromUserId, '', false);
  }

  try {
    await pc.setRemoteDescription(new RTCSessionDescription(offerData));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    if (voiceState.ws?.readyState === 1) {
      safeWsSend(voiceState.ws, JSON.stringify({
        type: 'answer',
        target: fromUserId,
        data: pc.localDescription,
      }));
    }
  } catch (err) {
    console.error(`[Voice] Failed to handle offer from ${fromUserId}:`, err);
  }
}

// ── Handle incoming answer ─────────────────────────────────────────────
async function handleAnswer(fromUserId, answerData) {
  const pc = voiceState.peers.get(fromUserId);
  if (!pc) return;
  try {
    await pc.setRemoteDescription(new RTCSessionDescription(answerData));
  } catch (err) {
    console.error(`[Voice] Failed to handle answer from ${fromUserId}:`, err);
  }
}

// ── Handle incoming ICE candidate ──────────────────────────────────────
async function handleIceCandidate(fromUserId, candidateData) {
  const pc = voiceState.peers.get(fromUserId);
  if (!pc) return;
  try {
    await pc.addIceCandidate(new RTCIceCandidate(candidateData));
  } catch (err) {
    console.error(`[Voice] Failed to add ICE candidate from ${fromUserId}:`, err);
  }
}

// ── Attach remote audio stream ─────────────────────────────────────────
function attachRemoteAudio(userId, stream) {
  // Remove existing audio element if any
  detachRemoteAudio(userId);

  const audio = document.createElement('audio');
  audio.autoplay = true;
  audio.playsInline = true;
  audio.id = `voice-audio-${userId}`;
  audio.dataset.userId = userId;
  document.getElementById('voice-audio-container').appendChild(audio);
  audio.srcObject = stream;
  voiceState.audioElements.set(userId, audio);

  // Set up speaking detection for this remote stream
  setupSpeakingDetection(userId, stream);
}

function detachRemoteAudio(userId) {
  const existing = voiceState.audioElements.get(userId);
  if (existing) {
    existing.srcObject = null;
    existing.remove();
    voiceState.audioElements.delete(userId);
  }
  stopSpeakingDetection(userId);
}

// ── Speaking detection (Web Audio API) ─────────────────────────────────
function setupSpeakingDetection(userId, stream) {
  try {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    // Resume AudioContext if suspended (browser autoplay policy)
    if (context.state === 'suspended') {
      context.resume();
    }
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
      const average = sum / dataArray.length;
      const isSpeaking = average > SPEAKING_THRESHOLD;

      const wasSpeaking = voiceState.speakingPeers.get(userId) || false;
      voiceState.speakingPeers.set(userId, isSpeaking);

      if (isSpeaking !== wasSpeaking) {
        updateMicSlotSpeaking(userId, isSpeaking);
      }

      voiceState.speakingLoops.set(userId, requestAnimationFrame(checkVolume));
    }
    voiceState.speakingLoops.set(userId, requestAnimationFrame(checkVolume));
  } catch (err) {
    console.warn(`[Voice] Could not set up speaking detection for ${userId}:`, err);
  }
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
  if (ctx) {
    ctx.source.disconnect();
    ctx.context.close().catch(() => {});
    voiceState.audioContexts.delete(userId);
  }
  voiceState.speakingPeers.delete(userId);
  voiceState.mutedPeers.delete(userId);
}

// ── Update mic-slot UI classes ─────────────────────────────────────────
function updateMicSlotSpeaking(userId, speaking) {
  const slot = document.querySelector(`.mic-slot[data-user-id="${userId}"]`);
  if (slot) slot.classList.toggle('speaking', speaking);
}

function updateMicSlotMuted(userId, muted) {
  const slot = document.querySelector(`.mic-slot[data-user-id="${userId}"]`);
  if (!slot) return;
  slot.classList.toggle('muted', muted);
  // Add/remove muted icon
  const existingIcon = slot.querySelector('.muted-icon');
  if (muted && !existingIcon) {
    const icon = document.createElement('div');
    icon.className = 'muted-icon';
    icon.innerHTML = mutedSvg();
    slot.appendChild(icon);
  } else if (!muted && existingIcon) {
    existingIcon.remove();
  }
}

// ── Mute / Unmute ──────────────────────────────────────────────────────
function voiceToggleMute() {
  voiceState.isMuted = !voiceState.isMuted;

  // Mute/unmute local audio track
  if (voiceState.localStream) {
    voiceState.localStream.getAudioTracks().forEach(track => {
      track.enabled = !voiceState.isMuted;
    });
  }

  // Broadcast mute state to peers
  if (voiceState.ws?.readyState === 1) {
    safeWsSend(voiceState.ws, JSON.stringify({
      type: 'mute-state',
      muted: voiceState.isMuted,
    }));
  }

  updateMuteBtnIcon();

  // Update local user's slot in mic grid
  const localSlot = document.querySelector(`.mic-slot[data-user-id="${ME_ID}"]`);
  if (localSlot) {
    localSlot.classList.toggle('muted', voiceState.isMuted);
    const existingIcon = localSlot.querySelector('.muted-icon');
    if (voiceState.isMuted && !existingIcon) {
      const icon = document.createElement('div');
      icon.className = 'muted-icon';
      icon.innerHTML = mutedSvg();
      localSlot.appendChild(icon);
    } else if (!voiceState.isMuted && existingIcon) {
      existingIcon.remove();
    }
  }

  // Toggle local speaking detection
  if (!voiceState.isMuted) {
    setupLocalSpeakingDetection();
  } else {
    stopSpeakingDetection('local');
    const localSlot2 = document.querySelector(`.mic-slot[data-user-id="${ME_ID}"]`);
    if (localSlot2) localSlot2.classList.remove('speaking');
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

// ── Remove a peer ──────────────────────────────────────────────────────
function removePeer(userId) {
  const pc = voiceState.peers.get(userId);
  if (pc) {
    pc.close();
    voiceState.peers.delete(userId);
  }
  detachRemoteAudio(userId);

  // Remove from mic grid
  const slot = document.querySelector(`.mic-slot[data-user-id="${userId}"]`);
  if (slot) slot.remove();
}

// ── Leave voice ────────────────────────────────────────────────────────
function voiceLeave() {
  // Notify server
  if (voiceState.ws?.readyState === 1) {
    safeWsSend(voiceState.ws, JSON.stringify({ type: 'leave' }));
  }

  // Close WebSocket
  if (voiceState.ws) {
    voiceState.ws.onclose = null;
    voiceState.ws.close();
    voiceState.ws = null;
  }

  // Close all peer connections
  for (const [uid, pc] of voiceState.peers) {
    pc.close();
  }
  voiceState.peers.clear();

  // Stop all remote audio
  for (const [uid, audio] of voiceState.audioElements) {
    audio.srcObject = null;
    audio.remove();
  }
  voiceState.audioElements.clear();

  // Stop all speaking detection
  for (const [uid] of voiceState.audioContexts) {
    stopSpeakingDetection(uid);
  }

  // Stop local stream
  voiceStopLocalStream();

  // Clear state
  voiceState.mutedPeers.clear();
  voiceState.speakingPeers.clear();
  voiceState.isMuted = false;
  if (voiceState.reconnectTimer) {
    clearTimeout(voiceState.reconnectTimer);
    voiceState.reconnectTimer = null;
  }

  // Call PHP leave endpoint
  api('mic_leave.php?room=' + VOICE_ROOM, { method: 'POST' }).then(() => {
    refreshMic();
    loadUsers();
  }).catch(() => {});
}

function voiceStopLocalStream() {
  if (voiceState.localStream) {
    voiceState.localStream.getTracks().forEach(t => t.stop());
    voiceState.localStream = null;
  }
}

// ── Mic join/leave button handlers ─────────────────────────────────────
document.getElementById('mic-join-btn').addEventListener('click', async () => {
  try {
    await api('mic_join.php?room=' + VOICE_ROOM, { method: 'POST' });
    await refreshMic();
    loadUsers();
    voiceJoin(); // Start WebRTC voice (mic session is now committed)
  } catch(e){}
  } catch(e){}
});

document.getElementById('mic-leave-btn').addEventListener('click', () => {
  voiceLeave();
});

document.getElementById('mic-mute-btn').addEventListener('click', () => {
  voiceToggleMute();
});

/* ===== Init ===== */
loadUsers();
let usersPollTimer = setInterval(loadUsers, 6000);
api('store.php').then(d => document.getElementById('my-coins').textContent = `${d.coins} 🪙`).catch(()=>{});

// Pause heartbeat + polling when tab is hidden to save resources
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
    // Resume mic polling if mic screen is open
    if (document.getElementById('mic-screen').classList.contains('open')) {
      refreshMic();
      micPollTimer = setInterval(refreshMic, 3000);
    }
  }
});
