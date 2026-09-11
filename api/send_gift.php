<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$sender = require_login();

$in = json_input();
$giftId = (int)($in['gift_id'] ?? 0);
$receiverId = (int)($in['receiver_id'] ?? 0);
$message = trim($in['message'] ?? '');

if ($giftId <= 0 || $receiverId <= 0) {
    http_response_code(422);
    die(json_encode(['error' => 'بيانات غير مكتملة']));
}

if ($receiverId === $sender['id']) {
    http_response_code(422);
    die(json_encode(['error' => 'مش هتبعت هدية لنفسك']));
}

// Check gift exists
$stmt = db()->prepare("SELECT * FROM gifts WHERE id = ?");
$stmt->execute([$giftId]);
$gift = $stmt->fetch();
if (!$gift) {
    http_response_code(404);
    die(json_encode(['error' => 'الهدية مش موجودة']));
}

// Check receiver exists
$stmt = db()->prepare("SELECT id, username FROM users WHERE id = ?");
$stmt->execute([$receiverId]);
$receiver = $stmt->fetch();
if (!$receiver) {
    http_response_code(404);
    die(json_encode(['error' => 'المستخدم مش موجود']));
}

// Deduct coins from sender
$stmt = db()->prepare("UPDATE users SET coins = coins - ? WHERE id = ? AND coins >= ?");
$stmt->execute([$gift['price'], $sender['id'], $gift['price']]);

if ($stmt->rowCount() === 0) {
    http_response_code(402);
    die(json_encode(['error' => 'مفيش عندك كوينز كفاية']));
}

// Award coins and XP to receiver
db()->prepare("UPDATE users SET coins = coins + ?, xp = xp + ? WHERE id = ?")
    ->execute([$gift['price'], $gift['xp_value'], $receiverId]);

// Log both transactions
db()->prepare("INSERT INTO transactions (user_id, type, amount, source, reference_id) VALUES (?, 'spend', ?, 'gift', ?)")
    ->execute([$sender['id'], $gift['price'], $giftId]);

db()->prepare("INSERT INTO transactions (user_id, type, amount, source, reference_id) VALUES (?, 'earn', ?, 'gift_received', ?)")
    ->execute([$receiverId, $gift['price'], $giftId]);

// Log the gift send
db()->prepare("INSERT INTO gift_sends (sender_id, receiver_id, gift_id, room, message) VALUES (?, ?, ?, ?, ?)")
    ->execute([$sender['id'], $receiverId, $giftId, $in['room'] ?? null, $message]);

// Notify receiver
db()->prepare("INSERT INTO notifications (user_id, from_user_id, type, title, body, reference_id, reference_type) VALUES (?, ?, 'gift', 'هدية جديدة', ?, ?, 'gift')")
    ->execute([$receiverId, $sender['id'], $gift['icon'] . ' ' . $gift['name'], $giftId]);

// Update sender XP
db()->prepare("UPDATE users SET xp = xp + ? WHERE id = ?")->execute([1, $sender['id']]);

echo json_encode([
    'success' => true,
    'gift' => ['id' => $gift['id'], 'name' => $gift['name'], 'icon' => $gift['icon']],
    'receiver' => ['id' => $receiver['id'], 'username' => $receiver['username']],
    'cost' => $gift['price'],
]);
