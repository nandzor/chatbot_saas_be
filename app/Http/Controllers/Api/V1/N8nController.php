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
            $response = $this->n8nService->getWorkflowsWithDatabase();
            return $this->successResponse('Workflows retrieved successfully', $response);
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
            return $this->successResponse('Workflow retrieved successfully', $workflow);
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
            // Validate payload structure
            $workflowData = $request->validate([
                'name' => 'required|string|max:255',
                'nodes' => 'array',
                'connections' => 'array',
                'settings' => 'array',
                'staticData' => 'array|nullable',
                'shared' => 'array|nullable',
                'custom_name' => 'string|nullable', // Optional custom name for standardization
            ]);

            // Validate payload using model validation
            $validationErrors = \App\Models\N8nWorkflow::validatePayload($workflowData);
            if (!empty($validationErrors)) {
                return $this->errorResponse('Invalid payload structure: ' . implode(', ', $validationErrors), 400);
            }

            // Get organization and user info
            $organizationId = auth()->user()?->organization_id ?? \App\Models\Organization::first()?->id;
            $createdBy = auth()->id() ?? \App\Models\User::first()?->id;
            $customName = $workflowData['custom_name'] ?? null;

            // Use service to create workflow with database storage
            $response = $this->n8nService->createWorkflowWithDatabase(
                $workflowData,
                $organizationId,
                $createdBy,
                $customName
            );

            return $this->successResponse('Workflow created successfully with standardized naming', $response, 201);
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
                'staticData' => 'array',
                'meta' => 'array',
            ]);

            $result = $this->n8nService->updateWorkflow($workflowId, $workflowData);
            return $this->successResponse('Workflow updated successfully', $result);
        } catch (Exception $e) {
            Log::error('Failed to update N8N workflow', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to update workflow', 500);
        }
    }

    /**
     * Update workflow system message
     */
    public function updateSystemMessage(Request $request, string $workflowId): JsonResponse
    {
        try {
            $request->validate([
                'system_message' => 'required|string',
                'node_id' => 'string|nullable', // Optional: specific node ID to update
            ]);

            $systemMessage = $request->input('system_message');
            $nodeId = $request->input('node_id');

            // Use service to update system message
            $result = $this->n8nService->updateSystemMessage($workflowId, $systemMessage, $nodeId);

            return $this->successResponse('System message updated successfully', $result);

        } catch (\App\Services\N8n\Exceptions\N8nException $e) {
            Log::error('N8N service error during system message update', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage(),
                'code' => $e->getCode()
            ]);
            return $this->errorResponse($e->getMessage(), $e->getCode());
        } catch (Exception $e) {
            Log::error('Failed to update system message', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to update system message', 500);
        }
    }

    /**
     * Get webhook URLs for a workflow
     */
    public function getWebhookUrls(string $workflowId): JsonResponse
    {
        try {
            // Get workflow from database
            $workflow = \App\Models\N8nWorkflow::where('workflow_id', $workflowId)->first();

            if (!$workflow) {
                return $this->errorResponse('Workflow not found', 404);
            }

            // Use service to extract webhook URLs
            $webhookData = $this->n8nService->extractWebhookUrls(
                $workflow->workflow_data,
                $workflow->workflow_id,
                $workflow->name,
                $workflow->is_enabled
            );

            if (empty($webhookData['webhook_urls'])) {
                return $this->errorResponse('No webhook nodes found in this workflow', 404);
            }

            return $this->successResponse('Webhook URLs retrieved successfully', $webhookData);

        } catch (Exception $e) {
            Log::error('Failed to get webhook URLs', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to get webhook URLs', 500);
        }
    }

    /**
     * Delete a workflow
     */
    public function deleteWorkflow(string $workflowId): JsonResponse
    {
        try {
            $result = $this->n8nService->deleteWorkflowWithDatabase($workflowId);
            return $this->successResponse('Workflow deleted successfully', $result);
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
            return $this->successResponse('Workflow activated successfully', $result);
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
            return $this->successResponse('Workflow deactivated successfully', $result);
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
            return $this->successResponse('Workflow executed successfully', $result);
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

            return $this->successResponse('Workflow executions retrieved successfully', $executions);
        } catch (Exception $e) {
            Log::error('Failed to get N8N workflow executions', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to retrieve workflow executions', 500);
        }
    }

    /**
     * Get all executions
     */
    public function getAllExecutions(): JsonResponse
    {
        try {
            $executions = $this->n8nService->getAllExecutions();
            return $this->successResponse('Executions retrieved successfully', $executions);
        } catch (Exception $e) {
            Log::error('Failed to get N8N executions', ['error' => $e->getMessage()]);
            return $this->errorResponse('Failed to retrieve executions', 500);
        }
    }

    /**
     * Get a specific execution
     */
    public function getExecution(string $executionId): JsonResponse
    {
        try {
            $execution = $this->n8nService->getExecution($executionId);
            return $this->successResponse('Execution retrieved successfully', $execution);
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
            return $this->successResponse('Credentials retrieved successfully', $credentials);
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
            return $this->successResponse('Credential retrieved successfully', $credential);
        } catch (Exception $e) {
            Log::error('Failed to get N8N credential', [
                'credential_id' => $credentialId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to retrieve credential', 500);
        }
    }

    /**
     * Get credential schema by type name
     */
    public function getCredentialSchema(string $credentialTypeName): JsonResponse
    {
        try {
            $schema = $this->n8nService->getCredentialSchema($credentialTypeName);
            return $this->successResponse('Credential schema retrieved successfully', $schema);
        } catch (Exception $e) {
            Log::error('Failed to get N8N credential schema', [
                'credential_type' => $credentialTypeName,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to retrieve credential schema', 500);
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
            return $this->successResponse('Credential created successfully', $credential, 201);
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
            return $this->successResponse('Credential updated successfully', $result);
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
            return $this->successResponse('Credential deleted successfully', $result);
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
            return $this->successResponse('Credential tested successfully', $result);
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
            return $this->successResponse('Webhook URL retrieved successfully', ['webhook_url' => $webhookUrl]);
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
     * Test N8N connection
     */
    public function testConnection(): JsonResponse
    {
        try {
            $result = $this->n8nService->testConnection();
            return $this->successResponse('N8N connection test completed', $result);
        } catch (Exception $e) {
            Log::error('Failed to test N8N connection', ['error' => $e->getMessage()]);
            return $this->errorResponse('Failed to test N8N connection', 500);
        }
    }

    /**
     * Test N8N connection with forced mock mode
     */
    public function testConnectionMock(): JsonResponse
    {
        try {
            // Force mock mode for testing
            $mockService = new \App\Services\N8n\N8nService([
                'base_url' => 'http://localhost:5678',
                'api_key' => 'test-key',
                'mock_responses' => true,
                'timeout' => 30,
            ]);

            $result = $mockService->testConnection();
            return $this->successResponse('N8N connection test completed (Mock Mode)', $result);
        } catch (Exception $e) {
            Log::error('Failed to test N8N connection in mock mode', ['error' => $e->getMessage()]);
            return $this->errorResponse('Failed to test N8N connection in mock mode', 500);
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
            return $this->successResponse('Webhook sent successfully', $result);
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
            return $this->successResponse('Workflow active status retrieved successfully', ['active' => $active]);
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
            return $this->successResponse('Workflow statistics retrieved successfully', $stats);
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
            return $this->successResponse('Webhook connectivity test completed', $result);
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
