<?php

namespace App\Services;

use App\Models\BotPersonality;
use App\Services\AiInstructionService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BotPersonalityService extends BaseService
{
    protected BotPersonality $model;
    protected WorkflowSyncService $workflowSyncService;
    protected AiInstructionService $aiInstructionService;

    public function __construct(
        BotPersonality $model,
        WorkflowSyncService $workflowSyncService,
        AiInstructionService $aiInstructionService
    ) {
        $this->model = $model;
        $this->workflowSyncService = $workflowSyncService;
        $this->aiInstructionService = $aiInstructionService;
    }

    protected function getModel(): Model
    {
        return $this->model;
    }

    /**
     * Get paginated personalities for the current organization.
     */
    public function listForOrganization(Request $request, string $organizationId)
    {
        $filters = [
            'organization_id' => $organizationId,
        ];

        // Add filter parameters
        if ($request->filled('status')) {
            $filters['status'] = $request->get('status');
        }
        if ($request->filled('language')) {
            $filters['language'] = $request->get('language');
        }
        if ($request->filled('formality_level')) {
            $filters['formality_level'] = $request->get('formality_level');
        }

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query = $this->model
                ->newQuery()
                ->with(['wahaSession', 'knowledgeBaseItem'])
                ->where('organization_id', $organizationId)
                ->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%")
                      ->orWhere('display_name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });

            // Apply additional filters
            $this->applyFilters($query, $filters);

            return $query
                ->orderBy($request->get('sort_by', 'created_at'), $request->get('sort_order', 'desc'))
                ->paginate(min(100, max(1, (int) $request->get('per_page', 15))));
        }

        return $this->getPaginated($request, $filters, ['wahaSession', 'knowledgeBaseItem']);
    }

    /**
     * Create a new personality within the organization enforcing unique constraints.
     */
    public function createForOrganization(array $data, string $organizationId): BotPersonality
    {
        $data['organization_id'] = $organizationId;

        // Auto-fill n8n_workflow_id from waha_session_id if not provided
        if (empty($data['n8n_workflow_id']) && !empty($data['waha_session_id'])) {
            $wahaSession = \App\Models\WahaSession::find($data['waha_session_id']);
            if ($wahaSession && $wahaSession->n8n_workflow_id) {
                $data['n8n_workflow_id'] = $wahaSession->n8n_workflow_id;
                Log::info('Auto-filled n8n_workflow_id from waha_session', [
                    'waha_session_id' => $data['waha_session_id'],
                    'n8n_workflow_id' => $wahaSession->n8n_workflow_id,
                ]);
            }
        }

        $personality = $this->create($data);

        // Generate and sync AI instruction with workflow
        if ($personality->n8n_workflow_id || $personality->waha_session_id || $personality->knowledge_base_item_id) {
            try {
                // Generate AI instruction
                $aiInstruction = $this->aiInstructionService->generateForBotPersonality($personality);

                // Sync with workflow including AI instruction
                $this->workflowSyncService->syncBotPersonalityWorkflow($personality, $aiInstruction);

            } catch (\Exception $e) {
                Log::warning('Failed to sync workflow with AI instruction after bot personality creation', [
                    'bot_personality_id' => $personality->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $personality;
    }

    /**
     * Get a personality by ID ensuring it belongs to the organization.
     */
    public function getForOrganization(string $id, string $organizationId): ?BotPersonality
    {
        return $this->model->newQuery()
            ->with(['wahaSession', 'knowledgeBaseItem'])
            ->where('id', $id)
            ->where('organization_id', $organizationId)
            ->first();
    }

    /**
     * Update a personality within the organization.
     */
    public function updateForOrganization(string $id, array $data, string $organizationId): ?BotPersonality
    {
        $personality = $this->getForOrganization($id, $organizationId);
        if (!$personality) {
            return null;
        }

        // Auto-fill n8n_workflow_id from waha_session_id if not provided
        if (empty($data['n8n_workflow_id']) && !empty($data['waha_session_id'])) {
            $wahaSession = \App\Models\WahaSession::find($data['waha_session_id']);
            if ($wahaSession && $wahaSession->n8n_workflow_id) {
                $data['n8n_workflow_id'] = $wahaSession->n8n_workflow_id;
                Log::info('Auto-filled n8n_workflow_id from waha_session during update', [
                    'waha_session_id' => $data['waha_session_id'],
                    'n8n_workflow_id' => $wahaSession->n8n_workflow_id,
                ]);
            }
        }

        $updatedPersonality = $this->update($personality->id, $data);

        // Generate and sync AI instruction with workflow after update
        if ($updatedPersonality && ($updatedPersonality->n8n_workflow_id || $updatedPersonality->waha_session_id || $updatedPersonality->knowledge_base_item_id)) {
            try {
                // Generate AI instruction
                $aiInstruction = $this->aiInstructionService->generateForBotPersonality($updatedPersonality);

                // Sync with workflow including AI instruction
                $this->workflowSyncService->syncBotPersonalityWorkflow($updatedPersonality, $aiInstruction);

            } catch (\Exception $e) {
                Log::warning('Failed to sync workflow with AI instruction after bot personality update', [
                    'bot_personality_id' => $updatedPersonality->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $updatedPersonality;
    }

    /**
     * Delete a personality within the organization.
     */
    public function deleteForOrganization(string $id, string $organizationId): bool
    {
        $personality = $this->getForOrganization($id, $organizationId);
        if (!$personality) {
            return false;
        }
        return $this->delete($personality->id);
    }

    /**
     * Sync bot personality with its workflow
     */
    public function syncWorkflow(string $id, string $organizationId): array
    {
        $personality = $this->getForOrganization($id, $organizationId);
        if (!$personality) {
            return [
                'success' => false,
                'message' => 'Bot personality not found',
            ];
        }

        return $this->workflowSyncService->syncBotPersonalityWorkflow($personality);
    }

    /**
     * Get sync status for bot personality
     */
    public function getSyncStatus(string $id, string $organizationId): array
    {
        $personality = $this->getForOrganization($id, $organizationId);
        if (!$personality) {
            return [
                'success' => false,
                'message' => 'Bot personality not found',
            ];
        }

        return $this->workflowSyncService->getSyncStatus($personality);
    }

    /**
     * Bulk sync multiple bot personalities
     */
    public function bulkSyncWorkflows(array $ids, string $organizationId): array
    {
        // Verify all personalities belong to the organization
        $personalities = $this->model->whereIn('id', $ids)
            ->where('organization_id', $organizationId)
            ->get();

        if ($personalities->count() !== count($ids)) {
            return [
                'success' => false,
                'message' => 'Some bot personalities not found or do not belong to organization',
            ];
        }

        return $this->workflowSyncService->bulkSyncBotPersonalities($ids);
    }

    /**
     * Sync all bot personalities for organization
     */
    public function syncOrganizationWorkflows(string $organizationId): array
    {
        return $this->workflowSyncService->syncOrganizationBotPersonalities($organizationId);
    }
}


