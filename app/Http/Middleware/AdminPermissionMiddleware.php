<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use App\Traits\Api\ApiResponseTrait;

class AdminPermissionMiddleware
{
    use ApiResponseTrait;

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission = null): Response
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            return $this->unauthorizedResponse('User not authenticated');
        }

        $user = Auth::user();

        // Check if user is super admin
        if ($user->role === 'super_admin') {
            return $next($request);
        }

        // Check specific permission if provided
        if ($permission) {
            // Try to check permission if method exists
            $hasPermission = false;
            try {
                $reflection = new \ReflectionClass($user);
                if ($reflection->hasMethod('hasPermission')) {
                    $hasPermission = call_user_func([$user, 'hasPermission'], $permission);
                }
            } catch (\Exception $e) {
                // If method doesn't exist or fails, assume no permission
                $hasPermission = false;
            }

            if (!$hasPermission) {
                return $this->forbiddenResponse('Insufficient permissions');
            }
        }

        return $next($request);
    }
}
