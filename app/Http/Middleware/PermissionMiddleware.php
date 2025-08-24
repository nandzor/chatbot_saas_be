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
     */
    public function handle(Request $request, Closure $next, string $resource, string $action, string $scope = 'organization'): Response
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

        // Check if user has the required permission
        try {
            $hasPermission = $this->permissionService->userHasPermission(
                $user->id,
                $organizationId,
                $resource,
                $action,
                $scope
            );

            if (!$hasPermission) {
                return $this->forbiddenResponse($resource, $action, $scope);
            }

            // Add permission context to request for logging/auditing
            $request->merge([
                'permission_context' => [
                    'resource' => $resource,
                    'action' => $action,
                    'scope' => $scope,
                    'user_id' => $user->id,
                    'organization_id' => $organizationId,
                ]
            ]);

            return $next($request);
        } catch (\Exception $e) {
            // Log the error but don't expose internal details
            Log::error('Permission check failed', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'organization_id' => $organizationId,
                'resource' => $resource,
                'action' => $action,
                'scope' => $scope,
            ]);

            return $this->forbiddenResponse($resource, $action, $scope);
        }
    }

    /**
     * Check if user is super admin.
     */
    protected function isSuperAdmin($user): bool
    {
        // Check if user has super admin role
        return $user->role === 'super_admin' ||
               $user->hasRole('super_admin') ||
               $user->is_super_admin === true;
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
        ], 401);
    }

    /**
     * Return forbidden response.
     */
    protected function forbiddenResponse(string $resource, string $action, string $scope): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Access denied',
            'error_code' => 'PERMISSION_DENIED',
            'details' => [
                'resource' => $resource,
                'action' => $action,
                'scope' => $scope,
                'required_permission' => "{$resource}.{$action}",
            ],
            'status_code' => 403,
        ], 403);
    }
}
