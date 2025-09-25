<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use App\Models\User;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AgentManagementController extends Controller
{
    /**
     * Display a listing of agents with pagination and filters
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $organizationId = auth()->user()->organization_id;

            $query = Agent::with(['user', 'organization'])
                ->where('organization_id', $organizationId);

            // Apply filters
            if ($request->has('status') && $request->status !== '') {
                $query->where('status', $request->status);
            }

            if ($request->has('availability') && $request->availability !== '') {
                $query->where('availability_status', $request->availability);
            }

            if ($request->has('search') && $request->search !== '') {
                $search = $request->search;
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $agents = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'message' => 'Agents retrieved successfully',
                'data' => $agents->items(),
                'meta' => [
                    'current_page' => $agents->currentPage(),
                    'last_page' => $agents->lastPage(),
                    'per_page' => $agents->perPage(),
                    'total' => $agents->total(),
                    'from' => $agents->firstItem(),
                    'to' => $agents->lastItem(),
                ],
                'links' => [
                    'first' => $agents->url(1),
                    'last' => $agents->url($agents->lastPage()),
                    'prev' => $agents->previousPageUrl(),
                    'next' => $agents->nextPageUrl(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve agents',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created agent
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:8',
                'display_name' => 'required|string|max:255',
                'phone' => 'nullable|string|max:20',
                'department' => 'nullable|string|max:100',
                'specialization' => 'nullable|string|max:255',
                'max_concurrent_chats' => 'integer|min:1|max:50',
                'skills' => 'nullable|array',
                'skills.*' => 'string|max:100',
                'status' => 'in:active,inactive,suspended',
                'availability_status' => 'in:available,busy,away,offline',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $organizationId = auth()->user()->organization_id;

            DB::beginTransaction();

            // Create user account
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'organization_id' => $organizationId,
                'role' => 'agent',
                'email_verified_at' => now(),
            ]);

            // Create agent profile
            $agent = Agent::create([
                'user_id' => $user->id,
                'organization_id' => $organizationId,
                'display_name' => $request->display_name,
                'phone' => $request->phone,
                'department' => $request->department,
                'specialization' => $request->specialization,
                'max_concurrent_chats' => $request->max_concurrent_chats ?? 5,
                'skills' => $request->skills ?? [],
                'status' => $request->status ?? 'active',
                'availability_status' => $request->availability_status ?? 'offline',
                'performance_metrics' => [
                    'total_conversations' => 0,
                    'avg_response_time' => 0,
                    'satisfaction_rating' => 0,
                    'resolution_rate' => 0,
                ],
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Agent created successfully',
                'data' => $agent->load('user')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create agent',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified agent
     */
    public function show(Agent $agent): JsonResponse
    {
        try {
            $organizationId = auth()->user()->organization_id;

            if ($agent->organization_id !== $organizationId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Agent not found'
                ], 404);
            }

            $agent->load(['user', 'organization']);

            return response()->json([
                'success' => true,
                'message' => 'Agent retrieved successfully',
                'data' => $agent
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve agent',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified agent
     */
    public function update(Request $request, Agent $agent): JsonResponse
    {
        try {
            $organizationId = auth()->user()->organization_id;

            if ($agent->organization_id !== $organizationId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Agent not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'email' => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($agent->user_id)],
                'password' => 'sometimes|string|min:8',
                'display_name' => 'sometimes|string|max:255',
                'phone' => 'nullable|string|max:20',
                'department' => 'nullable|string|max:100',
                'specialization' => 'nullable|string|max:255',
                'max_concurrent_chats' => 'sometimes|integer|min:1|max:50',
                'skills' => 'nullable|array',
                'skills.*' => 'string|max:100',
                'status' => 'sometimes|in:active,inactive,suspended',
                'availability_status' => 'sometimes|in:available,busy,away,offline',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Update user account
            $userData = [];
            if ($request->has('name')) $userData['name'] = $request->name;
            if ($request->has('email')) $userData['email'] = $request->email;
            if ($request->has('password')) $userData['password'] = Hash::make($request->password);

            if (!empty($userData)) {
                $agent->user->update($userData);
            }

            // Update agent profile
            $agentData = $request->only([
                'display_name', 'phone', 'department', 'specialization',
                'max_concurrent_chats', 'skills', 'status', 'availability_status'
            ]);

            $agent->update($agentData);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Agent updated successfully',
                'data' => $agent->load('user')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update agent',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified agent
     */
    public function destroy(Agent $agent): JsonResponse
    {
        try {
            $organizationId = auth()->user()->organization_id;

            if ($agent->organization_id !== $organizationId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Agent not found'
                ], 404);
            }

            DB::beginTransaction();

            // Delete agent and associated user
            $agent->user->delete();
            $agent->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Agent deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete agent',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update agent status
     */
    public function updateStatus(Request $request, Agent $agent): JsonResponse
    {
        try {
            $organizationId = auth()->user()->organization_id;

            if ($agent->organization_id !== $organizationId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Agent not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'status' => 'required|in:active,inactive,suspended'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $agent->update(['status' => $request->status]);

            return response()->json([
                'success' => true,
                'message' => 'Agent status updated successfully',
                'data' => $agent
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update agent status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update agent availability
     */
    public function updateAvailability(Request $request, Agent $agent): JsonResponse
    {
        try {
            $organizationId = auth()->user()->organization_id;

            if ($agent->organization_id !== $organizationId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Agent not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'availability_status' => 'required|in:available,busy,away,offline'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $agent->update(['availability_status' => $request->availability_status]);

            return response()->json([
                'success' => true,
                'message' => 'Agent availability updated successfully',
                'data' => $agent
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update agent availability',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk update agent status
     */
    public function bulkUpdateStatus(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'agent_ids' => 'required|array',
                'agent_ids.*' => 'exists:agents,id',
                'status' => 'required|in:active,inactive,suspended'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $organizationId = auth()->user()->organization_id;

            $updated = Agent::whereIn('id', $request->agent_ids)
                ->where('organization_id', $organizationId)
                ->update(['status' => $request->status]);

            return response()->json([
                'success' => true,
                'message' => "Successfully updated {$updated} agents",
                'data' => ['updated_count' => $updated]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to bulk update agent status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk delete agents
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'agent_ids' => 'required|array',
                'agent_ids.*' => 'exists:agents,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $organizationId = auth()->user()->organization_id;

            DB::beginTransaction();

            $agents = Agent::whereIn('id', $request->agent_ids)
                ->where('organization_id', $organizationId)
                ->with('user')
                ->get();

            $deletedCount = 0;
            foreach ($agents as $agent) {
                $agent->user->delete();
                $agent->delete();
                $deletedCount++;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Successfully deleted {$deletedCount} agents",
                'data' => ['deleted_count' => $deletedCount]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to bulk delete agents',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get agent statistics
     */
    public function getStatistics(): JsonResponse
    {
        try {
            $organizationId = auth()->user()->organization_id;

            $stats = Agent::where('organization_id', $organizationId)
                ->selectRaw('
                    COUNT(*) as total_agents,
                    SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as active_agents,
                    SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as inactive_agents,
                    SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as suspended_agents,
                    SUM(CASE WHEN availability_status = ? THEN 1 ELSE 0 END) as available_agents,
                    SUM(CASE WHEN availability_status = ? THEN 1 ELSE 0 END) as busy_agents,
                    SUM(CASE WHEN availability_status = ? THEN 1 ELSE 0 END) as away_agents,
                    SUM(CASE WHEN availability_status = ? THEN 1 ELSE 0 END) as offline_agents,
                    AVG(CAST(performance_metrics->>? AS DECIMAL)) as avg_satisfaction,
                    AVG(CAST(performance_metrics->>? AS DECIMAL)) as avg_response_time
                ', [
                    'active', 'inactive', 'suspended',
                    'available', 'busy', 'away', 'offline',
                    'satisfaction_rating', 'avg_response_time'
                ])
                ->first();

            return response()->json([
                'success' => true,
                'message' => 'Agent statistics retrieved successfully',
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve agent statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get agent performance
     */
    public function getPerformance(Agent $agent): JsonResponse
    {
        try {
            $organizationId = auth()->user()->organization_id;

            if ($agent->organization_id !== $organizationId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Agent not found'
                ], 404);
            }

            // Get performance metrics from chat sessions
            $performance = DB::table('chat_sessions')
                ->where('agent_id', $agent->id)
                ->selectRaw('
                    COUNT(*) as total_conversations,
                    AVG(response_time_avg) as avg_response_time,
                    AVG(satisfaction_rating) as avg_satisfaction,
                    SUM(CASE WHEN is_resolved = true THEN 1 ELSE 0 END) as resolved_conversations,
                    SUM(CASE WHEN is_resolved = true THEN 1 ELSE 0 END) / COUNT(*) * 100 as resolution_rate
                ')
                ->first();

            return response()->json([
                'success' => true,
                'message' => 'Agent performance retrieved successfully',
                'data' => $performance
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve agent performance',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get agent skills
     */
    public function getSkills(Agent $agent): JsonResponse
    {
        try {
            $organizationId = auth()->user()->organization_id;

            if ($agent->organization_id !== $organizationId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Agent not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Agent skills retrieved successfully',
                'data' => $agent->skills
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve agent skills',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update agent skills
     */
    public function updateSkills(Request $request, Agent $agent): JsonResponse
    {
        try {
            $organizationId = auth()->user()->organization_id;

            if ($agent->organization_id !== $organizationId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Agent not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'skills' => 'required|array',
                'skills.*' => 'string|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $agent->update(['skills' => $request->skills]);

            return response()->json([
                'success' => true,
                'message' => 'Agent skills updated successfully',
                'data' => $agent->skills
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update agent skills',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get agent workload
     */
    public function getWorkload(Agent $agent): JsonResponse
    {
        try {
            $organizationId = auth()->user()->organization_id;

            if ($agent->organization_id !== $organizationId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Agent not found'
                ], 404);
            }

            $workload = DB::table('chat_sessions')
                ->where('agent_id', $agent->id)
                ->where('is_active', true)
                ->count();

            $data = [
                'current_load' => $workload,
                'max_capacity' => $agent->max_concurrent_chats,
                'utilization_percentage' => $agent->max_concurrent_chats > 0
                    ? round(($workload / $agent->max_concurrent_chats) * 100, 2)
                    : 0
            ];

            return response()->json([
                'success' => true,
                'message' => 'Agent workload retrieved successfully',
                'data' => $data
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve agent workload',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search agents
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $organizationId = auth()->user()->organization_id;
            $search = $request->get('q', '');

            $agents = Agent::with(['user'])
                ->where('organization_id', $organizationId)
                ->whereHas('user', function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhere('display_name', 'like', "%{$search}%")
                ->limit(10)
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Agent search completed',
                'data' => $agents
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search agents',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available filters
     */
    public function getFilters(): JsonResponse
    {
        try {
            $organizationId = auth()->user()->organization_id;

            // Get departments (string column)
            $departments = Agent::where('organization_id', $organizationId)
                ->whereNotNull('department')
                ->distinct()
                ->pluck('department')
                ->filter()
                ->values();

            // Get specializations (JSON column) - extract unique values
            $specializations = Agent::where('organization_id', $organizationId)
                ->whereNotNull('specialization')
                ->get()
                ->pluck('specialization')
                ->filter()
                ->flatten()
                ->unique()
                ->values();

            $filters = [
                'statuses' => ['active', 'inactive', 'suspended'],
                'availability_statuses' => ['available', 'busy', 'away', 'offline'],
                'departments' => $departments,
                'specializations' => $specializations,
            ];

            return response()->json([
                'success' => true,
                'message' => 'Filters retrieved successfully',
                'data' => $filters
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve filters',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
