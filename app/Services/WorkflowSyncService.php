<?php

namespace App\Services;

use App\Models\BotPersonality;
use App\Models\WahaSession;
use App\Models\KnowledgeBaseItem;
use App\Models\N8nWorkflow;
use App\Services\AiInstructionService;
use App\Traits\HasWorkflowIntegration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
// Queue system disabled
// use Illuminate\Support\Facades\Queue;
use Exception;

/**
 * WorkflowSyncService
 *
 * Centralized service for handling workflow synchronization operations.
 * This service ensures that bot personality updates trigger corresponding
 * workflow updates in both N8N and database.
 */
class WorkflowSyncService
{
    use HasWorkflowIntegration;

    protected ?\App\Services\Waha\WahaService $wahaService = null;
    protected AiInstructionService $aiInstructionService;

    public function __construct(AiInstructionService $aiInstructionService)
    {
        $this->aiInstructionService = $aiInstructionService;
    }

    /**
     * Initialize WahaService instance
     */
    protected function getWahaService(): \App\Services\Waha\WahaService
    {
        if ($this->wahaService === null) {
            $this->wahaService = new \App\Services\Waha\WahaService([
                'base_url' => config('waha.server.base_url', 'http://localhost:3000'),
                'api_key' => config('waha.server.api_key', ''),
                'timeout' => config('waha.server.timeout', 30),
            ]);
        }
        return $this->wahaService;
    }

    /**
     * Sync bot personality with its associated workflow
     *
     * This method is called whenever a bot personality is updated
     * to ensure the workflow stays in sync.
     */
    public function syncBotPersonalityWorkflow(BotPersonality $botPersonality, ?string $aiInstruction = null): array
    {
        try {
            Log::info('Starting bot personality workflow sync', [
                'bot_personality_id' => $botPersonality->id,
                'waha_session_id' => $botPersonality->waha_session_id,
                'knowledge_base_item_id' => $botPersonality->knowledge_base_item_id,
                'n8n_workflow_id' => $botPersonality->n8n_workflow_id,
            ]);

            $results = [];

            // Sync system message with AI instruction
            if ($aiInstruction) {
                $results['system_message_sync'] = $this->syncSystemMessageWithAiInstruction($botPersonality, $aiInstruction);
            } elseif ($botPersonality->knowledge_base_item_id) {
                $results['system_message_sync'] = $this->syncSystemMessageFromKnowledgeBase($botPersonality);
            }

            // Sync workflow configuration
            if ($botPersonality->n8n_workflow_id) {
                $results['workflow_config_sync'] = $this->syncWorkflowConfiguration($botPersonality);
            }

            // Update workflow status if needed
            if ($botPersonality->status === 'active' && $botPersonality->n8n_workflow_id) {
                $results['workflow_activation'] = $this->activateWorkflowIfNeeded($botPersonality->n8n_workflow_id);
            }

            Log::info('Bot personality workflow sync completed', [
                'bot_personality_id' => $botPersonality->id,
                'results' => $results,
            ]);

            return [
                'success' => true,
                'message' => 'Bot personality workflow sync completed',
                'results' => $results,
            ];

        } catch (Exception $e) {
            Log::error('Bot personality workflow sync failed', [
                'bot_personality_id' => $botPersonality->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Bot personality workflow sync failed',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Sync system message from knowledge base item
     */
    protected function syncSystemMessageFromKnowledgeBase(BotPersonality $botPersonality): array
    {
        try {
            $knowledgeBaseItem = KnowledgeBaseItem::find($botPersonality->knowledge_base_item_id);

            if (!$knowledgeBaseItem) {
                throw new Exception("KnowledgeBaseItem {$botPersonality->knowledge_base_item_id} not found");
            }

            $systemMessage = $this->getSystemMessageFromKnowledgeBase($knowledgeBaseItem);

            if (!$botPersonality->n8n_workflow_id) {
                throw new Exception("Bot personality {$botPersonality->id} has no associated N8N workflow");
            }

            return $this->syncSystemMessage($botPersonality->n8n_workflow_id, $systemMessage);

        } catch (Exception $e) {
            Log::error('Failed to sync system message from knowledge base', [
                'bot_personality_id' => $botPersonality->id,
                'knowledge_base_item_id' => $botPersonality->knowledge_base_item_id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to sync system message from knowledge base',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get system message from knowledge base using AiInstructionService
     */
    protected function getSystemMessageFromKnowledgeBase(KnowledgeBaseItem $knowledgeBaseItem): string
    {
        // Create a temporary bot personality to generate system message
        $tempBotPersonality = new BotPersonality([
            'knowledge_base_item_id' => $knowledgeBaseItem->id,
            'language' => 'indonesia', // Default language
            'formality_level' => 'friendly' // Default formality level
        ]);

        return $this->aiInstructionService->generateForBotPersonality($tempBotPersonality);
    }

    /**
     * Sync system message with AI instruction
     */
    protected function syncSystemMessageWithAiInstruction(BotPersonality $botPersonality, string $aiInstruction): array
    {
        try {
            if (!$botPersonality->n8n_workflow_id) {
                throw new Exception("Bot personality {$botPersonality->id} has no associated N8N workflow");
            }


            return $this->syncSystemMessage($botPersonality->n8n_workflow_id, $aiInstruction);

        } catch (Exception $e) {
            Log::error('Failed to sync system message with AI instruction', [
                'bot_personality_id' => $botPersonality->id,
                'n8n_workflow_id' => $botPersonality->n8n_workflow_id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to sync system message with AI instruction',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Sync workflow configuration
     */
    protected function syncWorkflowConfiguration(BotPersonality $botPersonality): array
    {
        try {
            $configurationData = [
                'bot_personality_id' => $botPersonality->id,
                'personality_name' => $botPersonality->name,
                'personality_code' => $botPersonality->code,
                'language' => $botPersonality->language,
                'tone' => $botPersonality->tone,
                'communication_style' => $botPersonality->communication_style,
                'formality_level' => $botPersonality->formality_level,
                'greeting_message' => $botPersonality->greeting_message,
                'farewell_message' => $botPersonality->farewell_message,
                'personality_traits' => $botPersonality->personality_traits,
                'response_delay_ms' => $botPersonality->response_delay_ms,
                'typing_indicator' => $botPersonality->typing_indicator,
                'max_response_length' => $botPersonality->max_response_length,
                'enable_small_talk' => $botPersonality->enable_small_talk,
                'confidence_threshold' => $botPersonality->confidence_threshold,
                'learning_enabled' => $botPersonality->learning_enabled,
                'last_sync_at' => now()->toISOString(),
            ];

            return $this->updateDatabaseWorkflowConfiguration($botPersonality->n8n_workflow_id, $configurationData);

        } catch (Exception $e) {
            Log::error('Failed to sync workflow configuration', [
                'bot_personality_id' => $botPersonality->id,
                'n8n_workflow_id' => $botPersonality->n8n_workflow_id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to sync workflow configuration',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Activate workflow if needed
     */
    protected function activateWorkflowIfNeeded(string $n8nWorkflowId): array
    {
        try {
            // First, check database status
            $n8nWorkflow = N8nWorkflow::find($n8nWorkflowId);
            if (!$n8nWorkflow) {
                throw new Exception("N8N workflow with ID {$n8nWorkflowId} not found in database");
            }

            // Always try to activate workflow to ensure it's active
            $activationResult = $this->activateN8nWorkflow($n8nWorkflowId);

            if ($activationResult['success']) {
                // Refresh the workflow from database to get updated status
                $n8nWorkflow->refresh();

                return [
                    'success' => true,
                    'message' => 'Workflow activated successfully',
                    'was_already_active' => false,
                    'database_status' => [
                        'is_enabled' => $n8nWorkflow->is_enabled,
                        'status' => $n8nWorkflow->status,
                        'updated_at' => $n8nWorkflow->updated_at,
                    ],
                    'activation_result' => $activationResult,
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Failed to activate workflow',
                    'error' => $activationResult['error'] ?? 'Unknown error',
                    'activation_result' => $activationResult,
                ];
            }

        } catch (Exception $e) {
            Log::error('Failed to activate workflow if needed', [
                'n8n_workflow_id' => $n8nWorkflowId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to activate workflow if needed',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Bulk sync multiple bot personalities
     */
    public function bulkSyncBotPersonalities(array $botPersonalityIds): array
    {
        $results = [];
        $successCount = 0;
        $failureCount = 0;

        foreach ($botPersonalityIds as $botPersonalityId) {
            try {
                $botPersonality = BotPersonality::find($botPersonalityId);

                if (!$botPersonality) {
                    $results[$botPersonalityId] = [
                        'success' => false,
                        'message' => 'Bot personality not found',
                    ];
                    $failureCount++;
                    continue;
                }

                $result = $this->syncBotPersonalityWorkflow($botPersonality);
                $results[$botPersonalityId] = $result;

                if ($result['success']) {
                    $successCount++;
                } else {
                    $failureCount++;
                }

            } catch (Exception $e) {
                $results[$botPersonalityId] = [
                    'success' => false,
                    'message' => 'Sync failed with exception',
                    'error' => $e->getMessage(),
                ];
                $failureCount++;
            }
        }

        return [
            'success' => $failureCount === 0,
            'message' => "Bulk sync completed: {$successCount} successful, {$failureCount} failed",
            'summary' => [
                'total' => count($botPersonalityIds),
                'successful' => $successCount,
                'failed' => $failureCount,
            ],
            'results' => $results,
        ];
    }

    /**
     * Sync all bot personalities for an organization
     */
    public function syncOrganizationBotPersonalities(string $organizationId): array
    {
        try {
            $botPersonalities = BotPersonality::where('organization_id', $organizationId)
                ->whereNotNull('n8n_workflow_id')
                ->get();

            if ($botPersonalities->isEmpty()) {
                return [
                    'success' => true,
                    'message' => 'No bot personalities with workflows found for organization',
                    'summary' => [
                        'total' => 0,
                        'successful' => 0,
                        'failed' => 0,
                    ],
                ];
            }

            $botPersonalityIds = $botPersonalities->pluck('id')->toArray();

            return $this->bulkSyncBotPersonalities($botPersonalityIds);

        } catch (Exception $e) {
            Log::error('Failed to sync organization bot personalities', [
                'organization_id' => $organizationId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to sync organization bot personalities',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get sync status for a bot personality
     */
    public function getSyncStatus(BotPersonality $botPersonality): array
    {
        try {
            $status = [
                'bot_personality_id' => $botPersonality->id,
                'has_waha_session' => !is_null($botPersonality->waha_session_id),
                'has_knowledge_base_item' => !is_null($botPersonality->knowledge_base_item_id),
                'has_n8n_workflow' => !is_null($botPersonality->n8n_workflow_id),
                'last_sync_at' => null,
                'workflow_status' => null,
                'waha_session_status' => null,
                'waha_session_connected' => false,
                'sync_health' => 'unknown',
            ];

            // Get last sync time from workflow settings
            if ($botPersonality->n8n_workflow_id) {
                $n8nWorkflow = N8nWorkflow::where('workflow_id', $botPersonality->n8n_workflow_id)->first();

                if ($n8nWorkflow && isset($n8nWorkflow->settings['last_sync_at'])) {
                    $status['last_sync_at'] = $n8nWorkflow->settings['last_sync_at'];
                }

                // Get workflow status from N8N using N8nService
                $workflowStatus = $this->getN8nWorkflowStatus($botPersonality->n8n_workflow_id);
                if ($workflowStatus['success']) {
                    $status['workflow_status'] = $workflowStatus['data']['active'] ?? false;
                }
            }

            // Get WAHA session status using WahaService
            if ($botPersonality->waha_session_id) {
                $wahaStatus = $this->getWahaSessionStatus($botPersonality->waha_session_id);
                if ($wahaStatus['success']) {
                    $status['waha_session_status'] = $wahaStatus['data'];
                }

                // Check if WAHA session is connected using WahaService
                $status['waha_session_connected'] = $this->isWahaSessionConnected($botPersonality->waha_session_id);
            }

            // Determine sync health
            $status['sync_health'] = $this->determineSyncHealth($status);

            return [
                'success' => true,
                'data' => $status,
            ];

        } catch (Exception $e) {
            Log::error('Failed to get sync status', [
                'bot_personality_id' => $botPersonality->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to get sync status',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get N8N workflow status using existing N8nService
     */
    protected function getN8nWorkflowStatus(string $n8nWorkflowId): array
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

            Log::info('N8N workflow status retrieved successfully', [
                'n8n_workflow_id' => $n8nWorkflowId,
                'actual_workflow_id' => $actualWorkflowId,
            ]);

            return [
                'success' => true,
                'message' => 'N8N workflow status retrieved successfully',
                'data' => $result,
            ];

        } catch (Exception $e) {
            Log::error('Failed to get N8N workflow status', [
                'n8n_workflow_id' => $n8nWorkflowId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to get N8N workflow status',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get WAHA session status using existing WahaService
     */
    protected function getWahaSessionStatus(string $wahaSessionId): array
    {
        try {
            // First, find the WAHA session in database to get the session details
            $wahaSession = WahaSession::find($wahaSessionId);
            if (!$wahaSession) {
                throw new Exception("WAHA session with ID {$wahaSessionId} not found in database");
            }

            // Use existing WahaService
            $wahaService = $this->getWahaService();
            $result = $wahaService->getSessionStatus($wahaSession->session_name);

            Log::info('WAHA session status retrieved successfully', [
                'waha_session_id' => $wahaSessionId,
                'session_name' => $wahaSession->session_name,
            ]);

            return [
                'success' => true,
                'message' => 'WAHA session status retrieved successfully',
                'data' => $result,
            ];

        } catch (Exception $e) {
            Log::error('Failed to get WAHA session status', [
                'waha_session_id' => $wahaSessionId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to get WAHA session status',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Check if WAHA session is connected using existing WahaService
     */
    protected function isWahaSessionConnected(string $wahaSessionId): bool
    {
        try {
            // First, find the WAHA session in database to get the session details
            $wahaSession = WahaSession::find($wahaSessionId);
            if (!$wahaSession) {
                return false;
            }

            // Use existing WahaService
            $wahaService = $this->getWahaService();
            return $wahaService->isSessionConnected($wahaSession->session_name);

        } catch (Exception $e) {
            Log::error('Failed to check WAHA session connection', [
                'waha_session_id' => $wahaSessionId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Get WAHA session health using existing WahaService
     */
    protected function getWahaSessionHealth(string $wahaSessionId): array
    {
        try {
            // First, find the WAHA session in database to get the session details
            $wahaSession = WahaSession::find($wahaSessionId);
            if (!$wahaSession) {
                throw new Exception("WAHA session with ID {$wahaSessionId} not found in database");
            }

            // Use existing WahaService
            $wahaService = $this->getWahaService();
            $result = $wahaService->getSessionHealth($wahaSession->session_name);

            Log::info('WAHA session health retrieved successfully', [
                'waha_session_id' => $wahaSessionId,
                'session_name' => $wahaSession->session_name,
            ]);

            return [
                'success' => true,
                'message' => 'WAHA session health retrieved successfully',
                'data' => $result,
            ];

        } catch (Exception $e) {
            Log::error('Failed to get WAHA session health', [
                'waha_session_id' => $wahaSessionId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to get WAHA session health',
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
            Log::error('Failed to check N8N workflow active status', [
                'n8n_workflow_id' => $n8nWorkflowId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Get N8N workflow statistics using existing N8nService
     */
    protected function getN8nWorkflowStats(string $n8nWorkflowId): array
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
            $executions = $n8nService->getWorkflowExecutions($actualWorkflowId, 100, 1);
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

            $result = [
                'total_executions' => $totalExecutions,
                'successful' => $successful,
                'failed' => $failed,
                'success_rate' => $totalExecutions > 0 ? round(($successful / $totalExecutions) * 100, 2) : 0,
            ];

            Log::info('N8N workflow statistics retrieved successfully', [
                'n8n_workflow_id' => $n8nWorkflowId,
                'actual_workflow_id' => $actualWorkflowId,
            ]);

            return [
                'success' => true,
                'message' => 'N8N workflow statistics retrieved successfully',
                'data' => $result,
            ];

        } catch (Exception $e) {
            Log::error('Failed to get N8N workflow statistics', [
                'n8n_workflow_id' => $n8nWorkflowId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to get N8N workflow statistics',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Test N8N connection using existing N8nService
     */
    protected function testN8nConnection(): array
    {
        try {
            // Use existing N8nService
            $n8nService = $this->getN8nService();
            $result = $n8nService->testConnection();

            Log::info('N8N connection test completed', [
                'result' => $result,
            ]);

            return [
                'success' => true,
                'message' => 'N8N connection test completed',
                'data' => $result,
            ];

        } catch (Exception $e) {
            Log::error('Failed to test N8N connection', [
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to test N8N connection',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Test WAHA connection using existing WahaService
     */
    protected function testWahaConnection(): array
    {
        try {
            // Use existing WahaService
            $wahaService = $this->getWahaService();
            $result = $wahaService->testConnection();

            Log::info('WAHA connection test completed', [
                'result' => $result,
            ]);

            return [
                'success' => true,
                'message' => 'WAHA connection test completed',
                'data' => $result,
            ];

        } catch (Exception $e) {
            Log::error('Failed to test WAHA connection', [
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to test WAHA connection',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Restart WAHA session using existing WahaService
     */
    protected function restartWahaSession(string $wahaSessionId): array
    {
        try {
            // First, find the WAHA session in database to get the session details
            $wahaSession = WahaSession::find($wahaSessionId);
            if (!$wahaSession) {
                throw new Exception("WAHA session with ID {$wahaSessionId} not found in database");
            }

            // Use existing WahaService
            $wahaService = $this->getWahaService();
            $result = $wahaService->restartSession($wahaSession->session_name);

            Log::info('WAHA session restarted successfully', [
                'waha_session_id' => $wahaSessionId,
                'session_name' => $wahaSession->session_name,
            ]);

            return [
                'success' => true,
                'message' => 'WAHA session restarted successfully',
                'data' => $result,
            ];

        } catch (Exception $e) {
            Log::error('Failed to restart WAHA session', [
                'waha_session_id' => $wahaSessionId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to restart WAHA session',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get WAHA session info using existing WahaService
     */
    protected function getWahaSessionInfo(string $wahaSessionId): array
    {
        try {
            // First, find the WAHA session in database to get the session details
            $wahaSession = WahaSession::find($wahaSessionId);
            if (!$wahaSession) {
                throw new Exception("WAHA session with ID {$wahaSessionId} not found in database");
            }

            // Use existing WahaService
            $wahaService = $this->getWahaService();
            $result = $wahaService->getSessionInfo($wahaSession->session_name);

            Log::info('WAHA session info retrieved successfully', [
                'waha_session_id' => $wahaSessionId,
                'session_name' => $wahaSession->session_name,
            ]);

            return [
                'success' => true,
                'message' => 'WAHA session info retrieved successfully',
                'data' => $result,
            ];

        } catch (Exception $e) {
            Log::error('Failed to get WAHA session info', [
                'waha_session_id' => $wahaSessionId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to get WAHA session info',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Determine sync health based on status
     */
    protected function determineSyncHealth(array $status): string
    {
        if (!$status['has_n8n_workflow']) {
            return 'no_workflow';
        }

        if (!$status['has_waha_session'] || !$status['has_knowledge_base_item']) {
            return 'incomplete_config';
        }

        // Check WAHA session connection
        if (!$status['waha_session_connected']) {
            return 'waha_session_disconnected';
        }

        if (is_null($status['last_sync_at'])) {
            return 'never_synced';
        }

        $lastSync = \Carbon\Carbon::parse($status['last_sync_at']);
        $hoursSinceSync = $lastSync->diffInHours(now());

        if ($hoursSinceSync > 24) {
            return 'stale';
        }

        if ($status['workflow_status'] === false) {
            return 'inactive_workflow';
        }

        return 'healthy';
    }
}
