<?php
require_once __DIR__ . '/config/auth.php';
if (current_user()) { header('Location: app.php'); exit; }

// Security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: strict-origin-when-cross-origin');
header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; frame-ancestors 'none'");
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تسجيل الدخول — سيرفر النخبة</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/app.css">
</head>
<body>
<div class="auth-screen">
  <div class="auth-card">
    <div class="brand-mark" style="margin:0 auto 14px;">R</div>
    <h1>سيرفر النخبة</h1>
    <p class="auth-sub">شات، رتب، مايكات، وإطارات بروفايل</p>

    <div class="auth-tabs">
      <div class="auth-tab active" data-mode="login">تسجيل الدخول</div>
      <div class="auth-tab" data-mode="register">حساب جديد</div>
    </div>

    <form id="auth-form">
      <input type="text" id="username" placeholder="اسم المستخدم" required autocomplete="username">
      <input type="password" id="password" placeholder="كلمة السر" required autocomplete="current-password">
      <div id="auth-error" class="auth-error"></div>
      <button type="submit" id="auth-submit">دخول</button>
    </form>
  </div>
</div>
<script src="assets/js/auth.js"></script>
</body>
</html>
