<?php
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json; charset=utf-8');
$u = require_login();
unset($u['password_hash']);
echo json_encode($u);
