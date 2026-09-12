<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

if (!in_array($me['rank_key'], ['owner', 'admin'])) {
  http_response_code(403); echo json_encode(['error'=>'Not allowed']); exit;
}

$db = db();

// Device fingerprints (recent)
$fingerprints = $db->query("
  SELECT df.id, df.user_id, u.username, df.fingerprint, df.ip_address, df.created_at, df.last_seen
  FROM device_fingerprints df
  JOIN users u ON df.user_id = u.id
  ORDER BY df.last_seen DESC
  LIMIT 50
")->fetchAll();

// Device bans
$bans = $db->query("SELECT * FROM device_bans ORDER BY created_at DESC LIMIT 50")->fetchAll();

// Alt account groups (fingerprints with multiple users)
$altGroups = $db->query("
  SELECT fingerprint, COUNT(DISTINCT user_id) as user_count, GROUP_CONCAT(DISTINCT u.username) as usernames
  FROM device_fingerprints df
  JOIN users u ON df.user_id = u.id
  GROUP BY fingerprint
  HAVING user_count > 1
  ORDER BY user_count DESC
  LIMIT 20
")->fetchAll();

// Spam log
$spamLogs = $db->query("
  SELECT sl.*, u.username
  FROM spam_log sl
  JOIN users u ON sl.user_id = u.id
  ORDER BY sl.created_at DESC
  LIMIT 50
")->fetchAll();

// Banned words
$bannedWords = $db->query("SELECT * FROM banned_words ORDER BY word ASC")->fetchAll();

echo json_encode([
  'fingerprints' => $fingerprints,
  'bans' => $bans,
  'alt_groups' => $altGroups,
  'spam_logs' => $spamLogs,
  'banned_words' => $bannedWords,
]);
