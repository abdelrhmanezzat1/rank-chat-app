<?php
require_once __DIR__ . '/../config/db.php';

$db = db();

$migrations = [
  "CREATE TABLE IF NOT EXISTS profile_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    liker_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (user_id, liker_id),
    KEY idx_user (user_id),
    KEY idx_liker (liker_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

  "CREATE TABLE IF NOT EXISTS wall_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    author_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_user (user_id),
    KEY idx_author (author_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

  "CREATE TABLE IF NOT EXISTS vip_tiers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    price_coins INT NOT NULL,
    duration_days INT NOT NULL,
    frame_gradient_from VARCHAR(20) DEFAULT '#FFD700',
    frame_gradient_to VARCHAR(20) DEFAULT '#FFA500',
    badge_icon VARCHAR(50) DEFAULT 'diamond',
    perks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

  "ALTER TABLE users ADD COLUMN IF NOT EXISTS vip_expires_at TIMESTAMP NULL AFTER level",
  "ALTER TABLE users ADD COLUMN IF NOT EXISTS vip_tier_id INT NULL AFTER vip_expires_at",
  "ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_song_url VARCHAR(500) NULL AFTER equipped_bg_skin_id",

  "INSERT IGNORE INTO vip_tiers (id, name, price_coins, duration_days, frame_gradient_from, frame_gradient_to, badge_icon, perks) VALUES
    (1, 'VIP فضي', 500, 30, '#C0C0C0', '#E8E8E8', 'diamond', 'إطار خاص + اسم متحرك'),
    (2, 'VIP ذهبي', 1500, 30, '#FFD700', '#FFA500', 'diamond', 'إطار ذهبي + اسم متحرك + لون خاص'),
    (3, 'VIP ماسي', 5000, 30, '#B9F2FF', '#6FE3E0', 'diamond', 'إطار ماسي + اسم متحرك + لون خاص + أولوية في القائمة')",
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
