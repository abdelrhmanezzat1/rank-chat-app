<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

if ($me['rank_key'] !== 'owner') {
    http_response_code(403);
    die(json_encode(['error' => 'المالك فقط يغير الرتب']));
}

$in = json_input();
$targetId = (int)($in['user_id'] ?? 0);
$newRank = $in['rank'] ?? '';

$validRanks = ['owner', 'admin', 'manager', 'diamond', 'gold', 'silver', 'bronze', 'golden-blue', 'member'];
if ($targetId <= 0 || !in_array($newRank, $validRanks)) {
    http_response_code(422);
    die(json_encode(['error' => 'بيانات غير صالحة']));
}

if ($targetId === $me['id'] && $newRank !== 'owner') {
    http_response_code(422);
    die(json_encode(['error' => 'مش تقدر تنزل نفسك']));
}

$stmt = db()->prepare("SELECT id, username, rank_key FROM users WHERE id = ?");
$stmt->execute([$targetId]);
$target = $stmt->fetch();
if (!$target) {
    http_response_code(404);
    die(json_encode(['error' => 'المستخدم مش موجود']));
}

$oldRank = $target['rank_key'];
db()->prepare("UPDATE users SET rank_key = ? WHERE id = ?")->execute([$newRank, $targetId]);

// Log
db()->prepare("INSERT INTO mod_log (moderator_id, target_id, action, reason) VALUES (?, ?, 'warn', ?)")
    ->execute([$me['id'], $targetId, "تم تغيير الرتبة من $oldRank إلى $newRank"]);

// Notify
$rankLabels = ['owner'=>'المالك','admin'=>'مدير عام','manager'=>'مدير','diamond'=>'الماس','gold'=>'ذهبي','silver'=>'فضي','bronze'=>'برونزي','golden-blue'=>'ذهبي أزرق','member'=>'عضو'];
db()->prepare("INSERT INTO notifications (user_id, from_user_id, type, title, body, reference_type) VALUES (?, ?, 'mod', 'تم تغيير رتبتك', ?, 'rank')")
    ->execute([$targetId, $me['id'], "رتبتك الآن: " . ($rankLabels[$newRank] ?? $newRank)]);

echo json_encode(['success' => true, 'old_rank' => $oldRank, 'new_rank' => $newRank]);
