<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\N8n\N8nService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Exception;

class N8nController extends BaseApiController
{
    protected N8nService $n8nService;

    public function __construct(N8nService $n8nService)
    {
        $this->n8nService = $n8nService;
    }

    /**
     * Get all workflows
     */
    public function getWorkflows(): JsonResponse
    {
        try {
            $workflows = $this->n8nService->getWorkflows();
            return $this->successResponse($workflows, 'Workflows retrieved successfully');
        } catch (Exception $e) {
            Log::error('Failed to get N8N workflows', ['error' => $e->getMessage()]);
            return $this->errorResponse('Failed to retrieve workflows', 500);
        }
    }

    /**
     * Get a specific workflow
     */
    public function getWorkflow(string $workflowId): JsonResponse
    {
        try {
            $workflow = $this->n8nService->getWorkflow($workflowId);
            return $this->successResponse($workflow, 'Workflow retrieved successfully');
        } catch (Exception $e) {
            Log::error('Failed to get N8N workflow', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to retrieve workflow', 500);
        }
    }

    /**
     * Create a new workflow
     */
    public function createWorkflow(Request $request): JsonResponse
    {
        try {
            $workflowData = $request->validate([
                'name' => 'required|string|max:255',
                'nodes' => 'array',
                'connections' => 'array',
                'active' => 'boolean',
                'settings' => 'array',
            ]);

            $workflow = $this->n8nService->createWorkflow($workflowData);
            return $this->successResponse($workflow, 'Workflow created successfully', 201);
        } catch (Exception $e) {
            Log::error('Failed to create N8N workflow', ['error' => $e->getMessage()]);
            return $this->errorResponse('Failed to create workflow', 500);
        }
    }

    /**
     * Update a workflow
     */
    public function updateWorkflow(Request $request, string $workflowId): JsonResponse
    {
        try {
            $workflowData = $request->validate([
                'name' => 'string|max:255',
                'nodes' => 'array',
                'connections' => 'array',
                'active' => 'boolean',
                'settings' => 'array',
            ]);

            $result = $this->n8nService->updateWorkflow($workflowId, $workflowData);
            return $this->successResponse($result, 'Workflow updated successfully');
        } catch (Exception $e) {
            Log::error('Failed to update N8N workflow', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to update workflow', 500);
        }
    }

    /**
     * Delete a workflow
     */
    public function deleteWorkflow(string $workflowId): JsonResponse
    {
        try {
            $result = $this->n8nService->deleteWorkflow($workflowId);
            return $this->successResponse($result, 'Workflow deleted successfully');
        } catch (Exception $e) {
            Log::error('Failed to delete N8N workflow', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to delete workflow', 500);
        }
    }

    /**
     * Activate a workflow
     */
    public function activateWorkflow(string $workflowId): JsonResponse
    {
        try {
            $result = $this->n8nService->activateWorkflow($workflowId);
            return $this->successResponse($result, 'Workflow activated successfully');
        } catch (Exception $e) {
            Log::error('Failed to activate N8N workflow', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to activate workflow', 500);
        }
    }

    /**
     * Deactivate a workflow
     */
    public function deactivateWorkflow(string $workflowId): JsonResponse
    {
        try {
            $result = $this->n8nService->deactivateWorkflow($workflowId);
            return $this->successResponse($result, 'Workflow deactivated successfully');
        } catch (Exception $e) {
            Log::error('Failed to deactivate N8N workflow', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to deactivate workflow', 500);
        }
    }

    /**
     * Execute a workflow
     */
    public function executeWorkflow(Request $request, string $workflowId): JsonResponse
    {
        try {
            $inputData = $request->validate([
                'input_data' => 'array',
            ]);

            $result = $this->n8nService->executeWorkflow($workflowId, $inputData['input_data'] ?? []);
            return $this->successResponse($result, 'Workflow executed successfully');
        } catch (Exception $e) {
            Log::error('Failed to execute N8N workflow', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to execute workflow', 500);
        }
    }

    /**
     * Get workflow executions
     */
    public function getWorkflowExecutions(Request $request, string $workflowId): JsonResponse
    {
        try {
            $data = $request->validate([
                'limit' => 'integer|min:1|max:100',
                'page' => 'integer|min:1',
            ]);

            $executions = $this->n8nService->getWorkflowExecutions(
                $workflowId,
                $data['limit'] ?? 20,
                $data['page'] ?? 1
            );

            return $this->successResponse($executions, 'Workflow executions retrieved successfully');
        } catch (Exception $e) {
            Log::error('Failed to get N8N workflow executions', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to retrieve workflow executions', 500);
        }
    }

    /**
     * Get a specific execution
     */
    public function getExecution(string $executionId): JsonResponse
    {
        try {
            $execution = $this->n8nService->getExecution($executionId);
            return $this->successResponse($execution, 'Execution retrieved successfully');
        } catch (Exception $e) {
            Log::error('Failed to get N8N execution', [
                'execution_id' => $executionId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to retrieve execution', 500);
        }
    }

    /**
     * Get all credentials
     */
    public function getCredentials(): JsonResponse
    {
        try {
            $credentials = $this->n8nService->getCredentials();
            return $this->successResponse($credentials, 'Credentials retrieved successfully');
        } catch (Exception $e) {
            Log::error('Failed to get N8N credentials', ['error' => $e->getMessage()]);
            return $this->errorResponse('Failed to retrieve credentials', 500);
        }
    }

    /**
     * Get a specific credential
     */
    public function getCredential(string $credentialId): JsonResponse
    {
        try {
            $credential = $this->n8nService->getCredential($credentialId);
            return $this->successResponse($credential, 'Credential retrieved successfully');
        } catch (Exception $e) {
            Log::error('Failed to get N8N credential', [
                'credential_id' => $credentialId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to retrieve credential', 500);
        }
    }

    /**
     * Create a new credential
     */
    public function createCredential(Request $request): JsonResponse
    {
        try {
            $credentialData = $request->validate([
                'name' => 'required|string|max:255',
                'type' => 'required|string|max:255',
                'data' => 'array',
            ]);

            $credential = $this->n8nService->createCredential($credentialData);
            return $this->successResponse($credential, 'Credential created successfully', 201);
        } catch (Exception $e) {
            Log::error('Failed to create N8N credential', ['error' => $e->getMessage()]);
            return $this->errorResponse('Failed to create credential', 500);
        }
    }

    /**
     * Update a credential
     */
    public function updateCredential(Request $request, string $credentialId): JsonResponse
    {
        try {
            $credentialData = $request->validate([
                'name' => 'string|max:255',
                'type' => 'string|max:255',
                'data' => 'array',
            ]);

            $result = $this->n8nService->updateCredential($credentialId, $credentialData);
            return $this->successResponse($result, 'Credential updated successfully');
        } catch (Exception $e) {
            Log::error('Failed to update N8N credential', [
                'credential_id' => $credentialId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to update credential', 500);
        }
    }

    /**
     * Delete a credential
     */
    public function deleteCredential(string $credentialId): JsonResponse
    {
        try {
            $result = $this->n8nService->deleteCredential($credentialId);
            return $this->successResponse($result, 'Credential deleted successfully');
        } catch (Exception $e) {
            Log::error('Failed to delete N8N credential', [
                'credential_id' => $credentialId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to delete credential', 500);
        }
    }

    /**
     * Test a credential
     */
    public function testCredential(string $credentialId): JsonResponse
    {
        try {
            $result = $this->n8nService->testCredential($credentialId);
            return $this->successResponse($result, 'Credential tested successfully');
        } catch (Exception $e) {
            Log::error('Failed to test N8N credential', [
                'credential_id' => $credentialId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to test credential', 500);
        }
    }

    /**
     * Get webhook URL for a workflow
     */
    public function getWebhookUrl(string $workflowId, string $nodeId): JsonResponse
    {
        try {
            $webhookUrl = $this->n8nService->getWebhookUrl($workflowId, $nodeId);
            return $this->successResponse(['webhook_url' => $webhookUrl], 'Webhook URL retrieved successfully');
        } catch (Exception $e) {
            Log::error('Failed to get N8N webhook URL', [
                'workflow_id' => $workflowId,
                'node_id' => $nodeId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to retrieve webhook URL', 500);
        }
    }

    /**
     * Send webhook data to a workflow
     */
    public function sendWebhook(Request $request, string $workflowId, string $nodeId): JsonResponse
    {
        try {
            $data = $request->all();
            $result = $this->n8nService->sendWebhook($workflowId, $nodeId, $data);
            return $this->successResponse($result, 'Webhook sent successfully');
        } catch (Exception $e) {
            Log::error('Failed to send N8N webhook', [
                'workflow_id' => $workflowId,
                'node_id' => $nodeId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to send webhook', 500);
        }
    }

    /**
     * Check if workflow is active
     */
    public function isWorkflowActive(string $workflowId): JsonResponse
    {
        try {
            $active = $this->n8nService->isWorkflowActive($workflowId);
            return $this->successResponse(['active' => $active], 'Workflow active status retrieved successfully');
        } catch (Exception $e) {
            Log::error('Failed to check N8N workflow active status', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to check workflow active status', 500);
        }
    }

    /**
     * Get workflow execution statistics
     */
    public function getWorkflowStats(string $workflowId): JsonResponse
    {
        try {
            $stats = $this->n8nService->getWorkflowStats($workflowId);
            return $this->successResponse($stats, 'Workflow statistics retrieved successfully');
        } catch (Exception $e) {
            Log::error('Failed to get N8N workflow statistics', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to retrieve workflow statistics', 500);
        }
    }

    /**
     * Test webhook connectivity
     */
    public function testWebhookConnectivity(string $workflowId, string $nodeId): JsonResponse
    {
        try {
            $result = $this->n8nService->testWebhookConnectivity($workflowId, $nodeId);
            return $this->successResponse($result, 'Webhook connectivity test completed');
        } catch (Exception $e) {
            Log::error('Failed to test N8N webhook connectivity', [
                'workflow_id' => $workflowId,
                'node_id' => $nodeId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to test webhook connectivity', 500);
        }
    }
}
