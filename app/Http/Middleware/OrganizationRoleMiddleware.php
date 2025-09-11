<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Organization Role Middleware
 * 
 * Handles role-based access control for organization operations
 * Reduces code duplication by centralizing access control logic
 */
class OrganizationRoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $requiredRole = 'any'): Response
    {
        $user = auth()->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Silakan login terlebih dahulu',
                'error_code' => 'UNAUTHENTICATED'
            ], 401);
        }

        // Check if user has required role
        if (!$this->hasRequiredRole($user, $requiredRole)) {
            return response()->json([
                'success' => false,
                'message' => $this->getAccessDeniedMessage($requiredRole),
                'error_code' => 'ACCESS_DENIED'
            ], 403);
        }

        // Add user role info to request for controller use
        $request->merge([
            'user_role' => $this->getUserRole($user),
            'is_super_admin' => $user->hasRole('super_admin'),
            'is_organization_admin' => $user->hasRole('organization_admin'),
            'is_organization_member' => $user->hasRole('organization_member')
        ]);

        return $next($request);
    }

    /**
     * Check if user has required role
     */
    private function hasRequiredRole($user, string $requiredRole): bool
    {
        switch ($requiredRole) {
            case 'super_admin':
                return $user->hasRole('super_admin');
            
            case 'organization_admin':
                return $user->hasRole('super_admin') || $user->hasRole('organization_admin');
            
            case 'organization_member':
                return $user->hasRole('super_admin') || 
                       $user->hasRole('organization_admin') || 
                       $user->hasRole('organization_member');
            
            case 'any':
            default:
                return true;
        }
    }

    /**
     * Get access denied message based on required role
     */
    private function getAccessDeniedMessage(string $requiredRole): string
    {
        switch ($requiredRole) {
            case 'super_admin':
                return 'Akses ditolak. Hanya super admin yang dapat mengakses fitur ini';
            
            case 'organization_admin':
                return 'Akses ditolak. Hanya admin yang dapat mengakses fitur ini';
            
            case 'organization_member':
                return 'Akses ditolak. Hanya member organisasi yang dapat mengakses fitur ini';
            
            default:
                return 'Akses ditolak';
        }
    }

    /**
     * Get user's primary role
     */
    private function getUserRole($user): string
    {
        if ($user->hasRole('super_admin')) {
            return 'super_admin';
        }
        
        if ($user->hasRole('organization_admin')) {
            return 'organization_admin';
        }
        
        if ($user->hasRole('organization_member')) {
            return 'organization_member';
        }
        
        return 'unknown';
    }
}
