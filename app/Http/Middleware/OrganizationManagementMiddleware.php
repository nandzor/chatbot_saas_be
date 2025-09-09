<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class OrganizationManagementMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get organization ID from route
        $organizationId = $request->route('organization');

        if (!$organizationId) {
            return response()->json([
                'success' => false,
                'message' => 'Organization ID is required',
                'error_code' => 'MISSING_ORGANIZATION_ID'
            ], 400);
        }

        // Validate organization exists and is accessible
        $organization = DB::table('organizations')
            ->where('id', $organizationId)
            ->where('status', '!=', 'deleted')
            ->first();

        if (!$organization) {
            return response()->json([
                'success' => false,
                'message' => 'Organization not found or inaccessible',
                'error_code' => 'ORGANIZATION_NOT_FOUND'
            ], 404);
        }

        // Check if user has access to this organization
        $user = $request->user();
        if ($user) {
            // Check if user belongs to this organization or is superadmin
            $userOrganization = DB::table('users')
                ->where('id', $user->id)
                ->where('organization_id', $organizationId)
                ->first();

            if (!$userOrganization && !$this->isSuperAdmin($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied to this organization',
                    'error_code' => 'ORGANIZATION_ACCESS_DENIED'
                ], 403);
            }
        }

        // Add organization data to request
        $request->merge(['organization_data' => $organization]);

        // Log organization access
        $this->logOrganizationAccess($request, $organization);

        return $next($request);
    }

    /**
     * Check if user is superadmin
     */
    private function isSuperAdmin($user): bool
    {
        // Check if user has superadmin role
        $superAdminRole = DB::table('user_roles')
            ->join('organization_roles', 'user_roles.role_id', '=', 'organization_roles.id')
            ->where('user_roles.user_id', $user->id)
            ->where('organization_roles.slug', 'superadmin')
            ->first();

        return $superAdminRole !== null;
    }

    /**
     * Log organization access
     */
    private function logOrganizationAccess(Request $request, $organization): void
    {
        $logData = [
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'organization_id' => $organization->id,
            'organization_name' => $organization->name,
            'user_id' => $request->user()?->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()->toISOString()
        ];

        Log::channel('organization')->info('Organization access', $logData);
    }
}
