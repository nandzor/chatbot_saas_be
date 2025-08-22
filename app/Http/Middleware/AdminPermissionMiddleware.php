<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminPermissionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission = null): Response
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
                'error' => 'User not authenticated'
            ], 401);
        }

        $user = Auth::user();

        // Check if user is super admin
        if ($user->role === 'super_admin') {
            return $next($request);
        }

        // Check specific permission if provided
        if ($permission && !$user->hasPermission($permission)) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden',
                'error' => 'Insufficient permissions'
            ], 403);
        }

        return $next($request);
    }
}
