<?php
require_once __DIR__ . '/../config/auth.php';
require_once __DIR__ . '/../config/voice.php';
header('Content-Type: application/json; charset=utf-8');

$me = require_login();
$room = trim($_GET['room'] ?? $_POST['room'] ?? 'main') ?: 'main';

// Verify user is actually in the mic session for this room
$stmt = db()->prepare("SELECT 1 FROM mic_sessions WHERE room = ? AND user_id = ?");
$stmt->execute([$room, $me['id']]);
if (!$stmt->fetch()) {
    http_response_code(403);
    die(json_encode(['error' => 'لازم تنضم للمايك الأول']));
}

// HMAC-SHA256 signed token (no external libraries needed)
$secret = VOICE_SECRET;
$payload = json_encode([
    'user_id' => (int)$me['id'],
    'username' => $me['username'],
    'room' => $room,
    'exp' => time() + 60  // 60 second TTL
]);
$base64Payload = rtrim(base64_encode($payload), '=');
$signature = rtrim(base64_encode(hash_hmac('sha256', $base64Payload, $secret, true)), '=');
$token = $base64Payload . '.' . $signature;

// Voice server URL (configurable via env or default)
$voiceUrl = defined('VOICE_SERVER_URL') ? VOICE_SERVER_URL : 'ws://localhost:3001';

echo json_encode([
    'token' => $token,
    'voice_server_url' => $voiceUrl
]);
