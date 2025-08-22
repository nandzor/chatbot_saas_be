<?php

use App\Http\Controllers\Api\Admin\UserManagementController;
use App\Http\Controllers\Api\Admin\RoleManagementController;
use App\Http\Controllers\Api\Admin\PermissionManagementController;
use App\Http\Controllers\Api\Admin\OrganizationManagementController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Management Routes
|--------------------------------------------------------------------------
|
| Routes untuk sistem manajemen admin yang hanya bisa diakses oleh super admin.
| Semua routes menggunakan prefix 'api/admin' dan middleware 'unified.auth'.
| Semua routes memerlukan permission khusus untuk akses.
|
*/

Route::prefix('admin')->middleware(['unified.auth', 'can:access-admin-panel'])->group(function () {

    // ========================================
    // USER MANAGEMENT
    // ========================================
    Route::prefix('users')->middleware(['can:manage-users'])->group(function () {

        // List users with filters and search
        Route::get('/', [UserManagementController::class, 'index'])
             ->name('admin.users.index')
             ->middleware(['can:users.read']);

        // Get user statistics
        Route::get('/statistics', [UserManagementController::class, 'statistics'])
             ->name('admin.users.statistics')
             ->middleware(['can:users.read']);

        // Export users data
        Route::get('/export', [UserManagementController::class, 'export'])
             ->name('admin.users.export')
             ->middleware(['can:users.export']);

        // Bulk actions
        Route::post('/bulk-action', [UserManagementController::class, 'bulkAction'])
             ->name('admin.users.bulk-action')
             ->middleware(['can:users.bulk_action']);

        // Individual user operations
        Route::get('/{user}', [UserManagementController::class, 'show'])
             ->name('admin.users.show')
             ->middleware(['can:users.read']);

        Route::post('/', [UserManagementController::class, 'store'])
             ->name('admin.users.store')
             ->middleware(['can:users.create']);

        Route::put('/{user}', [UserManagementController::class, 'update'])
             ->name('admin.users.update')
             ->middleware(['can:users.update']);

        Route::delete('/{user}', [UserManagementController::class, 'destroy'])
             ->name('admin.users.destroy')
             ->middleware(['can:users.delete']);

        // Restore and force delete
        Route::post('/{user}/restore', [UserManagementController::class, 'restore'])
             ->name('admin.users.restore')
             ->middleware(['can:users.restore']);

        Route::delete('/{user}/force', [UserManagementController::class, 'forceDelete'])
             ->name('admin.users.force-delete')
             ->middleware(['can:users.force_delete']);
    });

    // ========================================
    // ROLE MANAGEMENT
    // ========================================
    Route::prefix('roles')->middleware(['can:manage-roles'])->group(function () {

        // List roles with filters and search
        Route::get('/', [RoleManagementController::class, 'index'])
             ->name('admin.roles.index')
             ->middleware(['can:roles.read']);

        // Get role statistics
        Route::get('/statistics', [RoleManagementController::class, 'statistics'])
             ->name('admin.roles.statistics')
             ->middleware(['can:roles.read']);

        // Clone role
        Route::post('/{role}/clone', [RoleManagementController::class, 'clone'])
             ->name('admin.roles.clone')
             ->middleware(['can:roles.create']);

        // Individual role operations
        Route::get('/{role}', [RoleManagementController::class, 'show'])
             ->name('admin.roles.show')
             ->middleware(['can:roles.read']);

        Route::post('/', [RoleManagementController::class, 'store'])
             ->name('admin.roles.store')
             ->middleware(['can:roles.create']);

        Route::put('/{role}', [RoleManagementController::class, 'update'])
             ->name('admin.roles.update')
             ->middleware(['can:roles.update']);

        Route::delete('/{role}', [RoleManagementController::class, 'destroy'])
             ->name('admin.roles.destroy')
             ->middleware(['can:roles.delete']);

        // Permission management for roles
        Route::post('/{role}/permissions', [RoleManagementController::class, 'assignPermissions'])
             ->name('admin.roles.assign-permissions')
             ->middleware(['can:roles.assign_permissions']);

        Route::delete('/{role}/permissions', [RoleManagementController::class, 'removePermissions'])
             ->name('admin.roles.remove-permissions')
             ->middleware(['can:roles.remove_permissions']);
    });

    // ========================================
    // PERMISSION MANAGEMENT
    // ========================================
    Route::prefix('permissions')->middleware(['can:manage-permissions'])->group(function () {

        // List permissions with filters and search
        Route::get('/', [PermissionManagementController::class, 'index'])
             ->name('admin.permissions.index')
             ->middleware(['can:permissions.read']);

        // Get permission statistics
        Route::get('/statistics', [PermissionManagementController::class, 'statistics'])
             ->name('admin.permissions.statistics')
             ->middleware(['can:permissions.read']);

        // Individual permission operations
        Route::get('/{permission}', [PermissionManagementController::class, 'show'])
             ->name('admin.permissions.show')
             ->middleware(['can:permissions.read']);

        Route::post('/', [PermissionManagementController::class, 'store'])
             ->name('admin.permissions.store')
             ->middleware(['can:permissions.create']);

        Route::put('/{permission}', [PermissionManagementController::class, 'update'])
             ->name('admin.permissions.update')
             ->middleware(['can:permissions.update']);

        Route::delete('/{permission}', [PermissionManagementController::class, 'destroy'])
             ->name('admin.permissions.destroy')
             ->middleware(['can:permissions.delete']);
    });

    // ========================================
    // ORGANIZATION MANAGEMENT
    // ========================================
    Route::prefix('organizations')->middleware(['can:manage-organizations'])->group(function () {

        // List organizations with filters and search
        Route::get('/', [OrganizationManagementController::class, 'index'])
             ->name('admin.organizations.index')
             ->middleware(['can:organizations.read']);

        // Get organization statistics
        Route::get('/statistics', [OrganizationManagementController::class, 'statistics'])
             ->name('admin.organizations.statistics')
             ->middleware(['can:organizations.read']);

        // Individual organization operations
        Route::get('/{organization}', [OrganizationManagementController::class, 'show'])
             ->name('admin.organizations.show')
             ->middleware(['can:organizations.read']);

        Route::post('/', [OrganizationManagementController::class, 'store'])
             ->name('admin.organizations.store')
             ->middleware(['can:organizations.create']);

        Route::put('/{organization}', [OrganizationManagementController::class, 'update'])
             ->name('admin.organizations.update')
             ->middleware(['can:organizations.update']);

        Route::delete('/{organization}', [OrganizationManagementController::class, 'destroy'])
             ->name('admin.organizations.destroy')
             ->middleware(['can:organizations.delete']);

        // Organization users management
        Route::get('/{organization}/users', [OrganizationManagementController::class, 'users'])
             ->name('admin.organizations.users')
             ->middleware(['can:organizations.read_users']);

        Route::post('/{organization}/users', [OrganizationManagementController::class, 'addUser'])
             ->name('admin.organizations.add-user')
             ->middleware(['can:organizations.add_user']);

        Route::delete('/{organization}/users/{user}', [OrganizationManagementController::class, 'removeUser'])
             ->name('admin.organizations.remove-user')
             ->middleware(['can:organizations.remove_user']);
    });

    // ========================================
    // SYSTEM OVERVIEW & DASHBOARD
    // ========================================
    Route::prefix('dashboard')->middleware(['can:access-admin-dashboard'])->group(function () {

        // System overview
        Route::get('/overview', function () {
            return response()->json([
                'success' => true,
                'data' => [
                    'total_users' => \App\Models\User::count(),
                    'total_organizations' => \App\Models\Organization::count(),
                    'total_roles' => \App\Models\Role::count(),
                    'total_permissions' => \App\Models\Permission::count(),
                    'active_sessions' => \App\Models\UserSession::where('is_active', true)->count(),
                    'system_health' => [
                        'database' => 'healthy',
                        'cache' => 'healthy',
                        'queue' => 'healthy',
                    ],
                    'recent_activities' => \App\Models\AuditLog::latest()->take(10)->get(),
                ]
            ]);
        })->name('admin.dashboard.overview');

        // System logs
        Route::get('/logs', function (\Illuminate\Http\Request $request) {
            $logs = \App\Models\SystemLog::with('organization')
                ->when($request->level, fn($q, $level) => $q->where('level', $level))
                ->when($request->organization_id, fn($q, $orgId) => $q->where('organization_id', $orgId))
                ->latest()
                ->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $logs
            ]);
        })->name('admin.dashboard.logs')
        ->middleware(['can:view-system-logs']);
    });
});
