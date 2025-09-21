<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\Organization;
use App\Models\User;
use App\Models\EmailVerificationToken;
use Carbon\Carbon;

class OrganizationRegistrationLogger
{
    /**
     * Log organization registration attempt.
     */
    public function logRegistrationAttempt(array $data, string $ipAddress, string $userAgent): void
    {
        Log::info('Organization registration attempt', [
            'event' => 'organization_registration_attempt',
            'timestamp' => now()->toISOString(),
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'organization_name' => $data['organization_name'] ?? 'N/A',
            'organization_email' => $data['organization_email'] ?? 'N/A',
            'admin_email' => $data['admin_email'] ?? 'N/A',
            'admin_username' => $data['admin_username'] ?? 'N/A',
            'business_type' => $data['business_type'] ?? 'N/A',
            'company_size' => $data['company_size'] ?? 'N/A',
            'metadata' => [
                'has_website' => !empty($data['organization_website']),
                'has_phone' => !empty($data['organization_phone']),
                'has_address' => !empty($data['organization_address']),
                'has_tax_id' => !empty($data['tax_id']),
                'marketing_consent' => $data['marketing_consent'] ?? false,
            ]
        ]);
    }

    /**
     * Log successful organization registration.
     */
    public function logRegistrationSuccess(Organization $organization, User $adminUser, array $metadata = []): void
    {
        Log::info('Organization registration successful', [
            'event' => 'organization_registration_success',
            'timestamp' => now()->toISOString(),
            'organization_id' => $organization->id,
            'organization_name' => $organization->name,
            'organization_email' => $organization->email,
            'org_code' => $organization->org_code,
            'organization_status' => $organization->status,
            'admin_user_id' => $adminUser->id,
            'admin_email' => $adminUser->email,
            'admin_username' => $adminUser->username,
            'admin_status' => $adminUser->status,
            'trial_ends_at' => $organization->trial_ends_at?->toISOString(),
            'metadata' => $metadata
        ]);
    }

    /**
     * Log organization registration failure.
     */
    public function logRegistrationFailure(array $data, string $error, string $ipAddress, array $metadata = []): void
    {
        Log::warning('Organization registration failed', [
            'event' => 'organization_registration_failure',
            'timestamp' => now()->toISOString(),
            'ip_address' => $ipAddress,
            'organization_name' => $data['organization_name'] ?? 'N/A',
            'organization_email' => $data['organization_email'] ?? 'N/A',
            'admin_email' => $data['admin_email'] ?? 'N/A',
            'error' => $error,
            'metadata' => $metadata
        ]);
    }

    /**
     * Log email verification attempt.
     */
    public function logEmailVerificationAttempt(string $token, string $ipAddress, string $userAgent): void
    {
        $verificationToken = EmailVerificationToken::where('token', $token)->first();
        
        Log::info('Email verification attempt', [
            'event' => 'email_verification_attempt',
            'timestamp' => now()->toISOString(),
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'token_id' => $verificationToken?->id,
            'email' => $verificationToken?->email,
            'token_type' => $verificationToken?->type,
            'is_expired' => $verificationToken?->isExpired(),
            'is_used' => $verificationToken?->is_used,
            'expires_at' => $verificationToken?->expires_at?->toISOString(),
        ]);
    }

    /**
     * Log successful email verification.
     */
    public function logEmailVerificationSuccess(User $user, Organization $organization, EmailVerificationToken $token): void
    {
        Log::info('Email verification successful', [
            'event' => 'email_verification_success',
            'timestamp' => now()->toISOString(),
            'user_id' => $user->id,
            'user_email' => $user->email,
            'user_status' => $user->status,
            'organization_id' => $organization->id,
            'organization_name' => $organization->name,
            'organization_status' => $organization->status,
            'token_id' => $token->id,
            'token_type' => $token->type,
            'verification_time' => now()->diffInMinutes($token->created_at),
        ]);
    }

    /**
     * Log email verification failure.
     */
    public function logEmailVerificationFailure(string $token, string $error, string $ipAddress): void
    {
        $verificationToken = EmailVerificationToken::where('token', $token)->first();
        
        Log::warning('Email verification failed', [
            'event' => 'email_verification_failure',
            'timestamp' => now()->toISOString(),
            'ip_address' => $ipAddress,
            'token_id' => $verificationToken?->id,
            'email' => $verificationToken?->email,
            'token_type' => $verificationToken?->type,
            'error' => $error,
            'is_expired' => $verificationToken?->isExpired(),
            'is_used' => $verificationToken?->is_used,
        ]);
    }

    /**
     * Log resend verification attempt.
     */
    public function logResendVerificationAttempt(string $email, string $type, string $ipAddress): void
    {
        Log::info('Resend verification attempt', [
            'event' => 'resend_verification_attempt',
            'timestamp' => now()->toISOString(),
            'ip_address' => $ipAddress,
            'email' => $email,
            'type' => $type,
        ]);
    }

    /**
     * Log resend verification success.
     */
    public function logResendVerificationSuccess(string $email, string $type, EmailVerificationToken $token): void
    {
        Log::info('Resend verification successful', [
            'event' => 'resend_verification_success',
            'timestamp' => now()->toISOString(),
            'email' => $email,
            'type' => $type,
            'token_id' => $token->id,
            'expires_at' => $token->expires_at->toISOString(),
        ]);
    }

    /**
     * Log organization approval.
     */
    public function logOrganizationApproval(Organization $organization, User $adminUser, User $approvedBy, array $metadata = []): void
    {
        Log::info('Organization approved', [
            'event' => 'organization_approved',
            'timestamp' => now()->toISOString(),
            'organization_id' => $organization->id,
            'organization_name' => $organization->name,
            'organization_email' => $organization->email,
            'org_code' => $organization->org_code,
            'admin_user_id' => $adminUser->id,
            'admin_email' => $adminUser->email,
            'approved_by' => $approvedBy->id,
            'approved_by_email' => $approvedBy->email,
            'approval_time' => now()->diffInMinutes($organization->created_at),
            'metadata' => $metadata
        ]);
    }

    /**
     * Log organization rejection.
     */
    public function logOrganizationRejection(Organization $organization, User $adminUser, User $rejectedBy, string $reason, array $metadata = []): void
    {
        Log::warning('Organization rejected', [
            'event' => 'organization_rejected',
            'timestamp' => now()->toISOString(),
            'organization_id' => $organization->id,
            'organization_name' => $organization->name,
            'organization_email' => $organization->email,
            'org_code' => $organization->org_code,
            'admin_user_id' => $adminUser->id,
            'admin_email' => $adminUser->email,
            'rejected_by' => $rejectedBy->id,
            'rejected_by_email' => $rejectedBy->email,
            'rejection_reason' => $reason,
            'rejection_time' => now()->diffInMinutes($organization->created_at),
            'metadata' => $metadata
        ]);
    }

    /**
     * Log rate limiting events.
     */
    public function logRateLimitExceeded(string $ipAddress, string $endpoint, int $attempts, int $limit): void
    {
        Log::warning('Rate limit exceeded', [
            'event' => 'rate_limit_exceeded',
            'timestamp' => now()->toISOString(),
            'ip_address' => $ipAddress,
            'endpoint' => $endpoint,
            'attempts' => $attempts,
            'limit' => $limit,
            'retry_after' => 15 * 60, // 15 minutes
        ]);
    }

    /**
     * Log security violations.
     */
    public function logSecurityViolation(string $type, string $ipAddress, array $data, string $userAgent = null): void
    {
        Log::critical('Security violation detected', [
            'event' => 'security_violation',
            'timestamp' => now()->toISOString(),
            'violation_type' => $type,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'data' => $data,
        ]);
    }

    /**
     * Get registration statistics.
     */
    public function getRegistrationStatistics(Carbon $startDate = null, Carbon $endDate = null): array
    {
        $startDate = $startDate ?? now()->subDays(30);
        $endDate = $endDate ?? now();

        $stats = [
            'period' => [
                'start' => $startDate->toISOString(),
                'end' => $endDate->toISOString(),
            ],
            'total_attempts' => $this->getLogCount('organization_registration_attempt', $startDate, $endDate),
            'successful_registrations' => $this->getLogCount('organization_registration_success', $startDate, $endDate),
            'failed_registrations' => $this->getLogCount('organization_registration_failure', $startDate, $endDate),
            'email_verifications' => $this->getLogCount('email_verification_success', $startDate, $endDate),
            'failed_verifications' => $this->getLogCount('email_verification_failure', $startDate, $endDate),
            'organizations_approved' => $this->getLogCount('organization_approved', $startDate, $endDate),
            'organizations_rejected' => $this->getLogCount('organization_rejected', $startDate, $endDate),
            'rate_limit_violations' => $this->getLogCount('rate_limit_exceeded', $startDate, $endDate),
            'security_violations' => $this->getLogCount('security_violation', $startDate, $endDate),
        ];

        // Calculate success rate
        $totalAttempts = $stats['total_attempts'];
        $successfulRegistrations = $stats['successful_registrations'];
        $stats['success_rate'] = $totalAttempts > 0 ? round(($successfulRegistrations / $totalAttempts) * 100, 2) : 0;

        // Calculate verification rate
        $totalRegistrations = $successfulRegistrations;
        $verifiedEmails = $stats['email_verifications'];
        $stats['verification_rate'] = $totalRegistrations > 0 ? round(($verifiedEmails / $totalRegistrations) * 100, 2) : 0;

        // Calculate approval rate
        $totalApprovals = $stats['organizations_approved'] + $stats['organizations_rejected'];
        $approvedOrganizations = $stats['organizations_approved'];
        $stats['approval_rate'] = $totalApprovals > 0 ? round(($approvedOrganizations / $totalApprovals) * 100, 2) : 0;

        return $stats;
    }

    /**
     * Get count of specific log events.
     */
    private function getLogCount(string $event, Carbon $startDate, Carbon $endDate): int
    {
        // This would typically query a structured logging system
        // For now, we'll return a placeholder
        return 0;
    }

    /**
     * Get recent security events.
     */
    public function getRecentSecurityEvents(int $limit = 50): array
    {
        // This would typically query a structured logging system
        // For now, we'll return a placeholder
        return [];
    }

    /**
     * Get performance metrics.
     */
    public function getPerformanceMetrics(Carbon $startDate = null, Carbon $endDate = null): array
    {
        $startDate = $startDate ?? now()->subDays(7);
        $endDate = $endDate ?? now();

        return [
            'period' => [
                'start' => $startDate->toISOString(),
                'end' => $endDate->toISOString(),
            ],
            'average_registration_time' => $this->getAverageRegistrationTime($startDate, $endDate),
            'average_verification_time' => $this->getAverageVerificationTime($startDate, $endDate),
            'average_approval_time' => $this->getAverageApprovalTime($startDate, $endDate),
            'peak_registration_hours' => $this->getPeakRegistrationHours($startDate, $endDate),
        ];
    }

    /**
     * Get average registration time.
     */
    private function getAverageRegistrationTime(Carbon $startDate, Carbon $endDate): float
    {
        // This would typically query performance metrics
        // For now, we'll return a placeholder
        return 0.0;
    }

    /**
     * Get average verification time.
     */
    private function getAverageVerificationTime(Carbon $startDate, Carbon $endDate): float
    {
        // This would typically query performance metrics
        // For now, we'll return a placeholder
        return 0.0;
    }

    /**
     * Get average approval time.
     */
    private function getAverageApprovalTime(Carbon $startDate, Carbon $endDate): float
    {
        // This would typically query performance metrics
        // For now, we'll return a placeholder
        return 0.0;
    }

    /**
     * Get peak registration hours.
     */
    private function getPeakRegistrationHours(Carbon $startDate, Carbon $endDate): array
    {
        // This would typically query performance metrics
        // For now, we'll return a placeholder
        return [];
    }
}
