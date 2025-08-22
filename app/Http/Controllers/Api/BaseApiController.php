<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Traits\Api\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class BaseApiController extends Controller
{
    use ApiResponseTrait;

    /**
     * Current API version.
     */
    protected string $apiVersion = '1.0';

    /**
     * Default pagination per page.
     */
    protected int $defaultPerPage = 15;

    /**
     * Maximum pagination per page.
     */
    protected int $maxPerPage = 100;

    /**
     * Constructor.
     */
    public function __construct()
    {
        // Set API version from config or header
        $this->apiVersion = config('app.api_version', '1.0');

        // Add request ID to all responses
        $this->addRequestIdToResponse();
    }

    /**
     * Get current authenticated user.
     */
    protected function getCurrentUser()
    {
        // Try JWT guard first, then default guard
        $user = Auth::guard('api')->user();
        if (!$user) {
            $user = Auth::user();
        }
        return $user;
    }

    /**
     * Get current user's organization.
     */
    protected function getCurrentOrganization()
    {
        return $this->getCurrentUser()?->organization;
    }

    /**
     * Check if current user has permission.
     */
    protected function userHasPermission(string $permission): bool
    {
        $user = $this->getCurrentUser();
        if (!$user || !method_exists($user, 'hasPermission')) {
            return false;
        }
        /** @var \App\Models\User $user */
        return $user->hasPermission($permission);
    }

    /**
     * Check if current user is super admin.
     */
    protected function isSuperAdmin(): bool
    {
        $user = $this->getCurrentUser();
        if (!$user || !method_exists($user, 'isSuperAdmin')) {
            return false;
        }
        /** @var \App\Models\User $user */
        return $user->isSuperAdmin();
    }

    /**
     * Get pagination parameters from request.
     */
    protected function getPaginationParams(Request $request): array
    {
        $perPage = (int) $request->get('per_page', $this->defaultPerPage);
        $perPage = min($perPage, $this->maxPerPage); // Cap at maximum
        $perPage = max($perPage, 1); // Minimum 1

        return [
            'page' => (int) $request->get('page', 1),
            'per_page' => $perPage,
        ];
    }

    /**
     * Get filtering parameters from request.
     */
    protected function getFilterParams(Request $request, array $allowedFilters = []): array
    {
        $filters = [];

        foreach ($allowedFilters as $filter) {
            if ($request->has($filter)) {
                $filters[$filter] = $request->get($filter);
            }
        }

        return $filters;
    }

    /**
     * Get sorting parameters from request.
     */
    protected function getSortParams(Request $request, array $allowedSorts = [], string $defaultSort = 'created_at'): array
    {
        $sortBy = $request->get('sort_by', $defaultSort);
        $sortDirection = $request->get('sort_direction', 'desc');

        // Validate sort field
        if (!empty($allowedSorts) && !in_array($sortBy, $allowedSorts)) {
            $sortBy = $defaultSort;
        }

        // Validate sort direction
        if (!in_array(strtolower($sortDirection), ['asc', 'desc'])) {
            $sortDirection = 'desc';
        }

        return [
            'sort_by' => $sortBy,
            'sort_direction' => strtolower($sortDirection),
        ];
    }

    /**
     * Log API action for audit purposes.
     */
    protected function logApiAction(string $action, array $context = []): void
    {
        if (!config('auth.log_api_access', false)) {
            return;
        }

        $user = $this->getCurrentUser();

        Log::info('API Action: ' . $action, array_merge([
            'user_id' => $user?->id,
            'organization_id' => $user?->organization_id,
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'endpoint' => request()->getPathInfo(),
            'method' => request()->method(),
            'timestamp' => now()->toISOString(),
        ], $context));
    }

    /**
     * Validate organization access.
     */
    protected function validateOrganizationAccess(?string $organizationId = null): bool
    {
        $user = $this->getCurrentUser();

        if (!$user) {
            return false;
        }

        // Super admin can access all organizations
        if (method_exists($user, 'isSuperAdmin')) {
            /** @var \App\Models\User $user */
            if ($user->isSuperAdmin()) {
                return true;
            }
        }

        // If no specific organization requested, check if user belongs to any organization
        if (!$organizationId) {
            return $user->organization_id !== null;
        }

        // Check if user belongs to the requested organization
        return $user->organization_id === $organizationId;
    }

    /**
     * Get search parameters from request.
     */
    protected function getSearchParams(Request $request): array
    {
        return [
            'search' => $request->get('search'),
            'search_fields' => $request->get('search_fields', []),
        ];
    }

    /**
     * Build query with common parameters.
     */
    protected function buildQueryWithParams($query, Request $request, array $options = [])
    {
        // Apply search if provided
        $search = $request->get('search');
        if ($search && isset($options['searchable_fields'])) {
            $query->where(function ($q) use ($search, $options) {
                foreach ($options['searchable_fields'] as $field) {
                    $q->orWhere($field, 'ILIKE', "%{$search}%");
                }
            });
        }

        // Apply filters
        $filters = $this->getFilterParams($request, $options['filterable_fields'] ?? []);
        foreach ($filters as $field => $value) {
            if ($value !== null && $value !== '') {
                $query->where($field, $value);
            }
        }

        // Apply sorting
        $sort = $this->getSortParams(
            $request,
            $options['sortable_fields'] ?? [],
            $options['default_sort'] ?? 'created_at'
        );
        $query->orderBy($sort['sort_by'], $sort['sort_direction']);

        return $query;
    }

    /**
     * Handle resource not found.
     */
    protected function handleResourceNotFound(string $resource, ?string $identifier = null): JsonResponse
    {
        $this->logApiAction('resource_not_found', [
            'resource' => $resource,
            'identifier' => $identifier,
        ]);

        return $this->notFoundResponse($resource, $identifier);
    }

    /**
     * Handle unauthorized access.
     */
    protected function handleUnauthorizedAccess(string $action = 'access resource'): JsonResponse
    {
        $this->logApiAction('unauthorized_access_attempt', [
            'action' => $action,
        ]);

        return $this->unauthorizedResponse("You are not authorized to {$action}");
    }

    /**
     * Handle forbidden access.
     */
    protected function handleForbiddenAccess(string $action = 'perform this action'): JsonResponse
    {
        $this->logApiAction('forbidden_access_attempt', [
            'action' => $action,
        ]);

        return $this->forbiddenResponse("You do not have permission to {$action}");
    }

    /**
     * Add request ID to response headers.
     */
    private function addRequestIdToResponse(): void
    {
        if (!request()->header('X-Request-ID')) {
            request()->headers->set('X-Request-ID', $this->generateRequestId());
        }
    }

    /**
     * Transform data using resource if provided.
     */
    protected function transformData($data, ?string $resourceClass = null)
    {
        if ($resourceClass && class_exists($resourceClass)) {
            if (is_iterable($data)) {
                return $resourceClass::collection($data);
            } else {
                return new $resourceClass($data);
            }
        }

        return $data;
    }

    /**
     * Get allowed includes from request.
     */
    protected function getAllowedIncludes(Request $request, array $allowedIncludes = []): array
    {
        $includes = $request->get('include', '');

        if (empty($includes)) {
            return [];
        }

        $requestedIncludes = explode(',', $includes);

        return array_intersect($requestedIncludes, $allowedIncludes);
    }

    /**
     * Success response dengan logging.
     */
    protected function successResponseWithLog(
        string $action,
        string $message = 'Operation successful',
        mixed $data = null,
        int $statusCode = 200,
        array $context = []
    ): JsonResponse {
        $this->logApiAction($action, $context);

        return $this->successResponse($message, $data, $statusCode);
    }

    /**
     * Error response dengan logging.
     */
    protected function errorResponseWithLog(
        string $action,
        string $message = 'Operation failed',
        mixed $errors = null,
        int $statusCode = 400,
        ?string $errorCode = null,
        array $context = []
    ): JsonResponse {
        $this->logApiAction($action . '_failed', array_merge($context, [
            'error_message' => $message,
            'status_code' => $statusCode,
        ]));

        return $this->errorResponse($message, $errors, $statusCode, $errorCode);
    }
}
