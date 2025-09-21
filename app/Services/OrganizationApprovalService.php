<?php

namespace App\Services;

use App\Models\Organization;
use App\Models\User;
use App\Models\EmailVerificationToken;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OrganizationApprovalService
{
    protected OrganizationAuditService $auditService;

    public function __construct(OrganizationAuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    /**
     * Get organizations pending approval.
     */
    public function getPendingOrganizations(array $filters = []): \Illuminate\Pagination\LengthAwarePaginator
    {
        $query = Organization::where('status', 'pending_approval')
            ->with(['users' => function ($query) {
                $query->where('role', 'org_admin');
            }]);

        // Apply filters
        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('org_code', 'like', "%{$search}%");
            });
        }

        if (isset($filters['business_type'])) {
            $query->where('business_type', $filters['business_type']);
        }

        if (isset($filters['company_size'])) {
            $query->where('company_size', $filters['company_size']);
        }

        if (isset($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query->orderBy('created_at', 'desc')
            ->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Approve organization.
     */
    public function approveOrganization(string $organizationId, ?string $approvedBy = null, ?string $notes = null): array
    {
        try {
            DB::beginTransaction();

            $organization = Organization::findOrFail($organizationId);

            if ($organization->status !== 'pending_approval') {
                return [
                    'success' => false,
                    'message' => 'Organization is not pending approval.',
                ];
            }

            // Update organization status
            $organization->update([
                'status' => 'active',
                'api_enabled' => true,
                'webhook_enabled' => true,
            ]);

            // Activate admin user
            $adminUser = $organization->users()
                ->where('role', 'org_admin')
                ->first();

            if ($adminUser) {
                $adminUser->update([
                    'status' => 'active',
                    'is_email_verified' => true,
                ]);
            }

            // Log approval activity
            $this->auditService->logAction(
                $organization->id,
                'organization_approved',
                $approvedBy,
                'organization',
                $organization->id,
                ['status' => 'pending_approval'],
                ['status' => 'active'],
                [
                    'approved_by' => $approvedBy,
                    'notes' => $notes,
                    'admin_user_id' => $adminUser?->id,
                ]
            );

            // Send approval notification email
            if ($adminUser) {
                $this->sendApprovalNotification($adminUser, $organization);
            }

            DB::commit();

            Log::info('Organization approved', [
                'organization_id' => $organization->id,
                'organization_name' => $organization->name,
                'approved_by' => $approvedBy,
                'admin_user_id' => $adminUser?->id,
            ]);

            return [
                'success' => true,
                'message' => 'Organization approved successfully.',
                'data' => [
                    'organization' => [
                        'id' => $organization->id,
                        'name' => $organization->name,
                        'org_code' => $organization->org_code,
                        'status' => $organization->status,
                        'email' => $organization->email,
                    ],
                    'admin_user' => $adminUser ? [
                        'id' => $adminUser->id,
                        'email' => $adminUser->email,
                        'full_name' => $adminUser->full_name,
                        'status' => $adminUser->status,
                    ] : null,
                ],
            ];

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to approve organization', [
                'organization_id' => $organizationId,
                'approved_by' => $approvedBy,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to approve organization.',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Reject organization.
     */
    public function rejectOrganization(string $organizationId, string $reason, ?string $rejectedBy = null): array
    {
        try {
            DB::beginTransaction();

            $organization = Organization::findOrFail($organizationId);

            if ($organization->status !== 'pending_approval') {
                return [
                    'success' => false,
                    'message' => 'Organization is not pending approval.',
                ];
            }

            // Update organization status
            $organization->update([
                'status' => 'rejected',
            ]);

            // Get admin user
            $adminUser = $organization->users()
                ->where('role', 'org_admin')
                ->first();

            // Log rejection activity
            $this->auditService->logAction(
                $organization->id,
                'organization_rejected',
                $rejectedBy,
                'organization',
                $organization->id,
                ['status' => 'pending_approval'],
                ['status' => 'rejected'],
                [
                    'rejected_by' => $rejectedBy,
                    'reason' => $reason,
                    'admin_user_id' => $adminUser?->id,
                ]
            );

            // Send rejection notification email
            if ($adminUser) {
                $this->sendRejectionNotification($adminUser, $organization, $reason);
            }

            DB::commit();

            Log::info('Organization rejected', [
                'organization_id' => $organization->id,
                'organization_name' => $organization->name,
                'rejected_by' => $rejectedBy,
                'reason' => $reason,
                'admin_user_id' => $adminUser?->id,
            ]);

            return [
                'success' => true,
                'message' => 'Organization rejected successfully.',
                'data' => [
                    'organization' => [
                        'id' => $organization->id,
                        'name' => $organization->name,
                        'org_code' => $organization->org_code,
                        'status' => $organization->status,
                    ],
                ],
            ];

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to reject organization', [
                'organization_id' => $organizationId,
                'rejected_by' => $rejectedBy,
                'reason' => $reason,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to reject organization.',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get organization approval statistics.
     */
    public function getApprovalStatistics(): array
    {
        try {
            $stats = [
                'pending' => Organization::where('status', 'pending_approval')->count(),
                'approved' => Organization::where('status', 'active')->count(),
                'rejected' => Organization::where('status', 'rejected')->count(),
                'total' => Organization::count(),
            ];

            // Calculate approval rate
            $totalProcessed = $stats['approved'] + $stats['rejected'];
            $stats['approval_rate'] = $totalProcessed > 0 ? round(($stats['approved'] / $totalProcessed) * 100, 2) : 0;

            // Get recent approvals (last 30 days)
            $stats['recent_approvals'] = Organization::where('status', 'active')
                ->where('updated_at', '>=', now()->subDays(30))
                ->count();

            // Get pending by business type
            $stats['pending_by_type'] = Organization::where('status', 'pending_approval')
                ->selectRaw('business_type, COUNT(*) as count')
                ->groupBy('business_type')
                ->get()
                ->pluck('count', 'business_type')
                ->toArray();

            return $stats;

        } catch (\Exception $e) {
            Log::error('Failed to get approval statistics', [
                'error' => $e->getMessage(),
            ]);

            return [
                'pending' => 0,
                'approved' => 0,
                'rejected' => 0,
                'total' => 0,
                'approval_rate' => 0,
                'recent_approvals' => 0,
                'pending_by_type' => [],
            ];
        }
    }

    /**
     * Send approval notification email.
     */
    private function sendApprovalNotification(User $adminUser, Organization $organization): bool
    {
        try {
            Mail::to($adminUser->email)->send(new \App\Mail\OrganizationApprovedMail($adminUser, $organization));

            Log::info('Organization approval notification sent', [
                'user_id' => $adminUser->id,
                'organization_id' => $organization->id,
                'email' => $adminUser->email,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send organization approval notification', [
                'user_id' => $adminUser->id,
                'organization_id' => $organization->id,
                'email' => $adminUser->email,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Send rejection notification email.
     */
    private function sendRejectionNotification(User $adminUser, Organization $organization, string $reason): bool
    {
        try {
            Mail::to($adminUser->email)->send(new \App\Mail\OrganizationRejectedMail($adminUser, $organization, $reason));

            Log::info('Organization rejection notification sent', [
                'user_id' => $adminUser->id,
                'organization_id' => $organization->id,
                'email' => $adminUser->email,
                'reason' => $reason,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send organization rejection notification', [
                'user_id' => $adminUser->id,
                'organization_id' => $organization->id,
                'email' => $adminUser->email,
                'reason' => $reason,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }
}
