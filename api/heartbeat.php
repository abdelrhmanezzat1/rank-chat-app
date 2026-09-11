<?php
// ينده الجافاسكريبت على الملف ده كل شوية عشان يقول "أنا لسه متصل"
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$u = require_login();
db()->prepare("UPDATE users SET is_online = 1, last_seen = NOW() WHERE id = ?")->execute([$u['id']]);

// Only run the global offline cleanup once every 30 seconds (not on every heartbeat from every user)
static $lastCleanup = 0;
$now = time();
if ($now - $lastCleanup >= 30) {
    $lastCleanup = $now;
    db()->exec("UPDATE users SET is_online = 0 WHERE is_online = 1 AND last_seen < (NOW() - INTERVAL 20 SECOND)");
}

echo json_encode(['success' => true]);
