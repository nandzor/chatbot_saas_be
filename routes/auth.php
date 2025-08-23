<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Unified Authentication Routes (JWT + Sanctum + Refresh Token)
|--------------------------------------------------------------------------
|
| Sistem authentication yang menggabungkan JWT dan Sanctum untuk keamanan maksimal.
| JWT untuk stateless API calls, Sanctum untuk additional security layer.
| Refresh token untuk auto-renew JWT tanpa re-login.
| Semua routes menggunakan prefix 'api/auth' dan return JSON responses.
|
*/

// Public authentication routes (no authentication required)
Route::prefix('auth')->group(function () {

    // Unified login endpoint - generates JWT + Sanctum + Refresh tokens
    Route::post('/login', [AuthController::class, 'login'])
         ->name('auth.login')
         ->middleware(['throttle.auth']);

    // Register endpoint
    Route::post('/register', [AuthController::class, 'register'])
         ->name('auth.register')
         ->middleware(['throttle.auth']);

    // Token refresh endpoint (using refresh token)
    Route::post('/refresh', [AuthController::class, 'refresh'])
         ->name('auth.refresh')
         ->middleware(['throttle.refresh']);

    // Token validation endpoint
    Route::post('/validate', [AuthController::class, 'validate'])
         ->name('auth.validate')
         ->middleware(['throttle.validation']);

    // Forgot password endpoint
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])
         ->name('auth.forgot-password')
         ->middleware(['throttle.auth']);

    // Reset password endpoint
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])
         ->name('auth.reset-password')
         ->middleware(['throttle.auth']);
});

// Protected authentication routes (accepts both JWT and Sanctum tokens)
Route::prefix('auth')->middleware(['unified.auth'])->group(function () {

    // Get current user information
    Route::get('/me', [AuthController::class, 'me'])
         ->name('auth.me');

    // Logout from current device
    Route::post('/logout', [AuthController::class, 'logout'])
         ->name('auth.logout');

    // Logout from all devices
    Route::post('/logout-all', [AuthController::class, 'logoutAll'])
         ->name('auth.logout-all');

    // Get active sessions
    Route::get('/sessions', [AuthController::class, 'sessions'])
         ->name('auth.sessions');

    // Revoke specific session
    Route::delete('/sessions/{sessionId}', [AuthController::class, 'revokeSession'])
         ->name('auth.sessions.revoke')
         ->where('sessionId', '[0-9a-f-]+');

    // Update user profile
    Route::put('/profile', [AuthController::class, 'updateProfile'])
         ->name('auth.profile.update');

    // Change password
    Route::post('/change-password', [AuthController::class, 'changePassword'])
         ->name('auth.change-password');
});

// Administrative routes (require admin permissions)
Route::prefix('auth')->middleware(['unified.auth', 'admin.only'])->group(function () {

    // Force logout user (admin only)
    Route::post('/force-logout/{userId}', [AuthController::class, 'forceLogout'])
         ->name('auth.force-logout')
         ->where('userId', '[0-9a-f-]+');

    // Lock/unlock user account (admin only)
    Route::post('/lock-user/{userId}', [AuthController::class, 'lockUser'])
         ->name('auth.lock-user')
         ->where('userId', '[0-9a-f-]+');

    Route::post('/unlock-user/{userId}', [AuthController::class, 'unlockUser'])
         ->name('auth.unlock-user')
         ->where('userId', '[0-9a-f-]+');
});
