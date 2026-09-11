<?php
require_once __DIR__ . '/dotenv.php';
loadDotEnv(__DIR__ . '/../.env');

// ============================================
// Database connection settings
// All values are read from environment variables.
// The app will NOT start if required vars are missing.
// ============================================
$dbHost = getenv('DB_HOST');
$dbName = getenv('DB_NAME');
$dbUser = getenv('DB_USER');
$dbPass = getenv('DB_PASS');

$missing = [];
if ($dbHost === false || $dbHost === '') $missing[] = 'DB_HOST';
if ($dbName === false || $dbName === '') $missing[] = 'DB_NAME';
if ($dbUser === false || $dbUser === '') $missing[] = 'DB_USER';
// DB_PASS may legitimately be empty for local dev, but DB_HOST/DB_NAME/DB_USER must be set

if (!empty($missing)) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    die(json_encode([
        'error' => 'Missing required environment variables: ' . implode(', ', $missing) .
                    '. Copy .env.example to .env and fill in the values.'
    ]));
}

function db() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                "mysql:host=" . getenv('DB_HOST') . ";dbname=" . getenv('DB_NAME') . ";charset=utf8mb4",
                getenv('DB_USER'),
                getenv('DB_PASS'),
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
            );
        } catch (PDOException $e) {
            http_response_code(500);
            die(json_encode(['error' => 'Database connection failed']));
        }
    }
    return $pdo;
}
