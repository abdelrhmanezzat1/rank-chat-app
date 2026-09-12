<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

$db = db();

$stmt = $db->prepare("
  SELECT id, title, content, room, priority, expires_at, created_at
  FROM announcements
  WHERE is_active = 1
    AND (expires_at IS NULL OR expires_at > NOW())
  ORDER BY priority DESC, created_at DESC
  LIMIT 20
");
$stmt->execute([]);
$announcements = $stmt->fetchAll();

echo json_encode($announcements);
