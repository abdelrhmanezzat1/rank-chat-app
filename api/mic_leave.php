<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();
$room = trim($_GET['room'] ?? $_POST['room'] ?? 'main') ?: 'main';
db()->prepare("DELETE FROM mic_sessions WHERE room = ? AND user_id = ?")->execute([$room, $me['id']]);
echo json_encode(['success' => true]);
