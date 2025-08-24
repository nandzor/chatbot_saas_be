<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

abstract class BaseController extends Controller
{
    /**
     * Default per page value for pagination.
     */
    protected int $defaultPerPage = 15;

    /**
     * Maximum per page value for pagination.
     */
    protected int $maxPerPage = 100;

    /**
     * Return a successful response.
     */
    protected function successResponse(
        mixed $data = null,
        string $message = 'Success',
        int $statusCode = Response::HTTP_OK
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }

    /**
     * Return an error response.
     */
    protected function errorResponse(
        string $message = 'Error',
        mixed $detail = null,
        int $statusCode = Response::HTTP_BAD_REQUEST
    ): JsonResponse {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($detail) {
            $response['detail'] = $detail;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Return an error response with debug information.
     */
    protected function errorResponseWithDebug(
        string $message = 'Error',
        int $statusCode = Response::HTTP_BAD_REQUEST,
        mixed $errors = null,
        ?\Exception $exception = null
    ): JsonResponse {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors) {
            $response['errors'] = $errors;
        }

        // Add debug information in development environment
        if (config('app.debug') && $exception) {
            $response['debug'] = [
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'trace' => $exception->getTraceAsString(),
            ];
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Return a paginated response.
     */
    protected function paginatedResponse(
        $paginatedData,
        string $message = 'Success'
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $paginatedData->items(),
            'pagination' => [
                'current_page' => $paginatedData->currentPage(),
                'last_page' => $paginatedData->lastPage(),
                'per_page' => $paginatedData->perPage(),
                'total' => $paginatedData->total(),
                'from' => $paginatedData->firstItem(),
                'to' => $paginatedData->lastItem(),
                'has_more_pages' => $paginatedData->hasMorePages(),
            ],
        ]);
    }

    /**
     * Return a not found response.
     */
    protected function notFoundResponse(string $message = 'Resource not found'): JsonResponse
    {
        return $this->errorResponse($message, null, Response::HTTP_NOT_FOUND);
    }

    /**
     * Return an unauthorized response.
     */
    protected function unauthorizedResponse(string $message = 'Unauthorized'): JsonResponse
    {
        return $this->errorResponse($message, null, Response::HTTP_UNAUTHORIZED);
    }

    /**
     * Return a forbidden response.
     */
    protected function forbiddenResponse(string $message = 'Forbidden'): JsonResponse
    {
        return $this->errorResponse($message, null, Response::HTTP_FORBIDDEN);
    }

    /**
     * Return a validation error response.
     */
    protected function validationErrorResponse(
        array $errors,
        string $message = 'Validation failed'
    ): JsonResponse {
        return $this->errorResponse($message, $errors, Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    /**
     * Return a server error response.
     */
    protected function serverErrorResponse(string $message = 'Internal server error'): JsonResponse
    {
        return $this->errorResponse($message, null, Response::HTTP_INTERNAL_SERVER_ERROR);
    }

    /**
     * Get the per page value from request.
     */
    protected function getPerPage(Request $request): int
    {
        $perPage = (int) $request->get('per_page', $this->defaultPerPage);

        return min($perPage, $this->maxPerPage);
    }

    /**
     * Transform data using a resource.
     */
    protected function transformData(mixed $data, string $resourceClass): mixed
    {
        if (is_null($data)) {
            return null;
        }

        return new $resourceClass($data);
    }

    /**
     * Transform collection using a resource.
     */
    protected function transformCollection(mixed $collection, string $resourceClass): mixed
    {
        if (is_null($collection) || $collection->isEmpty()) {
            return [];
        }

        return $resourceClass::collection($collection);
    }
}
