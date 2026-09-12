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
$category = trim($input['category'] ?? 'general');

if (!$title || !$content) {
  http_response_code(400); echo json_encode(['error'=>'Title and content required']); exit;
}

$db = db();
$stmt = $db->prepare("INSERT INTO news (title, content, category, created_by) VALUES (?, ?, ?, ?)");
$stmt->execute([$title, $content, $category, $me['id']]);

echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
