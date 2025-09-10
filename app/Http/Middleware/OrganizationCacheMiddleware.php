<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class OrganizationCacheMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only cache GET requests
        if ($request->method() !== 'GET') {
            return $next($request);
        }

        // Generate cache key based on request
        $cacheKey = $this->generateCacheKey($request);

        // Check if response is cached
        $cachedResponse = Cache::get($cacheKey);
        if ($cachedResponse) {
            return response()->json($cachedResponse)
                ->header('X-Cache', 'HIT')
                ->header('X-Cache-Key', $cacheKey);
        }

        // Process request
        $response = $next($request);

        // Cache successful responses
        if ($response->getStatusCode() === 200) {
            $responseData = json_decode($response->getContent(), true);

            // Cache for different durations based on endpoint
            $cacheDuration = $this->getCacheDuration($request);

            Cache::put($cacheKey, $responseData, $cacheDuration);

            $response->headers->set('X-Cache', 'MISS');
            $response->headers->set('X-Cache-Key', $cacheKey);
            $response->headers->set('X-Cache-Duration', $cacheDuration);
        }

        return $response;
    }

    /**
     * Generate cache key for request
     */
    private function generateCacheKey(Request $request): string
    {
        $path = $request->path();
        $query = $request->query();
        $user = $request->user();

        $key = 'org_cache:' . $path;

        if ($user) {
            $key .= ':user:' . $user->id;
        }

        if (!empty($query)) {
            $key .= ':' . md5(serialize($query));
        }

        return $key;
    }

    /**
     * Get cache duration based on endpoint
     */
    private function getCacheDuration(Request $request): int
    {
        $path = $request->path();

        // Analytics data - cache for 5 minutes
        if (str_contains($path, 'analytics')) {
            return 300; // 5 minutes
        }

        // Settings data - cache for 10 minutes
        if (str_contains($path, 'settings')) {
            return 600; // 10 minutes
        }

        // Roles and permissions - cache for 15 minutes
        if (str_contains($path, 'roles') || str_contains($path, 'permissions')) {
            return 900; // 15 minutes
        }

        // User data - cache for 2 minutes
        if (str_contains($path, 'users')) {
            return 120; // 2 minutes
        }

        // Default cache for 5 minutes
        return 300;
    }
}
