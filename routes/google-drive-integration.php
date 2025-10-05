<?php

use App\Http\Controllers\Api\V1\GoogleDriveIntegrationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Google Drive Integration Routes
|--------------------------------------------------------------------------
|
| Routes khusus untuk integrasi Google Drive (tidak membuat user baru)
| Hanya menyimpan credential OAuth untuk user yang sudah login
|
*/

// Public OAuth routes untuk integrasi Google Drive (no authentication required)
Route::prefix('auth/google-drive')->group(function () {
    // Redirect ke Google OAuth untuk integrasi Google Drive
    Route::get('/redirect', [GoogleDriveIntegrationController::class, 'redirectToGoogle'])
        ->name('google.drive.integration.redirect');

    // Handle Google OAuth callback untuk integrasi Google Drive (GET - untuk direct browser redirect)
    Route::get('/callback', [GoogleDriveIntegrationController::class, 'handleGoogleCallback'])
        ->name('google.drive.integration.callback');

    // Handle Google OAuth callback untuk integrasi Google Drive (POST - untuk frontend API call)
    Route::post('/callback', [GoogleDriveIntegrationController::class, 'handleGoogleCallbackPost'])
        ->name('google.drive.integration.callback.post');
});

// Protected OAuth routes untuk integrasi Google Drive (authentication required)
Route::prefix('oauth/google-drive')
    ->middleware(['unified.auth', 'organization'])
    ->group(function () {
        // Get OAuth status untuk Google Drive integration
        Route::get('/status', [GoogleDriveIntegrationController::class, 'getOAuthStatus'])
            ->name('google.drive.integration.status');

        // Revoke OAuth credential untuk Google Drive integration
        Route::post('/revoke', [GoogleDriveIntegrationController::class, 'revokeOAuth'])
            ->name('google.drive.integration.revoke');
    });
