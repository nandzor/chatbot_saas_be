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
        health: '/up',
        then: function () {
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/auth.php'));

            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/admin.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Register middleware aliases
        $middleware->alias([
            'jwt.auth' => \App\Http\Middleware\JwtAuthMiddleware::class,
            'unified.auth' => \App\Http\Middleware\UnifiedAuthMiddleware::class,
            'api.response' => \App\Http\Middleware\ApiResponseMiddleware::class,
            'can' => \App\Http\Middleware\AdminPermissionMiddleware::class,
            'admin.only' => \App\Http\Middleware\AdminOnly::class,
            'permission' => \App\Http\Middleware\PermissionMiddleware::class,
            'throttle.auth' => \Illuminate\Routing\Middleware\ThrottleRequests::class.':5,1',
            'throttle.refresh' => \Illuminate\Routing\Middleware\ThrottleRequests::class.':10,1',
            'throttle.validation' => \Illuminate\Routing\Middleware\ThrottleRequests::class.':20,1',
        ]);

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
