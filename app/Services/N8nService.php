<?php

namespace App\Services;

use App\Models\N8nWorkflow;
use App\Models\N8nExecution;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Exception;

class N8nService
{
    protected string $baseUrl;
    protected string $apiKey;
    protected int $timeout;
    protected bool $mockResponses;

    public function __construct()
    {
        $this->baseUrl = config('n8n.server.url');
        $this->apiKey = config('n8n.server.api_key');
        $this->timeout = config('n8n.server.timeout');
        $this->mockResponses = config('n8n.testing.mock_responses', false);
    }

    /**
     * Test connection to n8n server
     */
    public function testConnection(): array
    {
        try {
            if ($this->mockResponses) {
                return [
                    'success' => true,
                    'message' => 'Mock connection successful',
                    'server_info' => [
                        'version' => 'mock-1.0.0',
                        'status' => 'running',
                        'timestamp' => now()->toISOString(),
                    ]
                ];
            }

            $response = Http::timeout($this->timeout)
                ->withHeaders($this->getHeaders())
                ->get($this->baseUrl . '/api/v1/health');

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Connection successful',
                    'server_info' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'message' => 'Connection failed: ' . $response->status(),
                'error' => $response->body(),
            ];
        } catch (Exception $e) {
            Log::error('n8n connection test failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Connection failed: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get all workflows from n8n
     */
    public function getWorkflows(): array
    {
        try {
            if ($this->mockResponses) {
                return $this->getMockWorkflows();
            }

            $response = Http::timeout($this->timeout)
                ->withHeaders($this->getHeaders())
                ->get($this->baseUrl . '/api/v1/workflows');

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to fetch workflows',
                'error' => $response->body(),
            ];
        } catch (Exception $e) {
            Log::error('Failed to fetch n8n workflows', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to fetch workflows: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get a specific workflow by ID
     */
    public function getWorkflow(string $workflowId): array
    {
        try {
            if ($this->mockResponses) {
                return $this->getMockWorkflow($workflowId);
            }

            $response = Http::timeout($this->timeout)
                ->withHeaders($this->getHeaders())
                ->get($this->baseUrl . '/api/v1/workflows/' . $workflowId);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to fetch workflow',
                'error' => $response->body(),
            ];
        } catch (Exception $e) {
            Log::error('Failed to fetch n8n workflow', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to fetch workflow: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Execute a workflow
     */
    public function executeWorkflow(string $workflowId, array $inputData = []): array
    {
        try {
            if ($this->mockResponses) {
                return $this->getMockExecution($workflowId, $inputData);
            }

            $response = Http::timeout($this->timeout)
                ->withHeaders($this->getHeaders())
                ->post($this->baseUrl . '/api/v1/workflows/' . $workflowId . '/execute', [
                    'inputData' => $inputData,
                ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to execute workflow',
                'error' => $response->body(),
            ];
        } catch (Exception $e) {
            Log::error('Failed to execute n8n workflow', [
                'workflow_id' => $workflowId,
                'input_data' => $inputData,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to execute workflow: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Test a workflow with test data
     */
    public function testWorkflow(string $workflowId, array $testData, array $expectedOutput = []): array
    {
        try {
            // Execute the workflow with test data
            $executionResult = $this->executeWorkflow($workflowId, $testData);

            if (!$executionResult['success']) {
                return $executionResult;
            }

            $actualOutput = $executionResult['data'] ?? [];
            $testPassed = $this->validateTestOutput($actualOutput, $expectedOutput);

            // Log the test execution
            if (config('n8n.testing.log_executions')) {
                $this->logTestExecution($workflowId, $testData, $expectedOutput, $actualOutput, $testPassed);
            }

            return [
                'success' => true,
                'test_passed' => $testPassed,
                'test_data' => $testData,
                'expected_output' => $expectedOutput,
                'actual_output' => $actualOutput,
                'execution_result' => $executionResult['data'],
            ];
        } catch (Exception $e) {
            Log::error('Failed to test n8n workflow', [
                'workflow_id' => $workflowId,
                'test_data' => $testData,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to test workflow: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get workflow execution history
     */
    public function getWorkflowExecutions(string $workflowId, int $limit = 50): array
    {
        try {
            if ($this->mockResponses) {
                return $this->getMockExecutions($workflowId, $limit);
            }

            $response = Http::timeout($this->timeout)
                ->withHeaders($this->getHeaders())
                ->get($this->baseUrl . '/api/v1/workflows/' . $workflowId . '/executions', [
                    'limit' => $limit,
                ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to fetch workflow executions',
                'error' => $response->body(),
            ];
        } catch (Exception $e) {
            Log::error('Failed to fetch n8n workflow executions', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to fetch workflow executions: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Activate a workflow
     */
    public function activateWorkflow(string $workflowId): array
    {
        try {
            if ($this->mockResponses) {
                return [
                    'success' => true,
                    'message' => 'Workflow activated successfully (mock)',
                    'workflow_id' => $workflowId,
                ];
            }

            $response = Http::timeout($this->timeout)
                ->withHeaders($this->getHeaders())
                ->post($this->baseUrl . '/api/v1/workflows/' . $workflowId . '/activate');

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Workflow activated successfully',
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to activate workflow',
                'error' => $response->body(),
            ];
        } catch (Exception $e) {
            Log::error('Failed to activate n8n workflow', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to activate workflow: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Deactivate a workflow
     */
    public function deactivateWorkflow(string $workflowId): array
    {
        try {
            if ($this->mockResponses) {
                return [
                    'success' => true,
                    'message' => 'Workflow deactivated successfully (mock)',
                    'workflow_id' => $workflowId,
                ];
            }

            $response = Http::timeout($this->timeout)
                ->withHeaders($this->getHeaders())
                ->post($this->baseUrl . '/api/v1/workflows/' . $workflowId . '/deactivate');

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Workflow deactivated successfully',
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to deactivate workflow',
                'error' => $response->body(),
            ];
        } catch (Exception $e) {
            Log::error('Failed to deactivate n8n workflow', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to deactivate workflow: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get workflow statistics
     */
    public function getWorkflowStats(string $workflowId): array
    {
        try {
            if ($this->mockResponses) {
                return $this->getMockStats($workflowId);
            }

            $response = Http::timeout($this->timeout)
                ->withHeaders($this->getHeaders())
                ->get($this->baseUrl . '/api/v1/workflows/' . $workflowId . '/stats');

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to fetch workflow statistics',
                'error' => $response->body(),
            ];
        } catch (Exception $e) {
            Log::error('Failed to fetch n8n workflow statistics', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to fetch workflow statistics: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Validate test output against expected output
     */
    protected function validateTestOutput(array $actualOutput, array $expectedOutput): bool
    {
        if (empty($expectedOutput)) {
            return true; // No expected output specified, consider test passed
        }

        // Simple validation - can be enhanced based on requirements
        foreach ($expectedOutput as $key => $expectedValue) {
            if (!array_key_exists($key, $actualOutput)) {
                return false;
            }

            if ($expectedValue !== $actualOutput[$key]) {
                return false;
            }
        }

        return true;
    }

    /**
     * Log test execution for debugging
     */
    protected function logTestExecution(string $workflowId, array $testData, array $expectedOutput, array $actualOutput, bool $testPassed): void
    {
        Log::info('n8n workflow test executed', [
            'workflow_id' => $workflowId,
            'test_data' => $testData,
            'expected_output' => $expectedOutput,
            'actual_output' => $actualOutput,
            'test_passed' => $testPassed,
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * Get API headers
     */
    protected function getHeaders(): array
    {
        $headers = [
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ];

        if (!empty($this->apiKey)) {
            $headers['X-N8N-API-KEY'] = $this->apiKey;
        }

        return $headers;
    }

    /**
     * Mock responses for testing
     */
    protected function getMockWorkflows(): array
    {
        return [
            'success' => true,
            'data' => [
                [
                    'id' => 'mock-workflow-1',
                    'name' => 'Test Workflow 1',
                    'active' => true,
                    'nodes' => [],
                    'connections' => [],
                ],
                [
                    'id' => 'mock-workflow-2',
                    'name' => 'Test Workflow 2',
                    'active' => false,
                    'nodes' => [],
                    'connections' => [],
                ],
            ],
        ];
    }

    protected function getMockWorkflow(string $workflowId): array
    {
        return [
            'success' => true,
            'data' => [
                'id' => $workflowId,
                'name' => 'Mock Workflow',
                'active' => true,
                'nodes' => [
                    [
                        'id' => 'node-1',
                        'type' => 'n8n-nodes-base.webhook',
                        'position' => [100, 100],
                    ],
                    [
                        'id' => 'node-2',
                        'type' => 'n8n-nodes-base.httpRequest',
                        'position' => [300, 100],
                    ],
                ],
                'connections' => [
                    'node-1' => [
                        'main' => [
                            [
                                'node' => 'node-2',
                                'type' => 'main',
                                'index' => 0,
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    protected function getMockExecution(string $workflowId, array $inputData): array
    {
        return [
            'success' => true,
            'data' => [
                'executionId' => 'mock-exec-' . uniqid(),
                'workflowId' => $workflowId,
                'status' => 'success',
                'data' => [
                    'output' => [
                        'processed_data' => $inputData,
                        'timestamp' => now()->toISOString(),
                        'mock' => true,
                    ],
                ],
            ],
        ];
    }

    protected function getMockExecutions(string $workflowId, int $limit): array
    {
        $executions = [];
        for ($i = 0; $i < min($limit, 10); $i++) {
            $executions[] = [
                'id' => 'mock-exec-' . $i,
                'workflowId' => $workflowId,
                'status' => $i % 3 === 0 ? 'failed' : 'success',
                'startedAt' => now()->subMinutes($i)->toISOString(),
                'finishedAt' => now()->subMinutes($i - 1)->toISOString(),
            ];
        }

        return [
            'success' => true,
            'data' => $executions,
        ];
    }

    protected function getMockStats(string $workflowId): array
    {
        return [
            'success' => true,
            'data' => [
                'totalExecutions' => 100,
                'successfulExecutions' => 85,
                'failedExecutions' => 15,
                'averageExecutionTime' => 2500,
                'lastExecution' => now()->subMinutes(5)->toISOString(),
            ],
        ];
    }
}
