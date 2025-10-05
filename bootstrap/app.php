<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
        then: function () {
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/auth.php'));

            // routes/admin.php - REMOVED (migrated to /api/v1 with robust permission system)

            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/n8n.php'));

            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/waha.php'));

            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/conversation.php'));

            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/google-drive-integration.php'));

            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/google-drive.php'));
        },
    )
    ->withProviders([
        \App\Providers\EventServiceProvider::class,
        \App\Providers\BroadcastServiceProvider::class,
        \App\Providers\NotificationServiceProvider::class,
        \App\Providers\N8nServiceProvider::class,
        \Laravel\Horizon\HorizonServiceProvider::class,
    ])
    ->withMiddleware(function (Middleware $middleware): void {
        // Register middleware aliases
        $middleware->alias([
            'jwt.auth' => \App\Http\Middleware\JwtAuthMiddleware::class,
            'unified.auth' => \App\Http\Middleware\UnifiedAuthMiddleware::class,
            'api.response' => \App\Http\Middleware\ApiResponseMiddleware::class,
            'cors' => \App\Http\Middleware\CorsMiddleware::class,
            'permission' => \App\Http\Middleware\PermissionMiddleware::class,
            'organization' => \App\Http\Middleware\OrganizationAccessMiddleware::class,
            'organization.management' => \App\Http\Middleware\OrganizationManagementMiddleware::class,
            'super.admin' => \App\Http\Middleware\SuperAdminMiddleware::class,
            'waha.organization' => \App\Http\Middleware\WahaOrganizationMiddleware::class,
            'knowledge-base.org-access' => \App\Http\Middleware\KnowledgeBaseOrganizationAccessMiddleware::class,
            'throttle.auth' => \Illuminate\Routing\Middleware\ThrottleRequests::class.':1000,1',
            'throttle.refresh' => \Illuminate\Routing\Middleware\ThrottleRequests::class.':1000,1',
            'throttle.validation' => \Illuminate\Routing\Middleware\ThrottleRequests::class.':1000,1',
            'throttle.webhook' => \Illuminate\Routing\Middleware\ThrottleRequests::class.':100,1',
            'throttle.subscription' => \Illuminate\Routing\Middleware\ThrottleRequests::class.':30,1',
            'throttle.organization' => \App\Http\Middleware\OrganizationRegistrationThrottle::class,
            'security.headers' => \App\Http\Middleware\SecurityHeaders::class,
            'input.sanitization' => \App\Http\Middleware\InputSanitization::class,
            'webhook.signature' => \App\Http\Middleware\WebhookSignatureMiddleware::class,
        ]);

        // Add CORS middleware globally
        $middleware->append(\App\Http\Middleware\CorsMiddleware::class);

        // Register custom middleware for API guard
        $middleware->appendToGroup('api', [
            \App\Http\Middleware\ApiResponseMiddleware::class,
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            \Illuminate\Routing\Middleware\ThrottleRequests::class.':api',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Handle API exceptions with standardized responses
        $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
            if (\App\Exceptions\ApiExceptionHandler::isApiRequest($request)) {
                return \App\Exceptions\ApiExceptionHandler::handle($e, $request);
            }
        });
    })->create();
