<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

if (!in_array($me['rank_key'], ['owner', 'admin', 'manager'])) {
    http_response_code(403);
    die(json_encode(['error' => 'مش مصرحلك تعمل كده']));
}

$in = json_input();
$targetId = (int)($in['user_id'] ?? 0);
$reason = trim($in['reason'] ?? 'بدون سبب');

if ($targetId <= 0 || $targetId === $me['id']) {
    http_response_code(422);
    die(json_encode(['error' => 'بيانات غير صالحة']));
}

$stmt = db()->prepare("SELECT id, username, rank_key FROM users WHERE id = ?");
$stmt->execute([$targetId]);
$target = $stmt->fetch();
if (!$target) {
    http_response_code(404);
    die(json_encode(['error' => 'المستخدم مش موجود']));
}

$myPriority = db()->prepare("SELECT priority FROM ranks WHERE `key` = ?");
$myPriority->execute([$me['rank_key']]);
$myPri = (int)$myPriority->fetchColumn();

$targetPriority = db()->prepare("SELECT priority FROM ranks WHERE `key` = ?");
$targetPriority->execute([$target['rank_key']]);
$targetPri = (int)$targetPriority->fetchColumn();

if ($targetPri >= $myPri) {
    http_response_code(403);
    die(json_encode(['error' => 'مش تقدر تطرد حد بنفس رتبتك أو أعلى']));
}

// Remove from mic
db()->prepare("DELETE FROM mic_sessions WHERE user_id = ?")->execute([$targetId]);

// Log
db()->prepare("INSERT INTO mod_log (moderator_id, target_id, action, reason) VALUES (?, ?, 'kick', ?)")
    ->execute([$me['id'], $targetId, $reason]);

// Notify target
db()->prepare("INSERT INTO notifications (user_id, from_user_id, type, title, body, reference_type) VALUES (?, ?, 'mod', 'تم طردك', ?, 'moderation')")
    ->execute([$targetId, $me['id'], 'تم طردك من السيرفر. السبب: ' . $reason]);

echo json_encode(['success' => true, 'username' => $target['username']]);
