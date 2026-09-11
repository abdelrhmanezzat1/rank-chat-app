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

// Check if already in room
$check = db()->prepare("SELECT id FROM mic_sessions WHERE room = ? AND user_id = ?");
$check->execute([$room, $me['id']]);
if ($check->fetch()) {
    echo json_encode(['success' => true]);
    exit;
}

// Find lowest available seat position
$occupied = db()->prepare("SELECT seat_position FROM mic_sessions WHERE room = ? ORDER BY seat_position ASC");
$occupied->execute([$room]);
$taken = array_column($occupied->fetchAll(), 'seat_position');
$nextSeat = 1;
for ($i = 1; $i <= 12; $i++) {
    if (!in_array($i, $taken)) { $nextSeat = $i; break; }
    if ($i === 12) { http_response_code(409); die(json_encode(['error' => 'الغرفة ممتلية'])); }
}

// Determine tier based on rank
$tier = 'normal';
if (in_array($me['rank_key'], ['owner', 'admin'])) $tier = 'vip';
elseif (in_array($me['rank_key'], ['diamond', 'gold'])) $tier = 'premium';

db()->prepare("INSERT IGNORE INTO mic_sessions (room, user_id, seat_position, seat_tier) VALUES (?, ?, ?, ?)")
    ->execute([$room, $me['id'], $nextSeat, $tier]);

echo json_encode(['success' => true, 'seat' => $nextSeat, 'tier' => $tier]);
