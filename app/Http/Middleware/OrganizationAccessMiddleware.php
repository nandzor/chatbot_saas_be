<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;
use App\Traits\Api\ApiResponseTrait;

class OrganizationAccessMiddleware
{
    use ApiResponseTrait;
    /**
     * Handle an incoming request.
     *
     * Usage examples:
     * - Route::middleware(['organization'])->group(...)
     * - Route::middleware(['organization:strict'])->group(...)
     * - Route::middleware(['organization:flexible'])->group(...)
     */
    public function handle(Request $request, Closure $next, string $mode = 'strict'): Response
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            return $this->unauthorizedResponse('Authentication required');
        }

        $user = Auth::user();

        // Super admin bypass
        if ($this->isSuperAdmin($user)) {
            return $next($request);
        }

        // Get organization context from request
        $organizationContext = $this->getOrganizationContext($request, $user);

        // Validate organization access based on mode
        if (!$this->validateOrganizationAccess($user, $organizationContext, $mode)) {
            return $this->forbiddenResponse($organizationContext);
        }

        // Add organization context to request for logging/auditing
        $request->merge([
            'organization_context' => array_merge($organizationContext, [
                'user_id' => $user->id,
                'access_mode' => $mode,
                'timestamp' => now()->toISOString(),
            ])
        ]);

        return $next($request);
    }

    /**
     * Get organization context from request.
     */
    protected function getOrganizationContext(Request $request, $user): array
    {
        $context = [
            'user_organization_id' => $user->organization_id,
            'requested_organization_id' => null,
            'source' => 'none',
            'path' => $request->path(),
            'method' => $request->method(),
        ];

        // Try to get organization ID from different sources
        $organizationId = $this->extractOrganizationId($request, $user);

        if ($organizationId) {
            $context['requested_organization_id'] = $organizationId;
            $context['source'] = $this->getOrganizationIdSource($request);
        }

        return $context;
    }

    /**
     * Extract organization ID from request.
     */
    protected function extractOrganizationId(Request $request, $user): ?string
    {
        // 1. From route parameters
        $routeParams = $request->route()->parameters();
        if (isset($routeParams['organization_id'])) {
            return $routeParams['organization_id'];
        }
        if (isset($routeParams['organizationId'])) {
            return $routeParams['organizationId'];
        }

        // 2. From query parameters
        if ($request->has('organization_id')) {
            return $request->get('organization_id');
        }

        // 3. From request body
        if ($request->has('organization_id')) {
            return $request->input('organization_id');
        }

        // 4. From user's default organization
        if ($user->organization_id) {
            return $user->organization_id;
        }

        return null;
    }

    /**
     * Get the source of organization ID.
     */
    protected function getOrganizationIdSource(Request $request): string
    {
        if ($request->route()->hasParameter('organization_id')) {
            return 'route_parameter';
        }
        if ($request->has('organization_id')) {
            return 'query_parameter';
        }
        if ($request->input('organization_id')) {
            return 'request_body';
        }
        return 'user_default';
    }

    /**
     * Validate organization access based on mode.
     */
    protected function validateOrganizationAccess($user, array $context, string $mode): bool
    {
        $userOrgId = $context['user_organization_id'];
        $requestedOrgId = $context['requested_organization_id'];

        // If user has no organization, deny access
        if (!$userOrgId) {
            return false;
        }

        switch ($mode) {
            case 'strict':
                // User can only access their own organization
                return $requestedOrgId === $userOrgId;

            case 'flexible':
                // User can access their own organization or if no specific org requested
                return !$requestedOrgId || $requestedOrgId === $userOrgId;

            case 'none':
                // No organization restriction
                return true;

            default:
                // Default to strict mode
                return $requestedOrgId === $userOrgId;
        }
    }

    /**
     * Check if user is super admin.
     */
    protected function isSuperAdmin($user): bool
    {
        return $user->role === 'super_admin' ||
               $user->hasRole('super_admin') ||
               $user->is_super_admin === true ||
               ($user->permissions && in_array('*', $user->permissions));
    }

    /**
     * Return unauthorized response.
     */
    protected function unauthorizedResponse(string $message): JsonResponse
    {
        return $this->unauthorizedResponse($message);
    }

    /**
     * Return forbidden response.
     */
    protected function forbiddenResponse(array $context): JsonResponse
    {
        $details = [
            'user_organization_id' => $context['user_organization_id'],
            'requested_organization_id' => $context['requested_organization_id'],
            'access_source' => $context['source'],
            'request_path' => $context['path'],
            'request_method' => $context['method'],
        ];

        return $this->errorResponse('Organization access denied', $details, 403, 'ORGANIZATION_ACCESS_DENIED');
    }
}
