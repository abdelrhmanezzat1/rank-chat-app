<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

$in = json_input();
$itemId = (int)($in['item_id'] ?? 0);

if ($itemId <= 0) {
    http_response_code(422);
    die(json_encode(['error' => 'معرف المنتج غير صالح']));
}

// Check item exists
$stmt = db()->prepare("SELECT * FROM store_items WHERE id = ?");
$stmt->execute([$itemId]);
$item = $stmt->fetch();
if (!$item) {
    http_response_code(404);
    die(json_encode(['error' => 'المنتج مش موجود']));
}

// Check if already owned
$stmt = db()->prepare("SELECT 1 FROM user_inventory WHERE user_id = ? AND item_id = ?");
$stmt->execute([$me['id'], $itemId]);
if ($stmt->fetch()) {
    http_response_code(409);
    die(json_encode(['error' => 'المنتج ده عندك بالفعل']));
}

// Atomic deduction
$stmt = db()->prepare("UPDATE users SET coins = coins - ? WHERE id = ? AND coins >= ?");
$stmt->execute([$item['price'], $me['id'], $item['price']]);

if ($stmt->rowCount() === 0) {
    http_response_code(402);
    die(json_encode(['error' => 'مفيش عندك كوينز كفاية']));
}

// Add to inventory
db()->prepare("INSERT INTO user_inventory (user_id, item_id, equipped) VALUES (?, ?, 0)")
    ->execute([$me['id'], $itemId]);

// Log transaction (if transactions table exists)
try {
    db()->prepare("INSERT INTO transactions (user_id, type, amount, source, reference_id) VALUES (?, 'spend', ?, 'store_item', ?)")
        ->execute([$me['id'], $item['price'], $itemId]);
} catch (PDOException $e) {
    // transactions table may not exist yet, ignore
}

echo json_encode(['success' => true, 'item' => $item]);
