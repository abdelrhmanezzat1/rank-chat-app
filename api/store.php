<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

$type = $_GET['type'] ?? 'all';

// Get frames (legacy)
$stmt = db()->prepare("
    SELECT f.*, (uf.user_id IS NOT NULL) AS owned, IFNULL(uf.equipped,0) AS equipped
    FROM frames f
    LEFT JOIN user_frames uf ON uf.frame_id = f.id AND uf.user_id = ?
    ORDER BY f.price ASC
");
$stmt->execute([$me['id']]);
$frames = $stmt->fetchAll();

// Get store items (new system)
$itemTypes = ['frame', 'row_theme', 'name_theme', 'bg_skin'];
$items = [];
foreach ($itemTypes as $t) {
    if ($type !== 'all' && $type !== $t) continue;

    $stmt = db()->prepare("
        SELECT si.*,
               (ui.user_id IS NOT NULL) AS owned,
               IFNULL(ui.equipped, 0) AS equipped
        FROM store_items si
        LEFT JOIN user_inventory ui ON ui.item_id = si.id AND ui.user_id = ?
        WHERE si.item_type = ?
        ORDER BY si.price ASC
    ");
    $stmt->execute([$me['id'], $t]);
    $items[$t] = $stmt->fetchAll();
}

// Get user's equipped items
$equipped = db()->prepare("
    SELECT equipped_row_theme_id, equipped_name_theme_id, equipped_bg_skin_id
    FROM users WHERE id = ?
");
$equipped->execute([$me['id']]);
$equippedRow = $equipped->fetch();

echo json_encode([
    'coins' => (int)$me['coins'],
    'frames' => $frames,
    'items' => $items,
    'equipped' => $equippedRow,
]);
