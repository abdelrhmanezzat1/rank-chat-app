<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();
$input = json_input();

$user_id = intval($input['user_id'] ?? 0);
$content = trim($input['content'] ?? '');

if (!$user_id || !$content) { http_response_code(400); echo json_encode(['error'=>'Missing user_id or content']); exit; }
if (mb_strlen($content) > 500) { http_response_code(400); echo json_encode(['error'=>'Content too long (max 500)']); exit; }

$db = db();

$stmt = $db->prepare("INSERT INTO wall_posts (user_id, author_id, content) VALUES (?, ?, ?)");
$stmt->execute([$user_id, $me['id'], $content]);

if ($user_id != $me['id']) {
  $stmt = $db->prepare("INSERT INTO notifications (user_id, from_user_id, type, title, body) VALUES (?, ?, 'wall', ?, ?)");
  $stmt->execute([$user_id, $me['id'], 'منشور جديد على جدارك', $me['username'] . ' كتب على جدارك']);
}

echo json_encode(['success' => true, 'post_id' => $db->lastInsertId()]);
