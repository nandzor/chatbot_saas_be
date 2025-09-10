<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use App\Traits\Api\ApiResponseTrait;

class AdvancedRateLimitMiddleware
{
    use ApiResponseTrait;

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $limit = '60,1'): Response
    {
        [$maxAttempts, $decayMinutes] = explode(',', $limit);
        $maxAttempts = (int) $maxAttempts;
        $decayMinutes = (int) $decayMinutes;

        $key = $this->resolveRequestSignature($request);
        $attempts = Cache::get($key, 0);

        if ($attempts >= $maxAttempts) {
            $this->logRateLimitExceeded($request, $attempts, $maxAttempts);

            return $this->rateLimitExceededResponse($maxAttempts, $decayMinutes);
        }

        // Increment attempts
        Cache::put($key, $attempts + 1, $decayMinutes * 60);

        $response = $next($request);

        // Add rate limit headers
        $response->headers->set('X-RateLimit-Limit', $maxAttempts);
        $response->headers->set('X-RateLimit-Remaining', max(0, $maxAttempts - $attempts - 1));
        $response->headers->set('X-RateLimit-Reset', now()->addMinutes($decayMinutes)->timestamp);

        return $response;
    }

    /**
     * Resolve request signature for rate limiting
     */
    protected function resolveRequestSignature(Request $request): string
    {
        $user = $request->user();
        $ip = $request->ip();
        $path = $request->path();
        $method = $request->method();

        // Use user ID if authenticated, otherwise use IP
        $identifier = $user ? "user:{$user->id}" : "ip:{$ip}";

        return "rate_limit:{$identifier}:{$method}:{$path}";
    }

    /**
     * Log rate limit exceeded
     */
    protected function logRateLimitExceeded(Request $request, int $attempts, int $maxAttempts): void
    {
        Log::warning('Rate limit exceeded', [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'path' => $request->path(),
            'method' => $request->method(),
            'attempts' => $attempts,
            'max_attempts' => $maxAttempts,
            'user_id' => $request->user()?->id,
        ]);
    }

    /**
     * Rate limit exceeded response
     */
    protected function rateLimitExceededResponse(int $maxAttempts, int $decayMinutes): Response
    {
        return response()->json([
            'success' => false,
            'message' => 'Too many requests. Please try again later.',
            'error' => 'RATE_LIMIT_EXCEEDED',
            'retry_after' => $decayMinutes * 60,
            'limit' => $maxAttempts,
            'timestamp' => now()->toISOString(),
        ], 429);
    }
}
