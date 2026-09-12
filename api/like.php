<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();
$input = json_input();

$user_id = intval($input['user_id'] ?? 0);
if (!$user_id) { http_response_code(400); echo json_encode(['error'=>'Missing user_id']); exit; }

$db = db();

$stmt = $db->prepare("SELECT id FROM profile_likes WHERE user_id=? AND liker_id=?");
$stmt->execute([$user_id, $me['id']]);
$exists = $stmt->fetch();

if ($exists) {
  $stmt = $db->prepare("DELETE FROM profile_likes WHERE user_id=? AND liker_id=?");
  $stmt->execute([$user_id, $me['id']]);
  $liked = false;
} else {
  $stmt = $db->prepare("INSERT INTO profile_likes (user_id, liker_id) VALUES (?, ?)");
  $stmt->execute([$user_id, $me['id']]);
  $liked = true;

  if ($user_id != $me['id']) {
    $stmt = $db->prepare("INSERT INTO notifications (user_id, from_user_id, type, title, body) VALUES (?, ?, 'like', ?, ?)");
    $stmt->execute([$user_id, $me['id'], 'إعجاب جديد', $me['username'] . ' أعجب ببروفايلك']);
  }
}

$stmt = $db->prepare("SELECT COUNT(*) FROM profile_likes WHERE user_id=?");
$stmt->execute([$user_id]);
$count = $stmt->fetchColumn();

echo json_encode(['liked' => $liked, 'count' => (int)$count]);
