<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

if (!in_array($me['rank_key'], ['owner', 'admin'])) {
    http_response_code(403);
    die(json_encode(['error' => 'مش مصرحلك تعمل كده']));
}

$in = json_input();
$targetId = (int)($in['user_id'] ?? 0);
$reason = trim($in['reason'] ?? 'بدون سبب');
$action = ($in['action'] ?? 'ban') === 'unban' ? 'unban' : 'ban';

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
    die(json_encode(['error' => 'مش تقدر تban حد بنفس رتبتك أو أعلى']));
}

if ($action === 'unban') {
    db()->prepare("DELETE FROM banned_users WHERE user_id = ?")->execute([$targetId]);
    db()->prepare("INSERT INTO mod_log (moderator_id, target_id, action, reason) VALUES (?, ?, 'unban', ?)")
        ->execute([$me['id'], $targetId, $reason]);
    echo json_encode(['success' => true, 'action' => 'unban']);
} else {
    db()->prepare("DELETE FROM banned_users WHERE user_id = ?")->execute([$targetId]);
    db()->prepare("INSERT INTO banned_users (user_id, banned_by, reason) VALUES (?, ?, ?)")
        ->execute([$targetId, $me['id'], $reason]);
    // Remove from mic and mark offline
    db()->prepare("DELETE FROM mic_sessions WHERE user_id = ?")->execute([$targetId]);
    db()->prepare("UPDATE users SET is_online = 0 WHERE id = ?")->execute([$targetId]);
    db()->prepare("INSERT INTO mod_log (moderator_id, target_id, action, reason) VALUES (?, ?, 'ban', ?)")
        ->execute([$me['id'], $targetId, $reason]);
    // Notify
    db()->prepare("INSERT INTO notifications (user_id, from_user_id, type, title, body, reference_type) VALUES (?, ?, 'mod', 'تم حظرك', ?, 'moderation')")
        ->execute([$targetId, $me['id'], 'تم حظرك من السيرفر. السبب: ' . $reason]);
    echo json_encode(['success' => true, 'action' => 'ban']);
}
