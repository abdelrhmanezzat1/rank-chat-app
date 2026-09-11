<?php
require_once __DIR__ . '/config/auth.php';
if (current_user()) {
    header('Location: app.php');
} else {
    header('Location: login.php');
}
exit;
