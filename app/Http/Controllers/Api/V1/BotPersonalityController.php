<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\BotPersonality\CreateBotPersonalityRequest;
use App\Http\Requests\BotPersonality\UpdateBotPersonalityRequest;
use App\Http\Resources\BotPersonalityResource;
use App\Services\BotPersonalityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BotPersonalityController extends BaseApiController
{
    protected BotPersonalityService $service;

    public function __construct(BotPersonalityService $service)
    {
        parent::__construct();
        $this->service = $service;
    }

    /**
     * List personalities for current organization (org_admin required).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $this->getCurrentUser();
        if (!$user || !in_array($user->role, ['org_admin', 'super_admin'])) {
            return $this->handleForbiddenAccess('list bot personalities');
        }

        $organizationId = $user->organization_id;

        $list = $this->service->getPersonalitiesForInbox($request, $organizationId);

        return $this->successResponse(
            'Bot personalities retrieved successfully',
            $list,
            200
        );
    }

    /**
     * Create new personality.
     */
    public function store(CreateBotPersonalityRequest $request): JsonResponse
    {
        $user = $this->getCurrentUser();

        $data = $request->getSanitizedData();
        $data['organization_id'] = $user->organization_id;

        $created = $this->service->createForOrganization($data, $user->organization_id);

        $this->logApiAction('bot_personality_created', [
            'id' => $created->id,
            'organization_id' => $created->organization_id,
            'user_id' => $user->id,
        ]);

        return $this->successResponse(
            'Bot personality created successfully',
            new BotPersonalityResource($created),
            201
        );
    }

    /**
     * Show details.
     */
    public function show(string $id): JsonResponse
    {
        $user = $this->getCurrentUser();
        if (!$user) {
            return $this->unauthorizedResponse('Authentication required');
        }

        $resource = $this->service->getForOrganization($id, $user->organization_id);
        if (!$resource) {
            return $this->handleResourceNotFound('BotPersonality', $id);
        }

        return $this->successResponse(
            'Bot personality retrieved successfully',
            new BotPersonalityResource($resource)
        );
    }

    /**
     * Update.
     */
    public function update(UpdateBotPersonalityRequest $request, string $id): JsonResponse
    {
        $user = $this->getCurrentUser();
        if (!$user) {
            return $this->unauthorizedResponse('Authentication required');
        }

        $updated = $this->service->updateForOrganization($id, $request->getSanitizedData(), $user->organization_id);

        if (!$updated) {
            return $this->handleResourceNotFound('BotPersonality', $id);
        }

        $this->logApiAction('bot_personality_updated', [
            'id' => $id,
            'organization_id' => $user->organization_id,
            'user_id' => $user->id,
        ]);

        return $this->successResponse(
            'Bot personality updated successfully',
            new BotPersonalityResource($updated)
        );
    }

    /**
     * Delete.
     */
    public function destroy(string $id): JsonResponse
    {
        $user = $this->getCurrentUser();
        if (!$user) {
            return $this->unauthorizedResponse('Authentication required');
        }

        $deleted = $this->service->deleteForOrganization($id, $user->organization_id);

        if (!$deleted) {
            return $this->handleResourceNotFound('BotPersonality', $id);
        }

        $this->logApiAction('bot_personality_deleted', [
            'id' => $id,
            'organization_id' => $user->organization_id,
            'user_id' => $user->id,
        ]);

        return $this->successResponse('Bot personality deleted successfully');
    }

    /**
     * Sync bot personality with its workflow
     */
    public function syncWorkflow(string $id): JsonResponse
    {
        $user = $this->getCurrentUser();
        if (!$user) {
            return $this->unauthorizedResponse('Authentication required');
        }

        $result = $this->service->syncWorkflow($id, $user->organization_id);

        if ($result['success']) {
            $this->logApiAction('bot_personality_workflow_synced', [
                'bot_personality_id' => $id,
                'organization_id' => $user->organization_id,
                'user_id' => $user->id,
            ]);

            return $this->successResponse(
                $result['message'],
                $result['results'] ?? null
            );
        }

        return $this->errorResponse($result['message'], 500);
    }

    /**
     * Get sync status for bot personality
     */
    public function getSyncStatus(string $id): JsonResponse
    {
        $user = $this->getCurrentUser();
        if (!$user) {
            return $this->unauthorizedResponse('Authentication required');
        }

        $result = $this->service->getSyncStatus($id, $user->organization_id);

        if ($result['success']) {
            return $this->successResponse(
                'Sync status retrieved successfully',
                $result['data']
            );
        }

        return $this->errorResponse($result['message'], 404);
    }

    /**
     * Bulk sync multiple bot personalities
     */
    public function bulkSyncWorkflows(Request $request): JsonResponse
    {
        $user = $this->getCurrentUser();
        if (!$user) {
            return $this->unauthorizedResponse('Authentication required');
        }

        $request->validate([
            'bot_personality_ids' => 'required|array|min:1',
            'bot_personality_ids.*' => 'uuid|exists:bot_personalities,id',
        ]);

        $result = $this->service->bulkSyncWorkflows(
            $request->input('bot_personality_ids'),
            $user->organization_id
        );

        $this->logApiAction('bot_personalities_bulk_sync', [
            'bot_personality_ids' => $request->input('bot_personality_ids'),
            'organization_id' => $user->organization_id,
            'user_id' => $user->id,
            'summary' => $result['summary'] ?? null,
        ]);

        if ($result['success']) {
            return $this->successResponse(
                $result['message'],
                $result['summary']
            );
        }

        return $this->errorResponse($result['message'], 500);
    }

    /**
     * Sync all bot personalities for organization
     */
    public function syncOrganizationWorkflows(): JsonResponse
    {
        $user = $this->getCurrentUser();
        if (!$user) {
            return $this->unauthorizedResponse('Authentication required');
        }

        $result = $this->service->syncOrganizationWorkflows($user->organization_id);

        $this->logApiAction('organization_bot_personalities_sync', [
            'organization_id' => $user->organization_id,
            'user_id' => $user->id,
            'summary' => $result['summary'] ?? null,
        ]);

        if ($result['success']) {
            return $this->successResponse(
                $result['message'],
                $result['summary']
            );
        }

        return $this->errorResponse($result['message'], 500);
    }
}


