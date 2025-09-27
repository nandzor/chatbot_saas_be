<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\AnalyticsService;
use App\Services\OrganizationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class OrganizationDashboardController extends BaseApiController
{
    protected AnalyticsService $analyticsService;
    protected OrganizationService $organizationService;

    public function __construct(
        AnalyticsService $analyticsService
    ) {
        $this->analyticsService = $analyticsService;
        // OrganizationService will be injected by Laravel's service container
        $this->organizationService = app(OrganizationService::class);
    }

    /**
     * Get current organization ID
     */
    private function getCurrentOrganizationId(): ?string
    {
        $user = $this->getCurrentUser();
        if (!$user) {
            Log::info('No authenticated user found');
            return null;
        }

        $organization = $this->getCurrentOrganization();
        Log::info('User organization_id: ' . $user->organization_id);
        Log::info('Organization found: ' . ($organization ? $organization->name : 'None'));

        return $organization?->id;
    }

    /**
     * Get organization dashboard overview
     */
    public function overview(Request $request): JsonResponse
    {
        try {
            $organizationId = $this->getCurrentOrganizationId();

            // For testing purposes, use a default organization if none found
            if (!$organizationId) {
                $defaultOrg = \App\Models\Organization::first();
                if ($defaultOrg) {
                    $organizationId = $defaultOrg->id;
                } else {
                    return $this->errorResponseWithLog(
                        'organization_dashboard_overview_no_organization',
                        'No organization found for current user',
                        'User must be associated with an organization',
                        403,
                        'NO_ORGANIZATION_ERROR'
                    );
                }
            }

            $dateFrom = $request->input('date_from', Carbon::today());
            $dateTo = $request->input('date_to', Carbon::now());

            // Get today's sessions
            $todaySessions = DB::table('chat_sessions')
                ->where('organization_id', $organizationId)
                ->whereDate('started_at', Carbon::today())
                ->count();

            // Get yesterday's sessions for comparison
            $yesterdaySessions = DB::table('chat_sessions')
                ->where('organization_id', $organizationId)
                ->whereDate('started_at', Carbon::yesterday())
                ->count();

            // Calculate percentage change
            $sessionsChange = $yesterdaySessions > 0
                ? round((($todaySessions - $yesterdaySessions) / $yesterdaySessions) * 100, 1)
                : 0;

            // Get average satisfaction score
            $avgSatisfaction = DB::table('chat_sessions')
                ->where('organization_id', $organizationId)
                ->whereBetween('started_at', [$dateFrom, $dateTo])
                ->whereNotNull('satisfaction_rating')
                ->avg('satisfaction_rating');

            // Get handover count (sessions that were escalated to agents)
            $handoverCount = DB::table('chat_sessions')
                ->where('organization_id', $organizationId)
                ->whereBetween('started_at', [$dateFrom, $dateTo])
                ->whereNotNull('handover_at')
                ->count();

            $handoverPercentage = $todaySessions > 0
                ? round(($handoverCount / $todaySessions) * 100, 1)
                : 0;

            // Get active agents count
            $totalAgents = DB::table('users')
                ->where('organization_id', $organizationId)
                ->where('role', 'agent')
                ->where('status', 'active')
                ->count();

            $activeAgents = DB::table('users')
                ->where('organization_id', $organizationId)
                ->where('role', 'agent')
                ->where('status', 'active')
                ->where('last_login_at', '>=', Carbon::now()->subMinutes(15))
                ->count();

            $activeAgentsPercentage = $totalAgents > 0
                ? round(($activeAgents / $totalAgents) * 100, 1)
                : 0;

            // Get bot vs agent session distribution
            $botSessions = DB::table('chat_sessions')
                ->where('organization_id', $organizationId)
                ->whereBetween('started_at', [$dateFrom, $dateTo])
                ->where('is_bot_session', true)
                ->count();

            $agentSessions = DB::table('chat_sessions')
                ->where('organization_id', $organizationId)
                ->whereBetween('started_at', [$dateFrom, $dateTo])
                ->where('is_bot_session', false)
                ->count();

            $totalSessions = $botSessions + $agentSessions;
            $botPercentage = $totalSessions > 0 ? round(($botSessions / $totalSessions) * 100, 1) : 0;
            $agentPercentage = $totalSessions > 0 ? round(($agentSessions / $totalSessions) * 100, 1) : 0;

            // Get session distribution over time (last 24 hours)
            $sessionDistribution = $this->getSessionDistributionOverTime($organizationId);

            // Get intent analysis
            $intentAnalysis = $this->getIntentAnalysis($organizationId, $dateFrom, $dateTo);

            $this->logApiAction('organization_dashboard_overview_viewed', [
                'organization_id' => $organizationId,
                'date_from' => $dateFrom,
                'date_to' => $dateTo
            ]);

            return $this->successResponseWithLog(
                'organization_dashboard_overview_viewed',
                'Organization dashboard overview retrieved successfully',
                [
                    'overview' => [
                        'total_sessions_today' => $todaySessions,
                        'sessions_change_percentage' => $sessionsChange,
                        'avg_satisfaction' => round($avgSatisfaction ?? 0, 1),
                        'handover_count' => $handoverCount,
                        'handover_percentage' => $handoverPercentage,
                        'active_agents' => $activeAgents,
                        'total_agents' => $totalAgents,
                        'active_agents_percentage' => $activeAgentsPercentage,
                    ],
                    'session_distribution' => [
                        'bot_sessions' => $botSessions,
                        'agent_sessions' => $agentSessions,
                        'bot_percentage' => $botPercentage,
                        'agent_percentage' => $agentPercentage,
                    ],
                    'session_distribution_over_time' => $sessionDistribution,
                    'intent_analysis' => $intentAnalysis,
                    'period' => [
                        'from' => $dateFrom,
                        'to' => $dateTo,
                    ]
                ]
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'organization_dashboard_overview_error',
                'Failed to retrieve organization dashboard overview',
                $e->getMessage(),
                500,
                'DASHBOARD_OVERVIEW_ERROR'
            );
        }
    }

    /**
     * Get session distribution over time
     */
    private function getSessionDistributionOverTime(string $organizationId): array
    {
        $distribution = [];

        // Get last 24 hours data
        for ($i = 23; $i >= 0; $i--) {
            $hour = Carbon::now()->subHours($i);
            $nextHour = $hour->copy()->addHour();

            $botSessions = DB::table('chat_sessions')
                ->where('organization_id', $organizationId)
                ->where('is_bot_session', true)
                ->whereBetween('started_at', [$hour, $nextHour])
                ->count();

            $agentSessions = DB::table('chat_sessions')
                ->where('organization_id', $organizationId)
                ->where('is_bot_session', false)
                ->whereBetween('started_at', [$hour, $nextHour])
                ->count();

            $distribution[] = [
                'time' => $hour->format('H:i'),
                'bot' => $botSessions,
                'agent' => $agentSessions,
            ];
        }

        return $distribution;
    }

    /**
     * Get intent analysis with trends
     */
    private function getIntentAnalysis(string $organizationId, $dateFrom, $dateTo): array
    {
        // Get current period intents
        $currentIntents = DB::table('messages')
            ->where('organization_id', $organizationId)
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->whereNotNull('intent')
            ->select('intent', DB::raw('COUNT(*) as count'))
            ->groupBy('intent')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        // Get previous period for trend calculation
        $periodDays = Carbon::parse($dateFrom)->diffInDays(Carbon::parse($dateTo));
        $previousDateFrom = Carbon::parse($dateFrom)->subDays($periodDays);
        $previousDateTo = Carbon::parse($dateFrom);

        $previousIntents = DB::table('messages')
            ->where('organization_id', $organizationId)
            ->whereBetween('created_at', [$previousDateFrom, $previousDateTo])
            ->whereNotNull('intent')
            ->select('intent', DB::raw('COUNT(*) as count'))
            ->groupBy('intent')
            ->get()
            ->keyBy('intent');

        $totalMessages = $currentIntents->sum('count');

        return $currentIntents->map(function ($intent) use ($totalMessages, $previousIntents) {
            $percentage = $totalMessages > 0 ? round(($intent->count / $totalMessages) * 100, 1) : 0;

            // Calculate trend
            $previousCount = $previousIntents->get($intent->intent)?->count ?? 0;
            $trend = $this->calculateTrend($intent->count, $previousCount);

            return [
                'intent' => $intent->intent,
                'count' => $intent->count,
                'percentage' => $percentage,
                'trend' => $trend
            ];
        })->toArray();
    }

    /**
     * Calculate trend based on current vs previous period
     */
    private function calculateTrend(int $current, int $previous): string
    {
        if ($previous == 0) {
            return $current > 0 ? '↗' : '—';
        }

        $change = (($current - $previous) / $previous) * 100;

        if ($change > 5) {
            return '↗'; // Positive trend
        } elseif ($change < -5) {
            return '↘'; // Negative trend
        } else {
            return '—'; // No significant change
        }
    }

    /**
     * Get session distribution chart data
     */
    public function sessionDistribution(Request $request): JsonResponse
    {
        try {
            $organizationId = $this->getCurrentOrganizationId();

            if (!$organizationId) {
                $defaultOrg = \App\Models\Organization::first();
                if ($defaultOrg) {
                    $organizationId = $defaultOrg->id;
                } else {
                    return $this->errorResponseWithLog(
                        'organization_dashboard_session_distribution_no_organization',
                        'No organization found for current user',
                        'User must be associated with an organization',
                        403,
                        'NO_ORGANIZATION_ERROR'
                    );
                }
            }

            $period = $request->input('period', '24h'); // 24h, 7d, 30d

            $chartData = $this->getSessionDistributionChartData($organizationId, $period);

            $this->logApiAction('organization_dashboard_session_distribution_viewed', [
                'organization_id' => $organizationId,
                'period' => $period
            ]);

            return $this->successResponseWithLog(
                'organization_dashboard_session_distribution_viewed',
                'Session distribution chart data retrieved successfully',
                $chartData
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'organization_dashboard_session_distribution_error',
                'Failed to retrieve session distribution chart data',
                $e->getMessage(),
                500,
                'DASHBOARD_SESSION_DISTRIBUTION_ERROR'
            );
        }
    }

    /**
     * Get session distribution chart data
     */
    private function getSessionDistributionChartData(string $organizationId, string $period): array
    {
        $data = [];
        $labels = [];

        switch ($period) {
            case '24h':
                // Last 24 hours, hourly data
                for ($i = 23; $i >= 0; $i--) {
                    $hour = Carbon::now()->subHours($i);
                    $nextHour = $hour->copy()->addHour();

                    $botSessions = DB::table('chat_sessions')
                        ->where('organization_id', $organizationId)
                        ->where('is_bot_session', true)
                        ->whereBetween('started_at', [$hour, $nextHour])
                        ->count();

                    $agentSessions = DB::table('chat_sessions')
                        ->where('organization_id', $organizationId)
                        ->where('is_bot_session', false)
                        ->whereBetween('started_at', [$hour, $nextHour])
                        ->count();

                    $data[] = [
                        'time' => $hour->format('H:i'),
                        'bot' => $botSessions,
                        'agent' => $agentSessions,
                    ];
                    $labels[] = $hour->format('H:i');
                }
                break;

            case '7d':
                // Last 7 days, daily data
                for ($i = 6; $i >= 0; $i--) {
                    $day = Carbon::now()->subDays($i);
                    $nextDay = $day->copy()->addDay();

                    $botSessions = DB::table('chat_sessions')
                        ->where('organization_id', $organizationId)
                        ->where('is_bot_session', true)
                        ->whereBetween('started_at', [$day, $nextDay])
                        ->count();

                    $agentSessions = DB::table('chat_sessions')
                        ->where('organization_id', $organizationId)
                        ->where('is_bot_session', false)
                        ->whereBetween('started_at', [$day, $nextDay])
                        ->count();

                    $data[] = [
                        'time' => $day->format('M d'),
                        'bot' => $botSessions,
                        'agent' => $agentSessions,
                    ];
                    $labels[] = $day->format('M d');
                }
                break;

            case '30d':
                // Last 30 days, weekly data
                for ($i = 4; $i >= 0; $i--) {
                    $weekStart = Carbon::now()->subWeeks($i)->startOfWeek();
                    $weekEnd = $weekStart->copy()->endOfWeek();

                    $botSessions = DB::table('chat_sessions')
                        ->where('organization_id', $organizationId)
                        ->where('is_bot_session', true)
                        ->whereBetween('started_at', [$weekStart, $weekEnd])
                        ->count();

                    $agentSessions = DB::table('chat_sessions')
                        ->where('organization_id', $organizationId)
                        ->where('is_bot_session', false)
                        ->whereBetween('started_at', [$weekStart, $weekEnd])
                        ->count();

                    $data[] = [
                        'time' => 'Week ' . (5 - $i),
                        'bot' => $botSessions,
                        'agent' => $agentSessions,
                    ];
                    $labels[] = 'Week ' . (5 - $i);
                }
                break;
        }

        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Bot Sessions',
                    'data' => array_column($data, 'bot'),
                    'backgroundColor' => 'rgba(59, 130, 246, 0.1)',
                    'borderColor' => 'rgba(59, 130, 246, 1)',
                    'borderWidth' => 2,
                ],
                [
                    'label' => 'Agent Sessions',
                    'data' => array_column($data, 'agent'),
                    'backgroundColor' => 'rgba(34, 197, 94, 0.1)',
                    'borderColor' => 'rgba(34, 197, 94, 1)',
                    'borderWidth' => 2,
                ]
            ],
            'period' => $period
        ];
    }

    /**
     * Get real-time metrics
     */
    public function realtime(Request $request): JsonResponse
    {
        try {
            $organizationId = $this->getCurrentOrganizationId();

            if (!$organizationId) {
                $defaultOrg = \App\Models\Organization::first();
                if ($defaultOrg) {
                    $organizationId = $defaultOrg->id;
                } else {
                    return $this->errorResponseWithLog(
                        'organization_dashboard_realtime_no_organization',
                        'No organization found for current user',
                        'User must be associated with an organization',
                        403,
                        'NO_ORGANIZATION_ERROR'
                    );
                }
            }

            // Get current active sessions
            $activeSessions = DB::table('chat_sessions')
                ->where('organization_id', $organizationId)
                ->where('is_active', true)
                ->count();

            // Get sessions in last 5 minutes
            $recentSessions = DB::table('chat_sessions')
                ->where('organization_id', $organizationId)
                ->where('started_at', '>=', Carbon::now()->subMinutes(5))
                ->count();

            // Get online agents
            $onlineAgents = DB::table('users')
                ->where('organization_id', $organizationId)
                ->where('role', 'agent')
                ->where('last_login_at', '>=', Carbon::now()->subMinutes(5))
                ->count();

            $this->logApiAction('organization_dashboard_realtime_viewed', [
                'organization_id' => $organizationId
            ]);

            return $this->successResponseWithLog(
                'organization_dashboard_realtime_viewed',
                'Real-time metrics retrieved successfully',
                [
                    'active_sessions' => $activeSessions,
                    'recent_sessions' => $recentSessions,
                    'online_agents' => $onlineAgents,
                    'timestamp' => Carbon::now()->toISOString()
                ]
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'organization_dashboard_realtime_error',
                'Failed to retrieve real-time metrics',
                $e->getMessage(),
                500,
                'DASHBOARD_REALTIME_ERROR'
            );
        }
    }
}
