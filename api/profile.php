<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

$targetId = (int)($_GET['user_id'] ?? $me['id']);

// Get user info
$stmt = db()->prepare("SELECT u.id, u.username, u.rank_key, u.`level`, u.xp, u.coins, u.bio, u.location, u.website, u.equipped_frame_id, u.equipped_row_theme_id, u.equipped_name_theme_id, u.equipped_bg_skin_id, u.created_at, r.color_hex AS rank_color, r.icon AS rank_icon, r.label AS rank_label FROM users u JOIN ranks r ON u.rank_key = r.`key` WHERE u.id = ?");
$stmt->execute([$targetId]);
$user = $stmt->fetch();

if (!$user) {
    http_response_code(404);
    die(json_encode(['error' => 'المستخدم مش موجود']));
}

// Counts (separate queries to avoid subquery issues)
$stmt = db()->prepare("SELECT COUNT(*) FROM follows WHERE follower_id = ?");
$stmt->execute([$targetId]);
$user['following_count'] = (int)$stmt->fetchColumn();

$stmt = db()->prepare("SELECT COUNT(*) FROM follows WHERE following_id = ?");
$stmt->execute([$targetId]);
$user['followers_count'] = (int)$stmt->fetchColumn();

$stmt = db()->prepare("SELECT COUNT(*) FROM messages WHERE sender_id = ?");
$stmt->execute([$targetId]);
$user['message_count'] = (int)$stmt->fetchColumn();

$stmt = db()->prepare("SELECT COUNT(*) FROM gift_sends WHERE receiver_id = ?");
$stmt->execute([$targetId]);
$user['gifts_received_count'] = (int)$stmt->fetchColumn();

$stmt = db()->prepare("SELECT COUNT(*) FROM gift_sends WHERE sender_id = ?");
$stmt->execute([$targetId]);
$user['gifts_sent_count'] = (int)$stmt->fetchColumn();

$stmt = db()->prepare("SELECT IFNULL(SUM(amount), 0) FROM transactions WHERE user_id = ? AND type = 'earn'");
$stmt->execute([$targetId]);
$user['total_coins_earned'] = (int)$stmt->fetchColumn();

// Check if we follow them
$stmt = db()->prepare("SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?");
$stmt->execute([$me['id'], $targetId]);
$weFollow = (bool)$stmt->fetch();

// Check if they follow us
$stmt = db()->prepare("SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?");
$stmt->execute([$targetId, $me['id']]);
$theyFollowUs = (bool)$stmt->fetch();

// Get equipped frame info
$frame = null;
if ($user['equipped_frame_id']) {
    $stmt = db()->prepare("SELECT name, gradient_from, gradient_to, row_from, row_to, bubble_from, bubble_to FROM frames WHERE id = ?");
    $stmt->execute([$user['equipped_frame_id']]);
    $frame = $stmt->fetch();
}

// Get recent gifts received
$stmt = db()->prepare("
    SELECT g.name, g.icon, gs.sent_at, u.username AS sender_name
    FROM gift_sends gs
    JOIN gifts g ON gs.gift_id = g.id
    JOIN users u ON gs.sender_id = u.id
    WHERE gs.receiver_id = ?
    ORDER BY gs.sent_at DESC
    LIMIT 10
");
$stmt->execute([$targetId]);
$recentGifts = $stmt->fetchAll();

echo json_encode([
    'user' => $user,
    'frame' => $frame,
    'we_follow' => $weFollow,
    'they_follow_us' => $theyFollowUs,
    'is_mutual' => $weFollow && $theyFollowUs,
    'is_self' => $targetId === $me['id'],
    'recent_gifts' => $recentGifts,
]);
