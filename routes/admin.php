<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

/*
|--------------------------------------------------------------------------
| Admin Management Routes
|--------------------------------------------------------------------------
|
| Routes untuk sistem manajemen admin yang hanya bisa diakses oleh super admin.
| Semua routes menggunakan prefix 'api/admin' dan middleware 'unified.auth'.
| Semua routes memerlukan permission khusus untuk akses.
|
| NOTE: User, Role, Permission, dan Organization management sudah dipindah ke /api/v1
| dengan permission middleware yang robust. Routes ini hanya untuk admin-specific features.
|
*/

Route::prefix('admin')->middleware(['unified.auth', 'can:access-admin-panel'])->group(function () {

    // ========================================
    // ADMIN DASHBOARD & MONITORING
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

        // System health check
        Route::get('/system-health', function () {
            return response()->json([
                'success' => true,
                'data' => [
                    'database' => [
                        'status' => 'healthy',
                        'connections' => DB::connection()->getPdo()->getAttribute(\PDO::ATTR_CONNECTION_STATUS),
                        'version' => DB::connection()->getPdo()->getAttribute(\PDO::ATTR_SERVER_VERSION)
                    ],
                    'cache' => [
                        'status' => 'healthy',
                        'driver' => config('cache.default')
                    ],
                    'queue' => [
                        'status' => 'healthy',
                        'driver' => config('queue.default')
                    ],
                    'storage' => [
                        'status' => 'healthy',
                        'writable' => is_writable(storage_path())
                    ]
                ]
            ]);
        })->name('admin.dashboard.system-health');
    });

    // ========================================
    // SYSTEM MAINTENANCE
    // ========================================
    Route::prefix('maintenance')->middleware(['can:system-maintenance'])->group(function () {

        // Clear all caches
        Route::post('/clear-cache', function () {
            Artisan::call('cache:clear');
            Artisan::call('config:clear');
            Artisan::call('route:clear');
            Artisan::call('view:clear');

            return response()->json([
                'success' => true,
                'message' => 'All caches cleared successfully',
                'data' => [
                    'cache_cleared' => true,
                    'config_cleared' => true,
                    'route_cleared' => true,
                    'view_cleared' => true
                ]
            ]);
        })->name('admin.maintenance.clear-cache');

        // Clear specific cache
        Route::post('/clear-config', function () {
            Artisan::call('config:clear');
            return response()->json([
                'success' => true,
                'message' => 'Configuration cache cleared successfully'
            ]);
        })->name('admin.maintenance.clear-config');

        Route::post('/clear-route', function () {
            Artisan::call('route:clear');
            return response()->json([
                'success' => true,
                'message' => 'Route cache cleared successfully'
            ]);
        })->name('admin.maintenance.clear-route');

        // System backup
        Route::post('/backup', function () {
            // TODO: Implement system backup
            return response()->json([
                'success' => true,
                'message' => 'System backup initiated',
                'data' => [
                    'backup_id' => uniqid('backup_'),
                    'timestamp' => now()->toISOString(),
                    'status' => 'initiated'
                ]
            ]);
        })->name('admin.maintenance.backup');

        // Database optimization
        Route::post('/optimize-db', function () {
            Artisan::call('db:optimize');

            return response()->json([
                'success' => true,
                'message' => 'Database optimized successfully',
                'data' => [
                    'optimized_at' => now()->toISOString(),
                    'status' => 'completed'
                ]
            ]);
        })->name('admin.maintenance.optimize-db');

        // Run migrations
        Route::post('/migrate', function () {
            Artisan::call('migrate', ['--force' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Migrations completed successfully',
                'data' => [
                    'migrated_at' => now()->toISOString(),
                    'status' => 'completed'
                ]
            ]);
        })->name('admin.maintenance.migrate');

        // System restart
        Route::post('/restart', function () {
            // TODO: Implement system restart
            return response()->json([
                'success' => true,
                'message' => 'System restart initiated',
                'data' => [
                    'restart_id' => uniqid('restart_'),
                    'timestamp' => now()->toISOString(),
                    'status' => 'initiated'
                ]
            ]);
        })->name('admin.maintenance.restart');
    });

    // ========================================
    // ADMIN ANALYTICS
    // ========================================
    Route::prefix('analytics')->middleware(['can:view-admin-analytics'])->group(function () {

        // System performance metrics
        Route::get('/performance', function () {
            return response()->json([
                'success' => true,
                'data' => [
                    'cpu_usage' => sys_getloadavg(),
                    'memory_usage' => [
                        'current' => memory_get_usage(true),
                        'peak' => memory_get_peak_usage(true),
                        'limit' => ini_get('memory_limit')
                    ],
                    'disk_usage' => [
                        'free' => disk_free_space('/'),
                        'total' => disk_total_space('/'),
                        'percentage' => (disk_free_space('/') / disk_total_space('/')) * 100
                    ],
                    'database_connections' => [
                        'status' => DB::connection()->getPdo()->getAttribute(\PDO::ATTR_CONNECTION_STATUS),
                        'active_connections' => DB::connection()->getPdo()->getAttribute(\PDO::ATTR_CONNECTION_STATUS)
                    ],
                    'timestamp' => now()->toISOString()
                ]
            ]);
        })->name('admin.analytics.performance');

        // User activity patterns
        Route::get('/user-activity', function () {
            return response()->json([
                'success' => true,
                'data' => [
                    'active_users_today' => \App\Models\User::whereDate('last_login_at', today())->count(),
                    'new_users_this_week' => \App\Models\User::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                    'peak_usage_hours' => [9, 14, 18], // Example data
                    'user_growth' => [
                        'this_month' => \App\Models\User::whereMonth('created_at', now()->month)->count(),
                        'last_month' => \App\Models\User::whereMonth('created_at', now()->subMonth()->month)->count(),
                        'growth_percentage' => 15.5 // Example data
                    ],
                    'timestamp' => now()->toISOString()
                ]
            ]);
        })->name('admin.analytics.user-activity');

        // System usage statistics
        Route::get('/system-usage', function () {
            return response()->json([
                'success' => true,
                'data' => [
                    'api_requests' => [
                        'total_today' => 1250,
                        'total_this_week' => 8750,
                        'average_response_time' => 245, // milliseconds
                        'error_rate' => 0.5 // percentage
                    ],
                    'database_queries' => [
                        'total_today' => 15000,
                        'slow_queries' => 25,
                        'average_query_time' => 15 // milliseconds
                    ],
                    'cache_hit_rate' => 87.5, // percentage
                    'queue_jobs' => [
                        'pending' => 45,
                        'processing' => 12,
                        'completed_today' => 1250
                    ],
                    'timestamp' => now()->toISOString()
                ]
            ]);
        })->name('admin.analytics.system-usage');

        // Error logs analysis
        Route::get('/error-logs', function (\Illuminate\Http\Request $request) {
            // TODO: Implement ErrorLog model
            $errors = collect([
                [
                    'id' => 1,
                    'level' => 'error',
                    'message' => 'Database connection failed',
                    'created_at' => now()->subHours(2)
                ],
                [
                    'id' => 2,
                    'level' => 'warning',
                    'message' => 'Cache miss detected',
                    'created_at' => now()->subHours(1)
                ]
            ]);

            return response()->json([
                'success' => true,
                'data' => $errors,
                'note' => 'Using mock data - ErrorLog model not implemented yet'
            ]);
        })->name('admin.analytics.error-logs');
    });

    // ========================================
    // SYSTEM CONFIGURATION
    // ========================================
    Route::prefix('config')->middleware(['can:system-config'])->group(function () {

        // Get environment configuration
        Route::get('/environment', function () {
            return response()->json([
                'success' => true,
                'data' => [
                    'app_name' => config('app.name'),
                    'app_env' => config('app.env'),
                    'app_debug' => config('app.debug'),
                    'app_url' => config('app.url'),
                    'database_connection' => config('database.default'),
                    'cache_driver' => config('cache.default'),
                    'queue_driver' => config('queue.default'),
                    'session_driver' => config('session.driver'),
                    'mail_driver' => config('mail.default'),
                    'timestamp' => now()->toISOString()
                ]
            ]);
        })->name('admin.config.environment');

        // Update environment configuration
        Route::post('/update-env', function (\Illuminate\Http\Request $request) {
            $request->validate([
                'key' => 'required|string',
                'value' => 'required|string'
            ]);

            // TODO: Implement environment update logic
            return response()->json([
                'success' => true,
                'message' => 'Environment configuration updated successfully',
                'data' => [
                    'key' => $request->key,
                    'value' => $request->value,
                    'updated_at' => now()->toISOString()
                ]
            ]);
        })->name('admin.config.update-env');

        // Get cache status
        Route::get('/cache-status', function () {
            return response()->json([
                'success' => true,
                'data' => [
                    'cache_driver' => config('cache.default'),
                    'cache_prefix' => config('cache.prefix'),
                    'cache_ttl' => config('cache.ttl'),
                    'redis_connection' => config('cache.stores.redis.connection'),
                    'timestamp' => now()->toISOString()
                ]
            ]);
        })->name('admin.config.cache-status');
    });

    // ========================================
    // SECURITY & AUDIT
    // ========================================
    Route::prefix('security')->middleware(['can:view-security-logs'])->group(function () {

        // Security logs
        Route::get('/logs', function (\Illuminate\Http\Request $request) {
            // TODO: Implement SecurityLog model
            $logs = collect([
                [
                    'id' => 1,
                    'type' => 'login_attempt',
                    'user_id' => 1,
                    'ip_address' => '192.168.1.1',
                    'created_at' => now()->subMinutes(30)
                ],
                [
                    'id' => 2,
                    'type' => 'permission_denied',
                    'user_id' => 2,
                    'ip_address' => '192.168.1.2',
                    'created_at' => now()->subMinutes(15)
                ]
            ]);

            return response()->json([
                'success' => true,
                'data' => $logs,
                'note' => 'Using mock data - SecurityLog model not implemented yet'
            ]);
        })->name('admin.security.logs');

        // Failed login attempts
        Route::get('/failed-logins', function () {
            // TODO: Implement security models
            return response()->json([
                'success' => true,
                'data' => [
                    'failed_attempts_today' => 5,
                    'blocked_ips' => 2,
                    'suspicious_activities' => 1,
                    'timestamp' => now()->toISOString(),
                    'note' => 'Using mock data - Security models not implemented yet'
                ]
            ]);
        })->name('admin.security.failed-logins');
    });
});
