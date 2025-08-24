<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class InvalidPermissionException extends Exception
{
    /**
     * The exception message.
     */
    protected $message = 'Invalid permission operation.';

    /**
     * The exception code.
     */
    protected $code = 422;

    /**
     * Report the exception.
     */
    public function report(): void
    {
        // Log the exception details
        Log::warning('Invalid permission operation', [
            'message' => $this->getMessage(),
            'code' => $this->getCode(),
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
                'error_code' => 'INVALID_PERMISSION',
                'status_code' => $this->getCode(),
            ], $this->getCode());
        }

        return response()->view('errors.permission', [
            'message' => $this->getMessage(),
            'code' => $this->getCode(),
        ], $this->getCode());
    }
}
