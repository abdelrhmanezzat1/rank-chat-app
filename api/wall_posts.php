<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

$user_id = intval($_GET['user_id'] ?? 0);
if (!$user_id) { http_response_code(400); echo json_encode(['error'=>'Missing user_id']); exit; }

$db = db();

$stmt = $db->prepare("
  SELECT wp.id, wp.content, wp.created_at, u.id as author_id, u.username, u.rank_key, r.color_hex as rank_color
  FROM wall_posts wp
  JOIN users u ON wp.author_id = u.id
  LEFT JOIN ranks r ON u.rank_key = r.`key`
  WHERE wp.user_id = ?
  ORDER BY wp.created_at DESC
  LIMIT 50
");
$stmt->execute([$user_id]);
$posts = $stmt->fetchAll();

echo json_encode($posts);
