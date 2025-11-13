<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'api/documentation'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:3001'),
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3003',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3003',
        // Production URLs (configure via .env)
        env('PRODUCTION_WEB_URL', ''),
        env('PRODUCTION_MOBILE_URL', ''),
    ],

    'allowed_origins_patterns' => [
        // Allow all localhost ports for development
        '/^http:\/\/localhost:\d+$/',
        '/^http:\/\/127\.0\.0\.1:\d+$/',
        // Allow mobile app capacitor/ionic origins
        '/^capacitor:\/\//',
        '/^ionic:\/\//',
        // Allow file protocol for mobile apps
        '/^file:\/\//',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [
        'X-Total-Count',
        'X-Page-Count',
        'X-Per-Page',
        'X-Current-Page',
    ],

    'max_age' => 86400, // 24 hours

    'supports_credentials' => true,

];
