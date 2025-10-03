<?php

namespace App\Services;

use App\Models\Agent;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;

class AgentService extends BaseService
{
    /**
     * Get the model for the service.
     */
    protected function getModel(): \Illuminate\Database\Eloquent\Model
    {
        return new Agent();
    }

    /**
     * Get all agents for the organization
     */
    public function getAllAgents(Request $request): array
    {
        try {
            $organizationId = Auth::user()->organization_id;

            $query = Agent::query()
                ->where('organization_id', $organizationId)
                ->where('status', 'active')
                ->with(['user:id,full_name,email,avatar_url,phone,bio,languages']);

            // Apply search filter
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('full_name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // Apply status filter
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Apply availability filter
            if ($request->has('available') && $request->available) {
                $query->where('availability_status', 'online');
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

            return [
                'data' => $agents->through(function ($agent) {
                    return [
                        'id' => $agent->id,
                        'name' => $agent->user->full_name,
                        'email' => $agent->user->email,
                        'avatar' => $agent->user->avatar_url,
                        'status' => $agent->status,
                        'availability_status' => $agent->availability_status,
                        'department' => $agent->department,
                        'skills' => $agent->skills,
                        'max_concurrent_chats' => $agent->max_concurrent_chats,
                        'current_active_chats' => $agent->current_active_chats,
                        'rating' => $agent->rating,
                        'created_at' => $agent->created_at,
                        'updated_at' => $agent->updated_at
                    ];
                }),
                'pagination' => [
                    'current_page' => $agents->currentPage(),
                    'total_pages' => $agents->lastPage(),
                    'total_items' => $agents->total(),
                    'items_per_page' => $agents->perPage()
                ]
            ];
        } catch (\Exception $e) {
            Log::error('Error in getAllAgents: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get a specific agent
     */
    public function getAgent(string $id): array
    {
        try {
            $organizationId = Auth::user()->organization_id;

            $agent = Agent::where('id', $id)
                ->where('organization_id', $organizationId)
                ->with(['user:id,full_name,email,avatar_url,phone,bio,languages'])
                ->first();

            if (!$agent) {
                throw new \Exception("Agent with ID {$id} not found");
            }

            return [
                'id' => $agent->id,
                'name' => $agent->user->full_name,
                'email' => $agent->user->email,
                'avatar' => $agent->user->avatar_url,
                'status' => $agent->status,
                'availability_status' => $agent->availability_status,
                'department' => $agent->department,
                'skills' => $agent->skills,
                'max_concurrent_chats' => $agent->max_concurrent_chats,
                'current_active_chats' => $agent->current_active_chats,
                'rating' => $agent->rating,
                'created_at' => $agent->created_at,
                'updated_at' => $agent->updated_at
            ];
        } catch (\Exception $e) {
            Log::error('Error in getAgent: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get current agent information
     */
    public function getCurrentAgent(): array
    {
        try {
            $user = Auth::user();
            $agent = Agent::where('user_id', $user->id)
                ->where('organization_id', $user->organization_id)
                ->with(['user:id,full_name,email,avatar_url,phone,bio,languages'])
                ->first();

            if (!$agent) {
                throw new \Exception('Agent not found for current user');
            }

            return [
                'agent' => $agent,
                'user' => $agent->user,
                'organization_id' => $agent->organization_id,
                'status' => $agent->status,
                'availability_status' => $agent->availability_status,
                'max_concurrent_chats' => $agent->max_concurrent_chats,
                'working_hours' => $agent->working_hours,
                'breaks' => $agent->breaks,
                'time_off' => $agent->time_off,
                'department' => $agent->department,
                'display_name' => $agent->display_name,
                'created_at' => $agent->created_at,
                'updated_at' => $agent->updated_at
            ];
        } catch (\Exception $e) {
            Log::error('Error in getCurrentAgent: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update current agent availability
     */
    public function updateCurrentAgentAvailability(array $data): array
    {
        try {
            $user = Auth::user();
            $agent = Agent::where('user_id', $user->id)
                ->where('organization_id', $user->organization_id)
                ->first();

            if (!$agent) {
                throw new \Exception('Agent not found for current user');
            }

            $agent->update($data);

            return [
                'agent' => $agent->fresh()
            ];
        } catch (\Exception $e) {
            Log::error('Error in updateCurrentAgentAvailability: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get current agent profile
     */
    public function getCurrentAgentProfile(): array
    {
        try {
            $user = Auth::user();
            $agent = Agent::where('user_id', $user->id)
                ->where('organization_id', $user->organization_id)
                ->with(['user:id,full_name,email,avatar_url,phone,bio,languages'])
                ->first();

            if (!$agent) {
                throw new \Exception('Agent not found for current user');
            }

            return [
                'agent' => $agent,
                'user' => $agent->user,
                'profile' => [
                    'id' => $agent->id,
                    'user_id' => $agent->user_id,
                    'organization_id' => $agent->organization_id,
                    'status' => $agent->status,
                    'availability_status' => $agent->availability_status,
                    'max_concurrent_chats' => $agent->max_concurrent_chats,
                    'working_hours' => $agent->working_hours,
                    'breaks' => $agent->breaks,
                    'time_off' => $agent->time_off,
                    'department' => $agent->department,
                    'display_name' => $agent->display_name,
                    'created_at' => $agent->created_at,
                    'updated_at' => $agent->updated_at
                ]
            ];
        } catch (\Exception $e) {
            Log::error('Error in getCurrentAgentProfile: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update current agent profile
     */
    public function updateCurrentAgentProfile(array $data): array
    {
        try {
            $user = Auth::user();
            $agent = Agent::where('user_id', $user->id)
                ->where('organization_id', $user->organization_id)
                ->first();

            if (!$agent) {
                throw new \Exception('Agent not found for current user');
            }

            $agent->update($data);

            return [
                'agent' => $agent->fresh()
            ];
        } catch (\Exception $e) {
            Log::error('Error in updateCurrentAgentProfile: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get agent statistics
     */
    public function getAgentStatistics(string $id, Request $request): array
    {
        try {
            $organizationId = Auth::user()->organization_id;

            $agent = Agent::where('id', $id)
                ->where('organization_id', $organizationId)
                ->first();

            if (!$agent) {
                throw new \Exception("Agent with ID {$id} not found");
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

            return [
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
                    'current_sessions' => $agent->current_active_chats,
                    'max_concurrent' => $agent->max_concurrent_chats,
                    'utilization_rate' => $agent->max_concurrent_chats > 0
                        ? round(($agent->current_active_chats / $agent->max_concurrent_chats) * 100, 2)
                        : 0
                ]
            ];
        } catch (\Exception $e) {
            Log::error('Error in getAgentStatistics: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get available agents for assignment
     */
    public function getAvailableAgents(Request $request): array
    {
        try {
            $organizationId = Auth::user()->organization_id;

            $query = Agent::query()
                ->where('organization_id', $organizationId)
                ->where('status', 'active')
                ->where('availability_status', 'online')
                ->with(['user:id,full_name,email,avatar_url']);

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
                $query->whereRaw('current_active_chats < max_concurrent_chats');
            }

            $agents = $query->get();

            return $agents->map(function ($agent) {
                return [
                    'id' => $agent->id,
                    'name' => $agent->user->full_name,
                    'email' => $agent->user->email,
                    'avatar' => $agent->user->avatar_url,
                    'department' => $agent->department,
                    'skills' => $agent->skills,
                    'current_active_chats' => $agent->current_active_chats,
                    'max_concurrent_chats' => $agent->max_concurrent_chats,
                    'available_capacity' => $agent->max_concurrent_chats - $agent->current_active_chats,
                    'rating' => $agent->rating
                ];
            })->toArray();
        } catch (\Exception $e) {
            Log::error('Error in getAvailableAgents: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update agent availability
     */
    public function updateAgentAvailability(string $id, array $data): array
    {
        try {
            $organizationId = Auth::user()->organization_id;

            $agent = Agent::where('id', $id)
                ->where('organization_id', $organizationId)
                ->first();

            if (!$agent) {
                throw new \Exception("Agent with ID {$id} not found");
            }

            $agent->update($data);

            return [
                'id' => $agent->id,
                'availability_status' => $agent->availability_status,
                'status' => $agent->status,
                'updated_at' => $agent->updated_at
            ];
        } catch (\Exception $e) {
            Log::error('Error in updateAgentAvailability: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Export current agent data
     */
    public function exportCurrentAgentData(string $format = 'json'): array
    {
        try {
            $user = Auth::user();
            $agent = Agent::where('user_id', $user->id)
                ->where('organization_id', $user->organization_id)
                ->with(['user:id,full_name,email,avatar_url,phone,bio,languages'])
                ->first();

            if (!$agent) {
                throw new \Exception('Agent not found for current user');
            }

            return [
                'agent' => $agent,
                'user' => $agent->user,
                'exported_at' => now(),
                'export_format' => $format
            ];
        } catch (\Exception $e) {
            Log::error('Error in exportCurrentAgentData: ' . $e->getMessage());
            throw $e;
        }
    }
}
