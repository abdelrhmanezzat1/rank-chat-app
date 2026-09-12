<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();
$input = json_input();

$tier_id = intval($input['tier_id'] ?? 0);
if (!$tier_id) { http_response_code(400); echo json_encode(['error'=>'Missing tier_id']); exit; }

$db = db();

$stmt = $db->prepare("SELECT * FROM vip_tiers WHERE id=?");
$stmt->execute([$tier_id]);
$tier = $stmt->fetch();
if (!$tier) { http_response_code(404); echo json_encode(['error'=>'VIP tier not found']); exit; }

$stmt = $db->prepare("SELECT coins FROM users WHERE id=?");
$stmt->execute([$me['id']]);
$coins = $stmt->fetchColumn();

if ($coins < $tier['price_coins']) {
  http_response_code(400); echo json_encode(['error'=>'رصيدك غير كافي']); exit;
}

$stmt = $db->prepare("UPDATE users SET coins = coins - ? WHERE id = ?");
$stmt->execute([$tier['price_coins'], $me['id']]);

$stmt = $db->prepare("SELECT vip_expires_at FROM users WHERE id=?");
$stmt->execute([$me['id']]);
$current_expires = $stmt->fetchColumn();

if ($current_expires && strtotime($current_expires) > time()) {
  $base = $current_expires;
} else {
  $base = date('Y-m-d H:i:s');
}

$new_expires = date('Y-m-d H:i:s', strtotime($base . " +{$tier['duration_days']} days"));

$stmt = $db->prepare("UPDATE users SET vip_expires_at = ?, vip_tier_id = ? WHERE id = ?");
$stmt->execute([$new_expires, $tier_id, $me['id']]);

$stmt = $db->prepare("INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, 'vip_purchase', ?)");
$stmt->execute([$me['id'], -$tier['price_coins'], "شراء {$tier['name']}"]);

echo json_encode([
  'success' => true,
  'vip_expires_at' => $new_expires,
  'tier_name' => $tier['name'],
]);
