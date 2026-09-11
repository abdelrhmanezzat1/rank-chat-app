-- ============================================
-- Rank Chat App - Full Database Schema + Seed
-- ============================================

CREATE DATABASE IF NOT EXISTS rank_chat_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rank_chat_app;

-- Ranks (defines color, icon, and sort priority for each rank tier)
CREATE TABLE ranks (
  `key` VARCHAR(20) PRIMARY KEY,
  label VARCHAR(50) NOT NULL,
  color_hex VARCHAR(10) NOT NULL,
  icon VARCHAR(20) NOT NULL,
  priority INT NOT NULL
);

INSERT INTO ranks (`key`, label, color_hex, icon, priority) VALUES
('owner',   'المالك',   '#FF5C7A', 'crown',  1),
('admin',   'الإدارة',  '#7C9CFF', 'shield', 2),
('diamond', 'الماسي',   '#6FE3E0', 'gem',    3),
('gold',    'الذهبي',   '#FFC94A', 'star',   4),
('silver',  'الفضي',    '#C3CADA', 'star',   5),
('bronze',  'البرونزي', '#D48A5F', 'star',   6),
('member',  'الأعضاء',  '#4B5570', 'user',   7);

-- Users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rank_key VARCHAR(20) NOT NULL DEFAULT 'member',
  coins INT NOT NULL DEFAULT 100,
  equipped_frame_id INT NULL,
  is_online TINYINT(1) NOT NULL DEFAULT 0,
  last_seen DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rank_key) REFERENCES ranks(`key`)
);

-- Conversations (1-to-1 private chats)
CREATE TABLE conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_a INT NOT NULL,
  user_b INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_pair (user_a, user_b),
  FOREIGN KEY (user_a) REFERENCES users(id),
  FOREIGN KEY (user_b) REFERENCES users(id)
);

-- Messages
CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  sender_id INT NOT NULL,
  content TEXT NOT NULL,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- Mic sessions (who is currently live on mic, per room)
CREATE TABLE mic_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room VARCHAR(50) NOT NULL DEFAULT 'main',
  user_id INT NOT NULL,
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_room_user (room, user_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Profile frame store
CREATE TABLE frames (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  gradient_from VARCHAR(10) NOT NULL,
  gradient_to VARCHAR(10) NOT NULL,
  price INT NOT NULL,
  rarity ENUM('common','rare','epic','legendary') NOT NULL DEFAULT 'common'
);

INSERT INTO frames (name, gradient_from, gradient_to, price, rarity) VALUES
('الإطار الفضي',    '#C3CADA', '#8891A8', 0,    'common'),
('الإطار البرونزي',  '#D48A5F', '#8B5A3C', 150,  'common'),
('موجة نيون',        '#6FE3E0', '#7C9CFF', 400,  'rare'),
('لهب ذهبي',         '#FFC94A', '#FF5C7A', 900,  'epic'),
('تاج الأسطورة',     '#FF5C7A', '#6FE3E0', 2000, 'legendary');

-- Which user owns / has equipped which frame
CREATE TABLE user_frames (
  user_id INT NOT NULL,
  frame_id INT NOT NULL,
  equipped TINYINT(1) NOT NULL DEFAULT 0,
  acquired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, frame_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (frame_id) REFERENCES frames(id)
);

ALTER TABLE users ADD FOREIGN KEY (equipped_frame_id) REFERENCES frames(id);

-- Rate limiting for login/register (auto-cleaned by app)
CREATE TABLE login_attempts (
  attempt_key VARCHAR(100) NOT NULL,
  attempts INT NOT NULL DEFAULT 1,
  first_attempt_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (attempt_key),
  KEY idx_first_attempt (first_attempt_at)
);

-- Index for heartbeat offline-cleanup query
CREATE INDEX idx_users_last_seen ON users (last_seen, is_online);

-- ============================================
-- Seed sample users (password for all = 123456)
-- Hash below is bcrypt for "123456"
-- ============================================
INSERT INTO users (username, password_hash, rank_key, coins) VALUES
('يوسف',   '$2y$10$3euPcmQFCiblsZeEu5s7p.9wVsN3imE.zTLEzGDVeMv48CqMzgkV.', 'owner',   5000),
('مصطفى',  '$2y$10$3euPcmQFCiblsZeEu5s7p.9wVsN3imE.zTLEzGDVeMv48CqMzgkV.', 'admin',   3000),
('سارة',   '$2y$10$3euPcmQFCiblsZeEu5s7p.9wVsN3imE.zTLEzGDVeMv48CqMzgkV.', 'admin',   3000),
('كريم',   '$2y$10$3euPcmQFCiblsZeEu5s7p.9wVsN3imE.zTLEzGDVeMv48CqMzgkV.', 'diamond', 1500),
('نور',    '$2y$10$3euPcmQFCiblsZeEu5s7p.9wVsN3imE.zTLEzGDVeMv48CqMzgkV.', 'diamond', 1500),
('أحمد',   '$2y$10$3euPcmQFCiblsZeEu5s7p.9wVsN3imE.zTLEzGDVeMv48CqMzgkV.', 'gold',    800),
('مريم',   '$2y$10$3euPcmQFCiblsZeEu5s7p.9wVsN3imE.zTLEzGDVeMv48CqMzgkV.', 'gold',    800),
('حسن',    '$2y$10$3euPcmQFCiblsZeEu5s7p.9wVsN3imE.zTLEzGDVeMv48CqMzgkV.', 'silver',  400),
('ليلى',   '$2y$10$3euPcmQFCiblsZeEu5s7p.9wVsN3imE.zTLEzGDVeMv48CqMzgkV.', 'silver',  400),
('عمر',    '$2y$10$3euPcmQFCiblsZeEu5s7p.9wVsN3imE.zTLEzGDVeMv48CqMzgkV.', 'bronze',  200),
('هدى',    '$2y$10$3euPcmQFCiblsZeEu5s7p.9wVsN3imE.zTLEzGDVeMv48CqMzgkV.', 'bronze',  200),
('محمود',  '$2y$10$3euPcmQFCiblsZeEu5s7p.9wVsN3imE.zTLEzGDVeMv48CqMzgkV.', 'member',  100),
('رنا',    '$2y$10$3euPcmQFCiblsZeEu5s7p.9wVsN3imE.zTLEzGDVeMv48CqMzgkV.', 'member',  100);

-- Give every user the free silver frame, equipped by default
INSERT INTO user_frames (user_id, frame_id, equipped)
SELECT id, 1, 1 FROM users;

UPDATE users SET equipped_frame_id = 1;
