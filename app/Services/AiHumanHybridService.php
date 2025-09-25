<?php

namespace App\Services;

use App\Models\ChatSession;
use App\Models\Message;
use App\Models\Agent;
use App\Models\BotPersonality;
use App\Models\ConversationAnalytics;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

/**
 * AI-Human Hybrid Service
 *
 * Modern service that combines AI and human agents in a seamless workflow
 * where AI acts as a copilot to enhance human agent capabilities.
 */
class AiHumanHybridService extends BaseService
{
    protected $aiAnalysisService;
    protected $agentCoachingService;

    public function __construct(
        AiAnalysisService $aiAnalysisService,
        AgentCoachingService $agentCoachingService
    ) {
        $this->aiAnalysisService = $aiAnalysisService;
        $this->agentCoachingService = $agentCoachingService;
    }

    /**
     * Get the model instance for this service
     */
    protected function getModel(): Model
    {
        return new ChatSession();
    }


    /**
     * Get real-time alerts
     */

    /**
     * Process incoming customer message with AI analysis
     */
    public function processCustomerMessage(ChatSession $session, Message $message): array
    {
        try {
            // 1. AI Analysis Phase
            $aiAnalysis = $this->aiAnalysisService->analyzeMessage($message);

            // 2. Update conversation analytics
            $this->updateConversationAnalytics($session, $aiAnalysis);

            // 3. Determine routing strategy
            $routingDecision = $this->determineRoutingStrategy($session, $aiAnalysis);

            // 4. Execute routing
            $result = $this->executeRouting($session, $routingDecision, $aiAnalysis);

            return [
                'success' => true,
                'routing_decision' => $routingDecision,
                'ai_analysis' => $aiAnalysis,
                'result' => $result,
            ];
        } catch (\Exception $e) {
            Log::error('AI-Human Hybrid processing error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Generate AI-powered response suggestions for human agents
     */
    public function generateResponseSuggestions(ChatSession $session, Agent $agent, string $context = null): array
    {
        try {
            // Get conversation context
            $conversationContext = $this->getConversationContext($session);

            // Get agent's writing style and preferences
            $agentProfile = $this->getAgentProfile($agent);

            // Generate AI suggestions
            $suggestions = $this->aiAnalysisService->generateResponseSuggestions(
                $conversationContext,
                $agentProfile,
                $context
            );

            // Add coaching insights
            $coachingInsights = $this->agentCoachingService->getCoachingInsights($agent, $session);

            return [
                'success' => true,
                'suggestions' => $suggestions,
                'coaching_insights' => $coachingInsights,
                'conversation_context' => $conversationContext,
            ];
        } catch (\Exception $e) {
            Log::error('Response suggestions generation error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Process agent response with AI assistance
     */
    public function processAgentResponse(ChatSession $session, Agent $agent, string $response, array $options = []): array
    {
        try {
            // AI analysis of agent's response
            $responseAnalysis = $this->aiAnalysisService->analyzeAgentResponse($response, $session);

            // Quality scoring
            $qualityScore = $this->calculateResponseQuality($response, $responseAnalysis);

            // Coaching feedback
            $coachingFeedback = $this->agentCoachingService->provideFeedback($agent, $response, $responseAnalysis);

            // Learning update
            $this->updateAgentLearning($agent, $response, $responseAnalysis);

            return [
                'success' => true,
                'response_analysis' => $responseAnalysis,
                'quality_score' => $qualityScore,
                'coaching_feedback' => $coachingFeedback,
                'improvement_suggestions' => $this->getImprovementSuggestions($responseAnalysis),
            ];
        } catch (\Exception $e) {
            Log::error('Agent response processing error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Smart conversation routing with AI intelligence
     */
    public function smartRouteConversation(ChatSession $session, array $aiAnalysis): array
    {
        try {
            // Get available agents
            $availableAgents = $this->getAvailableAgents($session->organization_id)->toArray();

            // Score each agent for this conversation
            $agentScores = $this->scoreAgentsForConversation($availableAgents, $session, $aiAnalysis);

            // Select best agent
            $selectedAgent = $this->selectBestAgent($agentScores);

            // Create assignment with AI context
            $assignment = $this->createIntelligentAssignment($session, $selectedAgent, $aiAnalysis);

            return [
                'success' => true,
                'selected_agent' => $selectedAgent,
                'assignment' => $assignment,
                'agent_scores' => $agentScores,
                'routing_reason' => $this->getRoutingReason($selectedAgent, $aiAnalysis),
            ];
        } catch (\Exception $e) {
            Log::error('Smart routing error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Real-time conversation monitoring and alerts
     */
    public function monitorConversation(ChatSession $session): array
    {
        try {
            $monitoring = [
                'sentiment_trend' => $this->analyzeSentimentTrend($session),
                'escalation_risk' => $this->calculateEscalationRisk($session),
                'response_time_alert' => $this->checkResponseTimeAlert($session),
                'quality_indicators' => $this->getQualityIndicators($session),
                'coaching_opportunities' => $this->identifyCoachingOpportunities($session),
            ];

            // Send alerts if needed
            $alerts = $this->processAlerts($session, $monitoring);

            return [
                'success' => true,
                'monitoring' => $monitoring,
                'alerts' => $alerts,
            ];
        } catch (\Exception $e) {
            Log::error('Conversation monitoring error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Predictive analytics for conversation outcomes
     */
    public function predictConversationOutcome(ChatSession $session): array
    {
        try {
            $prediction = [
                'resolution_probability' => $this->calculateResolutionProbability($session),
                'estimated_resolution_time' => $this->estimateResolutionTime($session),
                'satisfaction_prediction' => $this->predictSatisfaction($session),
                'escalation_probability' => $this->calculateEscalationProbability($session),
                'upselling_opportunity' => $this->identifyUpsellingOpportunity($session),
            ];

            return [
                'success' => true,
                'prediction' => $prediction,
                'confidence_score' => $this->calculatePredictionConfidence($prediction),
            ];
        } catch (\Exception $e) {
            Log::error('Prediction error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    // ====================================================================
    // PRIVATE HELPER METHODS
    // ====================================================================

    private function determineRoutingStrategy(ChatSession $session, array $aiAnalysis): array
    {
        $complexity = $aiAnalysis['complexity_score'] ?? 0.5;
        $sentiment = $aiAnalysis['sentiment']['overall'] ?? 'neutral';
        $urgency = $aiAnalysis['urgency_score'] ?? 0.5;

        // Determine if human intervention is needed
        $needsHuman = $complexity > 0.7 ||
                     $sentiment === 'negative' ||
                     $urgency > 0.8 ||
                     $aiAnalysis['intent']['requires_human'] ?? false;

        return [
            'needs_human' => $needsHuman,
            'priority' => $this->calculatePriority($complexity, $sentiment, $urgency),
            'suggested_agent_skills' => $this->getRequiredSkills($aiAnalysis),
            'estimated_handling_time' => $this->estimateHandlingTime($complexity),
        ];
    }

    private function executeRouting(ChatSession $session, array $routingDecision, array $aiAnalysis): array
    {
        if ($routingDecision['needs_human']) {
            // Route to human agent with AI assistance
            return $this->routeToHumanAgent($session, $routingDecision, $aiAnalysis);
        } else {
            // Handle with AI bot
            return $this->routeToAiBot($session, $aiAnalysis);
        }
    }

    private function routeToHumanAgent(ChatSession $session, array $routingDecision, array $aiAnalysis): array
    {
        // Smart routing to best available agent
        $routingResult = $this->smartRouteConversation($session, $aiAnalysis);

        if ($routingResult['success']) {
            // Create AI context for agent
            $aiContext = $this->createAiContextForAgent($session, $aiAnalysis);

            return [
                'type' => 'human_agent',
                'agent' => $routingResult['selected_agent'],
                'ai_context' => $aiContext,
                'routing_reason' => $routingResult['routing_reason'],
            ];
        }

        return [
            'type' => 'queue',
            'message' => 'No available agents, added to queue',
        ];
    }

    private function routeToAiBot(ChatSession $session, array $aiAnalysis): array
    {
        // Generate AI response
        $aiResponse = $this->aiAnalysisService->generateBotResponse($session, $aiAnalysis);

        return [
            'type' => 'ai_bot',
            'response' => $aiResponse,
            'confidence' => $aiAnalysis['confidence_score'] ?? 0.8,
        ];
    }

    private function getConversationContext(ChatSession $session): array
    {
        $messages = $session->messages()
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $analytics = ConversationAnalytics::where('chat_session_id', $session->id)->first();

        return [
            'recent_messages' => $messages,
            'customer_profile' => [
                'name' => $session->customer_name,
                'phone' => $session->customer_phone,
                'email' => $session->customer_email,
                'metadata' => $session->customer_metadata,
            ],
            'conversation_analytics' => $analytics,
            'session_context' => [
                'channel' => $session->channelConfig->channel ?? 'unknown',
                'priority' => $session->priority,
                'status' => $session->session_status,
                'duration' => $session->created_at->diffInMinutes(now()),
            ],
        ];
    }

    private function getAgentProfile(Agent $agent): array
    {
        return [
            'id' => $agent->id,
            'name' => $agent->display_name,
            'skills' => $agent->skills ?? [],
            'languages' => $agent->languages ?? ['indonesia'],
            'specialization' => $agent->specialization ?? [],
            'communication_style' => $agent->communication_style ?? 'professional',
            'response_templates' => $this->getAgentTemplates($agent),
            'performance_metrics' => $agent->performance_metrics ?? [],
        ];
    }

    private function getAgentTemplates(Agent $agent): array
    {
        return \App\Models\AgentMessageTemplate::where('created_by_agent_id', $agent->id)
            ->orWhere('is_public', true)
            ->where('is_active', true)
            ->get()
            ->toArray();
    }

    private function calculateResponseQuality(string $response, array $analysis): float
    {
        $factors = [
            'clarity' => $analysis['clarity_score'] ?? 0.8,
            'tone' => $analysis['tone_appropriateness'] ?? 0.8,
            'completeness' => $analysis['completeness_score'] ?? 0.8,
            'empathy' => $analysis['empathy_score'] ?? 0.8,
        ];

        return array_sum($factors) / count($factors);
    }


    private function scoreAgentsForConversation(array $agents, ChatSession $session, array $aiAnalysis): array
    {
        $scores = [];

        foreach ($agents as $agent) {
            $score = 0;

            // Skill matching
            $requiredSkills = $this->getRequiredSkills($aiAnalysis);
            $agentSkills = $agent['skills'] ?? [];
            $skillMatch = count(array_intersect($requiredSkills, $agentSkills)) / max(count($requiredSkills), 1);
            $score += $skillMatch * 0.3;

            // Language matching
            $customerLanguage = $aiAnalysis['language'] ?? 'indonesia';
            $agentLanguages = $agent['languages'] ?? ['indonesia'];
            $languageMatch = in_array($customerLanguage, $agentLanguages) ? 1 : 0;
            $score += $languageMatch * 0.2;

            // Performance score
            $performanceScore = $agent['performance_metrics']['satisfaction'] ?? 0.8;
            $score += $performanceScore * 0.2;

            // Availability score
            $availability = $agent['availability'];
            $capacityScore = 1 - ($availability['current_active_chats'] / $availability['max_concurrent_chats']);
            $score += $capacityScore * 0.2;

            // Response time score
            $responseTimeScore = $this->calculateResponseTimeScore($agent);
            $score += $responseTimeScore * 0.1;

            $scores[] = [
                'agent' => $agent,
                'score' => $score,
                'breakdown' => [
                    'skill_match' => $skillMatch,
                    'language_match' => $languageMatch,
                    'performance' => $performanceScore,
                    'capacity' => $capacityScore,
                    'response_time' => $responseTimeScore,
                ],
            ];
        }

        // Sort by score descending
        usort($scores, function ($a, $b) {
            return $b['score'] <=> $a['score'];
        });

        return $scores;
    }

    private function selectBestAgent(array $agentScores): ?array
    {
        return !empty($agentScores) ? $agentScores[0]['agent'] : null;
    }

    private function createIntelligentAssignment(ChatSession $session, array $agent, array $aiAnalysis): array
    {
        return [
            'session_id' => $session->id,
            'agent_id' => $agent['id'],
            'ai_context' => $aiAnalysis,
            'priority' => $this->calculatePriority(
                $aiAnalysis['complexity_score'] ?? 0.5,
                $aiAnalysis['sentiment']['overall'] ?? 'neutral',
                $aiAnalysis['urgency_score'] ?? 0.5
            ),
            'estimated_handling_time' => $this->estimateHandlingTime($aiAnalysis['complexity_score'] ?? 0.5),
            'required_skills' => $this->getRequiredSkills($aiAnalysis),
            'coaching_notes' => $this->generateCoachingNotes($agent, $aiAnalysis),
        ];
    }

    private function getRequiredSkills(array $aiAnalysis): array
    {
        $skills = [];

        // Based on intent
        $intent = $aiAnalysis['intent']['primary'] ?? '';
        switch ($intent) {
            case 'technical_support':
                $skills[] = 'technical';
                break;
            case 'billing':
                $skills[] = 'billing';
                break;
            case 'sales':
                $skills[] = 'sales';
                break;
            case 'complaint':
                $skills[] = 'conflict_resolution';
                break;
        }

        // Based on sentiment
        $sentiment = $aiAnalysis['sentiment']['overall'] ?? 'neutral';
        if ($sentiment === 'negative') {
            $skills[] = 'empathy';
            $skills[] = 'conflict_resolution';
        }

        // Based on complexity
        $complexity = $aiAnalysis['complexity_score'] ?? 0.5;
        if ($complexity > 0.7) {
            $skills[] = 'senior_support';
        }

        return array_unique($skills);
    }

    private function calculatePriority(float $complexity, string $sentiment, float $urgency): string
    {
        $score = 0;

        // Complexity weight
        $score += $complexity * 0.3;

        // Sentiment weight
        $sentimentScore = match($sentiment) {
            'negative' => 0.8,
            'neutral' => 0.5,
            'positive' => 0.2,
            default => 0.5,
        };
        $score += $sentimentScore * 0.4;

        // Urgency weight
        $score += $urgency * 0.3;

        return match(true) {
            $score >= 0.8 => 'urgent',
            $score >= 0.6 => 'high',
            $score >= 0.4 => 'medium',
            default => 'low',
        };
    }

    private function estimateHandlingTime(float $complexity): int
    {
        // Base time in minutes
        $baseTime = 5;

        // Add complexity factor
        $complexityTime = $complexity * 15;

        return (int) ($baseTime + $complexityTime);
    }

    private function calculateResponseTimeScore(array $agent): float
    {
        $avgResponseTime = $agent['performance_metrics']['avg_response_time'] ?? 120; // seconds

        // Score based on response time (lower is better)
        if ($avgResponseTime <= 30) return 1.0;
        if ($avgResponseTime <= 60) return 0.8;
        if ($avgResponseTime <= 120) return 0.6;
        if ($avgResponseTime <= 300) return 0.4;
        return 0.2;
    }

    private function createAiContextForAgent(ChatSession $session, array $aiAnalysis): array
    {
        return [
            'customer_sentiment' => $aiAnalysis['sentiment'],
            'intent_analysis' => $aiAnalysis['intent'],
            'complexity_score' => $aiAnalysis['complexity_score'],
            'urgency_score' => $aiAnalysis['urgency_score'],
            'suggested_approach' => $this->getSuggestedApproach($aiAnalysis),
            'key_points' => $aiAnalysis['key_points'] ?? [],
            'previous_context' => $this->getPreviousContext($session),
            'recommended_templates' => $this->getRecommendedTemplates($aiAnalysis),
        ];
    }

    private function getSuggestedApproach(array $aiAnalysis): string
    {
        $sentiment = $aiAnalysis['sentiment']['overall'] ?? 'neutral';
        $intent = $aiAnalysis['intent']['primary'] ?? '';

        if ($sentiment === 'negative') {
            return 'Start with empathy and acknowledgment. Focus on resolving the issue quickly.';
        }

        if ($intent === 'technical_support') {
            return 'Provide step-by-step guidance. Ask clarifying questions if needed.';
        }

        if ($intent === 'billing') {
            return 'Be transparent about charges. Provide clear explanations and options.';
        }

        return 'Be helpful and professional. Provide clear and accurate information.';
    }

    private function getPreviousContext(ChatSession $session): array
    {
        $messages = $session->messages()
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['sender_type', 'message_text', 'created_at']);

        return $messages->map(function ($message) {
            return [
                'type' => $message->sender_type,
                'text' => $message->message_text,
                'time' => $message->created_at->format('H:i'),
            ];
        })->toArray();
    }

    private function getRecommendedTemplates(array $aiAnalysis): array
    {
        $intent = $aiAnalysis['intent']['primary'] ?? '';
        $sentiment = $aiAnalysis['sentiment']['overall'] ?? 'neutral';

        $templates = [];

        // Add templates based on intent
        switch ($intent) {
            case 'greeting':
                $templates[] = 'greeting_welcome';
                break;
            case 'technical_support':
                $templates[] = 'technical_assistance';
                break;
            case 'billing':
                $templates[] = 'billing_inquiry';
                break;
            case 'complaint':
                $templates[] = 'complaint_acknowledgment';
                break;
        }

        // Add templates based on sentiment
        if ($sentiment === 'negative') {
            $templates[] = 'empathy_response';
        }

        return $templates;
    }

    private function getRoutingReason(array $agent, array $aiAnalysis): string
    {
        $reasons = [];

        if (!empty($agent['skills'])) {
            $reasons[] = "Skills match: " . implode(', ', $agent['skills']);
        }

        if (isset($aiAnalysis['sentiment']['overall']) && $aiAnalysis['sentiment']['overall'] === 'negative') {
            $reasons[] = "Handles negative sentiment well";
        }

        if (isset($agent['performance_metrics']['satisfaction']) && $agent['performance_metrics']['satisfaction'] > 0.8) {
            $reasons[] = "High customer satisfaction rating";
        }

        return !empty($reasons) ? implode('. ', $reasons) : "Best available agent";
    }

    private function updateConversationAnalytics(ChatSession $session, array $aiAnalysis): void
    {
        $analytics = ConversationAnalytics::firstOrCreate(
            ['chat_session_id' => $session->id],
            ['organization_id' => $session->organization_id]
        );

        $analytics->update([
            'sentiment_analysis' => $aiAnalysis['sentiment'] ?? null,
            'intent_classification' => $aiAnalysis['intent'] ?? null,
            'topic_extraction' => $aiAnalysis['topics'] ?? null,
        ]);
    }

    private function updateAgentLearning(Agent $agent, string $response, array $analysis): void
    {
        // Update agent's learning profile based on response quality
        $qualityScore = $this->calculateResponseQuality($response, $analysis);

        // Store learning data for future model training
        Cache::put("agent_learning_{$agent->id}_" . now()->format('Y-m-d'), [
            'response_quality' => $qualityScore,
            'analysis' => $analysis,
            'timestamp' => now(),
        ], 86400); // 24 hours
    }

    private function getImprovementSuggestions(array $analysis): array
    {
        $suggestions = [];

        if (($analysis['clarity_score'] ?? 1) < 0.7) {
            $suggestions[] = "Consider using simpler language for better clarity";
        }

        if (($analysis['empathy_score'] ?? 1) < 0.7) {
            $suggestions[] = "Add more empathetic language to connect with the customer";
        }

        if (($analysis['completeness_score'] ?? 1) < 0.7) {
            $suggestions[] = "Provide more comprehensive information to fully address the query";
        }

        return $suggestions;
    }

    // Additional helper methods for monitoring, prediction, etc.
    private function analyzeSentimentTrend(ChatSession $session): array
    {
        // Implementation for sentiment trend analysis
        return ['trend' => 'stable', 'confidence' => 0.8];
    }

    private function calculateEscalationRisk(ChatSession $session): float
    {
        // Implementation for escalation risk calculation
        return 0.3;
    }

    private function checkResponseTimeAlert(ChatSession $session): bool
    {
        // Implementation for response time alert checking
        return false;
    }

    private function getQualityIndicators(ChatSession $session): array
    {
        // Implementation for quality indicators
        return ['response_time' => 'good', 'satisfaction' => 'high'];
    }

    private function identifyCoachingOpportunities(ChatSession $session): array
    {
        // Implementation for coaching opportunities identification
        return [];
    }

    private function processAlerts(ChatSession $session, array $monitoring): array
    {
        // Implementation for alert processing
        return [];
    }

    private function calculateResolutionProbability(ChatSession $session): float
    {
        // Implementation for resolution probability calculation
        return 0.85;
    }

    private function estimateResolutionTime(ChatSession $session): int
    {
        // Implementation for resolution time estimation
        return 15; // minutes
    }

    private function predictSatisfaction(ChatSession $session): float
    {
        // Implementation for satisfaction prediction
        return 4.2; // out of 5
    }

    private function calculateEscalationProbability(ChatSession $session): float
    {
        // Implementation for escalation probability calculation
        return 0.15;
    }

    private function identifyUpsellingOpportunity(ChatSession $session): array
    {
        // Implementation for upselling opportunity identification
        return ['opportunity' => false, 'confidence' => 0.3];
    }

    private function calculatePredictionConfidence(array $prediction): float
    {
        // Implementation for prediction confidence calculation
        return 0.8;
    }

    private function generateCoachingNotes(array $agent, array $aiAnalysis): array
    {
        // Implementation for coaching notes generation
        return [
            'focus_areas' => ['empathy', 'clarity'],
            'strengths' => ['technical_knowledge'],
            'suggestions' => ['Use more empathetic language'],
        ];
    }

    // ====================================================================
    // ENHANCED AGENT ASSIGNMENT METHODS
    // ====================================================================

    /**
     * Get available agents with enhanced filtering
     */
    public function getAvailableAgents(string $organizationId, array $filters = []): \Illuminate\Database\Eloquent\Collection
    {
        $query = Agent::where('organization_id', $organizationId)
            ->where('status', 'active');

        // Apply filters
        if (isset($filters['skills']) && !empty($filters['skills'])) {
            $query->whereJsonContains('skills', $filters['skills']);
        }

        if (isset($filters['languages']) && !empty($filters['languages'])) {
            $query->whereJsonContains('languages', $filters['languages']);
        }

        if (isset($filters['availability_status'])) {
            $query->where('availability_status', $filters['availability_status']);
        }

        if (isset($filters['department'])) {
            $query->where('department', $filters['department']);
        }

        if (isset($filters['exclude_agent_id'])) {
            $query->where('id', '!=', $filters['exclude_agent_id']);
        }

        if (isset($filters['max_concurrent_chats'])) {
            $query->where('max_concurrent_chats', '>=', $filters['max_concurrent_chats']);
        }

        return $query->get();
    }

    /**
     * Get assignment rules for organization
     */
    public function getAssignmentRules(string $organizationId): array
    {
        // This would typically come from database configuration
        return [
            'default_rules' => [
                'skill_matching_weight' => 0.3,
                'workload_balancing_weight' => 0.25,
                'performance_weight' => 0.2,
                'availability_weight' => 0.15,
                'language_matching_weight' => 0.1
            ],
            'escalation_rules' => [
                'auto_escalate_after_minutes' => 5,
                'escalate_high_priority' => true,
                'escalate_negative_sentiment' => true
            ],
            'capacity_rules' => [
                'max_concurrent_chats_per_agent' => 5,
                'reserve_capacity_percentage' => 20
            ]
        ];
    }

    /**
     * Get optimal agent for transfer
     */
    public function getOptimalAgentForTransfer(string $organizationId, array $conversationContext): ?Agent
    {
        $availableAgents = $this->getAvailableAgents($organizationId);

        if ($availableAgents->isEmpty()) {
            return null;
        }

        $bestAgent = null;
        $bestScore = 0;

        foreach ($availableAgents as $agent) {
            $score = $this->calculateAgentScore($agent, $conversationContext);

            if ($score > $bestScore) {
                $bestScore = $score;
                $bestAgent = $agent;
            }
        }

        return $bestAgent;
    }

    /**
     * Get real-time alerts
     */
    public function getRealTimeAlerts(string $organizationId): array
    {
        // This would typically query real-time alerts from database
        return [
            'high_priority_conversations' => 3,
            'overdue_conversations' => 1,
            'agent_capacity_alerts' => 2,
            'escalation_alerts' => 0,
            'system_alerts' => []
        ];
    }

    /**
     * Calculate agent score for conversation assignment
     */
    private function calculateAgentScore(Agent $agent, array $conversationContext): float
    {
        $score = 0;

        // Skill matching (30% weight)
        if (isset($conversationContext['required_skills'])) {
            $skillMatch = $this->calculateSkillMatch($agent, $conversationContext['required_skills']);
            $score += $skillMatch * 0.3;
        }

        // Workload balancing (25% weight)
        $capacityUtilization = $agent->max_concurrent_chats > 0 ?
            $agent->current_active_chats / $agent->max_concurrent_chats : 0;
        $workloadScore = 1 - $capacityUtilization; // Lower utilization = higher score
        $score += $workloadScore * 0.25;

        // Performance metrics (20% weight)
        $performanceScore = $this->calculatePerformanceScore($agent);
        $score += $performanceScore * 0.2;

        // Availability (15% weight)
        $availabilityScore = $agent->availability_status === 'online' ? 1.0 : 0.5;
        $score += $availabilityScore * 0.15;

        // Language matching (10% weight)
        if (isset($conversationContext['customer_language'])) {
            $languageMatch = $this->calculateLanguageMatch($agent, $conversationContext['customer_language']);
            $score += $languageMatch * 0.1;
        }

        return $score;
    }

    /**
     * Calculate skill match between agent and required skills
     */
    private function calculateSkillMatch(Agent $agent, array $requiredSkills): float
    {
        $agentSkills = $agent->skills ?? [];
        $matchedSkills = array_intersect($agentSkills, $requiredSkills);

        return count($requiredSkills) > 0 ? count($matchedSkills) / count($requiredSkills) : 0;
    }

    /**
     * Calculate performance score for agent
     */
    private function calculatePerformanceScore(Agent $agent): float
    {
        $metrics = $agent->performance_metrics ?? [];

        $rating = $metrics['rating'] ?? 0;
        $resolutionRate = $metrics['resolution_rate'] ?? 0;
        $responseTime = $metrics['avg_response_time'] ?? 0;

        // Normalize scores (assuming rating is 0-5, resolution rate is 0-1, response time is in minutes)
        $ratingScore = $rating / 5;
        $resolutionScore = $resolutionRate;
        $responseTimeScore = max(0, 1 - ($responseTime / 10)); // Penalty for slow response

        return ($ratingScore + $resolutionScore + $responseTimeScore) / 3;
    }

    /**
     * Calculate language match between agent and customer language
     */
    private function calculateLanguageMatch(Agent $agent, string $customerLanguage): float
    {
        $agentLanguages = $agent->languages ?? [];

        return in_array($customerLanguage, $agentLanguages) ? 1.0 : 0.0;
    }
}
