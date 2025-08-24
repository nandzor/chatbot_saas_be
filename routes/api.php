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

        // User management routes - dengan permission middleware
        Route::prefix('users')->middleware(['permission:users.view', 'organization'])->group(function () {
            Route::get('/', [UserController::class, 'index']);
            Route::get('/search', [UserController::class, 'search']);
            Route::get('/statistics', [UserController::class, 'statistics']);

            Route::prefix('{id}')->group(function () {
                Route::get('/', [UserController::class, 'show']);
            });

            // Routes yang memerlukan additional permissions
            Route::middleware(['permission:users.create'])->post('/', [UserController::class, 'store']);
            Route::middleware(['permission:users.update'])->group(function () {
                Route::put('/{id}', [UserController::class, 'update']);
                Route::patch('/{id}', [UserController::class, 'update']);
                Route::patch('/{id}/toggle-status', [UserController::class, 'toggleStatus']);
            });
            Route::middleware(['permission:users.delete'])->delete('/{id}', [UserController::class, 'destroy']);
            Route::middleware(['permission:users.restore'])->patch('/{id}/restore', [UserController::class, 'restore']);
            Route::middleware(['permission:users.bulk_update'])->patch('/bulk-update', [UserController::class, 'bulkUpdate']);
        });

        // Role Management routes - dengan permission middleware
        Route::prefix('roles')->middleware(['permission:roles.view', 'organization'])->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\V1\RoleManagementController::class, 'index']);
            Route::get('/available', [\App\Http\Controllers\Api\V1\RoleManagementController::class, 'getAvailableRoles']);
            Route::get('/statistics', [\App\Http\Controllers\Api\V1\RoleManagementController::class, 'statistics']);

            Route::prefix('{id}')->group(function () {
                Route::get('/', [\App\Http\Controllers\Api\V1\RoleManagementController::class, 'show']);
                Route::get('/users', [\App\Http\Controllers\Api\V1\RoleManagementController::class, 'getUsers']);
            });

            // Routes yang memerlukan additional permissions
            Route::middleware(['permission:roles.create'])->post('/', [\App\Http\Controllers\Api\V1\RoleManagementController::class, 'store']);
            Route::middleware(['permission:roles.update'])->put('/{id}', [\App\Http\Controllers\Api\V1\RoleManagementController::class, 'update']);
            Route::middleware(['permission:roles.delete'])->delete('/{id}', [\App\Http\Controllers\Api\V1\RoleManagementController::class, 'destroy']);
            Route::middleware(['permission:roles.assign'])->post('/assign', [\App\Http\Controllers\Api\V1\RoleManagementController::class, 'assignRole']);
            Route::middleware(['permission:roles.revoke'])->post('/revoke', [\App\Http\Controllers\Api\V1\RoleManagementController::class, 'revokeRole']);
        });

        // Permission Management routes - dengan permission middleware
        Route::prefix('permissions')->middleware(['permission:permissions.view', 'organization'])->group(function () {
            // Permission CRUD operations
            Route::get('/', [\App\Http\Controllers\Api\V1\PermissionManagementController::class, 'index']);
            Route::get('/{permissionId}', [\App\Http\Controllers\Api\V1\PermissionManagementController::class, 'show']);

            // Routes yang memerlukan additional permissions
            Route::middleware(['permission:permissions.create'])->post('/', [\App\Http\Controllers\Api\V1\PermissionManagementController::class, 'store']);
            Route::middleware(['permission:permissions.update'])->put('/{permissionId}', [\App\Http\Controllers\Api\V1\PermissionManagementController::class, 'update']);
            Route::middleware(['permission:permissions.delete'])->delete('/{permissionId}', [\App\Http\Controllers\Api\V1\PermissionManagementController::class, 'destroy']);

            // Permission groups
            Route::prefix('groups')->group(function () {
                Route::get('/', [\App\Http\Controllers\Api\V1\PermissionManagementController::class, 'getPermissionGroups']);
                Route::middleware(['permission:permissions.manage_groups'])->post('/', [\App\Http\Controllers\Api\V1\PermissionManagementController::class, 'createPermissionGroup']);
            });

            // Role permission management
            Route::prefix('roles')->group(function () {
                Route::get('/{roleId}/permissions', [\App\Http\Controllers\Api\V1\PermissionManagementController::class, 'getRolePermissions']);
                Route::middleware(['permission:permissions.assign'])->post('/{roleId}/permissions', [\App\Http\Controllers\Api\V1\PermissionManagementController::class, 'assignPermissionsToRole']);
                Route::middleware(['permission:permissions.revoke'])->delete('/{roleId}/permissions', [\App\Http\Controllers\Api\V1\PermissionManagementController::class, 'removePermissionsFromRole']);
            });

            // User permission operations
            Route::prefix('users')->group(function () {
                Route::get('/permissions', [\App\Http\Controllers\Api\V1\PermissionManagementController::class, 'getUserPermissions']);
                Route::middleware(['permission:permissions.check'])->post('/check-permission', [\App\Http\Controllers\Api\V1\PermissionManagementController::class, 'checkUserPermission']);
            });
        });

        // Organization Management routes - dengan permission middleware
        Route::prefix('organizations')->middleware(['permission:organizations.view', 'organization'])->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\V1\OrganizationManagementController::class, 'index']);
            Route::get('/statistics', [\App\Http\Controllers\Api\V1\OrganizationManagementController::class, 'statistics']);

            Route::prefix('{id}')->group(function () {
                Route::get('/', [\App\Http\Controllers\Api\V1\OrganizationManagementController::class, 'show']);
            });

            // Routes yang memerlukan additional permissions
            Route::middleware(['permission:organizations.create'])->post('/', [\App\Http\Controllers\Api\V1\OrganizationManagementController::class, 'store']);
            Route::middleware(['permission:organizations.update'])->put('/{id}', [\App\Http\Controllers\Api\V1\OrganizationManagementController::class, 'update']);
            Route::middleware(['permission:organizations.delete'])->delete('/{id}', [\App\Http\Controllers\Api\V1\OrganizationManagementController::class, 'destroy']);

            // Organization users management
            Route::prefix('{id}')->group(function () {
                Route::get('/users', [\App\Http\Controllers\Api\V1\OrganizationManagementController::class, 'users']);
                Route::middleware(['permission:organizations.add_user'])->post('/users', [\App\Http\Controllers\Api\V1\OrganizationManagementController::class, 'addUser']);
                Route::middleware(['permission:organizations.remove_user'])->delete('/users/{userId}', [\App\Http\Controllers\Api\V1\OrganizationManagementController::class, 'removeUser']);
            });
        });

        // Advanced Permission Examples - menunjukkan flexibility middleware
        Route::prefix('advanced')->middleware(['permission:advanced.*'])->group(function () {
            // Wildcard permission - user harus punya permission apapun yang dimulai dengan 'advanced.'
            Route::get('/dashboard', function () {
                return response()->json(['message' => 'Advanced dashboard - requires any advanced.* permission']);
            });
        });

        // Multiple Permission Examples - AND logic
        Route::prefix('reports')->middleware(['permission:reports.view,reports.export'])->group(function () {
            // User harus punya BOTH permissions: reports.view AND reports.export
            Route::get('/export', function () {
                return response()->json(['message' => 'Report export - requires reports.view AND reports.export']);
            });
        });

        // Multiple Permission Examples - OR logic
        Route::prefix('analytics')->middleware(['permission:analytics.view|analytics.admin'])->group(function () {
            // User harus punya EITHER permission: analytics.view OR analytics.admin
            Route::get('/data', function () {
                return response()->json(['message' => 'Analytics data - requires analytics.view OR analytics.admin']);
            });
        });

        // Organization Access Examples
        Route::prefix('organization')->middleware(['organization:strict'])->group(function () {
            // Strict mode - user hanya bisa akses organization mereka sendiri
            Route::get('/info', function () {
                return response()->json(['message' => 'Organization info - strict access only']);
            });
        });

        Route::prefix('shared')->middleware(['organization:flexible'])->group(function () {
            // Flexible mode - user bisa akses organization mereka atau jika tidak ada specific org
            Route::get('/resources', function () {
                return response()->json(['message' => 'Shared resources - flexible access']);
            });
        });

        // Test Routes untuk Middleware Permission System
        Route::prefix('test')->group(function () {
            // Test single permission
            Route::get('/single', function () {
                return response()->json([
                    'message' => 'Single permission test - requires users.view',
                    'user' => request()->user(),
                    'permission_context' => request('permission_context'),
                    'organization_context' => request('organization_context')
                ]);
            })->middleware(['permission:users.view', 'organization']);

            // Test wildcard permission
            Route::get('/wildcard', function () {
                return response()->json([
                    'message' => 'Wildcard permission test - requires users.*',
                    'user' => request()->user(),
                    'permission_context' => request('permission_context')
                ]);
            })->middleware(['permission:users.*']);

            // Test multiple AND permissions
            Route::get('/and', function () {
                return response()->json([
                    'message' => 'Multiple AND permissions test - requires users.view,users.create',
                    'user' => request()->user(),
                    'permission_context' => request('permission_context')
                ]);
            })->middleware(['permission:users.view,users.create']);

            // Test multiple OR permissions
            Route::get('/or', function () {
                return response()->json([
                    'message' => 'Multiple OR permissions test - requires users.view|users.create',
                    'user' => request()->user(),
                    'permission_context' => request('permission_context')
                ]);
            })->middleware(['permission:users.view|users.create']);

            // Test organization strict mode
            Route::get('/org-strict', function () {
                return response()->json([
                    'message' => 'Organization strict mode test',
                    'user' => request()->user(),
                    'organization_context' => request('organization_context')
                ]);
            })->middleware(['organization:strict']);

            // Test organization flexible mode
            Route::get('/org-flexible', function () {
                return response()->json([
                    'message' => 'Organization flexible mode test',
                    'user' => request()->user(),
                    'organization_context' => request('organization_context')
                ]);
            })->middleware(['organization:flexible']);
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
