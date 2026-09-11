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
$stmt = db()->prepare("INSERT INTO users (username, password_hash, rank_key, coins) VALUES (?, ?, 'member', 100)");
$stmt->execute([$username, $hash]);
$userId = db()->lastInsertId();

// اديله الإطار المجاني الافتراضي
db()->prepare("INSERT INTO user_frames (user_id, frame_id, equipped) VALUES (?, 1, 1)")->execute([$userId]);
db()->prepare("UPDATE users SET equipped_frame_id = 1 WHERE id = ?")->execute([$userId]);

rate_limit_clear($rateKey);
session_regenerate_id(true);
$_SESSION['user_id'] = $userId;
echo json_encode(['success' => true, 'user_id' => $userId]);
