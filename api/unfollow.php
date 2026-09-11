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

$stmt = db()->prepare("DELETE FROM follows WHERE follower_id = ? AND following_id = ?");
$stmt->execute([$me['id'], $targetId]);

echo json_encode(['success' => true, 'unfollowed' => $stmt->rowCount() > 0]);
