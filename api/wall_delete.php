<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();
$input = json_input();

$post_id = intval($input['post_id'] ?? 0);
if (!$post_id) { http_response_code(400); echo json_encode(['error'=>'Missing post_id']); exit; }

$db = db();

$stmt = $db->prepare("SELECT * FROM wall_posts WHERE id=?");
$stmt->execute([$post_id]);
$post = $stmt->fetch();

if (!$post) { http_response_code(404); echo json_encode(['error'=>'Post not found']); exit; }

$isAdmin = in_array($me['rank_key'], ['owner', 'admin']);
if ($post['author_id'] != $me['id'] && $post['user_id'] != $me['id'] && !$isAdmin) {
  http_response_code(403); echo json_encode(['error'=>'Not allowed']); exit;
}

$stmt = $db->prepare("DELETE FROM wall_posts WHERE id=?");
$stmt->execute([$post_id]);

echo json_encode(['success' => true]);
