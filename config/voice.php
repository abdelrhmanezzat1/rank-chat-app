<?php
require_once __DIR__ . '/dotenv.php';
loadDotEnv(__DIR__ . '/../.env');

// ============================================
// Voice server settings
// All values are read from environment variables.
// ============================================
$voiceSecret = getenv('VOICE_SECRET');
$voiceUrl = getenv('VOICE_SERVER_URL');

// Refuse to run with the default/placeholder secret
if ($voiceSecret === false || $voiceSecret === '' || $voiceSecret === 'change-this-in-production-to-a-long-random-string') {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    die(json_encode([
        'error' => 'VOICE_SECRET is not set or is still the default placeholder. ' .
                    'Generate a secure secret (e.g. php -r "echo bin2hex(random_bytes(32));") ' .
                    'and set it in your .env file.'
    ]));
}

define('VOICE_SECRET', $voiceSecret);
define('VOICE_SERVER_URL', $voiceUrl ?: 'ws://localhost:3001');
