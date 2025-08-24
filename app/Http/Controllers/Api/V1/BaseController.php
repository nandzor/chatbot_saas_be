<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

abstract class BaseController extends Controller
{
    /**
     * Success response with data
     */
    protected function successResponse(
        string $message = 'Success',
        mixed $data = null,
        int $statusCode = Response::HTTP_OK,
        array $meta = []
    ): JsonResponse {
        $response = [
            'success' => true,
            'message' => $message,
            'timestamp' => now()->toISOString(),
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        if (!empty($meta)) {
            $response['meta'] = $meta;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Error response with consistent format
     */
    protected function errorResponse(
        string $message = 'Error',
        mixed $detail = null,
        int $statusCode = Response::HTTP_BAD_REQUEST,
        array $errors = []
    ): JsonResponse {
        $response = [
            'success' => false,
            'message' => $message,
            'timestamp' => now()->toISOString(),
        ];

        if ($detail !== null) {
            $response['detail'] = $detail;
        }

        if (!empty($errors)) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Not found response
     */
    protected function notFoundResponse(
        string $message = 'Resource not found',
        mixed $detail = null
    ): JsonResponse {
        return $this->errorResponse($message, $detail, Response::HTTP_NOT_FOUND);
    }

    /**
     * Unauthorized response
     */
    protected function unauthorizedResponse(
        string $message = 'Unauthorized access',
        mixed $detail = null
    ): JsonResponse {
        return $this->errorResponse($message, $detail, Response::HTTP_UNAUTHORIZED);
    }

    /**
     * Forbidden response
     */
    protected function forbiddenResponse(
        string $message = 'Access forbidden',
        mixed $detail = null
    ): JsonResponse {
        return $this->errorResponse($message, $detail, Response::HTTP_FORBIDDEN);
    }

    /**
     * Validation error response
     */
    protected function validationErrorResponse(
        ValidationException $exception
    ): JsonResponse {
        return $this->errorResponse(
            'Validation failed',
            $exception->errors(),
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }

    /**
     * Server error response
     */
    protected function serverErrorResponse(
        string $message = 'Internal server error',
        mixed $detail = null
    ): JsonResponse {
        return $this->errorResponse($message, $detail, Response::HTTP_INTERNAL_SERVER_ERROR);
    }

    /**
     * Created response
     */
    protected function createdResponse(
        string $message = 'Resource created successfully',
        mixed $data = null
    ): JsonResponse {
        return $this->successResponse($message, $data, Response::HTTP_CREATED);
    }

    /**
     * Updated response
     */
    protected function updatedResponse(
        string $message = 'Resource updated successfully',
        mixed $data = null
    ): JsonResponse {
        return $this->successResponse($message, $data, Response::HTTP_OK);
    }

    /**
     * Deleted response
     */
    protected function deletedResponse(
        string $message = 'Resource deleted successfully'
    ): JsonResponse {
        return $this->successResponse($message, null, Response::HTTP_OK);
    }

    /**
     * Paginated response with metadata
     */
    protected function paginatedResponse(
        string $message = 'Data retrieved successfully',
        mixed $data = null,
        array $pagination = []
    ): JsonResponse {
        $meta = [
            'pagination' => $pagination,
            'timestamp' => now()->toISOString(),
        ];

        return $this->successResponse($message, $data, Response::HTTP_OK, $meta);
    }

    /**
     * Log error with context
     */
    protected function logError(
        string $message,
        \Throwable $exception,
        array $context = []
    ): void {
        $context = array_merge($context, [
            'exception' => $exception->getMessage(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString(),
        ]);

        Log::error($message, $context);
    }

    /**
     * Handle exceptions consistently
     */
    protected function handleException(
        \Throwable $exception,
        string $operation = 'operation',
        array $context = []
    ): JsonResponse {
        $this->logError("Error during {$operation}", $exception, $context);

        if ($exception instanceof ValidationException) {
            return $this->validationErrorResponse($exception);
        }

        if (config('app.debug')) {
            return $this->serverErrorResponse(
                'An error occurred',
                $exception->getMessage()
            );
        }

        return $this->serverErrorResponse('An unexpected error occurred');
    }

    /**
     * Get pagination parameters from request
     */
    protected function getPaginationParams(Request $request): array
    {
        return [
            'page' => (int) $request->get('page', 1),
            'per_page' => (int) $request->get('per_page', 15),
            'sort_by' => $request->get('sort_by', 'created_at'),
            'sort_order' => $request->get('sort_order', 'desc'),
        ];
    }

    /**
     * Get filter parameters from request
     */
    protected function getFilterParams(Request $request, array $allowedFilters = []): array
    {
        if (empty($allowedFilters)) {
            return $request->only(['search', 'status', 'category', 'is_active']);
        }

        return $request->only($allowedFilters);
    }

    /**
     * Validate pagination parameters
     */
    protected function validatePaginationParams(array $params): array
    {
        return [
            'page' => max(1, $params['page'] ?? 1),
            'per_page' => min(100, max(1, $params['per_page'] ?? 15)),
            'sort_by' => $params['sort_by'] ?? 'created_at',
            'sort_order' => in_array($params['sort_order'] ?? 'desc', ['asc', 'desc'])
                ? $params['sort_order']
                : 'desc',
        ];
    }
}
