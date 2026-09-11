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
$msgId = db()->lastInsertId();

// Get recipient (other user in conversation)
$stmt = db()->prepare("SELECT IF(user_a = ?, user_b, user_a) AS recipient_id FROM conversations WHERE id = ?");
$stmt->execute([$me['id'], $convId]);
$recipient = $stmt->fetch();
if ($recipient && $recipient['recipient_id'] != $me['id']) {
    db()->prepare("INSERT INTO notifications (user_id, from_user_id, type, title, body, reference_id, reference_type) VALUES (?, ?, 'message', 'رسالة جديدة', ?, ?, 'conversation')")
        ->execute([$recipient['recipient_id'], $me['id'], mb_substr($content, 0, 100), $convId]);
}

// Award 1 coin per message (cooldown enforced by earn_coins.php)
$cd = db()->prepare("SELECT created_at FROM transactions WHERE user_id = ? AND source = 'message' ORDER BY created_at DESC LIMIT 1");
$cd->execute([$me['id']]);
$lastMsg = $cd->fetch();
$elapsed = $lastMsg ? time() - strtotime($lastMsg['created_at']) : 999;
if ($elapsed >= 30) {
    $hourLimit = db()->prepare("SELECT IFNULL(SUM(amount),0) FROM transactions WHERE user_id = ? AND source = 'message' AND created_at > (NOW() - INTERVAL 1 HOUR)");
    $hourLimit->execute([$me['id']]);
    if ($hourLimit->fetchColumn() < 20) {
        db()->prepare("UPDATE users SET coins = coins + 1 WHERE id = ?")->execute([$me['id']]);
        db()->prepare("INSERT INTO transactions (user_id, type, amount, source) VALUES (?, 'earn', 1, 'message')")->execute([$me['id']]);
    }
}

echo json_encode(['success' => true, 'id' => $msgId, 'sent_at' => date('Y-m-d H:i:s')]);
