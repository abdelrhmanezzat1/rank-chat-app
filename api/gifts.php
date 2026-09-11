<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');

$gifts = db()->query("SELECT id, name, icon, price, xp_value, rarity FROM gifts ORDER BY price ASC")->fetchAll();
echo json_encode($gifts);
