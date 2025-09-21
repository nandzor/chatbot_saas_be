<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Cache\RateLimiter;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Symfony\Component\HttpFoundation\Response;

class OrganizationRegistrationThrottle
{
    protected $limiter;

    public function __construct(RateLimiter $limiter)
    {
        $this->limiter = $limiter;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, int $maxAttempts = 3, int $decayMinutes = 15): Response
    {
        // Skip rate limiting in testing environment
        if (app()->environment('testing')) {
            return $next($request);
        }

        $key = $this->resolveRequestSignature($request);

        if ($this->limiter->tooManyAttempts($key, $maxAttempts)) {
            $retryAfter = $this->limiter->availableIn($key);

            return response()->json([
                'success' => false,
                'message' => 'Too many organization registration attempts. Please try again later.',
                'error' => 'Rate limit exceeded',
                'retry_after' => $retryAfter,
                'max_attempts' => $maxAttempts,
                'decay_minutes' => $decayMinutes,
            ], 429)->header('Retry-After', $retryAfter);
        }

        $this->limiter->hit($key, $decayMinutes * 60);

        $response = $next($request);

        // Add rate limit headers to successful responses
        $response->headers->set('X-RateLimit-Limit', $maxAttempts);
        $response->headers->set('X-RateLimit-Remaining', $this->limiter->retriesLeft($key, $maxAttempts));
        $response->headers->set('X-RateLimit-Reset', now()->addMinutes($decayMinutes)->timestamp);

        return $response;
    }

    /**
     * Resolve request signature for rate limiting.
     */
    protected function resolveRequestSignature(Request $request): string
    {
        // Use IP address and user agent for more specific rate limiting
        $ip = $request->ip();
        $userAgent = $request->userAgent();

        // For organization registration, also consider email addresses
        $email = $request->input('organization_email') ?? $request->input('admin_email');

        return sha1($ip . '|' . $userAgent . '|' . ($email ?? 'anonymous'));
    }
}
