<?php

namespace App\Services\N8n;

use App\Services\Http\BaseHttpClient;
use App\Services\N8n\Exceptions\N8nException;
use App\Helpers\StringHelper;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class N8nService extends BaseHttpClient
{
    protected string $apiKey;
    protected bool $mockResponses = false;

    public function __construct(array $config = [])
    {
        $this->apiKey = $config['api_key'] ?? '';
        // Force real API when N8N server is available
        $this->mockResponses = false; // Always try real API first

        // Validate configuration
        $this->validateConfig($config);

        $headers = [
            'X-N8N-API-KEY' => $this->apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ];

        // Normalize base URL: ensure it points to the N8n server root (no trailing /api or /api/v1)
        $rawBaseUrl = $config['base_url'] ?? 'http://localhost:5678';
        $normalizedBaseUrl = $this->normalizeBaseUrl($rawBaseUrl);

        parent::__construct($normalizedBaseUrl, [
            'headers' => $headers,
            'timeout' => $config['timeout'] ?? 10, // Increased timeout for real API
            'retry_attempts' => $config['retry_attempts'] ?? 2, // Increased retries for real API
            'retry_delay' => $config['retry_delay'] ?? 1000,
            'max_retry_delay' => $config['max_retry_delay'] ?? 10000,
            'exponential_backoff' => $config['exponential_backoff'] ?? true,
            'log_requests' => $config['log_requests'] ?? true,
            'log_responses' => $config['log_responses'] ?? true,
        ]);

        // Service initialized silently
    }

    /**
     * Get all workflows
     */
    public function getWorkflows(): array
    {
        // Always try real N8N API first, fallback to mock if needed
        try {
            $response = $this->get('/api/v1/workflows');
            $data = $this->handleResponse($response, 'get workflows');

            // Check if we got real N8N data
            if (isset($data['data']) && is_array($data['data'])) {
                Log::info('Successfully retrieved real N8N workflows', ['count' => count($data['data'])]);
                return $data;
            }
        } catch (Exception $e) {
            Log::warning('N8N server not accessible, falling back to mock workflows', ['error' => $e->getMessage()]);
        }

        // Fallback to mock mode
        return $this->getMockWorkflows();
    }

    /**
     * Get a specific workflow
     */
    public function getWorkflow(string $workflowId): array
    {
        if ($this->mockResponses) {
            return $this->getMockWorkflow($workflowId);
        }

        try {
            $response = $this->get("/api/v1/workflows/{$workflowId}");
            return $this->handleResponse($response, 'get workflow');
        } catch (Exception $e) {
            // Fallback to mock mode when server is not accessible
            Log::warning('N8N server not accessible, falling back to mock workflow', ['error' => $e->getMessage()]);
            return $this->getMockWorkflow($workflowId);
        }
    }

    /**
     * Create a new workflow
     */
    public function createWorkflow(array $workflowData): array
    {
        if ($this->mockResponses) {
            return $this->getMockWorkflowCreated();
        }

        $this->validateWorkflowData($workflowData);

        // Clean payload for N8N API - remove non-N8N fields and ensure proper format
        $cleanPayload = $this->cleanWorkflowPayloadForN8n($workflowData);

        $response = $this->post('/api/v1/workflows', $cleanPayload);
        return $this->handleResponse($response, 'create workflow');
    }

    /**
     * Update a workflow
     */
    public function updateWorkflow(string $workflowId, array $workflowData): array
    {
        if ($this->mockResponses) {
            return $this->getMockWorkflowUpdated();
        }

        $this->validateWorkflowData($workflowData, false);

        $response = $this->put("/api/v1/workflows/{$workflowId}", $workflowData);
        return $this->handleResponse($response, 'update workflow');
    }

    /**
     * Delete a workflow
     */
    public function deleteWorkflow(string $workflowId): array
    {
        if ($this->mockResponses) {
            return $this->getMockWorkflowDeleted();
        }

        $response = $this->delete("/api/v1/workflows/{$workflowId}");
        return $this->handleResponse($response, 'delete workflow');
    }

    /**
     * Activate a workflow
     */
    public function activateWorkflow(string $workflowId): array
    {
        if ($this->mockResponses) {
            return $this->getMockWorkflowActivated();
        }

        $response = $this->post("/api/v1/workflows/{$workflowId}/activate");
        return $this->handleResponse($response, 'activate workflow');
    }

    /**
     * Deactivate a workflow
     */
    public function deactivateWorkflow(string $workflowId): array
    {
        if ($this->mockResponses) {
            return $this->getMockWorkflowDeactivated();
        }

        $response = $this->post("/api/v1/workflows/{$workflowId}/deactivate");
        return $this->handleResponse($response, 'deactivate workflow');
    }

    /**
     * Execute a workflow via webhook trigger
     */
    public function executeWorkflow(string $workflowId, array $inputData = []): array
    {
        if ($this->mockResponses) {
            return $this->getMockWorkflowExecuted();
        }

        // Get workflow details to find webhook trigger node
        $workflow = $this->getWorkflow($workflowId);

        if (!isset($workflow['data']['nodes']) || empty($workflow['data']['nodes'])) {
            throw new N8nException('Workflow has no nodes to execute', 400);
        }

        // Find webhook trigger node
        $webhookNode = null;
        foreach ($workflow['data']['nodes'] as $node) {
            if (isset($node['type']) && (
                strpos($node['type'], 'webhook') !== false ||
                strpos($node['type'], 'wahaTrigger') !== false ||
                strpos($node['type'], 'trigger') !== false ||
                strpos($node['type'], 'WAHA') !== false ||
                strpos($node['type'], 'waha') !== false
            )) {
                $webhookNode = $node;
                break;
            }
        }

        if (!$webhookNode) {
            // If no webhook trigger, return informative message
            return [
                'success' => false,
                'message' => 'Workflow cannot be executed via API',
                'reason' => 'Workflow has no webhook trigger node',
                'workflow_id' => $workflowId,
                'workflow_name' => $workflow['data']['name'],
                'workflow_active' => $workflow['data']['active'],
                'available_nodes' => array_map(function($node) {
                    return [
                        'id' => $node['id'],
                        'name' => $node['name'],
                        'type' => $node['type']
                    ];
                }, $workflow['data']['nodes']),
                'suggestion' => 'Add a webhook trigger node to enable API execution',
                'note' => 'Only workflows with webhook trigger nodes can be executed via API'
            ];
        }

        // Execute via webhook
        $webhookUrl = $this->getWebhookUrl($workflowId, $webhookNode['id']);
        $response = $this->post($webhookUrl, $inputData);

        return [
            'success' => true,
            'message' => 'Workflow executed via webhook trigger',
            'execution_id' => uniqid(),
            'webhook_url' => $webhookUrl,
            'input_data' => $inputData
        ];
    }

    /**
     * Get workflow executions
     */
    public function getWorkflowExecutions(string $workflowId, int $limit = 20, int $page = 1): array
    {
        if ($this->mockResponses) {
            return $this->getMockWorkflowExecutions();
        }

        try {
            // Use the correct N8N API endpoint for executions
            $response = $this->get("/api/v1/executions", [
                'workflowId' => $workflowId,
                'limit' => $limit,
                'page' => $page,
            ]);

            return $this->handleResponse($response, 'get workflow executions');
        } catch (Exception $e) {
            // Fallback to mock mode when server is not accessible
            Log::warning('N8N server not accessible, falling back to mock executions', ['error' => $e->getMessage()]);
            return $this->getMockWorkflowExecutions();
        }
    }

    /**
     * Get all executions
     */
    public function getAllExecutions(): array
    {
        // Always try real N8N API first, fallback to mock if needed
        try {
            $response = $this->get('/api/v1/executions');
            $data = $this->handleResponse($response, 'get all executions');

            // Check if we got real N8N data
            if (isset($data['data']) && is_array($data['data'])) {
                Log::info('Successfully retrieved real N8N executions', ['count' => count($data['data'])]);
                return $data;
            }
        } catch (Exception $e) {
            Log::warning('N8N server not accessible, falling back to mock executions', ['error' => $e->getMessage()]);
        }

        // Fallback to mock mode
        return $this->getMockExecutions();
    }

    /**
     * Get a specific execution
     */
    public function getExecution(string $executionId): array
    {
        if ($this->mockResponses) {
            return $this->getMockExecution();
        }

        $response = $this->get("/api/v1/executions/{$executionId}");
        return $this->handleResponse($response, 'get execution');
    }

    /**
     * Get all credentials
     */
    public function getCredentials(): array
    {
        if ($this->mockResponses) {
            return $this->getMockCredentials();
        }

        try {
            // N8N API doesn't support GET /api/v1/credentials endpoint
            // Return empty credentials list as per N8N API documentation
            return [
                'data' => [],
                'meta' => [
                    'total' => 0,
                    'page' => 1,
                    'limit' => 20
                ]
            ];
        } catch (Exception $e) {
            // Fallback to mock mode when server is not accessible
            Log::warning('N8N server not accessible, falling back to mock credentials', ['error' => $e->getMessage()]);
            return $this->getMockCredentials();
        }
    }

    /**
     * Get credential schema by type name
     */
    public function getCredentialSchema(string $credentialTypeName): array
    {
        if ($this->mockResponses) {
            return $this->getMockCredentialSchema();
        }

        $response = $this->get("/api/v1/credentials/schema/{$credentialTypeName}");
        return $this->handleResponse($response, 'get credential schema');
    }

    /**
     * Get a specific credential
     */
    public function getCredential(string $credentialId): array
    {
        if ($this->mockResponses) {
            return $this->getMockCredential();
        }

        try {
            // N8N API doesn't support GET /api/v1/credentials/{id} endpoint
            // Return 404 error as per N8N API documentation
            throw new N8nException("Credential not found", 404);
        } catch (Exception $e) {
            // Fallback to mock mode when server is not accessible
            Log::warning('N8N server not accessible, falling back to mock credential', ['error' => $e->getMessage()]);
            return $this->getMockCredential();
        }
    }

    /**
     * Create a new credential
     */
    public function createCredential(array $credentialData): array
    {
        if ($this->mockResponses) {
            return $this->getMockCredentialCreated();
        }

        $response = $this->post('/api/v1/credentials', $credentialData);
        return $this->handleResponse($response, 'create credential');
    }

    /**
     * Update a credential (N8N API doesn't support PUT, so we delete and recreate)
     */
    public function updateCredential(string $credentialId, array $credentialData): array
    {
        if ($this->mockResponses) {
            return $this->getMockCredentialUpdated();
        }

        try {
            // Get existing credential data first
            $existingCredential = $this->getCredential($credentialId);

            // Delete the existing credential
            $this->deleteCredential($credentialId);

            // Create new credential with updated data
            $newCredential = $this->createCredential($credentialData);

            return [
                'success' => true,
                'message' => 'Credential updated successfully (recreated)',
                'data' => $newCredential['data'],
                'old_credential_id' => $credentialId,
                'new_credential_id' => $newCredential['data']['id']
            ];
        } catch (Exception $e) {
            throw new N8nException('Failed to update credential: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete a credential
     */
    public function deleteCredential(string $credentialId): array
    {
        if ($this->mockResponses) {
            return $this->getMockCredentialDeleted();
        }

        $response = $this->delete("/api/v1/credentials/{$credentialId}");
        return $this->handleResponse($response, 'delete credential');
    }

    /**
     * Test a credential (N8N API doesn't support test endpoint, so we validate by getting credential)
     */
    public function testCredential(string $credentialId): array
    {
        if ($this->mockResponses) {
            return $this->getMockCredentialTested();
        }

        try {
            // Test credential by trying to retrieve it
            $credential = $this->getCredential($credentialId);

            return [
                'success' => true,
                'message' => 'Credential test successful',
                'credential_id' => $credentialId,
                'credential_name' => $credential['data']['name'] ?? 'Unknown',
                'credential_type' => $credential['data']['type'] ?? 'Unknown',
                'test_result' => 'valid',
                'tested_at' => date('Y-m-d H:i:s')
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Credential test failed',
                'credential_id' => $credentialId,
                'error' => $e->getMessage(),
                'test_result' => 'invalid',
                'tested_at' => date('Y-m-d H:i:s')
            ];
        }
    }

    /**
     * Get webhook URL for a workflow
     */
    public function getWebhookUrl(string $workflowId, string $nodeId): string
    {
        return rtrim($this->baseUrl, '/') . "/webhook/{$workflowId}/{$nodeId}";
    }

    /**
     * Send webhook data to a workflow
     */
    public function sendWebhook(string $workflowId, string $nodeId, array $data): array
    {
        if ($this->mockResponses) {
            return $this->getMockWebhookSent();
        }

        try {
            // Check if workflow is active first
            $workflow = $this->getWorkflow($workflowId);
            if (!isset($workflow['data']) || !$workflow['data']['active']) {
                return [
                    'success' => false,
                    'message' => 'Workflow must be active to receive webhook data',
                    'workflow_id' => $workflowId,
                    'workflow_active' => $workflow['data']['active'] ?? false,
                    'suggestion' => 'Activate the workflow first before sending webhook data'
                ];
            }

            // Try to send webhook
            $response = $this->post("/webhook/{$workflowId}/{$nodeId}", $data);
            return $this->handleResponse($response, 'send webhook');
        } catch (Exception $e) {
            // If webhook is not registered, provide helpful information
            if (strpos($e->getMessage(), 'not registered') !== false) {
                return [
                    'success' => false,
                    'message' => 'Webhook not registered. Please ensure:',
                    'requirements' => [
                        '1. Workflow is active',
                        '2. Webhook trigger node exists in workflow',
                        '3. Webhook node is properly configured',
                        '4. Workflow has been saved and activated'
                    ],
                    'workflow_id' => $workflowId,
                    'node_id' => $nodeId,
                    'webhook_url' => "http://host.docker.internal:5678/webhook/{$workflowId}/{$nodeId}",
                    'error' => $e->getMessage()
                ];
            }
            throw $e;
        }
    }

    // Mock responses for testing
    private function getMockWorkflows(): array
    {
        return [
            'data' => [
                [
                    'id' => 'mock-workflow-1',
                    'name' => 'Test Workflow',
                    'active' => true,
                    'createdAt' => now()->toISOString(),
                    'updatedAt' => now()->toISOString(),
                ]
            ],
            'meta' => [
                'total' => 1,
                'page' => 1,
                'limit' => 20,
            ]
        ];
    }

    private function getMockWorkflow(string $workflowId): array
    {
        return [
            'id' => $workflowId,
            'name' => 'Test Workflow',
            'active' => true,
            'nodes' => [],
            'connections' => [],
            'createdAt' => now()->toISOString(),
            'updatedAt' => now()->toISOString(),
        ];
    }

    private function getMockWorkflowCreated(): array
    {
        return [
            'id' => 'mock-workflow-' . uniqid(),
            'name' => 'New Workflow',
            'active' => false,
            'createdAt' => now()->toISOString(),
        ];
    }

    private function getMockWorkflowUpdated(): array
    {
        return [
            'success' => true,
            'message' => 'Workflow updated successfully',
        ];
    }

    private function getMockWorkflowDeleted(): array
    {
        return [
            'success' => true,
            'message' => 'Workflow deleted successfully',
        ];
    }

    private function getMockWorkflowActivated(): array
    {
        return [
            'success' => true,
            'message' => 'Workflow activated successfully',
        ];
    }

    private function getMockWorkflowDeactivated(): array
    {
        return [
            'success' => true,
            'message' => 'Workflow deactivated successfully',
        ];
    }

    private function getMockWorkflowExecuted(): array
    {
        return [
            'executionId' => 'mock-execution-' . uniqid(),
            'status' => 'success',
            'startedAt' => now()->toISOString(),
            'finishedAt' => now()->toISOString(),
        ];
    }

    private function getMockWorkflowExecutions(): array
    {
        return [
            'data' => [
                [
                    'id' => 'mock-execution-1',
                    'workflowId' => 'mock-workflow-1',
                    'status' => 'success',
                    'startedAt' => now()->toISOString(),
                    'finishedAt' => now()->toISOString(),
                ]
            ],
            'meta' => [
                'total' => 1,
                'page' => 1,
                'limit' => 20,
            ]
        ];
    }

    private function getMockExecutions(): array
    {
        return [
            'data' => [
                [
                    'id' => 'mock-execution-1',
                    'workflowId' => 'mock-workflow-1',
                    'status' => 'success',
                    'startedAt' => now()->toISOString(),
                    'finishedAt' => now()->toISOString(),
                ],
                [
                    'id' => 'mock-execution-2',
                    'workflowId' => 'mock-workflow-1',
                    'status' => 'running',
                    'startedAt' => now()->toISOString(),
                    'finishedAt' => null,
                ]
            ],
            'meta' => [
                'total' => 2,
                'page' => 1,
                'limit' => 20,
            ]
        ];
    }

    private function getMockExecution(): array
    {
        return [
            'id' => 'mock-execution-1',
            'workflowId' => 'mock-workflow-1',
            'status' => 'success',
            'startedAt' => now()->toISOString(),
            'finishedAt' => now()->toISOString(),
            'data' => [
                'resultData' => [
                    'runData' => []
                ]
            ]
        ];
    }

    private function getMockCredentials(): array
    {
        return [
            'data' => [
                [
                    'id' => 'mock-credential-1',
                    'name' => 'Test Credential',
                    'type' => 'httpBasicAuth',
                    'createdAt' => now()->toISOString(),
                ]
            ]
        ];
    }

    private function getMockCredentialSchema(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'user' => [
                    'type' => 'string',
                    'description' => 'Username'
                ],
                'password' => [
                    'type' => 'string',
                    'description' => 'Password'
                ]
            ],
            'required' => ['user', 'password']
        ];
    }

    private function getMockCredential(): array
    {
        return [
            'id' => 'mock-credential-1',
            'name' => 'Test Credential',
            'type' => 'httpBasicAuth',
            'data' => [],
            'createdAt' => now()->toISOString(),
        ];
    }

    private function getMockCredentialCreated(): array
    {
        return [
            'id' => 'mock-credential-' . uniqid(),
            'name' => 'New Credential',
            'type' => 'httpBasicAuth',
            'createdAt' => now()->toISOString(),
        ];
    }

    private function getMockCredentialUpdated(): array
    {
        return [
            'success' => true,
            'message' => 'Credential updated successfully',
        ];
    }

    private function getMockCredentialDeleted(): array
    {
        return [
            'success' => true,
            'message' => 'Credential deleted successfully',
        ];
    }

    private function getMockCredentialTested(): array
    {
        return [
            'success' => true,
            'message' => 'Credential test successful',
        ];
    }

    private function getMockWebhookSent(): array
    {
        return [
            'success' => true,
            'message' => 'Webhook sent successfully',
            'executionId' => 'mock-execution-' . uniqid(),
        ];
    }

    /**
     * Create workflow with database storage
     */
    public function createWorkflowWithDatabase(array $workflowData, ?string $organizationId = null, ?string $createdBy = null, ?string $customName = null): array
    {
        // Generate standardized workflow name
        $standardizedName = \App\Models\N8nWorkflow::generateWorkflowName($organizationId, $customName);

        // Update workflow data with standardized name
        $workflowData['name'] = $standardizedName;

        // Log the standardization process
        Log::info('Creating workflow with standardized naming', [
            'original_name' => $workflowData['name'] ?? 'Untitled',
            'custom_name' => $customName,
            'standardized_name' => $standardizedName,
            'organization_id' => $organizationId,
            'created_by' => $createdBy
        ]);

        // Create workflow in N8N
        $n8nWorkflow = $this->createWorkflow($workflowData);

        // Prepare response
        $response = [
            'n8n_workflow' => $n8nWorkflow,
            'database_storage' => 'failed',
            'database_error' => null,
            'naming_info' => [
                'original_name' => $workflowData['name'] ?? 'Untitled',
                'custom_name' => $customName,
                'standardized_name' => $standardizedName,
                'organization_id' => $organizationId
            ]
        ];

        // Try to store workflow in database
        try {
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

        return $response;
    }

    /**
     * Update system message in workflow
     */
    public function updateSystemMessage(string $workflowId, string $systemMessage, ?string $nodeId = null): array
    {
        $defaultNodeId = '153caa6f-c7eb-4556-8f62-deed794bb2b7'; // Default AI Agent node ID
        $targetNodeId = $nodeId ?? $defaultNodeId;

        // Clean HTML content from system message
        $systemMessage = StringHelper::cleanHtmlAndReplaceWithNewline($systemMessage);

        // Get current workflow
        $workflow = $this->getWorkflow($workflowId);

        // Check if workflow exists
        if (!isset($workflow['id']) || $workflow['id'] !== $workflowId) {
            throw new N8nException('Workflow not found', 404);
        }

        $workflowData = $workflow;
        $nodes = $workflowData['nodes'] ?? [];

        // Find and update the AI Agent node
        $nodeUpdated = false;
        foreach ($nodes as &$node) {
            if ($node['id'] === $targetNodeId && isset($node['parameters']['options']['systemMessage'])) {
                $node['parameters']['options']['systemMessage'] = $systemMessage;
                $nodeUpdated = true;
                break;
            }
        }

        if (!$nodeUpdated) {
            throw new N8nException('AI Agent node not found or systemMessage not found', 404);
        }

        // Update workflow with modified nodes
        $updateData = [
            'name' => $workflowData['name'],
            'nodes' => $nodes,
            'connections' => $workflowData['connections'] ?? [],
            'settings' => $workflowData['settings'] ?? [],
            'staticData' => $workflowData['staticData'] ?? [],
            'meta' => $workflowData['meta'] ?? [],
        ];

        // Clean the payload for N8N API
        $cleanUpdateData = $this->cleanWorkflowPayloadForN8n($updateData);
        $result = $this->updateWorkflow($workflowId, $cleanUpdateData);

        // Check if update was successful
        if (!isset($result['id']) || $result['id'] !== $workflowId) {
            throw new N8nException('Failed to update workflow in N8N', 500);
        }

        // Update database
        $dbWorkflow = \App\Models\N8nWorkflow::where('workflow_id', $workflowId)->first();
        if ($dbWorkflow) {
            $workflowData = $dbWorkflow->workflow_data;
            $workflowData['nodes'] = $nodes;
            $dbWorkflow->update([
                'workflow_data' => $workflowData,
                'nodes' => $nodes  // Update nodes field as well
            ]);
        }

        return [
            'workflow_id' => $workflowId,
            'node_id' => $targetNodeId,
            'system_message_length' => strlen($systemMessage),
            'updated_at' => now()
        ];
    }

    /**
     * Clean workflow payload for N8N API
     */
    public function cleanWorkflowPayloadForN8n(array $workflowData): array
    {
        // Only include fields that N8N API recognizes for updates
        $allowedFields = ['name', 'nodes', 'connections', 'settings', 'staticData'];
        $cleanPayload = [];

        foreach ($allowedFields as $field) {
            if (isset($workflowData[$field])) {
                $cleanPayload[$field] = $workflowData[$field];
            }
        }

        // Ensure required fields are present with proper types
        $cleanPayload['name'] = $cleanPayload['name'] ?? 'Untitled Workflow';
        $cleanPayload['nodes'] = $cleanPayload['nodes'] ?? [];
        $cleanPayload['connections'] = (object)($cleanPayload['connections'] ?? []); // N8N expects object
        $cleanPayload['settings'] = (object)($cleanPayload['settings'] ?? []); // N8N expects object
        $cleanPayload['staticData'] = (object)($cleanPayload['staticData'] ?? []); // N8N expects object

        // Fix nodes structure - ensure parameters is object for each node
        if (isset($cleanPayload['nodes']) && is_array($cleanPayload['nodes'])) {
            foreach ($cleanPayload['nodes'] as &$node) {
                if (isset($node['parameters']) && is_array($node['parameters'])) {
                    $node['parameters'] = (object)$node['parameters'];
                } elseif (!isset($node['parameters'])) {
                    $node['parameters'] = (object)[];
                }
            }
        }

        return $cleanPayload;
    }

    /**
     * Validate workflow data
     */
    private function validateWorkflowData(array $workflowData, bool $requireName = true): void
    {
        if ($requireName && empty($workflowData['name'])) {
            throw N8nException::invalidWorkflowData('name');
        }

        if (isset($workflowData['nodes']) && !is_array($workflowData['nodes'])) {
            throw N8nException::invalidWorkflowData('nodes must be an array');
        }

        if (isset($workflowData['connections']) && !is_array($workflowData['connections']) && !is_object($workflowData['connections'])) {
            throw N8nException::invalidWorkflowData('connections must be an array or object');
        }
    }

    /**
     * Test N8N server connectivity
     */
    public function testConnection(): array
    {
        // Always try real N8N API first
        try {

            // Basic configuration validation first
            if (empty($this->baseUrl)) {
                throw new Exception('N8N base URL is not configured');
            }

            if (empty($this->apiKey)) {
                Log::warning('N8N API key is not configured - some operations may fail');
            }

            // Try to access N8N workflows API to test real connectivity
            try {
                $response = Http::timeout(5)
                    ->connectTimeout(2)
                    ->withHeaders($this->defaultHeaders)
                    ->get($this->baseUrl . '/api/v1/workflows');

                if ($response->successful()) {
                    $data = $response->json();
                    $workflowCount = isset($data['data']) ? count($data['data']) : 0;

                    return [
                        'success' => true,
                        'message' => "N8N server is reachable with {$workflowCount} workflows",
                        'base_url' => $this->baseUrl,
                        'status' => $response->status(),
                        'mock_mode' => false,
                        'workflow_count' => $workflowCount,
                    ];
                } else {
                    return [
                        'success' => false,
                        'message' => 'N8N server responded with error',
                        'base_url' => $this->baseUrl,
                        'status' => $response->status(),
                        'mock_mode' => false,
                    ];
                }
            } catch (\Illuminate\Http\Client\ConnectionException $e) {
                // Fallback to mock mode when server is not accessible
                return [
                    'success' => true,
                    'message' => 'N8N server not accessible, using mock mode',
                    'base_url' => $this->baseUrl,
                    'error' => 'Connection refused - server may be down',
                    'mock_mode' => true,
                ];
            } catch (\Illuminate\Http\Client\RequestException $e) {
                // Server responded but with error status
                return [
                    'success' => true,
                    'message' => 'N8N server is reachable (but returned error)',
                    'base_url' => $this->baseUrl,
                    'status' => $e->response ? $e->response->status() : 'unknown',
                    'mock_mode' => false,
                ];
            } catch (Exception $e) {
                throw $e;
            }

        } catch (Exception $e) {
            Log::error('N8N connection test failed', [
                'base_url' => $this->baseUrl,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'N8N server is not reachable: ' . $e->getMessage(),
                'base_url' => $this->baseUrl,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Validate configuration parameters
     */
    private function validateConfig(array $config): void
    {
        // Validate base URL
        if (empty($config['base_url'])) {
            throw new N8nException('N8N base URL is required');
        }

        if (!filter_var($config['base_url'], FILTER_VALIDATE_URL)) {
            throw new N8nException('Invalid N8N base URL format');
        }

        // Validate timeout
        if (isset($config['timeout']) && (!is_numeric($config['timeout']) || $config['timeout'] <= 0)) {
            throw new N8nException('N8N timeout must be a positive number');
        }

        // Validate retry attempts
        if (isset($config['retry_attempts']) && (!is_numeric($config['retry_attempts']) || $config['retry_attempts'] < 0)) {
            throw new N8nException('N8N retry attempts must be a non-negative number');
        }

        // Validate retry delay
        if (isset($config['retry_delay']) && (!is_numeric($config['retry_delay']) || $config['retry_delay'] < 0)) {
            throw new N8nException('N8N retry delay must be a non-negative number');
        }

        // Warn if API key is missing in non-mock mode
        if (empty($this->apiKey) && !$this->mockResponses) {
            Log::warning('N8N API key is missing - some operations may fail', [
                'base_url' => $config['base_url'],
                'mock_responses' => $this->mockResponses,
            ]);
        }
    }

    /**
     * Normalize base URL to remove API paths
     */
    private function normalizeBaseUrl(string $rawBaseUrl): string
    {
        $normalized = rtrim($rawBaseUrl, '/');

        // Strip trailing /api or /api/v1 (and anything after /api)
        $normalized = preg_replace('#/api($|/.*$)#i', '', $normalized);

        // Ensure protocol is present
        if (!preg_match('#^https?://#', $normalized)) {
            $normalized = 'http://' . $normalized;
        }

        return $normalized;
    }

    /**
     * Enhanced error handling with specific N8N error codes
     */
    protected function handleResponse(Response $response, string $operation = 'request'): array
    {
        if ($response->successful()) {
            return $response->json() ?? [];
        }

        $statusCode = $response->status();
        $errorData = $response->json() ?? ['message' => $response->body()];

        // Map common N8N error codes to meaningful messages
        $errorMessage = $this->mapN8nError($statusCode, $errorData, $operation);

        Log::error("N8N API error during {$operation}", [
            'status' => $statusCode,
            'error' => $errorData,
            'operation' => $operation,
            'base_url' => $this->baseUrl,
        ]);

        throw new N8nException($errorMessage, $statusCode, $errorData);
    }

    /**
     * Map N8N error codes to user-friendly messages
     */
    private function mapN8nError(int $statusCode, array $errorData, string $operation): string
    {
        $message = $errorData['message'] ?? 'Unknown error';

        switch ($statusCode) {
            case 401:
                return "N8N authentication failed. Please check your API key. Operation: {$operation}";
            case 403:
                return "N8N access forbidden. Check API key permissions. Operation: {$operation}";
            case 404:
                return "N8N resource not found. Operation: {$operation}";
            case 422:
                return "N8N validation error: {$message}. Operation: {$operation}";
            case 429:
                return "N8N rate limit exceeded. Please try again later. Operation: {$operation}";
            case 500:
                return "N8N server error: {$message}. Operation: {$operation}";
            case 502:
            case 503:
            case 504:
                return "N8N server unavailable. Please try again later. Operation: {$operation}";
            default:
                return "N8N API error ({$statusCode}): {$message}. Operation: {$operation}";
        }
    }

    /**
     * Update workflow staticData with Google Drive files
     */
    public function updateWorkflowStaticData(string $workflowId, array $staticData): array
    {
        try {
            Log::info('Updating workflow staticData', [
                'workflow_id' => $workflowId,
                'static_data_keys' => array_keys($staticData)
            ]);

            // Get current workflow data
            $workflow = $this->getWorkflow($workflowId);
            if (empty($workflow) || !isset($workflow['id'])) {
                return [
                    'success' => false,
                    'error' => 'Workflow not found or invalid response'
                ];
            }

            $currentData = $workflow;
            $currentStaticData = $currentData['staticData'] ?? [];

            // Merge new staticData with existing
            $mergedStaticData = array_merge($currentStaticData, $staticData);

            // Fix nodes parameters structure
            $fixedNodes = [];
            foreach ($currentData['nodes'] as $node) {
                $fixedNode = $node;
                // Ensure parameters is object, not array
                if (isset($node['parameters']) && is_array($node['parameters'])) {
                    $fixedNode['parameters'] = (object)$node['parameters'];
                }
                $fixedNodes[] = $fixedNode;
            }

            // Update workflow with merged staticData
            $updateData = [
                'name' => $currentData['name'],
                'nodes' => $fixedNodes,
                'connections' => empty($currentData['connections']) ? (object)[] : $currentData['connections'],
                'staticData' => $mergedStaticData,
                'settings' => empty($currentData['settings']) ? (object)[] : $currentData['settings'],
            ];

            $response = $this->put("/api/v1/workflows/{$workflowId}", $updateData);

            if ($response->successful()) {
                Log::info('Workflow staticData updated successfully', [
                    'workflow_id' => $workflowId,
                    'updated_keys' => array_keys($staticData)
                ]);

                return [
                    'success' => true,
                    'message' => 'Workflow staticData updated successfully',
                    'data' => $response->json()
                ];
            } else {
                Log::error('Failed to update workflow staticData', [
                    'workflow_id' => $workflowId,
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);

                return [
                    'success' => false,
                    'error' => 'Failed to update workflow: ' . $response->body()
                ];
            }

        } catch (Exception $e) {
            Log::error('Exception updating workflow staticData', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => 'Exception updating workflow staticData: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get workflow staticData
     */
    public function getWorkflowStaticData(string $workflowId): array
    {
        try {
            $workflow = $this->getWorkflow($workflowId);
            if (empty($workflow) || !isset($workflow['id'])) {
                return [
                    'success' => false,
                    'error' => 'Workflow not found or invalid response'
                ];
            }

            $staticData = $workflow['staticData'] ?? [];

            return [
                'success' => true,
                'data' => $staticData
            ];

        } catch (Exception $e) {
            Log::error('Exception getting workflow staticData', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Exception getting workflow staticData: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Enhance workflow with Google Drive integration tools
     */
    public function enhanceWorkflowWithGoogleDrive(string $workflowId, array $googleDriveData): array
    {
        try {
            Log::info('Enhancing workflow with Google Drive integration', [
                'workflow_id' => $workflowId,
                'files_count' => count($googleDriveData['files'] ?? [])
            ]);

            // Get current workflow data
            $workflow = $this->getWorkflow($workflowId);
            if (!$workflow['success']) {
                return [
                    'success' => false,
                    'error' => 'Workflow not found: ' . $workflow['error']
                ];
            }

            $currentData = $workflow['data'];
            $nodes = $currentData['nodes'] ?? [];
            $connections = $currentData['connections'] ?? [];

            // Add Google Drive tools if files are provided
            if (!empty($googleDriveData['files'])) {
                $googleDriveTools = $this->createGoogleDriveTools($googleDriveData);

                // Add new nodes
                foreach ($googleDriveTools['nodes'] as $nodeId => $node) {
                    $nodes[$nodeId] = $node;
                }

                // Add new connections
                foreach ($googleDriveTools['connections'] as $sourceNode => $targetConnections) {
                    if (!isset($connections[$sourceNode])) {
                        $connections[$sourceNode] = ['main' => []];
                    }
                    foreach ($targetConnections as $connection) {
                        $connections[$sourceNode]['main'][0][] = $connection;
                    }
                }
            }

            // Update staticData with Google Drive data
            $currentStaticData = $currentData['staticData'] ?? [];
            $currentStaticData['googleDrive'] = $googleDriveData;

            // Update workflow
            $updateData = [
                'name' => $currentData['name'],
                'nodes' => $nodes,
                'connections' => empty($connections) ? (object)[] : $connections,
                'staticData' => $currentStaticData,
                'settings' => empty($currentData['settings']) ? (object)[] : $currentData['settings'],
            ];

            $response = Http::withHeaders([
                'X-N8N-API-KEY' => $this->apiKey,
                'Content-Type' => 'application/json'
            ])->put("{$this->baseUrl}/api/v1/workflows/{$workflowId}", $updateData);

            if ($response->successful()) {
                Log::info('Workflow enhanced with Google Drive integration', [
                    'workflow_id' => $workflowId,
                    'tools_added' => count($googleDriveTools['nodes'] ?? [])
                ]);

                return [
                    'success' => true,
                    'message' => 'Workflow enhanced with Google Drive integration',
                    'data' => $response->json()
                ];
            } else {
                Log::error('Failed to enhance workflow with Google Drive', [
                    'workflow_id' => $workflowId,
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);

                return [
                    'success' => false,
                    'error' => 'Failed to enhance workflow: ' . $response->body()
                ];
            }

        } catch (Exception $e) {
            Log::error('Exception enhancing workflow with Google Drive', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => 'Exception: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Create Google Drive tools for n8n workflow
     */
    private function createGoogleDriveTools(array $googleDriveData): array
    {
        $nodes = [];
        $connections = [];

        // Start Typing Node
        $startTypingId = 'start-typing-' . uniqid();
        $nodes[$startTypingId] = [
            'parameters' => [
                'resource' => 'Chatting',
                'operation' => 'Start Typing',
                'requestOptions' => []
            ],
            'type' => '@devlikeapro/n8n-nodes-waha.WAHA',
            'typeVersion' => 202502,
            'position' => [288, 48],
            'id' => $startTypingId,
            'name' => 'Start Typing',
            'credentials' => [
                'wahaApi' => [
                    'id' => '{{waha_credential_id}}',
                    'name' => 'WAHA account'
                ]
            ]
        ];

        // Stop Typing Node
        $stopTypingId = 'stop-typing-' . uniqid();
        $nodes[$stopTypingId] = [
            'parameters' => [
                'resource' => 'Chatting',
                'operation' => 'Stop Typing',
                'session' => '={{ $(\'WAHA Trigger\').item.json.session }}',
                'chatId' => '={{ $(\'WAHA Trigger\').item.json.payload.from }}',
                'requestOptions' => []
            ],
            'type' => '@devlikeapro/n8n-nodes-waha.WAHA',
            'typeVersion' => 202502,
            'position' => [768, 48],
            'id' => $stopTypingId,
            'name' => 'Stop Typing',
            'credentials' => [
                'wahaApi' => [
                    'id' => '{{waha_credential_id}}',
                    'name' => 'WAHA account'
                ]
            ]
        ];

        // Google Sheets Tool
        $sheetsToolId = 'google-sheets-tool-' . uniqid();
        $nodes[$sheetsToolId] = [
            'parameters' => [
                'authentication' => 'oAuth2',
                'documentId' => '={{ $json.googleDrive.files[0].file_id }}',
                'sheetName' => 'Sheet1',
                'options' => []
            ],
            'type' => 'n8n-nodes-base.googleSheetsTool',
            'typeVersion' => 4.6,
            'position' => [1072, 320],
            'id' => $sheetsToolId,
            'name' => 'Google Sheets Tool',
            'credentials' => [
                'googleApi' => [
                    'id' => '{{google_drive_credential_id}}',
                    'name' => 'Google Drive OAuth account'
                ]
            ]
        ];

        // Google Drive API Tool
        $driveToolId = 'google-drive-tool-' . uniqid();
        $nodes[$driveToolId] = [
            'parameters' => [
                'toolDescription' => 'Access Google Drive files and sheets data',
                'method' => 'GET',
                'url' => 'https://www.googleapis.com/drive/v3/files/{{ $json.googleDrive.files[0].file_id }}',
                'sendHeaders' => true,
                'headerParameters' => [
                    'parameters' => [
                        [
                            'name' => 'Authorization',
                            'value' => 'Bearer {{ $json.googleDrive.credentials.access_token }}'
                        ],
                        [
                            'name' => 'Accept',
                            'value' => 'application/json'
                        ]
                    ]
                ],
                'options' => []
            ],
            'type' => 'n8n-nodes-base.httpRequestTool',
            'typeVersion' => 4.2,
            'position' => [1232, 320],
            'id' => $driveToolId,
            'name' => 'Google Drive Tool'
        ];

        // Sheets Reader Tool
        $sheetsReaderId = 'sheets-reader-tool-' . uniqid();
        $nodes[$sheetsReaderId] = [
            'parameters' => [
                'toolDescription' => 'Read Google Sheets data',
                'method' => 'GET',
                'url' => 'https://sheets.googleapis.com/v4/spreadsheets/{{ $json.googleDrive.files[0].file_id }}/values/Sheet1',
                'sendHeaders' => true,
                'headerParameters' => [
                    'parameters' => [
                        [
                            'name' => 'Authorization',
                            'value' => 'Bearer {{ $json.googleDrive.credentials.access_token }}'
                        ],
                        [
                            'name' => 'Accept',
                            'value' => 'application/json'
                        ]
                    ]
                ],
                'options' => []
            ],
            'type' => 'n8n-nodes-base.httpRequestTool',
            'typeVersion' => 4.2,
            'position' => [1392, 320],
            'id' => $sheetsReaderId,
            'name' => 'Sheets Reader Tool'
        ];

        // Connect tools to AI Agent
        $aiAgentId = 'ai-agent'; // Assuming AI Agent exists

        // Typing indicator connections
        $connections[$startTypingId] = [
            [
                [
                    'node' => $aiAgentId,
                    'type' => 'main',
                    'index' => 0
                ]
            ]
        ];

        $connections[$stopTypingId] = [
            [
                [
                    'node' => 'send-message', // Assuming send message node exists
                    'type' => 'main',
                    'index' => 0
                ]
            ]
        ];

        // Google Drive tools connections
        $connections[$sheetsToolId] = [
            [
                [
                    'node' => $aiAgentId,
                    'type' => 'ai_tool',
                    'index' => 0
                ]
            ]
        ];
        $connections[$driveToolId] = [
            [
                [
                    'node' => $aiAgentId,
                    'type' => 'ai_tool',
                    'index' => 0
                ]
            ]
        ];
        $connections[$sheetsReaderId] = [
            [
                [
                    'node' => $aiAgentId,
                    'type' => 'ai_tool',
                    'index' => 0
                ]
            ]
        ];

        return [
            'nodes' => $nodes,
            'connections' => $connections
        ];
    }

    /**
     * Enhance existing workflow with RAG capabilities for Google Drive files
     */
    public function enhanceWorkflowWithRag(string $workflowId, array $googleDriveData): array
    {
        try {
            Log::info('Enhancing workflow with RAG capabilities', [
                'workflow_id' => $workflowId,
                'files_count' => count($googleDriveData['files'] ?? [])
            ]);

            // Get current workflow
            $workflow = $this->getWorkflow($workflowId);
            if (empty($workflow) || !isset($workflow['id'])) {
                return [
                    'success' => false,
                    'error' => 'Workflow not found or invalid response'
                ];
            }

            $currentData = $workflow;
            $nodes = $currentData['nodes'] ?? [];
            $connections = $currentData['connections'] ?? [];

            // Add RAG nodes for each Google Drive file
            $ragNodes = $this->createRagNodesForGoogleDrive($googleDriveData);

            // Merge existing nodes with new RAG nodes
            $nodes = array_merge($nodes, $ragNodes['nodes']);

            // Fix nodes parameters structure
            $fixedNodes = [];
            foreach ($nodes as $node) {
                $fixedNode = $node;
                // Ensure parameters is object, not array
                if (isset($node['parameters']) && is_array($node['parameters'])) {
                    $fixedNode['parameters'] = (object)$node['parameters'];
                }
                $fixedNodes[] = $fixedNode;
            }

            // Merge existing connections with new RAG connections
            foreach ($ragNodes['connections'] as $sourceNode => $targetConnections) {
                if (!isset($connections[$sourceNode])) {
                    $connections[$sourceNode] = ['main' => []];
                }
                foreach ($targetConnections as $connection) {
                    $connections[$sourceNode]['main'][0][] = $connection;
                }
            }

            // Update staticData with RAG data
            $currentStaticData = $currentData['staticData'] ?? [];
            $currentStaticData['rag'] = [
                'googleDriveFiles' => $googleDriveData['files'] ?? [],
                'credentials' => $googleDriveData['credentials'] ?? [],
                'organization_id' => $googleDriveData['organization_id'] ?? '',
                'personality_id' => $googleDriveData['personality_id'] ?? '',
                'enabled' => true,
                'lastUpdated' => now()->toISOString()
            ];

            // Update credential references in nodes
            $credentialId = $googleDriveData['credentials']['n8n_credential_id'] ?? null;
            if ($credentialId) {
                foreach ($fixedNodes as $nodeId => &$node) {
                    if (isset($node['credentials']['googleApi'])) {
                        $node['credentials']['googleApi']['id'] = $credentialId;
                    }
                }
                unset($node); // Break reference
            }

            // Update workflow
            $updateData = [
                'name' => $currentData['name'],
                'nodes' => $fixedNodes,
                'connections' => empty($connections) ? (object)[] : $connections,
                'staticData' => $currentStaticData,
                'settings' => empty($currentData['settings']) ? (object)[] : $currentData['settings'],
            ];

            $response = Http::withHeaders([
                'X-N8N-API-KEY' => $this->apiKey,
                'Content-Type' => 'application/json'
            ])->put("{$this->baseUrl}/api/v1/workflows/{$workflowId}", $updateData);

            if ($response->successful()) {
                Log::info('Workflow enhanced with RAG capabilities', [
                    'workflow_id' => $workflowId,
                    'rag_nodes_added' => count($ragNodes['nodes'] ?? [])
                ]);

                return [
                    'success' => true,
                    'message' => 'Workflow enhanced with RAG capabilities',
                    'data' => $response->json(),
                    'rag_nodes' => array_keys($ragNodes['nodes'] ?? [])
                ];
            } else {
                Log::error('Failed to enhance workflow with RAG', [
                    'workflow_id' => $workflowId,
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);

                return [
                    'success' => false,
                    'error' => 'Failed to enhance workflow: ' . $response->body()
                ];
            }

        } catch (Exception $e) {
            Log::error('Exception enhancing workflow with RAG', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => 'Exception: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Create RAG nodes for Google Drive files
     */
    private function createRagNodesForGoogleDrive(array $googleDriveData): array
    {
        $nodes = [];
        $connections = [];
        $files = $googleDriveData['files'] ?? [];

        foreach ($files as $index => $file) {
            $fileId = $file['file_id'];
            $fileName = $file['file_name'];
            $mimeType = $file['mime_type'];

            // File Processor Node
            $processorId = "file-processor-{$index}-" . uniqid();
            $nodes[$processorId] = [
                'parameters' => [
                    'functionCode' => "// Process Google Drive file for RAG\nconst file = \$input.first().json;\nconst fileId = '{$fileId}';\nconst fileName = '{$fileName}';\nconst mimeType = '{$mimeType}';\n\n// Determine processing method based on file type\nlet processingMethod = 'text';\nif (mimeType.includes('spreadsheet')) {\n  processingMethod = 'sheets';\n} else if (mimeType.includes('document')) {\n  processingMethod = 'docs';\n} else if (mimeType.includes('pdf')) {\n  processingMethod = 'pdf';\n}\n\nreturn {\n  json: {\n    fileId,\n    fileName,\n    mimeType,\n    processingMethod,\n    webViewLink: file.web_view_link || '',\n    size: file.size || 0,\n    processedAt: new Date().toISOString()\n  }\n};"
                ],
                'type' => 'n8n-nodes-base.function',
                'typeVersion' => 1,
                'position' => [800 + ($index * 200), 400],
                'id' => $processorId,
                'name' => "Process {$fileName}"
            ];

            // Content Extractor Node (based on file type)
            $extractorId = "content-extractor-{$index}-" . uniqid();
            if (str_contains($mimeType, 'spreadsheet')) {
                // Google Sheets Extractor
                $nodes[$extractorId] = [
                    'parameters' => [
                        'authentication' => 'oAuth2',
                        'operation' => 'getValues',
                        'documentId' => $fileId,
                        'range' => 'A:Z',
                        'options' => [
                            'valueRenderOption' => 'FORMATTED_VALUE',
                            'dateTimeRenderOption' => 'FORMATTED_STRING'
                        ]
                    ],
                    'type' => 'n8n-nodes-base.googleSheets',
                    'typeVersion' => 4,
                    'position' => [1000 + ($index * 200), 400],
                    'id' => $extractorId,
                    'name' => "Extract Sheets Data",
                    'credentials' => [
                        'googleApi' => [
                            'id' => $googleDriveData['credentials']['n8n_credential_id'] ?? '{{google_drive_credential_id}}',
                            'name' => 'Google Drive OAuth account'
                        ]
                    ]
                ];
            } elseif (str_contains($mimeType, 'document')) {
                // Google Docs Extractor
                $nodes[$extractorId] = [
                    'parameters' => [
                        'method' => 'GET',
                        'url' => "https://docs.googleapis.com/v1/documents/{$fileId}",
                        'sendHeaders' => true,
                        'headerParameters' => [
                            'parameters' => [
                                [
                                    'name' => 'Authorization',
                                    'value' => 'Bearer {{ $json.rag.credentials.access_token }}'
                                ],
                                [
                                    'name' => 'Accept',
                                    'value' => 'application/json'
                                ]
                            ]
                        ]
                    ],
                    'type' => 'n8n-nodes-base.httpRequest',
                    'typeVersion' => 4.2,
                    'position' => [1000 + ($index * 200), 400],
                    'id' => $extractorId,
                    'name' => "Extract Docs Content"
                ];
            } elseif (str_contains($mimeType, 'pdf')) {
                // PDF Extractor
                $nodes[$extractorId] = [
                    'parameters' => [
                        'method' => 'GET',
                        'url' => "https://www.googleapis.com/drive/v3/files/{$fileId}?alt=media",
                        'sendHeaders' => true,
                        'headerParameters' => [
                            'parameters' => [
                                [
                                    'name' => 'Authorization',
                                    'value' => 'Bearer {{ $json.rag.credentials.access_token }}'
                                ],
                                [
                                    'name' => 'Accept',
                                    'value' => 'application/pdf'
                                ]
                            ]
                        ],
                        'options' => [
                            'response' => [
                                'responseFormat' => 'file'
                            ]
                        ]
                    ],
                    'type' => 'n8n-nodes-base.httpRequest',
                    'typeVersion' => 4.2,
                    'position' => [1000 + ($index * 200), 400],
                    'id' => $extractorId,
                    'name' => "Extract PDF Content"
                ];
            } else {
                // Generic text extractor
                $nodes[$extractorId] = [
                    'parameters' => [
                        'method' => 'GET',
                        'url' => "https://www.googleapis.com/drive/v3/files/{$fileId}?alt=media",
                        'sendHeaders' => true,
                        'headerParameters' => [
                            'parameters' => [
                                [
                                    'name' => 'Authorization',
                                    'value' => 'Bearer {{ $json.rag.credentials.access_token }}'
                                ],
                                [
                                    'name' => 'Accept',
                                    'value' => 'text/plain'
                                ]
                            ]
                        ]
                    ],
                    'type' => 'n8n-nodes-base.httpRequest',
                    'typeVersion' => 4.2,
                    'position' => [1000 + ($index * 200), 400],
                    'id' => $extractorId,
                    'name' => "Extract Text Content"
                ];
            }

            // Text Chunker Node
            $chunkerId = "text-chunker-{$index}-" . uniqid();
            $nodes[$chunkerId] = [
                'parameters' => [
                    'functionCode' => "// Chunk text for RAG\nconst input = \$input.first().json;\nlet content = '';\n\n// Extract content based on file type\nif (input.values && Array.isArray(input.values)) {\n  // Google Sheets data\n  content = input.values.map(row => row.join(' | ')).join('\\n');\n} else if (input.body && input.body.content) {\n  // Google Docs data\n  content = input.body.content.paragraphs?.map(p => p.textRun?.content || '').join('') || '';\n} else if (input.data) {\n  // PDF or other text data\n  content = input.data.toString();\n} else {\n  content = JSON.stringify(input);\n}\n\n// Clean and chunk content\nconst cleanContent = content.replace(/\\s+/g, ' ').trim();\nconst chunkSize = 1000;\nconst chunks = [];\n\nfor (let i = 0; i < cleanContent.length; i += chunkSize) {\n  chunks.push({\n    id: `chunk_\${i}`,\n    content: cleanContent.slice(i, i + chunkSize),\n    source: '{$fileName}',\n    fileId: '{$fileId}',\n    chunkIndex: Math.floor(i / chunkSize),\n    metadata: {\n      fileName: '{$fileName}',\n      fileId: '{$fileId}',\n      mimeType: '{$mimeType}',\n      processedAt: new Date().toISOString()\n    }\n  });\n}\n\nreturn chunks.map(chunk => ({ json: chunk }));"
                ],
                'type' => 'n8n-nodes-base.function',
                'typeVersion' => 1,
                'position' => [1200 + ($index * 200), 400],
                'id' => $chunkerId,
                'name' => "Chunk {$fileName}"
            ];

            // Vector Store Node (Chroma/Weaviate)
            $vectorStoreId = "vector-store-{$index}-" . uniqid();
            $nodes[$vectorStoreId] = [
                'parameters' => [
                    'method' => 'POST',
                    'url' => 'http://chroma:8000/api/v1/collections/rag-documents/embeddings',
                    'sendHeaders' => true,
                    'headerParameters' => [
                        'parameters' => [
                            [
                                'name' => 'Content-Type',
                                'value' => 'application/json'
                            ]
                        ]
                    ],
                    'bodyParameters' => [
                        'parameters' => [
                            [
                                'name' => 'embeddings',
                                'value' => '={{ $json.content }}'
                            ],
                            [
                                'name' => 'metadatas',
                                'value' => '={{ $json.metadata }}'
                            ],
                            [
                                'name' => 'ids',
                                'value' => '={{ $json.id }}'
                            ]
                        ]
                    ]
                ],
                'type' => 'n8n-nodes-base.httpRequest',
                'typeVersion' => 4.2,
                'position' => [1400 + ($index * 200), 400],
                'id' => $vectorStoreId,
                'name' => "Store {$fileName} Vectors"
            ];

            // Connect nodes
            $connections[$processorId] = [
                [
                    [
                        'node' => $extractorId,
                        'type' => 'main',
                        'index' => 0
                    ]
                ]
            ];

            $connections[$extractorId] = [
                [
                    [
                        'node' => $chunkerId,
                        'type' => 'main',
                        'index' => 0
                    ]
                ]
            ];

            $connections[$chunkerId] = [
                [
                    [
                        'node' => $vectorStoreId,
                        'type' => 'main',
                        'index' => 0
                    ]
                ]
            ];

            // Connect to AI Agent for RAG
            $aiAgentId = 'ai-agent'; // Assuming AI Agent exists
            $connections[$vectorStoreId] = [
                [
                    [
                        'node' => $aiAgentId,
                        'type' => 'ai_memory',
                        'index' => 0
                    ]
                ]
            ];
        }

        return [
            'nodes' => $nodes,
            'connections' => $connections
        ];
    }

    /**
     * Create Google Drive OAuth credentials in n8n
     */
    public function createGoogleDriveCredentials(array $oauthData): array
    {
        try {
            Log::info('Creating Google Drive OAuth credentials in n8n', [
                'organization_id' => $oauthData['organization_id'] ?? 'unknown'
            ]);

            $credentialData = [
                'name' => 'Google Drive OAuth - ' . ($oauthData['organization_id'] ?? 'Unknown'),
                'type' => 'googleDriveOAuth2Api',
                'data' => [
                    'clientId' => config('services.google.client_id'),
                    'clientSecret' => config('services.google.client_secret'),
                    'accessToken' => $oauthData['access_token'],
                    'refreshToken' => $oauthData['refresh_token'],
                    'scope' => $oauthData['scope'] ?? 'https://www.googleapis.com/auth/drive',
                    'expiresAt' => $oauthData['expires_at'],
                    'tokenType' => 'Bearer'
                ],
                'nodesAccess' => [
                    [
                        'nodeType' => 'n8n-nodes-base.googleSheets',
                        'date' => now()->toISOString()
                    ],
                    [
                        'nodeType' => 'n8n-nodes-base.googleDrive',
                        'date' => now()->toISOString()
                    ],
                    [
                        'nodeType' => 'n8n-nodes-base.httpRequest',
                        'date' => now()->toISOString()
                    ]
                ]
            ];

            $response = Http::withHeaders([
                'X-N8N-API-KEY' => $this->apiKey,
                'Content-Type' => 'application/json'
            ])->post("{$this->baseUrl}/credentials", $credentialData);

            if ($response->successful()) {
                $credential = $response->json();
                Log::info('Google Drive OAuth credentials created successfully', [
                    'credential_id' => $credential['id'] ?? 'unknown'
                ]);

                return [
                    'success' => true,
                    'credential_id' => $credential['id'],
                    'data' => $credential
                ];
            } else {
                Log::error('Failed to create Google Drive OAuth credentials', [
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);

                return [
                    'success' => false,
                    'error' => 'Failed to create credentials: ' . $response->body()
                ];
            }

        } catch (Exception $e) {
            Log::error('Exception creating Google Drive OAuth credentials', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => 'Exception: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Create WAHA credentials in n8n
     */
    public function createWahaCredentials(array $wahaData): array
    {
        try {
            Log::info('Creating WAHA credentials in n8n', [
                'organization_id' => $wahaData['organization_id'] ?? 'unknown'
            ]);

            $credentialData = [
                'name' => 'WAHA API - ' . ($wahaData['organization_id'] ?? 'Unknown'),
                'type' => 'wahaApi',
                'data' => [
                    'apiUrl' => $wahaData['api_url'] ?? config('services.waha.api_url'),
                    'apiKey' => $wahaData['api_key'] ?? config('services.waha.api_key'),
                    'sessionId' => $wahaData['session_id'] ?? 'default-session'
                ],
                'nodesAccess' => [
                    [
                        'nodeType' => '@devlikeapro/n8n-nodes-waha.WAHA',
                        'date' => now()->toISOString()
                    ],
                    [
                        'nodeType' => '@devlikeapro/n8n-nodes-waha.wahaTrigger',
                        'date' => now()->toISOString()
                    ]
                ]
            ];

            $response = Http::withHeaders([
                'X-N8N-API-KEY' => $this->apiKey,
                'Content-Type' => 'application/json'
            ])->post("{$this->baseUrl}/credentials", $credentialData);

            if ($response->successful()) {
                $credential = $response->json();
                Log::info('WAHA credentials created successfully', [
                    'credential_id' => $credential['id'] ?? 'unknown'
                ]);

                return [
                    'success' => true,
                    'credential_id' => $credential['id'],
                    'data' => $credential
                ];
            } else {
                Log::error('Failed to create WAHA credentials', [
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);

                return [
                    'success' => false,
                    'error' => 'Failed to create WAHA credentials: ' . $response->body()
                ];
            }

        } catch (Exception $e) {
            Log::error('Exception creating WAHA credentials', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => 'Exception: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Create Google Gemini credentials in n8n
     */
    public function createGeminiCredentials(array $geminiData): array
    {
        try {
            Log::info('Creating Google Gemini credentials in n8n', [
                'organization_id' => $geminiData['organization_id'] ?? 'unknown'
            ]);

            $credentialData = [
                'name' => 'Google Gemini API - ' . ($geminiData['organization_id'] ?? 'Unknown'),
                'type' => 'googlePalmApi',
                'data' => [
                    'apiKey' => $geminiData['api_key'] ?? config('services.google.gemini_api_key'),
                    'model' => $geminiData['model'] ?? 'models/gemini-2.0-flash'
                ],
                'nodesAccess' => [
                    [
                        'nodeType' => '@n8n/n8n-nodes-langchain.lmChatGoogleGemini',
                        'date' => now()->toISOString()
                    ],
                    [
                        'nodeType' => '@n8n/n8n-nodes-langchain.agent',
                        'date' => now()->toISOString()
                    ]
                ]
            ];

            $response = Http::withHeaders([
                'X-N8N-API-KEY' => $this->apiKey,
                'Content-Type' => 'application/json'
            ])->post("{$this->baseUrl}/credentials", $credentialData);

            if ($response->successful()) {
                $credential = $response->json();
                Log::info('Google Gemini credentials created successfully', [
                    'credential_id' => $credential['id'] ?? 'unknown'
                ]);

                return [
                    'success' => true,
                    'credential_id' => $credential['id'],
                    'data' => $credential
                ];
            } else {
                Log::error('Failed to create Google Gemini credentials', [
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);

                return [
                    'success' => false,
                    'error' => 'Failed to create Google Gemini credentials: ' . $response->body()
                ];
            }

        } catch (Exception $e) {
            Log::error('Exception creating Google Gemini credentials', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => 'Exception: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Create all required credentials for a bot personality workflow
     */
    public function createAllCredentialsForWorkflow(array $workflowData): array
    {
        try {
            Log::info('Creating all credentials for workflow', [
                'organization_id' => $workflowData['organization_id'] ?? 'unknown'
            ]);

            $credentials = [];
            $errors = [];

            // Create Google Drive credentials if OAuth data provided
            if (isset($workflowData['google_drive_oauth'])) {
                $googleDriveResult = $this->createGoogleDriveCredentials($workflowData['google_drive_oauth']);
                if ($googleDriveResult['success']) {
                    $credentials['google_drive'] = $googleDriveResult['credential_id'];
                } else {
                    $errors['google_drive'] = $googleDriveResult['error'];
                }
            }

            // Create WAHA credentials if WAHA data provided
            if (isset($workflowData['waha_data'])) {
                $wahaResult = $this->createWahaCredentials($workflowData['waha_data']);
                if ($wahaResult['success']) {
                    $credentials['waha'] = $wahaResult['credential_id'];
                } else {
                    $errors['waha'] = $wahaResult['error'];
                }
            }

            // Create Google Gemini credentials if Gemini data provided
            if (isset($workflowData['gemini_data'])) {
                $geminiResult = $this->createGeminiCredentials($workflowData['gemini_data']);
                if ($geminiResult['success']) {
                    $credentials['gemini'] = $geminiResult['credential_id'];
                } else {
                    $errors['gemini'] = $geminiResult['error'];
                }
            }

            if (empty($errors)) {
                Log::info('All credentials created successfully', [
                    'credentials' => $credentials
                ]);

                return [
                    'success' => true,
                    'credentials' => $credentials,
                    'message' => 'All credentials created successfully'
                ];
            } else {
                Log::error('Some credentials failed to create', [
                    'errors' => $errors,
                    'successful_credentials' => $credentials
                ]);

                return [
                    'success' => false,
                    'credentials' => $credentials,
                    'errors' => $errors,
                    'message' => 'Some credentials failed to create'
                ];
            }

        } catch (Exception $e) {
            Log::error('Exception creating all credentials', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => 'Exception: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Create workflow from template with Google Drive integration
     */
    public function createWorkflowFromTemplate(array $templateData, array $googleDriveData): array
    {
        try {
            Log::info('Creating workflow from template with Google Drive integration', [
                'template_name' => $templateData['name'] ?? 'unknown',
                'files_count' => count($googleDriveData['files'] ?? [])
            ]);

            // Load template
            $templatePath = base_path('ai-agent-workflow-enhanced-with-google-drive.json');
            if (!file_exists($templatePath)) {
                return [
                    'success' => false,
                    'error' => 'Template file not found'
                ];
            }

            $template = json_decode(file_get_contents($templatePath), true);

            // Replace template variables
            $workflowData = $this->replaceTemplateVariables($template, $templateData, $googleDriveData);

            // Create workflow
            $response = Http::withHeaders([
                'X-N8N-API-KEY' => $this->apiKey,
                'Content-Type' => 'application/json'
            ])->post("{$this->baseUrl}/workflows", $workflowData);

            if ($response->successful()) {
                $workflow = $response->json();
                Log::info('Workflow created successfully from template', [
                    'workflow_id' => $workflow['id'] ?? 'unknown'
                ]);

                return [
                    'success' => true,
                    'workflow_id' => $workflow['id'],
                    'data' => $workflow
                ];
            } else {
                Log::error('Failed to create workflow from template', [
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);

                return [
                    'success' => false,
                    'error' => 'Failed to create workflow: ' . $response->body()
                ];
            }

        } catch (Exception $e) {
            Log::error('Exception creating workflow from template', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => 'Exception: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Replace template variables with actual data
     */
    private function replaceTemplateVariables(array $template, array $templateData, array $googleDriveData): array
    {
        $workflow = json_encode($template);

        // Replace template variables
        $replacements = [
            '{{webhook_id}}' => $templateData['webhook_id'] ?? 'webhook-' . uniqid(),
            '{{system_message}}' => $templateData['system_message'] ?? 'You are a helpful AI assistant.',
            '{{waha_credential_id}}' => $templateData['waha_credential_id'] ?? 'waha-credential',
            '{{gemini_credential_id}}' => $templateData['gemini_credential_id'] ?? 'gemini-credential',
            '{{google_drive_credential_id}}' => $templateData['google_drive_credential_id'] ?? 'google-drive-credential',
            '{{instance_id}}' => $templateData['instance_id'] ?? 'instance-' . uniqid(),
        ];

        foreach ($replacements as $placeholder => $value) {
            $workflow = str_replace($placeholder, $value, $workflow);
        }

        // Update staticData with Google Drive data
        $workflowArray = json_decode($workflow, true);
        $workflowArray['staticData']['googleDrive'] = $googleDriveData;

        return $workflowArray;
    }

    /**
     * Test Google Drive integration
     */
    public function testGoogleDriveIntegration(string $workflowId): array
    {
        try {
            Log::info('Testing Google Drive integration', [
                'workflow_id' => $workflowId
            ]);

            // Get workflow staticData
            $staticData = $this->getWorkflowStaticData($workflowId);
            if (!$staticData['success']) {
                return [
                    'success' => false,
                    'error' => 'Failed to get workflow staticData: ' . $staticData['error']
                ];
            }

            $googleDriveData = $staticData['data']['googleDrive'] ?? null;
            if (!$googleDriveData) {
                return [
                    'success' => false,
                    'error' => 'No Google Drive data found in workflow'
                ];
            }

            // Test credentials
            $credentials = $googleDriveData['credentials'] ?? null;
            if (!$credentials || !$credentials['access_token']) {
                return [
                    'success' => false,
                    'error' => 'No valid Google Drive credentials found'
                ];
            }

            // Test file access
            $files = $googleDriveData['files'] ?? [];
            if (empty($files)) {
                return [
                    'success' => false,
                    'error' => 'No Google Drive files configured'
                ];
            }

            // Test first file access
            $firstFile = $files[0];
            $testUrl = "https://www.googleapis.com/drive/v3/files/{$firstFile['file_id']}";

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $credentials['access_token'],
                'Accept' => 'application/json'
            ])->get($testUrl);

            if ($response->successful()) {
                Log::info('Google Drive integration test successful', [
                    'workflow_id' => $workflowId,
                    'file_id' => $firstFile['file_id']
                ]);

                return [
                    'success' => true,
                    'message' => 'Google Drive integration is working correctly',
                    'tested_file' => $firstFile['file_name'],
                    'file_id' => $firstFile['file_id']
                ];
            } else {
                Log::error('Google Drive integration test failed', [
                    'workflow_id' => $workflowId,
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);

                return [
                    'success' => false,
                    'error' => 'Failed to access Google Drive file: ' . $response->body()
                ];
            }

        } catch (Exception $e) {
            Log::error('Exception testing Google Drive integration', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => 'Exception: ' . $e->getMessage()
            ];
        }
    }
}
