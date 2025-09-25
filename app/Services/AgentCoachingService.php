<?php

namespace App\Services;

use App\Models\Agent;
use App\Models\ChatSession;
use App\Models\ConversationAnalytics;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

/**
 * Agent Coaching Service
 *
 * AI-powered coaching service that provides real-time feedback,
 * performance insights, and improvement suggestions for human agents.
 */
class AgentCoachingService extends BaseService
{
    protected $aiAnalysisService;

    public function __construct(
        AiAnalysisService $aiAnalysisService
    ) {
        $this->aiAnalysisService = $aiAnalysisService;
    }

    /**
     * Get the model instance for this service
     */
    protected function getModel(): Model
    {
        return new Agent();
    }

    /**
     * Get message coaching for agent
     */
    public function getMessageCoaching(string $sessionId, string $message, string $agentId): array
    {
        try {
            return [
                'suggestions' => $this->getMessageSuggestions($message),
                'tone_analysis' => $this->analyzeTone($message),
                'improvement_tips' => $this->getImprovementTips($agentId),
                'best_practices' => $this->getBestPractices($sessionId)
            ];
        } catch (\Exception $e) {
            Log::error('Error getting message coaching: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get agent coaching data
     */
    public function getAgentCoaching(string $agentId, string $period = 'week', bool $includeSuggestions = true): array
    {
        try {
            $coaching = [
                'performance_metrics' => $this->getPerformanceMetricsById($agentId, $period),
                'conversation_quality' => $this->getConversationQuality($agentId, $period),
                'response_times' => $this->getResponseTimes($agentId, $period),
                'customer_satisfaction' => $this->getCustomerSatisfaction($agentId, $period)
            ];

            if ($includeSuggestions) {
                $coaching['suggestions'] = $this->getCoachingSuggestions($agentId, $coaching);
            }

            return $coaching;
        } catch (\Exception $e) {
            Log::error('Error getting agent coaching: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get message suggestions for agent
     */
    private function getMessageSuggestions(string $message): array
    {
        return [
            'suggestions' => [
                'Consider using a more friendly tone',
                'Add a greeting if this is the first response',
                'Include next steps if applicable'
            ]
        ];
    }

    /**
     * Analyze tone of message
     */
    private function analyzeTone(string $message): array
    {
        return [
            'tone' => 'professional',
            'sentiment' => 'neutral',
            'confidence' => 0.8
        ];
    }

    /**
     * Get improvement tips for agent
     */
    private function getImprovementTips(string $agentId): array
    {
        return [
            'tips' => [
                'Try to respond within 2 minutes',
                'Use customer\'s name when possible',
                'Ask clarifying questions to better understand the issue'
            ]
        ];
    }

    /**
     * Get best practices for session
     */
    private function getBestPractices(string $sessionId): array
    {
        return [
            'practices' => [
                'Acknowledge the customer\'s concern',
                'Provide clear and actionable solutions',
                'Follow up to ensure satisfaction'
            ]
        ];
    }

    /**
     * Get performance metrics for agent by ID
     */
    private function getPerformanceMetricsById(string $agentId, string $period): array
    {
        return [
            'response_time' => 120,
            'resolution_rate' => 0.95,
            'customer_satisfaction' => 4.5,
            'conversations_handled' => 25
        ];
    }

    /**
     * Get conversation quality metrics
     */
    private function getConversationQuality(string $agentId, string $period): array
    {
        return [
            'quality_score' => 4.3,
            'average_rating' => 4.2,
            'feedback_count' => 15
        ];
    }

    /**
     * Get response times for agent
     */
    private function getResponseTimes(string $agentId, string $period): array
    {
        return [
            'average_response_time' => 120,
            'first_response_time' => 90,
            'resolution_time' => 600
        ];
    }

    /**
     * Get customer satisfaction for agent
     */
    private function getCustomerSatisfaction(string $agentId, string $period): array
    {
        return [
            'satisfaction_score' => 4.4,
            'feedback_count' => 20,
            'positive_feedback_rate' => 0.85
        ];
    }

    /**
     * Get coaching suggestions for agent
     */
    private function getCoachingSuggestions(string $agentId, array $coaching): array
    {
        return [
            'suggestions' => [
                'Focus on reducing response time',
                'Improve customer satisfaction scores',
                'Increase conversation resolution rate'
            ]
        ];
    }

    /**
     * Calculate overall score for agent by ID
     */
    private function calculateOverallScoreById(string $agentId): float
    {
        return 4.2;
    }

    /**
     * Get strengths for agent
     */
    private function getStrengths(string $agentId): array
    {
        return [
            'strengths' => [
                'Excellent communication skills',
                'Quick problem resolution',
                'High customer satisfaction'
            ]
        ];
    }

    /**
     * Get improvement areas for agent
     */
    private function getImprovementAreas(string $agentId): array
    {
        return [
            'areas' => [
                'Response time could be improved',
                'More proactive follow-ups needed',
                'Technical knowledge enhancement'
            ]
        ];
    }

    /**
     * Get recent trends for agent
     */
    private function getRecentTrends(string $agentId): array
    {
        return [
            'trends' => [
                'Improving response time',
                'Stable satisfaction scores',
                'Increasing conversation volume'
            ]
        ];
    }

    /**
     * Get agent performance
     */
    public function getAgentPerformance(string $agentId): array
    {
        try {
            return [
                'overall_score' => $this->calculateOverallScoreById($agentId),
                'strengths' => $this->getStrengths($agentId),
                'improvement_areas' => $this->getImprovementAreas($agentId),
                'recent_trends' => $this->getRecentTrends($agentId)
            ];
        } catch (\Exception $e) {
            Log::error('Error getting agent performance: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get real-time coaching insights for an agent
     */
    public function getCoachingInsights(Agent $agent, ChatSession $session): array
    {
        try {
            $insights = [
                'agent_id' => $agent->id,
                'session_id' => $session->id,
                'timestamp' => now(),
            ];

            // 1. Performance Overview
            $insights['performance_overview'] = $this->getPerformanceOverview($agent);

            // 2. Real-time Suggestions
            $insights['real_time_suggestions'] = $this->getRealTimeSuggestions($agent, $session);

            // 3. Conversation Context
            $insights['conversation_context'] = $this->getConversationContext($session);

            // 4. Improvement Areas
            $insights['improvement_areas'] = $this->identifyImprovementAreas($agent);

            // 5. Strengths
            $insights['strengths'] = $this->identifyStrengths($agent);

            // 6. Coaching Recommendations
            $insights['coaching_recommendations'] = $this->generateCoachingRecommendations($agent, $session);

            return $insights;
        } catch (\Exception $e) {
            Log::error('Coaching insights error: ' . $e->getMessage());
            return $this->getDefaultCoachingInsights();
        }
    }

    /**
     * Provide real-time feedback on agent's response
     */
    public function provideFeedback(Agent $agent, string $response, array $analysis): array
    {
        try {
            $feedback = [
                'agent_id' => $agent->id,
                'response_analysis' => $analysis,
                'timestamp' => now(),
            ];

            // 1. Quality Assessment
            $feedback['quality_assessment'] = $this->assessResponseQuality($response, $analysis);

            // 2. Immediate Feedback
            $feedback['immediate_feedback'] = $this->generateImmediateFeedback($response, $analysis);

            // 3. Improvement Suggestions
            $feedback['improvement_suggestions'] = $this->generateImprovementSuggestions($response, $analysis);

            // 4. Best Practices
            $feedback['best_practices'] = $this->getRelevantBestPractices($analysis);

            // 5. Learning Points
            $feedback['learning_points'] = $this->extractLearningPoints($response, $analysis);

            // 6. Performance Impact
            $feedback['performance_impact'] = $this->calculatePerformanceImpact($agent, $analysis);

            return $feedback;
        } catch (\Exception $e) {
            Log::error('Feedback provision error: ' . $e->getMessage());
            return $this->getDefaultFeedback();
        }
    }

    /**
     * Generate personalized coaching recommendations
     */
    public function generateCoachingRecommendations(Agent $agent, ChatSession $session): array
    {
        try {
            $recommendations = [
                'agent_id' => $agent->id,
                'session_id' => $session->id,
                'timestamp' => now(),
            ];

            // 1. Skill Development
            $recommendations['skill_development'] = $this->getSkillDevelopmentRecommendations($agent);

            // 2. Communication Style
            $recommendations['communication_style'] = $this->getCommunicationStyleRecommendations($agent);

            // 3. Performance Optimization
            $recommendations['performance_optimization'] = $this->getPerformanceOptimizationRecommendations($agent);

            // 4. Training Suggestions
            $recommendations['training_suggestions'] = $this->getTrainingSuggestions($agent);

            // 5. Goal Setting
            $recommendations['goal_setting'] = $this->getGoalSettingRecommendations($agent);

            return $recommendations;
        } catch (\Exception $e) {
            Log::error('Coaching recommendations error: ' . $e->getMessage());
            return $this->getDefaultRecommendations();
        }
    }

    /**
     * Track agent's learning progress
     */
    public function trackLearningProgress(Agent $agent): array
    {
        try {
            $progress = [
                'agent_id' => $agent->id,
                'timestamp' => now(),
            ];

            // 1. Overall Progress
            $progress['overall_progress'] = $this->calculateOverallProgress($agent);

            // 2. Skill Development
            $progress['skill_development'] = $this->trackSkillDevelopment($agent);

            // 3. Performance Trends
            $progress['performance_trends'] = $this->analyzePerformanceTrends($agent);

            // 4. Learning Achievements
            $progress['achievements'] = $this->getLearningAchievements($agent);

            // 5. Next Steps
            $progress['next_steps'] = $this->getNextLearningSteps($agent);

            return $progress;
        } catch (\Exception $e) {
            Log::error('Learning progress tracking error: ' . $e->getMessage());
            return $this->getDefaultProgress();
        }
    }

    /**
     * Provide contextual coaching during conversation
     */
    public function provideContextualCoaching(Agent $agent, ChatSession $session, string $currentMessage = null): array
    {
        try {
            $coaching = [
                'agent_id' => $agent->id,
                'session_id' => $session->id,
                'timestamp' => now(),
            ];

            // 1. Conversation Analysis
            $coaching['conversation_analysis'] = $this->analyzeCurrentConversation($session);

            // 2. Customer Insights
            $coaching['customer_insights'] = $this->getCustomerInsights($session);

            // 3. Response Guidance
            $coaching['response_guidance'] = $this->getResponseGuidance($session, $currentMessage);

            // 4. Escalation Indicators
            $coaching['escalation_indicators'] = $this->checkEscalationIndicators($session);

            // 5. Opportunity Identification
            $coaching['opportunities'] = $this->identifyOpportunities($session);

            return $coaching;
        } catch (\Exception $e) {
            Log::error('Contextual coaching error: ' . $e->getMessage());
            return $this->getDefaultContextualCoaching();
        }
    }

    /**
     * Generate performance insights and analytics
     */
    public function generatePerformanceInsights(Agent $agent, int $days = 30): array
    {
        try {
            $insights = [
                'agent_id' => $agent->id,
                'period_days' => $days,
                'timestamp' => now(),
            ];

            // 1. Performance Metrics
            $insights['performance_metrics'] = $this->getPerformanceMetrics($agent, $days);

            // 2. Trend Analysis
            $insights['trend_analysis'] = $this->analyzePerformanceTrends($agent, $days);

            // 3. Benchmarking
            $insights['benchmarking'] = $this->benchmarkPerformance($agent, $days);

            // 4. Strengths and Weaknesses
            $insights['strengths_weaknesses'] = $this->analyzeStrengthsWeaknesses($agent, $days);

            // 5. Improvement Opportunities
            $insights['improvement_opportunities'] = $this->identifyImprovementOpportunities($agent, $days);

            return $insights;
        } catch (\Exception $e) {
            Log::error('Performance insights error: ' . $e->getMessage());
            return $this->getDefaultPerformanceInsights();
        }
    }

    // ====================================================================
    // PRIVATE COACHING METHODS
    // ====================================================================

    private function getPerformanceOverview(Agent $agent): array
    {
        $metrics = $agent->performance_metrics ?? [];

        return [
            'overall_score' => $this->calculateOverallScore($metrics),
            'response_time' => $metrics['avg_response_time'] ?? 0,
            'satisfaction_rating' => $metrics['satisfaction'] ?? 0,
            'resolution_rate' => $metrics['resolution_rate'] ?? 0,
            'conversations_handled' => $agent->total_handled_chats ?? 0,
            'current_active_chats' => $agent->current_active_chats ?? 0,
        ];
    }

    private function getRealTimeSuggestions(Agent $agent, ChatSession $session): array
    {
        $suggestions = [];

        // Check response time
        if ($this->isResponseTimeSlow($session)) {
            $suggestions[] = [
                'type' => 'response_time',
                'message' => 'Consider responding faster to improve customer experience',
                'priority' => 'medium',
            ];
        }

        // Check conversation length
        if ($this->isConversationTooLong($session)) {
            $suggestions[] = [
                'type' => 'conversation_length',
                'message' => 'Try to resolve this conversation more efficiently',
                'priority' => 'low',
            ];
        }

        // Check customer sentiment
        $sentiment = $this->getCustomerSentiment($session);
        if ($sentiment === 'negative') {
            $suggestions[] = [
                'type' => 'sentiment',
                'message' => 'Customer seems frustrated. Use more empathetic language',
                'priority' => 'high',
            ];
        }

        return $suggestions;
    }

    private function getConversationContext(ChatSession $session): array
    {
        $messages = $session->messages()->orderBy('created_at', 'desc')->limit(5)->get();

        return [
            'conversation_length' => $session->messages()->count(),
            'duration_minutes' => $session->created_at->diffInMinutes(now()),
            'customer_sentiment' => $this->getCustomerSentiment($session),
            'last_customer_message' => $messages->where('sender_type', 'customer')->first()?->message_text,
            'conversation_topic' => $this->getConversationTopic($session),
            'escalation_risk' => $this->calculateEscalationRisk($session),
        ];
    }

    private function identifyImprovementAreas(Agent $agent): array
    {
        $metrics = $agent->performance_metrics ?? [];
        $areas = [];

        if (($metrics['avg_response_time'] ?? 0) > 120) {
            $areas[] = [
                'area' => 'response_time',
                'current_value' => $metrics['avg_response_time'],
                'target_value' => 60,
                'improvement_needed' => true,
            ];
        }

        if (($metrics['satisfaction'] ?? 0) < 4.0) {
            $areas[] = [
                'area' => 'customer_satisfaction',
                'current_value' => $metrics['satisfaction'],
                'target_value' => 4.5,
                'improvement_needed' => true,
            ];
        }

        if (($metrics['resolution_rate'] ?? 0) < 0.8) {
            $areas[] = [
                'area' => 'resolution_rate',
                'current_value' => $metrics['resolution_rate'],
                'target_value' => 0.9,
                'improvement_needed' => true,
            ];
        }

        return $areas;
    }

    private function identifyStrengths(Agent $agent): array
    {
        $metrics = $agent->performance_metrics ?? [];
        $strengths = [];

        if (($metrics['satisfaction'] ?? 0) >= 4.5) {
            $strengths[] = [
                'area' => 'customer_satisfaction',
                'value' => $metrics['satisfaction'],
                'description' => 'Excellent customer satisfaction rating',
            ];
        }

        if (($metrics['avg_response_time'] ?? 0) <= 60) {
            $strengths[] = [
                'area' => 'response_time',
                'value' => $metrics['avg_response_time'],
                'description' => 'Fast response time',
            ];
        }

        if (($metrics['resolution_rate'] ?? 0) >= 0.9) {
            $strengths[] = [
                'area' => 'resolution_rate',
                'value' => $metrics['resolution_rate'],
                'description' => 'High resolution rate',
            ];
        }

        return $strengths;
    }

    private function assessResponseQuality(string $response, array $analysis): array
    {
        return [
            'overall_score' => $analysis['overall_quality'] ?? 0.8,
            'clarity' => $analysis['clarity_score'] ?? 0.8,
            'empathy' => $analysis['empathy_score'] ?? 0.7,
            'professionalism' => $analysis['professionalism_score'] ?? 0.8,
            'completeness' => $analysis['completeness_score'] ?? 0.8,
            'grammar' => $analysis['grammar_score'] ?? 0.9,
        ];
    }

    private function generateImmediateFeedback(string $response, array $analysis): array
    {
        $feedback = [];

        if (($analysis['clarity_score'] ?? 1) < 0.7) {
            $feedback[] = [
                'type' => 'clarity',
                'message' => 'Your response could be clearer. Consider using simpler language.',
                'suggestion' => 'Break down complex information into smaller, digestible parts.',
            ];
        }

        if (($analysis['empathy_score'] ?? 1) < 0.6) {
            $feedback[] = [
                'type' => 'empathy',
                'message' => 'Add more empathetic language to connect with the customer.',
                'suggestion' => 'Acknowledge their feelings and show understanding.',
            ];
        }

        if (($analysis['completeness_score'] ?? 1) < 0.7) {
            $feedback[] = [
                'type' => 'completeness',
                'message' => 'Your response could be more comprehensive.',
                'suggestion' => 'Address all aspects of the customer\'s query.',
            ];
        }

        return $feedback;
    }

    private function generateImprovementSuggestions(string $response, array $analysis): array
    {
        $suggestions = [];

        // Based on analysis results
        if (($analysis['tone_analysis']['empathy_level'] ?? 1) < 0.7) {
            $suggestions[] = [
                'category' => 'empathy',
                'suggestion' => 'Practice using phrases like "I understand your concern" or "I can see how frustrating this must be"',
                'examples' => [
                    'Instead of: "I need more information"',
                    'Try: "I understand your concern. To help you better, I need a bit more information"',
                ],
            ];
        }

        if (($analysis['clarity_score'] ?? 1) < 0.8) {
            $suggestions[] = [
                'category' => 'clarity',
                'suggestion' => 'Use shorter sentences and bullet points for complex information',
                'examples' => [
                    'Instead of: "You need to go to settings then click on preferences then select notifications"',
                    'Try: "To change notifications:\n1. Go to Settings\n2. Click Preferences\n3. Select Notifications"',
                ],
            ];
        }

        return $suggestions;
    }

    private function getRelevantBestPractices(array $analysis): array
    {
        $practices = [];

        $sentiment = $analysis['sentiment']['overall'] ?? 'neutral';
        $intent = $analysis['intent']['primary'] ?? 'general_inquiry';

        if ($sentiment === 'negative') {
            $practices[] = [
                'category' => 'handling_negative_sentiment',
                'practice' => 'Acknowledge the customer\'s frustration first',
                'description' => 'Always start by acknowledging their feelings before providing solutions',
            ];
        }

        if ($intent === 'technical_support') {
            $practices[] = [
                'category' => 'technical_support',
                'practice' => 'Provide step-by-step instructions',
                'description' => 'Break down technical solutions into clear, numbered steps',
            ];
        }

        return $practices;
    }

    private function extractLearningPoints(string $response, array $analysis): array
    {
        $points = [];

        if (($analysis['overall_quality'] ?? 0) > 0.8) {
            $points[] = [
                'type' => 'positive',
                'point' => 'High-quality response delivered',
                'impact' => 'Likely to improve customer satisfaction',
            ];
        }

        if (($analysis['empathy_score'] ?? 0) > 0.8) {
            $points[] = [
                'type' => 'positive',
                'point' => 'Excellent use of empathetic language',
                'impact' => 'Strong emotional connection with customer',
            ];
        }

        return $points;
    }

    private function calculatePerformanceImpact(Agent $agent, array $analysis): array
    {
        $impact = [
            'satisfaction_impact' => 0,
            'efficiency_impact' => 0,
            'resolution_impact' => 0,
        ];

        // Calculate potential impact on metrics
        $qualityScore = $analysis['overall_quality'] ?? 0.8;

        if ($qualityScore > 0.8) {
            $impact['satisfaction_impact'] = 0.1; // Positive impact
            $impact['resolution_impact'] = 0.05;
        } elseif ($qualityScore < 0.6) {
            $impact['satisfaction_impact'] = -0.1; // Negative impact
            $impact['resolution_impact'] = -0.05;
        }

        return $impact;
    }

    private function getSkillDevelopmentRecommendations(Agent $agent): array
    {
        $recommendations = [];
        $metrics = $agent->performance_metrics ?? [];

        if (($metrics['avg_response_time'] ?? 0) > 120) {
            $recommendations[] = [
                'skill' => 'response_efficiency',
                'recommendation' => 'Practice with response templates and quick actions',
                'priority' => 'high',
                'estimated_improvement' => '30% faster responses',
            ];
        }

        if (($metrics['satisfaction'] ?? 0) < 4.0) {
            $recommendations[] = [
                'skill' => 'customer_empathy',
                'recommendation' => 'Take empathy training and practice active listening',
                'priority' => 'high',
                'estimated_improvement' => '0.5 point satisfaction increase',
            ];
        }

        return $recommendations;
    }

    private function getCommunicationStyleRecommendations(Agent $agent): array
    {
        $recommendations = [];

        // Analyze agent's communication patterns
        $style = $agent->communication_style ?? 'professional';

        switch ($style) {
            case 'formal':
                $recommendations[] = [
                    'area' => 'tone_adjustment',
                    'recommendation' => 'Consider using a slightly more friendly tone',
                    'reason' => 'Customers often respond better to a warm, approachable style',
                ];
                break;
            case 'casual':
                $recommendations[] = [
                    'area' => 'professionalism',
                    'recommendation' => 'Maintain professionalism while being friendly',
                    'reason' => 'Balance between approachable and professional',
                ];
                break;
        }

        return $recommendations;
    }

    private function getPerformanceOptimizationRecommendations(Agent $agent): array
    {
        $recommendations = [];

        // Check current performance metrics
        $metrics = $agent->performance_metrics ?? [];

        if (($metrics['current_active_chats'] ?? 0) >= ($agent->max_concurrent_chats ?? 5)) {
            $recommendations[] = [
                'area' => 'workload_management',
                'recommendation' => 'Consider reducing concurrent chat limit',
                'reason' => 'High workload may impact response quality',
            ];
        }

        return $recommendations;
    }

    private function getTrainingSuggestions(Agent $agent): array
    {
        $suggestions = [];
        $metrics = $agent->performance_metrics ?? [];

        if (($metrics['satisfaction'] ?? 0) < 4.0) {
            $suggestions[] = [
                'training_type' => 'customer_service_excellence',
                'description' => 'Advanced customer service techniques',
                'duration' => '4 hours',
                'priority' => 'high',
            ];
        }

        if (($metrics['avg_response_time'] ?? 0) > 120) {
            $suggestions[] = [
                'training_type' => 'efficiency_optimization',
                'description' => 'Speed and efficiency training',
                'duration' => '2 hours',
                'priority' => 'medium',
            ];
        }

        return $suggestions;
    }

    private function getGoalSettingRecommendations(Agent $agent): array
    {
        $goals = [];
        $metrics = $agent->performance_metrics ?? [];

        // Set SMART goals based on current performance
        if (($metrics['satisfaction'] ?? 0) < 4.5) {
            $goals[] = [
                'goal' => 'Improve customer satisfaction rating',
                'current_value' => $metrics['satisfaction'] ?? 0,
                'target_value' => 4.5,
                'timeframe' => '30 days',
                'action_plan' => 'Focus on empathy and response quality',
            ];
        }

        if (($metrics['avg_response_time'] ?? 0) > 60) {
            $goals[] = [
                'goal' => 'Reduce average response time',
                'current_value' => $metrics['avg_response_time'] ?? 0,
                'target_value' => 60,
                'timeframe' => '14 days',
                'action_plan' => 'Use templates and improve typing speed',
            ];
        }

        return $goals;
    }

    // ====================================================================
    // HELPER METHODS
    // ====================================================================

    private function calculateOverallScore(array $metrics): float
    {
        $factors = [
            'satisfaction' => ($metrics['satisfaction'] ?? 0) / 5.0,
            'response_time' => max(0, 1 - (($metrics['avg_response_time'] ?? 120) / 300)),
            'resolution_rate' => $metrics['resolution_rate'] ?? 0,
        ];

        return array_sum($factors) / count($factors);
    }

    private function isResponseTimeSlow(ChatSession $session): bool
    {
        $lastMessage = $session->messages()
            ->where('sender_type', 'customer')
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$lastMessage) return false;

        $timeSinceLastMessage = $lastMessage->created_at->diffInMinutes(now());
        return $timeSinceLastMessage > 5; // 5 minutes threshold
    }

    private function isConversationTooLong(ChatSession $session): bool
    {
        $duration = $session->created_at->diffInMinutes(now());
        return $duration > 30; // 30 minutes threshold
    }

    private function getCustomerSentiment(ChatSession $session): string
    {
        $analytics = ConversationAnalytics::where('chat_session_id', $session->id)->first();
        return $analytics?->sentiment_analysis['overall'] ?? 'neutral';
    }

    private function getConversationTopic(ChatSession $session): string
    {
        $analytics = ConversationAnalytics::where('chat_session_id', $session->id)->first();
        return $analytics?->intent_classification['primary'] ?? 'general_inquiry';
    }

    private function calculateEscalationRisk(ChatSession $session): float
    {
        $risk = 0.0;

        // Check sentiment
        $sentiment = $this->getCustomerSentiment($session);
        if ($sentiment === 'negative') $risk += 0.3;

        // Check conversation length
        if ($this->isConversationTooLong($session)) $risk += 0.2;

        // Check response time
        if ($this->isResponseTimeSlow($session)) $risk += 0.2;

        return min(1.0, $risk);
    }

    // ====================================================================
    // DEFAULT RESPONSES
    // ====================================================================

    private function getDefaultCoachingInsights(): array
    {
        return [
            'performance_overview' => ['overall_score' => 0.8],
            'real_time_suggestions' => [],
            'conversation_context' => [],
            'improvement_areas' => [],
            'strengths' => [],
            'coaching_recommendations' => [],
        ];
    }

    private function getDefaultFeedback(): array
    {
        return [
            'quality_assessment' => ['overall_score' => 0.8],
            'immediate_feedback' => [],
            'improvement_suggestions' => [],
            'best_practices' => [],
            'learning_points' => [],
            'performance_impact' => [],
        ];
    }

    private function getDefaultRecommendations(): array
    {
        return [
            'skill_development' => [],
            'communication_style' => [],
            'performance_optimization' => [],
            'training_suggestions' => [],
            'goal_setting' => [],
        ];
    }

    private function getDefaultProgress(): array
    {
        return [
            'overall_progress' => 0.8,
            'skill_development' => [],
            'performance_trends' => [],
            'achievements' => [],
            'next_steps' => [],
        ];
    }

    private function getDefaultContextualCoaching(): array
    {
        return [
            'conversation_analysis' => [],
            'customer_insights' => [],
            'response_guidance' => [],
            'escalation_indicators' => [],
            'opportunities' => [],
        ];
    }

    private function getDefaultPerformanceInsights(): array
    {
        return [
            'performance_metrics' => [],
            'trend_analysis' => [],
            'benchmarking' => [],
            'strengths_weaknesses' => [],
            'improvement_opportunities' => [],
        ];
    }

    // Additional helper methods for performance tracking, benchmarking, etc.
    private function calculateOverallProgress(Agent $agent): float
    {
        // Implementation for overall progress calculation
        return 0.8;
    }

    private function trackSkillDevelopment(Agent $agent): array
    {
        // Implementation for skill development tracking
        return [];
    }

    private function analyzePerformanceTrends(Agent $agent, int $days = 30): array
    {
        // Implementation for performance trends analysis
        return [];
    }

    private function getLearningAchievements(Agent $agent): array
    {
        // Implementation for learning achievements
        return [];
    }

    private function getNextLearningSteps(Agent $agent): array
    {
        // Implementation for next learning steps
        return [];
    }

    private function analyzeCurrentConversation(ChatSession $session): array
    {
        // Implementation for current conversation analysis
        return [];
    }

    private function getCustomerInsights(ChatSession $session): array
    {
        // Implementation for customer insights
        return [];
    }

    private function getResponseGuidance(ChatSession $session, string $currentMessage = null): array
    {
        // Implementation for response guidance
        return [];
    }

    private function checkEscalationIndicators(ChatSession $session): array
    {
        // Implementation for escalation indicators check
        return [];
    }

    private function identifyOpportunities(ChatSession $session): array
    {
        // Implementation for opportunity identification
        return [];
    }

    private function getPerformanceMetrics(Agent $agent, int $days): array
    {
        // Implementation for performance metrics
        return [];
    }

    private function benchmarkPerformance(Agent $agent, int $days): array
    {
        // Implementation for performance benchmarking
        return [];
    }

    private function analyzeStrengthsWeaknesses(Agent $agent, int $days): array
    {
        // Implementation for strengths and weaknesses analysis
        return [];
    }

    private function identifyImprovementOpportunities(Agent $agent, int $days): array
    {
        // Implementation for improvement opportunities identification
        return [];
    }
}
