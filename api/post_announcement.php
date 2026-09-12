<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

if (!in_array($me['rank_key'], ['owner', 'admin'])) {
  http_response_code(403); echo json_encode(['error'=>'Not allowed']); exit;
}

$input = json_input();
$title = trim($input['title'] ?? '');
$content = trim($input['content'] ?? '');
$room = trim($input['room'] ?? '') ?: null;
$priority = intval($input['priority'] ?? 0);
$expires_at = $input['expires_at'] ?? null;

if (!$title || !$content) {
  http_response_code(400); echo json_encode(['error'=>'Title and content required']); exit;
}

$db = db();
$stmt = $db->prepare("INSERT INTO announcements (title, content, room, priority, expires_at, created_by) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->execute([$title, $content, $room, $priority, $expires_at, $me['id']]);

echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
