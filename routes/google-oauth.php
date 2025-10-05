<?php

use App\Http\Controllers\Api\V1\GoogleOAuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Google OAuth Routes
|--------------------------------------------------------------------------
|
| Routes for Google OAuth 2.0 authentication using Laravel Socialite.
| These routes handle the OAuth flow for Google services integration.
|
*/

// Public OAuth routes (no authentication required)
Route::prefix('auth/google')->group(function () {
    // Redirect to Google OAuth
    Route::get('/redirect', [GoogleOAuthController::class, 'redirectToGoogle'])
        ->name('google.oauth.redirect');

    // Handle Google OAuth callback (GET - for direct browser redirect)
    Route::get('/callback', [GoogleOAuthController::class, 'handleGoogleCallback'])
        ->name('google.oauth.callback');

    // Handle Google OAuth callback (POST - for frontend API call)
    Route::post('/callback', [GoogleOAuthController::class, 'handleGoogleCallbackPost'])
        ->name('google.oauth.callback.post');
});

// Protected OAuth routes (authentication required)
Route::prefix('oauth/google')
    ->middleware(['unified.auth', 'organization'])
    ->group(function () {
        // Get OAuth status for current user
        Route::get('/status', [GoogleOAuthController::class, 'getOAuthStatus'])
            ->name('google.oauth.status');

        // Revoke OAuth credential
        Route::post('/revoke', [GoogleOAuthController::class, 'revokeOAuth'])
            ->name('google.oauth.revoke');
    });
