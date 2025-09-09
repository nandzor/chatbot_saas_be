<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\OrganizationAuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganizationAuditController extends BaseApiController
{
    protected OrganizationAuditService $auditService;

    public function __construct(OrganizationAuditService $auditService)
    {
        parent::__construct();
        $this->auditService = $auditService;
    }

    /**
     * Get audit logs for organization
     */
    public function index(Request $request, $organizationId): JsonResponse
    {
        try {
            $filters = $request->only([
                'action', 'resource_type', 'user_id', 'start_date', 'end_date'
            ]);

            $logs = $this->auditService->getAuditLogs(
                $organizationId,
                $filters['action'] ?? null,
                $filters['resource_type'] ?? null,
                $filters['user_id'] ?? null,
                $filters['start_date'] ?? null,
                $filters['end_date'] ?? null,
                $request->get('limit', 50),
                $request->get('offset', 0)
            );

            return $this->successResponse(
                'Audit logs retrieved successfully',
                $logs
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                message: 'Failed to retrieve audit logs',
                statusCode: 500,
                errors: $e->getMessage(),
                exception: $e
            );
        }
    }

    /**
     * Get audit log statistics
     */
    public function statistics(Request $request, $organizationId): JsonResponse
    {
        try {
            $filters = $request->only(['start_date', 'end_date']);

            $stats = $this->auditService->getAuditLogStatistics(
                $organizationId,
                $filters['start_date'] ?? null,
                $filters['end_date'] ?? null
            );

            return $this->successResponse(
                'Audit log statistics retrieved successfully',
                $stats
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                message: 'Failed to retrieve audit log statistics',
                statusCode: 500,
                errors: $e->getMessage(),
                exception: $e
            );
        }
    }

    /**
     * Get specific audit log
     */
    public function show($organizationId, $auditLogId): JsonResponse
    {
        try {
            $auditLog = \App\Models\OrganizationAuditLog::where('organization_id', $organizationId)
                ->where('id', $auditLogId)
                ->with(['user', 'organization'])
                ->first();

            if (!$auditLog) {
                return $this->errorResponse(
                    'Audit log not found',
                    404
                );
            }

            return $this->successResponse(
                'Audit log retrieved successfully',
                $auditLog
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithDebug(
                message: 'Failed to retrieve audit log',
                statusCode: 500,
                errors: $e->getMessage(),
                exception: $e
            );
        }
    }
}
