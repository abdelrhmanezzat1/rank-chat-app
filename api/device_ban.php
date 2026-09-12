<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

if (!in_array($me['rank_key'], ['owner', 'admin'])) {
  http_response_code(403); echo json_encode(['error'=>'Not allowed']); exit;
}

$input = json_input();
$fingerprint = trim($input['fingerprint'] ?? '');
$ip = trim($input['ip_address'] ?? '');
$reason = trim($input['reason'] ?? 'Device banned by admin');
$duration_hours = intval($input['duration_hours'] ?? 0);

if (!$fingerprint && !$ip) {
  http_response_code(400); echo json_encode(['error'=>'Provide fingerprint or ip_address']); exit;
}

$db = db();

$expiresAt = $duration_hours > 0 ? date('Y-m-d H:i:s', time() + $duration_hours * 3600) : null;

$stmt = $db->prepare("INSERT INTO device_bans (fingerprint, ip_address, reason, banned_by, expires_at) VALUES (?, ?, ?, ?, ?)");
$stmt->execute([$fingerprint ?: null, $ip ?: null, $reason, $me['id'], $expiresAt]);

// Log the action
$stmt = $db->prepare("INSERT INTO mod_log (moderator_id, target_id, action, reason) VALUES (?, 0, 'device_ban', ?)");
$stmt->execute([$me['id'], $reason . ($fingerprint ? " [fp:{$fingerprint}]" : "") . ($ip ? " [ip:{$ip}]" : "")]);

echo json_encode(['success' => true, 'ban_id' => $db->lastInsertId()]);
