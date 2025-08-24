<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Services\PermissionManagementService;
use App\Exceptions\PermissionDeniedException;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class PermissionMiddleware
{
    /**
     * The permission management service.
     */
    protected PermissionManagementService $permissionService;

    /**
     * Create a new middleware instance.
     */
    public function __construct(PermissionManagementService $permissionService)
    {
        $this->permissionService = $permissionService;
    }

    /**
     * Handle an incoming request.
     * 
     * Usage examples:
     * - Route::middleware(['permission:users.view'])->group(...)
     * - Route::middleware(['permission:users.view,users.create'])->group(...)
     * - Route::middleware(['permission:users.*'])->group(...)
     * - Route::middleware(['permission:users.view|users.create'])->group(...)
     */
    public function handle(Request $request, Closure $next, ...$permissions): Response
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            return $this->unauthorizedResponse('Authentication required');
        }

        $user = Auth::user();
        $organizationId = $user->organization_id;

        // Super admin bypass
        if ($this->isSuperAdmin($user)) {
            return $next($request);
        }

        // Parse permissions (support multiple formats)
        $parsedPermissions = $this->parsePermissions($permissions);
        
        // Check if user has required permissions
        try {
            $hasPermission = $this->checkUserPermissions($user, $organizationId, $parsedPermissions);

            if (!$hasPermission) {
                return $this->forbiddenResponse($parsedPermissions);
            }

            // Add permission context to request for logging/auditing
            $request->merge([
                'permission_context' => [
                    'permissions' => $parsedPermissions,
                    'user_id' => $user->id,
                    'organization_id' => $organizationId,
                    'check_type' => $parsedPermissions['type'],
                    'timestamp' => now()->toISOString(),
                ]
            ]);

            return $next($request);
        } catch (\Exception $e) {
            // Log the error but don't expose internal details
            Log::error('Permission check failed', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'organization_id' => $organizationId,
                'permissions' => $parsedPermissions,
                'request_path' => $request->path(),
                'request_method' => $request->method(),
            ]);

            return $this->forbiddenResponse($parsedPermissions);
        }
    }

    /**
     * Parse permissions from middleware parameters.
     * 
     * Supports multiple formats:
     * - Single permission: 'users.view'
     * - Multiple permissions (AND): 'users.view,users.create'
     * - Multiple permissions (OR): 'users.view|users.create'
     * - Wildcard permissions: 'users.*'
     */
    protected function parsePermissions(array $permissions): array
    {
        if (empty($permissions)) {
            return [
                'type' => 'none',
                'permissions' => [],
                'check_type' => 'none'
            ];
        }

        $permissionString = $permissions[0];
        
        // Check for OR operator (|)
        if (str_contains($permissionString, '|')) {
            $permissionList = explode('|', $permissionString);
            return [
                'type' => 'or',
                'permissions' => array_map('trim', $permissionList),
                'check_type' => 'any'
            ];
        }
        
        // Check for AND operator (,)
        if (str_contains($permissionString, ',')) {
            $permissionList = explode(',', $permissionString);
            return [
                'type' => 'and',
                'permissions' => array_map('trim', $permissionList),
                'check_type' => 'all'
            ];
        }
        
        // Check for wildcard (*)
        if (str_contains($permissionString, '.*')) {
            $baseResource = str_replace('.*', '', $permissionString);
            return [
                'type' => 'wildcard',
                'permissions' => [$permissionString],
                'base_resource' => $baseResource,
                'check_type' => 'wildcard'
            ];
        }
        
        // Single permission
        return [
            'type' => 'single',
            'permissions' => [$permissionString],
            'check_type' => 'single'
        ];
    }

    /**
     * Check if user has required permissions.
     */
    protected function checkUserPermissions($user, $organizationId, array $parsedPermissions): bool
    {
        switch ($parsedPermissions['check_type']) {
            case 'none':
                return true;
                
            case 'single':
                return $this->checkSinglePermission($user, $organizationId, $parsedPermissions['permissions'][0]);
                
            case 'all':
                return $this->checkAllPermissions($user, $organizationId, $parsedPermissions['permissions']);
                
            case 'any':
                return $this->checkAnyPermission($user, $organizationId, $parsedPermissions['permissions']);
                
            case 'wildcard':
                return $this->checkWildcardPermission($user, $organizationId, $parsedPermissions['base_resource']);
                
            default:
                return false;
        }
    }

    /**
     * Check single permission.
     */
    protected function checkSinglePermission($user, $organizationId, string $permission): bool
    {
        // Parse permission format: resource.action
        $parts = explode('.', $permission);
        if (count($parts) !== 2) {
            return false;
        }

        [$resource, $action] = $parts;
        
        return $this->permissionService->userHasPermission(
            $user->id,
            $organizationId,
            $resource,
            $action,
            'organization'
        );
    }

    /**
     * Check all permissions (AND logic).
     */
    protected function checkAllPermissions($user, $organizationId, array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if (!$this->checkSinglePermission($user, $organizationId, $permission)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check any permission (OR logic).
     */
    protected function checkAnyPermission($user, $organizationId, array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($this->checkSinglePermission($user, $organizationId, $permission)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check wildcard permission (resource.*).
     */
    protected function checkWildcardPermission($user, $organizationId, string $baseResource): bool
    {
        // Check if user has any permission for the resource
        $userPermissions = $this->permissionService->getUserPermissions($user->id, $organizationId);
        
        foreach ($userPermissions as $permission) {
            if (str_starts_with($permission->name, $baseResource . '.')) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Check if user is super admin.
     */
    protected function isSuperAdmin($user): bool
    {
        // Check if user has super admin role
        return $user->role === 'super_admin' ||
               $user->hasRole('super_admin') ||
               $user->is_super_admin === true ||
               $user->permissions && in_array('*', $user->permissions);
    }

    /**
     * Return unauthorized response.
     */
    protected function unauthorizedResponse(string $message): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'error_code' => 'UNAUTHORIZED',
            'status_code' => 401,
            'timestamp' => now()->toISOString(),
        ], 401);
    }

    /**
     * Return forbidden response.
     */
    protected function forbiddenResponse(array $parsedPermissions): JsonResponse
    {
        $details = [
            'permissions' => $parsedPermissions['permissions'],
            'check_type' => $parsedPermissions['check_type'],
            'required_permissions' => $parsedPermissions['permissions'],
        ];

        if (isset($parsedPermissions['base_resource'])) {
            $details['base_resource'] = $parsedPermissions['base_resource'];
        }

        return response()->json([
            'success' => false,
            'message' => 'Access denied',
            'error_code' => 'PERMISSION_DENIED',
            'details' => $details,
            'status_code' => 403,
            'timestamp' => now()->toISOString(),
        ], 403);
    }
}
