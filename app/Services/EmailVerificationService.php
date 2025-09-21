<?php

namespace App\Services;

use App\Models\EmailVerificationToken;
use App\Models\User;
use App\Models\Organization;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Services\OrganizationRegistrationLogger;

class EmailVerificationService
{
    protected OrganizationRegistrationLogger $logger;

    public function __construct(OrganizationRegistrationLogger $logger)
    {
        $this->logger = $logger;
    }

    /**
     * Send email verification for organization registration.
     */
    public function sendOrganizationEmailVerification(User $adminUser, Organization $organization): bool
    {
        try {
            $token = EmailVerificationToken::generateToken(
                $adminUser->email,
                'organization_verification',
                $adminUser->id,
                $organization->id
            );

            // Send verification email
            Mail::to($adminUser->email)->send(new \App\Mail\OrganizationEmailVerificationMail($adminUser, $organization, $token));

            Log::info('Organization email verification sent', [
                'user_id' => $adminUser->id,
                'organization_id' => $organization->id,
                'email' => $adminUser->email,
                'token_id' => $token->id,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send organization email verification', [
                'user_id' => $adminUser->id,
                'organization_id' => $organization->id,
                'email' => $adminUser->email,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }


    /**
     * Verify organization email.
     */
    public function verifyOrganizationEmail(string $token): array
    {
        try {
            $verificationToken = EmailVerificationToken::findValidToken($token, 'organization_verification');

            if (!$verificationToken) {
                return [
                    'success' => false,
                    'message' => 'Invalid or expired verification token.',
                ];
            }

            DB::beginTransaction();

            // Mark token as used
            $verificationToken->markAsUsed();

            // Update user email verification status
            $user = User::find($verificationToken->user_id);
            $organization = Organization::find($verificationToken->organization_id);

            if ($user && $organization) {
                $user->update([
                    'is_email_verified' => true,
                    'status' => 'active', // Activate user after email verification
                ]);

                // Update organization status to active (assuming admin approval is not required)
                $organization->update([
                    'status' => 'active',
                ]);

                // Log successful verification
                $this->logger->logEmailVerificationSuccess($user, $organization, $verificationToken);

                Log::info('Organization email verified', [
                    'user_id' => $user->id,
                    'organization_id' => $organization->id,
                    'email' => $user->email,
                    'token_id' => $verificationToken->id,
                ]);

                DB::commit();

                return [
                    'success' => true,
                    'message' => 'Organization email verified successfully.',
                    'data' => [
                        'user' => [
                            'id' => $user->id,
                            'email' => $user->email,
                            'full_name' => $user->full_name,
                            'is_email_verified' => true,
                            'status' => $user->status,
                        ],
                        'organization' => [
                            'id' => $organization->id,
                            'name' => $organization->name,
                            'org_code' => $organization->org_code,
                            'status' => $organization->status,
                        ],
                    ],
                ];
            }

            DB::rollBack();

            return [
                'success' => false,
                'message' => 'User or organization not found.',
            ];

        } catch (\Exception $e) {
            DB::rollBack();

            // Log verification failure
            $this->logger->logEmailVerificationFailure($token, $e->getMessage(), request()->ip());

            Log::error('Failed to verify organization email', [
                'token' => $token,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Organization email verification failed. Please try again.',
            ];
        }
    }

    /**
     * Resend email verification.
     */
    public function resendEmailVerification(string $email, string $type = 'organization_verification'): array
    {
        try {
            // Find user by email
            $user = User::where('email', $email)->first();

            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'User not found.',
                ];
            }

            // Check if email is already verified
            if ($user->is_email_verified) {
                return [
                    'success' => false,
                    'message' => 'Email is already verified.',
                ];
            }

            // Send verification email (only organization verification supported)
            if ($type === 'organization_verification') {
                $organization = $user->organization;
                if ($organization) {
                    $success = $this->sendOrganizationEmailVerification($user, $organization);
                } else {
                    return [
                        'success' => false,
                        'message' => 'Organization not found.',
                    ];
                }
            } else {
                return [
                    'success' => false,
                    'message' => 'Only organization verification is supported.',
                ];
            }

            if ($success) {
                return [
                    'success' => true,
                    'message' => 'Verification email sent successfully.',
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to send verification email.',
            ];

        } catch (\Exception $e) {
            Log::error('Failed to resend email verification', [
                'email' => $email,
                'type' => $type,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to resend verification email.',
            ];
        }
    }

    /**
     * Clean up expired tokens.
     */
    public function cleanupExpiredTokens(): int
    {
        try {
            $deletedCount = EmailVerificationToken::where('expires_at', '<', now())
                ->orWhere('is_used', true)
                ->delete();

            Log::info('Expired email verification tokens cleaned up', [
                'deleted_count' => $deletedCount,
            ]);

            return $deletedCount;
        } catch (\Exception $e) {
            Log::error('Failed to cleanup expired tokens', [
                'error' => $e->getMessage(),
            ]);

            return 0;
        }
    }
}
