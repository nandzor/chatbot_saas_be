<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Agent;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AgentController extends BaseApiController
{
    /**
     * Get all agents for the organization
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $organizationId = Auth::user()->organization_id;

            $query = Agent::query()
                ->where('organization_id', $organizationId)
                ->where('is_active', true)
                ->with(['user:id,name,email,avatar']);

            // Apply search filter
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // Apply status filter
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Apply availability filter
            if ($request->has('available') && $request->available) {
                $query->where('is_available', true);
            }

            // Apply department filter
            if ($request->has('department')) {
                $query->where('department', $request->department);
            }

            // Apply skills filter
            if ($request->has('skills')) {
                $skills = is_array($request->skills) ? $request->skills : explode(',', $request->skills);
                $query->where(function ($q) use ($skills) {
                    foreach ($skills as $skill) {
                        $q->orWhereJsonContains('skills', $skill);
                    }
                });
            }

            // Get pagination parameters
            $perPage = $request->get('per_page', 20);
            $agents = $query->paginate($perPage);

            $this->logApiAction('agents_listed', [
                'organization_id' => $organizationId,
                'filters' => $request->only(['search', 'status', 'available', 'department', 'skills']),
                'count' => $agents->count()
            ]);

            return $this->successResponseWithLog(
                'agents_listed',
                'Agents retrieved successfully',
                $agents->through(function ($agent) {
                    return [
                        'id' => $agent->id,
                        'name' => $agent->user->name,
                        'email' => $agent->user->email,
                        'avatar' => $agent->user->avatar,
                        'status' => $agent->status,
                        'is_available' => $agent->is_available,
                        'department' => $agent->department,
                        'skills' => $agent->skills,
                        'max_concurrent_sessions' => $agent->max_concurrent_sessions,
                        'current_sessions_count' => $agent->current_sessions_count,
                        'total_sessions_handled' => $agent->total_sessions_handled,
                        'average_rating' => $agent->average_rating,
                        'response_time_avg' => $agent->response_time_avg,
                        'created_at' => $agent->created_at,
                        'updated_at' => $agent->updated_at
                    ];
                }),
                200,
                ['pagination' => [
                    'current_page' => $agents->currentPage(),
                    'total_pages' => $agents->lastPage(),
                    'total_items' => $agents->total(),
                    'items_per_page' => $agents->perPage()
                ]]
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
            $organizationId = Auth::user()->organization_id;

            $agent = Agent::where('id', $id)
                ->where('organization_id', $organizationId)
                ->with(['user:id,name,email,avatar'])
                ->first();

            if (!$agent) {
                return $this->errorResponseWithLog(
                    'agent_not_found',
                    'Agent not found',
                    "Agent with ID {$id} not found",
                    404,
                    'AGENT_NOT_FOUND'
                );
            }

            $this->logApiAction('agent_viewed', [
                'agent_id' => $agent->id,
                'organization_id' => $organizationId
            ]);

            return $this->successResponseWithLog(
                'agent_viewed',
                'Agent retrieved successfully',
                [
                    'id' => $agent->id,
                    'name' => $agent->user->name,
                    'email' => $agent->user->email,
                    'avatar' => $agent->user->avatar,
                    'status' => $agent->status,
                    'is_available' => $agent->is_available,
                    'department' => $agent->department,
                    'skills' => $agent->skills,
                    'max_concurrent_sessions' => $agent->max_concurrent_sessions,
                    'current_sessions_count' => $agent->current_sessions_count,
                    'total_sessions_handled' => $agent->total_sessions_handled,
                    'average_rating' => $agent->average_rating,
                    'response_time_avg' => $agent->response_time_avg,
                    'created_at' => $agent->created_at,
                    'updated_at' => $agent->updated_at
                ]
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
            $organizationId = Auth::user()->organization_id;

            $agent = Agent::where('id', $id)
                ->where('organization_id', $organizationId)
                ->first();

            if (!$agent) {
                return $this->errorResponseWithLog(
                    'agent_not_found',
                    'Agent not found',
                    "Agent with ID {$id} not found",
                    404,
                    'AGENT_NOT_FOUND'
                );
            }

            $dateFrom = $request->get('date_from', now()->subDays(30)->toDateString());
            $dateTo = $request->get('date_to', now()->toDateString());

            // Get session statistics
            $totalSessions = $agent->chatSessions()
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->count();

            $activeSessions = $agent->chatSessions()
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->where('is_active', true)
                ->count();

            $resolvedSessions = $agent->chatSessions()
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->where('is_resolved', true)
                ->count();

            $avgResponseTime = $agent->chatSessions()
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->whereNotNull('first_response_at')
                ->selectRaw('AVG(EXTRACT(EPOCH FROM (first_response_at - started_at))) as avg_response_time')
                ->value('avg_response_time') ?? 0;

            $avgRating = $agent->chatSessions()
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->whereNotNull('satisfaction_rating')
                ->avg('satisfaction_rating') ?? 0;

            $this->logApiAction('agent_statistics_retrieved', [
                'agent_id' => $agent->id,
                'organization_id' => $organizationId,
                'date_from' => $dateFrom,
                'date_to' => $dateTo
            ]);

            return $this->successResponseWithLog(
                'agent_statistics_retrieved',
                'Agent statistics retrieved successfully',
                [
                    'agent_id' => $agent->id,
                    'period' => [
                        'from' => $dateFrom,
                        'to' => $dateTo
                    ],
                    'sessions' => [
                        'total' => $totalSessions,
                        'active' => $activeSessions,
                        'resolved' => $resolvedSessions,
                        'resolution_rate' => $totalSessions > 0 ? round(($resolvedSessions / $totalSessions) * 100, 2) : 0
                    ],
                    'performance' => [
                        'avg_response_time' => round($avgResponseTime, 2),
                        'avg_rating' => round($avgRating, 2),
                        'current_sessions' => $agent->current_sessions_count,
                        'max_concurrent' => $agent->max_concurrent_sessions,
                        'utilization_rate' => $agent->max_concurrent_sessions > 0
                            ? round(($agent->current_sessions_count / $agent->max_concurrent_sessions) * 100, 2)
                            : 0
                    ]
                ]
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

            $organizationId = Auth::user()->organization_id;

            $agent = Agent::where('id', $id)
                ->where('organization_id', $organizationId)
                ->first();

            if (!$agent) {
                return $this->errorResponseWithLog(
                    'agent_not_found',
                    'Agent not found',
                    "Agent with ID {$id} not found",
                    404,
                    'AGENT_NOT_FOUND'
                );
            }

            $agent->update($request->only(['is_available', 'status']));

            $this->logApiAction('agent_availability_updated', [
                'agent_id' => $agent->id,
                'organization_id' => $organizationId,
                'is_available' => $agent->is_available,
                'status' => $agent->status
            ]);

            return $this->successResponseWithLog(
                'agent_availability_updated',
                'Agent availability updated successfully',
                [
                    'id' => $agent->id,
                    'is_available' => $agent->is_available,
                    'status' => $agent->status,
                    'updated_at' => $agent->updated_at
                ]
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
            $organizationId = Auth::user()->organization_id;

            $query = Agent::query()
                ->where('organization_id', $organizationId)
                ->where('is_active', true)
                ->where('is_available', true)
                ->with(['user:id,name,email,avatar']);

            // Filter by department if specified
            if ($request->has('department')) {
                $query->where('department', $request->department);
            }

            // Filter by skills if specified
            if ($request->has('skills')) {
                $skills = is_array($request->skills) ? $request->skills : explode(',', $request->skills);
                $query->where(function ($q) use ($skills) {
                    foreach ($skills as $skill) {
                        $q->orWhereJsonContains('skills', $skill);
                    }
                });
            }

            // Filter by current load (agents with available capacity)
            if ($request->has('with_capacity') && $request->with_capacity) {
                $query->whereRaw('current_sessions_count < max_concurrent_sessions');
            }

            $agents = $query->get();

            $this->logApiAction('available_agents_retrieved', [
                'organization_id' => $organizationId,
                'filters' => $request->only(['department', 'skills', 'with_capacity']),
                'count' => $agents->count()
            ]);

            return $this->successResponseWithLog(
                'available_agents_retrieved',
                'Available agents retrieved successfully',
                $agents->map(function ($agent) {
                    return [
                        'id' => $agent->id,
                        'name' => $agent->user->name,
                        'email' => $agent->user->email,
                        'avatar' => $agent->user->avatar,
                        'department' => $agent->department,
                        'skills' => $agent->skills,
                        'current_sessions_count' => $agent->current_sessions_count,
                        'max_concurrent_sessions' => $agent->max_concurrent_sessions,
                        'available_capacity' => $agent->max_concurrent_sessions - $agent->current_sessions_count,
                        'average_rating' => $agent->average_rating,
                        'response_time_avg' => $agent->response_time_avg
                    ];
                })
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
}
