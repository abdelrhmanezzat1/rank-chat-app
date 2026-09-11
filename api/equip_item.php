<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

$in = json_input();
$itemId = (int)($in['item_id'] ?? 0);
$equip = (int)($in['equip'] ?? 1); // 1 = equip, 0 = unequip

if ($itemId <= 0) {
    http_response_code(422);
    die(json_encode(['error' => 'معرف المنتج غير صالح']));
}

// Check owned
$stmt = db()->prepare("SELECT 1 FROM user_inventory WHERE user_id = ? AND item_id = ?");
$stmt->execute([$me['id'], $itemId]);
if (!$stmt->fetch()) {
    http_response_code(403);
    die(json_encode(['error' => 'المنتج ده مش عندك']));
}

// Get item type
$stmt = db()->prepare("SELECT item_type FROM store_items WHERE id = ?");
$stmt->execute([$itemId]);
$item = $stmt->fetch();
if (!$item) {
    http_response_code(404);
    die(json_encode(['error' => 'المنتج مش موجود']));
}

$type = $item['item_type'];

db()->beginTransaction();
try {
    if ($type === 'frame') {
        // Legacy frame equip
        db()->prepare("UPDATE user_frames SET equipped = 0 WHERE user_id = ?")->execute([$me['id']]);
        db()->prepare("UPDATE user_frames SET equipped = 1 WHERE user_id = ? AND frame_id = ?")->execute([$me['id'], $itemId]);
        db()->prepare("UPDATE users SET equipped_frame_id = ? WHERE id = ?")->execute([$itemId, $me['id']]);
    } else {
        // Unequip current item of this type
        $colMap = [
            'row_theme' => 'equipped_row_theme_id',
            'name_theme' => 'equipped_name_theme_id',
            'bg_skin' => 'equipped_bg_skin_id',
        ];
        $col = $colMap[$type];

        // Unequip all of this type in inventory
        db()->prepare("UPDATE user_inventory ui
                       JOIN store_items si ON ui.item_id = si.id
                       SET ui.equipped = 0
                       WHERE ui.user_id = ? AND si.item_type = ?")
            ->execute([$me['id'], $type]);

        if ($equip) {
            // Equip the selected item
            db()->prepare("UPDATE user_inventory SET equipped = 1 WHERE user_id = ? AND item_id = ?")
                ->execute([$me['id'], $itemId]);
            db()->prepare("UPDATE users SET $col = ? WHERE id = ?")
                ->execute([$itemId, $me['id']]);
        } else {
            db()->prepare("UPDATE users SET $col = NULL WHERE id = ?")
                ->execute([$me['id']]);
        }
    }
    db()->commit();
} catch (Exception $e) {
    db()->rollBack();
    http_response_code(500);
    die(json_encode(['error' => 'فشل تفعيل المنتج']));
}

echo json_encode(['success' => true]);
