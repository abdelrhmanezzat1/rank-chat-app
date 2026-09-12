<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

if (!in_array($me['rank_key'], ['owner', 'admin'])) {
  http_response_code(403); echo json_encode(['error'=>'Not allowed']); exit;
}

$input = json_input();
$message = trim($input['message'] ?? '');
$room = trim($input['room'] ?? '');

if (!$message) {
  http_response_code(400); echo json_encode(['error'=>'Message required']); exit;
}

$db = db();

// Store as system message
$fullMessage = "[إعلان] {$message}";
$stmt = $db->prepare("INSERT INTO messages (conversation_id, sender_id, content, is_system) VALUES (0, 0, ?, 1)");
$stmt->execute([$fullMessage]);

// Also create as announcement if room specified
if ($room) {
  $stmt = $db->prepare("INSERT INTO announcements (title, content, room, priority, created_by) VALUES (?, ?, ?, 10, ?)");
  $stmt->execute(['إعلان عام', $message, $room, $me['id']]);
}

echo json_encode(['success' => true, 'message_id' => $db->lastInsertId()]);
