<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

$in = json_input();
$targetId = (int)($in['user_id'] ?? 0);

if ($targetId <= 0) {
    http_response_code(422);
    die(json_encode(['error' => 'معرف المستخدم غير صالح']));
}
if ($targetId === $me['id']) {
    http_response_code(422);
    die(json_encode(['error' => 'مش هتتابع نفسك']));
}

// Check target exists
$stmt = db()->prepare("SELECT id, username FROM users WHERE id = ?");
$stmt->execute([$targetId]);
$target = $stmt->fetch();
if (!$target) {
    http_response_code(404);
    die(json_encode(['error' => 'المستخدم مش موجود']));
}

// Check already following
$stmt = db()->prepare("SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?");
$stmt->execute([$me['id'], $targetId]);
if ($stmt->fetch()) {
    http_response_code(409);
    die(json_encode(['error' => 'بتتابعه بالفعل']));
}

db()->prepare("INSERT INTO follows (follower_id, following_id) VALUES (?, ?)")
    ->execute([$me['id'], $targetId]);

// Notify target
db()->prepare("INSERT INTO notifications (user_id, from_user_id, type, title, body, reference_type) VALUES (?, ?, 'follow', 'متاب جديد', ?, 'user')")
    ->execute([$targetId, $me['id'], $me['username'] . ' بدأ يتابعك']);

// Check if mutual (they follow us too)
$stmt = db()->prepare("SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?");
$stmt->execute([$targetId, $me['id']]);
$isMutual = (bool)$stmt->fetch();

echo json_encode(['success' => true, 'mutual' => $isMutual]);
