<?php

namespace App\Traits;

use App\Models\N8nWorkflow;
use App\Models\WahaSession;
use App\Models\KnowledgeBaseItem;
use App\Helpers\StringHelper;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

/**
 * HasWorkflowIntegration Trait
 *
 * Provides reusable methods for integrating with N8N workflows,
 * WAHA sessions, and knowledge base items.
 *
 * This trait ensures DRY principles and reusability across
 * different services and controllers.
 */
trait HasWorkflowIntegration
{
    protected ?\App\Services\N8n\N8nService $n8nService = null;

    /**
     * Initialize N8N service
     */
    protected function getN8nService(): \App\Services\N8n\N8nService
    {
        if ($this->n8nService === null) {
            $this->n8nService = new \App\Services\N8n\N8nService([
                'base_url' => config('n8n.server.base_url', 'http://100.81.120.54:5678'),
                'api_key' => config('n8n.server.api_key', ''),
                'timeout' => config('n8n.server.timeout', 30),
            ]);
        }
        return $this->n8nService;
    }

    /**
     * Validate and retrieve WahaSession with n8n_workflow_id
     */
    protected function getValidatedWahaSession(string $wahaSessionId, ?string $organizationId = null): WahaSession
    {
        $query = WahaSession::query();

        if ($organizationId) {
            $query->where('organization_id', $organizationId);
        }

        $wahaSession = $query->find($wahaSessionId);

        if (!$wahaSession) {
            throw new Exception("WahaSession with ID {$wahaSessionId} not found", 404);
        }

        if (!$wahaSession->n8n_workflow_id) {
            throw new Exception("WahaSession {$wahaSessionId} does not have an associated n8n_workflow_id", 422);
        }

        return $wahaSession;
    }

    /**
     * Validate and retrieve KnowledgeBaseItem
     */
    protected function getValidatedKnowledgeBaseItem(string $knowledgeBaseItemId, ?string $organizationId = null): KnowledgeBaseItem
    {
        $query = KnowledgeBaseItem::query();

        if ($organizationId) {
            $query->where('organization_id', $organizationId);
        }

        $knowledgeBaseItem = $query->find($knowledgeBaseItemId);

        if (!$knowledgeBaseItem) {
            throw new Exception("KnowledgeBaseItem with ID {$knowledgeBaseItemId} not found", 404);
        }

        return $knowledgeBaseItem;
    }

    /**
     * Get system message from KnowledgeBaseItem content
     */
    protected function getSystemMessageFromKnowledgeBase(KnowledgeBaseItem $knowledgeBaseItem): string
    {
        if (empty($knowledgeBaseItem->content)) {
            throw new Exception("No content found in KnowledgeBaseItem {$knowledgeBaseItem->id}");
        }

        return StringHelper::cleanHtmlAndReplaceWithNewline($knowledgeBaseItem->content);
    }

    /**
     * Activate N8N workflow using existing N8nService
     */
    protected function activateN8nWorkflow(string $n8nWorkflowId): array
    {
        try {
            // First, find the N8N workflow in database to get the actual workflow_id
            $n8nWorkflow = N8nWorkflow::find($n8nWorkflowId);
            if (!$n8nWorkflow) {
                throw new Exception("N8N workflow with ID {$n8nWorkflowId} not found in database");
            }

            $actualWorkflowId = $n8nWorkflow->workflow_id;

            // Use existing N8nService
            $n8nService = $this->getN8nService();
            $result = $n8nService->activateWorkflow($actualWorkflowId);

            // Check if activation was successful by looking at the workflow data
            $isActivated = false;
            if (isset($result['active']) && $result['active'] === true) {
                $isActivated = true;
            } elseif (isset($result['data']['active']) && $result['data']['active'] === true) {
                $isActivated = true;
            } elseif (isset($result['success']) && $result['success'] === true) {
                $isActivated = true;
            }

            // Update database status based on activation result
            if ($isActivated) {
                $n8nWorkflow->update([
                    'is_enabled' => true,
                    'status' => 'active',
                    'updated_at' => now(),
                ]);

                Log::info('N8N workflow activated and database updated successfully', [
                    'n8n_workflow_id' => $n8nWorkflowId,
                    'actual_workflow_id' => $actualWorkflowId,
                    'database_updated' => true,
                    'is_activated' => $isActivated,
                    'result' => $result,
                ]);
            } else {
                // If N8N activation failed, update database to reflect error
                $n8nWorkflow->update([
                    'is_enabled' => false,
                    'status' => 'error',
                    'updated_at' => now(),
                ]);

                Log::error('N8N workflow activation failed, database updated to error status', [
                    'n8n_workflow_id' => $n8nWorkflowId,
                    'actual_workflow_id' => $actualWorkflowId,
                    'is_activated' => $isActivated,
                    'error' => $result['error'] ?? 'Unknown error',
                    'result' => $result,
                ]);
            }

            return [
                'success' => $isActivated,
                'message' => $isActivated ? 'N8N workflow activated successfully' : 'Failed to activate N8N workflow',
                'result' => $result,
                'database_updated' => true,
            ];

        } catch (Exception $e) {
            Log::error('Failed to activate N8N workflow', [
                'n8n_workflow_id' => $n8nWorkflowId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to activate N8N workflow',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Update N8N workflow configuration using existing N8nService
     */
    protected function updateN8nWorkflowConfiguration(string $n8nWorkflowId, array $updatePayload): array
    {
        try {
            // First, find the N8N workflow in database to get the actual workflow_id
            $n8nWorkflow = N8nWorkflow::find($n8nWorkflowId);
            if (!$n8nWorkflow) {
                throw new Exception("N8N workflow with ID {$n8nWorkflowId} not found in database");
            }

            $actualWorkflowId = $n8nWorkflow->workflow_id;

            // Use existing N8nService
            $n8nService = $this->getN8nService();
            $result = $n8nService->updateWorkflow($actualWorkflowId, $updatePayload);

            Log::info('N8N workflow configuration updated successfully', [
                'n8n_workflow_id' => $n8nWorkflowId,
                'actual_workflow_id' => $actualWorkflowId,
                'result' => $result,
            ]);

            return [
                'success' => true,
                'message' => 'N8N workflow configuration updated successfully',
                'result' => $result,
            ];

        } catch (Exception $e) {
            Log::error('Failed to update N8N workflow configuration', [
                'n8n_workflow_id' => $n8nWorkflowId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to update N8N workflow configuration',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Update system message in N8N workflow using existing N8nService
     */
    protected function updateN8nSystemMessage(string $n8nWorkflowId, string $systemMessage): array
    {
        try {
            // First, find the N8N workflow in database to get the actual workflow_id
            $n8nWorkflow = N8nWorkflow::find($n8nWorkflowId);
            if (!$n8nWorkflow) {
                throw new Exception("N8N workflow with ID {$n8nWorkflowId} not found in database");
            }

            $actualWorkflowId = $n8nWorkflow->workflow_id;

            // Use existing N8nService with updateSystemMessage method
            $n8nService = $this->getN8nService();
            $result = $n8nService->updateSystemMessage($actualWorkflowId, $systemMessage);

            Log::info('N8N system message updated successfully', [
                'n8n_workflow_id' => $n8nWorkflowId,
                'actual_workflow_id' => $actualWorkflowId,
                'system_message_length' => strlen($systemMessage),
                'result' => $result,
            ]);

            return [
                'success' => true,
                'message' => 'N8N system message updated successfully',
                'result' => $result,
            ];

        } catch (Exception $e) {
            Log::error('Failed to update N8N system message', [
                'n8n_workflow_id' => $n8nWorkflowId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to update N8N system message',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Deactivate N8N workflow using existing N8nService
     */
    protected function deactivateN8nWorkflow(string $n8nWorkflowId): array
    {
        try {
            // First, find the N8N workflow in database to get the actual workflow_id
            $n8nWorkflow = N8nWorkflow::find($n8nWorkflowId);
            if (!$n8nWorkflow) {
                throw new Exception("N8N workflow with ID {$n8nWorkflowId} not found in database");
            }

            $actualWorkflowId = $n8nWorkflow->workflow_id;

            // Use existing N8nService
            $n8nService = $this->getN8nService();
            $result = $n8nService->deactivateWorkflow($actualWorkflowId);

            Log::info('N8N workflow deactivated successfully', [
                'n8n_workflow_id' => $n8nWorkflowId,
                'actual_workflow_id' => $actualWorkflowId,
                'result' => $result,
            ]);

            return [
                'success' => true,
                'message' => 'N8N workflow deactivated successfully',
                'result' => $result,
            ];

        } catch (Exception $e) {
            Log::error('Failed to deactivate N8N workflow', [
                'n8n_workflow_id' => $n8nWorkflowId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to deactivate N8N workflow',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get N8N workflow using existing N8nService
     */
    protected function getN8nWorkflow(string $n8nWorkflowId): array
    {
        try {
            // First, find the N8N workflow in database to get the actual workflow_id
            $n8nWorkflow = N8nWorkflow::find($n8nWorkflowId);
            if (!$n8nWorkflow) {
                throw new Exception("N8N workflow with ID {$n8nWorkflowId} not found in database");
            }

            $actualWorkflowId = $n8nWorkflow->workflow_id;

            // Use existing N8nService
            $n8nService = $this->getN8nService();
            $result = $n8nService->getWorkflow($actualWorkflowId);

            Log::info('N8N workflow retrieved successfully', [
                'n8n_workflow_id' => $n8nWorkflowId,
                'actual_workflow_id' => $actualWorkflowId,
            ]);

            return [
                'success' => true,
                'message' => 'N8N workflow retrieved successfully',
                'result' => $result,
            ];

        } catch (Exception $e) {
            Log::error('Failed to get N8N workflow', [
                'n8n_workflow_id' => $n8nWorkflowId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to get N8N workflow',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Check if N8N workflow is active using existing N8nService
     */
    protected function isN8nWorkflowActive(string $n8nWorkflowId): bool
    {
        try {
            // First, find the N8N workflow in database to get the actual workflow_id
            $n8nWorkflow = N8nWorkflow::find($n8nWorkflowId);
            if (!$n8nWorkflow) {
                return false;
            }

            $actualWorkflowId = $n8nWorkflow->workflow_id;

            // Use existing N8nService
            $n8nService = $this->getN8nService();
            $workflow = $n8nService->getWorkflow($actualWorkflowId);
            return isset($workflow['active']) && $workflow['active'] === true;

        } catch (Exception $e) {
            Log::error('Failed to check N8N workflow status', [
                'n8n_workflow_id' => $n8nWorkflowId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Update database workflow configuration
     */
    protected function updateDatabaseWorkflowConfiguration(string $n8nWorkflowId, array $configurationData): array
    {
        try {
            // Use find() since n8nWorkflowId is the database ID, not workflow_id
            $n8nWorkflow = N8nWorkflow::find($n8nWorkflowId);

            if (!$n8nWorkflow) {
                throw new Exception("N8N workflow with ID {$n8nWorkflowId} not found in database");
            }

            // Update workflow_data and nodes fields instead of settings
            $currentWorkflowData = $n8nWorkflow->workflow_data ?? [];
            $currentNodes = $n8nWorkflow->nodes ?? [];

            // Update system message in nodes
            if (isset($configurationData['system_message'])) {
                $systemMessage = StringHelper::cleanHtmlAndReplaceWithNewline($configurationData['system_message']);

                // Find and update the AI Agent node (ID: 153caa6f-c7eb-4556-8f62-deed794bb2b7)
                foreach ($currentNodes as &$node) {
                    if ($node['id'] === '153caa6f-c7eb-4556-8f62-deed794bb2b7') {
                        if (!isset($node['parameters'])) {
                            $node['parameters'] = [];
                        }
                        if (!isset($node['parameters']['options'])) {
                            $node['parameters']['options'] = [];
                        }
                        $node['parameters']['options']['systemMessage'] = $systemMessage;
                        break;
                    }
                }

                // Also update in workflow_data if it exists
                if (isset($currentWorkflowData['nodes'])) {
                    foreach ($currentWorkflowData['nodes'] as &$workflowNode) {
                        if ($workflowNode['id'] === '153caa6f-c7eb-4556-8f62-deed794bb2b7') {
                            if (!isset($workflowNode['parameters'])) {
                                $workflowNode['parameters'] = [];
                            }
                            if (!isset($workflowNode['parameters']['options'])) {
                                $workflowNode['parameters']['options'] = [];
                            }
                            $workflowNode['parameters']['options']['systemMessage'] = $systemMessage;
                            break;
                        }
                    }
                }
            }

            // Update other configuration data
            $currentSettings = $n8nWorkflow->settings ?? [];
            $updatedSettings = array_merge($currentSettings, $configurationData);
            $updatedSettings['last_updated'] = now()->toISOString();

            $n8nWorkflow->update([
                'workflow_data' => $currentWorkflowData,
                'nodes' => $currentNodes,
                'settings' => $updatedSettings,
                'updated_at' => now(),
            ]);

            Log::info('Database workflow configuration updated successfully', [
                'n8n_workflow_id' => $n8nWorkflowId,
                'workflow_id' => $n8nWorkflow->workflow_id,
                'updated_fields' => ['workflow_data', 'nodes', 'settings'],
                'system_message_updated' => isset($configurationData['system_message']),
            ]);

            return [
                'success' => true,
                'message' => 'Database workflow configuration updated successfully',
            ];

        } catch (Exception $e) {
            Log::error('Failed to update database workflow configuration', [
                'n8n_workflow_id' => $n8nWorkflowId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to update database workflow configuration',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Sync system message between N8N and database
     */
    protected function syncSystemMessage(string $n8nWorkflowId, string $systemMessage): array
    {
        $n8nResult = $this->updateN8nSystemMessage($n8nWorkflowId, $systemMessage);
        $dbResult = $this->updateDatabaseWorkflowConfiguration($n8nWorkflowId, [
            'system_message' => $systemMessage
        ]);

        return [
            'n8n_sync' => $n8nResult,
            'database_sync' => $dbResult,
            'overall_success' => $n8nResult['success'] && $dbResult['success'],
        ];
    }

    /**
     * Validate UUID format
     */
    protected function validateUuid(string $uuid): bool
    {
        return preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $uuid);
    }

    /**
     * Validate workflow data
     */
    protected function validateWorkflowData(array $data): void
    {
        if (empty($data['waha_session_id'])) {
            throw new Exception('waha_session_id is required');
        }

        if (empty($data['knowledge_base_item_id'])) {
            throw new Exception('knowledge_base_item_id is required');
        }

        if (!$this->validateUuid($data['waha_session_id'])) {
            throw new Exception('Invalid waha_session_id format');
        }

        if (!$this->validateUuid($data['knowledge_base_item_id'])) {
            throw new Exception('Invalid knowledge_base_item_id format');
        }
    }

    /**
     * Get workflow status from N8N
     */
    protected function getN8nWorkflowStatus(string $n8nWorkflowId): array
    {
        $this->initializeN8nConfig();

        try {
            $response = Http::withHeaders([
                'X-N8N-API-KEY' => $this->n8nApiKey,
                'Content-Type' => 'application/json',
            ])->get("{$this->n8nBaseUrl}/api/v1/workflows/{$n8nWorkflowId}");

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            } else {
                throw new Exception("Failed to get N8N workflow status: {$response->body()}");
            }

        } catch (Exception $e) {
            Log::error('Failed to get N8N workflow status', [
                'n8n_workflow_id' => $n8nWorkflowId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}
