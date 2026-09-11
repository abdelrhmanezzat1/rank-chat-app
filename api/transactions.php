<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

$page = max(1, (int)($_GET['page'] ?? 1));
$limit = 20;
$offset = ($page - 1) * $limit;

// Transaction history
$stmt = db()->prepare("
    SELECT t.*, 
           CASE t.source 
               WHEN 'message' THEN 'رسالة'
               WHEN 'mic' THEN 'وقت مايك'
               WHEN 'voice' THEN 'غرفة صوتية'
               WHEN 'gift' THEN 'هدية'
               WHEN 'gift_received' THEN 'هدية مستلمة'
               WHEN 'store_item' THEN 'شراء من المتجر'
               WHEN 'daily' THEN 'مكافأة يومية'
               ELSE t.source
           END AS source_label
    FROM transactions t
    WHERE t.user_id = ?
    ORDER BY t.created_at DESC
    LIMIT ? OFFSET ?
");
$stmt->execute([$me['id'], $limit, $offset]);
$transactions = $stmt->fetchAll();

// Total count
$count = db()->prepare("SELECT COUNT(*) FROM transactions WHERE user_id = ?");
$count->execute([$me['id']]);
$total = $count->fetchColumn();

// Stats
$stats = db()->prepare("
    SELECT 
        IFNULL(SUM(CASE WHEN type = 'earn' THEN amount END), 0) AS total_earned,
        IFNULL(SUM(CASE WHEN type = 'spend' THEN amount END), 0) AS total_spent,
        IFNULL(SUM(CASE WHEN source = 'gift_received' THEN amount END), 0) AS gifts_received,
        IFNULL(SUM(CASE WHEN source = 'gift' THEN amount END), 0) AS gifts_sent
    FROM transactions WHERE user_id = ?
");
$stats->execute([$me['id']]);
$statRow = $stats->fetch();

echo json_encode([
    'transactions' => $transactions,
    'total' => $total,
    'page' => $page,
    'has_more' => ($page * $limit) < $total,
    'stats' => $statRow,
]);
