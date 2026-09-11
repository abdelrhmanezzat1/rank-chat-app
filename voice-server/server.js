require('dotenv').config();
const { WebSocketServer } = require('ws');
const crypto = require('crypto');
const mysql = require('mysql2/promise');

const PORT = parseInt(process.env.PORT || '3001', 10);
const SECRET = process.env.VOICE_SECRET;
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS || '';

// Refuse to start if required env vars are missing
const required = { VOICE_SECRET: SECRET, DB_HOST, DB_NAME, DB_USER };
const missing = Object.entries(required).filter(([, v]) => !v).map(([k]) => k);
if (missing.length > 0) {
  console.error(`[Voice] FATAL: Missing required environment variables: ${missing.join(', ')}`);
  console.error('[Voice] Copy .env.example to .env and fill in the values.');
  process.exit(1);
}

const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '50', 10); // msgs per second
const MAX_PAYLOAD = 64 * 1024; // 64 KB

// ── MySQL pool (for cleaning up mic_sessions on disconnect) ──────────────
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 5,
  connectTimeout: 10000,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error (idle connection):', err.message);
});

// ── Token verification ──────────────────────────────────────────────────
function verifyToken(token) {
  try {
    const [base64Payload, signature] = token.split('.');
    if (!base64Payload || !signature) return null;

    const expectedSig = crypto
      .createHmac('sha256', SECRET)
      .update(base64Payload)
      .digest('base64')
      .replace(/=+$/, '');

    // Timing-safe comparison: pad shorter buffer to match longer, then compare
    const sigBuf = Buffer.from(signature, 'base64');
    const expectedBuf = Buffer.from(expectedSig, 'base64');
    const maxLen = Math.max(sigBuf.length, expectedBuf.length);
    const a = Buffer.alloc(maxLen, 0);
    const b = Buffer.alloc(maxLen, 0);
    sigBuf.copy(a);
    expectedBuf.copy(b);
    if (!crypto.timingSafeEqual(a, b)) return null;

    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// ── Room state ──────────────────────────────────────────────────────────
// rooms: Map<roomName, Map<userId, { ws, username, muted }>>
const rooms = new Map();

function getRoom(room) {
  if (!rooms.has(room)) rooms.set(room, new Map());
  return rooms.get(room);
}

function broadcast(room, msg, excludeId = null) {
  const peers = getRoom(room);
  const data = JSON.stringify(msg);
  for (const [uid, peer] of peers) {
    if (uid !== excludeId && peer.ws.readyState === 1) {
      safeSend(peer.ws, data);
    }
  }
}

function sendTo(userId, room, msg) {
  const peers = getRoom(room);
  const peer = peers.get(userId);
  if (peer && peer.ws.readyState === 1) {
    safeSend(peer.ws, JSON.stringify(msg));
  }
}

// ── Safe send wrapper (never throws) ────────────────────────────────────
function safeSend(ws, data) {
  try {
    if (ws.readyState === 1) ws.send(data);
  } catch (err) {
    console.error('[WS] send failed:', err.message);
  }
}

// ── Clean up mic_sessions in MySQL ──────────────────────────────────────
async function cleanupMicSession(userId, room) {
  try {
    await pool.execute('DELETE FROM mic_sessions WHERE room = ? AND user_id = ?', [room, userId]);
  } catch (err) {
    console.error(`[DB] Failed to clean mic_session for user ${userId}:`, err.message);
  }
}

// ── WebSocket server ────────────────────────────────────────────────────
const wss = new WebSocketServer({ port: PORT, maxPayload: MAX_PAYLOAD });
console.log(`[Voice] Signaling server running on ws://0.0.0.0:${PORT}`);

wss.on('connection', (ws, req) => {
  // ── Auth: token in first message (not URL query) ──────────────────
  let authenticated = false;
  let userId, username, room;

  const authTimeout = setTimeout(() => {
    if (!authenticated) {
      safeSend(ws, JSON.stringify({ type: 'error', message: 'Authentication timeout (5s)' }));
      ws.close(4003, 'Auth timeout');
    }
  }, 5000);

  ws.on('message', (raw) => {
    // First message must be auth with token
    if (!authenticated) {
      clearTimeout(authTimeout);
      let msg;
      try { msg = JSON.parse(raw); } catch { ws.close(4004, 'Invalid JSON'); return; }

      if (msg.type !== 'auth' || typeof msg.token !== 'string') {
        safeSend(ws, JSON.stringify({ type: 'error', message: 'First message must be {type:"auth", token:"..."}' }));
        ws.close(4005, 'Expected auth message');
        return;
      }

      const parsed = verifyToken(msg.token);
      if (!parsed) {
        safeSend(ws, JSON.stringify({ type: 'error', message: 'Invalid or expired token' }));
        ws.close(4001, 'Unauthorized');
        return;
      }

      authenticated = true;
      userId = parsed.user_id;
      username = parsed.username;
      room = parsed.room;

      // Kick existing connection for same user (reconnect)
      const peers = getRoom(room);
      const existing = peers.get(userId);
      if (existing) {
        safeSend(existing.ws, JSON.stringify({ type: 'kicked', message: 'Connected from another tab' }));
        existing.ws.close(4002, 'Replaced');
      }

      peers.set(userId, { ws, username, muted: false, isAlive: true });
      console.log(`[Voice] ${username} (${userId}) joined room "${room}" (${peers.size} peers)`);

      // Send current peer list
      const peerList = [];
      for (const [uid, p] of peers) {
        if (uid !== userId) {
          peerList.push({ user_id: uid, username: p.username, muted: p.muted });
        }
      }
      safeSend(ws, JSON.stringify({ type: 'room-peers', peers: peerList }));

      // Broadcast join
      broadcast(room, { type: 'user-joined', user_id: userId, username }, userId);
      return;
    }

    // ── Authenticated message handling ───────────────────────────────
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    // Basic rate limiting: count messages per second
    const now = Date.now();
    if (!ws._rateBucket) ws._rateBucket = { count: 0, windowStart: now };
    if (now - ws._rateBucket.windowStart > 1000) {
      ws._rateBucket = { count: 0, windowStart: now };
    }
    ws._rateBucket.count++;
    if (ws._rateBucket.count > RATE_LIMIT_MAX) {
      safeSend(ws, JSON.stringify({ type: 'error', message: 'Rate limit exceeded' }));
      ws.close(4006, 'Rate limited');
      return;
    }

    switch (msg.type) {
      case 'offer':
      case 'answer':
      case 'ice-candidate':
        if (typeof msg.target !== 'number') return;
        sendTo(msg.target, room, { type: msg.type, from: userId, data: msg.data });
        break;

      case 'mute-state':
        const peerData = getRoom(room).get(userId);
        if (peerData) peerData.muted = !!msg.muted;
        broadcast(room, { type: 'mute-state', user_id: userId, muted: !!msg.muted }, userId);
        break;

      case 'leave':
        handleLeave(userId, room);
        break;

      case 'pong':
        const pp = getRoom(room).get(userId);
        if (pp) pp.isAlive = true;
        break;
    }
  });

  ws.on('close', () => {
    clearTimeout(authTimeout);
    if (authenticated) handleLeave(userId, room);
  });

  ws.on('error', () => {
    clearTimeout(authTimeout);
    if (authenticated) handleLeave(userId, room);
  });
});

function handleLeave(userId, room) {
  const peers = getRoom(room);
  if (!peers.has(userId)) return; // Already cleaned up (idempotent)

  const peer = peers.get(userId);
  console.log(`[Voice] ${peer.username} (${userId}) left room "${room}"`);
  peers.delete(userId);

  // Broadcast leave
  broadcast(room, { type: 'user-left', user_id: userId });

  // Clean up DB
  cleanupMicSession(userId, room);

  // Delete empty rooms
  if (peers.size === 0) {
    rooms.delete(room);
  }
}

// ── Heartbeat (ping/pong every 15s) ────────────────────────────────────
setInterval(() => {
  for (const [room, peers] of rooms) {
    for (const [uid, peer] of peers) {
      if (peer.isAlive === false) {
        console.log(`[Voice] Stale connection: ${peer.username} (${uid}) in "${room}"`);
        peer.ws.terminate(); // destroy triggers 'close' event → handleLeave runs once
        continue;
      }
      peer.isAlive = false;
      if (peer.ws.readyState === 1) {
        peer.ws.ping();
      }
    }
  }
}, 15000);

// ── Graceful shutdown ───────────────────────────────────────────────────
function gracefulShutdown() {
  console.log('\n[Voice] Shutting down...');

  // Close all active WebSocket connections
  for (const ws of wss.clients) {
    safeSend(ws, JSON.stringify({ type: 'error', message: 'Server shutting down' }));
    ws.close(1001, 'Server shutting down');
  }

  wss.close(() => {
    pool.end().then(() => process.exit(0)).catch(() => process.exit(1));
  });

  // Force exit after 5s if graceful shutdown hangs
  setTimeout(() => process.exit(1), 5000);
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
