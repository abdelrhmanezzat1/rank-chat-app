<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

$in = json_input();
$frameId = (int)($in['frame_id'] ?? 0);

$stmt = db()->prepare("SELECT 1 FROM user_frames WHERE user_id = ? AND frame_id = ?");
$stmt->execute([$me['id'], $frameId]);
if (!$stmt->fetch()) { http_response_code(403); die(json_encode(['error' => 'الإطار ده مش عندك'])); }

// Wrap all three UPDATEs in a transaction so they succeed or fail atomically
db()->beginTransaction();
try {
    db()->prepare("UPDATE user_frames SET equipped = 0 WHERE user_id = ?")->execute([$me['id']]);
    db()->prepare("UPDATE user_frames SET equipped = 1 WHERE user_id = ? AND frame_id = ?")->execute([$me['id'], $frameId]);
    db()->prepare("UPDATE users SET equipped_frame_id = ? WHERE id = ?")->execute([$frameId, $me['id']]);
    db()->commit();
} catch (Exception $e) {
    db()->rollBack();
    http_response_code(500);
    die(json_encode(['error' => 'فشل تفعيل الإطار']));
}

echo json_encode(['success' => true]);
