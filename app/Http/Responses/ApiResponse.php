<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Pagination\LengthAwarePaginator;

class ApiResponse
{
    /**
     * Standard API error codes.
     */
    public const ERROR_CODES = [
        // Authentication & Authorization
        'UNAUTHORIZED' => 'UNAUTHORIZED',
        'FORBIDDEN' => 'FORBIDDEN',
        'TOKEN_EXPIRED' => 'TOKEN_EXPIRED',
        'TOKEN_INVALID' => 'TOKEN_INVALID',
        'TOKEN_MISSING' => 'TOKEN_MISSING',
        'ACCOUNT_LOCKED' => 'ACCOUNT_LOCKED',
        'ACCOUNT_SUSPENDED' => 'ACCOUNT_SUSPENDED',
        'EMAIL_NOT_VERIFIED' => 'EMAIL_NOT_VERIFIED',
        'TWO_FACTOR_REQUIRED' => 'TWO_FACTOR_REQUIRED',

        // Validation
        'VALIDATION_ERROR' => 'VALIDATION_ERROR',
        'INVALID_INPUT' => 'INVALID_INPUT',
        'MISSING_REQUIRED_FIELD' => 'MISSING_REQUIRED_FIELD',
        'INVALID_FORMAT' => 'INVALID_FORMAT',
        'VALUE_TOO_LARGE' => 'VALUE_TOO_LARGE',
        'VALUE_TOO_SMALL' => 'VALUE_TOO_SMALL',

        // Resources
        'RESOURCE_NOT_FOUND' => 'RESOURCE_NOT_FOUND',
        'RESOURCE_ALREADY_EXISTS' => 'RESOURCE_ALREADY_EXISTS',
        'RESOURCE_CONFLICT' => 'RESOURCE_CONFLICT',
        'RESOURCE_GONE' => 'RESOURCE_GONE',

        // Rate Limiting
        'RATE_LIMIT_EXCEEDED' => 'RATE_LIMIT_EXCEEDED',
        'QUOTA_EXCEEDED' => 'QUOTA_EXCEEDED',
        'USAGE_LIMIT_REACHED' => 'USAGE_LIMIT_REACHED',

        // Business Logic
        'OPERATION_NOT_ALLOWED' => 'OPERATION_NOT_ALLOWED',
        'INSUFFICIENT_PERMISSIONS' => 'INSUFFICIENT_PERMISSIONS',
        'BUSINESS_RULE_VIOLATION' => 'BUSINESS_RULE_VIOLATION',
        'WORKFLOW_ERROR' => 'WORKFLOW_ERROR',

        // External Services
        'EXTERNAL_SERVICE_ERROR' => 'EXTERNAL_SERVICE_ERROR',
        'API_INTEGRATION_ERROR' => 'API_INTEGRATION_ERROR',
        'PAYMENT_GATEWAY_ERROR' => 'PAYMENT_GATEWAY_ERROR',
        'EMAIL_SERVICE_ERROR' => 'EMAIL_SERVICE_ERROR',

        // System Errors
        'INTERNAL_SERVER_ERROR' => 'INTERNAL_SERVER_ERROR',
        'SERVICE_UNAVAILABLE' => 'SERVICE_UNAVAILABLE',
        'DATABASE_ERROR' => 'DATABASE_ERROR',
        'CACHE_ERROR' => 'CACHE_ERROR',
        'FILE_SYSTEM_ERROR' => 'FILE_SYSTEM_ERROR',
        'CONFIGURATION_ERROR' => 'CONFIGURATION_ERROR',

        // Data Processing
        'PARSING_ERROR' => 'PARSING_ERROR',
        'ENCODING_ERROR' => 'ENCODING_ERROR',
        'COMPRESSION_ERROR' => 'COMPRESSION_ERROR',
        'ENCRYPTION_ERROR' => 'ENCRYPTION_ERROR',

        // Network
        'NETWORK_ERROR' => 'NETWORK_ERROR',
        'TIMEOUT_ERROR' => 'TIMEOUT_ERROR',
        'CONNECTION_ERROR' => 'CONNECTION_ERROR',
    ];

    /**
     * Success response.
     */
    public static function success(
        string $message = 'Operation successful',
        mixed $data = null,
        int $statusCode = 200,
        array $meta = []
    ): JsonResponse {
        return self::buildResponse(
            success: true,
            message: $message,
            data: $data,
            statusCode: $statusCode,
            meta: $meta
        );
    }

    /**
     * Error response.
     */
    public static function error(
        string $message = 'Operation failed',
        mixed $errors = null,
        int $statusCode = 400,
        ?string $errorCode = null,
        array $meta = []
    ): JsonResponse {
        return self::buildResponse(
            success: false,
            message: $message,
            data: null,
            errors: $errors,
            statusCode: $statusCode,
            errorCode: $errorCode,
            meta: $meta
        );
    }

    /**
     * Created response.
     */
    public static function created(
        mixed $data = null,
        string $message = 'Resource created successfully'
    ): JsonResponse {
        return self::success($message, $data, 201);
    }

    /**
     * Updated response.
     */
    public static function updated(
        mixed $data = null,
        string $message = 'Resource updated successfully'
    ): JsonResponse {
        return self::success($message, $data, 200);
    }

    /**
     * Deleted response.
     */
    public static function deleted(
        string $message = 'Resource deleted successfully'
    ): JsonResponse {
        return self::success($message, null, 200);
    }

    /**
     * Not found response.
     */
    public static function notFound(
        string $resource = 'Resource',
        ?string $identifier = null
    ): JsonResponse {
        $message = $identifier
            ? "{$resource} with identifier '{$identifier}' not found"
            : "{$resource} not found";

        return self::error(
            message: $message,
            statusCode: 404,
            errorCode: self::ERROR_CODES['RESOURCE_NOT_FOUND']
        );
    }

    /**
     * Validation error response.
     */
    public static function validationError(
        array $errors,
        string $message = 'Validation failed'
    ): JsonResponse {
        return self::error(
            message: $message,
            errors: $errors,
            statusCode: 422,
            errorCode: self::ERROR_CODES['VALIDATION_ERROR']
        );
    }

    /**
     * Unauthorized response.
     */
    public static function unauthorized(
        string $message = 'Unauthorized access',
        ?string $errorCode = null
    ): JsonResponse {
        return self::error(
            message: $message,
            statusCode: 401,
            errorCode: $errorCode ?? self::ERROR_CODES['UNAUTHORIZED']
        );
    }

    /**
     * Forbidden response.
     */
    public static function forbidden(
        string $message = 'Access forbidden'
    ): JsonResponse {
        return self::error(
            message: $message,
            statusCode: 403,
            errorCode: self::ERROR_CODES['FORBIDDEN']
        );
    }

    /**
     * Rate limit exceeded response.
     */
    public static function rateLimitExceeded(
        string $message = 'Too many requests. Please try again later.',
        array $meta = []
    ): JsonResponse {
        return self::error(
            message: $message,
            statusCode: 429,
            errorCode: self::ERROR_CODES['RATE_LIMIT_EXCEEDED'],
            meta: $meta
        );
    }

    /**
     * Server error response.
     */
    public static function serverError(
        string $message = 'Internal server error',
        mixed $details = null
    ): JsonResponse {
        return self::error(
            message: $message,
            errors: $details,
            statusCode: 500,
            errorCode: self::ERROR_CODES['INTERNAL_SERVER_ERROR']
        );
    }

    /**
     * Service unavailable response.
     */
    public static function serviceUnavailable(
        string $message = 'Service temporarily unavailable'
    ): JsonResponse {
        return self::error(
            message: $message,
            statusCode: 503,
            errorCode: self::ERROR_CODES['SERVICE_UNAVAILABLE']
        );
    }

    /**
     * Paginated response.
     */
    public static function paginated(
        LengthAwarePaginator $paginator,
        string $message = 'Data retrieved successfully'
    ): JsonResponse {
        return self::success(
            message: $message,
            data: $paginator
        );
    }

    /**
     * Collection response.
     */
    public static function collection(
        mixed $collection,
        string $message = 'Data retrieved successfully',
        array $meta = []
    ): JsonResponse {
        if (is_countable($collection)) {
            $meta['total_count'] = count($collection);
        }

        return self::success(
            message: $message,
            data: $collection,
            meta: $meta
        );
    }

    /**
     * No content response.
     */
    public static function noContent(): JsonResponse
    {
        return response()->json(null, 204);
    }

    /**
     * Build the response structure.
     */
    private static function buildResponse(
        bool $success,
        string $message,
        mixed $data = null,
        mixed $errors = null,
        int $statusCode = 200,
        ?string $errorCode = null,
        array $meta = []
    ): JsonResponse {
        $response = [
            'success' => $success,
            'message' => $message,
            'timestamp' => now()->toISOString(),
            'request_id' => request()->header('X-Request-ID') ?? self::generateRequestId(),
        ];

        // Add data for success responses
        if ($success && $data !== null) {
            if ($data instanceof JsonResource || $data instanceof AnonymousResourceCollection) {
                $response['data'] = $data->response()->getData(true)['data'] ?? $data;
            } elseif ($data instanceof LengthAwarePaginator) {
                $response['data'] = $data->items();
                $response['pagination'] = [
                    'current_page' => $data->currentPage(),
                    'per_page' => $data->perPage(),
                    'total' => $data->total(),
                    'last_page' => $data->lastPage(),
                    'from' => $data->firstItem(),
                    'to' => $data->lastItem(),
                    'has_more_pages' => $data->hasMorePages(),
                    'path' => $data->path(),
                    'links' => [
                        'first' => $data->url(1),
                        'last' => $data->url($data->lastPage()),
                        'prev' => $data->previousPageUrl(),
                        'next' => $data->nextPageUrl(),
                    ],
                ];
            } else {
                $response['data'] = $data;
            }
        }

        // Add error details for error responses
        if (!$success) {
            if ($errorCode) {
                $response['error_code'] = $errorCode;
            }

            if ($errors !== null) {
                if (is_string($errors)) {
                    $response['errors'] = [$errors];
                } elseif (is_array($errors)) {
                    $response['errors'] = $errors;
                } else {
                    $response['errors'] = ['details' => $errors];
                }
            }

            // Add debugging info in non-production
            if (!app()->environment('production')) {
                $trace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 3);
                $response['debug'] = [
                    'file' => $trace[2]['file'] ?? null,
                    'line' => $trace[2]['line'] ?? null,
                    'class' => $trace[2]['class'] ?? null,
                    'function' => $trace[2]['function'] ?? null,
                    'trace_id' => uniqid('trace_'),
                ];
            }
        }

        // Add meta information
        if (!empty($meta)) {
            $response['meta'] = array_merge([
                'api_version' => config('app.api_version', '1.0'),
                'environment' => app()->environment(),
                'server_time' => now()->toISOString(),
            ], $meta);
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Generate unique request ID.
     */
    private static function generateRequestId(): string
    {
        return 'req_' . uniqid() . '_' . substr(md5(microtime()), 0, 8);
    }

    /**
     * Get error code by exception type.
     */
    public static function getErrorCodeByException(\Throwable $exception): string
    {
        return match (get_class($exception)) {
            \Illuminate\Validation\ValidationException::class => self::ERROR_CODES['VALIDATION_ERROR'],
            \Illuminate\Auth\AuthenticationException::class => self::ERROR_CODES['UNAUTHORIZED'],
            \Illuminate\Auth\Access\AuthorizationException::class => self::ERROR_CODES['FORBIDDEN'],
            \Illuminate\Database\Eloquent\ModelNotFoundException::class => self::ERROR_CODES['RESOURCE_NOT_FOUND'],
            \Symfony\Component\HttpKernel\Exception\NotFoundHttpException::class => self::ERROR_CODES['RESOURCE_NOT_FOUND'],
            \Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException::class => self::ERROR_CODES['RATE_LIMIT_EXCEEDED'],
            \Symfony\Component\HttpKernel\Exception\ServiceUnavailableHttpException::class => self::ERROR_CODES['SERVICE_UNAVAILABLE'],
            \Illuminate\Database\QueryException::class => self::ERROR_CODES['DATABASE_ERROR'],
            \PDOException::class => self::ERROR_CODES['DATABASE_ERROR'],
            default => self::ERROR_CODES['INTERNAL_SERVER_ERROR'],
        };
    }
}
