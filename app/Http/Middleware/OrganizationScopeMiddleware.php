<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Organization Scope Middleware
 *
 * Handles organization-scoped access control
 * Ensures users can only access their own organization data
 */
class OrganizationScopeMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Silakan login terlebih dahulu',
                'error_code' => 'UNAUTHENTICATED'
            ], 401);
        }

        // Super admin can access any organization
        if ($user->hasRole('super_admin')) {
            return $next($request);
        }

        // Get organization ID from route parameter
        $organizationId = $request->route('id') ?? $request->route('organizationId');

        if (!$organizationId) {
            return response()->json([
                'success' => false,
                'message' => 'ID organisasi tidak ditemukan',
                'error_code' => 'MISSING_ORGANIZATION_ID'
            ], 400);
        }

        // Ensure organization ID is numeric for comparison
        $organizationId = (int) $organizationId;
        $userOrganizationId = (int) $user->organization_id;

        // Check if user belongs to the organization
        if ($userOrganizationId !== $organizationId) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Anda hanya dapat mengakses organisasi Anda sendiri',
                'error_code' => 'ORGANIZATION_ACCESS_DENIED',
                'debug' => [
                    'user_organization_id' => $userOrganizationId,
                    'requested_organization_id' => $organizationId
                ]
            ], 403);
        }

        // Add organization context to request
        $request->merge([
            'organization_id' => $organizationId,
            'user_organization_id' => $user->organization_id
        ]);

        return $next($request);
    }
}
