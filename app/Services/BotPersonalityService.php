<?php

namespace App\Services;

use App\Models\BotPersonality;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BotPersonalityService extends BaseService
{
    protected BotPersonality $model;
    protected WorkflowSyncService $workflowSyncService;

    public function __construct(BotPersonality $model, WorkflowSyncService $workflowSyncService)
    {
        $this->model = $model;
        $this->workflowSyncService = $workflowSyncService;
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

        if ($request->filled('search')) {
            $search = $request->get('search');
            return $this->model
                ->newQuery()
                ->where('organization_id', $organizationId)
                ->search($search)
                ->orderBy($request->get('sort_by', 'created_at'), $request->get('sort_order', 'desc'))
                ->paginate(min(100, max(1, (int) $request->get('per_page', 15))));
        }

        return $this->getPaginated($request, $filters);
    }

    /**
     * Create a new personality within the organization enforcing unique constraints.
     */
    public function createForOrganization(array $data, string $organizationId): BotPersonality
    {
        $data['organization_id'] = $organizationId;
        $personality = $this->create($data);

        // Sync with workflow if it has workflow-related fields
        if ($personality->n8n_workflow_id || $personality->waha_session_id || $personality->knowledge_base_item_id) {
            try {
                $this->workflowSyncService->syncBotPersonalityWorkflow($personality);
            } catch (\Exception $e) {
                Log::warning('Failed to sync workflow after bot personality creation', [
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

        $updatedPersonality = $this->update($personality->id, $data);

        // Sync with workflow after update
        if ($updatedPersonality && ($updatedPersonality->n8n_workflow_id || $updatedPersonality->waha_session_id || $updatedPersonality->knowledge_base_item_id)) {
            try {
                $this->workflowSyncService->syncBotPersonalityWorkflow($updatedPersonality);
            } catch (\Exception $e) {
                Log::warning('Failed to sync workflow after bot personality update', [
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


