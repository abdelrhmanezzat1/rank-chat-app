<?php
// يجيب المحادثة مع يوزر معين، ويعمل واحدة جديدة لو مفيش
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

$otherId = (int)($_GET['with'] ?? 0);
if ($otherId <= 0) { http_response_code(422); die(json_encode(['error' => 'user id مطلوب'])); }

// Verify the target user actually exists
$stmt = db()->prepare("SELECT id FROM users WHERE id = ?");
$stmt->execute([$otherId]);
if (!$stmt->fetch()) { http_response_code(404); die(json_encode(['error' => 'المستخدم مش موجود'])); }

$a = min($me['id'], $otherId);
$b = max($me['id'], $otherId);

$stmt = db()->prepare("SELECT id FROM conversations WHERE user_a = ? AND user_b = ?");
$stmt->execute([$a, $b]);
$conv = $stmt->fetch();

if (!$conv) {
    db()->prepare("INSERT INTO conversations (user_a, user_b) VALUES (?, ?)")->execute([$a, $b]);
    $convId = db()->lastInsertId();
} else {
    $convId = $conv['id'];
}

$stmt = db()->prepare("SELECT id, sender_id, content, sent_at FROM messages WHERE conversation_id = ? ORDER BY id ASC");
$stmt->execute([$convId]);
$messages = $stmt->fetchAll();

db()->prepare("UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ?")->execute([$convId, $me['id']]);

echo json_encode(['conversation_id' => (int)$convId, 'messages' => $messages]);
