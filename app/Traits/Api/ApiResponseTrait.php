<?php

namespace App\Traits\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Pagination\LengthAwarePaginator;

trait ApiResponseTrait
{
    /**
     * Success response dengan data.
     */
    protected function successResponse(
        string $message = 'Operation successful',
        mixed $data = null,
        int $statusCode = 200,
        array $meta = []
    ): JsonResponse {
        $response = [
            'success' => true,
            'message' => $message,
            'timestamp' => now()->toISOString(),
            'request_id' => request()->header('X-Request-ID') ?? $this->generateRequestId(),
        ];

        // Add data if provided
        if ($data !== null) {
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
                ];
            } else {
                $response['data'] = $data;
            }
        }

        // Add meta information
        if (!empty($meta)) {
            $response['meta'] = array_merge([
                'api_version' => config('app.api_version', '1.0'),
                'environment' => app()->environment(),
            ], $meta);
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Error response dengan details.
     */
    protected function errorResponse(
        string $message = 'Operation failed',
        mixed $errors = null,
        int $statusCode = 400,
        ?string $errorCode = null,
        array $meta = []
    ): JsonResponse {
        $response = [
            'success' => false,
            'message' => $message,
            'timestamp' => now()->toISOString(),
            'request_id' => request()->header('X-Request-ID') ?? $this->generateRequestId(),
        ];

        // Add error code if provided
        if ($errorCode) {
            $response['error_code'] = $errorCode;
        }

        // Add detailed errors if provided
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
            $backtrace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 3);
            $response['debug'] = [
                'file' => $backtrace[1]['file'] ?? null,
                'line' => $backtrace[1]['line'] ?? null,
                'trace_id' => uniqid('trace_'),
            ];
        }

        // Add meta information
        if (!empty($meta)) {
            $response['meta'] = array_merge([
                'api_version' => config('app.api_version', '1.0'),
                'environment' => app()->environment(),
            ], $meta);
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Validation error response.
     */
    protected function validationErrorResponse(
        array $errors,
        string $message = 'Validation failed'
    ): JsonResponse {
        return $this->errorResponse(
            message: $message,
            errors: $errors,
            statusCode: 422,
            errorCode: 'VALIDATION_ERROR'
        );
    }

    /**
     * Not found error response.
     */
    protected function notFoundResponse(
        string $resource = 'Resource',
        ?string $identifier = null
    ): JsonResponse {
        $message = $identifier
            ? "{$resource} with identifier '{$identifier}' not found"
            : "{$resource} not found";

        return $this->errorResponse(
            message: $message,
            statusCode: 404,
            errorCode: 'RESOURCE_NOT_FOUND'
        );
    }

    /**
     * Unauthorized response.
     */
    protected function unauthorizedResponse(
        string $message = 'Unauthorized access'
    ): JsonResponse {
        return $this->errorResponse(
            message: $message,
            statusCode: 401,
            errorCode: 'UNAUTHORIZED'
        );
    }

    /**
     * Forbidden response.
     */
    protected function forbiddenResponse(
        string $message = 'Access forbidden'
    ): JsonResponse {
        return $this->errorResponse(
            message: $message,
            statusCode: 403,
            errorCode: 'FORBIDDEN'
        );
    }

    /**
     * Too many requests response.
     */
    protected function tooManyRequestsResponse(
        string $message = 'Too many requests. Please try again later.'
    ): JsonResponse {
        return $this->errorResponse(
            message: $message,
            statusCode: 429,
            errorCode: 'RATE_LIMIT_EXCEEDED'
        );
    }

    /**
     * Server error response.
     */
    protected function serverErrorResponse(
        string $message = 'Internal server error',
        mixed $details = null
    ): JsonResponse {
        return $this->errorResponse(
            message: $message,
            errors: $details,
            statusCode: 500,
            errorCode: 'INTERNAL_SERVER_ERROR'
        );
    }

    /**
     * Error response with exception details for debugging.
     */
    protected function errorResponseWithDebug(
        string $message = 'Operation failed',
        int $statusCode = 500,
        mixed $errors = null,
        ?\Exception $exception = null
    ): JsonResponse {
        $response = [
            'success' => false,
            'message' => $message,
            'timestamp' => now()->toISOString(),
            'request_id' => request()->header('X-Request-ID') ?? $this->generateRequestId(),
        ];

        // Add error code
        $response['error_code'] = 'EXCEPTION_ERROR';

        // Add detailed errors if provided
        if ($errors !== null) {
            if (is_string($errors)) {
                $response['errors'] = [$errors];
            } elseif (is_array($errors)) {
                $response['errors'] = $errors;
            } else {
                $response['errors'] = ['details' => $errors];
            }
        }

        // Add exception debug information in non-production
        if (!app()->environment('production') && $exception) {
            $response['debug'] = [
                'exception_message' => $exception->getMessage(),
                'exception_file' => $exception->getFile(),
                'exception_line' => $exception->getLine(),
                'exception_trace' => $exception->getTraceAsString(),
                'trace_id' => uniqid('trace_'),
            ];
        }

        // Add meta information
        $response['meta'] = [
            'api_version' => config('app.api_version', '1.0'),
            'environment' => app()->environment(),
        ];

        return response()->json($response, $statusCode);
    }

    /**
     * Service unavailable response.
     */
    protected function serviceUnavailableResponse(
        string $message = 'Service temporarily unavailable'
    ): JsonResponse {
        return $this->errorResponse(
            message: $message,
            statusCode: 503,
            errorCode: 'SERVICE_UNAVAILABLE'
        );
    }

    /**
     * Created response untuk resource baru.
     */
    protected function createdResponse(
        mixed $data = null,
        string $message = 'Resource created successfully'
    ): JsonResponse {
        return $this->successResponse(
            message: $message,
            data: $data,
            statusCode: 201
        );
    }

    /**
     * Updated response untuk resource yang diupdate.
     */
    protected function updatedResponse(
        mixed $data = null,
        string $message = 'Resource updated successfully',
        array $meta = []
    ): JsonResponse {
        return $this->successResponse(
            message: $message,
            data: $data,
            statusCode: 200,
            meta: $meta
        );
    }

    /**
     * Deleted response untuk resource yang dihapus.
     */
    protected function deletedResponse(
        string $message = 'Resource deleted successfully'
    ): JsonResponse {
        return $this->successResponse(
            message: $message,
            statusCode: 200
        );
    }

    /**
     * No content response.
     */
    protected function noContentResponse(): JsonResponse
    {
        return response()->json(null, 204);
    }

    /**
     * Paginated response untuk collection.
     */
    protected function paginatedResponse(
        LengthAwarePaginator $paginator,
        string $message = 'Data retrieved successfully'
    ): JsonResponse {
        return $this->successResponse(
            message: $message,
            data: $paginator
        );
    }

    /**
     * Collection response untuk array data.
     */
    protected function collectionResponse(
        mixed $collection,
        string $message = 'Data retrieved successfully',
        array $meta = []
    ): JsonResponse {
        if (is_countable($collection)) {
            $meta['total_count'] = count($collection);
        }

        return $this->successResponse(
            message: $message,
            data: $collection,
            meta: $meta
        );
    }

    /**
     * Generate unique request ID.
     */
    protected function generateRequestId(): string
    {
        return 'req_' . uniqid() . '_' . substr(md5(microtime()), 0, 8);
    }

    /**
     * Add rate limit headers to response.
     */
    protected function withRateLimitHeaders(JsonResponse $response, array $headers): JsonResponse
    {
        foreach ($headers as $key => $value) {
            $response->header($key, $value);
        }

        return $response;
    }

    /**
     * Response untuk operasi batch.
     */
    protected function batchResponse(
        array $results,
        string $message = 'Batch operation completed'
    ): JsonResponse {
        $successful = collect($results)->where('success', true)->count();
        $failed = collect($results)->where('success', false)->count();
        $total = count($results);

        return $this->successResponse(
            message: $message,
            data: $results,
            meta: [
                'batch_summary' => [
                    'total' => $total,
                    'successful' => $successful,
                    'failed' => $failed,
                    'success_rate' => $total > 0 ? round(($successful / $total) * 100, 2) : 0,
                ]
            ]
        );
    }

    /**
     * Response untuk file download.
     */
    protected function downloadResponse(
        string $filePath,
        ?string $fileName = null,
        array $headers = []
    ) {
        return response()->download($filePath, $fileName, $headers);
    }

    /**
     * Response untuk streaming data.
     */
    protected function streamResponse(
        callable $callback,
        int $status = 200,
        array $headers = []
    ) {
        $headers = array_merge([
            'Content-Type' => 'application/json',
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no', // Nginx
        ], $headers);

        return response()->stream($callback, $status, $headers);
    }
}
