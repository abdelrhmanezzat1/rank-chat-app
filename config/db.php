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
            $host = getenv('DB_HOST');
            $port = getenv('DB_PORT') ?: '3306';
            $name = getenv('DB_NAME');
            $user = getenv('DB_USER');
            $pass = getenv('DB_PASS');

            $dsn = "mysql:host=$host;port=$port;dbname=$name;charset=utf8mb4";
            $opts = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            // TiDB Cloud and other cloud DBs require SSL
            $dbSslCa = getenv('DB_SSL_CA');
            $dbSslEnabled = getenv('DB_SSL_ENABLED');
            if ($dbSslEnabled === 'true' || $dbSslCa) {
                $opts[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;
                if ($dbSslCa && file_exists($dbSslCa)) {
                    $opts[PDO::MYSQL_ATTR_SSL_CA] = $dbSslCa;
                } else {
                    // Force SSL by setting CA to empty string (mysqlnd requires this to enable SSL)
                    $opts[PDO::MYSQL_ATTR_SSL_CA] = '';
                }
            }

            $pdo = new PDO($dsn, $user, $pass, $opts);
        } catch (PDOException $e) {
            http_response_code(500);
            die(json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]));
        }
    }
    return $pdo;
}
