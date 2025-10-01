<?php

namespace App\Services;

use App\Models\ChatSession;
use App\Models\Message;
use App\Models\Agent;
use App\Models\Customer;
use App\Models\BotPersonality;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;

class AgentDashboardService extends BaseService
{
    /**
     * Get the model for the service.
     */
    protected function getModel(): \Illuminate\Database\Eloquent\Model
    {
        return new ChatSession();
    }

    /**
     * Get agent dashboard statistics
     */
    public function getDashboardStats(Request $request): array
    {
        $agentId = Auth::user()->agent?->id;
        $organizationId = Auth::user()->organization_id;

        if (!$agentId) {
            throw new \Exception('User is not registered as an agent');
        }

        $dateFrom = $request->get('date_from', now()->subDays(30)->toDateString());
        $dateTo = $request->get('date_to', now()->toDateString());

        // Get agent's sessions for the period
        $sessionsQuery = ChatSession::where('organization_id', $organizationId)
            ->where('agent_id', $agentId)
            ->whereBetween('created_at', [$dateFrom, $dateTo]);

        // Basic stats
        $totalSessions = $sessionsQuery->count();
        $activeSessions = (clone $sessionsQuery)->where('is_active', true)->count();
        $resolvedSessions = (clone $sessionsQuery)->where('is_resolved', true)->count();
        $pendingSessions = (clone $sessionsQuery)->where('is_active', true)
            ->whereNull('agent_id')
            ->count();

        // Performance metrics
        $avgResponseTime = (clone $sessionsQuery)
            ->whereNotNull('first_response_at')
            ->selectRaw('AVG(EXTRACT(EPOCH FROM (first_response_at - started_at))) as avg_response_time')
            ->value('avg_response_time') ?? 0;

        $avgRating = (clone $sessionsQuery)
            ->whereNotNull('satisfaction_rating')
            ->avg('satisfaction_rating') ?? 0;

        $avgResolutionTime = (clone $sessionsQuery)
            ->whereNotNull('resolution_time')
            ->avg('resolution_time') ?? 0;

        // Message stats
        $totalMessages = (clone $sessionsQuery)->sum('total_messages') ?? 0;
        $agentMessages = (clone $sessionsQuery)->sum('agent_messages') ?? 0;
        $customerMessages = (clone $sessionsQuery)->sum('customer_messages') ?? 0;

        // Today's stats
        $todaySessions = (clone $sessionsQuery)
            ->whereDate('created_at', today())
            ->count();

        $todayMessages = (clone $sessionsQuery)
            ->whereDate('created_at', today())
            ->sum('total_messages') ?? 0;

        // Weekly stats
        $weekSessions = (clone $sessionsQuery)
            ->whereBetween('created_at', [now()->subWeek(), now()])
            ->count();

        // Resolution rate
        $resolutionRate = $totalSessions > 0 ? ($resolvedSessions / $totalSessions) * 100 : 0;

        // Customer satisfaction
        $satisfactionCount = (clone $sessionsQuery)
            ->whereNotNull('satisfaction_rating')
            ->count();

        return [
            'period' => [
                'from' => $dateFrom,
                'to' => $dateTo
            ],
            'sessions' => [
                'total' => $totalSessions,
                'active' => $activeSessions,
                'resolved' => $resolvedSessions,
                'pending' => $pendingSessions,
                'today' => $todaySessions,
                'this_week' => $weekSessions,
                'resolution_rate' => round($resolutionRate, 2)
            ],
            'performance' => [
                'avg_response_time' => round($avgResponseTime, 2),
                'avg_rating' => round($avgRating, 2),
                'avg_resolution_time' => round($avgResolutionTime, 2),
                'satisfaction_count' => $satisfactionCount
            ],
            'messages' => [
                'total' => $totalMessages,
                'agent' => $agentMessages,
                'customer' => $customerMessages,
                'today' => $todayMessages
            ]
        ];
    }

    /**
     * Get agent's recent sessions
     */
    public function getRecentSessions(Request $request): LengthAwarePaginator
    {
        $agentId = Auth::user()->agent?->id;
        $organizationId = Auth::user()->organization_id;

        if (!$agentId) {
            throw new \Exception('User is not registered as an agent');
        }

        $query = ChatSession::where('organization_id', $organizationId)
            ->where('agent_id', $agentId)
            ->with(['customer:id,name,email,avatar', 'botPersonality:id,name'])
            ->orderBy('last_activity_at', 'desc');

        // Apply filters
        if ($request->has('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        if ($request->has('resolved')) {
            $query->where('is_resolved', $request->resolved);
        }

        if ($request->has('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('created_at', '<=', $request->date_to);
        }

        return $query->paginate($request->get('per_page', 20));
    }

    /**
     * Get agent's performance metrics
     */
    public function getPerformanceMetrics(Request $request): array
    {
        $agentId = Auth::user()->agent?->id;
        $organizationId = Auth::user()->organization_id;

        if (!$agentId) {
            throw new \Exception('User is not registered as an agent');
        }

        $days = $request->get('days', 30);
        $dateFrom = now()->subDays($days);
        $dateTo = now();

        // Daily performance data
        $dailyStats = ChatSession::where('organization_id', $organizationId)
            ->where('agent_id', $agentId)
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->selectRaw('
                DATE(created_at) as date,
                COUNT(*) as sessions_count,
                SUM(CASE WHEN is_resolved = true THEN 1 ELSE 0 END) as resolved_count,
                AVG(CASE WHEN first_response_at IS NOT NULL
                    THEN EXTRACT(EPOCH FROM (first_response_at - started_at))
                    ELSE NULL END) as avg_response_time,
                AVG(satisfaction_rating) as avg_rating,
                SUM(total_messages) as total_messages
            ')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Hourly distribution
        $hourlyStats = ChatSession::where('organization_id', $organizationId)
            ->where('agent_id', $agentId)
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->selectRaw('
                EXTRACT(HOUR FROM created_at) as hour,
                COUNT(*) as sessions_count
            ')
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        // Category distribution
        $categoryStats = ChatSession::where('organization_id', $organizationId)
            ->where('agent_id', $agentId)
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->selectRaw('
                COALESCE(category, \'uncategorized\') as category,
                COUNT(*) as sessions_count,
                AVG(satisfaction_rating) as avg_rating
            ')
            ->groupBy('category')
            ->orderBy('sessions_count', 'desc')
            ->get();

        return [
            'period' => [
                'from' => $dateFrom->toDateString(),
                'to' => $dateTo->toDateString(),
                'days' => $days
            ],
            'daily_stats' => $dailyStats,
            'hourly_distribution' => $hourlyStats,
            'category_distribution' => $categoryStats
        ];
    }

    /**
     * Get agent's conversation analytics
     */
    public function getConversationAnalytics(Request $request): array
    {
        $agentId = Auth::user()->agent?->id;
        $organizationId = Auth::user()->organization_id;

        if (!$agentId) {
            throw new \Exception('User is not registered as an agent');
        }

        $sessionId = $request->get('session_id');

        if (!$sessionId) {
            throw new \Exception('Session ID is required');
        }

        $session = ChatSession::where('organization_id', $organizationId)
            ->where('agent_id', $agentId)
            ->where('id', $sessionId)
            ->with(['customer', 'messages' => function($query) {
                $query->orderBy('created_at', 'asc');
            }])
            ->first();

        if (!$session) {
            throw new \Exception('Session not found or not accessible');
        }

        // Message analytics
        $messages = $session->messages;
        $totalMessages = $messages->count();
        $agentMessages = $messages->where('sender_type', 'agent')->count();
        $customerMessages = $messages->where('sender_type', 'customer')->count();
        $botMessages = $messages->where('sender_type', 'bot')->count();

        // Response time analysis
        $responseTimes = [];
        $customerMessageTimes = [];
        $agentMessageTimes = [];

        foreach ($messages as $message) {
            if ($message->sender_type === 'customer') {
                $customerMessageTimes[] = $message->created_at;
            } elseif ($message->sender_type === 'agent' && !empty($customerMessageTimes)) {
                $lastCustomerMessage = end($customerMessageTimes);
                $responseTime = $message->created_at->diffInSeconds($lastCustomerMessage);
                $responseTimes[] = $responseTime;
            }
        }

        $avgResponseTime = !empty($responseTimes) ? array_sum($responseTimes) / count($responseTimes) : 0;

        // Conversation flow analysis
        $conversationFlow = $messages->map(function($message) {
            return [
                'id' => $message->id,
                'sender_type' => $message->sender_type,
                'sender_name' => $message->sender_name,
                'content' => $message->message_text,
                'created_at' => $message->created_at,
                'message_type' => $message->message_type
            ];
        });

        // Sentiment analysis (if available)
        $sentimentData = $messages->whereNotNull('sentiment_analysis')
            ->pluck('sentiment_analysis')
            ->toArray();

        // Keywords extraction (simple implementation)
        $allText = $messages->pluck('message_text')->join(' ');
        $keywords = $this->extractKeywords($allText);

        return [
            'session' => [
                'id' => $session->id,
                'customer' => $session->customer,
                'started_at' => $session->started_at,
                'ended_at' => $session->ended_at,
                'duration' => $session->resolution_time,
                'status' => $session->is_active ? 'active' : 'ended',
                'satisfaction_rating' => $session->satisfaction_rating
            ],
            'messages' => [
                'total' => $totalMessages,
                'agent' => $agentMessages,
                'customer' => $customerMessages,
                'bot' => $botMessages,
                'avg_response_time' => round($avgResponseTime, 2)
            ],
            'conversation_flow' => $conversationFlow,
            'sentiment_data' => $sentimentData,
            'keywords' => $keywords,
            'analytics' => [
                'conversation_length' => $totalMessages,
                'agent_participation_rate' => $totalMessages > 0 ? round(($agentMessages / $totalMessages) * 100, 2) : 0,
                'customer_engagement' => $customerMessages,
                'resolution_status' => $session->is_resolved ? 'resolved' : 'pending'
            ]
        ];
    }

    /**
     * Get agent's workload
     */
    public function getWorkload(Request $request): array
    {
        $agentId = Auth::user()->agent?->id;
        $organizationId = Auth::user()->organization_id;

        if (!$agentId) {
            throw new \Exception('User is not registered as an agent');
        }

        $agent = Agent::where('id', $agentId)
            ->where('organization_id', $organizationId)
            ->first();

        if (!$agent) {
            throw new \Exception('Agent not found');
        }

        // Current active sessions
        $activeSessions = ChatSession::where('organization_id', $organizationId)
            ->where('agent_id', $agentId)
            ->where('is_active', true)
            ->with(['customer:id,name,email'])
            ->get();

        // Pending sessions that could be assigned
        $pendingSessions = ChatSession::where('organization_id', $organizationId)
            ->where('is_active', true)
            ->whereNull('agent_id')
            ->where('is_bot_session', false)
            ->with(['customer:id,name,email'])
            ->orderBy('created_at', 'asc')
            ->get();

        // Workload metrics
        $currentLoad = $activeSessions->count();
        $maxCapacity = $agent->max_concurrent_sessions ?? 10;
        $utilizationRate = $maxCapacity > 0 ? ($currentLoad / $maxCapacity) * 100 : 0;

        // Available capacity
        $availableCapacity = max(0, $maxCapacity - $currentLoad);

        // Priority sessions (high priority or long waiting)
        $prioritySessions = $activeSessions->filter(function($session) {
            return $session->priority === 'high' ||
                   ($session->wait_time && $session->wait_time > 300); // 5 minutes
        });

        return [
            'agent' => [
                'id' => $agent->id,
                'name' => $agent->user->name,
                'max_concurrent_sessions' => $maxCapacity,
                'current_sessions' => $currentLoad,
                'utilization_rate' => round($utilizationRate, 2),
                'available_capacity' => $availableCapacity
            ],
            'active_sessions' => $activeSessions->map(function($session) {
                return [
                    'id' => $session->id,
                    'customer' => $session->customer,
                    'priority' => $session->priority,
                    'wait_time' => $session->wait_time,
                    'last_activity' => $session->last_activity_at,
                    'unread_count' => $session->unread_count ?? 0
                ];
            }),
            'pending_sessions' => $pendingSessions->map(function($session) {
                return [
                    'id' => $session->id,
                    'customer' => $session->customer,
                    'priority' => $session->priority,
                    'wait_time' => $session->wait_time,
                    'created_at' => $session->created_at
                ];
            }),
            'priority_sessions' => $prioritySessions->count(),
            'workload_status' => $utilizationRate > 90 ? 'high' :
                               ($utilizationRate > 70 ? 'medium' : 'low')
        ];
    }

    /**
     * Extract keywords from text (simple implementation)
     */
    private function extractKeywords(string $text, int $limit = 10): array
    {
        // Simple keyword extraction - remove common words and get most frequent
        $commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'];

        $words = str_word_count(strtolower($text), 1);
        $words = array_filter($words, function($word) use ($commonWords) {
            return strlen($word) > 3 && !in_array($word, $commonWords);
        });

        $wordCounts = array_count_values($words);
        arsort($wordCounts);

        return array_slice(array_keys($wordCounts), 0, $limit);
    }
}
