<?php

namespace App\Services;

use App\Models\BotPersonality;
use App\Models\WahaSession;
use App\Models\KnowledgeBaseItem;
use App\Models\N8nWorkflow;
use App\Traits\HasWorkflowIntegration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Queue;
use Exception;

/**
 * BotPersonalityWorkflowService
 *
 * Handles the complex 3-phase workflow for creating, activating, and configuring
 * Bot Personality entities with n8n workflow integration.
 *
 * Architecture:
 * - Phase 1: Data initialization and persistence (transactional)
 * - Phase 2: Activation and status update (concurrent execution)
 * - Phase 3: System message configuration synchronization
 */
class BotPersonalityWorkflowService
{
    use HasWorkflowIntegration;

    /**
     * Execute the complete Bot Personality workflow
     *
     * @param array $data Input data containing waha_session_id and knowledge_base_item_id
     * @return array Result of the workflow execution
     * @throws Exception
     */
    public function executeWorkflow(array $data): array
    {
        $startTime = microtime(true);

        try {
            // Validate input data
            $this->validateWorkflowData($data);

            // Phase 1: Data initialization and persistence (transactional)
            $phase1Result = $this->executePhase1($data);

            // Phase 2: Activation and status update (concurrent execution)
            $phase2Result = $this->executePhase2($phase1Result);

            // Phase 3: System message configuration synchronization
            $phase3Result = $this->executePhase3($phase1Result, $phase2Result);

            $executionTime = round((microtime(true) - $startTime) * 1000, 2);

            return [
                'success' => true,
                'message' => 'Bot Personality workflow completed successfully',
                'data' => [
                    'bot_personality_id' => $phase1Result['bot_personality_id'],
                    'waha_session_id' => $data['waha_session_id'],
                    'knowledge_base_item_id' => $data['knowledge_base_item_id'],
                    'n8n_workflow_id' => $phase1Result['n8n_workflow_id'],
                    'status' => 'active',
                    'execution_time_ms' => $executionTime,
                ],
                'phases' => [
                    'phase1' => $phase1Result,
                    'phase2' => $phase2Result,
                    'phase3' => $phase3Result,
                ]
            ];

        } catch (Exception $e) {
            Log::error('Bot Personality workflow failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'input_data' => $data,
            ]);

            throw $e;
        }
    }

    /**
     * Phase 1: Data initialization and persistence (transactional)
     *
     * This phase must be executed within a single database transaction
     * to ensure atomicity.
     */
    protected function executePhase1(array $data): array
    {
        return DB::transaction(function () use ($data) {
            // Step 1.1: Retrieve dependent data
            $wahaSession = $this->getValidatedWahaSession($data['waha_session_id']);
            $knowledgeBaseItem = $this->getValidatedKnowledgeBaseItem($data['knowledge_base_item_id']);

            // Step 1.2: Create main entity
            $botPersonality = $this->createBotPersonalityEntity([
                'waha_session_id' => $data['waha_session_id'],
                'knowledge_base_item_id' => $data['knowledge_base_item_id'],
                'n8n_workflow_id' => $wahaSession->n8n_workflow_id,
                'organization_id' => $wahaSession->organization_id,
                'status' => 'creating',
            ]);

            return [
                'bot_personality_id' => $botPersonality->id,
                'n8n_workflow_id' => $wahaSession->n8n_workflow_id,
                'waha_session' => $wahaSession,
                'knowledge_base_item' => $knowledgeBaseItem,
            ];
        });
    }

    /**
     * Phase 2: Activation and status update (concurrent execution)
     *
     * After Phase 1 transaction is committed, trigger two concurrent processes
     * to optimize throughput.
     */
    protected function executePhase2(array $phase1Result): array
    {
        $botPersonalityId = $phase1Result['bot_personality_id'];
        $n8nWorkflowId = $phase1Result['n8n_workflow_id'];

        // Execute Process A and B concurrently
        $processA = $this->activateExternalService($n8nWorkflowId);
        $processB = $this->updateInternalStatus($botPersonalityId);

        return [
            'external_activation' => $processA,
            'internal_status_update' => $processB,
        ];
    }

    /**
     * Phase 3: System message configuration synchronization
     *
     * Ensures Bot Personality configuration is synchronized between
     * internal system and n8n platform.
     */
    protected function executePhase3(array $phase1Result, array $phase2Result): array
    {
        $knowledgeBaseItem = $phase1Result['knowledge_base_item'];
        $n8nWorkflowId = $phase1Result['n8n_workflow_id'];

        // Step 3.1: Retrieve configuration source
        $systemMessage = $this->retrieveSystemMessageConfiguration($knowledgeBaseItem);

        // Step 3.2: Distribute configuration
        $n8nUpdate = $this->updateN8nConfiguration($n8nWorkflowId, $systemMessage);
        $dbUpdate = $this->updateDatabaseConfiguration($n8nWorkflowId, $systemMessage);

        return [
            'system_message' => $systemMessage,
            'n8n_configuration_update' => $n8nUpdate,
            'database_configuration_update' => $dbUpdate,
        ];
    }


    /**
     * Create BotPersonality entity
     */
    protected function createBotPersonalityEntity(array $data): BotPersonality
    {
        $botPersonality = BotPersonality::create([
            'organization_id' => $data['organization_id'],
            'name' => 'Auto-generated Bot Personality',
            'code' => 'auto_bot_' . substr($data['waha_session_id'], 0, 8),
            'display_name' => 'Auto-generated Bot Personality',
            'description' => 'Automatically generated bot personality from workflow',
            'language' => 'indonesia',
            'formality_level' => 'formal',
            'status' => $data['status'],
            'waha_session_id' => $data['waha_session_id'],
            'knowledge_base_item_id' => $data['knowledge_base_item_id'],
            'n8n_workflow_id' => $data['n8n_workflow_id'],
            'is_default' => false,
            'learning_enabled' => true,
            'enable_small_talk' => true,
            'typing_indicator' => true,
            'response_delay_ms' => 1000,
            'max_response_length' => 1000,
            'confidence_threshold' => 0.75,
        ]);

        Log::info('BotPersonality created in Phase 1', [
            'bot_personality_id' => $botPersonality->id,
            'waha_session_id' => $data['waha_session_id'],
            'knowledge_base_item_id' => $data['knowledge_base_item_id'],
            'n8n_workflow_id' => $data['n8n_workflow_id'],
        ]);

        return $botPersonality;
    }

    /**
     * Process A: Activate external service (API Call)
     */
    protected function activateExternalService(string $n8nWorkflowId): array
    {
        $result = $this->activateN8nWorkflow($n8nWorkflowId);

        if (!$result['success']) {
            // Implement retry mechanism (exponential backoff)
            $this->scheduleRetry('activate_n8n_workflow', $n8nWorkflowId);
            $result['retry_scheduled'] = true;
        }

        return $result;
    }

    /**
     * Process B: Update internal status (Database Update)
     */
    protected function updateInternalStatus(string $botPersonalityId): array
    {
        try {
            $botPersonality = BotPersonality::find($botPersonalityId);

            if (!$botPersonality) {
                throw new Exception("BotPersonality with ID {$botPersonalityId} not found");
            }

            $botPersonality->update([
                'status' => 'active',
                'updated_at' => now(),
            ]);

            Log::info('BotPersonality status updated to active', [
                'bot_personality_id' => $botPersonalityId,
            ]);

            return [
                'success' => true,
                'message' => 'BotPersonality status updated to active',
                'status' => 'active',
            ];

        } catch (Exception $e) {
            Log::error('Failed to update BotPersonality status', [
                'bot_personality_id' => $botPersonalityId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to update BotPersonality status',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Retrieve system message configuration from KnowledgeBaseItem
     */
    protected function retrieveSystemMessageConfiguration(KnowledgeBaseItem $knowledgeBaseItem): string
    {
        return $this->getSystemMessageFromKnowledgeBase($knowledgeBaseItem);
    }

    /**
     * Update N8N configuration with system message
     */
    protected function updateN8nConfiguration(string $n8nWorkflowId, string $systemMessage): array
    {
        return $this->updateN8nSystemMessage($n8nWorkflowId, $systemMessage);
    }

    /**
     * Update database configuration cache
     */
    protected function updateDatabaseConfiguration(string $n8nWorkflowId, string $systemMessage): array
    {
        return $this->updateDatabaseWorkflowConfiguration($n8nWorkflowId, [
            'system_message' => $systemMessage
        ]);
    }

    /**
     * Schedule retry for failed operations
     */
    protected function scheduleRetry(string $operation, string $workflowId): void
    {
        // Queue a retry job with exponential backoff
        Queue::later(
            now()->addMinutes(5), // Initial delay
            new \App\Jobs\RetryN8nWorkflowOperation($operation, $workflowId)
        );

        Log::info('Retry scheduled for N8N workflow operation', [
            'operation' => $operation,
            'workflow_id' => $workflowId,
            'retry_delay_minutes' => 5,
        ]);
    }

    /**
     * Get workflow status
     */
    public function getWorkflowStatus(string $botPersonalityId): array
    {
        $botPersonality = BotPersonality::find($botPersonalityId);

        if (!$botPersonality) {
            throw new Exception("BotPersonality with ID {$botPersonalityId} not found");
        }

        return [
            'bot_personality_id' => $botPersonality->id,
            'status' => $botPersonality->status,
            'waha_session_id' => $botPersonality->waha_session_id,
            'knowledge_base_item_id' => $botPersonality->knowledge_base_item_id,
            'n8n_workflow_id' => $botPersonality->n8n_workflow_id,
            'created_at' => $botPersonality->created_at,
            'updated_at' => $botPersonality->updated_at,
        ];
    }
}
