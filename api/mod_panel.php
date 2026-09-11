<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$me = require_login();

if (!in_array($me['rank_key'], ['owner', 'admin', 'manager'])) {
    http_response_code(403);
    die(json_encode(['error' => 'مش مصرحلك']));
}

$action = $_GET['action'] ?? 'list';

if ($action === 'reports') {
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

if ($action === 'mod_log') {
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

if ($action === 'muted') {
    $stmt = db()->prepare("
        SELECT mu.*, u.username, r.label AS rank_label
        FROM muted_users mu
        JOIN users u ON mu.user_id = u.id
        JOIN ranks r ON u.rank_key = r.`key`
        WHERE mu.expires_at > NOW()
        ORDER BY mu.expires_at ASC
    ");
    $stmt->execute();
    echo json_encode($stmt->fetchAll());
    exit;
}

if ($action === 'banned') {
    $stmt = db()->prepare("
        SELECT bu.*, u.username, r.label AS rank_label
        FROM banned_users bu
        JOIN users u ON bu.user_id = u.id
        JOIN ranks r ON u.rank_key = r.`key`
        ORDER BY bu.created_at DESC
    ");
    $stmt->execute();
    echo json_encode($stmt->fetchAll());
    exit;
}

if ($action === 'dismiss_report') {
    $in = json_input();
    $reportId = (int)($in['report_id'] ?? 0);
    if ($reportId > 0) {
        db()->prepare("UPDATE reports SET status = 'dismissed', reviewed_by = ? WHERE id = ?")
            ->execute([$me['id'], $reportId]);
    }
    echo json_encode(['success' => true]);
    exit;
}

if ($action === 'action_report') {
    $in = json_input();
    $reportId = (int)($in['report_id'] ?? 0);
    if ($reportId > 0) {
        db()->prepare("UPDATE reports SET status = 'actioned', reviewed_by = ? WHERE id = ?")
            ->execute([$me['id'], $reportId]);
    }
    echo json_encode(['success' => true]);
    exit;
}

// Default: stats
$stats = [];
$r = db()->query("SELECT COUNT(*) FROM reports WHERE status = 'pending'")->fetchColumn();
$stats['pending_reports'] = (int)$r;
$r = db()->query("SELECT COUNT(*) FROM muted_users WHERE expires_at > NOW()")->fetchColumn();
$stats['active_mutes'] = (int)$r;
$r = db()->query("SELECT COUNT(*) FROM banned_users")->fetchColumn();
$stats['active_bans'] = (int)$r;
$r = db()->query("SELECT COUNT(*) FROM mod_log WHERE created_at > (NOW() - INTERVAL 24 HOUR)")->fetchColumn();
$stats['actions_24h'] = (int)$r;

echo json_encode($stats);
