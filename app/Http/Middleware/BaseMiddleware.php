<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

abstract class BaseMiddleware
{
    /**
     * Handle an incoming request.
     */
    abstract public function handle(Request $request, Closure $next, ...$parameters): Response|JsonResponse;

    /**
     * Check if user is authenticated
     */
    protected function isAuthenticated(): bool
    {
        return Auth::check();
    }

    /**
     * Check if user has specific role
     */
    protected function hasRole(string $role): bool
    {
        if (!$this->isAuthenticated()) {
            return false;
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        return $user->hasRole($role);
    }

    /**
     * Check if user has any of the specified roles
     */
    protected function hasAnyRole(array $roles): bool
    {
        if (!$this->isAuthenticated()) {
            return false;
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        return $user->hasAnyRole($roles);
    }

    /**
     * Check if user has specific permission
     */
    protected function hasPermission(string $permission): bool
    {
        if (!$this->isAuthenticated()) {
            return false;
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        return $user->hasPermission($permission);
    }

    /**
     * Check if user has any of the specified permissions
     */
    protected function hasAnyPermission(array $permissions): bool
    {
        if (!$this->isAuthenticated()) {
            return false;
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        return $user->hasAllPermissions($permissions);
    }

    /**
     * Check if user is super admin
     */
    protected function isSuperAdmin(): bool
    {
        if (!$this->isAuthenticated()) {
            return false;
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        return $user->isSuperAdmin();
    }

    /**
     * Check if user is admin
     */
    protected function isAdmin(): bool
    {
        if (!$this->isAuthenticated()) {
            return false;
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        return $user->isAdmin();
    }

    /**
     * Check if user belongs to specific organization
     */
    protected function belongsToOrganization(string $organizationId): bool
    {
        if (!$this->isAuthenticated()) {
            return false;
        }

        $user = Auth::user();

        if (isset($user->organization_id)) {
            return $user->organization_id === $organizationId;
        }

        return false;
    }

    /**
     * Check if user owns the resource
     */
    protected function ownsResource(string $resourceId, string $resourceType = 'user'): bool
    {
        if (!$this->isAuthenticated()) {
            return false;
        }

        $user = Auth::user();

        if ($resourceType === 'user') {
            return $user->id === $resourceId;
        }

        if (isset($user->organization_id)) {
            // Check if resource belongs to user's organization
            $resource = $this->getResource($resourceId, $resourceType);
            return $resource && $resource->organization_id === $user->organization_id;
        }

        return false;
    }

    /**
     * Get resource by ID and type
     */
    protected function getResource(string $resourceId, string $resourceType): mixed
    {
        $modelClass = "App\\Models\\" . Str::studly(Str::singular($resourceType));

        if (!class_exists($modelClass)) {
            return null;
        }

        return $modelClass::find($resourceId);
    }

    /**
     * Check rate limiting
     */
    protected function checkRateLimit(Request $request, string $key, int $maxAttempts = 60): bool
    {
        $key = $this->resolveRequestSignature($request, $key);

        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            return false;
        }

        RateLimiter::hit($key);
        return true;
    }

    /**
     * Resolve request signature for rate limiting
     */
    protected function resolveRequestSignature(Request $request, string $key): string
    {
        $user = Auth::user();
        $userId = $user ? $user->id : 'guest';
        $ip = $request->ip();

        return sha1($key . '|' . $userId . '|' . $ip);
    }

    /**
     * Get rate limit response
     */
    protected function getRateLimitResponse(string $message = 'Too many requests'): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'retry_after' => RateLimiter::availableIn($this->resolveRequestSignature(request(), 'default')),
            'timestamp' => now()->toISOString(),
        ], SymfonyResponse::HTTP_TOO_MANY_REQUESTS);
    }

    /**
     * Check cache for response
     */
    protected function getCachedResponse(string $key, int $ttl = 300): mixed
    {
        return Cache::get($key);
    }

    /**
     * Cache response
     */
    protected function cacheResponse(string $key, mixed $response, int $ttl = 300): void
    {
        Cache::put($key, $response, $ttl);
    }

    /**
     * Generate cache key
     */
    protected function generateCacheKey(Request $request, string $prefix = 'middleware'): string
    {
        $user = Auth::user();
        $userId = $user ? $user->id : 'guest';
        $url = $request->fullUrl();
        $params = $request->all();

        return "{$prefix}:{$userId}:" . md5($url . serialize($params));
    }

    /**
     * Log middleware action
     */
    protected function logAction(string $action, Request $request, array $context = []): void
    {
        $logData = array_merge($context, [
            'action' => $action,
            'middleware' => get_class($this),
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'user_id' => Auth::id(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()->toISOString(),
        ]);

        Log::info("Middleware action: {$action}", $logData);
    }

    /**
     * Log middleware error
     */
    protected function logError(string $message, \Throwable $exception, Request $request, array $context = []): void
    {
        $logData = array_merge($context, [
            'message' => $message,
            'middleware' => get_class($this),
            'exception' => $exception->getMessage(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'user_id' => Auth::id(),
            'ip_address' => $request->ip(),
            'timestamp' => now()->toISOString(),
        ]);

        Log::error($message, $logData);
    }

    /**
     * Get unauthorized response
     */
    protected function getUnauthorizedResponse(string $message = 'Unauthorized access'): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'error' => 'AUTHENTICATION_REQUIRED',
            'timestamp' => now()->toISOString(),
        ], SymfonyResponse::HTTP_UNAUTHORIZED);
    }

    /**
     * Get forbidden response
     */
    protected function getForbiddenResponse(string $message = 'Access forbidden'): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'error' => 'INSUFFICIENT_PERMISSIONS',
            'timestamp' => now()->toISOString(),
        ], SymfonyResponse::HTTP_FORBIDDEN);
    }

    /**
     * Get validation error response
     */
    protected function getValidationErrorResponse(array $errors, string $message = 'Validation failed'): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
            'error' => 'VALIDATION_ERROR',
            'timestamp' => now()->toISOString(),
        ], SymfonyResponse::HTTP_UNPROCESSABLE_ENTITY);
    }

    /**
     * Get not found response
     */
    protected function getNotFoundResponse(string $message = 'Resource not found'): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'error' => 'RESOURCE_NOT_FOUND',
            'timestamp' => now()->toISOString(),
        ], SymfonyResponse::HTTP_NOT_FOUND);
    }

    /**
     * Get server error response
     */
    protected function getServerErrorResponse(string $message = 'Internal server error'): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'error' => 'INTERNAL_SERVER_ERROR',
            'timestamp' => now()->toISOString(),
        ], SymfonyResponse::HTTP_INTERNAL_SERVER_ERROR);
    }

    /**
     * Check if request is for API
     */
    protected function isApiRequest(Request $request): bool
    {
        return $request->expectsJson() || $request->is('api/*');
    }

    /**
     * Check if request is for web
     */
    protected function isWebRequest(Request $request): bool
    {
        return !$this->isApiRequest($request);
    }

    /**
     * Get request context
     */
    protected function getRequestContext(Request $request): array
    {
        return [
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'referer' => $request->header('referer'),
            'accept' => $request->header('accept'),
            'content_type' => $request->header('content-type'),
            'authorization' => $request->hasHeader('authorization'),
            'is_api' => $this->isApiRequest($request),
            'is_web' => $this->isWebRequest($request),
        ];
    }

    /**
     * Validate request parameters
     */
    protected function validateParameters(array $parameters, array $required = []): bool
    {
        foreach ($required as $param) {
            if (!in_array($param, $parameters)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Get parameter value safely
     */
    protected function getParameter(array $parameters, string $key, mixed $default = null): mixed
    {
        return $parameters[$key] ?? $default;
    }

    /**
     * Check if parameter exists
     */
    protected function hasParameter(array $parameters, string $key): bool
    {
        return isset($parameters[$key]);
    }

    /**
     * Sanitize parameter value
     */
    protected function sanitizeParameter(mixed $value): mixed
    {
        if (is_string($value)) {
            return trim($value);
        }
        return $value;
    }

    /**
     * Validate UUID parameter
     */
    protected function validateUuidParameter(mixed $value): bool
    {
        if (!is_string($value)) {
            return false;
        }

        return preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i', $value);
    }

    /**
     * Get user context
     */
    protected function getUserContext(): array
    {
        $user = Auth::user();

        if (!$user) {
            return [
                'authenticated' => false,
                'user_id' => null,
                'organization_id' => null,
                'roles' => [],
                'permissions' => [],
            ];
        }

        return [
            'authenticated' => true,
            'user_id' => $user->id,
            'organization_id' => $user->organization_id ?? null,
            'email' => $user->email,
            'roles' => $this->getUserRoles($user),
            'permissions' => $this->getUserPermissions($user),
        ];
    }

    /**
     * Get user roles
     */
    protected function getUserRoles($user): array
    {
        if (method_exists($user, 'getRoleNames')) {
            return $user->getRoleNames()->toArray();
        }

        if (method_exists($user, 'roles')) {
            return $user->roles->pluck('name')->toArray();
        }

        return [];
    }

    /**
     * Get user permissions
     */
    protected function getUserPermissions($user): array
    {
        if (method_exists($user, 'getAllPermissions')) {
            return $user->getAllPermissions()->pluck('name')->toArray();
        }

        if (method_exists($user, 'permissions')) {
            return $user->permissions->pluck('name')->toArray();
        }

        return [];
    }
}
