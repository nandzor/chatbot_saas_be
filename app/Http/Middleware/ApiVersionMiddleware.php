<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use App\Traits\Api\ApiResponseTrait;

class ApiVersionMiddleware
{
    use ApiResponseTrait;

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $version = 'v1'): Response
    {
        // Check if request is for API
        if (!$this->isApiRequest($request)) {
            return $next($request);
        }

        // Extract version from request
        $requestedVersion = $this->extractVersion($request);

        // Validate version
        if (!$this->isValidVersion($requestedVersion)) {
            return $this->unsupportedVersionResponse($requestedVersion);
        }

        // Check if version is deprecated
        if ($this->isDeprecatedVersion($requestedVersion)) {
            $this->logDeprecatedVersionUsage($request, $requestedVersion);

            $response = $next($request);
            $response->headers->set('X-API-Deprecated', 'true');
            $response->headers->set('X-API-Deprecation-Date', '2024-12-31');
            $response->headers->set('X-API-Sunset-Date', '2025-06-30');

            return $response;
        }

        // Add version info to request
        $request->merge(['api_version' => $requestedVersion]);

        $response = $next($request);

        // Add version headers
        $response->headers->set('X-API-Version', $requestedVersion);
        $response->headers->set('X-API-Supported-Versions', implode(',', $this->getSupportedVersions()));

        return $response;
    }

    /**
     * Check if request is for API
     */
    protected function isApiRequest(Request $request): bool
    {
        return $request->expectsJson() || $request->is('api/*');
    }

    /**
     * Extract version from request
     */
    protected function extractVersion(Request $request): ?string
    {
        // Check Accept header first
        $acceptHeader = $request->header('Accept');
        if (preg_match('/application\/vnd\.api\.v(\d+)\+json/', $acceptHeader, $matches)) {
            return 'v' . $matches[1];
        }

        // Check URL path
        if (preg_match('/\/api\/v(\d+)\//', $request->path(), $matches)) {
            return 'v' . $matches[1];
        }

        // Check X-API-Version header
        $versionHeader = $request->header('X-API-Version');
        if ($versionHeader) {
            return $versionHeader;
        }

        // Default to v1
        return 'v1';
    }

    /**
     * Check if version is valid
     */
    protected function isValidVersion(?string $version): bool
    {
        if (!$version) {
            return false;
        }

        return in_array($version, $this->getSupportedVersions());
    }

    /**
     * Check if version is deprecated
     */
    protected function isDeprecatedVersion(string $version): bool
    {
        $deprecatedVersions = ['v1']; // Add deprecated versions here

        return in_array($version, $deprecatedVersions);
    }

    /**
     * Get supported API versions
     */
    protected function getSupportedVersions(): array
    {
        return ['v1', 'v2']; // Add new versions here
    }

    /**
     * Log deprecated version usage
     */
    protected function logDeprecatedVersionUsage(Request $request, string $version): void
    {
        Log::warning('Deprecated API version used', [
            'version' => $version,
            'path' => $request->path(),
            'method' => $request->method(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'user_id' => $request->user()?->id,
        ]);
    }

    /**
     * Unsupported version response
     */
    protected function unsupportedVersionResponse(?string $version): Response
    {
        return response()->json([
            'success' => false,
            'message' => 'Unsupported API version.',
            'error' => 'UNSUPPORTED_API_VERSION',
            'requested_version' => $version,
            'supported_versions' => $this->getSupportedVersions(),
            'timestamp' => now()->toISOString(),
        ], 400);
    }
}
