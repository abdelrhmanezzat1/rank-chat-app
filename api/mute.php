<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

// Only admin/owner/manager can mute
if (!in_array($me['rank_key'], ['owner', 'admin', 'manager'])) {
    http_response_code(403);
    die(json_encode(['error' => 'مش مصرحلك تعمل كده']));
}

$in = json_input();
$targetId = (int)($in['user_id'] ?? 0);
$reason = trim($in['reason'] ?? 'بدون سبب');
$duration = (int)($in['duration_minutes'] ?? 30); // default 30 min

if ($targetId <= 0 || $targetId === $me['id']) {
    http_response_code(422);
    die(json_encode(['error' => 'بيانات غير صالحة']));
}

// Check target exists
$stmt = db()->prepare("SELECT id, username, rank_key FROM users WHERE id = ?");
$stmt->execute([$targetId]);
$target = $stmt->fetch();
if (!$target) {
    http_response_code(404);
    die(json_encode(['error' => 'المستخدم مش موجود']));
}

// Can't mute higher rank
$myPriority = db()->prepare("SELECT priority FROM ranks WHERE `key` = ?");
$myPriority->execute([$me['rank_key']]);
$myPri = (int)$myPriority->fetchColumn();

$targetPriority = db()->prepare("SELECT priority FROM ranks WHERE `key` = ?");
$targetPriority->execute([$target['rank_key']]);
$targetPri = (int)$targetPriority->fetchColumn();

if ($targetPri >= $myPri) {
    http_response_code(403);
    die(json_encode(['error' => 'مش تقدر نmute حد بنفس رتبتك أو أعلى']));
}

$expires = date('Y-m-d H:i:s', time() + ($duration * 60));

// Upsert mute
db()->prepare("DELETE FROM muted_users WHERE user_id = ?")->execute([$targetId]);
db()->prepare("INSERT INTO muted_users (user_id, muted_by, reason, expires_at) VALUES (?, ?, ?, ?)")
    ->execute([$targetId, $me['id'], $reason, $expires]);
db()->prepare("UPDATE users SET is_muted = 1 WHERE id = ?")->execute([$targetId]);

// Log
db()->prepare("INSERT INTO mod_log (moderator_id, target_id, action, reason, duration_minutes, expires_at) VALUES (?, ?, 'mute', ?, ?, ?)")
    ->execute([$me['id'], $targetId, $reason, $duration, $expires]);

echo json_encode(['success' => true, 'expires_at' => $expires]);
