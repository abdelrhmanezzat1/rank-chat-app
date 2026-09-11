<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

$in = json_input();
$effectId = (int)($in['effect_id'] ?? 0);

if ($effectId <= 0) {
    http_response_code(422);
    die(json_encode(['error' => 'معرف التأثير غير صالح']));
}

// Check effect exists
$stmt = db()->prepare("SELECT * FROM message_effects WHERE id = ?");
$stmt->execute([$effectId]);
$effect = $stmt->fetch();
if (!$effect) {
    http_response_code(404);
    die(json_encode(['error' => 'التأثير مش موجود']));
}

// Check if already owned
$stmt = db()->prepare("SELECT 1 FROM user_effects WHERE user_id = ? AND effect_id = ?");
$stmt->execute([$me['id'], $effectId]);
if ($stmt->fetch()) {
    http_response_code(409);
    die(json_encode(['error' => 'التأثير ده عندك بالفعل']));
}

// Atomic deduction
$stmt = db()->prepare("UPDATE users SET coins = coins - ? WHERE id = ? AND coins >= ?");
$stmt->execute([$effect['price'], $me['id'], $effect['price']]);

if ($stmt->rowCount() === 0) {
    http_response_code(402);
    die(json_encode(['error' => 'مفيش عندك كوينز كفاية']));
}

// Add to inventory
db()->prepare("INSERT INTO user_effects (user_id, effect_id) VALUES (?, ?)")
    ->execute([$me['id'], $effectId]);

// Log transaction
try {
    db()->prepare("INSERT INTO transactions (user_id, type, amount, source, reference_id) VALUES (?, 'spend', ?, 'message_effect', ?)")
        ->execute([$me['id'], $effect['price'], $effectId]);
} catch (PDOException $e) {}

echo json_encode(['success' => true, 'effect' => $effect]);
