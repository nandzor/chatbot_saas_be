<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use App\Services\KnowledgeBaseService;

class KnowledgeBaseOrganizationAccessMiddleware
{
    protected KnowledgeBaseService $knowledgeBaseService;

    public function __construct(KnowledgeBaseService $knowledgeBaseService)
    {
        $this->knowledgeBaseService = $knowledgeBaseService;
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip validation for methods that don't require specific item access
        $routeName = $request->route()->getName();
        $skipValidationRoutes = [
            'knowledge-base.index',
            'knowledge-base.search',
            'knowledge-base.categories',
            'knowledge-base.store'
        ];

        if (in_array($routeName, $skipValidationRoutes)) {
            return $next($request);
        }

        // Validate organization access for specific item operations
        $this->validateOrganizationAccessForRoute($request);

        return $next($request);
    }

    /**
     * Validate organization access for the current route.
     */
    protected function validateOrganizationAccessForRoute(Request $request): void
    {
        $routeParams = $request->route()->parameters();

        // Get the knowledge base item ID or slug from route parameters
        $itemId = $routeParams['id'] ?? null;
        $slug = $routeParams['slug'] ?? null;

        $item = null;

        // Try to get item by ID first, then by slug
        if ($itemId) {
            $item = $this->knowledgeBaseService->getItemById($itemId);
        } elseif ($slug) {
            $item = $this->knowledgeBaseService->getItemBySlug($slug);
        }

        if (!$item) {
            abort(404, 'Knowledge base item not found');
        }

        // Validate organization access
        if (!$this->validateOrganizationAccess($item->organization_id)) {
            abort(403, 'Access denied: You can only access knowledge base items from your organization');
        }
    }

    /**
     * Validate organization access for knowledge base items.
     */
    protected function validateOrganizationAccess(?string $itemOrganizationId): bool
    {
        $user = Auth::user();

        if (!$user) {
            return false;
        }

        // Super admin can access all organizations
        if ($this->isSuperAdmin($user)) {
            return true;
        }

        // User must belong to an organization
        if (!$user->organization_id) {
            return false;
        }

        // User can only access items from their own organization
        return $user->organization_id === $itemOrganizationId;
    }

    /**
     * Check if user is super admin.
     */
    protected function isSuperAdmin($user): bool
    {
        return $user->role === 'super_admin' ||
               $user->is_super_admin === true ||
               ($user->permissions && in_array('*', $user->permissions));
    }
}
