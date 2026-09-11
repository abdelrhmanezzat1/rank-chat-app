<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

$search = trim($_GET['search'] ?? '');
$filter = $_GET['filter'] ?? 'all';

$sql = "SELECT u.id, u.username, u.rank_key, u.is_online, u.last_seen,
               u.level, u.xp, u.country_code,
               u.animated_name, u.name_gradient_from, u.name_gradient_to,
               u.row_border_from, u.row_border_to, u.row_border_glow,
               r.label AS rank_label, r.color_hex, r.icon, r.priority,
               COALESCE(f.gradient_from, '#1A2338') AS frame_from,
               COALESCE(f.gradient_to, '#1A2338') AS frame_to,
               COALESCE(f.row_from, f.gradient_from, '#1A2338') AS frame_row_from,
               COALESCE(f.row_to, f.gradient_to, '#1A2338') AS frame_row_to,
               COALESCE(f.bubble_from, f.gradient_from, '#1A2338') AS frame_bubble_from,
               COALESCE(f.bubble_to, f.gradient_to, '#1A2338') AS frame_bubble_to,
               (SELECT COUNT(*) FROM mic_sessions m WHERE m.user_id = u.id AND m.room = 'main') AS on_mic
        FROM users u
        JOIN ranks r ON u.rank_key = r.`key`
        LEFT JOIN frames f ON u.equipped_frame_id = f.id
        WHERE u.id != ?";
$params = [$me['id']];

if ($search !== '') {
    $escaped = addcslashes($search, '%_');
    $sql .= " AND u.username LIKE ? ESCAPE '\\'";
    $params[] = "%$escaped%";
}

if ($filter === 'online') {
    $sql .= " AND u.is_online = 1";
} elseif ($filter === 'voice') {
    $sql .= " AND (SELECT COUNT(*) FROM mic_sessions m WHERE m.user_id = u.id AND m.room = 'main') > 0";
}

$sql .= " ORDER BY r.priority ASC, u.is_online DESC, u.username ASC";

$stmt = db()->prepare($sql);
$stmt->execute($params);
echo json_encode($stmt->fetchAll());
