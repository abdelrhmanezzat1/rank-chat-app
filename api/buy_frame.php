<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

$in = json_input();
$frameId = (int)($in['frame_id'] ?? 0);

$stmt = db()->prepare("SELECT * FROM frames WHERE id = ?");
$stmt->execute([$frameId]);
$frame = $stmt->fetch();
if (!$frame) { http_response_code(404); die(json_encode(['error' => 'الإطار مش موجود'])); }

$stmt = db()->prepare("SELECT 1 FROM user_frames WHERE user_id = ? AND frame_id = ?");
$stmt->execute([$me['id'], $frameId]);
if ($stmt->fetch()) { http_response_code(409); die(json_encode(['error' => 'الإطار ده عندك بالفعل'])); }

// Atomic deduction: only succeeds if balance is sufficient (prevents double-spend race condition)
$stmt = db()->prepare("UPDATE users SET coins = coins - ? WHERE id = ? AND coins >= ?");
$stmt->execute([$frame['price'], $me['id'], $frame['price']]);

if ($stmt->rowCount() === 0) {
    http_response_code(402);
    die(json_encode(['error' => 'مفيش عندك كوينز كفاية']));
}

db()->prepare("INSERT INTO user_frames (user_id, frame_id, equipped) VALUES (?, ?, 0)")->execute([$me['id'], $frameId]);

echo json_encode(['success' => true]);
