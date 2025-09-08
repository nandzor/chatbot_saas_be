<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\N8nService;
use App\Models\N8nWorkflow;
use App\Models\N8nExecution;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
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
     * Test connection to n8n server
     */
    public function testConnection(): JsonResponse
    {
        try {
            $result = $this->n8nService->testConnection();

            if ($result['success']) {
                return $this->successResponse($result['message'], $result['server_info'] ?? []);
            }

            return $this->errorResponse($result['message'], $result['error'] ?? null, 500);
        } catch (Exception $e) {
            Log::error('n8n connection test failed in controller', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->errorResponse('Failed to test connection: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get all workflows from n8n
     */
    public function getWorkflows(Request $request): JsonResponse
    {
        try {
            $result = $this->n8nService->getWorkflows();

            if ($result['success']) {
                return $this->successResponse('Workflows retrieved successfully', $result['data']);
            }

            return $this->errorResponse($result['message'], $result['error'] ?? null, 500);
        } catch (Exception $e) {
            Log::error('Failed to get n8n workflows in controller', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->errorResponse('Failed to retrieve workflows: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get a specific workflow by ID
     */
    public function getWorkflow(Request $request, string $workflowId): JsonResponse
    {
        try {
            $result = $this->n8nService->getWorkflow($workflowId);

            if ($result['success']) {
                return $this->successResponse('Workflow retrieved successfully', $result['data']);
            }

            return $this->errorResponse($result['message'], 404, $result['error'] ?? null);
        } catch (Exception $e) {
            Log::error('Failed to get n8n workflow in controller', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->errorResponse('Failed to retrieve workflow: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Execute a workflow
     */
    public function executeWorkflow(Request $request, string $workflowId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'input_data' => 'sometimes|array',
                'test_mode' => 'sometimes|boolean',
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors()->toArray());
            }

            $inputData = $request->input('input_data', []);
            $testMode = $request->input('test_mode', false);

            $result = $this->n8nService->executeWorkflow($workflowId, $inputData);

            if ($result['success']) {
                return $this->successResponse('Workflow executed successfully', $result['data']);
            }

            return $this->errorResponse($result['message'], $result['error'] ?? null, 500);
        } catch (Exception $e) {
            Log::error('Failed to execute n8n workflow in controller', [
                'workflow_id' => $workflowId,
                'input_data' => $request->input('input_data'),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->errorResponse('Failed to execute workflow: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Test a workflow with test data
     */
    public function testWorkflow(Request $request, string $workflowId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'test_data' => 'required|array',
                'expected_output' => 'sometimes|array',
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors()->toArray());
            }

            $testData = $request->input('test_data');
            $expectedOutput = $request->input('expected_output', []);

            $result = $this->n8nService->testWorkflow($workflowId, $testData, $expectedOutput);

            if ($result['success']) {
                return $this->successResponse('Workflow test completed', [
                    'test_passed' => $result['test_passed'],
                    'test_data' => $result['test_data'],
                    'expected_output' => $result['expected_output'],
                    'actual_output' => $result['actual_output'],
                    'execution_result' => $result['execution_result'],
                ]);
            }

            return $this->errorResponse($result['message'], $result['error'] ?? null, 500);
        } catch (Exception $e) {
            Log::error('Failed to test n8n workflow in controller', [
                'workflow_id' => $workflowId,
                'test_data' => $request->input('test_data'),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->errorResponse('Failed to test workflow: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get workflow execution history
     */
    public function getWorkflowExecutions(Request $request, string $workflowId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'limit' => 'sometimes|integer|min:1|max:100',
                'status' => 'sometimes|string|in:success,failed,running',
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors()->toArray());
            }

            $limit = $request->input('limit', 50);
            $status = $request->input('status');

            $result = $this->n8nService->getWorkflowExecutions($workflowId, $limit);

            if ($result['success']) {
                $executions = $result['data'];

                // Filter by status if specified
                if ($status) {
                    $executions = array_filter($executions, function ($execution) use ($status) {
                        return $execution['status'] === $status;
                    });
                }

                return $this->successResponse('Workflow executions retrieved successfully', [
                    'executions' => array_values($executions),
                    'total' => count($executions),
                    'workflow_id' => $workflowId,
                ]);
            }

            return $this->errorResponse($result['message'], $result['error'] ?? null, 500);
        } catch (Exception $e) {
            Log::error('Failed to get n8n workflow executions in controller', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->errorResponse('Failed to retrieve workflow executions: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Activate a workflow
     */
    public function activateWorkflow(Request $request, string $workflowId): JsonResponse
    {
        try {
            $result = $this->n8nService->activateWorkflow($workflowId);

            if ($result['success']) {
                return $this->successResponse($result['message'], $result['data'] ?? []);
            }

            return $this->errorResponse($result['message'], $result['error'] ?? null, 500);
        } catch (Exception $e) {
            Log::error('Failed to activate n8n workflow in controller', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->errorResponse('Failed to activate workflow: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Deactivate a workflow
     */
    public function deactivateWorkflow(Request $request, string $workflowId): JsonResponse
    {
        try {
            $result = $this->n8nService->deactivateWorkflow($workflowId);

            if ($result['success']) {
                return $this->successResponse($result['message'], $result['data'] ?? []);
            }

            return $this->errorResponse($result['message'], $result['error'] ?? null, 500);
        } catch (Exception $e) {
            Log::error('Failed to deactivate n8n workflow in controller', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->errorResponse('Failed to deactivate workflow: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get workflow statistics
     */
    public function getWorkflowStats(Request $request, string $workflowId): JsonResponse
    {
        try {
            $result = $this->n8nService->getWorkflowStats($workflowId);

            if ($result['success']) {
                return $this->successResponse('Workflow statistics retrieved successfully', $result['data']);
            }

            return $this->errorResponse($result['message'], $result['error'] ?? null, 500);
        } catch (Exception $e) {
            Log::error('Failed to get n8n workflow statistics in controller', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->errorResponse('Failed to retrieve workflow statistics: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create a new workflow
     */
    public function createWorkflow(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'nodes' => 'required|array',
                'connections' => 'array',
                'active' => 'boolean',
                'settings' => 'array',
            ]);

            if ($validator->fails()) {
                return $this->errorResponse('Validation failed', $validator->errors()->toArray(), 422);
            }

            $workflowData = $request->only(['name', 'nodes', 'connections', 'active', 'settings']);

            // Ensure settings is present (required by N8N API)
            if (!isset($workflowData['settings'])) {
                $workflowData['settings'] = [];
            }

            $result = $this->n8nService->createWorkflow($workflowData);

            if ($result['success']) {
                return $this->successResponse($result['message'], $result['data']);
            }

            return $this->errorResponse($result['message'], $result['error'] ?? null, 500);
        } catch (Exception $e) {
            Log::error('Failed to create workflow in controller', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->errorResponse('Failed to create workflow: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update an existing workflow
     */
    public function updateWorkflow(Request $request, string $workflowId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'nodes' => 'sometimes|array',
                'connections' => 'sometimes|array',
                'active' => 'sometimes|boolean',
            ]);

            if ($validator->fails()) {
                return $this->errorResponse('Validation failed', $validator->errors()->toArray(), 422);
            }

            $workflowData = $request->only(['name', 'nodes', 'connections', 'active']);
            $result = $this->n8nService->updateWorkflow($workflowId, $workflowData);

            if ($result['success']) {
                return $this->successResponse($result['message'], $result['data']);
            }

            return $this->errorResponse($result['message'], $result['error'] ?? null, 500);
        } catch (Exception $e) {
            Log::error('Failed to update workflow in controller', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->errorResponse('Failed to update workflow: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete a workflow
     */
    public function deleteWorkflow(string $workflowId): JsonResponse
    {
        try {
            $result = $this->n8nService->deleteWorkflow($workflowId);

            if ($result['success']) {
                return $this->successResponse($result['message'], $result['data'] ?? []);
            }

            return $this->errorResponse($result['message'], $result['error'] ?? null, 500);
        } catch (Exception $e) {
            Log::error('Failed to delete workflow in controller', [
                'workflow_id' => $workflowId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->errorResponse('Failed to delete workflow: ' . $e->getMessage(), 500);
        }
    }
}
