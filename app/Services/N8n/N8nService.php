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
        $this->mockResponses = $config['mock_responses'] ?? false;

        // Validate configuration
        $this->validateConfig($config);

        $headers = [
            'X-N8N-API-KEY' => $this->apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ];

        // Normalize base URL: ensure it points to the N8n server root (no trailing /api or /api/v1)
        $rawBaseUrl = $config['base_url'] ?? 'http://n8n:5678';
        $normalizedBaseUrl = $this->normalizeBaseUrl($rawBaseUrl);

        parent::__construct($normalizedBaseUrl, [
            'headers' => $headers,
            'timeout' => $config['timeout'] ?? 30,
            'retry_attempts' => $config['retry_attempts'] ?? 3,
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
        if ($this->mockResponses) {
            return $this->getMockWorkflows();
        }

        $response = $this->get('/api/v1/workflows');
        return $this->handleResponse($response, 'get workflows');
    }

    /**
     * Get a specific workflow
     */
    public function getWorkflow(string $workflowId): array
    {
        if ($this->mockResponses) {
            return $this->getMockWorkflow($workflowId);
        }

        $response = $this->get("/api/v1/workflows/{$workflowId}");
        return $this->handleResponse($response, 'get workflow');
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

        $response = $this->post('/api/v1/workflows', $workflowData);
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
     * Execute a workflow
     */
    public function executeWorkflow(string $workflowId, array $inputData = []): array
    {
        if ($this->mockResponses) {
            return $this->getMockWorkflowExecuted();
        }

        $response = $this->post("/api/v1/workflows/{$workflowId}/execute", $inputData);
        return $this->handleResponse($response, 'execute workflow');
    }

    /**
     * Get workflow executions
     */
    public function getWorkflowExecutions(string $workflowId, int $limit = 20, int $page = 1): array
    {
        if ($this->mockResponses) {
            return $this->getMockWorkflowExecutions();
        }

        $response = $this->get("/api/v1/workflows/{$workflowId}/executions", [
            'limit' => $limit,
            'page' => $page,
        ]);

        return $this->handleResponse($response, 'get workflow executions');
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

        $response = $this->get('/api/v1/credentials');
        return $this->handleResponse($response, 'get credentials');
    }

    /**
     * Get a specific credential
     */
    public function getCredential(string $credentialId): array
    {
        if ($this->mockResponses) {
            return $this->getMockCredential();
        }

        $response = $this->get("/api/v1/credentials/{$credentialId}");
        return $this->handleResponse($response, 'get credential');
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
     * Update a credential
     */
    public function updateCredential(string $credentialId, array $credentialData): array
    {
        if ($this->mockResponses) {
            return $this->getMockCredentialUpdated();
        }

        $response = $this->put("/api/v1/credentials/{$credentialId}", $credentialData);
        return $this->handleResponse($response, 'update credential');
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
     * Test a credential
     */
    public function testCredential(string $credentialId): array
    {
        if ($this->mockResponses) {
            return $this->getMockCredentialTested();
        }

        $response = $this->post("/api/v1/credentials/{$credentialId}/test");
        return $this->handleResponse($response, 'test credential');
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

        $response = $this->post("/webhook/{$workflowId}/{$nodeId}", $data);
        return $this->handleResponse($response, 'send webhook');
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

        if (isset($workflowData['connections']) && !is_array($workflowData['connections'])) {
            throw N8nException::invalidWorkflowData('connections must be an array');
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
        try {
            if ($this->mockResponses) {
                return [
                    'success' => true,
                    'message' => 'N8N service is in mock mode',
                    'base_url' => $this->baseUrl,
                    'mock_mode' => true,
                ];
            }

            // Basic configuration validation first
            if (empty($this->baseUrl)) {
                throw new Exception('N8N base URL is not configured');
            }

            if (empty($this->apiKey)) {
                Log::warning('N8N API key is not configured - some operations may fail');
            }

            // Try a simple connectivity test with very short timeout
            try {
                $response = Http::timeout(2)
                    ->connectTimeout(1)
                    ->withHeaders($this->defaultHeaders)
                    ->get($this->baseUrl . '');

                return [
                    'success' => true,
                    'message' => 'N8N server is reachable',
                    'base_url' => $this->baseUrl,
                    'status' => $response->status(),
                    'mock_mode' => false,
                ];
            } catch (\Illuminate\Http\Client\ConnectionException $e) {
                return [
                    'success' => false,
                    'message' => 'N8N server is not running or not accessible',
                    'base_url' => $this->baseUrl,
                    'error' => 'Connection refused - server may be down',
                    'mock_mode' => false,
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
