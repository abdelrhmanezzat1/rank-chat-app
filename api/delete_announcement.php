<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

if (!in_array($me['rank_key'], ['owner', 'admin'])) {
  http_response_code(403); echo json_encode(['error'=>'Not allowed']); exit;
}

$input = json_input();
$id = intval($input['id'] ?? 0);
if (!$id) { http_response_code(400); echo json_encode(['error'=>'Missing id']); exit; }

$db = db();
$stmt = $db->prepare("UPDATE announcements SET is_active = 0 WHERE id = ?");
$stmt->execute([$id]);

echo json_encode(['success' => true]);
