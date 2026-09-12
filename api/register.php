<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');

$in = json_input();
$username = trim($in['username'] ?? '');
$password = $in['password'] ?? '';

if ($username === '' || strlen($password) < 6) {
    http_response_code(422);
    die(json_encode(['error' => 'اسم المستخدم مطلوب وكلمة السر لازم تكون 6 أحرف على الأقل']));
}
if (mb_strlen($username) > 20) {
    http_response_code(422);
    die(json_encode(['error' => 'اسم المستخدم طويل جدًا (حد أقصى 20 حرف)']));
}

$rateKey = 'register:' . (getenv('REMOTE_ADDR') ?? '127.0.0.1');
rate_limit_check($rateKey);

$stmt = db()->prepare("SELECT id FROM users WHERE username = ?");
$stmt->execute([$username]);
if ($stmt->fetch()) {
    http_response_code(409);
    die(json_encode(['error' => 'اسم المستخدم ده مستخدم بالفعل']));
}

$hash = password_hash($password, PASSWORD_BCRYPT);

// Device ban check before registration
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

$stmt = db()->prepare("INSERT INTO users (username, password_hash, rank_key, coins, last_ip) VALUES (?, ?, 'member', 100, ?)");
$stmt->execute([$username, $hash, $ip]);
$userId = db()->lastInsertId();

// Store device fingerprint
if ($fp) {
    db()->prepare("INSERT INTO device_fingerprints (user_id, fingerprint, ip_address, user_agent) VALUES (?, ?, ?, ?)")
        ->execute([$userId, $fp, $ip, $_SERVER['HTTP_USER_AGENT'] ?? '']);
}

// اديله الإطار المجاني الافتراضي
db()->prepare("INSERT INTO user_frames (user_id, frame_id, equipped) VALUES (?, 1, 1)")->execute([$userId]);
db()->prepare("UPDATE users SET equipped_frame_id = 1 WHERE id = ?")->execute([$userId]);

rate_limit_clear($rateKey);
session_regenerate_id(true);
$_SESSION['user_id'] = $userId;
echo json_encode(['success' => true, 'user_id' => $userId]);
