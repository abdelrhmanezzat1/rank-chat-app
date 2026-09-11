<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

$in = json_input();
$convId = (int)($in['conversation_id'] ?? 0);
$content = trim($in['content'] ?? '');

if ($convId <= 0 || $content === '') {
    http_response_code(422);
    die(json_encode(['error' => 'الرسالة فاضية']));
}
if (mb_strlen($content) > 2000) {
    http_response_code(422);
    die(json_encode(['error' => 'الرسالة طويلة جدًا']));
}

// تأكد إن اليوزر ده فعلًا طرف في المحادثة دي
$stmt = db()->prepare("SELECT * FROM conversations WHERE id = ? AND (user_a = ? OR user_b = ?)");
$stmt->execute([$convId, $me['id'], $me['id']]);
if (!$stmt->fetch()) { http_response_code(403); die(json_encode(['error' => 'غير مصرح'])); }

$stmt = db()->prepare("INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)");
$stmt->execute([$convId, $me['id'], $content]);

echo json_encode(['success' => true, 'id' => db()->lastInsertId(), 'sent_at' => date('Y-m-d H:i:s')]);
