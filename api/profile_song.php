<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();
$input = json_input();

$song_url = trim($input['song_url'] ?? '');

if ($song_url && !filter_var($song_url, FILTER_VALIDATE_URL)) {
  http_response_code(400); echo json_encode(['error'=>'Invalid URL']); exit;
}

$db = db();
$stmt = $db->prepare("UPDATE users SET profile_song_url = ? WHERE id = ?");
$stmt->execute([$song_url ?: null, $me['id']]);

echo json_encode(['success' => true, 'song_url' => $song_url]);
