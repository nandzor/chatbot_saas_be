<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * WAHA Organization Middleware
 *
 * Ensures that WAHA operations are scoped to the authenticated user's organization
 * Provides additional security layer for WAHA endpoints
 */
class WahaOrganizationMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required',
                'error_code' => 'UNAUTHENTICATED'
            ], 401);
        }

        $user = Auth::user();

        // Check if user belongs to an organization
        if (!$user->organization_id) {
            return response()->json([
                'success' => false,
                'message' => 'User must belong to an organization to access WAHA features',
                'error_code' => 'NO_ORGANIZATION'
            ], 403);
        }

        // Add organization context to request
        $request->merge(['organization_id' => $user->organization_id]);
        $request->attributes->set('organization_id', $user->organization_id);

        return $next($request);
    }
}
