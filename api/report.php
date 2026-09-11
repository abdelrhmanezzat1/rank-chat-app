<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

$in = json_input();
$reportedId = (int)($in['reported_id'] ?? 0);
$messageId = (int)($in['message_id'] ?? 0);
$reason = trim($in['reason'] ?? '');

if ($reportedId <= 0 || $reason === '') {
    http_response_code(422);
    die(json_encode(['error' => 'بيانات غير مكتملة']));
}
if ($reportedId === $me['id']) {
    http_response_code(422);
    die(json_encode(['error' => 'مش هتبلغ عن نفسك']));
}

// Check if already reported this user recently
$stmt = db()->prepare("SELECT 1 FROM reports WHERE reporter_id = ? AND reported_id = ? AND created_at > (NOW() - INTERVAL 1 HOUR)");
$stmt->execute([$me['id'], $reportedId]);
if ($stmt->fetch()) {
    http_response_code(429);
    die(json_encode(['error' => 'بلّغت عنه قبل كده، استنى شوية']));
}

db()->prepare("INSERT INTO reports (reporter_id, reported_id, message_id, reason) VALUES (?, ?, ?, ?)")
    ->execute([$me['id'], $reportedId, $messageId > 0 ? $messageId : null, $reason]);

// Notify admins
$admins = db()->prepare("SELECT id FROM users WHERE rank_key IN ('owner', 'admin')");
$admins->execute();
foreach ($admins->fetchAll() as $admin) {
    db()->prepare("INSERT INTO notifications (user_id, from_user_id, type, title, body, reference_type) VALUES (?, ?, 'report', 'بلاغ جديد', ?, 'report')")
        ->execute([$admin['id'], $me['id'], $me['id'] . ' بلّغ عن ' . $reportedId . ': ' . mb_substr($reason, 0, 100)]);
}

echo json_encode(['success' => true]);
