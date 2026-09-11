<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
require_login();
$room = trim($_GET['room'] ?? 'main') ?: 'main';
$stmt = db()->prepare("SELECT u.id, u.username FROM mic_sessions m JOIN users u ON u.id = m.user_id WHERE m.room = ?");
$stmt->execute([$room]);
echo json_encode($stmt->fetchAll());
