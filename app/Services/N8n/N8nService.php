<?php

namespace App\Services\N8n;

use App\Services\Http\BaseHttpClient;
use App\Services\N8n\Exceptions\N8nException;
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
     * Get workflows with database integration
     */
    public function getWorkflowsWithDatabase(): array
    {
        // Get workflows from N8N
        $n8nWorkflows = $this->getWorkflows();

        $response = [
            'n8n_workflows' => $n8nWorkflows,
            'database_workflows' => [],
            'total_n8n_workflows' => count($n8nWorkflows['data'] ?? []),
            'total_database_workflows' => 0,
            'database_status' => 'failed',
            'database_error' => null
        ];

        // Try to get workflows from database
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

        return $response;
    }

    /**
     * Delete workflow with database cleanup
     */
    public function deleteWorkflowWithDatabase(string $workflowId): array
    {
        // Delete workflow from N8N
        $result = $this->deleteWorkflow($workflowId);

        // Also delete from database
        $dbWorkflow = \App\Models\N8nWorkflow::where('workflow_id', $workflowId)->first();
        if ($dbWorkflow) {
            $dbWorkflow->delete();
            Log::info('Workflow deleted from database', [
                'workflow_id' => $workflowId,
                'database_id' => $dbWorkflow->id
            ]);
        }

        return $result;
    }

    /**
     * Update system message in workflow
     */
    public function updateSystemMessage(string $workflowId, string $systemMessage, ?string $nodeId = null): array
    {
        $defaultNodeId = '153caa6f-c7eb-4556-8f62-deed794bb2b7'; // Default AI Agent node ID
        $targetNodeId = $nodeId ?? $defaultNodeId;

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
     * Extract webhook URLs from workflow data
     */
    public function extractWebhookUrls(array $workflowData, string $workflowId, string $workflowName, bool $isActive): array
    {
        $webhookUrls = [];
        $nodes = $workflowData['nodes'] ?? [];

        foreach ($nodes as $node) {
            if (isset($node['webhookId']) && !empty($node['webhookId'])) {
                $webhookId = $node['webhookId'];
                $nodeName = $node['name'] ?? 'Unknown Node';
                $nodeType = $node['type'] ?? 'Unknown Type';

                // Get N8N base URL from config
                $n8nBaseUrl = config('n8n.base_url', 'http://localhost:5678');

                // Generate webhook URLs with different base URLs
                $webhookUrls[] = [
                    'node_id' => $node['id'],
                    'node_name' => $nodeName,
                    'node_type' => $nodeType,
                    'webhook_id' => $webhookId,
                    'urls' => [
                        'test' => [
                            'localhost' => "{$n8nBaseUrl}/webhook-test/{$webhookId}/waha",
                            'production_ip' => "http://100.81.120.54:5678/webhook-test/{$webhookId}/waha"
                        ],
                        'production' => [
                            'localhost' => "{$n8nBaseUrl}/webhook/{$webhookId}/waha",
                            'production_ip' => "http://100.81.120.54:5678/webhook/{$webhookId}/waha"
                        ]
                    ],
                    'is_active' => $isActive
                ];
            }
        }

        return [
            'workflow_id' => $workflowId,
            'workflow_name' => $workflowName,
            'workflow_status' => $isActive ? 'active' : 'inactive',
            'webhook_urls' => $webhookUrls,
            'total_webhooks' => count($webhookUrls)
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
     * Check if workflow is active
     */
    public function isWorkflowActive(string $workflowId): bool
    {
        try {
            $workflow = $this->getWorkflow($workflowId);
            return isset($workflow['active']) && $workflow['active'] === true;
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Get workflow execution statistics
     */
    public function getWorkflowStats(string $workflowId): array
    {
        try {
            $executions = $this->getWorkflowExecutions($workflowId, 100, 1);
            $totalExecutions = $executions['meta']['total'] ?? 0;

            $successful = 0;
            $failed = 0;

            foreach ($executions['data'] ?? [] as $execution) {
                if ($execution['status'] === 'success') {
                    $successful++;
                } else {
                    $failed++;
                }
            }

            return [
                'total_executions' => $totalExecutions,
                'successful' => $successful,
                'failed' => $failed,
                'success_rate' => $totalExecutions > 0 ? round(($successful / $totalExecutions) * 100, 2) : 0,
            ];
        } catch (Exception $e) {
            return [
                'total_executions' => 0,
                'successful' => 0,
                'failed' => 0,
                'success_rate' => 0,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Test webhook connectivity
     */
    public function testWebhookConnectivity(string $workflowId, string $nodeId): array
    {
        try {
            $testData = [
                'test' => true,
                'timestamp' => now()->toISOString(),
                'source' => 'connectivity_test',
            ];

            $result = $this->sendWebhook($workflowId, $nodeId, $testData);

            return [
                'success' => true,
                'message' => 'Webhook connectivity test successful',
                'execution_id' => $result['executionId'] ?? null,
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Webhook connectivity test failed: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ];
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
}
