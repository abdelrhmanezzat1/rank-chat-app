<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

$db = db();
$tiers = $db->query("SELECT * FROM vip_tiers ORDER BY price_coins ASC")->fetchAll();

$stmt = $db->prepare("SELECT vip_expires_at, vip_tier_id FROM users WHERE id=?");
$stmt->execute([$me['id']]);
$myVip = $stmt->fetch();

$isActive = $myVip['vip_expires_at'] && strtotime($myVip['vip_expires_at']) > time();

echo json_encode([
  'tiers' => $tiers,
  'my_vip' => [
    'active' => $isActive,
    'expires_at' => $myVip['vip_expires_at'],
    'tier_id' => $myVip['vip_tier_id'],
  ]
]);
