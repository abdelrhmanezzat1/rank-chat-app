<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');

$in = json_input();
$username = trim($in['username'] ?? '');
$password = $in['password'] ?? '';

if ($username === '' || $password === '') {
    http_response_code(422);
    die(json_encode(['error' => 'اسم المستخدم وكلمة السر مطلوبين']));
}

$rateKey = 'login:' . $username;
rate_limit_check($rateKey);

$stmt = db()->prepare("SELECT * FROM users WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    rate_limit_increment($rateKey);
    http_response_code(401);
    die(json_encode(['error' => 'اسم المستخدم أو كلمة السر غلط']));
}

rate_limit_clear($rateKey);
session_regenerate_id(true);
$_SESSION['user_id'] = $user['id'];
db()->prepare("UPDATE users SET is_online = 1, last_seen = NOW() WHERE id = ?")->execute([$user['id']]);
echo json_encode(['success' => true]);
