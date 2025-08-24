<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class PermissionDeniedException extends Exception
{
    /**
     * The exception message.
     */
    protected $message = 'Access denied. You do not have permission to perform this action.';

    /**
     * The exception code.
     */
    protected $code = 403;

    /**
     * The resource that was accessed.
     */
    protected string $resource;

    /**
     * The action that was attempted.
     */
    protected string $action;

    /**
     * The scope of the permission.
     */
    protected string $scope;

    /**
     * Create a new exception instance.
     */
    public function __construct(string $message = '', int $code = 0, ?Exception $previous = null, string $resource = '', string $action = '', string $scope = 'organization')
    {
        $this->resource = $resource;
        $this->action = $action;
        $this->scope = $scope;

        parent::__construct($message, $code, $previous);
    }

    /**
     * Report the exception.
     */
    public function report(): void
    {
        // Log the permission denial
        Log::warning('Permission denied', [
            'message' => $this->getMessage(),
            'code' => $this->getCode(),
            'resource' => $this->resource,
            'action' => $this->action,
            'scope' => $this->scope,
            'file' => $this->getFile(),
            'line' => $this->getLine(),
        ]);
    }

    /**
     * Render the exception into an HTTP response.
     */
    public function render(Request $request): Response|JsonResponse
    {
        if ($request->expectsJson()) {
            return response()->json([
                'success' => false,
                'message' => $this->getMessage(),
                'error_code' => 'PERMISSION_DENIED',
                'details' => [
                    'resource' => $this->resource,
                    'action' => $this->action,
                    'scope' => $this->scope,
                    'required_permission' => "{$this->resource}.{$this->action}",
                ],
                'status_code' => $this->getCode(),
            ], $this->getCode());
        }

        return response()->view('errors.permission-denied', [
            'message' => $this->getMessage(),
            'resource' => $this->resource,
            'action' => $this->action,
            'scope' => $this->scope,
            'code' => $this->getCode(),
        ], $this->getCode());
    }

    /**
     * Get the resource that was accessed.
     */
    public function getResource(): string
    {
        return $this->resource;
    }

    /**
     * Get the action that was attempted.
     */
    public function getAction(): string
    {
        return $this->action;
    }

    /**
     * Get the scope of the permission.
     */
    public function getScope(): string
    {
        return $this->scope;
    }
}
