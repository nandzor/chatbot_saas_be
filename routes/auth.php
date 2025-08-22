<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
|
| These routes handle user authentication using JWT tokens.
| All routes are prefixed with 'api/auth' and return JSON responses.
|
*/

// Public authentication routes (no authentication required)
Route::prefix('auth')->group(function () {

    // Login endpoint
    Route::post('/login', [AuthController::class, 'login'])
         ->name('auth.login')
         ->middleware(['throttle:auth']);

    // Token refresh endpoint
    Route::post('/refresh', [AuthController::class, 'refresh'])
         ->name('auth.refresh')
         ->middleware(['throttle:refresh']);

    // Token validation endpoint (useful for frontend to check token validity)
    Route::post('/validate', [AuthController::class, 'validate'])
         ->name('auth.validate')
         ->middleware(['throttle:validation']);
});

// Protected authentication routes (require valid JWT token)
Route::prefix('auth')->middleware(['jwt.auth'])->group(function () {

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
});

// Administrative routes (require admin permissions)
Route::prefix('auth')->middleware(['jwt.auth', 'can:manage-users'])->group(function () {

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
