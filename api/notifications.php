<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

$action = $_GET['action'] ?? 'list';

if ($action === 'count') {
    // Unread count only
    $stmt = db()->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0");
    $stmt->execute([$me['id']]);
    echo json_encode(['count' => (int)$stmt->fetchColumn()]);
    exit;
}

if ($action === 'read') {
    // Mark single notification as read
    $in = json_input();
    $notifId = (int)($in['id'] ?? 0);
    if ($notifId > 0) {
        db()->prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?")
            ->execute([$notifId, $me['id']]);
    }
    echo json_encode(['success' => true]);
    exit;
}

if ($action === 'read_all') {
    // Mark all as read
    db()->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0")
        ->execute([$me['id']]);
    echo json_encode(['success' => true]);
    exit;
}

// Default: list notifications
$page = max(1, (int)($_GET['page'] ?? 1));
$limit = 30;
$offset = ($page - 1) * $limit;

$stmt = db()->prepare("
    SELECT n.*, u.username AS from_username
    FROM notifications n
    LEFT JOIN users u ON n.from_user_id = u.id
    WHERE n.user_id = ?
    ORDER BY n.created_at DESC
    LIMIT ? OFFSET ?
");
$stmt->execute([$me['id'], $limit, $offset]);
$notifications = $stmt->fetchAll();

$count = db()->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = ?");
$count->execute([$me['id']]);
$total = (int)$count->fetchColumn();

$unread = db()->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0");
$unread->execute([$me['id']]);

echo json_encode([
    'notifications' => $notifications,
    'total' => $total,
    'unread' => (int)$unread->fetchColumn(),
    'has_more' => ($page * $limit) < $total,
]);
