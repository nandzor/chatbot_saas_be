<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\BotPersonality\CreateBotPersonalityWorkflowRequest;
use App\Services\BotPersonalityWorkflowService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Exception;

/**
 * BotPersonalityWorkflowController
 *
 * Handles API endpoints for the complex Bot Personality workflow
 * that integrates with n8n workflows and WAHA sessions.
 */
class BotPersonalityWorkflowController extends BaseApiController
{
    protected BotPersonalityWorkflowService $workflowService;

    public function __construct(BotPersonalityWorkflowService $workflowService)
    {
        parent::__construct();
        $this->workflowService = $workflowService;
    }

    /**
     * Execute the complete Bot Personality workflow
     *
     * This endpoint triggers the 3-phase workflow:
     * 1. Data initialization and persistence (transactional)
     * 2. Activation and status update (concurrent execution)
     * 3. System message configuration synchronization
     *
     * @param CreateBotPersonalityWorkflowRequest $request
     * @return JsonResponse
     */
    public function executeWorkflow(CreateBotPersonalityWorkflowRequest $request): JsonResponse
    {
        try {
            $user = $this->getCurrentUser();
            if (!$user) {
                return $this->unauthorizedResponse('Authentication required');
            }

            $data = $request->getSanitizedData();

            // Execute the workflow
            $result = $this->workflowService->executeWorkflow($data);

            // Log the API action
            $this->logApiAction('bot_personality_workflow_executed', [
                'bot_personality_id' => $result['data']['bot_personality_id'],
                'waha_session_id' => $data['waha_session_id'],
                'knowledge_base_item_id' => $data['knowledge_base_item_id'],
                'n8n_workflow_id' => $result['data']['n8n_workflow_id'],
                'organization_id' => $user->organization_id,
                'user_id' => $user->id,
                'execution_time_ms' => $result['data']['execution_time_ms'],
            ]);

            return $this->successResponse(
                $result['message'],
                $result['data'],
                201
            );

        } catch (Exception $e) {
            return $this->errorResponse(
                'Workflow execution failed: ' . $e->getMessage(),
                $e->getCode() ?: 500
            );
        }
    }

    /**
     * Get workflow status
     *
     * @param string $botPersonalityId
     * @return JsonResponse
     */
    public function getWorkflowStatus(string $botPersonalityId): JsonResponse
    {
        try {
            $user = $this->getCurrentUser();
            if (!$user) {
                return $this->unauthorizedResponse('Authentication required');
            }

            $status = $this->workflowService->getWorkflowStatus($botPersonalityId);

            return $this->successResponse(
                'Workflow status retrieved successfully',
                $status
            );

        } catch (Exception $e) {
            return $this->errorResponse(
                'Failed to retrieve workflow status: ' . $e->getMessage(),
                $e->getCode() ?: 500
            );
        }
    }

    /**
     * Retry failed workflow operations
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function retryWorkflow(Request $request): JsonResponse
    {
        try {
            $user = $this->getCurrentUser();
            if (!$user) {
                return $this->unauthorizedResponse('Authentication required');
            }

            $request->validate([
                'bot_personality_id' => 'required|uuid|exists:bot_personalities,id',
                'retry_phase' => 'nullable|in:phase2,phase3,all',
            ]);

            $botPersonalityId = $request->input('bot_personality_id');
            $retryPhase = $request->input('retry_phase', 'all');

            // Get the bot personality to retrieve workflow data
            $botPersonality = \App\Models\BotPersonality::find($botPersonalityId);

            if (!$botPersonality) {
                return $this->errorResponse('Bot personality not found', 404);
            }

            // Prepare data for retry
            $workflowData = [
                'waha_session_id' => $botPersonality->waha_session_id,
                'knowledge_base_item_id' => $botPersonality->knowledge_base_item_id,
            ];

            // Execute retry based on phase
            if ($retryPhase === 'all') {
                $result = $this->workflowService->executeWorkflow($workflowData);
            } else {
                // For specific phase retry, we would need to implement phase-specific methods
                return $this->errorResponse('Phase-specific retry not yet implemented', 501);
            }

            $this->logApiAction('bot_personality_workflow_retried', [
                'bot_personality_id' => $botPersonalityId,
                'retry_phase' => $retryPhase,
                'organization_id' => $user->organization_id,
                'user_id' => $user->id,
            ]);

            return $this->successResponse(
                'Workflow retry completed successfully',
                $result['data']
            );

        } catch (Exception $e) {
            return $this->errorResponse(
                'Workflow retry failed: ' . $e->getMessage(),
                $e->getCode() ?: 500
            );
        }
    }

    /**
     * Cancel/abort a running workflow
     *
     * @param string $botPersonalityId
     * @return JsonResponse
     */
    public function cancelWorkflow(string $botPersonalityId): JsonResponse
    {
        try {
            $user = $this->getCurrentUser();
            if (!$user) {
                return $this->unauthorizedResponse('Authentication required');
            }

            $botPersonality = \App\Models\BotPersonality::find($botPersonalityId);

            if (!$botPersonality) {
                return $this->errorResponse('Bot personality not found', 404);
            }

            // Update status to cancelled
            $botPersonality->update([
                'status' => 'cancelled',
                'updated_at' => now(),
            ]);

            $this->logApiAction('bot_personality_workflow_cancelled', [
                'bot_personality_id' => $botPersonalityId,
                'organization_id' => $user->organization_id,
                'user_id' => $user->id,
            ]);

            return $this->successResponse(
                'Workflow cancelled successfully',
                [
                    'bot_personality_id' => $botPersonalityId,
                    'status' => 'cancelled',
                ]
            );

        } catch (Exception $e) {
            return $this->errorResponse(
                'Failed to cancel workflow: ' . $e->getMessage(),
                $e->getCode() ?: 500
            );
        }
    }

    /**
     * Get workflow execution history
     *
     * @param string $botPersonalityId
     * @return JsonResponse
     */
    public function getWorkflowHistory(string $botPersonalityId): JsonResponse
    {
        try {
            $user = $this->getCurrentUser();
            if (!$user) {
                return $this->unauthorizedResponse('Authentication required');
            }

            $botPersonality = \App\Models\BotPersonality::find($botPersonalityId);

            if (!$botPersonality) {
                return $this->errorResponse('Bot personality not found', 404);
            }

            // Get audit logs for this bot personality
            $auditLogs = \App\Models\AuditLog::where('auditable_type', 'App\\Models\\BotPersonality')
                ->where('auditable_id', $botPersonalityId)
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get();

            $history = $auditLogs->map(function ($log) {
                return [
                    'action' => $log->event,
                    'description' => $log->description,
                    'user_id' => $log->user_id,
                    'created_at' => $log->created_at,
                    'metadata' => $log->metadata,
                ];
            });

            return $this->successResponse(
                'Workflow history retrieved successfully',
                [
                    'bot_personality_id' => $botPersonalityId,
                    'history' => $history,
                    'total_entries' => $history->count(),
                ]
            );

        } catch (Exception $e) {
            return $this->errorResponse(
                'Failed to retrieve workflow history: ' . $e->getMessage(),
                $e->getCode() ?: 500
            );
        }
    }
}
