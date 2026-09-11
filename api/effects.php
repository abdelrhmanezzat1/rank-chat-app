<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

$stmt = db()->prepare("
    SELECT me.*, (ue.user_id IS NOT NULL) AS owned
    FROM message_effects me
    LEFT JOIN user_effects ue ON ue.effect_id = me.id AND ue.user_id = ?
    ORDER BY me.price ASC
");
$stmt->execute([$me['id']]);
$effects = $stmt->fetchAll();

echo json_encode($effects);
