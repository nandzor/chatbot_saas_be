<?php

use App\Http\Controllers\Api\V1\N8nController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| n8n API Routes
|--------------------------------------------------------------------------
|
| This file contains all the API routes for n8n workflow integration
| and testing functionality.
|
*/

Route::prefix('v1/n8n')->middleware(['unified.auth'])->group(function () {

    // Connection & Health Check
    Route::prefix('connection')->group(function () {
        Route::get('/test', [N8nController::class, 'testConnection']);
    });

    // Workflow Management
    Route::prefix('workflows')->group(function () {
        Route::get('/', [N8nController::class, 'getWorkflows']);
        Route::get('/{workflowId}', [N8nController::class, 'getWorkflow']);
        Route::post('/{workflowId}/execute', [N8nController::class, 'executeWorkflow']);
        Route::post('/{workflowId}/activate', [N8nController::class, 'activateWorkflow']);
        Route::post('/{workflowId}/deactivate', [N8nController::class, 'deactivateWorkflow']);
        Route::get('/{workflowId}/stats', [N8nController::class, 'getWorkflowStats']);
    });

    // Workflow Testing
    Route::prefix('testing')->group(function () {
        Route::post('/workflows/{workflowId}/test', [N8nController::class, 'testWorkflow']);
    });

    // Execution History
    Route::prefix('executions')->group(function () {
        Route::get('/workflows/{workflowId}', [N8nController::class, 'getWorkflowExecutions']);
    });
});
