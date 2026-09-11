<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

$stmt = db()->prepare("
    SELECT f.*, (uf.user_id IS NOT NULL) AS owned, IFNULL(uf.equipped,0) AS equipped
    FROM frames f
    LEFT JOIN user_frames uf ON uf.frame_id = f.id AND uf.user_id = ?
    ORDER BY f.price ASC
");
$stmt->execute([$me['id']]);
echo json_encode(['coins' => (int)$me['coins'], 'frames' => $stmt->fetchAll()]);
