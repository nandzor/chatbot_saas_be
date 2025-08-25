<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\OrganizationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class OrganizationManagementController extends BaseApiController
{
    protected OrganizationService $organizationService;

    public function __construct(OrganizationService $organizationService)
    {
        $this->organizationService = $organizationService;
    }

    /**
     * Get paginated list of organizations with filters and search.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $organizations = $this->organizationService->getPaginatedOrganizations(
                $request->get('page', 1),
                $request->get('per_page', 15),
                $request->only(['search', 'status', 'plan']),
                $request->get('sort_by', 'created_at'),
                $request->get('sort_order', 'desc')
            );

            return $this->successResponse(
                'Organizations retrieved successfully',
                $organizations->items(),
                200,
                [
                    'pagination' => [
                        'current_page' => $organizations->currentPage(),
                        'per_page' => $organizations->perPage(),
                        'total' => $organizations->total(),
                        'last_page' => $organizations->lastPage()
                    ]
                ]
            );

        } catch (\Exception $e) {
            Log::error('Get organizations error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to retrieve organizations',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Get specific organization details.
     */
    public function show(string $organizationId): JsonResponse
    {
        try {
            // Validate organizationId parameter
            if (empty($organizationId)) {
                return $this->errorResponse('Organization ID is required', null, 400);
            }

            $organization = $this->organizationService->getOrganizationWithDetails($organizationId);

            if (!$organization) {
                return $this->notFoundResponse('Organization not found');
            }

            return $this->successResponse('Organization retrieved successfully', $organization);

        } catch (\Exception $e) {
            Log::error('Get organization error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to retrieve organization',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Create a new organization.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'domain' => 'required|string|max:255|unique:organizations,domain',
                'description' => 'nullable|string',
                'status' => 'string|in:active,inactive,suspended',
                'plan' => 'string|in:free,basic,premium,enterprise',
                'max_users' => 'integer|min:1',
                'settings' => 'nullable|array'
            ]);

            $organization = $this->organizationService->createOrganization($validated, $this->getCurrentUser());

            return $this->createdResponse('Organization created successfully', $organization);

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Create organization error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to create organization',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Update the specified organization.
     */
    public function update(Request $request, string $organizationId): JsonResponse
    {
        try {
            // Validate organizationId parameter
            if (empty($organizationId)) {
                return $this->errorResponse('Organization ID is required', null, 400);
            }

            $organization = $this->organizationService->getOrganizationWithDetails($organizationId);

            if (!$organization) {
                return $this->notFoundResponse('Organization not found');
            }

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'domain' => 'sometimes|string|max:255|unique:organizations,domain,' . $organizationId,
                'description' => 'nullable|string',
                'status' => 'string|in:active,inactive,suspended',
                'plan' => 'string|in:free,basic,premium,enterprise',
                'max_users' => 'integer|min:1',
                'settings' => 'nullable|array'
            ]);

            $updatedOrganization = $this->organizationService->updateOrganization($organizationId, $validated, $this->getCurrentUser());

            return $this->successResponse('Organization updated successfully', $updatedOrganization);

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Update organization error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to update organization',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Remove the specified organization.
     */
    public function destroy(string $organizationId): JsonResponse
    {
        try {
            // Validate organizationId parameter
            if (empty($organizationId)) {
                return $this->errorResponse('Organization ID is required', null, 400);
            }

            $organization = $this->organizationService->getOrganizationWithDetails($organizationId);

            if (!$organization) {
                return $this->notFoundResponse('Organization not found');
            }

            $this->organizationService->deleteOrganization($organizationId, $this->getCurrentUser());

            return $this->deletedResponse('Organization deleted successfully');

        } catch (\Exception $e) {
            Log::error('Delete organization error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to delete organization',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Get organization statistics.
     */
    public function statistics(): JsonResponse
    {
        try {
            $statistics = $this->organizationService->getOrganizationStatistics();

            return $this->successResponse('Organization statistics retrieved successfully', $statistics);

        } catch (\Exception $e) {
            Log::error('Get organization statistics error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to retrieve organization statistics',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Get users for a specific organization.
     */
    public function users(string $organizationId): JsonResponse
    {
        try {
            // Validate organizationId parameter
            if (empty($organizationId)) {
                return $this->errorResponse('Organization ID is required', null, 400);
            }

            $organization = $this->organizationService->getOrganizationWithDetails($organizationId);

            if (!$organization) {
                return $this->notFoundResponse('Organization not found');
            }

            $users = $this->organizationService->getOrganizationUsers($organizationId);

            return $this->successResponse('Organization users retrieved successfully', $users);

        } catch (\Exception $e) {
            Log::error('Get organization users error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to retrieve organization users',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Add user to organization.
     */
    public function addUser(Request $request, string $organizationId): JsonResponse
    {
        try {
            // Validate organizationId parameter
            if (empty($organizationId)) {
                return $this->errorResponse('Organization ID is required', null, 400);
            }

            $validated = $request->validate([
                'user_id' => 'required|integer|exists:users,id',
                'role_id' => 'required|string|exists:roles,id'
            ]);

            $organization = $this->organizationService->getOrganizationWithDetails($organizationId);

            if (!$organization) {
                return $this->notFoundResponse('Organization not found');
            }

            $success = $this->organizationService->addUserToOrganization(
                $organizationId,
                $validated['user_id'],
                $validated['role_id'],
                $this->getCurrentUser()
            );

            if ($success) {
                return $this->successResponse('User added to organization successfully');
            }

            return $this->errorResponse('Failed to add user to organization', ['error' => 'Could not add user']);

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            Log::error('Add user to organization error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to add user to organization',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }

    /**
     * Remove user from organization.
     */
    public function removeUser(Request $request, string $organizationId, string $userId): JsonResponse
    {
        try {
            // Validate organizationId parameter
            if (empty($organizationId)) {
                return $this->errorResponse('Organization ID is required', null, 400);
            }

            // Validate userId parameter
            if (empty($userId)) {
                return $this->errorResponse('User ID is required', null, 400);
            }

            $organization = $this->organizationService->getOrganizationWithDetails($organizationId);

            if (!$organization) {
                return $this->notFoundResponse('Organization not found');
            }

            $success = $this->organizationService->removeUserFromOrganization($organizationId, $userId, $this->getCurrentUser());

            if ($success) {
                return $this->successResponse('User removed from organization successfully');
            }

            return $this->errorResponse('Failed to remove user from organization', ['error' => 'Could not remove user']);

        } catch (\Exception $e) {
            Log::error('Remove user from organization error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponseWithDebug(
                'Failed to remove user from organization',
                500,
                ['error' => 'An unexpected error occurred'],
                $e
            );
        }
    }
}
