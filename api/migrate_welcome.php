<?php
require_once __DIR__ . '/../config/db.php';

$db = db();

$migrations = [
  "CREATE TABLE IF NOT EXISTS welcome_bot_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    room VARCHAR(100) NOT NULL DEFAULT 'main',
    welcomed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_welcome (user_id, room)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
];

$success = 0;
$errors = [];

foreach ($migrations as $sql) {
  try {
    $db->exec($sql);
    $success++;
  } catch (Exception $e) {
    $errors[] = $e->getMessage();
  }
}

echo json_encode([
  'success' => $success,
  'errors' => $errors,
  'total' => count($migrations)
]);
