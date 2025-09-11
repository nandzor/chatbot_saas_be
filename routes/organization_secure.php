<?php

use App\Http\Controllers\Api\V1\OrganizationController;
use Illuminate\Support\Facades\Route;

/**
 * Organization Routes with Enhanced Security
 *
 * This file demonstrates how to properly secure organization routes
 * to ensure organization admins can only manage their own organization
 *
 * NOTE: This is a reference implementation. The actual routes are defined
 * in routes/api.php with proper middleware and permission system.
 */

// This file is for reference only - actual routes are in routes/api.php
// The routes below show the proper middleware configuration for organization security

/*
// Public organization routes (any authenticated user)
Route::middleware(['unified.auth', 'organization.role:any'])->group(function () {
    Route::get('/organizations', [OrganizationController::class, 'index']);
    Route::get('/organizations/active', [OrganizationController::class, 'active']);
    Route::get('/organizations/trial', [OrganizationController::class, 'trial']);
    Route::get('/organizations/statistics', [OrganizationController::class, 'getStatistics']);
    Route::get('/organizations/search', [OrganizationController::class, 'search']);
});

// Organization-scoped routes (users can only access their own organization)
Route::middleware(['unified.auth', 'organization.role:organization_member', 'organization.scope'])->group(function () {
    Route::get('/organizations/{id}', [OrganizationController::class, 'show']);
    Route::get('/organizations/{id}/analytics', [OrganizationController::class, 'analytics']);
    Route::get('/organizations/{id}/health', [OrganizationController::class, 'health']);
    Route::get('/organizations/{id}/metrics', [OrganizationController::class, 'metrics']);
    Route::get('/organizations/{id}/activity-logs', [OrganizationController::class, 'activityLogs']);
});

// Organization admin routes (organization admins can only manage their own organization)
Route::middleware(['unified.auth', 'organization.admin'])->group(function () {
    Route::put('/organizations/{id}', [OrganizationController::class, 'update']);
    Route::get('/organizations/{id}/users', [OrganizationController::class, 'users']);
    Route::post('/organizations/{id}/users', [OrganizationController::class, 'addUser']);
    Route::delete('/organizations/{id}/users/{userId}', [OrganizationController::class, 'removeUser']);
    Route::put('/organizations/{id}/subscription', [OrganizationController::class, 'updateSubscription']);
    Route::get('/organizations/{id}/settings', [OrganizationController::class, 'getSettings']);
    Route::put('/organizations/{id}/settings', [OrganizationController::class, 'saveSettings']);
    Route::post('/organizations/{id}/test-webhook', [OrganizationController::class, 'testWebhook']);
    Route::get('/organizations/{id}/roles', [OrganizationController::class, 'getRoles']);
    Route::put('/organizations/{id}/roles/{roleId}/permissions', [OrganizationController::class, 'saveRolePermissions']);
    Route::put('/organizations/{id}/roles', [OrganizationController::class, 'saveAllPermissions']);
});

// Super admin only routes (can manage any organization)
Route::middleware(['unified.auth', 'organization.role:super_admin'])->group(function () {
    Route::post('/organizations', [OrganizationController::class, 'store']);
    Route::delete('/organizations/{id}', [OrganizationController::class, 'destroy']);
    Route::post('/organizations/bulk-action', [OrganizationController::class, 'bulkAction']);
    Route::post('/organizations/import', [OrganizationController::class, 'import']);
    Route::put('/organizations/{id}/status', [OrganizationController::class, 'updateStatus']);
    Route::get('/organizations/deleted', [OrganizationController::class, 'deleted']);
    Route::post('/organizations/{id}/restore', [OrganizationController::class, 'restore']);
    Route::delete('/organizations/{id}/soft-delete', [OrganizationController::class, 'softDelete']);
    Route::post('/organizations/{id}/clear-cache', [OrganizationController::class, 'clearCache']);
    Route::post('/organizations/clear-all-caches', [OrganizationController::class, 'clearAllCaches']);
    Route::post('/organizations/login-as-admin', [OrganizationController::class, 'loginAsAdmin']);
    Route::post('/organizations/force-password-reset', [OrganizationController::class, 'forcePasswordReset']);
});

// Export routes (role-based access)
Route::middleware(['unified.auth', 'organization.role:any'])->group(function () {
    Route::get('/organizations/export', [OrganizationController::class, 'export']);
});

// Analytics routes (role-based access)
Route::middleware(['unified.auth', 'organization.role:any'])->group(function () {
    Route::get('/organizations/analytics', [OrganizationController::class, 'getAllOrganizationsAnalytics']);
});
*/
