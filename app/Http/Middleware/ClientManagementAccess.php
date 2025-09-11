<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ClientManagementAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Check if user is authenticated
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
                'data' => null
            ], 401);
        }

        // Check if user has super admin role
        if (!$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Super admin privileges required.',
                'data' => null
            ], 403);
        }

        // Log access attempt
        \Log::info('ClientManagement access granted', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'route' => $request->route()?->getName(),
            'method' => $request->method(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return $next($request);
    }
}
