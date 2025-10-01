<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\AgentService;
use App\Services\AgentPreferencesService;
use App\Services\AgentTemplateService;
use App\Models\Agent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AgentController extends BaseApiController
{
    protected AgentService $agentService;
    protected AgentPreferencesService $preferencesService;
    protected AgentTemplateService $templateService;

    public function __construct(
        AgentService $agentService,
        AgentPreferencesService $preferencesService,
        AgentTemplateService $templateService
    ) {
        $this->agentService = $agentService;
        $this->preferencesService = $preferencesService;
        $this->templateService = $templateService;
    }
    /**
     * Get all agents for the organization
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $result = $this->agentService->getAllAgents($request);

            $this->logApiAction('agents_listed', [
                'organization_id' => Auth::user()->organization_id,
                'filters' => $request->only(['search', 'status', 'available', 'department', 'skills']),
                'count' => $result['data']->count()
            ]);

            return $this->successResponseWithLog(
                'agents_listed',
                'Agents retrieved successfully',
                $result['data'],
                200,
                ['pagination' => $result['pagination']]
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'agents_list_error',
                'Failed to retrieve agents',
                $e->getMessage(),
                500,
                'AGENTS_LIST_ERROR'
            );
        }
    }

    /**
     * Get a specific agent
     */
    public function show(string $id): JsonResponse
    {
        try {
            $agent = $this->agentService->getAgent($id);

            $this->logApiAction('agent_viewed', [
                'agent_id' => $id,
                'organization_id' => Auth::user()->organization_id
            ]);

            return $this->successResponseWithLog(
                'agent_viewed',
                'Agent retrieved successfully',
                $agent
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'agent_retrieval_error',
                'Failed to retrieve agent',
                $e->getMessage(),
                500,
                'AGENT_RETRIEVAL_ERROR'
            );
        }
    }

    /**
     * Get agent statistics
     */
    public function statistics(Request $request, string $id): JsonResponse
    {
        try {
            $statistics = $this->agentService->getAgentStatistics($id, $request);

            $this->logApiAction('agent_statistics_retrieved', [
                'agent_id' => $id,
                'organization_id' => Auth::user()->organization_id,
                'date_from' => $request->get('date_from', now()->subDays(30)->toDateString()),
                'date_to' => $request->get('date_to', now()->toDateString())
            ]);

            return $this->successResponseWithLog(
                'agent_statistics_retrieved',
                'Agent statistics retrieved successfully',
                $statistics
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'agent_statistics_error',
                'Failed to retrieve agent statistics',
                $e->getMessage(),
                500,
                'AGENT_STATISTICS_ERROR'
            );
        }
    }

    /**
     * Update agent availability
     */
    public function updateAvailability(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'is_available' => 'required|boolean',
                'status' => 'sometimes|string|in:online,away,busy,offline'
            ]);

            $result = $this->agentService->updateAgentAvailability($id, $request->only(['is_available', 'status']));

            $this->logApiAction('agent_availability_updated', [
                'agent_id' => $id,
                'organization_id' => Auth::user()->organization_id,
                'is_available' => $result['is_available'] ?? null,
                'status' => $result['status'] ?? null
            ]);

            return $this->successResponseWithLog(
                'agent_availability_updated',
                'Agent availability updated successfully',
                $result
            );
        } catch (ValidationException $e) {
            return $this->errorResponseWithLog(
                'agent_availability_validation_error',
                'Validation failed',
                $e->getMessage(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'agent_availability_update_error',
                'Failed to update agent availability',
                $e->getMessage(),
                500,
                'AGENT_AVAILABILITY_UPDATE_ERROR'
            );
        }
    }

    /**
     * Get available agents for assignment
     */
    public function available(Request $request): JsonResponse
    {
        try {
            $agents = $this->agentService->getAvailableAgents($request);

            $this->logApiAction('available_agents_retrieved', [
                'organization_id' => Auth::user()->organization_id,
                'filters' => $request->only(['department', 'skills', 'with_capacity']),
                'count' => count($agents)
            ]);

            return $this->successResponseWithLog(
                'available_agents_retrieved',
                'Available agents retrieved successfully',
                $agents
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'available_agents_error',
                'Failed to retrieve available agents',
                $e->getMessage(),
                500,
                'AVAILABLE_AGENTS_ERROR'
            );
        }
    }

    /**
     * Get current agent information
     */
    public function me(): JsonResponse
    {
        try {
            $result = $this->agentService->getCurrentAgent();

            return $this->successResponse(
                'Current agent information retrieved successfully',
                $result
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to retrieve current agent information',
                null,
                500,
                'AGENT_ME_ERROR'
            );
        }
    }

    /**
     * Update current agent availability
     */
    public function updateMyAvailability(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'status' => 'sometimes|string|in:online,away,busy,offline',
                'is_available' => 'sometimes|boolean',
                'max_concurrent_chats' => 'sometimes|integer|min:1|max:20',
                'working_hours' => 'sometimes|array',
                'breaks' => 'sometimes|array',
                'time_off' => 'sometimes|array',
                'away_message' => 'sometimes|string|max:500'
            ]);

            $result = $this->agentService->updateCurrentAgentAvailability($request->only([
                'status',
                'is_available',
                'max_concurrent_chats',
                'working_hours',
                'breaks',
                'time_off',
                'away_message'
            ]));

            return $this->successResponse(
                'Agent availability updated successfully',
                $result
            );
        } catch (ValidationException $e) {
            return $this->errorResponse(
                'Validation failed',
                $e->errors(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to update agent availability',
                null,
                500,
                'AGENT_AVAILABILITY_UPDATE_ERROR'
            );
        }
    }

    /**
     * Get current agent profile
     */
    public function getMyProfile(): JsonResponse
    {
        try {
            $result = $this->agentService->getCurrentAgentProfile();

            return $this->successResponse(
                'Agent profile retrieved successfully',
                $result
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to retrieve agent profile',
                null,
                500,
                'AGENT_PROFILE_ERROR'
            );
        }
    }

    /**
     * Update current agent profile
     */
    public function updateMyProfile(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'display_name' => 'sometimes|string|max:255',
                'department' => 'sometimes|string|max:255',
                'working_hours' => 'sometimes|array',
                'breaks' => 'sometimes|array',
                'time_off' => 'sometimes|array',
                'away_message' => 'sometimes|string|max:500'
            ]);

            $result = $this->agentService->updateCurrentAgentProfile($request->only([
                'display_name',
                'department',
                'working_hours',
                'breaks',
                'time_off',
                'away_message'
            ]));

            return $this->successResponse(
                'Agent profile updated successfully',
                $result
            );
        } catch (ValidationException $e) {
            return $this->errorResponse(
                'Validation failed',
                $e->errors(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to update agent profile',
                null,
                500,
                'AGENT_PROFILE_UPDATE_ERROR'
            );
        }
    }

    /**
     * Upload current agent avatar
     */
    public function uploadMyAvatar(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $agent = Agent::where('user_id', $user->id)
                ->where('organization_id', $user->organization_id)
                ->first();

            if (!$agent) {
                return $this->errorResponse(
                    'Agent not found for current user',
                    null,
                    404,
                    'AGENT_NOT_FOUND'
                );
            }

            $request->validate([
                'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            // Handle avatar upload logic here
            // This would typically involve storing the file and updating the user's avatar_url

            return $this->successResponse(
                'Avatar upload endpoint ready',
                [
                    'message' => 'Avatar upload functionality needs to be implemented'
                ]
            );
        } catch (ValidationException $e) {
            return $this->errorResponse(
                'Validation failed',
                $e->errors(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to upload avatar',
                null,
                500,
                'AVATAR_UPLOAD_ERROR'
            );
        }
    }

    /**
     * Get current agent notification preferences
     */
    public function getMyNotifications(): JsonResponse
    {
        try {
            $preferences = $this->preferencesService->getNotificationPreferences();

            return $this->successResponse(
                'Notification preferences retrieved successfully',
                [
                    'preferences' => $preferences
                ]
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to retrieve notification preferences',
                null,
                500,
                'NOTIFICATION_PREFERENCES_ERROR'
            );
        }
    }

    /**
     * Update current agent notification preferences
     */
    public function updateMyNotifications(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'preferences' => 'required|array'
            ]);

            $preferences = $this->preferencesService->updateNotificationPreferences($request->preferences);

            return $this->successResponse(
                'Notification preferences updated successfully',
                [
                    'preferences' => $preferences
                ]
            );
        } catch (ValidationException $e) {
            return $this->errorResponse(
                'Validation failed',
                $e->errors(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to update notification preferences',
                null,
                500,
                'NOTIFICATION_PREFERENCES_UPDATE_ERROR'
            );
        }
    }

    /**
     * Get current agent UI preferences
     */
    public function getMyPreferences(): JsonResponse
    {
        try {
            $preferences = $this->preferencesService->getUIPreferences();

            return $this->successResponse(
                'UI preferences retrieved successfully',
                [
                    'preferences' => $preferences
                ]
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to retrieve UI preferences',
                null,
                500,
                'UI_PREFERENCES_ERROR'
            );
        }
    }

    /**
     * Update current agent UI preferences
     */
    public function updateMyPreferences(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'preferences' => 'required|array'
            ]);

            $preferences = $this->preferencesService->updateUIPreferences($request->preferences);

            return $this->successResponse(
                'UI preferences updated successfully',
                [
                    'preferences' => $preferences
                ]
            );
        } catch (ValidationException $e) {
            return $this->errorResponse(
                'Validation failed',
                $e->errors(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to update UI preferences',
                null,
                500,
                'UI_PREFERENCES_UPDATE_ERROR'
            );
        }
    }

    /**
     * Get current agent personal templates
     */
    public function getMyTemplates(): JsonResponse
    {
        try {
            $templates = $this->templateService->getPersonalTemplates(request());

            return $this->successResponse(
                'Personal templates retrieved successfully',
                $templates
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to retrieve personal templates',
                null,
                500,
                'PERSONAL_TEMPLATES_ERROR'
            );
        }
    }

    /**
     * Create current agent personal template
     */
    public function createMyTemplate(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'title' => 'required|string|max:255',
                'category' => 'required|string|max:100',
                'content' => 'required|string|max:2000',
                'tags' => 'sometimes|array'
            ]);

            $template = $this->templateService->createPersonalTemplate($request->all());

            return $this->successResponse(
                'Personal template created successfully',
                [
                    'template' => $template
                ]
            );
        } catch (ValidationException $e) {
            return $this->errorResponse(
                'Validation failed',
                $e->errors(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to create personal template',
                null,
                500,
                'PERSONAL_TEMPLATE_CREATE_ERROR'
            );
        }
    }

    /**
     * Update current agent personal template
     */
    public function updateMyTemplate(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'title' => 'sometimes|string|max:255',
                'category' => 'sometimes|string|max:100',
                'content' => 'sometimes|string|max:2000',
                'tags' => 'sometimes|array'
            ]);

            $template = $this->templateService->updatePersonalTemplate($id, $request->all());

            return $this->successResponse(
                'Personal template updated successfully',
                [
                    'template' => $template
                ]
            );
        } catch (ValidationException $e) {
            return $this->errorResponse(
                'Validation failed',
                $e->errors(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to update personal template',
                null,
                500,
                'PERSONAL_TEMPLATE_UPDATE_ERROR'
            );
        }
    }

    /**
     * Delete current agent personal template
     */
    public function deleteMyTemplate(string $id): JsonResponse
    {
        try {
            $result = $this->templateService->deletePersonalTemplate($id);

            return $this->successResponse(
                'Personal template deleted successfully',
                $result
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to delete personal template',
                null,
                500,
                'PERSONAL_TEMPLATE_DELETE_ERROR'
            );
        }
    }

    /**
     * Export current agent data
     */
    public function exportMyData(Request $request): JsonResponse
    {
        try {
            $format = $request->get('format', 'json');
            $exportData = $this->agentService->exportCurrentAgentData($format);

            if ($format === 'json') {
                return response()->json($exportData, 200, [
                    'Content-Type' => 'application/json',
                    'Content-Disposition' => 'attachment; filename="agent-data-' . now()->format('Y-m-d-H-i-s') . '.json"'
                ]);
            }

            return $this->successResponse(
                'Agent data exported successfully',
                $exportData
            );
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to export agent data',
                null,
                500,
                'AGENT_EXPORT_ERROR'
            );
        }
    }
}
