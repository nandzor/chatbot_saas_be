<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\AgentDashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AgentDashboardController extends BaseApiController
{
    protected AgentDashboardService $agentDashboardService;

    public function __construct(AgentDashboardService $agentDashboardService)
    {
        $this->agentDashboardService = $agentDashboardService;
    }

    /**
     * Get agent dashboard statistics
     */
    public function statistics(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'date_from' => 'sometimes|date',
                'date_to' => 'sometimes|date|after_or_equal:date_from'
            ]);

            $stats = $this->agentDashboardService->getDashboardStats($request);

            $this->logApiAction('agent_dashboard_stats_retrieved', [
                'agent_id' => auth()->user()->agent?->id,
                'organization_id' => auth()->user()->organization_id,
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to')
            ]);

            return $this->successResponseWithLog(
                'agent_dashboard_stats_retrieved',
                'Agent dashboard statistics retrieved successfully',
                $stats
            );
        } catch (ValidationException $e) {
            return $this->errorResponseWithLog(
                'agent_dashboard_stats_validation_error',
                'Validation failed',
                $e->getMessage(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'agent_dashboard_stats_error',
                'Failed to retrieve agent dashboard statistics',
                $e->getMessage(),
                500,
                'AGENT_DASHBOARD_STATS_ERROR'
            );
        }
    }

    /**
     * Get agent's recent sessions
     */
    public function recentSessions(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'status' => 'sometimes|string|in:active,ended',
                'resolved' => 'sometimes|boolean',
                'date_from' => 'sometimes|date',
                'date_to' => 'sometimes|date|after_or_equal:date_from',
                'per_page' => 'sometimes|integer|min:1|max:100'
            ]);

            $sessions = $this->agentDashboardService->getRecentSessions($request);

            $this->logApiAction('agent_recent_sessions_retrieved', [
                'agent_id' => auth()->user()->agent?->id,
                'organization_id' => auth()->user()->organization_id,
                'filters' => $request->only(['status', 'resolved', 'date_from', 'date_to'])
            ]);

            return $this->successResponseWithLog(
                'agent_recent_sessions_retrieved',
                'Recent sessions retrieved successfully',
                $sessions->through(function($session) {
                    return [
                        'id' => $session->id,
                        'customer' => $session->customer,
                        'status' => $session->is_active ? 'active' : 'ended',
                        'is_resolved' => $session->is_resolved,
                        'priority' => $session->priority,
                        'category' => $session->category,
                        'started_at' => $session->started_at,
                        'last_activity_at' => $session->last_activity_at,
                        'total_messages' => $session->total_messages,
                        'satisfaction_rating' => $session->satisfaction_rating,
                        'resolution_time' => $session->resolution_time
                    ];
                }),
                200,
                ['pagination' => [
                    'current_page' => $sessions->currentPage(),
                    'total_pages' => $sessions->lastPage(),
                    'total_items' => $sessions->total(),
                    'items_per_page' => $sessions->perPage()
                ]]
            );
        } catch (ValidationException $e) {
            return $this->errorResponseWithLog(
                'agent_recent_sessions_validation_error',
                'Validation failed',
                $e->getMessage(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'agent_recent_sessions_error',
                'Failed to retrieve recent sessions',
                $e->getMessage(),
                500,
                'AGENT_RECENT_SESSIONS_ERROR'
            );
        }
    }

    /**
     * Get agent's performance metrics
     */
    public function performanceMetrics(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'days' => 'sometimes|integer|min:1|max:365'
            ]);

            $metrics = $this->agentDashboardService->getPerformanceMetrics($request);

            $this->logApiAction('agent_performance_metrics_retrieved', [
                'agent_id' => auth()->user()->agent?->id,
                'organization_id' => auth()->user()->organization_id,
                'days' => $request->get('days', 30)
            ]);

            return $this->successResponseWithLog(
                'agent_performance_metrics_retrieved',
                'Performance metrics retrieved successfully',
                $metrics
            );
        } catch (ValidationException $e) {
            return $this->errorResponseWithLog(
                'agent_performance_metrics_validation_error',
                'Validation failed',
                $e->getMessage(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'agent_performance_metrics_error',
                'Failed to retrieve performance metrics',
                $e->getMessage(),
                500,
                'AGENT_PERFORMANCE_METRICS_ERROR'
            );
        }
    }

    /**
     * Get conversation analytics for a specific session
     */
    public function conversationAnalytics(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'session_id' => 'required|string|exists:chat_sessions,id'
            ]);

            $analytics = $this->agentDashboardService->getConversationAnalytics($request);

            $this->logApiAction('agent_conversation_analytics_retrieved', [
                'agent_id' => auth()->user()->agent?->id,
                'organization_id' => auth()->user()->organization_id,
                'session_id' => $request->session_id
            ]);

            return $this->successResponseWithLog(
                'agent_conversation_analytics_retrieved',
                'Conversation analytics retrieved successfully',
                $analytics
            );
        } catch (ValidationException $e) {
            return $this->errorResponseWithLog(
                'agent_conversation_analytics_validation_error',
                'Validation failed',
                $e->getMessage(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'agent_conversation_analytics_error',
                'Failed to retrieve conversation analytics',
                $e->getMessage(),
                500,
                'AGENT_CONVERSATION_ANALYTICS_ERROR'
            );
        }
    }

    /**
     * Get agent's current workload
     */
    public function workload(Request $request): JsonResponse
    {
        try {
            $workload = $this->agentDashboardService->getWorkload($request);

            $this->logApiAction('agent_workload_retrieved', [
                'agent_id' => auth()->user()->agent?->id,
                'organization_id' => auth()->user()->organization_id
            ]);

            return $this->successResponseWithLog(
                'agent_workload_retrieved',
                'Agent workload retrieved successfully',
                $workload
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'agent_workload_error',
                'Failed to retrieve agent workload',
                $e->getMessage(),
                500,
                'AGENT_WORKLOAD_ERROR'
            );
        }
    }

    /**
     * Get agent's real-time activity
     */
    public function realtimeActivity(Request $request): JsonResponse
    {
        try {
            $agentId = auth()->user()->agent?->id;
            $organizationId = auth()->user()->organization_id;

            if (!$agentId) {
                throw new \Exception('User is not registered as an agent');
            }

            // Get real-time data
            $activeSessions = \App\Models\ChatSession::where('organization_id', $organizationId)
                ->where('agent_id', $agentId)
                ->where('is_active', true)
                ->with(['customer:id,name,email,first_name,last_name'])
                ->get();

            $recentMessages = \App\Models\Message::whereHas('chatSession', function($query) use ($organizationId, $agentId) {
                $query->where('organization_id', $organizationId)
                      ->where('agent_id', $agentId);
            })
            ->where('created_at', '>=', now()->subMinutes(10))
            ->with(['chatSession:id,session_token'])
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

            $activity = [
                'timestamp' => now()->toISOString(),
                'active_sessions_count' => $activeSessions->count(),
                'active_sessions' => $activeSessions->map(function($session) {
                    return [
                        'id' => $session->id,
                        'customer' => $session->customer,
                        'last_activity' => $session->last_activity_at,
                        'unread_count' => $session->unread_count ?? 0,
                        'priority' => $session->priority
                    ];
                }),
                'recent_messages' => $recentMessages->map(function($message) {
                    return [
                        'id' => $message->id,
                        'session_id' => $message->chatSession->id,
                        'sender_type' => $message->sender_type,
                        'sender_name' => $message->sender_name,
                        'content' => $message->message_text,
                        'created_at' => $message->created_at
                    ];
                })
            ];

            $this->logApiAction('agent_realtime_activity_retrieved', [
                'agent_id' => $agentId,
                'organization_id' => $organizationId
            ]);

            return $this->successResponseWithLog(
                'agent_realtime_activity_retrieved',
                'Real-time activity retrieved successfully',
                $activity
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'agent_realtime_activity_error',
                'Failed to retrieve real-time activity',
                $e->getMessage(),
                500,
                'AGENT_REALTIME_ACTIVITY_ERROR'
            );
        }
    }

    /**
     * Get agent's conversation insights
     */
    public function conversationInsights(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'date_from' => 'sometimes|date',
                'date_to' => 'sometimes|date|after_or_equal:date_from',
                'limit' => 'sometimes|integer|min:1|max:100'
            ]);

            $agentId = auth()->user()->agent?->id;
            $organizationId = auth()->user()->organization_id;

            if (!$agentId) {
                throw new \Exception('User is not registered as an agent');
            }

            $dateFrom = $request->get('date_from', now()->subDays(30)->toDateString());
            $dateTo = $request->get('date_to', now()->toDateString());
            $limit = $request->get('limit', 10);

            // Get conversation insights
            $insights = \App\Models\ChatSession::where('organization_id', $organizationId)
                ->where('agent_id', $agentId)
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->selectRaw('
                    category,
                    priority,
                    COUNT(*) as session_count,
                    AVG(satisfaction_rating) as avg_rating,
                    AVG(resolution_time) as avg_resolution_time,
                    AVG(total_messages) as avg_message_count,
                    SUM(CASE WHEN is_resolved = true THEN 1 ELSE 0 END) as resolved_count
                ')
                ->groupBy('category', 'priority')
                ->orderBy('session_count', 'desc')
                ->limit($limit)
                ->get();

            // Get common issues/topics
            $commonIssues = \App\Models\ChatSession::where('organization_id', $organizationId)
                ->where('agent_id', $agentId)
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->whereNotNull('intent')
                ->selectRaw('
                    intent,
                    COUNT(*) as frequency,
                    AVG(satisfaction_rating) as avg_rating
                ')
                ->groupBy('intent')
                ->orderBy('frequency', 'desc')
                ->limit($limit)
                ->get();

            $this->logApiAction('agent_conversation_insights_retrieved', [
                'agent_id' => $agentId,
                'organization_id' => $organizationId,
                'date_from' => $dateFrom,
                'date_to' => $dateTo
            ]);

            return $this->successResponseWithLog(
                'agent_conversation_insights_retrieved',
                'Conversation insights retrieved successfully',
                [
                    'period' => [
                        'from' => $dateFrom,
                        'to' => $dateTo
                    ],
                    'category_insights' => $insights,
                    'common_issues' => $commonIssues
                ]
            );
        } catch (ValidationException $e) {
            return $this->errorResponseWithLog(
                'agent_conversation_insights_validation_error',
                'Validation failed',
                $e->getMessage(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'agent_conversation_insights_error',
                'Failed to retrieve conversation insights',
                $e->getMessage(),
                500,
                'AGENT_CONVERSATION_INSIGHTS_ERROR'
            );
        }
    }
}
