<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\OrganizationApprovalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class OrganizationApprovalController extends BaseApiController
{
    protected OrganizationApprovalService $approvalService;

    public function __construct(OrganizationApprovalService $approvalService)
    {
        $this->approvalService = $approvalService;
    }

    /**
     * Get organizations pending approval.
     */
    public function getPendingOrganizations(Request $request): JsonResponse
    {
        try {
            $filters = $request->only([
                'search',
                'business_type',
                'company_size',
                'date_from',
                'date_to',
                'per_page'
            ]);

            $organizations = $this->approvalService->getPendingOrganizations($filters);

            return $this->successResponse(
                'Pending organizations retrieved successfully',
                $organizations,
                200
            );

        } catch (\Exception $e) {
            Log::error('Failed to get pending organizations: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to retrieve pending organizations',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Approve organization.
     */
    public function approveOrganization(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'notes' => 'sometimes|nullable|string|max:1000',
            ]);

            $approvedBy = $request->user()?->id;
            $notes = $request->input('notes');

            $result = $this->approvalService->approveOrganization($id, $approvedBy, $notes);

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
            Log::error('Failed to approve organization: ' . $e->getMessage(), [
                'organization_id' => $id,
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to approve organization',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Reject organization.
     */
    public function rejectOrganization(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'reason' => 'required|string|max:1000',
            ]);

            $rejectedBy = $request->user()?->id;
            $reason = $request->input('reason');

            $result = $this->approvalService->rejectOrganization($id, $reason, $rejectedBy);

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
            Log::error('Failed to reject organization: ' . $e->getMessage(), [
                'organization_id' => $id,
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to reject organization',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Get approval statistics.
     */
    public function getApprovalStatistics(): JsonResponse
    {
        try {
            $statistics = $this->approvalService->getApprovalStatistics();

            return $this->successResponse(
                'Approval statistics retrieved successfully',
                $statistics,
                200
            );

        } catch (\Exception $e) {
            Log::error('Failed to get approval statistics: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to retrieve approval statistics',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }
}
