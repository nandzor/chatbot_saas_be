<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminOnly
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
                'errors' => ['error' => 'User not authenticated']
            ], 401);
        }

        // Check if user has admin role
        if (!in_array($user->role, ['super_admin', 'org_admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden',
                'errors' => ['error' => 'Insufficient permissions. Admin access required.']
            ], 403);
        }

        return $next($request);
    }
}
