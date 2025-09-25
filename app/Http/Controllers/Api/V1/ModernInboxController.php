<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\AiHumanHybridService;
use App\Services\AiAnalysisService;
use App\Services\AgentCoachingService;
use App\Services\ConversationService;
use App\Models\ChatSession;
use App\Models\Agent;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

/**
 * Modern Inbox Controller
 *
 * Advanced controller for AI-Human Hybrid inbox management system
 * with real-time AI assistance and intelligent routing.
 * Uses BaseApiController for consistent API responses and authentication.
 */
class ModernInboxController extends BaseApiController
{
    protected AiHumanHybridService $aiHumanHybridService;
    protected AiAnalysisService $aiAnalysisService;
    protected AgentCoachingService $agentCoachingService;
    protected ConversationService $conversationService;

    public function __construct(
        AiHumanHybridService $aiHumanHybridService,
        AiAnalysisService $aiAnalysisService,
        AgentCoachingService $agentCoachingService,
        ConversationService $conversationService
    ) {
        $this->aiHumanHybridService = $aiHumanHybridService;
        $this->aiAnalysisService = $aiAnalysisService;
        $this->agentCoachingService = $agentCoachingService;
        $this->conversationService = $conversationService;
    }

    /**
     * Get modern inbox dashboard with AI insights
     */
    public function dashboard(Request $request): JsonResponse
    {
        try {
            $organizationId = $this->getCurrentUser()->organization_id;
            $agentId = $this->getCurrentUser()->agent_id;

            // Get comprehensive dashboard data using existing services
            $dashboard = [
                'overview' => $this->getOverviewStats($organizationId),
                'ai_insights' => $this->getAiInsights($organizationId),
                'agent_performance' => $this->getAgentPerformance($agentId),
                'conversation_health' => $this->getConversationHealth($organizationId),
                'predictive_analytics' => $this->getPredictiveAnalytics($organizationId),
                'real_time_alerts' => $this->getRealTimeAlerts($organizationId),
            ];

            $this->logApiAction('dashboard_accessed', [
                'organization_id' => $organizationId,
                'agent_id' => $agentId
            ]);

            return $this->successResponse(
                'Dashboard data retrieved successfully',
                $dashboard
            );
        } catch (\Exception $e) {
            Log::error('Modern inbox dashboard error: ' . $e->getMessage());
            return $this->errorResponse(
                'Failed to load dashboard',
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Get AI-powered conversation suggestions
     */
    public function getAiSuggestions(Request $request, string $sessionId): JsonResponse
    {
        try {
            $organizationId = $this->getCurrentUser()->organization_id;
            $agentId = $this->getCurrentUser()->agent_id;

            // Validate session belongs to organization
            $session = ChatSession::where('id', $sessionId)
                ->where('organization_id', $organizationId)
                ->first();

            if (!$session) {
                return $this->errorResponse('Session not found', null, 404);
            }

            // Get AI suggestions using existing service
            $suggestions = $this->aiAnalysisService->getConversationSuggestions(
                $sessionId,
                $agentId,
                $request->get('context', [])
            );

            $this->logApiAction('ai_suggestions_requested', [
                'session_id' => $sessionId,
                'agent_id' => $agentId
            ]);

            return $this->successResponse(
                'AI suggestions retrieved successfully',
                $suggestions
            );
        } catch (\Exception $e) {
            Log::error('AI suggestions error: ' . $e->getMessage());
            return $this->errorResponse(
                'Failed to get AI suggestions',
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Get conversations with AI assistance
     */
    public function getConversations(Request $request): JsonResponse
    {
        try {
            $organizationId = $this->getCurrentUser()->organization_id;
            $agentId = $this->getCurrentUser()->agent_id;

            // Build filters from request
            $filters = $this->buildFilters($request);

            // Use existing ConversationService
            $conversations = $this->conversationService->getAllItems($request, $filters);

            // Add AI insights to each conversation
            $conversationsWithAi = $conversations->map(function ($conversation) {
                $aiInsights = $this->aiAnalysisService->getConversationInsights($conversation->id);
                $conversation->ai_insights = $aiInsights;
                return $conversation;
            });

            $this->logApiAction('conversations_accessed', [
                'organization_id' => $organizationId,
                'agent_id' => $agentId,
                'filters' => $filters
            ]);

            return $this->successResponse(
                'Conversations retrieved successfully',
                $conversationsWithAi
            );
        } catch (\Exception $e) {
            Log::error('Get conversations error: ' . $e->getMessage());
            return $this->errorResponse(
                'Failed to get conversations',
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Send message with AI assistance
     */
    public function sendMessage(Request $request, string $sessionId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'content' => 'required|string|max:4000',
                'message_type' => 'string|in:text,image,video,audio,document',
                'ai_assistance' => 'boolean'
            ]);

            if ($validator->fails()) {
                return $this->errorResponse(
                    'Validation failed',
                    $validator->errors(),
                    422
                );
            }

            $organizationId = $this->getCurrentUser()->organization_id;
            $agentId = $this->getCurrentUser()->agent_id;

            // Validate session belongs to organization
            $session = ChatSession::where('id', $sessionId)
                ->where('organization_id', $organizationId)
                ->first();

            if (!$session) {
                return $this->errorResponse('Session not found', null, 404);
            }

            // Prepare message data
            $messageData = [
                'sender_type' => 'agent',
                'sender_id' => $agentId,
                'content' => $request->get('content'),
                'message_type' => $request->get('message_type', 'text'),
                'metadata' => [
                    'ai_assistance' => $request->get('ai_assistance', false),
                    'sent_by_agent' => true
                ]
            ];

            // Send message using existing service
            $result = $this->conversationService->sendMessage($sessionId, $messageData);

            // Get AI coaching if requested
            if ($request->get('ai_assistance', false)) {
                $coaching = $this->agentCoachingService->getMessageCoaching(
                    $sessionId,
                    $request->get('content'),
                    $agentId
                );
                $result['ai_coaching'] = $coaching;
            }

            $this->logApiAction('message_sent', [
                'session_id' => $sessionId,
                'agent_id' => $agentId,
                'message_type' => $messageData['message_type']
            ]);

            return $this->successResponse(
                'Message sent successfully',
                $result
            );
        } catch (\Exception $e) {
            Log::error('Send message error: ' . $e->getMessage());
            return $this->errorResponse(
                'Failed to send message',
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Get agent coaching and performance insights
     */
    public function getAgentCoaching(Request $request): JsonResponse
    {
        try {
            $agentId = $this->getCurrentUser()->agent_id;
            $organizationId = $this->getCurrentUser()->organization_id;

            // Get coaching data using existing service
            $coaching = $this->agentCoachingService->getAgentCoaching(
                $agentId,
                $request->get('period', 'week'),
                $request->get('include_suggestions', true)
            );

            $this->logApiAction('agent_coaching_accessed', [
                'agent_id' => $agentId,
                'organization_id' => $organizationId
            ]);

            return $this->successResponse(
                'Agent coaching data retrieved successfully',
                $coaching
            );
        } catch (\Exception $e) {
            Log::error('Agent coaching error: ' . $e->getMessage());
            return $this->errorResponse(
                'Failed to get agent coaching',
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Transfer conversation with AI routing
     */
    public function transferConversation(Request $request, string $sessionId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'target_agent_id' => 'required|string|exists:agents,id',
                'reason' => 'string|max:500',
                'ai_routing' => 'boolean'
            ]);

            if ($validator->fails()) {
                return $this->errorResponse(
                    'Validation failed',
                    $validator->errors(),
                    422
                );
            }

            $organizationId = $this->getCurrentUser()->organization_id;
            $agentId = $this->getCurrentUser()->agent_id;

            // Use AI routing if requested
            if ($request->get('ai_routing', false)) {
                $aiRouting = $this->aiHumanHybridService->getOptimalAgentForTransfer(
                    $sessionId,
                    $organizationId
                );

                if ($aiRouting['success']) {
                    $request->merge(['target_agent_id' => $aiRouting['recommended_agent_id']]);
                }
            }

            // Transfer using existing service
            $transferData = [
                'agent_id' => $request->target_agent_id,
                'reason' => $request->get('reason', 'Manual transfer')
            ];

            $result = $this->conversationService->transfer($sessionId, $transferData);

            if (!$result) {
                return $this->errorResponse('Failed to transfer conversation', null, 500);
            }

            $this->logApiAction('conversation_transferred', [
                'session_id' => $sessionId,
                'from_agent_id' => $agentId,
                'to_agent_id' => $request->target_agent_id,
                'ai_routing' => $request->get('ai_routing', false)
            ]);

            return $this->successResponse(
                'Conversation transferred successfully',
                $result
            );
        } catch (\Exception $e) {
            Log::error('Transfer conversation error: ' . $e->getMessage());
            return $this->errorResponse(
                'Failed to transfer conversation',
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Get conversation analytics with AI insights
     */
    public function getConversationAnalytics(Request $request): JsonResponse
    {
        try {
            $organizationId = $this->getCurrentUser()->organization_id;
            $agentId = $this->getCurrentUser()->agent_id;

            // Get analytics using existing service
            $analytics = $this->conversationService->getStatistics([
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
                'agent_id' => $request->get('agent_id', $agentId)
            ]);

            // Add AI insights
            $aiInsights = $this->aiAnalysisService->getAnalyticsInsights($analytics);

            $result = array_merge($analytics, ['ai_insights' => $aiInsights]);

            $this->logApiAction('analytics_accessed', [
                'organization_id' => $organizationId,
                'agent_id' => $agentId
            ]);

            return $this->successResponse(
                'Analytics retrieved successfully',
                $result
            );
        } catch (\Exception $e) {
            Log::error('Analytics error: ' . $e->getMessage());
            return $this->errorResponse(
                'Failed to get analytics',
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Build filters from request using BaseApiController method
     */
    private function buildFilters(Request $request): array
    {
        $allowedFilters = [
            'status', 'session_type', 'is_active', 'is_bot_session',
            'agent_id', 'customer_id', 'date_from', 'date_to',
            'priority', 'is_resolved', 'handling_mode', 'requires_human'
        ];

        return $this->getFilterParams($request, $allowedFilters);
    }

    /**
     * Get overview statistics
     */
    private function getOverviewStats(string $organizationId): array
    {
        return $this->conversationService->getStatistics([
            'organization_id' => $organizationId
        ]);
    }

    /**
     * Get AI insights
     */
    private function getAiInsights(string $organizationId): array
    {
        return $this->aiAnalysisService->getOrganizationInsights($organizationId);
    }

    /**
     * Get agent performance
     */
    private function getAgentPerformance(?string $agentId): array
    {
        if (!$agentId) {
            return [];
        }

        return $this->agentCoachingService->getAgentPerformance($agentId);
    }

    /**
     * Get conversation health metrics
     */
    private function getConversationHealth(string $organizationId): array
    {
        return $this->aiAnalysisService->getConversationHealthMetrics($organizationId);
    }

    /**
     * Get predictive analytics
     */
    private function getPredictiveAnalytics(string $organizationId): array
    {
        return $this->aiAnalysisService->getPredictiveAnalytics($organizationId);
    }

    /**
     * Get real-time alerts
     */
    private function getRealTimeAlerts(string $organizationId): array
    {
        return $this->aiHumanHybridService->getRealTimeAlerts($organizationId);
    }

    /**
     * Get AI cost statistics and optimization metrics
     */
    public function getCostStatistics(Request $request): JsonResponse
    {
        try {
            $organizationId = $this->getCurrentUser()->organization_id;

            // Get cost statistics from AI analysis service
            $costStats = $this->aiAnalysisService->getCostStatistics();

            // Add organization-specific data
            $costStats['organization_id'] = $organizationId;
            $costStats['optimization_recommendations'] = $this->getOptimizationRecommendations($costStats);

            $this->logApiAction('cost_statistics_accessed', [
                'organization_id' => $organizationId
            ]);

            return $this->successResponse(
                'Cost statistics retrieved successfully',
                $costStats
            );
        } catch (\Exception $e) {
            Log::error('Cost statistics error: ' . $e->getMessage());
            return $this->errorResponse(
                'Failed to get cost statistics',
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Get optimization recommendations based on cost statistics
     */
    private function getOptimizationRecommendations(array $costStats): array
    {
        $recommendations = [];

        // Check cache hit rate
        if ($costStats['cache_hit_rate'] < 50) {
            $recommendations[] = [
                'type' => 'cache_optimization',
                'message' => 'Cache hit rate is low. Consider increasing cache duration or improving cache keys.',
                'priority' => 'medium'
            ];
        }

        // Check API usage
        $apiCount = $costStats['analysis_method_usage']['api'] ?? 0;
        $localCount = $costStats['analysis_method_usage']['local'] ?? 0;

        if ($apiCount > $localCount) {
            $recommendations[] = [
                'type' => 'cost_optimization',
                'message' => 'High API usage detected. Consider enabling local analysis to reduce costs.',
                'priority' => 'high'
            ];
        }

        // Check savings
        $savings = $costStats['estimated_savings']['savings_percentage'] ?? 0;
        if ($savings > 80) {
            $recommendations[] = [
                'type' => 'performance',
                'message' => 'Excellent cost optimization! Local analysis is working effectively.',
                'priority' => 'low'
            ];
        }

        return $recommendations;
    }

    // ====================================================================
    // ENHANCED AGENT ASSIGNMENT SYSTEM
    // ====================================================================

    /**
     * Get available agents with enhanced filtering and matching
     */
    public function getAvailableAgents(Request $request): JsonResponse
    {
        try {
            $organizationId = $this->getCurrentUser()->organization_id;

            // Get filters from request
            $filters = $request->only([
                'skills', 'languages', 'availability_status', 'max_concurrent_chats',
                'exclude_agent_id', 'required_skills', 'timezone', 'department'
            ]);

            // Use existing service to get available agents
            $availableAgents = $this->aiHumanHybridService->getAvailableAgents($organizationId, $filters);

            // Enhance with additional data using existing models
            $enhancedAgents = $availableAgents->map(function ($agent) {
                return [
                    'id' => $agent->id,
                    'display_name' => $agent->display_name,
                    'department' => $agent->department,
                    'skills' => $agent->skills ?? [],
                    'languages' => $agent->languages ?? [],
                    'availability_status' => $agent->availability_status,
                    'current_active_chats' => $agent->current_active_chats,
                    'max_concurrent_chats' => $agent->max_concurrent_chats,
                    'capacity_utilization' => $agent->max_concurrent_chats > 0 ?
                        round(($agent->current_active_chats / $agent->max_concurrent_chats) * 100, 2) : 0,
                    'performance_metrics' => $agent->performance_metrics ?? [],
                    'rating' => $agent->rating ?? 0,
                    'can_handle_more' => $agent->canHandleMoreChats(),
                    'last_active_at' => $agent->last_active_at ?? null,
                ];
            });

            $this->logApiAction('available_agents_accessed', [
                'organization_id' => $organizationId,
                'filters_applied' => $filters
            ]);

            return $this->successResponse(
                'Available agents retrieved successfully',
                [
                    'agents' => $enhancedAgents,
                    'total_count' => $enhancedAgents->count(),
                    'filters_applied' => $filters
                ]
            );
        } catch (\Exception $e) {
            Log::error('Get available agents error: ' . $e->getMessage());
            return $this->errorResponse(
                'Failed to get available agents',
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Assign conversation to agent with enhanced matching
     */
    public function assignConversation(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'conversation_id' => 'required|string',
                'agent_id' => 'required|string',
                'assignment_reason' => 'string|max:500',
                'priority' => 'string|in:low,normal,high,urgent',
                'ai_context' => 'array'
            ]);

            if ($validator->fails()) {
                return $this->errorResponse(
                    'Validation failed',
                    $validator->errors(),
                    422
                );
            }

            $organizationId = $this->getCurrentUser()->organization_id;
            $conversationId = $request->get('conversation_id');
            $agentId = $request->get('agent_id');

            // Get conversation using existing model
            $conversation = ChatSession::where('id', $conversationId)
                ->where('organization_id', $organizationId)
                ->first();

            if (!$conversation) {
                return $this->errorResponse('Conversation not found', null, 404);
            }

            // Get agent using existing model
            $agent = Agent::where('id', $agentId)
                ->where('organization_id', $organizationId)
                ->first();

            if (!$agent) {
                return $this->errorResponse('Agent not found', null, 404);
            }

            // Use existing method to assign conversation
            $assignmentResult = $conversation->assignToAgent($agent);

            if ($assignmentResult) {
                // Update assignment details if provided
                $updateData = [];
                if ($request->has('assignment_reason')) {
                    $updateData['assignment_notes'] = $request->get('assignment_reason');
                }
                if ($request->has('priority')) {
                    $updateData['priority'] = $request->get('priority');
                }
                if ($request->has('ai_context')) {
                    $updateData['ai_context'] = $request->get('ai_context');
                }

                if (!empty($updateData)) {
                    $conversation->update($updateData);
                }

                $this->logApiAction('conversation_assigned', [
                    'organization_id' => $organizationId,
                    'conversation_id' => $conversationId,
                    'agent_id' => $agentId,
                    'assignment_reason' => $request->get('assignment_reason')
                ]);

                return $this->successResponse(
                    'Conversation assigned successfully',
                    [
                        'conversation_id' => $conversationId,
                        'agent_id' => $agentId,
                        'agent_name' => $agent->display_name,
                        'assigned_at' => now(),
                        'assignment_reason' => $request->get('assignment_reason')
                    ]
                );
            } else {
                return $this->errorResponse(
                    'Failed to assign conversation. Agent may be at capacity.',
                    null,
                    400
                );
            }
        } catch (\Exception $e) {
            Log::error('Assign conversation error: ' . $e->getMessage());
            return $this->errorResponse(
                'Failed to assign conversation',
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Get assignment rules and preferences
     */
    public function getAssignmentRules(Request $request): JsonResponse
    {
        try {
            $organizationId = $this->getCurrentUser()->organization_id;

            // Get assignment rules from existing service
            $rules = $this->aiHumanHybridService->getAssignmentRules($organizationId);

            // Enhance with additional rule types
            $enhancedRules = [
                'default_rules' => $rules,
                'custom_rules' => [
                    'skill_matching' => [
                        'enabled' => true,
                        'weight' => 0.3,
                        'description' => 'Match conversations to agents based on required skills'
                    ],
                    'language_matching' => [
                        'enabled' => true,
                        'weight' => 0.2,
                        'description' => 'Prefer agents who speak the customer language'
                    ],
                    'workload_balancing' => [
                        'enabled' => true,
                        'weight' => 0.25,
                        'description' => 'Distribute conversations evenly among agents'
                    ],
                    'performance_based' => [
                        'enabled' => true,
                        'weight' => 0.15,
                        'description' => 'Consider agent performance metrics'
                    ],
                    'availability_priority' => [
                        'enabled' => true,
                        'weight' => 0.1,
                        'description' => 'Prioritize available agents'
                    ]
                ],
                'escalation_rules' => [
                    'auto_escalate_after' => 300, // 5 minutes
                    'escalate_to_supervisor' => true,
                    'escalate_high_priority' => true
                ]
            ];

            $this->logApiAction('assignment_rules_accessed', [
                'organization_id' => $organizationId
            ]);

            return $this->successResponse(
                'Assignment rules retrieved successfully',
                $enhancedRules
            );
        } catch (\Exception $e) {
            Log::error('Get assignment rules error: ' . $e->getMessage());
            return $this->errorResponse(
                'Failed to get assignment rules',
                $e->getMessage(),
                500
            );
        }
    }

    // ====================================================================
    // ENHANCED INBOX FILTERING & SORTING
    // ====================================================================

    /**
     * Get enhanced conversation filters
     */
    public function getConversationFilters(Request $request): JsonResponse
    {
        try {
            $organizationId = $this->getCurrentUser()->organization_id;

            // Get existing filter options
            $baseFilters = $this->conversationService->getFilterOptions($organizationId);

            // Enhance with additional filter options
            $enhancedFilters = [
                'status' => [
                    'options' => ['all', 'active', 'pending', 'resolved', 'closed', 'escalated'],
                    'default' => 'all'
                ],
                'priority' => [
                    'options' => ['all', 'low', 'normal', 'high', 'urgent'],
                    'default' => 'all'
                ],
                'channel' => [
                    'options' => ['all', 'whatsapp', 'webchat', 'facebook', 'email', 'telegram'],
                    'default' => 'all'
                ],
                'assigned_agent' => [
                    'options' => $this->getAgentFilterOptions($organizationId),
                    'default' => 'all'
                ],
                'date_range' => [
                    'options' => ['today', 'yesterday', 'week', 'month', 'custom'],
                    'default' => 'today'
                ],
                'customer_satisfaction' => [
                    'options' => ['all', 'high', 'medium', 'low', 'unrated'],
                    'default' => 'all'
                ],
                'response_time' => [
                    'options' => ['all', 'fast', 'normal', 'slow', 'very_slow'],
                    'default' => 'all'
                ],
                'ai_suggestions' => [
                    'options' => ['all', 'with_suggestions', 'without_suggestions'],
                    'default' => 'all'
                ],
                'tags' => [
                    'options' => $this->getTagFilterOptions($organizationId),
                    'default' => []
                ],
                'custom_filters' => $baseFilters['custom_filters'] ?? []
            ];

            $this->logApiAction('conversation_filters_accessed', [
                'organization_id' => $organizationId
            ]);

            return $this->successResponse(
                'Conversation filters retrieved successfully',
                $enhancedFilters
            );
        } catch (\Exception $e) {
            Log::error('Get conversation filters error: ' . $e->getMessage());
            return $this->errorResponse(
                'Failed to get conversation filters',
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Apply bulk actions to conversations
     */
    public function applyBulkActions(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'conversation_ids' => 'required|array|min:1',
                'conversation_ids.*' => 'string',
                'action' => 'required|string|in:assign,close,escalate,add_tag,remove_tag,change_priority',
                'action_data' => 'array'
            ]);

            if ($validator->fails()) {
                return $this->errorResponse(
                    'Validation failed',
                    $validator->errors(),
                    422
                );
            }

            $organizationId = $this->getCurrentUser()->organization_id;
            $conversationIds = $request->get('conversation_ids');
            $action = $request->get('action');
            $actionData = $request->get('action_data', []);

            // Get conversations using existing model
            $conversations = ChatSession::whereIn('id', $conversationIds)
                ->where('organization_id', $organizationId)
                ->get();

            if ($conversations->isEmpty()) {
                return $this->errorResponse('No conversations found', null, 404);
            }

            $results = [];
            $successCount = 0;
            $errorCount = 0;

            foreach ($conversations as $conversation) {
                try {
                    $result = $this->executeBulkAction($conversation, $action, $actionData);
                    $results[] = [
                        'conversation_id' => $conversation->id,
                        'success' => $result['success'],
                        'message' => $result['message']
                    ];

                    if ($result['success']) {
                        $successCount++;
                    } else {
                        $errorCount++;
                    }
                } catch (\Exception $e) {
                    $results[] = [
                        'conversation_id' => $conversation->id,
                        'success' => false,
                        'message' => $e->getMessage()
                    ];
                    $errorCount++;
                }
            }

            $this->logApiAction('bulk_actions_applied', [
                'organization_id' => $organizationId,
                'action' => $action,
                'conversation_count' => count($conversationIds),
                'success_count' => $successCount,
                'error_count' => $errorCount
            ]);

            return $this->successResponse(
                'Bulk actions applied successfully',
                [
                    'total_processed' => count($conversationIds),
                    'success_count' => $successCount,
                    'error_count' => $errorCount,
                    'results' => $results
                ]
            );
        } catch (\Exception $e) {
            Log::error('Apply bulk actions error: ' . $e->getMessage());
            return $this->errorResponse(
                'Failed to apply bulk actions',
                $e->getMessage(),
                500
            );
        }
    }

    // ====================================================================
    // ENHANCED PERFORMANCE TRACKING
    // ====================================================================

    /**
     * Get enhanced agent performance metrics
     */
    public function getAgentPerformanceMetrics(Request $request): JsonResponse
    {
        try {
            $organizationId = $this->getCurrentUser()->organization_id;
            $agentId = $request->get('agent_id', $this->getCurrentUser()->agent_id);

            if (!$agentId) {
                return $this->errorResponse('Agent ID not found', null, 404);
            }

            // Get base performance using existing service
            $basePerformance = $this->agentCoachingService->getAgentPerformance($agentId);

            // Enhance with additional metrics
            $enhancedPerformance = [
                'agent_info' => [
                    'id' => $agentId,
                    'name' => $this->getAgentName($agentId),
                    'department' => $this->getAgentDepartment($agentId)
                ],
                'performance_metrics' => $basePerformance,
                'detailed_metrics' => [
                    'conversation_handling' => $this->getConversationHandlingMetrics($agentId),
                    'response_times' => $this->getResponseTimeMetrics($agentId),
                    'customer_satisfaction' => $this->getCustomerSatisfactionMetrics($agentId),
                    'ai_usage' => $this->getAiUsageMetrics($agentId),
                    'skill_development' => $this->getSkillDevelopmentMetrics($agentId)
                ],
                'trends' => $this->getPerformanceTrends($agentId),
                'recommendations' => $this->getPerformanceRecommendations($agentId),
                'goals' => $this->getPerformanceGoals($agentId)
            ];

            $this->logApiAction('agent_performance_accessed', [
                'organization_id' => $organizationId,
                'agent_id' => $agentId
            ]);

            return $this->successResponse(
                'Agent performance metrics retrieved successfully',
                $enhancedPerformance
            );
        } catch (\Exception $e) {
            Log::error('Get agent performance metrics error: ' . $e->getMessage());
            return $this->errorResponse(
                'Failed to get agent performance metrics',
                $e->getMessage(),
                500
            );
        }
    }

    // ====================================================================
    // ENHANCED CONVERSATION TEMPLATES
    // ====================================================================

    /**
     * Get conversation templates
     */
    public function getConversationTemplates(Request $request): JsonResponse
    {
        try {
            $organizationId = $this->getCurrentUser()->organization_id;
            $category = $request->get('category', 'all');

            // Get templates using existing service
            $templates = $this->conversationService->getTemplates($organizationId, $category);

            // Enhance with additional template data
            $enhancedTemplates = $templates->map(function ($template) {
                return [
                    'id' => $template->id,
                    'name' => $template->name,
                    'category' => $template->category,
                    'content' => $template->content,
                    'variables' => $template->variables ?? [],
                    'usage_count' => $template->usage_count ?? 0,
                    'last_used' => $template->last_used ?? null,
                    'is_favorite' => $template->is_favorite ?? false,
                    'tags' => $template->tags ?? [],
                    'created_by' => $template->created_by ?? null
                ];
            });

            $this->logApiAction('conversation_templates_accessed', [
                'organization_id' => $organizationId,
                'category' => $category
            ]);

            return $this->successResponse(
                'Conversation templates retrieved successfully',
                [
                    'templates' => $enhancedTemplates,
                    'categories' => $this->getTemplateCategories($organizationId),
                    'total_count' => $enhancedTemplates->count()
                ]
            );
        } catch (\Exception $e) {
            Log::error('Get conversation templates error: ' . $e->getMessage());
            return $this->errorResponse(
                'Failed to get conversation templates',
                $e->getMessage(),
                500
            );
        }
    }

    /**
     * Save conversation template
     */
    public function saveConversationTemplate(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'content' => 'required|string',
                'category' => 'required|string|max:100',
                'variables' => 'array',
                'tags' => 'array',
                'is_favorite' => 'boolean'
            ]);

            if ($validator->fails()) {
                return $this->errorResponse(
                    'Validation failed',
                    $validator->errors(),
                    422
                );
            }

            $organizationId = $this->getCurrentUser()->organization_id;
            $agentId = $this->getCurrentUser()->agent_id;

            // Use existing service to save template
            $template = $this->conversationService->saveTemplate([
                'organization_id' => $organizationId,
                'created_by' => $agentId,
                'name' => $request->get('name'),
                'content' => $request->get('content'),
                'category' => $request->get('category'),
                'variables' => $request->get('variables', []),
                'tags' => $request->get('tags', []),
                'is_favorite' => $request->get('is_favorite', false)
            ]);

            $this->logApiAction('conversation_template_saved', [
                'organization_id' => $organizationId,
                'agent_id' => $agentId,
                'template_id' => $template->id
            ]);

            return $this->successResponse(
                'Conversation template saved successfully',
                $template
            );
        } catch (\Exception $e) {
            Log::error('Save conversation template error: ' . $e->getMessage());
            return $this->errorResponse(
                'Failed to save conversation template',
                $e->getMessage(),
                500
            );
        }
    }

    // ====================================================================
    // HELPER METHODS
    // ====================================================================

    /**
     * Get agent filter options
     */
    private function getAgentFilterOptions(string $organizationId): array
    {
        $agents = Agent::where('organization_id', $organizationId)
            ->where('status', 'active')
            ->select('id', 'display_name', 'department')
            ->get();

        $options = [['value' => 'all', 'label' => 'All Agents']];

        foreach ($agents as $agent) {
            $options[] = [
                'value' => $agent->id,
                'label' => $agent->display_name . ' (' . $agent->department . ')'
            ];
        }

        return $options;
    }

    /**
     * Get tag filter options
     */
    private function getTagFilterOptions(string $organizationId): array
    {
        // This would typically come from a tags table
        return [
            ['value' => 'urgent', 'label' => 'Urgent'],
            ['value' => 'follow_up', 'label' => 'Follow Up'],
            ['value' => 'complaint', 'label' => 'Complaint'],
            ['value' => 'inquiry', 'label' => 'Inquiry'],
            ['value' => 'support', 'label' => 'Support']
        ];
    }

    /**
     * Execute bulk action on conversation
     */
    private function executeBulkAction(ChatSession $conversation, string $action, array $actionData): array
    {
        switch ($action) {
            case 'assign':
                if (isset($actionData['agent_id'])) {
                    $agent = Agent::find($actionData['agent_id']);
                    if ($agent && $conversation->assignToAgent($agent)) {
                        return ['success' => true, 'message' => 'Conversation assigned successfully'];
                    }
                }
                return ['success' => false, 'message' => 'Failed to assign conversation'];

            case 'close':
                $conversation->update(['session_status' => 'closed', 'closed_at' => now()]);
                return ['success' => true, 'message' => 'Conversation closed successfully'];

            case 'escalate':
                $conversation->requestHumanIntervention($actionData['reason'] ?? 'Bulk escalation');
                return ['success' => true, 'message' => 'Conversation escalated successfully'];

            case 'change_priority':
                if (isset($actionData['priority'])) {
                    $conversation->update(['priority' => $actionData['priority']]);
                    return ['success' => true, 'message' => 'Priority updated successfully'];
                }
                return ['success' => false, 'message' => 'Priority not specified'];

            default:
                return ['success' => false, 'message' => 'Unknown action'];
        }
    }

    /**
     * Get agent name
     */
    private function getAgentName(string $agentId): string
    {
        $agent = Agent::find($agentId);
        return $agent ? $agent->display_name : 'Unknown Agent';
    }

    /**
     * Get agent department
     */
    private function getAgentDepartment(string $agentId): string
    {
        $agent = Agent::find($agentId);
        return $agent ? $agent->department : 'Unknown';
    }

    /**
     * Get conversation handling metrics
     */
    private function getConversationHandlingMetrics(string $agentId): array
    {
        // This would typically query conversation statistics
        return [
            'total_conversations' => 0,
            'resolved_conversations' => 0,
            'escalated_conversations' => 0,
            'resolution_rate' => 0.0
        ];
    }

    /**
     * Get response time metrics
     */
    private function getResponseTimeMetrics(string $agentId): array
    {
        // This would typically query response time statistics
        return [
            'average_response_time' => 0,
            'fastest_response' => 0,
            'slowest_response' => 0,
            'response_time_trend' => []
        ];
    }

    /**
     * Get customer satisfaction metrics
     */
    private function getCustomerSatisfactionMetrics(string $agentId): array
    {
        // This would typically query satisfaction ratings
        return [
            'average_rating' => 0.0,
            'total_ratings' => 0,
            'rating_distribution' => [],
            'satisfaction_trend' => []
        ];
    }

    /**
     * Get AI usage metrics
     */
    private function getAiUsageMetrics(string $agentId): array
    {
        // This would typically query AI usage statistics
        return [
            'ai_suggestions_used' => 0,
            'ai_adoption_rate' => 0.0,
            'ai_effectiveness' => 0.0
        ];
    }

    /**
     * Get skill development metrics
     */
    private function getSkillDevelopmentMetrics(string $agentId): array
    {
        // This would typically query skill development data
        return [
            'current_skills' => [],
            'skill_improvements' => [],
            'training_recommendations' => []
        ];
    }

    /**
     * Get performance trends
     */
    private function getPerformanceTrends(string $agentId): array
    {
        // This would typically query historical performance data
        return [
            'performance_trend' => [],
            'improvement_areas' => [],
            'strengths' => []
        ];
    }

    /**
     * Get performance recommendations
     */
    private function getPerformanceRecommendations(string $agentId): array
    {
        // This would typically use AI analysis to generate recommendations
        return [
            'improvement_suggestions' => [],
            'training_recommendations' => [],
            'best_practices' => []
        ];
    }

    /**
     * Get performance goals
     */
    private function getPerformanceGoals(string $agentId): array
    {
        // This would typically query goal setting data
        return [
            'current_goals' => [],
            'goal_progress' => [],
            'achieved_goals' => []
        ];
    }

    /**
     * Get template categories
     */
    private function getTemplateCategories(string $organizationId): array
    {
        // This would typically query template categories
        return [
            'greeting',
            'closing',
            'escalation',
            'follow_up',
            'technical_support',
            'billing',
            'general_inquiry'
        ];
    }
}
