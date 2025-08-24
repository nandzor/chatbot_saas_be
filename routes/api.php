<?php

use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Health check endpoint
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now()->toISOString(),
        'version' => config('app.version', '1.0.0'),
        'environment' => config('app.env'),
    ]);
});

// API V1 Routes
Route::prefix('v1')->group(function () {

        // Authentication routes are now handled in routes/auth.php
    // This provides unified JWT + Sanctum + Refresh token authentication

    // Protected routes - using unified authentication (JWT OR Sanctum)
    Route::middleware(['unified.auth'])->group(function () {

        // User management routes
        Route::prefix('users')->group(function () {
            Route::get('/', [UserController::class, 'index']);
            Route::post('/', [UserController::class, 'store']);
            Route::get('/search', [UserController::class, 'search']);
            Route::get('/statistics', [UserController::class, 'statistics']);
            Route::patch('/bulk-update', [UserController::class, 'bulkUpdate']);

            Route::prefix('{id}')->group(function () {
                Route::get('/', [UserController::class, 'show']);
                Route::put('/', [UserController::class, 'update']);
                Route::patch('/', [UserController::class, 'update']);
                Route::delete('/', [UserController::class, 'destroy']);
                Route::patch('/toggle-status', [UserController::class, 'toggleStatus']);
                Route::patch('/restore', [UserController::class, 'restore']);
            });
        });

        // Current user routes
        Route::prefix('me')->group(function () {
            Route::get('/', function (Request $request) {
                return response()->json([
                    'success' => true,
                    'data' => $request->user(),
                ]);
            });
            Route::put('/profile', function () {
                // TODO: Implement profile update
                return response()->json(['message' => 'Profile update endpoint - to be implemented']);
            });
            Route::post('/change-password', function () {
                // TODO: Implement password change
                return response()->json(['message' => 'Change password endpoint - to be implemented']);
            });
            Route::post('/logout', function () {
                // TODO: Implement logout
                return response()->json(['message' => 'Logout endpoint - to be implemented']);
            });
        });

        // Example chatbot-specific routes
        Route::prefix('chatbots')->group(function () {
            Route::get('/', function () {
                return response()->json(['message' => 'Chatbots list endpoint - to be implemented']);
            });
            Route::post('/', function () {
                return response()->json(['message' => 'Create chatbot endpoint - to be implemented']);
            });
            Route::prefix('{id}')->group(function () {
                Route::get('/', function () {
                    return response()->json(['message' => 'Get chatbot endpoint - to be implemented']);
                });
                Route::put('/', function () {
                    return response()->json(['message' => 'Update chatbot endpoint - to be implemented']);
                });
                Route::delete('/', function () {
                    return response()->json(['message' => 'Delete chatbot endpoint - to be implemented']);
                });
                Route::post('/train', function () {
                    return response()->json(['message' => 'Train chatbot endpoint - to be implemented']);
                });
                Route::post('/chat', function () {
                    return response()->json(['message' => 'Chat with bot endpoint - to be implemented']);
                });
            });
        });

        // Conversations routes
        Route::prefix('conversations')->group(function () {
            Route::get('/', function () {
                return response()->json(['message' => 'Conversations list endpoint - to be implemented']);
            });
            Route::post('/', function () {
                return response()->json(['message' => 'Create conversation endpoint - to be implemented']);
            });
            Route::prefix('{id}')->group(function () {
                Route::get('/', function () {
                    return response()->json(['message' => 'Get conversation endpoint - to be implemented']);
                });
                Route::post('/messages', function () {
                    return response()->json(['message' => 'Send message endpoint - to be implemented']);
                });
            });
        });

        // Analytics routes
        Route::prefix('analytics')->group(function () {
            Route::get('/dashboard', function () {
                return response()->json(['message' => 'Dashboard analytics endpoint - to be implemented']);
            });
            Route::get('/usage', function () {
                return response()->json(['message' => 'Usage analytics endpoint - to be implemented']);
            });
            Route::get('/performance', function () {
                return response()->json(['message' => 'Performance analytics endpoint - to be implemented']);
            });
        });

        // Role Management routes
        Route::prefix('roles')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\RoleManagementController::class, 'index']);
            Route::post('/', [\App\Http\Controllers\Api\RoleManagementController::class, 'store']);
            Route::get('/available', [\App\Http\Controllers\Api\RoleManagementController::class, 'getAvailableRoles']);
            Route::get('/statistics', [\App\Http\Controllers\Api\RoleManagementController::class, 'statistics']);

            Route::prefix('{id}')->group(function () {
                Route::get('/', [\App\Http\Controllers\Api\RoleManagementController::class, 'show']);
                Route::put('/', [\App\Http\Controllers\Api\RoleManagementController::class, 'update']);
                Route::delete('/', [\App\Http\Controllers\Api\RoleManagementController::class, 'destroy']);
                Route::get('/users', [\App\Http\Controllers\Api\RoleManagementController::class, 'getUsers']);
            });

            Route::post('/assign', [\App\Http\Controllers\Api\RoleManagementController::class, 'assignRole']);
            Route::post('/revoke', [\App\Http\Controllers\Api\RoleManagementController::class, 'revokeRole']);
        });
    });
});

// Fallback route for API
Route::fallback(function () {
    return response()->json([
        'success' => false,
        'message' => 'API endpoint not found',
        'error' => 'The requested API endpoint does not exist',
    ], 404);
});
