<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

$search = trim($_GET['search'] ?? '');
$sql = "SELECT u.id, u.username, u.rank_key, u.is_online, u.last_seen,
               r.label AS rank_label, r.color_hex, r.icon, r.priority,
               (SELECT gradient_from FROM frames WHERE id = u.equipped_frame_id) AS frame_from,
               (SELECT gradient_to FROM frames WHERE id = u.equipped_frame_id) AS frame_to,
               (SELECT COUNT(*) FROM mic_sessions m WHERE m.user_id = u.id AND m.room = 'main') AS on_mic
        FROM users u JOIN ranks r ON u.rank_key = r.`key`
        WHERE u.id != ?";
$params = [$me['id']];
if ($search !== '') {
    // Escape LIKE wildcards so % and _ in search are treated literally
    $escaped = addcslashes($search, '%_');
    $sql .= " AND u.username LIKE ? ESCAPE '\\'";
    $params[] = "%$escaped%";
}
$sql .= " ORDER BY r.priority ASC, u.is_online DESC, u.username ASC";

$stmt = db()->prepare($sql);
$stmt->execute($params);
echo json_encode($stmt->fetchAll());
