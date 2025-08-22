<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\Admin\OrganizationResource;
use App\Http\Resources\Admin\OrganizationCollection;
use App\Services\Admin\OrganizationManagementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class OrganizationManagementController extends BaseApiController
{
    protected OrganizationManagementService $organizationService;

    public function __construct()
    {
        $this->organizationService = new OrganizationManagementService();
    }

    /**
     * Get paginated list of organizations with filters and search.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only([
                'search', 'status', 'type', 'country', 'created_at'
            ]);

            $organizations = $this->organizationService->getPaginatedOrganizations(
                page: $request->get('page', 1),
                perPage: $request->get('per_page', 15),
                filters: $filters,
                sortBy: $request->get('sort_by', 'created_at'),
                sortOrder: $request->get('sort_order', 'desc')
            );

            return $this->successResponse(
                'Organizations retrieved successfully',
                new OrganizationCollection($organizations)
            );
        } catch (\Exception $e) {
            Log::error('Organization management index error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return $this->errorResponse(
                'Failed to retrieve organizations',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }

    /**
     * Get specific organization details.
     */
    public function show(string $organizationId): JsonResponse
    {
        try {
            $organization = $this->organizationService->getOrganizationWithDetails($organizationId);

            if (!$organization) {
                return $this->errorResponse(
                    'Organization not found',
                    ['error' => 'The specified organization does not exist'],
                    404
                );
            }

            return $this->successResponse(
                'Organization details retrieved successfully',
                new OrganizationResource($organization)
            );
        } catch (\Exception $e) {
            Log::error('Organization management show error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'organization_id' => $organizationId
            ]);

            return $this->errorResponse(
                'Failed to retrieve organization details',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }

    /**
     * Create a new organization.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'slug' => 'required|string|max:255|unique:organizations,slug',
                'description' => 'nullable|string',
                'type' => 'required|string|in:company,non_profit,government,educational,individual',
                'industry' => 'nullable|string|max:100',
                'website' => 'nullable|url|max:500',
                'email' => 'nullable|email|max:255',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string',
                'city' => 'nullable|string|max:100',
                'state' => 'nullable|string|max:100',
                'country' => 'nullable|string|max:100',
                'postal_code' => 'nullable|string|max:20',
                'timezone' => 'nullable|string|timezone',
                'currency' => 'nullable|string|max:3',
                'language' => 'nullable|string|max:10',
                'logo_url' => 'nullable|url|max:500',
                'banner_url' => 'nullable|url|max:500',
                'settings' => 'nullable|array',
                'metadata' => 'nullable|array',
            ]);

            $organizationData = $request->all();
            $organization = $this->organizationService->createOrganization($organizationData, Auth::user());

            Log::info('Organization created by admin', [
                'admin_id' => Auth::id(),
                'new_organization_id' => $organization->id,
                'name' => $organization->name
            ]);

            return $this->successResponse(
                'Organization created successfully',
                new OrganizationResource($organization),
                201
            );
        } catch (\Exception $e) {
            Log::error('Organization management store error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'data' => $request->all()
            ]);

            return $this->errorResponse(
                'Failed to create organization',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }

    /**
     * Update organization information.
     */
    public function update(Request $request, string $organizationId): JsonResponse
    {
        try {
            $request->validate([
                'name' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'type' => 'sometimes|string|in:company,non_profit,government,educational,individual',
                'industry' => 'nullable|string|max:100',
                'website' => 'nullable|url|max:500',
                'email' => 'nullable|email|max:255',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string',
                'city' => 'nullable|string|max:100',
                'state' => 'nullable|string|max:100',
                'country' => 'nullable|string|max:100',
                'postal_code' => 'nullable|string|max:20',
                'timezone' => 'nullable|string|timezone',
                'currency' => 'nullable|string|max:3',
                'language' => 'nullable|string|max:10',
                'logo_url' => 'nullable|url|max:500',
                'banner_url' => 'nullable|url|max:500',
                'settings' => 'nullable|array',
                'metadata' => 'nullable|array',
            ]);

            $organizationData = $request->all();
            $organization = $this->organizationService->updateOrganization($organizationId, $organizationData, Auth::user());

            if (!$organization) {
                return $this->errorResponse(
                    'Organization not found',
                    ['error' => 'The specified organization does not exist'],
                    404
                );
            }

            Log::info('Organization updated by admin', [
                'admin_id' => Auth::id(),
                'organization_id' => $organizationId,
                'updated_fields' => array_keys($organizationData)
            ]);

            return $this->successResponse(
                'Organization updated successfully',
                new OrganizationResource($organization)
            );
        } catch (\Exception $e) {
            Log::error('Organization management update error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'organization_id' => $organizationId
            ]);

            return $this->errorResponse(
                'Failed to update organization',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }

    /**
     * Delete organization.
     */
    public function destroy(string $organizationId): JsonResponse
    {
        try {
            $result = $this->organizationService->deleteOrganization($organizationId, Auth::user());

            if (!$result) {
                return $this->errorResponse(
                    'Organization not found',
                    ['error' => 'The specified organization does not exist'],
                    404
                );
            }

            Log::info('Organization deleted by admin', [
                'admin_id' => Auth::id(),
                'organization_id' => $organizationId
            ]);

            return $this->successResponse(
                'Organization deleted successfully',
                null
            );
        } catch (\Exception $e) {
            Log::error('Organization management destroy error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'organization_id' => $organizationId
            ]);

            return $this->errorResponse(
                'Failed to delete organization',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }

    /**
     * Get organization statistics.
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = $this->organizationService->getOrganizationStatistics();

            return $this->successResponse(
                'Organization statistics retrieved successfully',
                $stats
            );
        } catch (\Exception $e) {
            Log::error('Organization management statistics error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return $this->errorResponse(
                'Failed to retrieve organization statistics',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }

    /**
     * Get organization users.
     */
    public function users(string $organizationId): JsonResponse
    {
        try {
            $users = $this->organizationService->getOrganizationUsers($organizationId);

            return $this->successResponse(
                'Organization users retrieved successfully',
                $users
            );
        } catch (\Exception $e) {
            Log::error('Organization management users error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'organization_id' => $organizationId
            ]);

            return $this->errorResponse(
                'Failed to retrieve organization users',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }

    /**
     * Add user to organization.
     */
    public function addUser(Request $request, string $organizationId): JsonResponse
    {
        try {
            $request->validate([
                'user_id' => 'required|uuid|exists:users,id',
                'role' => 'nullable|string|in:admin,member,viewer',
            ]);

            $result = $this->organizationService->addUserToOrganization(
                $organizationId,
                $request->input('user_id'),
                $request->input('role', 'member'),
                Auth::user()
            );

            if (!$result) {
                return $this->errorResponse(
                    'Organization not found',
                    ['error' => 'The specified organization does not exist'],
                    404
                );
            }

            Log::info('User added to organization by admin', [
                'admin_id' => Auth::id(),
                'organization_id' => $organizationId,
                'user_id' => $request->input('user_id')
            ]);

            return $this->successResponse(
                'User added to organization successfully',
                null
            );
        } catch (\Exception $e) {
            Log::error('Organization management add user error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'organization_id' => $organizationId
            ]);

            return $this->errorResponse(
                'Failed to add user to organization',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }

    /**
     * Remove user from organization.
     */
    public function removeUser(string $organizationId, string $userId): JsonResponse
    {
        try {
            $result = $this->organizationService->removeUserFromOrganization(
                $organizationId,
                $userId,
                Auth::user()
            );

            if (!$result) {
                return $this->errorResponse(
                    'Organization or user not found',
                    ['error' => 'The specified organization or user does not exist'],
                    404
                );
            }

            Log::info('User removed from organization by admin', [
                'admin_id' => Auth::id(),
                'organization_id' => $organizationId,
                'user_id' => $userId
            ]);

            return $this->successResponse(
                'User removed from organization successfully',
                null
            );
        } catch (\Exception $e) {
            Log::error('Organization management remove user error', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'organization_id' => $organizationId
            ]);

            return $this->errorResponse(
                'Failed to remove user from organization',
                ['error' => 'An unexpected error occurred'],
                500
            );
        }
    }
}
