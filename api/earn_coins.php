<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

// Cooldowns: prevent spam earning
$cooldowns = [
    'message' => 30,    // 30 seconds between message coins
    'mic' => 60,        // 60 seconds between mic coins
    'voice' => 300,     // 5 minutes between voice room coins
];

// Rate limits per hour
$hourlyLimits = [
    'message' => 20,    // max 20 coins/hour from messages
    'mic' => 10,        // max 10 coins/hour from mic
    'voice' => 6,       // max 6 coins/hour from voice
];

$in = json_input();
$source = $in['source'] ?? '';
$amount = (int)($in['amount'] ?? 0);

if (!isset($cooldowns[$source]) || $amount <= 0) {
    http_response_code(422);
    die(json_encode(['error' => 'مصدر غير صالح']));
}

$cooldown = $cooldowns[$source];

// Check cooldown
$stmt = db()->prepare("
    SELECT created_at FROM transactions
    WHERE user_id = ? AND source = ?
    ORDER BY created_at DESC LIMIT 1
");
$stmt->execute([$me['id'], $source]);
$last = $stmt->fetch();
if ($last) {
    $elapsed = time() - strtotime($last['created_at']);
    if ($elapsed < $cooldown) {
        return json_encode(['success' => false, 'cooldown' => $cooldown - $elapsed]);
    }
}

// Check hourly limit
$stmt = db()->prepare("
    SELECT IFNULL(SUM(amount), 0) AS total FROM transactions
    WHERE user_id = ? AND source = ? AND created_at > (NOW() - INTERVAL 1 HOUR)
");
$stmt->execute([$me['id'], $source]);
$hourTotal = $stmt->fetchColumn();

if ($hourTotal >= $hourlyLimits[$source]) {
    return json_encode(['success' => false, 'limit_reached' => true]);
}

// Clamp amount to max per action
$maxPerAction = [
    'message' => 1,
    'mic' => 2,
    'voice' => 3,
];
$amount = min($amount, $maxPerAction[$source]);

// Award coins
db()->prepare("UPDATE users SET coins = coins + ? WHERE id = ?")->execute([$amount, $me['id']]);

// Log transaction
db()->prepare("INSERT INTO transactions (user_id, type, amount, source) VALUES (?, 'earn', ?, ?)")
    ->execute([$me['id'], $amount, $source]);

echo json_encode(['success' => true, 'earned' => $amount, 'source' => $source]);
