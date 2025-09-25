<?php

namespace App\Services;

use App\Models\BotPersonality;
use App\Models\ChatSession;
use App\Models\Message;
use App\Models\Customer;
use App\Models\AiModel;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class BotPersonalityService
{
    /**
     * Get all bot personalities for organization
     */
    public function getPersonalitiesForInbox(Request $request, string $organizationId): LengthAwarePaginator
    {
        $query = BotPersonality::query()
            ->where('organization_id', $organizationId)
            ->where('status', 'active');

        // Apply search filter
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('display_name', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        // Apply language filter
        if ($request->has('language')) {
            $query->where('language', $request->get('language'));
        }

        // Apply AI model filter
        if ($request->has('ai_model_id')) {
            $query->where('ai_model_id', $request->get('ai_model_id'));
        }

        // Apply performance filter
        if ($request->has('min_performance')) {
            $minScore = $request->get('min_performance');
            $query->whereRaw('(avg_satisfaction_score * 20 * 0.6 + success_rate * 0.4) >= ?', [$minScore]);
        }

        // Apply learning enabled filter
        if ($request->has('learning_enabled')) {
            $query->where('learning_enabled', $request->get('learning_enabled'));
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'performance');
        $sortDirection = $request->get('sort_direction', 'desc');

        switch ($sortBy) {
            case 'performance':
                $query->orderByRaw('(avg_satisfaction_score * 20 * 0.6 + success_rate * 0.4) DESC');
                break;
            case 'usage':
                $query->orderBy('total_conversations', $sortDirection);
                break;
            case 'name':
                $query->orderBy('name', $sortDirection);
                break;
            case 'created_at':
                $query->orderBy('created_at', $sortDirection);
                break;
            default:
                $query->orderBy('created_at', 'desc');
        }

        // Apply pagination
        $perPage = $request->get('per_page', 15);
        return $query->with(['aiModel', 'n8nWorkflow', 'wahaSession', 'knowledgeBaseItem'])
                    ->paginate($perPage);
    }

    /**
     * Get bot personality by ID for inbox
     */
    public function getPersonalityForInbox(string $id, string $organizationId): ?BotPersonality
    {
        return BotPersonality::where('id', $id)
            ->where('organization_id', $organizationId)
            ->where('status', 'active')
            ->with(['aiModel', 'n8nWorkflow', 'wahaSession', 'knowledgeBaseItem'])
            ->first();
    }

    /**
     * Get available personalities for session assignment
     */
    public function getAvailablePersonalities(string $organizationId, array $filters = []): array
    {
        $query = BotPersonality::query()
            ->where('organization_id', $organizationId)
            ->where('status', 'active');

        // Apply filters
        if (isset($filters['language'])) {
            $query->where('language', $filters['language']);
        }

        if (isset($filters['ai_model_id'])) {
            $query->where('ai_model_id', $filters['ai_model_id']);
        }

        if (isset($filters['min_performance'])) {
            $minScore = $filters['min_performance'];
            $query->whereRaw('(avg_satisfaction_score * 20 * 0.6 + success_rate * 0.4) >= ?', [$minScore]);
        }

        return $query->orderByRaw('(avg_satisfaction_score * 20 * 0.6 + success_rate * 0.4) DESC')
                    ->get()
                    ->map(function ($personality) {
                        return [
                            'id' => $personality->id,
                            'name' => $personality->name,
                            'display_name' => $personality->display_name,
                            'description' => $personality->description,
                            'language' => $personality->language,
                            'tone' => $personality->tone,
                            'communication_style' => $personality->communication_style,
                            'performance_score' => $personality->performance_score,
                            'total_conversations' => $personality->total_conversations,
                            'avg_satisfaction_score' => $personality->avg_satisfaction_score,
                            'success_rate' => $personality->success_rate,
                            'ai_model' => $personality->aiModel ? [
                                'id' => $personality->aiModel->id,
                                'name' => $personality->aiModel->name,
                                'provider' => $personality->aiModel->provider
                            ] : null,
                            'has_workflow' => $personality->hasN8nWorkflow(),
                            'has_waha_session' => $personality->hasWahaSession(),
                            'has_knowledge_base' => $personality->hasKnowledgeBaseItem(),
                        ];
                    })
                    ->toArray();
    }

    /**
     * Assign personality to session
     */
    public function assignPersonalityToSession(string $sessionId, string $personalityId, string $organizationId): bool
    {
        $session = ChatSession::where('id', $sessionId)
            ->where('organization_id', $organizationId)
            ->first();

        if (!$session) {
            return false;
        }

        $personality = $this->getPersonalityForInbox($personalityId, $organizationId);
        if (!$personality) {
            return false;
        }

        $session->update([
            'bot_personality_id' => $personalityId,
            'is_bot_session' => true,
            'last_activity_at' => now()
        ]);

        // Log the assignment
        Log::info('Bot personality assigned to session', [
            'session_id' => $sessionId,
            'personality_id' => $personalityId,
            'organization_id' => $organizationId
        ]);

        return true;
    }

    /**
     * Generate AI response using bot personality
     */
    public function generateAiResponse(string $personalityId, string $message, array $context = []): array
    {
        $personality = BotPersonality::find($personalityId);
        if (!$personality) {
            return [
                'success' => false,
                'error' => 'Bot personality not found'
            ];
        }

        try {
            // Get AI model
            $aiModel = $personality->aiModel;
            if (!$aiModel) {
                return [
                    'success' => false,
                    'error' => 'AI model not configured for this personality'
                ];
            }

            // Prepare context for AI
            $aiContext = $this->prepareAiContext($personality, $message, $context);

            // Generate response using AI model
            $response = $this->callAiModel($aiModel, $aiContext);

            if ($response['success']) {
                // Update personality statistics
                $personality->increment('total_conversations');

                // Log the interaction
                Log::info('AI response generated', [
                    'personality_id' => $personalityId,
                    'message_length' => strlen($message),
                    'response_length' => strlen($response['data']['content']),
                    'confidence' => $response['data']['confidence'] ?? 0
                ]);

                return [
                    'success' => true,
                    'data' => [
                        'content' => $response['data']['content'],
                        'confidence' => $response['data']['confidence'] ?? 0,
                        'intent' => $response['data']['intent'] ?? null,
                        'sentiment' => $response['data']['sentiment'] ?? null,
                        'personality_id' => $personalityId,
                        'ai_model_used' => $aiModel->name,
                        'processing_time_ms' => $response['data']['processing_time_ms'] ?? 0
                    ]
                ];
            }

            return $response;

        } catch (\Exception $e) {
            Log::error('AI response generation failed', [
                'personality_id' => $personalityId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => 'Failed to generate AI response: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Prepare context for AI model
     */
    private function prepareAiContext(BotPersonality $personality, string $message, array $context = []): array
    {
        $aiContext = [
            'personality' => [
                'name' => $personality->name,
                'tone' => $personality->tone,
                'communication_style' => $personality->communication_style,
                'formality_level' => $personality->formality_level,
                'personality_traits' => $personality->personality_traits,
                'custom_vocabulary' => $personality->custom_vocabulary,
                'response_templates' => $personality->response_templates,
                'greeting_message' => $personality->greeting_message,
                'fallback_message' => $personality->fallback_message,
                'error_message' => $personality->error_message,
                'max_response_length' => $personality->max_response_length,
                'confidence_threshold' => $personality->confidence_threshold
            ],
            'message' => $message,
            'context' => $context,
            'system_prompt' => $personality->system_message,
            'language' => $personality->language
        ];

        // Add conversation history if available
        if (isset($context['conversation_history'])) {
            $aiContext['conversation_history'] = $context['conversation_history'];
        }

        // Add customer information if available
        if (isset($context['customer'])) {
            $aiContext['customer'] = $context['customer'];
        }

        // Add session information if available
        if (isset($context['session'])) {
            $aiContext['session'] = $context['session'];
        }

        return $aiContext;
    }

    /**
     * Call AI model to generate response
     */
    private function callAiModel(AiModel $aiModel, array $context): array
    {
        // This is a simplified implementation
        // In a real application, you would integrate with actual AI providers

        try {
            $startTime = microtime(true);

            // Simulate AI processing
            $response = $this->simulateAiResponse($aiModel, $context);

            $processingTime = (microtime(true) - $startTime) * 1000;

            return [
                'success' => true,
                'data' => [
                    'content' => $response['content'],
                    'confidence' => $response['confidence'],
                    'intent' => $response['intent'],
                    'sentiment' => $response['sentiment'],
                    'processing_time_ms' => round($processingTime, 2)
                ]
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'AI model call failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Simulate AI response (replace with actual AI integration)
     */
    private function simulateAiResponse(AiModel $aiModel, array $context): array
    {
        $personality = $context['personality'];
        $message = $context['message'];

        // Simple response generation based on personality
        $responses = [
            'Hello! How can I help you today?',
            'I understand your concern. Let me assist you with that.',
            'Thank you for reaching out. I\'m here to help.',
            'I appreciate your message. Let me provide you with the information you need.',
            'That\'s a great question! Let me explain that for you.'
        ];

        $content = $responses[array_rand($responses)];

        // Adjust response based on personality traits
        if (isset($personality['tone']) && $personality['tone'] === 'friendly') {
            $content = 'Hi there! ' . $content;
        } elseif (isset($personality['tone']) && $personality['tone'] === 'professional') {
            $content = 'Thank you for your inquiry. ' . $content;
        }

        return [
            'content' => $content,
            'confidence' => 0.85,
            'intent' => 'general_inquiry',
            'sentiment' => 'neutral'
        ];
    }

    /**
     * Get personality statistics for inbox
     */
    public function getPersonalityStatistics(string $organizationId, array $filters = []): array
    {
        $query = BotPersonality::query()
            ->where('organization_id', $organizationId);

        // Apply date filters
        if (isset($filters['date_from'])) {
            $query->where('created_at', '>=', Carbon::parse($filters['date_from']));
        }
        if (isset($filters['date_to'])) {
            $query->where('created_at', '<=', Carbon::parse($filters['date_to']));
        }

        $personalities = $query->get();

        $totalPersonalities = $personalities->count();
        $activePersonalities = $personalities->where('status', 'active')->count();
        $learningEnabled = $personalities->where('learning_enabled', true)->count();
        $withWorkflows = $personalities->where('n8n_workflow_id', '!=', null)->count();
        $withWahaSessions = $personalities->where('waha_session_id', '!=', null)->count();
        $withKnowledgeBase = $personalities->where('knowledge_base_item_id', '!=', null)->count();

        $avgPerformance = $personalities->avg('performance_score') ?? 0;
        $avgSatisfaction = $personalities->avg('avg_satisfaction_score') ?? 0;
        $avgSuccessRate = $personalities->avg('success_rate') ?? 0;
        $totalConversations = $personalities->sum('total_conversations');

        return [
            'total_personalities' => $totalPersonalities,
            'active_personalities' => $activePersonalities,
            'learning_enabled' => $learningEnabled,
            'with_workflows' => $withWorkflows,
            'with_waha_sessions' => $withWahaSessions,
            'with_knowledge_base' => $withKnowledgeBase,
            'avg_performance_score' => round($avgPerformance, 2),
            'avg_satisfaction_score' => round($avgSatisfaction, 2),
            'avg_success_rate' => round($avgSuccessRate, 2),
            'total_conversations' => $totalConversations,
            'top_performers' => $personalities->sortByDesc('performance_score')->take(5)->values(),
            'needs_retraining' => $personalities->filter(function ($p) {
                return $p->needsRetraining();
            })->count()
        ];
    }

    /**
     * Update personality performance metrics
     */
    public function updatePersonalityMetrics(string $personalityId, array $metrics): bool
    {
        $personality = BotPersonality::find($personalityId);
        if (!$personality) {
            return false;
        }

        $personality->updateConversationStats(
            $metrics['satisfaction_score'] ?? null,
            $metrics['successful'] ?? true
        );

        return true;
    }

    /**
     * Get personality performance over time
     */
    public function getPersonalityPerformance(string $personalityId, int $days = 30): array
    {
        $personality = BotPersonality::find($personalityId);
        if (!$personality) {
            return [];
        }

        // This would typically query conversation logs
        // For now, return mock data
        return [
            'personality_id' => $personalityId,
            'name' => $personality->name,
            'performance_over_time' => [
                'dates' => [],
                'satisfaction_scores' => [],
                'success_rates' => [],
                'conversation_counts' => []
            ],
            'current_metrics' => [
                'total_conversations' => $personality->total_conversations,
                'avg_satisfaction_score' => $personality->avg_satisfaction_score,
                'success_rate' => $personality->success_rate,
                'performance_score' => $personality->performance_score
            ]
        ];
    }
}
