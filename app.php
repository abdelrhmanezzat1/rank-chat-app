<?php
require_once __DIR__ . '/config/auth.php';
$me = current_user();
if (!$me) { header('Location: login.php'); exit; }

// Security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');
header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; connect-src 'self' ws: wss:; img-src 'self' data:; frame-ancestors 'none'");
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>سيرفر النخبة — الشات</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/app.css">
</head>
<body data-me-id="<?= (int)$me['id'] ?>" data-me-name="<?= htmlspecialchars($me['username']) ?>">

<div class="app">

  <!-- ===== شاشة قائمة المتصلين ===== -->
  <div class="sidebar" id="screen-list">
    <div class="sidebar-head">
      <div class="brand">
        <div class="brand-mark">R</div>
        <div class="brand-text">
          <h1>سيرفر النخبة</h1>
          <p><span id="online-count">0</span> متصل الآن</p>
        </div>
      </div>
      <div class="notif-bell" id="notif-bell" title="الإشعارات">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <span class="notif-badge" id="notif-badge" style="display:none;">0</span>
      </div>
      <div class="search" style="display:none">
        <input type="text" id="search-input" placeholder="ابحث عن عضو…">
      </div>
      <div class="tabs">
        <div class="tab sub-tab active" data-tab="members">الأعضاء</div>
        <div class="tab sub-tab" data-tab="voice">المايك</div>
        <div class="tab sub-tab" data-tab="top">الأكثر ترتيباً</div>
        <div class="tab sub-tab" data-tab="search">بحث</div>
      </div>
      <div class="tabs" style="margin-top:6px;">
        <div class="tab active" data-filter="all">الكل</div>
        <div class="tab" data-filter="online">متصل</div>
      </div>
    </div>

    <div class="rank-scroll" id="rank-list">
      <div class="loading-hint">جاري تحميل الأعضاء…</div>
    </div>

    <div class="store-chip" id="open-store">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
      متجر إطارات البروفايل
      <span style="margin-inline-start:auto; color:var(--gold); font-weight:700;" id="my-coins">0 🪙</span>
    </div>

    <div class="store-chip" id="open-mic" style="margin-top:0;">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 19v3"/></svg>
      غرفة المايك العامة
      <span style="margin-inline-start:auto; color:var(--muted-2);" id="mic-count">0 على المايك</span>
    </div>
  </div>

  <!-- ===== شاشة الشات ===== -->
  <div class="chat-screen" id="chat-screen">
    <div class="chat-topbar">
      <div class="chat-back" id="chat-back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 18l6-6-6-6"/></svg>
      </div>
      <div class="avatar-wrap">
        <div class="avatar" id="chat-avatar"></div>
      </div>
      <div class="chat-title">
        <div class="name" id="chat-name"></div>
        <div class="status" id="chat-status"></div>
      </div>
    </div>
    <div class="chat-body" id="chat-body"></div>
    <div class="chat-input-bar">
      <div class="gift-btn" id="chat-gift-btn" title="إرسال هدية">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M12 8v12"/><path d="M5 8c0-2.2 1.8-4 4-4h6c2.2 0 4 1.8 4 4"/><path d="M5 8h14"/></svg>
      </div>
      <input type="text" id="chat-input" placeholder="اكتب رسالة…" maxlength="2000">
      <div class="send-btn" id="chat-send">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D1220" stroke-width="2.2"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7Z"/></svg>
      </div>
    </div>

    <!-- Gift panel -->
    <div class="gift-panel" id="gift-panel">
      <div class="gift-panel-header">
        <span>إرسال هدية</span>
        <div class="gift-panel-close" id="gift-panel-close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </div>
      </div>
      <div class="gift-list" id="gift-list"></div>
      <div class="gift-balance" id="gift-balance">رصيدك: 0 🪙</div>
    </div>
  </div>

  <!-- ===== شاشة المتجر ===== -->
  <div class="chat-screen" id="store-screen">
    <div class="chat-topbar">
      <div class="chat-back" id="store-back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 18l6-6-6-6"/></svg>
      </div>
      <div class="chat-title">
        <div class="name">المتجر</div>
        <div class="status" id="store-coins">0 كوين</div>
      </div>
    </div>
    <div class="store-tabs">
      <div class="store-tab active" data-type="frame">الإطارات</div>
      <div class="store-tab" data-type="row_theme">ألوان الصف</div>
      <div class="store-tab" data-type="name_theme">ألوان الاسم</div>
      <div class="store-tab" data-type="bg_skin">الخلفيات</div>
    </div>
    <div class="store-grid" id="store-grid"></div>
    <div id="store-error" class="store-error"></div>
  </div>

  <!-- ===== شاشة المايك ===== -->
  <div class="chat-screen" id="mic-screen">
    <div class="chat-topbar">
      <div class="chat-back" id="mic-back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 18l6-6-6-6"/></svg>
      </div>
      <div class="chat-title">
        <div class="name">غرفة المايك العامة</div>
        <div class="status" id="mic-count">0 على المايك</div>
      </div>
    </div>
    <div class="mic-room-body" id="mic-room-body">
      <div class="mic-seats-grid" id="mic-seats-grid"></div>
    </div>
    <div id="voice-audio-container"></div>
    <div class="mic-actions">
      <button id="mic-mute-btn" title="كتم / فتح المايك" style="display:none;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 19v3"/></svg>
      </button>
      <button id="mic-join-btn" class="mic-join-btn">انضم للمايك</button>
      <button id="mic-leave-btn" class="mic-leave-btn" style="display:none;">اخرج من المايك</button>
    </div>
  </div>

  <!-- ===== شاشة البروفايل ===== -->
  <div class="chat-screen" id="profile-screen">
    <div class="chat-topbar">
      <div class="chat-back" id="profile-back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 18l6-6-6-6"/></svg>
      </div>
      <div class="chat-title">
        <div class="name" id="profile-title">بروفايل</div>
      </div>
    </div>
    <div class="profile-content" id="profile-content">
      <div class="loading-hint">جاري التحميل…</div>
    </div>
  </div>

  <!-- ===== Notification Panel ===== -->
  <div class="notif-panel" id="notif-panel">
    <div class="notif-panel-header">
      <span>الإشعارات</span>
      <div class="notif-mark-all" id="notif-mark-all">تعيين الكل كمقروء</div>
    </div>
    <div class="notif-list" id="notif-list">
      <div class="loading-hint">جاري التحميل…</div>
    </div>
  </div>

</div>

<script src="assets/js/app.js"></script>
</body>
</html>
