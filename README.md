# سيرفر النخبة — Rank Chat App

شات خاص (ستايل واتساب/تليجرام) بواجهة موبايل، مبني بـ PHP + MySQL + JavaScript عادي (بدون فريمورك),
فيه نظام رتب ملونة، مايكات (غرفة عامة بصوت حقيقي عبر WebRTC)، ومتجر إطارات بروفايل.

## المتطلبات
- **الباك إند:** استضافة فيها PHP 8+ و MySQL/MariaDB (شغالة على أي استضافة عادية زي Hostinger, cPanel, إلخ)
- **غرفة المايك (اختياري):** Node.js 18+ على سيرفر منفصل (ممكن يكون نفس السيرفر أو VPS تاني)
- مفيش أي حاجة محتاجة Composer — الباك إند PHP خام والفرونت إند HTML/CSS/JS خام

## خطوات الرفع والتشغيل (PHP + MySQL)

1. **ارفع محتويات المشروع** بالكامل (كل الملفات والمجلدات) على مجلد استضافتك (مثلاً `public_html`).

2. **اعمل قاعدة بيانات** جديدة من لوحة تحكم الاستضافة (cPanel → MySQL Databases)، وسجّل اسمها ويوزرها وباسوردها.

3. **استورد ملف `schema.sql`** على القاعدة اللي عملتها (phpMyAdmin → Import → اختار schema.sql).
   الملف ده بيعمل كل الجداول ويحط بيانات تجريبية (13 يوزر بمختلف الرتب، كلمة السر لكلهم `123456`، وإطارات في المتجر).

4. **عدّل بيانات الاتصال بقاعدة البيانات** في `config/db.php`:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'اسم_قاعدة_البيانات');
   define('DB_USER', 'يوزر_القاعدة');
   define('DB_PASS', 'باسورد_القاعدة');
   ```

5. افتح الموقع من المتصفح — هيوجهك تلقائيًا لصفحة تسجيل الدخول (`login.php`).
   جرب بحساب: يوزر `يوسف` وباسورد `123456` (رتبة مالك)، أو اعمل حساب جديد من تاب "حساب جديد".

## تشغيل سيرفر الصوت (Voice Server) — اختياري

غرفة المايك بتشتغل بصوت حقيقي عبر WebRTC. السيرفر ده مسؤول عن **signaling بس** (龆 relay الإشارة بين اليوزرز)،
الصوت نفسه بيمشي Peer-to-Peer مباشرة بين المتصفحات.

### المتطلبات
- Node.js 18+ (مع npm)
- وصول لقاعدة البياناتنفسها (عشان ينظف mic_sessions لما حد يفصل)

### خطوات التشغيل

1. ادخل مجلد السيرفر وتبع الـ dependencies:
   ```bash
   cd voice-server
   npm install
   ```

2. اعمل نسخة من `.env.example` وسمّيها `.env` وعدّل البيانات:
   ```bash
   cp .env.example .env
   ```
   - `VOICE_SECRET` — مفتاح سري⻑gt; championships لتوقيع التوكنات (لازم يكون نفس القيمة في PHP وفي الـ Node)
   - `PORT` — البورت اللي السيرفر هيشتغل عليه (الافتراضي: 3001)
   - بيانات قاعدة البيانات (نفسها اللي في `config/db.php`)

3. شغّل السيرفر:
   ```bash
   node server.js
   ```
   أو باستخدام pm2 عشان يفضل شغال في الخلفية:
   ```bash
   pm2 start server.js --name voice-server
   pm2 save
   pm2 startup  # عشان يبدأ تلقائي مع السيرفر
   ```

4. افتح البورت 3001 (أو البورت اللي اخترته) في الفايرول بتاع السيرفر.

5. **في ملف PHP** `config/voice.php` (أو في `.env` بتاع PHP)، حدد عنوان سيرفر الصوت:
   ```php
   // اختار الطريقة اللي تناسبك:
   // if hosting PHP and Node on same server:
   define('VOICE_SERVER_URL', 'ws://localhost:3001');
   // if on different servers or using a domain:
   define('VOICE_SERVER_URL', 'wss://voice.yourdomain.com');
   ```

### إعداد HTTPS (مهم لل production)

WebRTC **بيطلب** HTTPS على السيرفر النهائي. للتجربة المحلية (`localhost`) المتصفح بيقفل القيود دي.
للوصول من الإنترنت:

- استخدم **nginx** كـ reverse proxy مع Let's Encrypt:
  ```nginx
  server {
      listen 443 ssl;
      server_name voice.yourdomain.com;

      ssl_certificate /etc/letsencrypt/live/voice.yourdomain.com/fullchain.pem;
      ssl_certificate_key /etc/letsencrypt/live/voice.yourdomain.com/privkey.pem;

      location / {
          proxy_pass http://127.0.0.1:3001;
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection "upgrade";
          proxy_set_header Host $host;
      }
  }
  ```

### إعداد TURN (مهم للإنتاج)

STUN Servers (اللي بي come مع WebRTC) بتشتغل مع أغلب الـ NAT types,
لكن في بعض الشبكات القيود (symmetric NAT /Corporate firewalls) ممكن تحتاج **TURN server** coturn:

```bash
# تثبيت coturn على Ubuntu
sudo apt install coturn

# إعداد coturn (/etc/turnserver.conf)
listening-port=3478
fingerprint
lt-cred-mech
user=myuser:mypassword
realm=myrealm
```

ثم عدّل ICE servers في `app.js`:
```javascript
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'turn:your-turn-server.com:3478', username: 'myuser', credential: 'mypassword' },
];
```

## هيكل المشروع

```
/config
  db.php        ← إعدادات الاتصال بقاعدة البيانات
  auth.php      ← الجلسات (sessions) والتحقق من تسجيل الدخول
/api
  register.php, login.php, logout.php, me.php, heartbeat.php
  users.php                 ← قائمة الأعضاء مرتبة حسب الرتبة
  conversation.php          ← فتح/جلب محادثة مع عضو معين
  send_message.php          ← إرسال رسالة
  messages_poll.php         ← جلب الرسائل الجديدة (Polling بدل WebSocket)
  store.php, buy_frame.php, equip_frame.php   ← متجر الإطارات
  mic_join.php, mic_leave.php, mic_status.php ← غرفة المايك (حضور + صوت حقيقي)
  voice_token.php           ← توكن آمن للاتصال بسيرفر الصوت
/assets
  css/app.css   ← كل التنسيقات
  js/auth.js    ← جافاسكريبت صفحة الدخول
  js/app.js     ← جافاسكريبت التطبيق (القائمة + الشات + المتجر + المايك + WebRTC)
/voice-server
  server.js     ← سيرفر Signaling للصوت (Node.js + WebSocket)
  package.json  ← Dependencies
  .env.example  ← قالب بيانات الاتصال
index.php       ← يوجهك لصفحة الدخول أو التطبيق حسب حالتك
login.php       ← صفحة تسجيل الدخول / حساب جديد
app.php         ← الصفحة الرئيسية للتطبيق (شاشة موبايل واحدة)
schema.sql      ← قاعدة البيانات كاملة + بيانات تجريبية
```

## ملاحظات مهمة

- **غرفة المايك:** بتشتغل بصوت حقيقي عبر WebRTC Mesh (اتصال مباشرة بين كل اليوزرز في الغرفة،
  حد أقصى ~12 يوزر). السيرفر بس بيساعد他们在 ي互相 يعرفوا ويتواصلوا (signaling).
- **الأمان:** الباسوردات متخزنة مشفرة (bcrypt)، والـ SQL كله باستخدام Prepared Statements ضد SQL Injection.
  قبل ما ترفعه لموقع حقيقي (production)، لازم:
  - تفعّل HTTPS
  - تغيّر بيانات قاعدة البيانات الافتراضية
  - تحذف أو تغيّر الباسوردات التجريبية (`123456`) لكل اليوزرز
  - تغيّر `VOICE_SECRET` في كل من `config/voice.php` و `.env` للسيرفر
- **تطبيق الأندرويد:** لسه مبنيش في النسخة دي. لما تكون جاهز، ابعتلي وهنبنيه يستخدم نفس الـ API endpoints
  اللي في مجلد `/api` (كلها بترجع JSON، فهي جاهزة لأي عميل تاني بما فيه تطبيق موبايل).
