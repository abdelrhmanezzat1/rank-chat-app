<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
if (isset($_SESSION['user_id'])) {
    db()->prepare("UPDATE users SET is_online = 0 WHERE id = ?")->execute([$_SESSION['user_id']]);
}
$_SESSION = [];
session_destroy();

// Expire the session cookie so it's not left dangling in the browser
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params['path'],
        $params['domain'],
        $params['secure'],
        $params['httponly']
    );
}

echo json_encode(['success' => true]);
