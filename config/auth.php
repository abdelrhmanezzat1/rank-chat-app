<?php
require_once __DIR__ . '/db.php';

// ── Secure session cookie settings ──────────────────────────────────────
// SameSite=Lax (not Strict) because the app redirects from index.php → app.php
// on same-site navigation. Strict would break that flow.
$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (!empty($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443)
        || (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');

session_set_cookie_params([
    'lifetime' => 0,           // until browser closes
    'path' => '/',
    'domain' => '',
    'secure' => $isHttps,     // HTTPS in production, HTTP in dev
    'httponly' => true,        // no JS access
    'samesite' => 'Lax',      // allows same-site redirects, blocks cross-site POST
]);
session_start();

function current_user() {
    if (!isset($_SESSION['user_id'])) return null;
    $stmt = db()->prepare("SELECT u.*, r.label AS rank_label, r.color_hex, r.icon, r.priority
                            FROM users u JOIN ranks r ON u.rank_key = r.`key`
                            WHERE u.id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    return $stmt->fetch();
}

function require_login() {
    $u = current_user();
    if (!$u) {
        http_response_code(401);
        header('Content-Type: application/json; charset=utf-8');
        die(json_encode(['error' => 'يجب تسجيل الدخول']));
    }
    return $u;
}

function json_input() {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

// ── Rate limiting helpers ───────────────────────────────────────────────
// Simple sliding-window rate limiter backed by the login_attempts table.
// Thresholds: LOGIN_MAX_ATTEMPTS per LOGIN_WINDOW_SECONDS.
define('LOGIN_MAX_ATTEMPTS', 5);
define('LOGIN_WINDOW_SECONDS', 900); // 15 minutes

function rate_limit_check(string $key): void {
    $stmt = db()->prepare("SELECT attempts, first_attempt_at FROM login_attempts WHERE attempt_key = ? AND first_attempt_at > DATE_SUB(NOW(), INTERVAL ? SECOND)");
    $stmt->execute([$key, LOGIN_WINDOW_SECONDS]);
    $row = $stmt->fetch();

    if ($row && (int)$row['attempts'] >= LOGIN_MAX_ATTEMPTS) {
        http_response_code(429);
        header('Content-Type: application/json; charset=utf-8');
        die(json_encode(['error' => 'كتير من المحاولات، حاول تاني بعد شوية']));
    }
}

function rate_limit_increment(string $key): void {
    // Upsert: increment if within window, else reset
    db()->prepare("DELETE FROM login_attempts WHERE attempt_key = ?")->execute([$key]);
    db()->prepare("INSERT INTO login_attempts (attempt_key, attempts, first_attempt_at) VALUES (?, 1, NOW())")->execute([$key]);
}

function rate_limit_clear(string $key): void {
    db()->prepare("DELETE FROM login_attempts WHERE attempt_key = ?")->execute([$key]);
}
