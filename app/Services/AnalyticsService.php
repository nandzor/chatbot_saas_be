<?php

namespace App\Services;

use App\Models\ChatSession;
use App\Models\Message;
use App\Models\User;
use App\Models\BotPersonality;
use App\Models\Organization;
use App\Models\PaymentTransaction;
use App\Models\Subscription;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class AnalyticsService extends BaseService
{
    /**
     * Get the model for the service.
     */
    protected function getModel(): \Illuminate\Database\Eloquent\Model
    {
        return new ChatSession(); // Default model for analytics
    }

    /**
     * Get dashboard analytics
     */
    public function getDashboardAnalytics(array $filters = []): array
    {
        $organizationId = $this->getCurrentOrganizationId();
        $cacheKey = "dashboard_analytics_{$organizationId}_" . md5(serialize($filters));

        return Cache::remember($cacheKey, 300, function () use ($organizationId, $filters) {
            $dateFrom = $filters['date_from'] ?? Carbon::now()->subDays(30);
            $dateTo = $filters['date_to'] ?? Carbon::now();

            // Basic metrics
            $totalConversations = ChatSession::where('organization_id', $organizationId)
                ->whereBetween('started_at', [$dateFrom, $dateTo])
                ->count();

            $activeConversations = ChatSession::where('organization_id', $organizationId)
                ->where('is_active', true)
                ->count();

            $totalMessages = Message::where('organization_id', $organizationId)
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->count();

            $totalUsers = User::where('organization_id', $organizationId)
                ->where('status', 'active')
                ->count();

            $totalChatbots = BotPersonality::where('organization_id', $organizationId)
                ->where('is_active', true)
                ->count();

            // Performance metrics
            $avgResponseTime = ChatSession::where('organization_id', $organizationId)
                ->whereBetween('started_at', [$dateFrom, $dateTo])
                ->whereNotNull('response_time_avg')
                ->avg('response_time_avg');

            $avgResolutionTime = ChatSession::where('organization_id', $organizationId)
                ->whereBetween('started_at', [$dateFrom, $dateTo])
                ->whereNotNull('resolution_time')
                ->avg('resolution_time');

            $satisfactionScore = ChatSession::where('organization_id', $organizationId)
                ->whereBetween('started_at', [$dateFrom, $dateTo])
                ->whereNotNull('satisfaction_rating')
                ->avg('satisfaction_rating');

            // Resolution rate
            $resolvedConversations = ChatSession::where('organization_id', $organizationId)
                ->whereBetween('started_at', [$dateFrom, $dateTo])
                ->where('is_resolved', true)
                ->count();

            $resolutionRate = $totalConversations > 0 ? ($resolvedConversations / $totalConversations) * 100 : 0;

            // Bot vs Agent sessions
            $botSessions = ChatSession::where('organization_id', $organizationId)
                ->whereBetween('started_at', [$dateFrom, $dateTo])
                ->where('is_bot_session', true)
                ->count();

            $agentSessions = ChatSession::where('organization_id', $organizationId)
                ->whereBetween('started_at', [$dateFrom, $dateTo])
                ->where('is_bot_session', false)
                ->count();

            // Daily trends (last 7 days)
            $dailyTrends = $this->getDailyTrends($organizationId, 7);

            return [
                'overview' => [
                    'total_conversations' => $totalConversations,
                    'active_conversations' => $activeConversations,
                    'total_messages' => $totalMessages,
                    'total_users' => $totalUsers,
                    'total_chatbots' => $totalChatbots,
                ],
                'performance' => [
                    'avg_response_time' => round($avgResponseTime ?? 0, 2),
                    'avg_resolution_time' => round($avgResolutionTime ?? 0, 2),
                    'satisfaction_score' => round($satisfactionScore ?? 0, 2),
                    'resolution_rate' => round($resolutionRate, 2),
                ],
                'session_distribution' => [
                    'bot_sessions' => $botSessions,
                    'agent_sessions' => $agentSessions,
                    'bot_percentage' => $totalConversations > 0 ? round(($botSessions / $totalConversations) * 100, 2) : 0,
                    'agent_percentage' => $totalConversations > 0 ? round(($agentSessions / $totalConversations) * 100, 2) : 0,
                ],
                'trends' => $dailyTrends,
                'period' => [
                    'from' => $dateFrom,
                    'to' => $dateTo,
                ]
            ];
        });
    }

    /**
     * Get usage analytics
     */
    public function getUsageAnalytics(array $filters = []): array
    {
        $organizationId = $this->getCurrentOrganizationId();
        $cacheKey = "usage_analytics_{$organizationId}_" . md5(serialize($filters));

        return Cache::remember($cacheKey, 300, function () use ($organizationId, $filters) {
            $dateFrom = $filters['date_from'] ?? Carbon::now()->subDays(30);
            $dateTo = $filters['date_to'] ?? Carbon::now();

            // Feature usage
            $featureUsage = [
                'chatbot_interactions' => ChatSession::where('organization_id', $organizationId)
                    ->whereBetween('started_at', [$dateFrom, $dateTo])
                    ->where('is_bot_session', true)
                    ->count(),
                'agent_interactions' => ChatSession::where('organization_id', $organizationId)
                    ->whereBetween('started_at', [$dateFrom, $dateTo])
                    ->where('is_bot_session', false)
                    ->count(),
                'knowledge_base_searches' => 0, // TODO: Implement when knowledge base search tracking is added
                'api_calls' => 0, // TODO: Implement API call tracking
            ];

            // User activity
            $userActivity = User::where('organization_id', $organizationId)
                ->whereBetween('last_login_at', [$dateFrom, $dateTo])
                ->count();

            // Peak hours analysis
            $peakHours = $this->getPeakHours($organizationId, $dateFrom, $dateTo);

            // Channel usage
            $channelUsage = $this->getChannelUsage($organizationId, $dateFrom, $dateTo);

            return [
                'feature_usage' => $featureUsage,
                'user_activity' => [
                    'active_users' => $userActivity,
                    'total_users' => User::where('organization_id', $organizationId)->count(),
                ],
                'peak_hours' => $peakHours,
                'channel_usage' => $channelUsage,
                'period' => [
                    'from' => $dateFrom,
                    'to' => $dateTo,
                ]
            ];
        });
    }

    /**
     * Get performance analytics
     */
    public function getPerformanceAnalytics(array $filters = []): array
    {
        $organizationId = $this->getCurrentOrganizationId();
        $cacheKey = "performance_analytics_{$organizationId}_" . md5(serialize($filters));

        return Cache::remember($cacheKey, 300, function () use ($organizationId, $filters) {
            $dateFrom = $filters['date_from'] ?? Carbon::now()->subDays(30);
            $dateTo = $filters['date_to'] ?? Carbon::now();

            // Response time metrics
            $responseTimeStats = ChatSession::where('organization_id', $organizationId)
                ->whereBetween('started_at', [$dateFrom, $dateTo])
                ->whereNotNull('response_time_avg')
                ->selectRaw('
                    AVG(response_time_avg) as avg_response_time,
                    MIN(response_time_avg) as min_response_time,
                    MAX(response_time_avg) as max_response_time,
                    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY response_time_avg) as median_response_time
                ')
                ->first();

            // Resolution time metrics
            $resolutionTimeStats = ChatSession::where('organization_id', $organizationId)
                ->whereBetween('started_at', [$dateFrom, $dateTo])
                ->whereNotNull('resolution_time')
                ->selectRaw('
                    AVG(resolution_time) as avg_resolution_time,
                    MIN(resolution_time) as min_resolution_time,
                    MAX(resolution_time) as max_resolution_time,
                    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY resolution_time) as median_resolution_time
                ')
                ->first();

            // Satisfaction metrics
            $satisfactionStats = ChatSession::where('organization_id', $organizationId)
                ->whereBetween('started_at', [$dateFrom, $dateTo])
                ->whereNotNull('satisfaction_rating')
                ->selectRaw('
                    AVG(satisfaction_rating) as avg_satisfaction,
                    COUNT(CASE WHEN satisfaction_rating >= 4 THEN 1 END) as high_satisfaction_count,
                    COUNT(CASE WHEN satisfaction_rating >= 3 AND satisfaction_rating < 4 THEN 1 END) as medium_satisfaction_count,
                    COUNT(CASE WHEN satisfaction_rating < 3 THEN 1 END) as low_satisfaction_count
                ')
                ->first();

            $totalRated = ($satisfactionStats->high_satisfaction_count ?? 0) +
                         ($satisfactionStats->medium_satisfaction_count ?? 0) +
                         ($satisfactionStats->low_satisfaction_count ?? 0);

            return [
                'response_time' => [
                    'avg' => round($responseTimeStats->avg_response_time ?? 0, 2),
                    'min' => round($responseTimeStats->min_response_time ?? 0, 2),
                    'max' => round($responseTimeStats->max_response_time ?? 0, 2),
                    'median' => round($responseTimeStats->median_response_time ?? 0, 2),
                ],
                'resolution_time' => [
                    'avg' => round($resolutionTimeStats->avg_resolution_time ?? 0, 2),
                    'min' => round($resolutionTimeStats->min_resolution_time ?? 0, 2),
                    'max' => round($resolutionTimeStats->max_resolution_time ?? 0, 2),
                    'median' => round($resolutionTimeStats->median_resolution_time ?? 0, 2),
                ],
                'satisfaction' => [
                    'avg' => round($satisfactionStats->avg_satisfaction ?? 0, 2),
                    'high_satisfaction' => [
                        'count' => $satisfactionStats->high_satisfaction_count ?? 0,
                        'percentage' => $totalRated > 0 ? round((($satisfactionStats->high_satisfaction_count ?? 0) / $totalRated) * 100, 2) : 0,
                    ],
                    'medium_satisfaction' => [
                        'count' => $satisfactionStats->medium_satisfaction_count ?? 0,
                        'percentage' => $totalRated > 0 ? round((($satisfactionStats->medium_satisfaction_count ?? 0) / $totalRated) * 100, 2) : 0,
                    ],
                    'low_satisfaction' => [
                        'count' => $satisfactionStats->low_satisfaction_count ?? 0,
                        'percentage' => $totalRated > 0 ? round((($satisfactionStats->low_satisfaction_count ?? 0) / $totalRated) * 100, 2) : 0,
                    ],
                ],
                'period' => [
                    'from' => $dateFrom,
                    'to' => $dateTo,
                ]
            ];
        });
    }

    /**
     * Get conversation analytics
     */
    public function getConversationAnalytics(array $filters = []): array
    {
        $organizationId = $this->getCurrentOrganizationId();
        $cacheKey = "conversation_analytics_{$organizationId}_" . md5(serialize($filters));

        return Cache::remember($cacheKey, 300, function () use ($organizationId, $filters) {
            $dateFrom = $filters['date_from'] ?? Carbon::now()->subDays(30);
            $dateTo = $filters['date_to'] ?? Carbon::now();

            $query = ChatSession::where('organization_id', $organizationId)
                ->whereBetween('started_at', [$dateFrom, $dateTo]);

            // Apply additional filters
            if (isset($filters['session_type'])) {
                $query->where('session_type', $filters['session_type']);
            }
            if (isset($filters['agent_id'])) {
                $query->where('agent_id', $filters['agent_id']);
            }

            $conversations = $query->get();

            // Conversation volume by day
            $volumeByDay = $conversations->groupBy(function ($conversation) {
                return $conversation->started_at->format('Y-m-d');
            })->map(function ($dayConversations) {
                return $dayConversations->count();
            });

            // Conversation types
            $conversationTypes = $conversations->groupBy('session_type')->map(function ($typeConversations) {
                return $typeConversations->count();
            });

            // Resolution analysis
            $resolutionAnalysis = [
                'total' => $conversations->count(),
                'resolved' => $conversations->where('is_resolved', true)->count(),
                'unresolved' => $conversations->where('is_resolved', false)->count(),
                'resolution_rate' => $conversations->count() > 0 ?
                    round(($conversations->where('is_resolved', true)->count() / $conversations->count()) * 100, 2) : 0,
            ];

            return [
                'volume_by_day' => $volumeByDay,
                'conversation_types' => $conversationTypes,
                'resolution_analysis' => $resolutionAnalysis,
                'period' => [
                    'from' => $dateFrom,
                    'to' => $dateTo,
                ]
            ];
        });
    }

    /**
     * Get user analytics
     */
    public function getUserAnalytics(array $filters = []): array
    {
        $organizationId = $this->getCurrentOrganizationId();
        $cacheKey = "user_analytics_{$organizationId}_" . md5(serialize($filters));

        return Cache::remember($cacheKey, 300, function () use ($organizationId, $filters) {
            $dateFrom = $filters['date_from'] ?? Carbon::now()->subDays(30);
            $dateTo = $filters['date_to'] ?? Carbon::now();

            $query = User::where('organization_id', $organizationId);

            // Apply filters
            if (isset($filters['role'])) {
                $query->where('role', $filters['role']);
            }
            if (isset($filters['department'])) {
                $query->where('department', $filters['department']);
            }

            $users = $query->get();

            // User activity
            $activeUsers = $users->where('last_login_at', '>=', $dateFrom)->count();
            $newUsers = $users->where('created_at', '>=', $dateFrom)->count();

            // User roles distribution
            $roleDistribution = $users->groupBy('role')->map(function ($roleUsers) {
                return $roleUsers->count();
            });

            // Department distribution
            $departmentDistribution = $users->whereNotNull('department')
                ->groupBy('department')
                ->map(function ($deptUsers) {
                    return $deptUsers->count();
                });

            return [
                'total_users' => $users->count(),
                'active_users' => $activeUsers,
                'new_users' => $newUsers,
                'role_distribution' => $roleDistribution,
                'department_distribution' => $departmentDistribution,
                'period' => [
                    'from' => $dateFrom,
                    'to' => $dateTo,
                ]
            ];
        });
    }

    /**
     * Get revenue analytics
     */
    public function getRevenueAnalytics(array $filters = []): array
    {
        $organizationId = $this->getCurrentOrganizationId();
        $cacheKey = "revenue_analytics_{$organizationId}_" . md5(serialize($filters));

        return Cache::remember($cacheKey, 300, function () use ($organizationId, $filters) {
            $dateFrom = $filters['date_from'] ?? Carbon::now()->subDays(30);
            $dateTo = $filters['date_to'] ?? Carbon::now();

            // Revenue metrics
            $revenueStats = PaymentTransaction::where('organization_id', $organizationId)
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->where('status', 'completed')
                ->selectRaw('
                    SUM(amount) as total_revenue,
                    AVG(amount) as avg_transaction,
                    COUNT(*) as total_transactions
                ')
                ->first();

            // Subscription metrics
            $subscriptionStats = Subscription::where('organization_id', $organizationId)
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->selectRaw('
                    COUNT(*) as total_subscriptions,
                    COUNT(CASE WHEN status = "active" THEN 1 END) as active_subscriptions,
                    COUNT(CASE WHEN status = "cancelled" THEN 1 END) as cancelled_subscriptions
                ')
                ->first();

            return [
                'revenue' => [
                    'total' => round($revenueStats->total_revenue ?? 0, 2),
                    'avg_transaction' => round($revenueStats->avg_transaction ?? 0, 2),
                    'total_transactions' => $revenueStats->total_transactions ?? 0,
                ],
                'subscriptions' => [
                    'total' => $subscriptionStats->total_subscriptions ?? 0,
                    'active' => $subscriptionStats->active_subscriptions ?? 0,
                    'cancelled' => $subscriptionStats->cancelled_subscriptions ?? 0,
                ],
                'period' => [
                    'from' => $dateFrom,
                    'to' => $dateTo,
                ]
            ];
        });
    }

    /**
     * Get chatbot-specific analytics
     */
    public function getChatbotAnalytics(string $chatbotId, array $filters = []): ?array
    {
        $organizationId = $this->getCurrentOrganizationId();
        $cacheKey = "chatbot_analytics_{$chatbotId}_{$organizationId}_" . md5(serialize($filters));

        return Cache::remember($cacheKey, 300, function () use ($chatbotId, $organizationId, $filters) {
            // Check if chatbot exists and belongs to organization
            $chatbot = BotPersonality::where('id', $chatbotId)
                ->where('organization_id', $organizationId)
                ->first();

            if (!$chatbot) {
                return null;
            }

            $dateFrom = $filters['date_from'] ?? Carbon::now()->subDays(30);
            $dateTo = $filters['date_to'] ?? Carbon::now();

            // Chatbot-specific metrics
            $sessions = ChatSession::where('organization_id', $organizationId)
                ->where('bot_personality_id', $chatbotId)
                ->whereBetween('started_at', [$dateFrom, $dateTo]);

            $totalSessions = $sessions->count();
            $activeSessions = $sessions->where('is_active', true)->count();
            $totalMessages = Message::where('organization_id', $organizationId)
                ->where('sender_id', $chatbotId)
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->count();

            $avgResponseTime = $sessions->whereNotNull('response_time_avg')->avg('response_time_avg');
            $satisfactionScore = $sessions->whereNotNull('satisfaction_rating')->avg('satisfaction_rating');

            return [
                'chatbot_info' => [
                    'id' => $chatbot->id,
                    'name' => $chatbot->name,
                    'display_name' => $chatbot->display_name,
                ],
                'metrics' => [
                    'total_sessions' => $totalSessions,
                    'active_sessions' => $activeSessions,
                    'total_messages' => $totalMessages,
                    'avg_response_time' => round($avgResponseTime ?? 0, 2),
                    'satisfaction_score' => round($satisfactionScore ?? 0, 2),
                ],
                'period' => [
                    'from' => $dateFrom,
                    'to' => $dateTo,
                ]
            ];
        });
    }

    /**
     * Get real-time metrics
     */
    public function getRealtimeMetrics(): array
    {
        $organizationId = $this->getCurrentOrganizationId();
        $cacheKey = "realtime_metrics_{$organizationId}";

        return Cache::remember($cacheKey, 60, function () use ($organizationId) {
            $now = Carbon::now();
            $lastHour = $now->copy()->subHour();

            return [
                'active_conversations' => ChatSession::where('organization_id', $organizationId)
                    ->where('is_active', true)
                    ->count(),
                'messages_last_hour' => Message::where('organization_id', $organizationId)
                    ->whereBetween('created_at', [$lastHour, $now])
                    ->count(),
                'new_conversations_last_hour' => ChatSession::where('organization_id', $organizationId)
                    ->whereBetween('started_at', [$lastHour, $now])
                    ->count(),
                'online_users' => User::where('organization_id', $organizationId)
                    ->where('last_activity_at', '>=', $now->copy()->subMinutes(5))
                    ->count(),
                'timestamp' => $now->toISOString(),
            ];
        });
    }

    /**
     * Export analytics data
     */
    public function exportAnalytics(array $data): array
    {
        $type = $data['type'];
        $format = $data['format'];
        $filters = $data['filters'] ?? [];

        // Get analytics data based on type
        switch ($type) {
            case 'dashboard':
                $analyticsData = $this->getDashboardAnalytics($filters);
                break;
            case 'usage':
                $analyticsData = $this->getUsageAnalytics($filters);
                break;
            case 'performance':
                $analyticsData = $this->getPerformanceAnalytics($filters);
                break;
            case 'conversations':
                $analyticsData = $this->getConversationAnalytics($filters);
                break;
            case 'users':
                $analyticsData = $this->getUserAnalytics($filters);
                break;
            case 'revenue':
                $analyticsData = $this->getRevenueAnalytics($filters);
                break;
            default:
                throw new \InvalidArgumentException("Invalid analytics type: {$type}");
        }

        // Generate export file based on format
        $filename = "analytics_{$type}_" . date('Y-m-d_H-i-s') . ".{$format}";
        $filePath = storage_path("app/exports/{$filename}");

        // Ensure exports directory exists
        if (!file_exists(dirname($filePath))) {
            mkdir(dirname($filePath), 0755, true);
        }

        switch ($format) {
            case 'json':
                file_put_contents($filePath, json_encode($analyticsData, JSON_PRETTY_PRINT));
                break;
            case 'csv':
                $this->exportToCsv($analyticsData, $filePath);
                break;
            case 'xlsx':
                // TODO: Implement Excel export using PhpSpreadsheet
                throw new \Exception('Excel export not yet implemented');
            default:
                throw new \InvalidArgumentException("Invalid export format: {$format}");
        }

        return [
            'filename' => $filename,
            'file_path' => $filePath,
            'download_url' => url("storage/exports/{$filename}"),
            'size' => filesize($filePath),
            'type' => $type,
            'format' => $format,
        ];
    }

    /**
     * Get daily trends
     */
    private function getDailyTrends(string $organizationId, int $days): array
    {
        $trends = [];
        $startDate = Carbon::now()->subDays($days);

        for ($i = 0; $i < $days; $i++) {
            $date = $startDate->copy()->addDays($i);
            $nextDate = $date->copy()->addDay();

            $conversations = ChatSession::where('organization_id', $organizationId)
                ->whereBetween('started_at', [$date, $nextDate])
                ->count();

            $messages = Message::where('organization_id', $organizationId)
                ->whereBetween('created_at', [$date, $nextDate])
                ->count();

            $trends[] = [
                'date' => $date->format('Y-m-d'),
                'conversations' => $conversations,
                'messages' => $messages,
            ];
        }

        return $trends;
    }

    /**
     * Get peak hours analysis
     */
    private function getPeakHours(string $organizationId, Carbon $dateFrom, Carbon $dateTo): array
    {
        $hourlyData = ChatSession::where('organization_id', $organizationId)
            ->whereBetween('started_at', [$dateFrom, $dateTo])
            ->selectRaw('EXTRACT(HOUR FROM started_at) as hour, COUNT(*) as count')
            ->groupBy('hour')
            ->orderBy('hour')
            ->get()
            ->pluck('count', 'hour')
            ->toArray();

        // Fill missing hours with 0
        $peakHours = [];
        for ($hour = 0; $hour < 24; $hour++) {
            $peakHours[$hour] = $hourlyData[$hour] ?? 0;
        }

        return $peakHours;
    }

    /**
     * Get channel usage
     */
    private function getChannelUsage(string $organizationId, Carbon $dateFrom, Carbon $dateTo): array
    {
        // TODO: Implement when channel tracking is added
        return [
            'webchat' => 0,
            'whatsapp' => 0,
            'telegram' => 0,
            'api' => 0,
        ];
    }

    /**
     * Export data to CSV
     */
    private function exportToCsv(array $data, string $filePath): void
    {
        $csvData = $this->flattenArray($data);

        $file = fopen($filePath, 'w');

        // Write headers
        if (!empty($csvData)) {
            fputcsv($file, array_keys($csvData[0]));

            // Write data
            foreach ($csvData as $row) {
                fputcsv($file, $row);
            }
        }

        fclose($file);
    }

    /**
     * Flatten array for CSV export
     */
    private function flattenArray(array $array, string $prefix = ''): array
    {
        $result = [];

        foreach ($array as $key => $value) {
            $newKey = $prefix ? "{$prefix}_{$key}" : $key;

            if (is_array($value)) {
                $result = array_merge($result, $this->flattenArray($value, $newKey));
            } else {
                $result[$newKey] = $value;
            }
        }

        return [$result]; // Return as array of single row for CSV
    }

    /**
     * Get current organization ID
     */
    protected function getCurrentOrganizationId(): string
    {
        $user = Auth::user();
        return $user->organization_id ?? '';
    }
}
