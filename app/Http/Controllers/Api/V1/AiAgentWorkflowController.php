<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\AiAgentWorkflowService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AiAgentWorkflowController extends BaseApiController
{
    protected AiAgentWorkflowService $aiAgentWorkflowService;

    public function __construct(AiAgentWorkflowService $aiAgentWorkflowService)
    {
        $this->aiAgentWorkflowService = $aiAgentWorkflowService;
    }

    /**
     * Create AI Agent workflow
     */
    public function create(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'organization_id' => 'required|uuid|exists:organizations,id',
                'knowledge_base_id' => 'required|uuid|exists:knowledge_bases,id',
                'workflow_config' => 'nullable|array',
                'workflow_config.workflow_name' => 'nullable|string|max:255',
                'workflow_config.ai_model' => 'nullable|string|in:gpt-4,gpt-3.5-turbo',
                'workflow_config.ai_temperature' => 'nullable|numeric|min:0|max:2',
                'workflow_config.ai_max_tokens' => 'nullable|integer|min:1|max:4000',
                'workflow_config.timezone' => 'nullable|string|max:50',
                'workflow_config.timeout' => 'nullable|integer|min:30|max:600'
            ]);

            $organizationId = $request->input('organization_id');
            $knowledgeBaseId = $request->input('knowledge_base_id');
            $workflowConfig = $request->input('workflow_config', []);

            $result = $this->aiAgentWorkflowService->createAiAgentWorkflow(
                $organizationId,
                $knowledgeBaseId,
                $workflowConfig
            );

            if (!$result['success']) {
                return $this->errorResponseWithLog(
                    'ai_workflow_creation_failed',
                    'Failed to create AI Agent workflow',
                    $result['message'],
                    500,
                    'AI_WORKFLOW_CREATION_FAILED'
                );
            }

            $this->logApiAction('ai_workflow_created', [
                'organization_id' => $organizationId,
                'knowledge_base_id' => $knowledgeBaseId,
                'workflow_id' => $result['data']['workflow_id'],
                'session_id' => $result['data']['session_id']
            ]);

            return $this->successResponseWithLog(
                'ai_workflow_created',
                'AI Agent workflow created successfully',
                $result['data'],
                201
            );

        } catch (ValidationException $e) {
            return $this->errorResponseWithLog(
                'ai_workflow_validation_error',
                'AI workflow validation failed',
                $e->getMessage(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'ai_workflow_creation_error',
                'Failed to create AI Agent workflow',
                $e->getMessage(),
                500,
                'AI_WORKFLOW_CREATION_ERROR'
            );
        }
    }

    /**
     * Process incoming WhatsApp message through AI Agent workflow
     */
    public function processMessage(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'session' => 'required|string|max:255',
                'from' => 'required|string|max:50',
                'text' => 'required|string',
                'timestamp' => 'nullable|date_iso8601',
                'messageId' => 'nullable|string|max:255',
                'type' => 'nullable|string|max:50',
                'organization_id' => 'nullable|uuid',
                'knowledge_base_id' => 'nullable|uuid'
            ]);

            $messageData = $request->validated();

            $result = $this->aiAgentWorkflowService->processMessage($messageData);

            if (!$result['success']) {
                return $this->errorResponseWithLog(
                    'ai_message_processing_failed',
                    'Failed to process message through AI Agent workflow',
                    $result['message'],
                    500,
                    'AI_MESSAGE_PROCESSING_FAILED'
                );
            }

            $this->logApiAction('ai_message_processed', [
                'session' => $request->input('session'),
                'from' => $request->input('from'),
                'message_length' => strlen($request->input('text')),
                'processing_result' => $result['success']
            ]);

            return $this->successResponseWithLog(
                'ai_message_processed',
                'Message processed successfully through AI Agent workflow',
                $result['data']
            );

        } catch (ValidationException $e) {
            return $this->errorResponseWithLog(
                'ai_message_validation_error',
                'Message validation failed',
                $e->getMessage(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'ai_message_processing_error',
                'Failed to process message',
                $e->getMessage(),
                500,
                'AI_MESSAGE_PROCESSING_ERROR'
            );
        }
    }

    /**
     * Get AI Agent workflow analytics
     */
    public function analytics(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'organization_id' => 'required|uuid|exists:organizations,id',
                'knowledge_base_id' => 'required|uuid|exists:knowledge_bases,id'
            ]);

            $organizationId = $request->input('organization_id');
            $knowledgeBaseId = $request->input('knowledge_base_id');

            $analytics = $this->aiAgentWorkflowService->getWorkflowAnalytics(
                $organizationId,
                $knowledgeBaseId
            );

            if (!$analytics['success']) {
                return $this->errorResponseWithLog(
                    'ai_workflow_analytics_failed',
                    'Failed to retrieve AI workflow analytics',
                    $analytics['message'],
                    500,
                    'AI_WORKFLOW_ANALYTICS_FAILED'
                );
            }

            $this->logApiAction('ai_workflow_analytics_viewed', [
                'organization_id' => $organizationId,
                'knowledge_base_id' => $knowledgeBaseId
            ]);

            return $this->successResponseWithLog(
                'ai_workflow_analytics_viewed',
                'AI Agent workflow analytics retrieved successfully',
                $analytics['data']
            );

        } catch (ValidationException $e) {
            return $this->errorResponseWithLog(
                'ai_workflow_analytics_validation_error',
                'Analytics validation failed',
                $e->getMessage(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'ai_workflow_analytics_error',
                'Failed to retrieve analytics',
                $e->getMessage(),
                500,
                'AI_WORKFLOW_ANALYTICS_ERROR'
            );
        }
    }

    /**
     * Delete AI Agent workflow
     */
    public function delete(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'organization_id' => 'required|uuid|exists:organizations,id',
                'knowledge_base_id' => 'required|uuid|exists:knowledge_bases,id'
            ]);

            $organizationId = $request->input('organization_id');
            $knowledgeBaseId = $request->input('knowledge_base_id');

            $result = $this->aiAgentWorkflowService->deleteAiAgentWorkflow(
                $organizationId,
                $knowledgeBaseId
            );

            if (!$result['success']) {
                return $this->errorResponseWithLog(
                    'ai_workflow_deletion_failed',
                    'Failed to delete AI Agent workflow',
                    $result['message'],
                    500,
                    'AI_WORKFLOW_DELETION_FAILED'
                );
            }

            $this->logApiAction('ai_workflow_deleted', [
                'organization_id' => $organizationId,
                'knowledge_base_id' => $knowledgeBaseId
            ]);

            return $this->successResponseWithLog(
                'ai_workflow_deleted',
                'AI Agent workflow deleted successfully',
                $result['data']
            );

        } catch (ValidationException $e) {
            return $this->errorResponseWithLog(
                'ai_workflow_deletion_validation_error',
                'Deletion validation failed',
                $e->getMessage(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'ai_workflow_deletion_error',
                'Failed to delete AI Agent workflow',
                $e->getMessage(),
                500,
                'AI_WORKFLOW_DELETION_ERROR'
            );
        }
    }

    /**
     * Test AI Agent workflow
     */
    public function test(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'organization_id' => 'required|uuid|exists:organizations,id',
                'knowledge_base_id' => 'required|uuid|exists:knowledge_bases,id',
                'test_message' => 'required|string|max:1000',
                'test_phone' => 'nullable|string|max:20'
            ]);

            $organizationId = $request->input('organization_id');
            $knowledgeBaseId = $request->input('knowledge_base_id');
            $testMessage = $request->input('test_message');
            $testPhone = $request->input('test_phone', '+6281234567890');

            // Create test message data
            $testMessageData = [
                'session' => "test_session_{$organizationId}_{$knowledgeBaseId}",
                'from' => $testPhone,
                'text' => $testMessage,
                'timestamp' => now()->toISOString(),
                'messageId' => 'test-msg-' . uniqid(),
                'type' => 'text',
                'organization_id' => $organizationId,
                'knowledge_base_id' => $knowledgeBaseId
            ];

            $result = $this->aiAgentWorkflowService->processMessage($testMessageData);

            $this->logApiAction('ai_workflow_tested', [
                'organization_id' => $organizationId,
                'knowledge_base_id' => $knowledgeBaseId,
                'test_message_length' => strlen($testMessage),
                'test_result' => $result['success']
            ]);

            return $this->successResponseWithLog(
                'ai_workflow_tested',
                'AI Agent workflow test completed',
                [
                    'test_data' => $testMessageData,
                    'result' => $result,
                    'test_timestamp' => now()->toISOString()
                ]
            );

        } catch (ValidationException $e) {
            return $this->errorResponseWithLog(
                'ai_workflow_test_validation_error',
                'Test validation failed',
                $e->getMessage(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'ai_workflow_test_error',
                'Failed to test AI Agent workflow',
                $e->getMessage(),
                500,
                'AI_WORKFLOW_TEST_ERROR'
            );
        }
    }

    /**
     * Get AI Agent workflow status
     */
    public function status(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'organization_id' => 'required|uuid|exists:organizations,id',
                'knowledge_base_id' => 'required|uuid|exists:knowledge_bases,id'
            ]);

            $organizationId = $request->input('organization_id');
            $knowledgeBaseId = $request->input('knowledge_base_id');

            // Get workflow metadata from cache
            $workflowMetadata = \Illuminate\Support\Facades\Cache::get("ai_workflow_{$organizationId}_{$knowledgeBaseId}");

            if (!$workflowMetadata) {
                return $this->errorResponseWithLog(
                    'ai_workflow_not_found',
                    'AI Agent workflow not found',
                    "No workflow found for organization {$organizationId} and knowledge base {$knowledgeBaseId}",
                    404,
                    'AI_WORKFLOW_NOT_FOUND'
                );
            }

            // Get additional status information
            $status = [
                'workflow_metadata' => $workflowMetadata,
                'status' => $workflowMetadata['status'] ?? 'unknown',
                'created_at' => $workflowMetadata['created_at'] ?? null,
                'last_checked' => now()->toISOString(),
                'health_status' => 'healthy' // You can implement health checks here
            ];

            return $this->successResponse(
                'AI Agent workflow status retrieved successfully',
                $status
            );

        } catch (ValidationException $e) {
            return $this->errorResponseWithLog(
                'ai_workflow_status_validation_error',
                'Status validation failed',
                $e->getMessage(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'ai_workflow_status_error',
                'Failed to get AI Agent workflow status',
                $e->getMessage(),
                500,
                'AI_WORKFLOW_STATUS_ERROR'
            );
        }
    }
}
