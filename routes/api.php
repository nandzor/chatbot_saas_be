<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\RoleManagementController;
use App\Http\Controllers\Api\V1\PermissionManagementController;
use App\Http\Controllers\Api\V1\OrganizationManagementController;
use App\Http\Controllers\Api\V1\KnowledgeBaseController;
use App\Http\Controllers\Api\V1\SubscriptionPlanController;

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

// ============================================================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================================================

/**
 * Health Check Endpoint
 * Used for monitoring and health checks
 */
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now()->toISOString(),
        'version' => config('app.version', '1.0.0'),
        'environment' => config('app.env'),
    ]);
});

// ============================================================================
// API V1 ROUTES (Protected Routes)
// ============================================================================

Route::prefix('v1')->group(function () {

    // Note: Authentication routes are handled in routes/auth.php
    // This provides unified JWT + Sanctum + Refresh token authentication

    // ========================================================================
    // PROTECTED ROUTES - Using Unified Authentication (JWT OR Sanctum)
    // ========================================================================

    Route::middleware(['unified.auth'])->group(function () {

        // ====================================================================
        // USER PROFILE & ACCOUNT MANAGEMENT
        // ====================================================================

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
        });

        // ====================================================================
        // CHATBOT MANAGEMENT
        // ====================================================================

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

        // ====================================================================
        // CONVERSATION MANAGEMENT
        // ====================================================================

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

        // ====================================================================
        // ANALYTICS & REPORTING
        // ====================================================================

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

        // ====================================================================
        // USER MANAGEMENT (With Permission Middleware)
        // ====================================================================

        Route::prefix('users')
            ->middleware(['permission:users.view', 'organization'])
            ->group(function () {

            // Basic CRUD operations
            Route::get('/', [UserController::class, 'index']);
            Route::get('/search', [UserController::class, 'search']);
            Route::get('/statistics', [UserController::class, 'statistics']);

            // Individual user operations
            Route::prefix('{id}')->group(function () {
                Route::get('/', [UserController::class, 'show']);
            });

            // Routes requiring additional permissions
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

        // ====================================================================
        // ROLE MANAGEMENT (With Permission Middleware)
        // ====================================================================

        Route::prefix('roles')
            ->middleware(['permission:roles.view', 'organization'])
            ->group(function () {

            // Basic operations
            Route::get('/', [RoleManagementController::class, 'index']);
            Route::get('/available', [RoleManagementController::class, 'getAvailableRoles']);
            Route::get('/statistics', [RoleManagementController::class, 'statistics']);

            // Individual role operations
            Route::prefix('{id}')->group(function () {
                Route::get('/', [RoleManagementController::class, 'show']);
                Route::get('/users', [RoleManagementController::class, 'getUsers']);
            });

            // Routes requiring additional permissions
            Route::middleware(['permission:roles.create'])->post('/', [RoleManagementController::class, 'store']);
            Route::middleware(['permission:roles.update'])->put('/{id}', [RoleManagementController::class, 'update']);
            Route::middleware(['permission:roles.delete'])->delete('/{id}', [RoleManagementController::class, 'destroy']);
            Route::middleware(['permission:roles.assign'])->post('/assign', [RoleManagementController::class, 'assignRole']);
            Route::middleware(['permission:roles.revoke'])->post('/revoke', [RoleManagementController::class, 'revokeRole']);
        });

        // ====================================================================
        // PERMISSION MANAGEMENT (With Permission Middleware)
        // ====================================================================

        Route::prefix('permissions')
            ->middleware(['permission:permissions.view', 'organization'])
            ->group(function () {

            // Basic CRUD operations
            Route::get('/', [PermissionManagementController::class, 'index']);
            Route::get('/{permissionId}', [PermissionManagementController::class, 'show']);

            // Routes requiring additional permissions
            Route::middleware(['permission:permissions.create'])->post('/', [PermissionManagementController::class, 'store']);
            Route::middleware(['permission:permissions.update'])->put('/{permissionId}', [PermissionManagementController::class, 'update']);
            Route::middleware(['permission:permissions.delete'])->delete('/{permissionId}', [PermissionManagementController::class, 'destroy']);

            // Permission groups management
            Route::prefix('groups')->group(function () {
                Route::get('/', [PermissionManagementController::class, 'getPermissionGroups']);
                Route::middleware(['permission:permissions.manage_groups'])->post('/', [PermissionManagementController::class, 'createPermissionGroup']);
            });

            // Role permission management
            Route::prefix('roles')->group(function () {
                Route::get('/{roleId}/permissions', [PermissionManagementController::class, 'getRolePermissions']);
                Route::middleware(['permission:permissions.assign'])->post('/{roleId}/permissions', [PermissionManagementController::class, 'assignPermissionsToRole']);
                Route::middleware(['permission:permissions.revoke'])->delete('/{roleId}/permissions', [PermissionManagementController::class, 'removePermissionsFromRole']);
            });

            // User permission operations
            Route::prefix('users')->group(function () {
                Route::get('/permissions', [PermissionManagementController::class, 'getUserPermissions']);
                Route::middleware(['permission:permissions.check'])->post('/check-permission', [PermissionManagementController::class, 'checkUserPermission']);
            });
        });

        // ====================================================================
        // ORGANIZATION MANAGEMENT (With Permission Middleware)
        // ====================================================================

        Route::prefix('organizations')
            ->middleware(['permission:organizations.view', 'organization'])
            ->group(function () {

            // Basic operations
            Route::get('/', [OrganizationManagementController::class, 'index']);
            Route::get('/statistics', [OrganizationManagementController::class, 'statistics']);

            // Individual organization operations
            Route::prefix('{id}')->group(function () {
                Route::get('/', [OrganizationManagementController::class, 'show']);
            });

            // Routes requiring additional permissions
            Route::middleware(['permission:organizations.create'])->post('/', [OrganizationManagementController::class, 'store']);
            Route::middleware(['permission:organizations.update'])->put('/{id}', [OrganizationManagementController::class, 'update']);
            Route::middleware(['permission:organizations.delete'])->delete('/{id}', [OrganizationManagementController::class, 'destroy']);

            // Organization users management
            Route::prefix('{id}')->group(function () {
                Route::get('/users', [OrganizationManagementController::class, 'users']);
                Route::middleware(['permission:organizations.add_user'])->post('/users', [OrganizationManagementController::class, 'addUser']);
                Route::middleware(['permission:organizations.remove_user'])->delete('/users/{userId}', [OrganizationManagementController::class, 'removeUser']);
            });
        });

        // ====================================================================
        // SUBSCRIPTION PLAN MANAGEMENT (With Permission Middleware)
        // ====================================================================

        Route::prefix('subscription-plans')
            ->middleware(['permission:subscription_plans.view'])
            ->group(function () {

            // Basic CRUD operations
            Route::get('/', [SubscriptionPlanController::class, 'index']);
            Route::get('/popular', [SubscriptionPlanController::class, 'popular']);
            Route::get('/tier/{tier}', [SubscriptionPlanController::class, 'byTier']);
            Route::get('/custom', [SubscriptionPlanController::class, 'custom']);
            Route::get('/statistics', [SubscriptionPlanController::class, 'statistics']);

            // Individual plan operations
            Route::prefix('{subscription_plan}')->group(function () {
                Route::get('/', [SubscriptionPlanController::class, 'show']);
                Route::middleware(['permission:subscription_plans.update'])->put('/', [SubscriptionPlanController::class, 'update']);
                Route::middleware(['permission:subscription_plans.delete'])->delete('/', [SubscriptionPlanController::class, 'destroy']);
                Route::middleware(['permission:subscription_plans.update'])->patch('/toggle-popular', [SubscriptionPlanController::class, 'togglePopular']);
            });

            // Routes requiring additional permissions
            Route::middleware(['permission:subscription_plans.create'])->post('/', [SubscriptionPlanController::class, 'store']);
            Route::middleware(['permission:subscription_plans.update'])->patch('/sort-order', [SubscriptionPlanController::class, 'updateSortOrder']);
        });

        // ====================================================================
        // ADVANCED PERMISSION EXAMPLES
        // Demonstrating middleware flexibility
        // ====================================================================

        // Wildcard permission example - user must have any permission starting with 'advanced.'
        Route::prefix('advanced')
            ->middleware(['permission:advanced.*'])
            ->group(function () {
                Route::get('/dashboard', function () {
                    return response()->json(['message' => 'Advanced dashboard - requires any advanced.* permission']);
                });
            });

        // Multiple AND permissions example - user must have BOTH permissions
        Route::prefix('reports')
            ->middleware(['permission:reports.view,reports.export'])
            ->group(function () {
                Route::get('/export', function () {
                    return response()->json(['message' => 'Report export - requires reports.view AND reports.export']);
                });
            });

        // Multiple OR permissions example - user must have EITHER permission
        Route::prefix('analytics')
            ->middleware(['permission:analytics.view|analytics.admin'])
            ->group(function () {
                Route::get('/data', function () {
                    return response()->json(['message' => 'Analytics data - requires analytics.view OR analytics.admin']);
                });
            });

        // ====================================================================
        // ORGANIZATION ACCESS EXAMPLES
        // Different organization access modes
        // ====================================================================

        // Strict mode - user can only access their own organization
        Route::prefix('organization')
            ->middleware(['organization:strict'])
            ->group(function () {
                Route::get('/info', function () {
                    return response()->json(['message' => 'Organization info - strict access only']);
                });
            });

        // Flexible mode - user can access their organization or if no specific org
        Route::prefix('shared')
            ->middleware(['organization:flexible'])
            ->group(function () {
                Route::get('/resources', function () {
                    return response()->json(['message' => 'Shared resources - flexible access']);
                });
            });

        // ====================================================================
        // KNOWLEDGE BASE MANAGEMENT (With Permission Middleware)
        // ====================================================================

        Route::prefix('knowledge-base')
            ->middleware(['permission:knowledge.view', 'organization'])
            ->group(function () {

            // Basic CRUD operations
            Route::get('/', [KnowledgeBaseController::class, 'index']);
            Route::get('/search', [KnowledgeBaseController::class, 'search']);
            Route::get('/slug/{slug}', [KnowledgeBaseController::class, 'showBySlug']);

            // Individual knowledge base item operations
            Route::prefix('{id}')->group(function () {
                Route::get('/', [KnowledgeBaseController::class, 'show']);
                Route::get('/related', [KnowledgeBaseController::class, 'related']);
                Route::post('/mark-helpful', [KnowledgeBaseController::class, 'markHelpful']);
                Route::post('/mark-not-helpful', [KnowledgeBaseController::class, 'markNotHelpful']);
            });

            // Routes requiring additional permissions
            Route::middleware(['permission:knowledge.create'])->post('/', [KnowledgeBaseController::class, 'store']);

            Route::middleware(['permission:knowledge.update'])->group(function () {
                Route::put('/{id}', [KnowledgeBaseController::class, 'update']);
                Route::patch('/{id}', [KnowledgeBaseController::class, 'update']);
            });

            Route::middleware(['permission:knowledge.delete'])->delete('/{id}', [KnowledgeBaseController::class, 'destroy']);

            // Publishing and approval workflows
            Route::middleware(['permission:knowledge.publish'])->post('/{id}/publish', [KnowledgeBaseController::class, 'publish']);

            Route::middleware(['permission:knowledge.approve'])->group(function () {
                Route::post('/{id}/approve', [KnowledgeBaseController::class, 'approve']);
                Route::post('/{id}/reject', [KnowledgeBaseController::class, 'reject']);
            });

            // Category and tag filtering
            Route::get('/category/{categoryId}', [KnowledgeBaseController::class, 'byCategory']);
            Route::get('/tag/{tagId}', [KnowledgeBaseController::class, 'byTag']);
        });

        // ====================================================================
        // TEST ROUTES FOR MIDDLEWARE PERMISSION SYSTEM
        // For development and testing purposes
        // ====================================================================

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

// ============================================================================
// FALLBACK ROUTE
// ============================================================================

Route::fallback(function () {
    return response()->json([
        'success' => false,
        'message' => 'API endpoint not found',
        'error' => 'The requested API endpoint does not exist',
    ], 404);
});
