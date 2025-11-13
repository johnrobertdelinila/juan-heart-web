<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Juan Heart Notification Services
    |--------------------------------------------------------------------------
    |
    | Configuration for notification delivery services. Supports both mock
    | drivers for development and real service drivers for production.
    |
    */

    'notifications' => [
        // Email service driver: 'mock' uses MailHog, 'mailgun' uses Mailgun API
        'email_driver' => env('NOTIFICATION_EMAIL_DRIVER', 'mock'),

        // SMS service driver: 'mock' logs to file/database, 'twilio' uses Twilio API
        'sms_driver' => env('NOTIFICATION_SMS_DRIVER', 'mock'),

        // Push notification driver: 'mock' logs to database, 'firebase' uses FCM
        'push_driver' => env('NOTIFICATION_PUSH_DRIVER', 'mock'),

        // Queue notifications for async processing
        'queue_enabled' => env('NOTIFICATION_QUEUE_ENABLED', true),

        // Queue connection to use
        'queue_connection' => env('NOTIFICATION_QUEUE_CONNECTION', 'redis'),

        // Queue name for notifications
        'queue_name' => env('NOTIFICATION_QUEUE_NAME', 'notifications'),

        // Log all notification attempts
        'log_enabled' => env('NOTIFICATION_LOG_ENABLED', true),
    ],

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'twilio' => [
        'sid' => env('TWILIO_SID'),
        'token' => env('TWILIO_TOKEN'),
        'from' => env('TWILIO_FROM'),
    ],

    'firebase' => [
        'server_key' => env('FIREBASE_SERVER_KEY'),
        'sender_id' => env('FIREBASE_SENDER_ID'),
    ],

];
