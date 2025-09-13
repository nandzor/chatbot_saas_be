<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Authentication Defaults
    |--------------------------------------------------------------------------
    |
    | This option defines the default authentication "guard" and password
    | reset "broker" for your application. You may change these values
    | as required, but they're a perfect start for most applications.
    |
    */

    'defaults' => [
        'guard' => env('AUTH_GUARD', 'web'),
        'passwords' => env('AUTH_PASSWORD_BROKER', 'users'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Authentication Guards
    |--------------------------------------------------------------------------
    |
    | Next, you may define every authentication guard for your application.
    | Of course, a great default configuration has been defined for you
    | which utilizes session storage plus the Eloquent user provider.
    |
    | All authentication guards have a user provider, which defines how the
    | users are actually retrieved out of your database or other storage
    | system used by the application. Typically, Eloquent is utilized.
    |
    | Supported: "session"
    |
    */

    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],
        'api' => [
            'driver' => 'jwt',
            'provider' => 'users',
        ],
        'sanctum' => [
            'driver' => 'sanctum',
            'provider' => 'users',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | User Providers
    |--------------------------------------------------------------------------
    |
    | All authentication guards have a user provider, which defines how the
    | users are actually retrieved out of your database or other storage
    | system used by the application. Typically, Eloquent is utilized.
    |
    | If you have multiple user tables or models you may configure multiple
    | providers to represent the model / table. These providers may then
    | be assigned to any extra authentication guards you have defined.
    |
    | Supported: "database", "eloquent"
    |
    */

    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model' => env('AUTH_MODEL', App\Models\User::class),
        ],

        // 'users' => [
        //     'driver' => 'database',
        //     'table' => 'users',
        // ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Resetting Passwords
    |--------------------------------------------------------------------------
    |
    | These configuration options specify the behavior of Laravel's password
    | reset functionality, including the table utilized for token storage
    | and the user provider that is invoked to actually retrieve users.
    |
    | The expiry time is the number of minutes that each reset token will be
    | considered valid. This security feature keeps tokens short-lived so
    | they have less time to be guessed. You may change this as needed.
    |
    | The throttle setting is the number of seconds a user must wait before
    | generating more password reset tokens. This prevents the user from
    | quickly generating a very large amount of password reset tokens.
    |
    */

    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => env('AUTH_PASSWORD_RESET_TOKEN_TABLE', 'password_reset_tokens'),
            'expire' => 60,
            'throttle' => 60,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Password Confirmation Timeout
    |--------------------------------------------------------------------------
    |
    | Here you may define the number of seconds before a password confirmation
    | window expires and users are asked to re-enter their password via the
    | confirmation screen. By default, the timeout lasts for three hours.
    |
    */

    'password_timeout' => env('AUTH_PASSWORD_TIMEOUT', 10800),

    /*
    |--------------------------------------------------------------------------
    | Custom Authentication Settings
    |--------------------------------------------------------------------------
    |
    | Custom settings for JWT authentication and security features.
    |
    */

    // Password security settings
    'password_max_age' => env('AUTH_PASSWORD_MAX_AGE', 90), // days
    'max_login_attempts' => env('AUTH_MAX_LOGIN_ATTEMPTS', 20),
    'lockout_duration' => env('AUTH_LOCKOUT_DURATION', 30), // minutes

    // Session management
    'max_concurrent_sessions' => env('AUTH_MAX_CONCURRENT_SESSIONS', 3),
    'session_timeout' => env('AUTH_SESSION_TIMEOUT', 3600), // seconds

    // API access logging
    'log_api_access' => env('AUTH_LOG_API_ACCESS', false),
    'log_failed_attempts' => env('AUTH_LOG_FAILED_ATTEMPTS', true),

    // Security features
    'require_email_verification' => env('AUTH_REQUIRE_EMAIL_VERIFICATION', true),
    'enforce_2fa_for_admins' => env('AUTH_ENFORCE_2FA_FOR_ADMINS', false),

    // Rate limiting
    'rate_limits' => [
        'login' => [
            'max_attempts' => env('AUTH_LOGIN_MAX_ATTEMPTS', 20),
            'decay_minutes' => env('AUTH_LOGIN_DECAY_MINUTES', 1),
        ],
        'refresh' => [
            'max_attempts' => env('AUTH_REFRESH_MAX_ATTEMPTS', 10),
            'decay_minutes' => env('AUTH_REFRESH_DECAY_MINUTES', 1),
        ],
        'validation' => [
            'max_attempts' => env('AUTH_VALIDATION_MAX_ATTEMPTS', 60),
            'decay_minutes' => env('AUTH_VALIDATION_DECAY_MINUTES', 1),
        ],
    ],

];
