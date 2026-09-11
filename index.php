<?php
// Router script for PHP's built-in server.
// Only handle the root path — serve all other existing files directly.
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH));
$file = __DIR__ . $uri;

if ($uri !== '/' && is_file($file)) {
    return false; // let PHP's built-in server serve the file as-is
}

require_once __DIR__ . '/config/auth.php';
if (current_user()) {
    header('Location: app.php');
} else {
    header('Location: login.php');
}
exit;
