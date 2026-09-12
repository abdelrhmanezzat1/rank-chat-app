<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

if (!in_array($me['rank_key'], ['owner', 'admin'])) {
  http_response_code(403); echo json_encode(['error'=>'Not allowed']); exit;
}

$input = json_input();
$action = $input['action'] ?? 'list';
$db = db();

if ($action === 'add') {
  $word = trim($input['word'] ?? '');
  $isRegex = intval($input['is_regex'] ?? 0);
  if (!$word) { http_response_code(400); echo json_encode(['error'=>'Word required']); exit; }
  $stmt = $db->prepare("INSERT IGNORE INTO banned_words (word, is_regex) VALUES (?, ?)");
  $stmt->execute([$word, $isRegex]);
  echo json_encode(['success' => true]);
} elseif ($action === 'delete') {
  $id = intval($input['id'] ?? 0);
  $stmt = $db->prepare("DELETE FROM banned_words WHERE id = ?");
  $stmt->execute([$id]);
  echo json_encode(['success' => true]);
} else {
  $words = $db->query("SELECT * FROM banned_words ORDER BY word ASC")->fetchAll();
  echo json_encode($words);
}
