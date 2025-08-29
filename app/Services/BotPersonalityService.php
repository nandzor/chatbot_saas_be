<?php

namespace App\Services;

use App\Models\BotPersonality;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class BotPersonalityService extends BaseService
{
    protected BotPersonality $model;

    public function __construct(BotPersonality $model)
    {
        $this->model = $model;
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

        if ($search = $request->get('search')) {
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
        return $this->create($data);
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
        return $this->update($personality->id, $data);
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
}


