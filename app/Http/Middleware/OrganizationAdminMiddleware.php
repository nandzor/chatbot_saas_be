<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Organization Admin Middleware
 *
 * Ensures organization admin can only manage their own organization
 * Provides additional security layer for admin operations
 */
class OrganizationAdminMiddleware
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

        // Check if user is organization admin
        if (!$user->hasRole('organization_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Hanya admin organisasi yang dapat mengakses fitur ini',
                'error_code' => 'INSUFFICIENT_PERMISSIONS'
            ], 403);
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

        // Check if user belongs to the organization they're trying to manage
        if ($userOrganizationId !== $organizationId) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Anda hanya dapat mengelola organisasi Anda sendiri',
                'error_code' => 'ORGANIZATION_MANAGEMENT_DENIED',
                'debug' => [
                    'user_organization_id' => $userOrganizationId,
                    'requested_organization_id' => $organizationId,
                    'user_role' => 'organization_admin'
                ]
            ], 403);
        }

        // Add organization context to request
        $request->merge([
            'organization_id' => $organizationId,
            'user_organization_id' => $user->organization_id,
            'is_organization_admin' => true
        ]);

        return $next($request);
    }
}
