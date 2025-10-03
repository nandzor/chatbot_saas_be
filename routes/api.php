<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\RoleManagementController;
use App\Http\Controllers\Api\V1\PermissionManagementController;
use App\Http\Controllers\Api\V1\ChatbotController;
use App\Http\Controllers\Api\V1\ConversationController;
use App\Http\Controllers\Api\V1\InboxController;
use App\Http\Controllers\Api\V1\AnalyticsController;

use App\Http\Controllers\Api\V1\KnowledgeBaseController;
use App\Http\Controllers\Api\V1\SubscriptionPlanController;
use App\Http\Controllers\Api\V1\SubscriptionController;
use App\Http\Controllers\Api\V1\PaymentTransactionController;
use App\Http\Controllers\Api\V1\OrganizationController;
use App\Http\Controllers\Api\V1\OrganizationAuditController;
use App\Http\Controllers\Api\V1\OrganizationNotificationController;
use App\Http\Controllers\Api\V1\SettingsController;
use App\Http\Controllers\BroadcastingController;
use App\Http\Controllers\Api\V1\BotPersonalityController;
use App\Http\Controllers\Api\V1\BotPersonalityWorkflowController;
use App\Http\Controllers\Api\V1\AiAgentWorkflowController;
use App\Http\Controllers\Api\V1\WebhookEventController;
use App\Http\Controllers\Api\V1\WhatsAppWebhookController;
use App\Http\Controllers\Api\V1\SystemConfigurationController;
use App\Http\Controllers\Api\V1\NotificationTemplateController;
use App\Http\Controllers\Api\V1\QueueController;
use App\Http\Controllers\Api\V1\PermissionSyncController;
use App\Http\Controllers\Api\V1\OrganizationApprovalController;
use App\Http\Controllers\Api\V1\EscalationController;
use App\Http\Controllers\Api\V1\AgentController;
use App\Http\Controllers\Api\V1\AgentDashboardController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EmailVerificationController;
use App\Http\Controllers\WebSocketController;

// Include additional route files
require_once __DIR__ . '/n8n.php';
require_once __DIR__ . '/waha.php';
require_once __DIR__ . '/api/conversation.php';

// WAHA Status routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/waha/status', [App\Http\Controllers\Api\V1\WahaStatusController::class, 'getStatus']);
});

// WebSocket Management routes
Route::prefix('websocket')->group(function () {
    Route::get('/health', [WebSocketController::class, 'health']);
    Route::get('/config', [WebSocketController::class, 'config']);
    Route::post("/test", [WebSocketController::class, "test"]);
});

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

// WhatsApp Webhook Routes
Route::post('/webhook/whatsapp', [WhatsAppWebhookController::class, 'handleMessage'])
    ->name('webhook.whatsapp.message');

// WAHA Webhook Routes (for direct webhook URL from WAHA) - REMOVED DUPLICATE
// Route::post('/webhook/message', [\App\Http\Controllers\Api\V1\WahaController::class, 'handleMessageWebhook'])
//     ->name('webhook.waha.message')
//     ->withoutMiddleware(['unified.auth', 'waha.organization']);

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





/**
 * Broadcasting Authentication Endpoint (API Route)
 * Custom endpoint that uses unified auth middleware for WebSocket authentication
 */
Route::post('/broadcasting/auth', [BroadcastingController::class, 'authenticate'])
    ->middleware(['unified.auth']);

/**
 * Organization Self-Registration Endpoint
 * Public endpoint for organizations to register themselves
 */
Route::post('/register-organization', [AuthController::class, 'registerOrganization'])
    ->name('api.register-organization')
    ->middleware(['throttle.organization:3,15', 'security.headers', 'input.sanitization']);

/**
 * Email Verification Endpoints
 * Public endpoints for organization email verification
 */
Route::post('/verify-organization-email', [EmailVerificationController::class, 'verifyOrganizationEmail'])
    ->name('api.verify-organization-email')
    ->middleware(['throttle:auth', 'security.headers', 'input.sanitization']);

Route::post('/resend-verification', [EmailVerificationController::class, 'resendVerification'])
    ->name('api.resend-verification')
    ->middleware(['throttle:auth', 'security.headers', 'input.sanitization']);

Route::post('/get-email-from-token', [EmailVerificationController::class, 'getEmailFromToken'])
    ->name('api.get-email-from-token')
    ->middleware(['throttle:auth', 'security.headers', 'input.sanitization']);

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

            // Get conversation with recent messages
            Route::middleware(['permission:conversations.create'])->get('/{id}/recent', [ConversationController::class, 'getConversationWithRecent']);
        });

        // ====================================================================
        // INBOX MANAGEMENT (With Permission Middleware)
        // ====================================================================

        Route::prefix('inbox')
            ->middleware(['permission:inbox.read', 'organization'])
            ->group(function () {

            // Statistics and overview
            Route::get('/statistics', [InboxController::class, 'statistics']);
            Route::get('/export', [InboxController::class, 'export']);

            // Agents for transfer functionality
            Route::get('/agents', [InboxController::class, 'agents']);

            // Session management
            Route::get('/sessions', [InboxController::class, 'sessions']);
            Route::get('/sessions/active', [InboxController::class, 'activeSessions']);
            Route::get('/sessions/pending', [InboxController::class, 'pendingSessions']);

            // Individual session operations
            Route::prefix('sessions/{id}')->group(function () {
                Route::get('/', [InboxController::class, 'showSession']);
                Route::get('/messages', [InboxController::class, 'sessionMessages']);
                Route::get('/analytics', [InboxController::class, 'sessionAnalytics']);
                Route::post('/messages', [InboxController::class, 'sendMessage']);
                Route::post('/transfer', [InboxController::class, 'transferSession']);
                Route::post('/assign', [InboxController::class, 'assignSession']);
                Route::post('/end', [InboxController::class, 'endSession']);
            });

            // Message operations
            Route::post('/sessions/{sessionId}/messages/{messageId}/read', [InboxController::class, 'markMessageRead']);

            // Agent endpoints
            Route::get('/agents', [AgentController::class, 'index']);
            Route::get('/agents/available', [AgentController::class, 'available']);
            Route::get('/agents/me', [AgentController::class, 'me']);
            Route::put('/agents/me/availability', [AgentController::class, 'updateMyAvailability']);
            Route::get('/agents/{id}', [AgentController::class, 'show']);
            Route::get('/agents/{id}/statistics', [AgentController::class, 'statistics']);
            Route::put('/agents/{id}/availability', [AgentController::class, 'updateAvailability']);

            // Agent Profile endpoints
            Route::get('/agents/me/profile', [AgentController::class, 'getMyProfile']);
            Route::put('/agents/me/profile', [AgentController::class, 'updateMyProfile']);
            Route::post('/agents/me/avatar', [AgentController::class, 'uploadMyAvatar']);

            // Agent Preferences endpoints
            Route::get('/agents/me/notifications', [AgentController::class, 'getMyNotifications']);
            Route::put('/agents/me/notifications', [AgentController::class, 'updateMyNotifications']);
            Route::get('/agents/me/preferences', [AgentController::class, 'getMyPreferences']);
            Route::put('/agents/me/preferences', [AgentController::class, 'updateMyPreferences']);

            // Agent Templates endpoints
            Route::get('/agents/me/templates', [AgentController::class, 'getMyTemplates']);
            Route::post('/agents/me/templates', [AgentController::class, 'createMyTemplate']);
            Route::put('/agents/me/templates/{id}', [AgentController::class, 'updateMyTemplate']);
            Route::delete('/agents/me/templates/{id}', [AgentController::class, 'deleteMyTemplate']);

            // Agent Export endpoint
            Route::get('/agents/me/export', [AgentController::class, 'exportMyData']);

            // Agent Dashboard endpoints
            Route::prefix('agent-dashboard')->group(function () {
                Route::get('/statistics', [AgentDashboardController::class, 'statistics']);
                Route::get('/recent-sessions', [AgentDashboardController::class, 'recentSessions']);
                Route::get('/performance-metrics', [AgentDashboardController::class, 'performanceMetrics']);
                Route::get('/conversation-analytics', [AgentDashboardController::class, 'conversationAnalytics']);
                Route::get('/workload', [AgentDashboardController::class, 'workload']);
                Route::get('/realtime-activity', [AgentDashboardController::class, 'realtimeActivity']);
                Route::get('/conversation-insights', [AgentDashboardController::class, 'conversationInsights']);
            });


            // Bot personality endpoints
            Route::get('/bot-personalities', [InboxController::class, 'botPersonalities']);
            Route::get('/bot-personalities/available', [InboxController::class, 'availableBotPersonalities']);
            Route::get('/bot-personalities/statistics', [InboxController::class, 'botPersonalityStatistics']);
            Route::get('/bot-personalities/{personalityId}/performance', [InboxController::class, 'botPersonalityPerformance']);

            // Bot personality session operations
            Route::post('/sessions/{sessionId}/assign-personality', [InboxController::class, 'assignBotPersonality']);
            Route::post('/sessions/{sessionId}/generate-ai-response', [InboxController::class, 'generateAiResponse']);

            // Escalation operations
            Route::post('/sessions/{sessionId}/escalate', [EscalationController::class, 'escalateSession']);
            Route::get('/escalation/config', [EscalationController::class, 'getEscalationConfig']);
            Route::put('/escalation/config', [EscalationController::class, 'updateEscalationConfig']);
            Route::get('/escalation/stats', [EscalationController::class, 'getEscalationStats']);
            Route::get('/escalation/available-agents', [EscalationController::class, 'getAvailableAgents']);

            // Routes requiring additional permissions
            Route::middleware(['permission:inbox.create'])->post('/sessions', [InboxController::class, 'createSession']);
            Route::middleware(['permission:inbox.update'])->put('/sessions/{id}', [InboxController::class, 'updateSession']);
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
        // ORGANIZATION DASHBOARD (With Permission Middleware)
        // ====================================================================

        Route::prefix('organization-dashboard')
            ->middleware(['permission:analytics.view', 'organization'])
            ->group(function () {

            // Dashboard overview
            Route::get('/overview', [\App\Http\Controllers\Api\V1\OrganizationDashboardController::class, 'overview']);
            Route::get('/realtime', [\App\Http\Controllers\Api\V1\OrganizationDashboardController::class, 'realtime']);
            Route::get('/session-distribution', [\App\Http\Controllers\Api\V1\OrganizationDashboardController::class, 'sessionDistribution']);

            // Export functionality
            Route::middleware(['permission:analytics.export'])->post('/export', [\App\Http\Controllers\Api\V1\OrganizationDashboardController::class, 'export']);
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

            // Permission synchronization
            Route::prefix('sync')->middleware(['permission:permissions.manage'])->group(function () {
                Route::post('/user/{userId}', [PermissionSyncController::class, 'syncUser']);
                Route::post('/role', [PermissionSyncController::class, 'syncByRole']);
                Route::post('/all', [PermissionSyncController::class, 'syncAll']);
                Route::get('/user/{userId}/compare', [PermissionSyncController::class, 'compareUser']);
                Route::get('/statistics', [PermissionSyncController::class, 'statistics']);
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
            Route::get('/analytics', [SubscriptionPlanController::class, 'analytics']);
            Route::get('/export', [SubscriptionPlanController::class, 'export']);

            // Enhanced plan endpoints (from subscription management integration)
            Route::get('/with-subscription-count', [SubscriptionPlanController::class, 'withSubscriptionCount']);
            Route::get('/popular-with-stats', [SubscriptionPlanController::class, 'popularWithStats']);
            Route::get('/tier/{tier}/with-features', [SubscriptionPlanController::class, 'byTierWithFeatures']);
            Route::get('/comparison', [SubscriptionPlanController::class, 'comparison']);
            Route::get('/recommendations', [SubscriptionPlanController::class, 'recommendations']);

            // Individual plan operations
            Route::prefix('{subscription_plan}')->group(function () {
                Route::get('/', [SubscriptionPlanController::class, 'show']);
                Route::get('/features', [SubscriptionPlanController::class, 'features']);
                Route::get('/pricing', [SubscriptionPlanController::class, 'pricing']);
                Route::get('/subscriptions', [SubscriptionPlanController::class, 'subscriptions']);
                Route::get('/usage-stats', [SubscriptionPlanController::class, 'usageStats']);

                Route::middleware(['permission:subscription_plans.update'])->put('/', [SubscriptionPlanController::class, 'update']);
                Route::middleware(['permission:subscription_plans.update'])->patch('/', [SubscriptionPlanController::class, 'update']);
                Route::middleware(['permission:subscription_plans.delete'])->delete('/', [SubscriptionPlanController::class, 'destroy']);
                Route::middleware(['permission:subscription_plans.update'])->patch('/toggle-popular', [SubscriptionPlanController::class, 'togglePopular']);
                Route::middleware(['permission:subscription_plans.update'])->patch('/toggle-status', [SubscriptionPlanController::class, 'toggleStatus']);
                Route::middleware(['permission:subscription_plans.update'])->patch('/duplicate', [SubscriptionPlanController::class, 'duplicate']);
            });

            // Routes requiring additional permissions
            Route::middleware(['permission:subscription_plans.create'])->post('/', [SubscriptionPlanController::class, 'store']);
            Route::middleware(['permission:subscription_plans.update'])->patch('/sort-order', [SubscriptionPlanController::class, 'updateSortOrder']);
            Route::middleware(['permission:subscription_plans.create'])->post('/bulk-create', [SubscriptionPlanController::class, 'bulkCreate']);
            Route::middleware(['permission:subscription_plans.update'])->patch('/bulk-update', [SubscriptionPlanController::class, 'bulkUpdate']);
        });

        // ====================================================================
        // SUBSCRIPTION MANAGEMENT
        // ====================================================================

        // Super Admin subscription management (full access)
        Route::prefix('subscriptions')
            ->middleware(['super.admin'])
            ->group(function () {
            // Main subscription endpoints
            Route::get('/', [SubscriptionController::class, 'index']);
            Route::get('/statistics', [SubscriptionController::class, 'statistics']);
            Route::get('/analytics', [SubscriptionController::class, 'analytics']);
            Route::get('/export', [SubscriptionController::class, 'export']);

            // CRUD operations
            Route::post('/', [SubscriptionController::class, 'store']);
            Route::put('/{id}', [SubscriptionController::class, 'update']);
            Route::patch('/{id}', [SubscriptionController::class, 'update']);
            Route::delete('/{id}', [SubscriptionController::class, 'destroy']);

            // Individual subscription
            Route::get('/{id}', [SubscriptionController::class, 'show']);

            // Subscription lifecycle management
            Route::patch('/{id}/activate', [SubscriptionController::class, 'activate']);
            Route::patch('/{id}/suspend', [SubscriptionController::class, 'suspend']);
            Route::patch('/{id}/cancel', [SubscriptionController::class, 'cancel']);
            Route::patch('/{id}/renew', [SubscriptionController::class, 'renew']);
            Route::patch('/{id}/upgrade', [SubscriptionController::class, 'upgrade']);
            Route::patch('/{id}/downgrade', [SubscriptionController::class, 'downgrade']);

            // Subscription billing management
            Route::get('/{id}/billing', [SubscriptionController::class, 'billing']);
            Route::post('/{id}/billing/process', [SubscriptionController::class, 'processBilling']);
            Route::get('/{id}/invoices', [SubscriptionController::class, 'invoices']);
            Route::get('/{id}/invoices/{invoiceId}', [SubscriptionController::class, 'invoice']);

            // Bulk operations
            Route::patch('/bulk-update', [SubscriptionController::class, 'bulkUpdate']);
            Route::patch('/bulk-cancel', [SubscriptionController::class, 'bulkCancel']);
            Route::patch('/bulk-renew', [SubscriptionController::class, 'bulkRenew']);

            // Filtered endpoints
            Route::get('/organization/{organizationId}', [SubscriptionController::class, 'byOrganization']);
            Route::get('/plan/{planId}', [SubscriptionController::class, 'byPlan']);
            Route::get('/status/{status}', [SubscriptionController::class, 'byStatus']);
            Route::get('/billing-cycle/{billingCycle}', [SubscriptionController::class, 'byBillingCycle']);
            Route::get('/trial/active', [SubscriptionController::class, 'activeTrials']);
            Route::get('/trial/expired', [SubscriptionController::class, 'expiredTrials']);
            Route::get('/expiring', [SubscriptionController::class, 'expiringSubscriptions']);

            // Additional endpoints
            Route::get('/{id}/history', [SubscriptionController::class, 'history']);
            Route::get('/{id}/usage', [SubscriptionController::class, 'usage']);
            Route::get('/{id}/metrics', [SubscriptionController::class, 'metrics']);
            Route::get('/usage/overview', [SubscriptionController::class, 'usageOverview']);
        });

        // Organization-scoped subscription access (for organization admins)
        Route::prefix('subscriptions')
            ->middleware(['permission:subscriptions.view', 'organization'])
            ->group(function () {
            // Organization's own subscription
            Route::get('/my-subscription', [SubscriptionController::class, 'mySubscription']);
            Route::get('/my-subscription/usage', [SubscriptionController::class, 'myUsage']);
            Route::get('/my-subscription/billing', [SubscriptionController::class, 'myBilling']);
            Route::get('/my-subscription/invoices', [SubscriptionController::class, 'myInvoices']);
            Route::get('/my-subscription/history', [SubscriptionController::class, 'myHistory']);
            Route::get('/my-subscription/metrics', [SubscriptionController::class, 'myMetrics']);

            // Subscription management (limited to own organization)
            Route::middleware(['permission:subscriptions.update'])->group(function () {
                Route::patch('/my-subscription/upgrade', [SubscriptionController::class, 'requestUpgrade']);
                Route::patch('/my-subscription/downgrade', [SubscriptionController::class, 'requestDowngrade']);
                Route::patch('/my-subscription/cancel', [SubscriptionController::class, 'requestCancellation']);
                Route::patch('/my-subscription/renew', [SubscriptionController::class, 'requestRenewal']);
            });

            // Subscription plan comparison and selection
            Route::get('/plans/compare', [SubscriptionController::class, 'comparePlans']);
            Route::get('/plans/available', [SubscriptionController::class, 'availablePlans']);
            Route::get('/plans/recommended', [SubscriptionController::class, 'recommendedPlans']);
            Route::get('/plans/upgrade-options', [SubscriptionController::class, 'upgradeOptions']);
        });


        // Webhook endpoints (with security validation)
        Route::prefix('webhooks')->group(function () {
            // Public webhook endpoints (no authentication required for external services)
            Route::post('/subscriptions', [SubscriptionController::class, 'webhook'])
                ->middleware(['throttle:webhook', 'webhook.signature']);
            Route::post('/subscriptions/validate', [SubscriptionController::class, 'validateWebhook'])
                ->middleware(['throttle:webhook']);

            // Payment gateway webhooks
            Route::post('/payments/stripe', [PaymentTransactionController::class, 'stripeWebhook'])
                ->middleware(['throttle:webhook', 'webhook.signature']);
            Route::post('/payments/midtrans', [PaymentTransactionController::class, 'midtransWebhook'])
                ->middleware(['throttle:webhook', 'webhook.signature']);
            Route::post('/payments/xendit', [PaymentTransactionController::class, 'xenditWebhook'])
                ->middleware(['throttle:webhook', 'webhook.signature']);

            // Admin webhook management (authenticated)
            Route::middleware(['super.admin'])->group(function () {
                Route::get('/subscriptions/logs', [SubscriptionController::class, 'webhookLogs']);
                Route::get('/subscriptions/logs/{id}', [SubscriptionController::class, 'webhookLog']);
                Route::post('/subscriptions/test', [SubscriptionController::class, 'testWebhook']);
                Route::post('/subscriptions/retry/{id}', [SubscriptionController::class, 'retryWebhook']);
            });
        });

                // ====================================================================
        // PAYMENT TRANSACTION MANAGEMENT
        // ====================================================================

        // Super Admin payment transaction management (full access)
        Route::prefix('payment-transactions')
            ->middleware(['super.admin'])
            ->group(function () {
            // Main transaction endpoints
            Route::get('/', [PaymentTransactionController::class, 'index']);
            Route::get('/statistics', [PaymentTransactionController::class, 'statistics']);
            Route::get('/analytics', [PaymentTransactionController::class, 'analytics']);
            Route::get('/export', [PaymentTransactionController::class, 'export']);

            // Individual transaction
            Route::get('/{id}', [PaymentTransactionController::class, 'show']);
            Route::patch('/{id}/refund', [PaymentTransactionController::class, 'refund']);
            Route::patch('/{id}/retry', [PaymentTransactionController::class, 'retry']);

            // Filtered endpoints
            Route::get('/status/{status}', [PaymentTransactionController::class, 'byStatus']);
            Route::get('/payment-method/{method}', [PaymentTransactionController::class, 'byPaymentMethod']);
            Route::get('/payment-gateway/{gateway}', [PaymentTransactionController::class, 'byPaymentGateway']);
            Route::get('/date-range', [PaymentTransactionController::class, 'byDateRange']);
            Route::get('/amount-range', [PaymentTransactionController::class, 'byAmountRange']);

            // History endpoints
            Route::get('/plan/{planId}/history', [PaymentTransactionController::class, 'planHistory']);
            Route::get('/organization/{organizationId}/history', [PaymentTransactionController::class, 'organizationHistory']);
            Route::get('/subscription/{subscriptionId}/history', [PaymentTransactionController::class, 'subscriptionHistory']);

            // Bulk operations
            Route::patch('/bulk-refund', [PaymentTransactionController::class, 'bulkRefund']);
            Route::patch('/bulk-retry', [PaymentTransactionController::class, 'bulkRetry']);
        });

        // Organization-scoped payment transaction access
        Route::prefix('payment-transactions')
            ->middleware(['permission:payments.view', 'organization'])
            ->group(function () {
            // Organization's own payment transactions
            Route::get('/my-transactions', [PaymentTransactionController::class, 'myTransactions']);
            Route::get('/my-transactions/{id}', [PaymentTransactionController::class, 'myTransaction']);
            Route::get('/my-transactions/statistics', [PaymentTransactionController::class, 'myStatistics']);
        });

        // ====================================================================
        // ORGANIZATION MANAGEMENT (With Permission Middleware)
        // ====================================================================

        // ====================================================================
        // COMPREHENSIVE ORGANIZATION ROUTES
        // Complete organization management with all features
        // ====================================================================

        Route::prefix('organizations')
            ->middleware(['permission:organizations.view', 'organization.management'])
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
            Route::get('/statistics', [OrganizationController::class, 'getStatistics']);
            Route::get('/search', [OrganizationController::class, 'search']);
            Route::get('/analytics', [OrganizationController::class, 'getAllOrganizationsAnalytics']);
            Route::post('/analytics/cache/clear', [OrganizationController::class, 'clearAnalyticsCache']);
            Route::get('/analytics/cache/status', [OrganizationController::class, 'getAnalyticsCacheStatus']);
            Route::get('/export', [OrganizationController::class, 'export']);
            Route::get('/deleted', [OrganizationController::class, 'deleted']);
            Route::middleware(['permission:organizations.bulk_actions'])->post('/bulk-action', [OrganizationController::class, 'bulkAction']);
            Route::middleware(['permission:organizations.import'])->post('/import', [OrganizationController::class, 'import']);

            // Individual organization operations
            Route::prefix('{organization}')->group(function () {
                Route::get('/', [OrganizationController::class, 'show']);
                Route::middleware(['permission:organizations.update'])->put('/', [OrganizationController::class, 'update']);
                Route::middleware(['permission:organizations.delete'])->delete('/', [OrganizationController::class, 'destroy']);
                Route::get('/users', [OrganizationController::class, 'users']);
                Route::get('/users/{userId}', [OrganizationController::class, 'showUser']);
                Route::middleware(['permission:organizations.manage_users'])->post('/users', [OrganizationController::class, 'createUser']);
                Route::middleware(['permission:organizations.manage_users'])->post('/users/add', [OrganizationController::class, 'addUser']);
                Route::middleware(['permission:organizations.manage_users'])->put('/users/{userId}', [OrganizationController::class, 'updateUser']);
                Route::middleware(['permission:organizations.manage_users'])->patch('/users/{userId}', [OrganizationController::class, 'updateUser']);
                Route::middleware(['permission:organizations.manage_users'])->patch('/users/{userId}/toggle-status', [OrganizationController::class, 'toggleUserStatus']);
                Route::middleware(['permission:organizations.manage_users'])->delete('/users/{userId}', [OrganizationController::class, 'removeUser']);
                Route::middleware(['permission:organizations.update'])->patch('/subscription', [OrganizationController::class, 'updateSubscription']);

                // Advanced individual operations
                Route::get('/activity-logs', [OrganizationController::class, 'activityLogs']);
                Route::get('/statistics', [OrganizationController::class, 'getOrganizationStatistics']);
                Route::get('/health', [OrganizationController::class, 'health']);
                Route::get('/analytics', [OrganizationController::class, 'analytics']);
                Route::get('/metrics', [OrganizationController::class, 'metrics']);
                Route::post('/restore', [OrganizationController::class, 'restore']);
                Route::middleware(['permission:organizations.update'])->patch('/status', [OrganizationController::class, 'updateStatus']);

                // Organization settings
                Route::get('/settings', [OrganizationController::class, 'getSettings']);
                Route::middleware(['permission:organizations.update'])->put('/settings', [OrganizationController::class, 'saveSettings']);
                Route::middleware(['permission:organizations.update'])->post('/webhook/test', [OrganizationController::class, 'testWebhook']);

                // Organization analytics
                Route::get('/analytics', [OrganizationController::class, 'getAnalytics']);

                // Organization roles and permissions
                Route::get('/roles', [OrganizationController::class, 'getRoles']);
                Route::middleware(['permission:organizations.manage_permissions'])->put('/roles/{roleId}/permissions', [OrganizationController::class, 'saveRolePermissions']);
                Route::middleware(['permission:organizations.manage_permissions'])->put('/permissions', [OrganizationController::class, 'saveAllPermissions']);

                // Organization audit logs
                Route::get('/audit-logs', [OrganizationAuditController::class, 'index']);
                Route::get('/audit-logs/statistics', [OrganizationAuditController::class, 'statistics']);
                Route::get('/audit-logs/{auditLogId}', [OrganizationAuditController::class, 'show']);

                // Organization notifications
                Route::get('/notifications', [OrganizationNotificationController::class, 'index']);
                Route::post('/notifications', [OrganizationNotificationController::class, 'send']);
                Route::patch('/notifications/{notificationId}/read', [OrganizationNotificationController::class, 'markAsRead']);
                Route::patch('/notifications/read-all', [OrganizationNotificationController::class, 'markAllAsRead']);
                Route::delete('/notifications/{notificationId}', [OrganizationNotificationController::class, 'destroy']);
            });

            // Routes requiring additional permissions
            Route::middleware(['permission:organizations.create'])->post('/', [OrganizationController::class, 'store']);
        });

        // ====================================================================
        // SUPERADMIN ROUTES
        // Routes for superadmin functionality
        // ====================================================================

        Route::prefix('superadmin')
            ->middleware(['permission:superadmin.*'])
            ->group(function () {
                // Login as admin
                Route::post('/login-as-admin', [OrganizationController::class, 'loginAsAdmin']);

                // Force password reset
                Route::post('/force-password-reset', [OrganizationController::class, 'forcePasswordReset']);

                // Organization approval management
                Route::prefix('organization-approvals')->group(function () {
                    Route::get('/', [OrganizationApprovalController::class, 'getPendingOrganizations']);
                    Route::get('/statistics', [OrganizationApprovalController::class, 'getApprovalStatistics']);
                    Route::post('/{id}/approve', [OrganizationApprovalController::class, 'approveOrganization']);
                    Route::post('/{id}/reject', [OrganizationApprovalController::class, 'rejectOrganization']);
                });

                // Organization registration monitoring
                Route::prefix('organization-registration-monitor')->group(function () {
                    Route::get('/health', [\App\Http\Controllers\Api\V1\OrganizationRegistrationMonitorController::class, 'getHealthStatus']);
                    Route::get('/dashboard', [\App\Http\Controllers\Api\V1\OrganizationRegistrationMonitorController::class, 'getDashboardData']);
                    Route::get('/statistics', [\App\Http\Controllers\Api\V1\OrganizationRegistrationMonitorController::class, 'getRegistrationStatistics']);
                    Route::get('/performance', [\App\Http\Controllers\Api\V1\OrganizationRegistrationMonitorController::class, 'getPerformanceMetrics']);
                    Route::get('/security-events', [\App\Http\Controllers\Api\V1\OrganizationRegistrationMonitorController::class, 'getRecentSecurityEvents']);
                    Route::get('/alerts', [\App\Http\Controllers\Api\V1\OrganizationRegistrationMonitorController::class, 'getSystemAlerts']);
                    Route::get('/trends', [\App\Http\Controllers\Api\V1\OrganizationRegistrationMonitorController::class, 'getRegistrationTrends']);
                    Route::post('/cleanup', [\App\Http\Controllers\Api\V1\OrganizationRegistrationMonitorController::class, 'cleanupExpiredData']);
                });

                // Organization registration optimization
                Route::prefix('organization-registration-optimizer')->group(function () {
                    Route::post('/optimize-database', [\App\Http\Controllers\Api\V1\OrganizationRegistrationOptimizerController::class, 'optimizeDatabase']);
                    Route::get('/performance-metrics', [\App\Http\Controllers\Api\V1\OrganizationRegistrationOptimizerController::class, 'getPerformanceMetrics']);
                    Route::post('/maintenance', [\App\Http\Controllers\Api\V1\OrganizationRegistrationOptimizerController::class, 'runMaintenance']);
                    Route::get('/database-health', [\App\Http\Controllers\Api\V1\OrganizationRegistrationOptimizerController::class, 'getDatabaseHealth']);
                });
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
            ->middleware(['permission:knowledge_articles.view', 'organization', 'knowledge-base.org-access'])
            ->group(function () {

            // Basic CRUD operations
            Route::get('/', [KnowledgeBaseController::class, 'index'])->name('knowledge-base.index');
            Route::get('/categories', [KnowledgeBaseController::class, 'categories'])->name('knowledge-base.categories');
            Route::get('/search', [KnowledgeBaseController::class, 'search'])->name('knowledge-base.search');
            Route::get('/slug/{slug}', [KnowledgeBaseController::class, 'showBySlug'])->name('knowledge-base.show-by-slug');

            // Individual knowledge base item operations
            Route::prefix('{id}')->group(function () {
                Route::get('/', [KnowledgeBaseController::class, 'show']);
                Route::get('/related', [KnowledgeBaseController::class, 'related']);
                Route::post('/mark-helpful', [KnowledgeBaseController::class, 'markHelpful']);
                Route::post('/mark-not-helpful', [KnowledgeBaseController::class, 'markNotHelpful']);
            });

            // Routes requiring additional permissions
            Route::middleware(['permission:knowledge.create'])->post('/', [KnowledgeBaseController::class, 'store'])->name('knowledge-base.store');

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
            Route::get('/category/{categoryId}', [KnowledgeBaseController::class, 'byCategory'])->name('knowledge-base.byCategory');
            Route::get('/tag/{tagId}', [KnowledgeBaseController::class, 'byTag'])->name('knowledge-base.byTag');
        });

        // ====================================================================
        // BOT PERSONALITIES (org_admin-only, organization scoped)
        // ====================================================================

        Route::prefix('bot-personalities')
            ->middleware(['permission:bot_personalities.manage', 'organization'])
            ->group(function () {
                Route::get('/', [BotPersonalityController::class, 'index']);
                Route::post('/', [BotPersonalityController::class, 'store']);
                Route::get('/{id}', [BotPersonalityController::class, 'show']);
                Route::put('/{id}', [BotPersonalityController::class, 'update']);
                Route::patch('/{id}', [BotPersonalityController::class, 'update']);
                Route::delete('/{id}', [BotPersonalityController::class, 'destroy']);

                // Workflow endpoints
                Route::post('/workflow/execute', [BotPersonalityWorkflowController::class, 'executeWorkflow']);
                Route::get('/workflow/{id}/status', [BotPersonalityWorkflowController::class, 'getWorkflowStatus']);
                Route::post('/workflow/retry', [BotPersonalityWorkflowController::class, 'retryWorkflow']);
                Route::delete('/workflow/{id}/cancel', [BotPersonalityWorkflowController::class, 'cancelWorkflow']);
                Route::get('/workflow/{id}/history', [BotPersonalityWorkflowController::class, 'getWorkflowHistory']);

                // Sync endpoints
                Route::post('/{id}/sync', [BotPersonalityController::class, 'syncWorkflow']);
                Route::get('/{id}/sync-status', [BotPersonalityController::class, 'getSyncStatus']);
                Route::post('/bulk-sync', [BotPersonalityController::class, 'bulkSyncWorkflows']);
                Route::post('/sync-organization', [BotPersonalityController::class, 'syncOrganizationWorkflows']);
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
// SETTINGS ROUTES
// ============================================================================

Route::prefix('settings')
    ->middleware(['auth:sanctum', 'permission:settings.manage'])
    ->group(function () {
        Route::get('/client-management', [SettingsController::class, 'getClientManagementSettings']);
        Route::put('/client-management', [SettingsController::class, 'updateClientManagementSettings']);
        Route::post('/client-management/reset', [SettingsController::class, 'resetToDefaults']);
        Route::get('/client-management/export', [SettingsController::class, 'exportSettings']);
        Route::post('/client-management/import', [SettingsController::class, 'importSettings']);
    });

// ============================================================================
// HEALTH CHECK & MONITORING
// ============================================================================

Route::prefix('health')->name('health.')->group(function () {
    Route::get('/basic', [App\Http\Controllers\Api\V1\HealthCheckController::class, 'basic'])->name('basic');
    Route::get('/detailed', [App\Http\Controllers\Api\V1\HealthCheckController::class, 'detailed'])->name('detailed');
    Route::get('/metrics', [App\Http\Controllers\Api\V1\HealthCheckController::class, 'metrics'])->name('metrics');
});

// ============================================================================
// BILLING INVOICE MANAGEMENT
// ============================================================================

Route::middleware(['unified.auth', 'organization'])->group(function () {
    // Billing Invoice Routes
    Route::prefix('billing-invoices')->name('billing-invoices.')->group(function () {
        Route::get('/', [App\Http\Controllers\Api\V1\BillingInvoiceController::class, 'index'])->name('index');
        Route::post('/', [App\Http\Controllers\Api\V1\BillingInvoiceController::class, 'store'])->name('store');
        Route::get('/{id}', [App\Http\Controllers\Api\V1\BillingInvoiceController::class, 'show'])->name('show');
        Route::put('/{id}', [App\Http\Controllers\Api\V1\BillingInvoiceController::class, 'update'])->name('update');
        Route::patch('/{id}/mark-paid', [App\Http\Controllers\Api\V1\BillingInvoiceController::class, 'markAsPaid'])->name('mark-paid');
        Route::patch('/{id}/mark-overdue', [App\Http\Controllers\Api\V1\BillingInvoiceController::class, 'markAsOverdue'])->name('mark-overdue');
        Route::patch('/{id}/cancel', [App\Http\Controllers\Api\V1\BillingInvoiceController::class, 'cancel'])->name('cancel');
        Route::get('/organization/{organizationId}', [App\Http\Controllers\Api\V1\BillingInvoiceController::class, 'getOrganizationInvoices'])->name('organization');
        Route::get('/subscription/{subscriptionId}', [App\Http\Controllers\Api\V1\BillingInvoiceController::class, 'getSubscriptionInvoices'])->name('subscription');
        Route::get('/overdue/list', [App\Http\Controllers\Api\V1\BillingInvoiceController::class, 'getOverdueInvoices'])->name('overdue');
        Route::get('/upcoming/list', [App\Http\Controllers\Api\V1\BillingInvoiceController::class, 'getUpcomingInvoices'])->name('upcoming');
        Route::get('/statistics/summary', [App\Http\Controllers\Api\V1\BillingInvoiceController::class, 'getStatistics'])->name('statistics');
    });
});

// ============================================================================
// WEBHOOK EVENT MANAGEMENT
// ============================================================================

Route::middleware(['unified.auth', 'organization'])->group(function () {
    // Webhook Event Routes
    Route::prefix('webhook-events')->name('webhook-events.')->group(function () {
        Route::get('/', [WebhookEventController::class, 'index'])->name('index');
        Route::post('/', [WebhookEventController::class, 'store'])->name('store');
        Route::get('/{webhookEvent}', [WebhookEventController::class, 'show'])->name('show');
        Route::put('/{webhookEvent}', [WebhookEventController::class, 'update'])->name('update');
        Route::delete('/{webhookEvent}', [WebhookEventController::class, 'destroy'])->name('destroy');
        Route::post('/{webhookEvent}/retry', [WebhookEventController::class, 'retry'])->name('retry');
        Route::get('/statistics/summary', [WebhookEventController::class, 'statistics'])->name('statistics');
        Route::get('/ready-for-retry/list', [WebhookEventController::class, 'readyForRetry'])->name('ready-for-retry');
        Route::post('/bulk-retry', [WebhookEventController::class, 'bulkRetry'])->name('bulk-retry');
        Route::get('/{webhookEvent}/logs', [WebhookEventController::class, 'logs'])->name('logs');
    });
});

// ============================================================================
// SYSTEM CONFIGURATION MANAGEMENT
// ============================================================================

Route::middleware(['unified.auth', 'organization'])->group(function () {
    // System Configuration Routes
    Route::prefix('system-configurations')->name('system-configurations.')->group(function () {
        Route::get('/', [SystemConfigurationController::class, 'index'])->name('index');
        Route::post('/', [SystemConfigurationController::class, 'store'])->name('store');
        Route::get('/{systemConfiguration}', [SystemConfigurationController::class, 'show'])->name('show');
        Route::put('/{systemConfiguration}', [SystemConfigurationController::class, 'update'])->name('update');
        Route::delete('/{systemConfiguration}', [SystemConfigurationController::class, 'destroy'])->name('destroy');
        Route::get('/category/{category}', [SystemConfigurationController::class, 'getByCategory'])->name('category');
        Route::get('/public/list', [SystemConfigurationController::class, 'getPublic'])->name('public');
        Route::get('/value/{key}', [SystemConfigurationController::class, 'getValue'])->name('value');
        Route::post('/value/{key}', [SystemConfigurationController::class, 'setValue'])->name('set-value');
        Route::post('/bulk-update', [SystemConfigurationController::class, 'bulkUpdate'])->name('bulk-update');
        Route::get('/export/data', [SystemConfigurationController::class, 'export'])->name('export');
        Route::post('/import/data', [SystemConfigurationController::class, 'import'])->name('import');
        Route::post('/cache/clear', [SystemConfigurationController::class, 'clearCache'])->name('clear-cache');
        Route::post('/cache/warm-up', [SystemConfigurationController::class, 'warmUpCache'])->name('warm-up-cache');
    });
});

// ============================================================================
// NOTIFICATION TEMPLATE MANAGEMENT
// ============================================================================

Route::middleware(['unified.auth', 'organization'])->group(function () {
    // Notification Template Routes
    Route::prefix('notification-templates')->name('notification-templates.')->group(function () {
        Route::get('/', [NotificationTemplateController::class, 'index'])->name('index');
        Route::post('/', [NotificationTemplateController::class, 'store'])->name('store');
        Route::get('/{notificationTemplate}', [NotificationTemplateController::class, 'show'])->name('show');
        Route::put('/{notificationTemplate}', [NotificationTemplateController::class, 'update'])->name('update');
        Route::delete('/{notificationTemplate}', [NotificationTemplateController::class, 'destroy'])->name('destroy');
        Route::get('/{name}/preview', [NotificationTemplateController::class, 'preview'])->name('preview');
        Route::post('/{name}/send', [NotificationTemplateController::class, 'send'])->name('send');
        Route::post('/{name}/validate-data', [NotificationTemplateController::class, 'validateData'])->name('validate-data');
        Route::get('/category/{category}', [NotificationTemplateController::class, 'getByCategory'])->name('category');
        Route::get('/available/list', [NotificationTemplateController::class, 'getAvailable'])->name('available');
        Route::patch('/{notificationTemplate}/toggle-status', [NotificationTemplateController::class, 'toggleStatus'])->name('toggle-status');
        Route::post('/cache/clear', [NotificationTemplateController::class, 'clearCache'])->name('clear-cache');
    });
});

// ============================================================================
// QUEUE MANAGEMENT
// ============================================================================

Route::middleware(['unified.auth', 'organization'])->group(function () {
    // Queue Management Routes
    Route::prefix('queue')->name('queue.')->group(function () {
        Route::get('/status', [QueueController::class, 'status'])->name('status');
        Route::get('/statistics', [QueueController::class, 'statistics'])->name('statistics');
        Route::get('/health', [QueueController::class, 'health'])->name('health');
        Route::get('/failed-jobs', [QueueController::class, 'failedJobs'])->name('failed-jobs');
        Route::post('/failed-jobs/{id}/retry', [QueueController::class, 'retryJob'])->name('retry-job');
        Route::delete('/failed-jobs/{id}', [QueueController::class, 'deleteFailedJob'])->name('delete-failed-job');
        Route::post('/failed-jobs/retry-all', [QueueController::class, 'retryAllFailed'])->name('retry-all-failed');
        Route::post('/failed-jobs/clear-all', [QueueController::class, 'clearAllFailed'])->name('clear-all-failed');
        Route::post('/workers/restart', [QueueController::class, 'restartWorkers'])->name('restart-workers');
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
