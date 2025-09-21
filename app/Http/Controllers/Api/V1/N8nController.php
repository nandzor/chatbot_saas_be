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
            // Get workflows from N8N
            $n8nWorkflows = $this->n8nService->getWorkflows();

            $response = [
                'n8n_workflows' => $n8nWorkflows,
                'database_workflows' => [],
                'total_n8n_workflows' => count($n8nWorkflows['data'] ?? []),
                'total_database_workflows' => 0,
                'database_status' => 'failed',
                'database_error' => null
            ];

            // Try to get workflows from database (with fallback)
            try {
                $dbWorkflows = \App\Models\N8nWorkflow::latest()->get();
                $response['database_workflows'] = $dbWorkflows->map(fn($workflow) => $workflow->summary);
                $response['total_database_workflows'] = $dbWorkflows->count();
                $response['database_status'] = 'success';
            } catch (Exception $dbException) {
                $response['database_status'] = 'failed';
                $response['database_error'] = $dbException->getMessage();
                Log::warning('Failed to retrieve workflows from database', [
                    'error' => $dbException->getMessage()
                ]);
            }

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

            // Generate standardized workflow name
            $standardizedName = \App\Models\N8nWorkflow::generateWorkflowName($organizationId, $customName);

            // Update workflow data with standardized name
            $workflowData['name'] = $standardizedName;

            // Log the standardization process
            Log::info('Creating workflow with standardized naming', [
                'original_name' => $request->input('name'),
                'custom_name' => $customName,
                'standardized_name' => $standardizedName,
                'organization_id' => $organizationId,
                'created_by' => $createdBy
            ]);

            // Create workflow in N8N
            $n8nWorkflow = $this->n8nService->createWorkflow($workflowData);

            // Try to store workflow in database (with fallback)
            $response = [
                'n8n_workflow' => $n8nWorkflow,
                'database_storage' => 'failed',
                'database_error' => null,
                'naming_info' => [
                    'original_name' => $request->input('name'),
                    'custom_name' => $customName,
                    'standardized_name' => $standardizedName,
                    'organization_id' => $organizationId
                ]
            ];

            try {
                // Log the N8N workflow data before processing
                Log::info('Attempting to store workflow in database', [
                    'n8n_workflow_id' => $n8nWorkflow['data']['id'] ?? $n8nWorkflow['id'] ?? 'unknown',
                    'n8n_workflow_name' => $n8nWorkflow['data']['name'] ?? $n8nWorkflow['name'] ?? 'unknown',
                    'standardized_name' => $standardizedName,
                    'organization_id' => $organizationId,
                    'created_by' => $createdBy
                ]);

                $workflow = \App\Models\N8nWorkflow::createOrUpdateFromN8n(
                    $n8nWorkflow['data'] ?? $n8nWorkflow,
                    $organizationId,
                    $createdBy,
                    $customName
                );

                // Log successful creation
                Log::info('Successfully stored workflow in database', [
                    'database_id' => $workflow->id,
                    'workflow_id' => $workflow->workflow_id,
                    'name' => $workflow->name,
                    'standardized_name' => $standardizedName,
                    'created_at' => $workflow->created_at
                ]);

                $response['database_storage'] = 'success';
                $response['stored_workflow'] = $workflow->summary;
                $response['database_id'] = $workflow->id;
                $response['database_created_at'] = $workflow->created_at;
            } catch (Exception $dbException) {
                $response['database_storage'] = 'failed';
                $response['database_error'] = $dbException->getMessage();
                Log::error('Failed to store workflow in database', [
                    'workflow_id' => $n8nWorkflow['data']['id'] ?? $n8nWorkflow['id'] ?? 'unknown',
                    'standardized_name' => $standardizedName,
                    'error' => $dbException->getMessage(),
                    'trace' => $dbException->getTraceAsString()
                ]);
            }

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
     * Delete a workflow
     */
    public function deleteWorkflow(string $workflowId): JsonResponse
    {
        try {
            // Delete workflow from N8N
            $result = $this->n8nService->deleteWorkflow($workflowId);

            // Try to delete workflow from database (with fallback)
            $response = [
                'n8n_deletion' => $result,
                'database_deletion' => 'failed',
                'database_error' => null
            ];

            try {
                // Log the deletion attempt
                Log::info('Attempting to delete workflow from database', [
                    'workflow_id' => $workflowId
                ]);

                // Find and delete workflow from database
                $workflow = \App\Models\N8nWorkflow::where('workflow_id', $workflowId)->first();

                if ($workflow) {
                    $workflow->delete();

                    // Log successful deletion
                    Log::info('Successfully deleted workflow from database', [
                        'database_id' => $workflow->id,
                        'workflow_id' => $workflow->workflow_id,
                        'name' => $workflow->name
                    ]);

                    $response['database_deletion'] = 'success';
                    $response['deleted_workflow'] = [
                        'database_id' => $workflow->id,
                        'workflow_id' => $workflow->workflow_id,
                        'name' => $workflow->name
                    ];
                } else {
                    $response['database_deletion'] = 'not_found';
                    $response['database_message'] = 'Workflow not found in database';
                    Log::info('Workflow not found in database for deletion', [
                        'workflow_id' => $workflowId
                    ]);
                }
            } catch (Exception $dbException) {
                $response['database_deletion'] = 'failed';
                $response['database_error'] = $dbException->getMessage();
                Log::error('Failed to delete workflow from database', [
                    'workflow_id' => $workflowId,
                    'error' => $dbException->getMessage(),
                    'trace' => $dbException->getTraceAsString()
                ]);
            }

            return $this->successResponse('Workflow deleted successfully', $response);
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
     * Test N8N connection with real API
     */
    public function testConnectionReal(): JsonResponse
    {
        try {
            // Create a new N8nService instance with real API configuration
            $realN8nService = new \App\Services\N8n\N8nService([
                'base_url' => 'http://localhost:5678',
                'api_key' => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMmY1ZGNiNy0wYzdlLTQzZDItOWI3NS02YTZhNTlkNzA4NDgiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4NDYwMTg3fQ.DtvTi6tiCgsdSQJraNS9Lfcsglw0Rp0mc7hBIJQRROk',
                'timeout' => 10,
                'retry_attempts' => 2,
                'mock_responses' => false,
            ]);

            $result = $realN8nService->testConnection();
            return $this->successResponse('N8N real API connection test completed', $result);
        } catch (Exception $e) {
            Log::error('Failed to test N8N real API connection', ['error' => $e->getMessage()]);
            return $this->errorResponse('Failed to test N8N real API connection', 500);
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
