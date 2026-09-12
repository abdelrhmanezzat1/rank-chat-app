<?php
require_once __DIR__ . '/../config/db.php';

$db = db();

$migrations = [
  "CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    room VARCHAR(100) DEFAULT NULL,
    priority INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    expires_at TIMESTAMP NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_active (is_active),
    KEY idx_room (room)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

  "CREATE TABLE IF NOT EXISTS news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    is_published TINYINT(1) DEFAULT 1,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_published (is_published)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

  "CREATE TABLE IF NOT EXISTS banned_words (
    id INT AUTO_INCREMENT PRIMARY KEY,
    word VARCHAR(100) NOT NULL,
    is_regex TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_word (word)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

  "CREATE TABLE IF NOT EXISTS spam_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message_content TEXT,
    reason VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_user (user_id),
    KEY idx_time (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

  "INSERT IGNORE INTO banned_words (word) VALUES (' spam '), (' scam '), (' hack ')",

  "CREATE TABLE IF NOT EXISTS device_fingerprints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    fingerprint VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_user (user_id),
    KEY idx_fp (fingerprint),
    KEY idx_ip (ip_address)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

  "CREATE TABLE IF NOT EXISTS device_bans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fingerprint VARCHAR(255),
    ip_address VARCHAR(45),
    reason VARCHAR(500),
    banned_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    KEY idx_fp (fingerprint),
    KEY idx_ip (ip_address)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

  "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_ip VARCHAR(45) NULL AFTER profile_song_url",
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
