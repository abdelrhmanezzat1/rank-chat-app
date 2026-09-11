<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

if (!in_array($me['rank_key'], ['owner', 'admin'])) {
    http_response_code(403);
    die(json_encode(['error' => 'مش مصرحلك']));
}

$tab = $_GET['tab'] ?? 'stats';

if ($tab === 'stats') {
    $stats = [];
    $stats['total_users'] = (int)db()->query("SELECT COUNT(*) FROM users")->fetchColumn();
    $stats['online_users'] = (int)db()->query("SELECT COUNT(*) FROM users WHERE is_online = 1")->fetchColumn();
    $stats['total_messages'] = (int)db()->query("SELECT COUNT(*) FROM messages")->fetchColumn();
    $stats['messages_24h'] = (int)db()->query("SELECT COUNT(*) FROM messages WHERE sent_at > (NOW() - INTERVAL 24 HOUR)")->fetchColumn();
    $stats['total_gifts'] = (int)db()->query("SELECT COUNT(*) FROM gift_sends")->fetchColumn();
    $stats['total_coins_earned'] = (int)db()->query("SELECT IFNULL(SUM(amount),0) FROM transactions WHERE type = 'earn'")->fetchColumn();
    $stats['total_coins_spent'] = (int)db()->query("SELECT IFNULL(SUM(amount),0) FROM transactions WHERE type = 'spend'")->fetchColumn();
    $stats['active_mutes'] = (int)db()->query("SELECT COUNT(*) FROM muted_users WHERE expires_at > NOW()")->fetchColumn();
    $stats['active_bans'] = (int)db()->query("SELECT COUNT(*) FROM banned_users")->fetchColumn();
    $stats['pending_reports'] = (int)db()->query("SELECT COUNT(*) FROM reports WHERE status = 'pending'")->fetchColumn();
    $stats['mic_sessions'] = (int)db()->query("SELECT COUNT(*) FROM mic_sessions")->fetchColumn();

    // Rank distribution
    $ranks = db()->query("SELECT r.label, r.color_hex, COUNT(u.id) AS cnt FROM users u JOIN ranks r ON u.rank_key = r.`key` GROUP BY r.`key` ORDER BY r.priority ASC")->fetchAll();
    $stats['rank_distribution'] = $ranks;

    echo json_encode($stats);
    exit;
}

if ($tab === 'reports') {
    $stmt = db()->prepare("
        SELECT r.*, u1.username AS reporter_name, u2.username AS reported_name
        FROM reports r
        JOIN users u1 ON r.reporter_id = u1.id
        JOIN users u2 ON r.reported_id = u2.id
        ORDER BY r.created_at DESC
        LIMIT 50
    ");
    $stmt->execute();
    echo json_encode($stmt->fetchAll());
    exit;
}

if ($tab === 'mod_log') {
    $stmt = db()->prepare("
        SELECT ml.*, u1.username AS moderator_name, u2.username AS target_name
        FROM mod_log ml
        JOIN users u1 ON ml.moderator_id = u1.id
        JOIN users u2 ON ml.target_id = u2.id
        ORDER BY ml.created_at DESC
        LIMIT 50
    ");
    $stmt->execute();
    echo json_encode($stmt->fetchAll());
    exit;
}

if ($tab === 'users') {
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = 30;
    $offset = ($page - 1) * $limit;
    $search = trim($_GET['search'] ?? '');

    $where = '';
    $params = [];
    if ($search !== '') {
        $where = "WHERE u.username LIKE ?";
        $params[] = "%$search%";
    }

    $stmt = db()->prepare("SELECT u.id, u.username, u.rank_key, u.coins, u.xp, u.is_online, u.is_muted, u.created_at, r.label AS rank_label, r.color_hex FROM users u JOIN ranks r ON u.rank_key = r.`key` $where ORDER BY u.id ASC LIMIT $limit OFFSET $offset");
    $stmt->execute($params);
    $users = $stmt->fetchAll();

    $count = db()->prepare("SELECT COUNT(*) FROM users u $where");
    $count->execute($params);
    $total = (int)$count->fetchColumn();

    echo json_encode(['users' => $users, 'total' => $total, 'page' => $page]);
    exit;
}

echo json_encode(['error' => 'unknown tab']);
