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

// Device ban check
$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '';
$fp = trim($in['fingerprint'] ?? '');
if ($fp || $ip) {
    $banCheck = db()->prepare("SELECT reason FROM device_bans WHERE (fingerprint = ? OR ip_address = ?) AND (expires_at IS NULL OR expires_at > NOW())");
    $banCheck->execute([$fp ?: '__none__', $ip ?: '__none__']);
    $banRow = $banCheck->fetch();
    if ($banRow) {
        http_response_code(403);
        die(json_encode(['error' => 'جهازك محظور: ' . ($banRow['reason'] ?? 'Device banned')]));
    }
}

session_regenerate_id(true);
$_SESSION['user_id'] = $user['id'];
db()->prepare("UPDATE users SET is_online = 1, last_seen = NOW(), last_ip = ? WHERE id = ?")->execute([$ip, $user['id']]);

// Store device fingerprint
if ($fp) {
    db()->prepare("INSERT INTO device_fingerprints (user_id, fingerprint, ip_address, user_agent) VALUES (?, ?, ?, ?)")
        ->execute([$user['id'], $fp, $ip, $_SERVER['HTTP_USER_AGENT'] ?? '']);
}

echo json_encode(['success' => true]);
