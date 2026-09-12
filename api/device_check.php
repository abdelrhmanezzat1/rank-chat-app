<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();
$input = json_input();

$fingerprint = trim($input['fingerprint'] ?? '');
$ip = $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https'
  ? ($_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '')
  : ($_SERVER['REMOTE_ADDR'] ?? '');
$ua = $_SERVER['HTTP_USER_AGENT'] ?? '';

if (!$fingerprint) {
  http_response_code(400); echo json_encode(['error'=>'Missing fingerprint']); exit;
}

$db = db();

$stmt = $db->prepare("INSERT INTO device_fingerprints (user_id, fingerprint, ip_address, user_agent) VALUES (?, ?, ?, ?)");
$stmt->execute([$me['id'], $fingerprint, $ip, $ua]);

// Check if this fingerprint is banned
$stmt = $db->prepare("SELECT id, reason FROM device_bans WHERE (fingerprint = ? OR ip_address = ?) AND (expires_at IS NULL OR expires_at > NOW())");
$stmt->execute([$fingerprint, $ip]);
$ban = $stmt->fetch();

if ($ban) {
  http_response_code(403);
  echo json_encode(['banned' => true, 'reason' => $ban['reason'] ?? 'Device banned']);
  exit;
}

// Check for alt accounts (same fingerprint, different user, within 7 days)
$stmt = $db->prepare("
  SELECT DISTINCT df.user_id, u.username, df.created_at
  FROM device_fingerprints df
  JOIN users u ON df.user_id = u.id
  WHERE df.fingerprint = ? AND df.user_id != ?
  ORDER BY df.created_at DESC
  LIMIT 10
");
$stmt->execute([$fingerprint, $me['id']]);
$altAccounts = $stmt->fetchAll();

// Check for same IP alt accounts (within 24h)
$stmt = $db->prepare("
  SELECT DISTINCT df.user_id, u.username, df.created_at
  FROM device_fingerprints df
  JOIN users u ON df.user_id = u.id
  WHERE df.ip_address = ? AND df.user_id != ? AND df.created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
  ORDER BY df.created_at DESC
  LIMIT 10
");
$stmt->execute([$ip, $me['id']]);
$ipAlts = $stmt->fetchAll();

echo json_encode([
  'success' => true,
  'alt_accounts' => $altAccounts,
  'ip_alt_accounts' => $ipAlts,
]);
