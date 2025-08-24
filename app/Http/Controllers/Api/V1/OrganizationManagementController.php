<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class OrganizationManagementController extends BaseApiController
{
    /**
     * Get paginated list of organizations with filters and search.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $pagination = $this->getPaginationParams($request);
            $filters = $this->getFilterParams($request, [
                'search', 'status', 'plan', 'created_at'
            ]);

            $query = Organization::query();

            // Apply filters
            if (!empty($filters['search'])) {
                $query->where('name', 'like', '%' . $filters['search'] . '%')
                      ->orWhere('domain', 'like', '%' . $filters['search'] . '%');
            }

            if (!empty($filters['status'])) {
                $query->where('status', $filters['status']);
            }

            if (!empty($filters['plan'])) {
                $query->where('plan', $filters['plan']);
            }

            if (!empty($filters['created_at'])) {
                $query->whereDate('created_at', $filters['created_at']);
            }

            $organizations = $query->paginate($pagination['per_page'], ['*'], 'page', $pagination['page']);

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
            return $this->serverErrorResponse('Failed to retrieve organizations', $e->getMessage());
        }
    }

    /**
     * Get specific organization details.
     */
    public function show(string $organizationId): JsonResponse
    {
        try {
            $organization = Organization::with(['users'])->find($organizationId);

            if (!$organization) {
                return $this->notFoundResponse('Organization not found');
            }

            return $this->successResponse('Organization retrieved successfully', $organization);

        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to retrieve organization', $e->getMessage());
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

            $organization = Organization::create($validated);

            return $this->successResponse('Organization created successfully', $organization, 201);

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to create organization', $e->getMessage());
        }
    }

    /**
     * Update the specified organization.
     */
    public function update(Request $request, string $organizationId): JsonResponse
    {
        try {
            $organization = Organization::find($organizationId);

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

            $organization->update($validated);
            $organization->refresh();

            return $this->successResponse('Organization updated successfully', $organization, 200);

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to update organization', $e->getMessage());
        }
    }

    /**
     * Remove the specified organization.
     */
    public function destroy(string $organizationId): JsonResponse
    {
        try {
            $organization = Organization::find($organizationId);

            if (!$organization) {
                return $this->notFoundResponse('Organization not found');
            }

            $organization->delete();

            return $this->successResponse('Organization deleted successfully', null, 200);

        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to delete organization', $e->getMessage());
        }
    }

    /**
     * Get organization statistics.
     */
    public function statistics(): JsonResponse
    {
        try {
            $statistics = [
                'total_organizations' => Organization::count(),
                'active_organizations' => Organization::where('status', 'active')->count(),
                'inactive_organizations' => Organization::where('status', 'inactive')->count(),
                'suspended_organizations' => Organization::where('status', 'suspended')->count(),
                'free_plan' => Organization::where('plan', 'free')->count(),
                'basic_plan' => Organization::where('plan', 'basic')->count(),
                'premium_plan' => Organization::where('plan', 'premium')->count(),
                'enterprise_plan' => Organization::where('plan', 'enterprise')->count(),
                'organizations_with_users' => Organization::has('users')->count()
            ];

            return $this->successResponse('Organization statistics retrieved successfully', $statistics);

        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to retrieve organization statistics', $e->getMessage());
        }
    }

    /**
     * Get users in organization.
     */
    public function users(string $organizationId): JsonResponse
    {
        try {
            $organization = Organization::with('users')->find($organizationId);

            if (!$organization) {
                return $this->notFoundResponse('Organization not found');
            }

            return $this->successResponse('Organization users retrieved successfully', $organization->users);

        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to retrieve organization users', $e->getMessage());
        }
    }

    /**
     * Add user to organization.
     */
    public function addUser(Request $request, string $organizationId): JsonResponse
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|integer|exists:users,id'
            ]);

            $organization = Organization::find($organizationId);
            $user = User::find($validated['user_id']);

            if (!$organization) {
                return $this->notFoundResponse('Organization not found');
            }

            if (!$user) {
                return $this->notFoundResponse('User not found');
            }

            // Check if user is already in this organization
            if ($user->organization_id == $organizationId) {
                return $this->errorResponse('User is already in this organization');
            }

            // Simple user assignment
            $user->organization_id = $organizationId;
            $user->save();

            return $this->successResponse('User added to organization successfully');

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to add user to organization', $e->getMessage());
        }
    }

    /**
     * Remove user from organization.
     */
    public function removeUser(string $organizationId, string $userId): JsonResponse
    {
        try {
            $organization = Organization::find($organizationId);
            $user = User::find($userId);

            if (!$organization) {
                return $this->notFoundResponse('Organization not found');
            }

            if (!$user) {
                return $this->notFoundResponse('User not found');
            }

            // Check if user is in this organization
            if ($user->organization_id != $organizationId) {
                return $this->errorResponse('User is not in this organization');
            }

            // Simple user removal
            $user->organization_id = null;
            $user->save();

            return $this->successResponse('User removed from organization successfully');

        } catch (\Exception $e) {
            return $this->serverErrorResponse('Failed to remove user from organization', $e->getMessage());
        }
    }
}
