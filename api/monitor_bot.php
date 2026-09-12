<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();
$input = json_input();

$content = trim($input['content'] ?? '');
$userId = intval($input['user_id'] ?? $me['id']);

if (!$content) {
  echo json_encode(['flagged' => false]);
  exit;
}

$db = db();
$flags = [];

// Check banned words
$stmt = $db->prepare("SELECT word, is_regex FROM banned_words");
$stmt->execute([]);
$words = $stmt->fetchAll();

$contentLower = mb_strtolower($content);
foreach ($words as $w) {
  if ($w['is_regex']) {
    if (preg_match($w['word'], $contentLower)) {
      $flags[] = 'banned_word: ' . $w['word'];
    }
  } else {
    if (mb_strpos($contentLower, mb_strtolower($w['word'])) !== false) {
      $flags[] = 'banned_word: ' . $w['word'];
    }
  }
}

// Check spam: same user sent same content 3+ times in last 5 minutes
$stmt = $db->prepare("
  SELECT COUNT(*) FROM messages
  WHERE sender_id = ? AND content = ? AND created_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
");
$stmt->execute([$userId, $content]);
$spamCount = $stmt->fetchColumn();
if ($spamCount >= 3) {
  $flags[] = 'spam_repeat';
}

// Check rapid messages: 10+ messages in last 30 seconds
$stmt = $db->prepare("
  SELECT COUNT(*) FROM messages
  WHERE sender_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 30 SECOND)
");
$stmt->execute([$userId]);
$rapidCount = $stmt->fetchColumn();
if ($rapidCount >= 10) {
  $flags[] = 'spam_rapid';
}

if (!empty($flags)) {
  $reason = implode('; ', $flags);
  $stmt = $db->prepare("INSERT INTO spam_log (user_id, message_content, reason) VALUES (?, ?, ?)");
  $stmt->execute([$userId, mb_substr($content, 0, 200), $reason]);

  // Also add to mod_log
  $stmt = $db->prepare("INSERT INTO mod_log (moderator_id, target_id, action, reason) VALUES (0, ?, 'auto_flag', ?)");
  $stmt->execute([$userId, $reason]);
}

echo json_encode(['flagged' => !empty($flags), 'flags' => $flags]);
