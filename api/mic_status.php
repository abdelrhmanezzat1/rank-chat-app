<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
require_login();
$room = trim($_GET['room'] ?? 'main') ?: 'main';

// Max 12 seats in the mic room
define('MAX_SEATS', 12);

$stmt = db()->prepare("
    SELECT u.id, u.username, u.rank_key, u.level,
           r.color_hex AS rank_color, r.icon AS rank_icon, r.label AS rank_label,
           COALESCE(f.gradient_from, '#1A2338') AS frame_from,
           COALESCE(f.gradient_to, '#1A2338') AS frame_to,
           m.seat_position, m.seat_tier
    FROM mic_sessions m
    JOIN users u ON u.id = m.user_id
    JOIN ranks r ON u.rank_key = r.`key`
    LEFT JOIN frames f ON u.equipped_frame_id = f.id
    WHERE m.room = ?
    ORDER BY m.seat_position ASC, m.joined_at ASC
");
$stmt->execute([$room]);
$occupied = $stmt->fetchAll();

// Build full seat list (1..12), marking occupied seats
$seats = [];
$occupiedIds = [];
foreach ($occupied as $u) {
    $occupiedIds[] = $u['id'];
    $seats[] = [
        'position' => (int)$u['seat_position'] ?: (count($occupied) > 0 ? array_search($u, $occupied) + 1 : 1),
        'tier' => $u['seat_tier'] ?: 'normal',
        'user' => $u,
    ];
}

// Fill empty seats up to MAX_SEATS
for ($i = 1; $i <= MAX_SEATS; $i++) {
    $found = false;
    foreach ($seats as &$s) {
        if ($s['position'] == $i) { $found = true; break; }
    }
    if (!$found) {
        $seats[] = ['position' => $i, 'tier' => 'normal', 'user' => null];
    }
}

// Sort by position
usort($seats, fn($a, $b) => $a['position'] - $b['position']);

echo json_encode([
    'room' => $room,
    'max_seats' => MAX_SEATS,
    'seats' => $seats,
    'count' => count($occupied),
]);
