<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class OrganizationErrorHandlerMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            $response = $next($request);

            // Log successful requests for monitoring
            if ($response->getStatusCode() >= 200 && $response->getStatusCode() < 300) {
                $this->logRequest($request, $response, 'success');
            }

            return $response;

        } catch (\Exception $e) {
            // Log error details
            $this->logError($request, $e);

            // Return standardized error response
            return $this->handleException($e, $request);
        }
    }

    /**
     * Log successful requests
     */
    private function logRequest(Request $request, Response $response, string $status): void
    {
        $logData = [
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'status_code' => $response->getStatusCode(),
            'response_time' => microtime(true) - LARAVEL_START,
            'user_id' => $request->user()?->id,
            'organization_id' => $request->route('organization'),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ];

        Log::channel('organization')->info('Organization API Request', $logData);
    }

    /**
     * Log error details
     */
    private function logError(Request $request, \Exception $e): void
    {
        $logData = [
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'error_message' => $e->getMessage(),
            'error_code' => $e->getCode(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString(),
            'user_id' => $request->user()?->id,
            'organization_id' => $request->route('organization'),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'request_data' => $request->all(),
        ];

        Log::channel('organization')->error('Organization API Error', $logData);
    }

    /**
     * Handle exception and return standardized response
     */
    private function handleException(\Exception $e, Request $request): Response
    {
        $statusCode = 500;
        $errorCode = 'INTERNAL_SERVER_ERROR';
        $message = 'An internal server error occurred';

        // Handle specific exception types
        if ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
            $statusCode = 404;
            $errorCode = 'RESOURCE_NOT_FOUND';
            $message = 'The requested resource was not found';
        } elseif ($e instanceof \Illuminate\Validation\ValidationException) {
            $statusCode = 422;
            $errorCode = 'VALIDATION_ERROR';
            $message = 'Validation failed';
        } elseif ($e instanceof \Illuminate\Auth\AuthenticationException) {
            $statusCode = 401;
            $errorCode = 'UNAUTHORIZED';
            $message = 'Authentication required';
        } elseif ($e instanceof \Illuminate\Auth\Access\AuthorizationException) {
            $statusCode = 403;
            $errorCode = 'FORBIDDEN';
            $message = 'Access denied';
        }

        $response = [
            'success' => false,
            'message' => $message,
            'error_code' => $errorCode,
            'timestamp' => now()->toISOString(),
            'request_id' => uniqid('req_'),
        ];

        // Add debug information in development
        if (config('app.debug')) {
            $response['debug'] = [
                'exception' => get_class($e),
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ];
        }

        // Add validation errors if available
        if ($e instanceof \Illuminate\Validation\ValidationException) {
            $response['errors'] = $e->errors();
        }

        return response()->json($response, $statusCode);
    }
}
