<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\RoleManagementController;
use App\Http\Controllers\Api\V1\PermissionManagementController;
use App\Http\Controllers\Api\V1\ChatbotController;
use App\Http\Controllers\Api\V1\ConversationController;
use App\Http\Controllers\Api\V1\AnalyticsController;

use App\Http\Controllers\Api\V1\KnowledgeBaseController;
use App\Http\Controllers\Api\V1\SubscriptionPlanController;
use App\Http\Controllers\Api\V1\PaymentTransactionController;
use App\Http\Controllers\Api\V1\OrganizationController;
use App\Http\Controllers\Api\V1\BotPersonalityController;
use App\Http\Controllers\Api\V1\AiAgentWorkflowController;

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

            Route::put('/profile', [UserController::class, 'updateProfile']);
        });

        // ====================================================================
        // CHATBOT MANAGEMENT (With Permission Middleware)
        // ====================================================================

        Route::prefix('chatbots')
            ->middleware(['permission:bots.view', 'organization'])
            ->group(function () {

            // Basic CRUD operations
            Route::get('/', [ChatbotController::class, 'index']);
            Route::get('/statistics', [ChatbotController::class, 'statistics']);

            // Individual chatbot operations
            Route::prefix('{id}')->group(function () {
                Route::get('/', [ChatbotController::class, 'show']);
                Route::get('/statistics', [ChatbotController::class, 'statistics']);
                Route::post('/test', [ChatbotController::class, 'test']);
            });

            // Routes requiring additional permissions
            Route::middleware(['permission:bots.create'])->post('/', [ChatbotController::class, 'store']);

            Route::middleware(['permission:bots.update'])->group(function () {
                Route::put('/{id}', [ChatbotController::class, 'update']);
                Route::patch('/{id}', [ChatbotController::class, 'update']);
            });

            Route::middleware(['permission:bots.delete'])->delete('/{id}', [ChatbotController::class, 'destroy']);

            // Training and chat operations
            Route::middleware(['permission:bots.train'])->post('/{id}/train', [ChatbotController::class, 'train']);
            Route::middleware(['permission:bots.chat'])->post('/{id}/chat', [ChatbotController::class, 'chat']);
        });

        // ====================================================================
        // CONVERSATION MANAGEMENT (With Permission Middleware)
        // ====================================================================

        Route::prefix('conversations')
            ->middleware(['permission:conversations.view', 'organization'])
            ->group(function () {

            // Basic CRUD operations
            Route::get('/', [ConversationController::class, 'index']);
            Route::get('/statistics', [ConversationController::class, 'statistics']);

            // AI Agent workflow endpoints
            Route::get('/history', [ConversationController::class, 'history']);
            Route::post('/log', [ConversationController::class, 'logConversation']);

            // Individual conversation operations
            Route::prefix('{id}')->group(function () {
                Route::get('/', [ConversationController::class, 'show']);
                Route::get('/messages', [ConversationController::class, 'messages']);
                Route::post('/end', [ConversationController::class, 'end']);
                Route::post('/transfer', [ConversationController::class, 'transfer']);
            });

            // Routes requiring additional permissions
            Route::middleware(['permission:conversations.create'])->post('/', [ConversationController::class, 'store']);
            Route::middleware(['permission:conversations.send_message'])->post('/{id}/messages', [ConversationController::class, 'sendMessage']);
        });

        // ====================================================================
        // ANALYTICS & REPORTING (With Permission Middleware)
        // ====================================================================

        Route::prefix('analytics')
            ->middleware(['permission:analytics.view', 'organization'])
            ->group(function () {

            // Dashboard and overview analytics
            Route::get('/dashboard', [AnalyticsController::class, 'dashboard']);
            Route::get('/realtime', [AnalyticsController::class, 'realtime']);

            // Specific analytics endpoints
            Route::get('/usage', [AnalyticsController::class, 'usage']);
            Route::get('/performance', [AnalyticsController::class, 'performance']);
            Route::get('/conversations', [AnalyticsController::class, 'conversations']);
            Route::get('/users', [AnalyticsController::class, 'users']);
            Route::get('/revenue', [AnalyticsController::class, 'revenue']);

            // AI Agent workflow analytics
            Route::post('/workflow-execution', [AnalyticsController::class, 'workflowExecution']);
            Route::get('/ai-agent-workflow', [AnalyticsController::class, 'aiAgentWorkflow']);
            Route::get('/workflow-performance', [AnalyticsController::class, 'workflowPerformance']);

            // Chatbot-specific analytics
            Route::get('/chatbot/{chatbotId}', [AnalyticsController::class, 'chatbot']);

            // Export functionality
            Route::middleware(['permission:analytics.export'])->post('/export', [AnalyticsController::class, 'export']);
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

            // Utility endpoints
            Route::post('/check-email', [UserController::class, 'checkEmail']);
            Route::post('/check-username', [UserController::class, 'checkUsername']);

            // Individual user operations
            Route::prefix('{id}')->group(function () {
                Route::get('/', [UserController::class, 'show']);
                Route::get('/activity', [UserController::class, 'activity']);
                Route::get('/sessions', [UserController::class, 'sessions']);
                Route::get('/permissions', [UserController::class, 'permissions']);
            });

            // Routes requiring additional permissions
            Route::middleware(['permission:users.create'])->post('/', [UserController::class, 'store']);

            Route::middleware(['permission:users.update'])->group(function () {
                Route::put('/{id}', [UserController::class, 'update']);
                Route::patch('/{id}', [UserController::class, 'update']);
                Route::patch('/{id}/toggle-status', [UserController::class, 'toggleStatus']);
                Route::post('/{id}/clone', [UserController::class, 'clone']);
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
                Route::get('/permissions', [RoleManagementController::class, 'getPermissions']);
            });

            // Routes requiring additional permissions
            Route::middleware(['permission:roles.create'])->post('/', [RoleManagementController::class, 'store']);
            Route::middleware(['permission:roles.update'])->put('/{id}', [RoleManagementController::class, 'update']);
            Route::middleware(['permission:roles.delete'])->delete('/{id}', [RoleManagementController::class, 'destroy']);
            Route::middleware(['permission:roles.assign'])->post('/assign', [RoleManagementController::class, 'assignRole']);
            Route::middleware(['permission:roles.revoke'])->post('/revoke', [RoleManagementController::class, 'revokeRole']);
            Route::middleware(['permission:roles.update'])->put('/{id}/permissions', [RoleManagementController::class, 'updatePermissions']);
        });

        // ====================================================================
        // PERMISSION MANAGEMENT (With Permission Middleware)
        // ====================================================================

        Route::prefix('permissions')
            ->middleware(['permission:permissions.view', 'organization'])
            ->group(function () {

            // Basic CRUD operations
            Route::get('/', [PermissionManagementController::class, 'index']);
            Route::get('/{permissionId}', [PermissionManagementController::class, 'show'])
                ->whereUuid('permissionId');

            // Routes requiring additional permissions
            Route::middleware(['permission:permissions.create'])->post('/', [PermissionManagementController::class, 'store']);
            Route::middleware(['permission:permissions.update'])->put('/{permissionId}', [PermissionManagementController::class, 'update'])
                ->whereUuid('permissionId');
            Route::middleware(['permission:permissions.delete'])->delete('/{permissionId}', [PermissionManagementController::class, 'destroy'])
                ->whereUuid('permissionId');

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
        // PAYMENT TRANSACTION HISTORY (Super Admin Only)
        // ====================================================================

        Route::prefix('payment-transactions')
            ->middleware(['super.admin'])
            ->group(function () {
            // Main transaction endpoints
            Route::get('/', [PaymentTransactionController::class, 'index']);
            Route::get('/statistics', [PaymentTransactionController::class, 'statistics']);
            Route::get('/export', [PaymentTransactionController::class, 'export']);

            // Individual transaction
            Route::get('/{id}', [PaymentTransactionController::class, 'show']);

            // Filtered endpoints
            Route::get('/status/{status}', [PaymentTransactionController::class, 'byStatus']);
            Route::get('/payment-method/{method}', [PaymentTransactionController::class, 'byPaymentMethod']);
            Route::get('/payment-gateway/{gateway}', [PaymentTransactionController::class, 'byPaymentGateway']);

            // History endpoints
            Route::get('/plan/{planId}/history', [PaymentTransactionController::class, 'planHistory']);
            Route::get('/organization/{organizationId}/history', [PaymentTransactionController::class, 'organizationHistory']);
        });

        // ====================================================================
        // ORGANIZATION MANAGEMENT (With Permission Middleware)
        // ====================================================================

        // ====================================================================
        // COMPREHENSIVE ORGANIZATION ROUTES
        // Complete organization management with all features
        // ====================================================================

        Route::prefix('organizations')
            ->middleware(['permission:organizations.view'])
            ->group(function () {

            // Basic CRUD operations
            Route::get('/', [OrganizationController::class, 'index']);
            Route::get('/active', [OrganizationController::class, 'active']);
            Route::get('/trial', [OrganizationController::class, 'trial']);
            Route::get('/expired-trial', [OrganizationController::class, 'expiredTrial']);
            Route::get('/business-type/{businessType}', [OrganizationController::class, 'byBusinessType']);
            Route::get('/industry/{industry}', [OrganizationController::class, 'byIndustry']);
            Route::get('/company-size/{companySize}', [OrganizationController::class, 'byCompanySize']);
            Route::get('/code/{orgCode}', [OrganizationController::class, 'showByCode']);

            // Advanced features
            Route::get('/statistics', [OrganizationController::class, 'statistics']);
            Route::get('/export', [OrganizationController::class, 'export']);
            Route::middleware(['permission:organizations.bulk_actions'])->post('/bulk-action', [OrganizationController::class, 'bulkAction']);
            Route::middleware(['permission:organizations.import'])->post('/import', [OrganizationController::class, 'import']);

            // Individual organization operations
            Route::prefix('{organization}')->group(function () {
                Route::get('/', [OrganizationController::class, 'show']);
                Route::middleware(['permission:organizations.update'])->put('/', [OrganizationController::class, 'update']);
                Route::middleware(['permission:organizations.delete'])->delete('/', [OrganizationController::class, 'destroy']);
                Route::get('/users', [OrganizationController::class, 'users']);
                Route::middleware(['permission:organizations.manage_users'])->post('/users', [OrganizationController::class, 'addUser']);
                Route::middleware(['permission:organizations.manage_users'])->delete('/users/{userId}', [OrganizationController::class, 'removeUser']);
                Route::middleware(['permission:organizations.update'])->patch('/subscription', [OrganizationController::class, 'updateSubscription']);

                // Advanced individual operations
                Route::get('/activity-logs', [OrganizationController::class, 'activityLogs']);
                Route::middleware(['permission:organizations.update'])->patch('/status', [OrganizationController::class, 'updateStatus']);
            });

            // Routes requiring additional permissions
            Route::middleware(['permission:organizations.create'])->post('/', [OrganizationController::class, 'store']);
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
        // BOT PERSONALITIES (org_admin-only, organization scoped)
        // ====================================================================

        Route::prefix('bot-personalities')
            ->middleware(['admin.only', 'organization'])
            ->group(function () {
                Route::get('/', [BotPersonalityController::class, 'index']);
                Route::post('/', [BotPersonalityController::class, 'store']);
                Route::get('/{id}', [BotPersonalityController::class, 'show']);
                Route::put('/{id}', [BotPersonalityController::class, 'update']);
                Route::patch('/{id}', [BotPersonalityController::class, 'update']);
                Route::delete('/{id}', [BotPersonalityController::class, 'destroy']);
            });

        // ====================================================================
        // AI AGENT WORKFLOW MANAGEMENT (With Permission Middleware)
        // ====================================================================

        Route::prefix('ai-agent-workflow')
            ->middleware(['permission:chatbots.manage', 'organization'])
            ->group(function () {

            // AI Agent workflow CRUD operations
            Route::post('/create', [AiAgentWorkflowController::class, 'create']);
            Route::delete('/delete', [AiAgentWorkflowController::class, 'delete']);
            Route::get('/status', [AiAgentWorkflowController::class, 'status']);
            Route::get('/analytics', [AiAgentWorkflowController::class, 'analytics']);

            // AI Agent workflow operations
            Route::post('/process-message', [AiAgentWorkflowController::class, 'processMessage']);
            Route::post('/test', [AiAgentWorkflowController::class, 'test']);
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
