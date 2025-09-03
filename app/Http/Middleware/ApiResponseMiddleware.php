<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class ApiResponseMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Enable query logging for API routes to track database queries
        if ($request->is('api/*')) {
            DB::enableQueryLog();
        }

        $response = $next($request);

        // Only process JSON responses for API routes
        if ($this->shouldProcessResponse($request, $response)) {
            $this->addStandardHeaders($response);
            $this->addRequestId($request, $response);
            $this->addPerformanceMetrics($request, $response);
        }

        return $response;
    }

    /**
     * Check if response should be processed.
     */
    private function shouldProcessResponse(Request $request, Response $response): bool
    {
        return $response instanceof JsonResponse && $request->is('api/*');
    }

    /**
     * Add standard API headers.
     */
    private function addStandardHeaders(JsonResponse $response): void
    {
        $response->headers->set('Content-Type', 'application/json; charset=utf-8');
        $response->headers->set('X-API-Version', config('app.api_version', '1.0'));
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // CORS headers if not already set
        if (!$response->headers->has('Access-Control-Allow-Origin')) {
            $response->headers->set('Access-Control-Allow-Origin', '*');
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Request-ID');
        }
    }

    /**
     * Add request ID to response.
     */
    private function addRequestId(Request $request, JsonResponse $response): void
    {
        $requestId = $request->header('X-Request-ID') ?? 'req_' . uniqid();
        $response->headers->set('X-Request-ID', $requestId);

        // Add to response body if not already present
        $data = $response->getData(true);
        if (is_array($data) && !isset($data['request_id'])) {
            $data['request_id'] = $requestId;
            $response->setData($data);
        }
    }

    /**
     * Add performance metrics to response.
     */
    private function addPerformanceMetrics(Request $request, JsonResponse $response): void
    {
        if (defined('LARAVEL_START')) {
            $executionTime = round((microtime(true) - LARAVEL_START) * 1000, 2);
            $response->headers->set('X-Response-Time', $executionTime . 'ms');

            // Add to response body in non-production
            if (!app()->environment('production')) {
                $data = $response->getData(true);
                if (is_array($data)) {
                    // Get query count - ensure query log is enabled and get count
                    $queryLog = DB::getQueryLog();
                    $queriesCount = is_array($queryLog) ? count($queryLog) : 0;

                    $data['meta'] = array_merge($data['meta'] ?? [], [
                        'execution_time_ms' => $executionTime,
                        'memory_usage_mb' => round(memory_get_peak_usage(true) / 1024 / 1024, 2),
                        'queries_count' => $queriesCount,
                    ]);
                    $response->setData($data);
                }
            }
        }
    }
}
