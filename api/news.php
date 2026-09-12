<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

$db = db();

$page = max(1, intval($_GET['page'] ?? 1));
$limit = 20;
$offset = ($page - 1) * $limit;

$stmt = $db->prepare("
  SELECT n.id, n.title, n.content, n.category, n.created_at, u.username AS author_name
  FROM news n
  LEFT JOIN users u ON n.created_by = u.id
  WHERE n.is_published = 1
  ORDER BY n.created_at DESC
  LIMIT ? OFFSET ?
");
$stmt->execute([$limit, $offset]);
$articles = $stmt->fetchAll();

$total = $db->query("SELECT COUNT(*) FROM news WHERE is_published = 1")->fetchColumn();

echo json_encode(['articles' => $articles, 'total' => (int)$total, 'page' => $page]);
