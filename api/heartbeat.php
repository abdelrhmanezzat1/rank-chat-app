<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$u = require_login();

// Check if banned
$stmt = db()->prepare("SELECT 1 FROM banned_users WHERE user_id = ?");
$stmt->execute([$u['id']]);
if ($stmt->fetch()) {
    http_response_code(403);
    die(json_encode(['error' => 'انت محظور']));
}

db()->prepare("UPDATE users SET is_online = 1, last_seen = NOW() WHERE id = ?")->execute([$u['id']]);

// Cleanup expired mutes
db()->exec("DELETE FROM muted_users WHERE expires_at < NOW()");
db()->exec("UPDATE users SET is_muted = 0 WHERE is_muted = 1 AND id NOT IN (SELECT user_id FROM muted_users WHERE expires_at > NOW())");

// Award coins for mic time (every ~60 seconds via heartbeat)
$stmt = db()->prepare("
    SELECT 1 FROM mic_sessions WHERE user_id = ? LIMIT 1
");
$stmt->execute([$u['id']]);
if ($stmt->fetch()) {
    // Check cooldown
    $cd = db()->prepare("
        SELECT created_at FROM transactions
        WHERE user_id = ? AND source = 'mic'
        ORDER BY created_at DESC LIMIT 1
    ");
    $cd->execute([$u['id']]);
    $lastMic = $cd->fetch();
    $elapsed = $lastMic ? time() - strtotime($lastMic['created_at']) : 999;

    if ($elapsed >= 60) {
        // Check hourly limit
        $hourLimit = db()->prepare("
            SELECT IFNULL(SUM(amount), 0) FROM transactions
            WHERE user_id = ? AND source = 'mic' AND created_at > (NOW() - INTERVAL 1 HOUR)
        ");
        $hourLimit->execute([$u['id']]);
        $hourTotal = $hourLimit->fetchColumn();

        if ($hourTotal < 10) {
            db()->prepare("UPDATE users SET coins = coins + 2, xp = xp + 1 WHERE id = ?")->execute([$u['id']]);
            db()->prepare("INSERT INTO transactions (user_id, type, amount, source) VALUES (?, 'earn', 2, 'mic')")
                ->execute([$u['id']]);
        }
    }
}

// Award coins for voice room time (every ~5 minutes via heartbeat)
$stmt = db()->prepare("
    SELECT 1 FROM mic_sessions WHERE user_id = ? AND room != 'general' LIMIT 1
");
$stmt->execute([$u['id']]);
if ($stmt->fetch()) {
    $cd = db()->prepare("
        SELECT created_at FROM transactions
        WHERE user_id = ? AND source = 'voice'
        ORDER BY created_at DESC LIMIT 1
    ");
    $cd->execute([$u['id']]);
    $lastVoice = $cd->fetch();
    $elapsed = $lastVoice ? time() - strtotime($lastVoice['created_at']) : 999;

    if ($elapsed >= 300) {
        $hourLimit = db()->prepare("
            SELECT IFNULL(SUM(amount), 0) FROM transactions
            WHERE user_id = ? AND source = 'voice' AND created_at > (NOW() - INTERVAL 1 HOUR)
        ");
        $hourLimit->execute([$u['id']]);
        $hourTotal = $hourLimit->fetchColumn();

        if ($hourTotal < 6) {
            db()->prepare("UPDATE users SET coins = coins + 3, xp = xp + 2 WHERE id = ?")->execute([$u['id']]);
            db()->prepare("INSERT INTO transactions (user_id, type, amount, source) VALUES (?, 'earn', 3, 'voice')")
                ->execute([$u['id']]);
        }
    }
}

// Global offline cleanup (every 30 seconds)
static $lastCleanup = 0;
$now = time();
if ($now - $lastCleanup >= 30) {
    $lastCleanup = $now;
    db()->exec("UPDATE users SET is_online = 0 WHERE is_online = 1 AND last_seen < (NOW() - INTERVAL 20 SECOND)");
}

echo json_encode(['success' => true]);
