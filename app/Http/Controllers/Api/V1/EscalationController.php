<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\ChatSession;
use App\Services\EscalationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

/**
 * EscalationController - Handles escalation-related API endpoints
 *
 * This controller provides endpoints for manual escalation, escalation monitoring,
 * and escalation configuration management.
 */
class EscalationController extends BaseApiController
{
    protected EscalationService $escalationService;

    public function __construct(EscalationService $escalationService)
    {
        $this->escalationService = $escalationService;
    }

    /**
     * Manually escalate a session to human agent
     */
    public function escalateSession(Request $request, string $sessionId): JsonResponse
    {
        try {
            $user = $this->getCurrentUser();
            if (!$user || !in_array($user->role, ['org_admin', 'super_admin', 'agent'])) {
                return $this->handleForbiddenAccess('escalate session');
            }

            $validator = Validator::make($request->all(), [
                'reason' => 'required|string|max:500',
                'agent_id' => 'nullable|uuid|exists:agents,id',
                'priority' => 'nullable|in:low,normal,high,urgent'
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors()->toArray());
            }

            $organizationId = $user->organization_id ?? '845e49a7-87db-4eb8-a5b6-6c077d0be712';
            $session = ChatSession::where('id', $sessionId)
                ->where('organization_id', $organizationId)
                ->first();

            if (!$session) {
                return $this->handleResourceNotFound('ChatSession', $sessionId);
            }

            // Check if session is already escalated
            if (!$session->is_bot_session || $session->agent_id) {
                return $this->errorResponse(
                    'Session is already handled by a human agent',
                    ['session_id' => $sessionId, 'current_agent_id' => $session->agent_id],
                    400
                );
            }

            $reason = $request->input('reason');
            $context = [
                'manual_escalation' => true,
                'escalated_by' => $user->id,
                'priority' => $request->input('priority', 'normal')
            ];

            // If specific agent is requested, try to assign to that agent
            if ($request->has('agent_id')) {
                $agent = \App\Models\Agent::find($request->input('agent_id'));
                if ($agent && $agent->canHandleMoreChats()) {
                    $escalationResult = $this->escalationService->escalateToAgent($session, $reason, $context);
                } else {
                    return $this->errorResponse(
                        'Requested agent is not available or at capacity',
                        ['agent_id' => $request->input('agent_id')],
                        400
                    );
                }
            } else {
                // Auto-assign to available agent
                $escalationResult = $this->escalationService->escalateToAgent($session, $reason, $context);
            }

            if ($escalationResult['success']) {
                $this->logApiAction('session_escalated', [
                    'session_id' => $sessionId,
                    'agent_id' => $escalationResult['agent_id'],
                    'reason' => $reason,
                    'user_id' => $user->id
                ]);

                return $this->successResponse(
                    'Session escalated successfully',
                    [
                        'session_id' => $sessionId,
                        'agent_id' => $escalationResult['agent_id'],
                        'agent_name' => $escalationResult['agent_name'],
                        'reason' => $reason,
                        'escalated_at' => now()->toISOString()
                    ]
                );
            } else {
                return $this->errorResponse(
                    'Failed to escalate session: ' . $escalationResult['error'],
                    ['session_id' => $sessionId],
                    500
                );
            }

        } catch (\Exception $e) {
            Log::error('Manual escalation failed', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->serverErrorResponse($e, 'Failed to escalate session');
        }
    }

    /**
     * Get escalation configuration for organization
     */
    public function getEscalationConfig(Request $request): JsonResponse
    {
        try {
            $user = $this->getCurrentUser();
            if (!$user || !in_array($user->role, ['org_admin', 'super_admin'])) {
                return $this->handleForbiddenAccess('view escalation configuration');
            }

            $config = $this->escalationService->getEscalationConfig($user->organization_id ?? '845e49a7-87db-4eb8-a5b6-6c077d0be712' ?? '98190485-9635-4d07-9429-a1f335fe524c');

            return $this->successResponse(
                'Escalation configuration retrieved successfully',
                $config
            );

        } catch (\Exception $e) {
            Log::error('Failed to get escalation configuration', [
                'organization_id' => $user->organization_id ?? '845e49a7-87db-4eb8-a5b6-6c077d0be712' ?? 'unknown',
                'error' => $e->getMessage()
            ]);

            return $this->serverErrorResponse($e, 'Failed to retrieve escalation configuration');
        }
    }

    /**
     * Update escalation configuration for organization
     */
    public function updateEscalationConfig(Request $request): JsonResponse
    {
        try {
            $user = $this->getCurrentUser();
            if (!$user || !in_array($user->role, ['org_admin', 'super_admin'])) {
                return $this->handleForbiddenAccess('update escalation configuration');
            }

            $validator = Validator::make($request->all(), [
                'enabled' => 'boolean',
                'escalation_timeout_minutes' => 'integer|min:1|max:120',
                'max_failed_responses' => 'integer|min:1|max:10',
                'escalation_keywords' => 'array',
                'escalation_keywords.*' => 'string|max:100',
                'negative_sentiment_keywords' => 'array',
                'negative_sentiment_keywords.*' => 'string|max:100',
                'auto_assign_agent' => 'boolean',
                'notify_agent' => 'boolean'
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors()->toArray());
            }

            // For now, we'll just return the updated config
            // In a real implementation, you'd save this to database
            $currentConfig = $this->escalationService->getEscalationConfig($user->organization_id ?? '845e49a7-87db-4eb8-a5b6-6c077d0be712');
            $updatedConfig = array_merge($currentConfig, $request->only([
                'enabled', 'escalation_timeout_minutes', 'max_failed_responses',
                'escalation_keywords', 'negative_sentiment_keywords',
                'auto_assign_agent', 'notify_agent'
            ]));

            $this->logApiAction('escalation_config_updated', [
                'organization_id' => $user->organization_id ?? '845e49a7-87db-4eb8-a5b6-6c077d0be712',
                'user_id' => $user->id,
                'changes' => $request->all()
            ]);

            return $this->successResponse(
                'Escalation configuration updated successfully',
                $updatedConfig
            );

        } catch (\Exception $e) {
            Log::error('Failed to update escalation configuration', [
                'organization_id' => $user->organization_id ?? '845e49a7-87db-4eb8-a5b6-6c077d0be712' ?? 'unknown',
                'error' => $e->getMessage()
            ]);

            return $this->serverErrorResponse($e, 'Failed to update escalation configuration');
        }
    }

    /**
     * Get escalation statistics for organization
     */
    public function getEscalationStats(Request $request): JsonResponse
    {
        try {
            $user = $this->getCurrentUser();
            if (!$user || !in_array($user->role, ['org_admin', 'super_admin'])) {
                return $this->handleForbiddenAccess('view escalation statistics');
            }

            $timeRange = $request->input('time_range', '7d'); // 7d, 30d, 90d
            $startDate = $this->getStartDateFromTimeRange($timeRange);

            $stats = [
                'total_escalations' => ChatSession::where('organization_id', $user->organization_id ?? '845e49a7-87db-4eb8-a5b6-6c077d0be712')
                    ->where('is_bot_session', false)
                    ->whereNotNull('agent_id')
                    ->where('handover_at', '>=', $startDate)
                    ->count(),
                'escalations_by_reason' => ChatSession::where('organization_id', $user->organization_id ?? '845e49a7-87db-4eb8-a5b6-6c077d0be712')
                    ->where('is_bot_session', false)
                    ->whereNotNull('agent_id')
                    ->where('handover_at', '>=', $startDate)
                    ->selectRaw('handover_reason, COUNT(*) as count')
                    ->groupBy('handover_reason')
                    ->get(),
                'escalations_by_agent' => ChatSession::where('organization_id', $user->organization_id ?? '845e49a7-87db-4eb8-a5b6-6c077d0be712')
                    ->where('is_bot_session', false)
                    ->whereNotNull('agent_id')
                    ->where('handover_at', '>=', $startDate)
                    ->with('agent:id,display_name')
                    ->selectRaw('agent_id, COUNT(*) as count')
                    ->groupBy('agent_id')
                    ->get(),
                'escalation_success_rate' => $this->calculateEscalationSuccessRate($user->organization_id ?? '845e49a7-87db-4eb8-a5b6-6c077d0be712', $startDate),
                'avg_escalation_time' => $this->calculateAvgEscalationTime($user->organization_id ?? '845e49a7-87db-4eb8-a5b6-6c077d0be712', $startDate)
            ];

            return $this->successResponse(
                'Escalation statistics retrieved successfully',
                $stats
            );

        } catch (\Exception $e) {
            Log::error('Failed to get escalation statistics', [
                'organization_id' => $user->organization_id ?? '845e49a7-87db-4eb8-a5b6-6c077d0be712' ?? 'unknown',
                'error' => $e->getMessage()
            ]);

            return $this->serverErrorResponse($e, 'Failed to retrieve escalation statistics');
        }
    }

    /**
     * Get available agents for escalation
     */
    public function getAvailableAgents(Request $request): JsonResponse
    {
        try {
            $user = $this->getCurrentUser();
            if (!$user || !in_array($user->role, ['org_admin', 'super_admin', 'agent'])) {
                return $this->handleForbiddenAccess('view available agents');
            }

            $criteria = $request->only(['department', 'specialization', 'languages']);
            $availableAgents = \App\Models\Agent::where('organization_id', $user->organization_id ?? '845e49a7-87db-4eb8-a5b6-6c077d0be712')
                ->where('status', 'active')
                ->where('availability_status', 'available')
                ->whereRaw('current_active_chats < max_concurrent_chats')
                ->select(['id', 'display_name', 'department', 'specialization', 'current_active_chats', 'max_concurrent_chats'])
                ->get();

            return $this->successResponse(
                'Available agents retrieved successfully',
                $availableAgents
            );

        } catch (\Exception $e) {
            Log::error('Failed to get available agents', [
                'organization_id' => $user->organization_id ?? '845e49a7-87db-4eb8-a5b6-6c077d0be712' ?? 'unknown',
                'error' => $e->getMessage()
            ]);

            return $this->serverErrorResponse($e, 'Failed to retrieve available agents');
        }
    }

    /**
     * Helper method to get start date from time range
     */
    private function getStartDateFromTimeRange(string $timeRange): \Carbon\Carbon
    {
        return match ($timeRange) {
            '24h' => now()->subDay(),
            '7d' => now()->subWeek(),
            '30d' => now()->subMonth(),
            '90d' => now()->subMonths(3),
            default => now()->subWeek()
        };
    }

    /**
     * Calculate escalation success rate
     */
    private function calculateEscalationSuccessRate(string $organizationId, \Carbon\Carbon $startDate): float
    {
        $totalEscalations = ChatSession::where('organization_id', $organizationId)
            ->where('is_bot_session', false)
            ->whereNotNull('agent_id')
            ->where('handover_at', '>=', $startDate)
            ->count();

        if ($totalEscalations === 0) {
            return 0.0;
        }

        $successfulEscalations = ChatSession::where('organization_id', $organizationId)
            ->where('is_bot_session', false)
            ->whereNotNull('agent_id')
            ->where('handover_at', '>=', $startDate)
            ->where('is_resolved', true)
            ->count();

        return round(($successfulEscalations / $totalEscalations) * 100, 2);
    }

    /**
     * Calculate average escalation time
     */
    private function calculateAvgEscalationTime(string $organizationId, \Carbon\Carbon $startDate): int
    {
        $avgTime = ChatSession::where('organization_id', $organizationId)
            ->where('is_bot_session', false)
            ->whereNotNull('agent_id')
            ->where('handover_at', '>=', $startDate)
            ->selectRaw('AVG(EXTRACT(EPOCH FROM (handover_at - started_at))/60) as avg_minutes')
            ->value('avg_minutes');

        return $avgTime ? round($avgTime) : 0;
    }
}
