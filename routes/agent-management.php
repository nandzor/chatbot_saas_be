<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AgentManagementController;

/*
|--------------------------------------------------------------------------
| Agent Management API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register agent management API routes for your application.
| These routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::prefix('agent-management')->middleware(['unified.auth', 'organization', 'throttle:api'])->group(function () {

    /**
     * Agent Statistics and Filters (must be before {agent} routes)
     */
    Route::get('/agents/statistics', [AgentManagementController::class, 'getStatistics'])
        ->name('agent-management.agents.statistics');

    Route::get('/agents/filters', [AgentManagementController::class, 'getFilters'])
        ->name('agent-management.agents.filters');

    Route::get('/agents/search', [AgentManagementController::class, 'search'])
        ->name('agent-management.agents.search');

    /**
     * Bulk Operations (must be before {agent} routes)
     */
    Route::post('/agents/bulk-status', [AgentManagementController::class, 'bulkUpdateStatus'])
        ->name('agent-management.agents.bulk-status');

    Route::post('/agents/bulk-delete', [AgentManagementController::class, 'bulkDelete'])
        ->name('agent-management.agents.bulk-delete');

    /**
     * Agent CRUD Operations
     */
    Route::get('/agents', [AgentManagementController::class, 'index'])
        ->name('agent-management.agents.index');

    Route::post('/agents', [AgentManagementController::class, 'store'])
        ->name('agent-management.agents.store');

    Route::get('/agents/{agent}', [AgentManagementController::class, 'show'])
        ->name('agent-management.agents.show');

    Route::put('/agents/{agent}', [AgentManagementController::class, 'update'])
        ->name('agent-management.agents.update');

    Route::delete('/agents/{agent}', [AgentManagementController::class, 'destroy'])
        ->name('agent-management.agents.destroy');

    /**
     * Agent Status Management
     */
    Route::patch('/agents/{agent}/status', [AgentManagementController::class, 'updateStatus'])
        ->name('agent-management.agents.status');

    Route::patch('/agents/{agent}/availability', [AgentManagementController::class, 'updateAvailability'])
        ->name('agent-management.agents.availability');

    /**
     * Agent Performance
     */
    Route::get('/agents/{agent}/performance', [AgentManagementController::class, 'getPerformance'])
        ->name('agent-management.agents.performance');

    /**
     * Agent Skills & Specializations
     */
    Route::get('/agents/{agent}/skills', [AgentManagementController::class, 'getSkills'])
        ->name('agent-management.agents.skills');

    Route::post('/agents/{agent}/skills', [AgentManagementController::class, 'updateSkills'])
        ->name('agent-management.agents.skills.update');

    /**
     * Agent Workload
     */
    Route::get('/agents/{agent}/workload', [AgentManagementController::class, 'getWorkload'])
        ->name('agent-management.agents.workload');

    /**
     * Agent Search & Filter
     */
    Route::get('/agents/search', [AgentManagementController::class, 'search'])
        ->name('agent-management.agents.search');

    Route::get('/agents/filters', [AgentManagementController::class, 'getFilters'])
        ->name('agent-management.agents.filters');
});
