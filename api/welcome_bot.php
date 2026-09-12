<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();
$input = json_input();

$room = trim($input['room'] ?? 'main');
$userId = intval($input['user_id'] ?? 0);
$username = trim($input['username'] ?? '');

if (!$userId || !$username) {
  http_response_code(400); echo json_encode(['error'=>'Missing user_id or username']); exit;
}

$db = db();

$stmt = $db->prepare("SELECT id FROM welcome_bot_log WHERE user_id = ? AND room = ?");
$stmt->execute([$userId, $room]);
$alreadyWelcomed = $stmt->fetch();

if ($alreadyWelcomed) {
  echo json_encode(['welcomed' => false, 'reason' => 'already_welcomed']);
  exit;
}

$stmt = $db->prepare("INSERT INTO welcome_bot_log (user_id, room) VALUES (?, ?)");
$stmt->execute([$userId, $room]);

$welcomeMessage = "مرحباً {$username}! أهلاً وسهلاً بك في الغرفة. نتمنى لك وقتاً ممتعاً!";

$stmt = db()->prepare("INSERT INTO messages (conversation_id, sender_id, content, is_system) VALUES (0, 0, ?, 1)");
$stmt->execute([$welcomeMessage]);

echo json_encode(['welcomed' => true, 'message' => $welcomeMessage]);
