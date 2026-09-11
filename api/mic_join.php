<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();
$room = trim($_GET['room'] ?? $_POST['room'] ?? 'main') ?: 'main';

// Validate room name: alphanumeric + underscore, max 50 chars
if (!preg_match('/^[a-zA-Z0-9_]{1,50}$/', $room)) {
    http_response_code(422);
    die(json_encode(['error' => 'اسم الغرفة غير صالح']));
}

db()->prepare("INSERT IGNORE INTO mic_sessions (room, user_id) VALUES (?, ?)")->execute([$room, $me['id']]);
echo json_encode(['success' => true]);
