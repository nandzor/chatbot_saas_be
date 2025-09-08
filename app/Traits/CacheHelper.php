<?php

namespace App\Traits;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

trait CacheHelper
{
    /**
     * Clear cache by pattern (Redis specific) - Laravel 12 optimized.
     */
    protected function clearCacheByPattern(string $pattern): void
    {
        try {
            $store = Cache::getStore();
            if ($store instanceof \Illuminate\Cache\RedisStore) {
                /** @var \Illuminate\Cache\RedisStore $store */
                $redis = $store->getConnection();

                // Check if Redis connection has the required methods
                if (method_exists($redis, 'keys') && method_exists($redis, 'del')) {
                    $keys = $redis->keys($pattern);
                    if (!empty($keys)) {
                        $redis->del($keys);
                    }
                }
            }
        } catch (\Exception $e) {
            // Log the error but don't throw it to avoid breaking the application
            Log::warning('Failed to clear cache by pattern', [
                'pattern' => $pattern,
                'error' => $e->getMessage(),
                'service' => static::class
            ]);
        }
    }

    /**
     * Clear multiple cache patterns efficiently.
     */
    protected function clearCacheByPatterns(array $patterns): void
    {
        foreach ($patterns as $pattern) {
            $this->clearCacheByPattern($pattern);
        }
    }

    /**
     * Clear cache with organization-specific patterns.
     */
    protected function clearOrganizationCache(string $organizationId, array $keyPrefixes = []): void
    {
        $patterns = array_map(
            fn($prefix) => "{$prefix}_org_{$organizationId}*",
            $keyPrefixes
        );

        $this->clearCacheByPatterns($patterns);
    }

    /**
     * Get cache key with organization prefix.
     */
    protected function getCacheKey(string $key, ?string $organizationId = null): string
    {
        $orgId = $organizationId ?? $this->getCurrentOrganizationId();
        return "{$key}_org_{$orgId}";
    }

    /**
     * Remember cache with organization-specific key.
     */
    protected function rememberWithOrganization(string $key, int $ttl, callable $callback, ?string $organizationId = null)
    {
        $cacheKey = $this->getCacheKey($key, $organizationId);
        return Cache::remember($cacheKey, $ttl, $callback);
    }

    /**
     * Get current organization ID (to be implemented by classes using this trait).
     */
    protected function getCurrentOrganizationId(): string
    {
        // This should be implemented by the class using this trait
        return '';
    }
}
