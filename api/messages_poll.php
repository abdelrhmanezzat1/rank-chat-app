<?php
// polling: يجيب أي رسايل جديدة بعد ID معين (بدل websocket)
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

$convId = (int)($_GET['conversation_id'] ?? 0);
$afterId = (int)($_GET['after_id'] ?? 0);

$stmt = db()->prepare("SELECT * FROM conversations WHERE id = ? AND (user_a = ? OR user_b = ?)");
$stmt->execute([$convId, $me['id'], $me['id']]);
if (!$stmt->fetch()) { http_response_code(403); die(json_encode(['error' => 'غير مصرح'])); }

$stmt = db()->prepare("SELECT m.id, m.sender_id, m.content, m.sent_at, m.effect_id, me.css_class AS effect_css, me.icon AS effect_icon FROM messages m LEFT JOIN message_effects me ON m.effect_id = me.id WHERE m.conversation_id = ? AND m.id > ? ORDER BY m.id ASC");
$stmt->execute([$convId, $afterId]);
echo json_encode($stmt->fetchAll());
