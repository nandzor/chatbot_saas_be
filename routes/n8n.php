<?php

use App\Http\Controllers\Api\V1\N8nController;
use App\Http\Controllers\Api\V1\OAuthController;
use App\Http\Controllers\Api\V1\RagController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| N8N API Routes
|--------------------------------------------------------------------------
|
| Here are the routes for N8N workflow automation integration.
| These routes provide endpoints to manage workflows, executions,
| credentials, and webhook operations.
|
*/

Route::prefix('n8n')->group(function () {
    // Connection test route
    Route::get('/test', [N8nController::class, 'testConnection']);

    // Workflow management routes
    Route::get('/workflows', [N8nController::class, 'getWorkflows']);
    Route::get('/workflows/{workflowId}', [N8nController::class, 'getWorkflow']);
    Route::post('/workflows', [N8nController::class, 'createWorkflow']);
    Route::put('/workflows/{workflowId}', [N8nController::class, 'updateWorkflow']);
    Route::put('/workflows/{workflowId}/system-message', [N8nController::class, 'updateSystemMessage']);
    Route::delete('/workflows/{workflowId}', [N8nController::class, 'deleteWorkflow']);

    // Workflow execution routes
    Route::post('/workflows/{workflowId}/activate', [N8nController::class, 'activateWorkflow']);
    Route::post('/workflows/{workflowId}/deactivate', [N8nController::class, 'deactivateWorkflow']);
    Route::post('/workflows/{workflowId}/execute', [N8nController::class, 'executeWorkflow']);
    Route::get('/workflows/{workflowId}/executions', [N8nController::class, 'getWorkflowExecutions']);

    // Execution routes
    Route::get('/executions', [N8nController::class, 'getAllExecutions']);
    Route::get('/executions/{executionId}', [N8nController::class, 'getExecution']);

    // Credential management routes
    Route::get('/credentials', [N8nController::class, 'getCredentials']);
    Route::get('/credentials/{credentialId}', [N8nController::class, 'getCredential']);
    Route::get('/credentials/schema/{credentialTypeName}', [N8nController::class, 'getCredentialSchema']);
    Route::post('/credentials', [N8nController::class, 'createCredential']);
    Route::put('/credentials/{credentialId}', [N8nController::class, 'updateCredential']);
    Route::delete('/credentials/{credentialId}', [N8nController::class, 'deleteCredential']);
    Route::post('/credentials/{credentialId}/test', [N8nController::class, 'testCredential']);

    // Webhook routes
    Route::get('/workflows/{workflowId}/webhook-urls', [N8nController::class, 'getWebhookUrls']);
    Route::get('/workflows/{workflowId}/webhook/{nodeId}/url', [N8nController::class, 'getWebhookUrl']);
    Route::post('/workflows/{workflowId}/webhook/{nodeId}', [N8nController::class, 'sendWebhook']);
    Route::post('/workflows/{workflowId}/webhook/{nodeId}/test', [N8nController::class, 'testWebhookConnectivity']);

    // Statistics and monitoring routes
    Route::get('/workflows/{workflowId}/active', [N8nController::class, 'isWorkflowActive']);
    Route::get('/workflows/{workflowId}/stats', [N8nController::class, 'getWorkflowStats']);
});

// OAuth Integration Routes
Route::prefix('oauth')
    ->middleware(['unified.auth', 'permission:automations.manage', 'organization'])
    ->group(function () {
        // OAuth Flow Management
        Route::post('/generate-auth-url', [OAuthController::class, 'generateAuthUrl']);
        Route::post('/callback', [OAuthController::class, 'handleCallback']);
        Route::post('/test-connection', [OAuthController::class, 'testConnection']);
        Route::post('/revoke-credential', [OAuthController::class, 'revokeCredential']);

        // File Management with OAuth
        Route::get('/files', [OAuthController::class, 'getFiles']);
        Route::get('/file-details', [OAuthController::class, 'getFileDetails']);

        // Workflow Creation with OAuth
        Route::post('/create-workflow', [OAuthController::class, 'createWorkflow']);

        // Error Statistics
            Route::get('/error-statistics', [OAuthController::class, 'getErrorStatistics']);
            Route::delete('/error-statistics', [OAuthController::class, 'clearErrorStatistics']);
        });
