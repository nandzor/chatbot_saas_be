<?php

namespace App\Exceptions;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Responses\ApiResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\QueryException;
use Tymon\JWTAuth\Exceptions\JWTException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Auth\Access\AuthorizationException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

class ApiExceptionHandler
{
    /**
     * Handle API exceptions and return standardized JSON response.
     */
    public static function handle(\Throwable $exception, Request $request): JsonResponse
    {
        // Log the exception
        self::logException($exception, $request);

        // Handle specific exception types
        return match (true) {
            $exception instanceof ValidationException => self::handleValidationException($exception),
            $exception instanceof AuthenticationException => self::handleAuthenticationException($exception),
            $exception instanceof AuthorizationException => self::handleAuthorizationException($exception),
            $exception instanceof ModelNotFoundException => self::handleModelNotFoundException($exception),
            $exception instanceof NotFoundHttpException => self::handleNotFoundHttpException($exception),
            $exception instanceof TooManyRequestsHttpException => self::handleTooManyRequestsException($exception),
            $exception instanceof TokenExpiredException => self::handleTokenExpiredException($exception),
            $exception instanceof TokenInvalidException => self::handleTokenInvalidException($exception),
            $exception instanceof JWTException => self::handleJWTException($exception),
            $exception instanceof QueryException => self::handleQueryException($exception),
            $exception instanceof HttpException => self::handleHttpException($exception),
            default => self::handleGenericException($exception),
        };
    }

    /**
     * Handle validation exceptions.
     */
    private static function handleValidationException(ValidationException $exception): JsonResponse
    {
        return ApiResponse::validationError(
            errors: $exception->errors(),
            message: 'Validation failed. Please check your input and try again.'
        );
    }

    /**
     * Handle authentication exceptions.
     */
    private static function handleAuthenticationException(AuthenticationException $exception): JsonResponse
    {
        return ApiResponse::unauthorized(
            message: 'Authentication required. Please provide valid credentials.',
            errorCode: ApiResponse::ERROR_CODES['UNAUTHORIZED']
        );
    }

    /**
     * Handle authorization exceptions.
     */
    private static function handleAuthorizationException(AuthorizationException $exception): JsonResponse
    {
        return ApiResponse::forbidden(
            message: 'You do not have permission to perform this action.'
        );
    }

    /**
     * Handle model not found exceptions.
     */
    private static function handleModelNotFoundException(ModelNotFoundException $exception): JsonResponse
    {
        $model = class_basename($exception->getModel());
        $identifier = implode(', ', $exception->getIds());

        return ApiResponse::notFound(
            resource: $model,
            identifier: $identifier
        );
    }

    /**
     * Handle not found HTTP exceptions.
     */
    private static function handleNotFoundHttpException(NotFoundHttpException $exception): JsonResponse
    {
        return ApiResponse::notFound(
            resource: 'Endpoint',
            identifier: request()->getPathInfo()
        );
    }

    /**
     * Handle too many requests exceptions.
     */
    private static function handleTooManyRequestsException(TooManyRequestsHttpException $exception): JsonResponse
    {
        $retryAfter = $exception->getHeaders()['Retry-After'] ?? null;

        return ApiResponse::rateLimitExceeded(
            message: 'Too many requests. Please try again later.',
            meta: $retryAfter ? ['retry_after' => $retryAfter] : []
        );
    }

    /**
     * Handle JWT token expired exceptions.
     */
    private static function handleTokenExpiredException(TokenExpiredException $exception): JsonResponse
    {
        return ApiResponse::unauthorized(
            message: 'Your session has expired. Please login again.',
            errorCode: ApiResponse::ERROR_CODES['TOKEN_EXPIRED']
        );
    }

    /**
     * Handle JWT token invalid exceptions.
     */
    private static function handleTokenInvalidException(TokenInvalidException $exception): JsonResponse
    {
        return ApiResponse::unauthorized(
            message: 'Invalid authentication token. Please login again.',
            errorCode: ApiResponse::ERROR_CODES['TOKEN_INVALID']
        );
    }

    /**
     * Handle general JWT exceptions.
     */
    private static function handleJWTException(JWTException $exception): JsonResponse
    {
        return ApiResponse::unauthorized(
            message: 'Authentication token error. Please login again.',
            errorCode: ApiResponse::ERROR_CODES['TOKEN_INVALID']
        );
    }

    /**
     * Handle database query exceptions.
     */
    private static function handleQueryException(QueryException $exception): JsonResponse
    {
        // Don't expose SQL details in production
        $message = app()->environment('production')
            ? 'A database error occurred. Please try again later.'
            : 'Database error: ' . $exception->getMessage();

        return ApiResponse::serverError(
            message: $message,
            details: app()->environment('production') ? null : [
                'sql' => $exception->getSql(),
                'bindings' => $exception->getBindings(),
            ]
        );
    }

    /**
     * Handle HTTP exceptions.
     */
    private static function handleHttpException(HttpException $exception): JsonResponse
    {
        $statusCode = $exception->getStatusCode();
        $message = $exception->getMessage() ?: Response::$statusTexts[$statusCode] ?? 'HTTP Error';

        return ApiResponse::error(
            message: $message,
            statusCode: $statusCode,
            errorCode: self::getErrorCodeForStatusCode($statusCode)
        );
    }

    /**
     * Handle generic exceptions.
     */
    private static function handleGenericException(\Throwable $exception): JsonResponse
    {
        // Don't expose internal errors in production
        $message = app()->environment('production')
            ? 'An unexpected error occurred. Please try again later.'
            : $exception->getMessage();

        $details = app()->environment('production') ? null : [
            'exception' => get_class($exception),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString(),
        ];

        return ApiResponse::serverError(
            message: $message,
            details: $details
        );
    }

    /**
     * Log the exception with context.
     */
    private static function logException(\Throwable $exception, Request $request): void
    {
        $context = [
            'exception' => get_class($exception),
            'message' => $exception->getMessage(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'user_id' => self::getUserId(),
            'request_id' => $request->header('X-Request-ID'),
        ];

        // Add request data for debugging (sanitize sensitive data)
        if (!app()->environment('production')) {
            $context['request_data'] = self::sanitizeRequestData($request->all());
        }

        // Log based on exception severity
        if ($exception instanceof HttpException && $exception->getStatusCode() < 500) {
            Log::warning('API Client Error', $context);
        } else {
            Log::error('API Server Error', $context);
        }
    }

    /**
     * Get user ID safely, handling cases where Auth facade is not available.
     */
    private static function getUserId(): ?string
    {
        try {
            return Auth::user()?->id ?? null;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Sanitize request data to remove sensitive information.
     */
    private static function sanitizeRequestData(array $data): array
    {
        $sensitiveKeys = [
            'password',
            'password_confirmation',
            'token',
            'api_key',
            'secret',
            'private_key',
            'card_number',
            'cvv',
            'ssn',
        ];

        foreach ($sensitiveKeys as $key) {
            if (isset($data[$key])) {
                $data[$key] = '[REDACTED]';
            }
        }

        return $data;
    }

    /**
     * Get error code for HTTP status code.
     */
    private static function getErrorCodeForStatusCode(int $statusCode): string
    {
        return match ($statusCode) {
            400 => ApiResponse::ERROR_CODES['VALIDATION_ERROR'],
            401 => ApiResponse::ERROR_CODES['UNAUTHORIZED'],
            403 => ApiResponse::ERROR_CODES['FORBIDDEN'],
            404 => ApiResponse::ERROR_CODES['RESOURCE_NOT_FOUND'],
            409 => ApiResponse::ERROR_CODES['RESOURCE_CONFLICT'],
            429 => ApiResponse::ERROR_CODES['RATE_LIMIT_EXCEEDED'],
            500 => ApiResponse::ERROR_CODES['INTERNAL_SERVER_ERROR'],
            503 => ApiResponse::ERROR_CODES['SERVICE_UNAVAILABLE'],
            default => ApiResponse::ERROR_CODES['INTERNAL_SERVER_ERROR'],
        };
    }

    /**
     * Check if request is API request.
     */
    public static function isApiRequest(Request $request): bool
    {
        return $request->is('api/*') ||
               $request->expectsJson() ||
               $request->header('Accept') === 'application/json';
    }
}
