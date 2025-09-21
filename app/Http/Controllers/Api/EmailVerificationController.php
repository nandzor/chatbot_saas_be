<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\EmailVerificationService;
use App\Services\OrganizationRegistrationLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EmailVerificationController extends BaseApiController
{
    protected EmailVerificationService $emailVerificationService;
    protected OrganizationRegistrationLogger $logger;

    public function __construct(
        EmailVerificationService $emailVerificationService,
        OrganizationRegistrationLogger $logger
    ) {
        $this->emailVerificationService = $emailVerificationService;
        $this->logger = $logger;
    }


    /**
     * Verify organization email.
     */
    public function verifyOrganizationEmail(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'token' => 'required|string',
            ]);

            // Log verification attempt
            $this->logger->logEmailVerificationAttempt($request->token, $request->ip(), $request->userAgent());

            $result = $this->emailVerificationService->verifyOrganizationEmail($request->token);

            if ($result['success']) {
                return $this->successResponse(
                    $result['message'],
                    $result['data'],
                    200
                );
            }

            return $this->errorResponse(
                $result['message'],
                [],
                400
            );

        } catch (\Exception $e) {
            Log::error('Organization email verification error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Organization email verification failed',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Resend email verification.
     */
    public function resendVerification(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'type' => 'sometimes|string|in:organization_verification',
            ]);

            $type = $request->input('type', 'organization_verification');
            
            // Log resend attempt
            $this->logger->logResendVerificationAttempt($request->email, $type, $request->ip());
            
            $result = $this->emailVerificationService->resendEmailVerification($request->email, $type);

            if ($result['success']) {
                return $this->successResponse(
                    $result['message'],
                    [],
                    200
                );
            }

            return $this->errorResponse(
                $result['message'],
                [],
                400
            );

        } catch (\Exception $e) {
            Log::error('Resend email verification error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to resend verification email',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }
}
