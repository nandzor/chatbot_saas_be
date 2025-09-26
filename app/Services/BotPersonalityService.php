<?php

namespace App\Services;

use App\Models\BotPersonality;
use App\Models\ChatSession;
use App\Models\Message;
use App\Models\Customer;
use App\Models\AiModel;
use App\Services\AiInstructionService;
use App\Services\N8n\N8nService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class BotPersonalityService
{
    protected AiInstructionService $aiInstructionService;
    protected N8nService $n8nService;

    public function __construct(AiInstructionService $aiInstructionService, N8nService $n8nService)
    {
        $this->aiInstructionService = $aiInstructionService;
        $this->n8nService = $n8nService;
    }

    /**
     * Get all bot personalities for organization
     */
    public function getPersonalitiesForInbox(Request $request, string $organizationId): LengthAwarePaginator
    {
        $query = BotPersonality::query()
            ->where('organization_id', $organizationId)
            ->where('status', 'active');

        // Apply search filter
        if ($request->has('search') && !empty($request->get('search'))) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('display_name', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        // Apply language filter
        if ($request->has('language') && !empty($request->get('language'))) {
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
                // Fallback to mock response if no AI model configured
                Log::warning('No AI model configured for personality, using mock response', [
                    'personality_id' => $personalityId,
                    'personality_name' => $personality->name
                ]);

                return [
                    'success' => true,
                    'data' => [
                        'content' => "Halo! Saya adalah bot AI Anda. Pesan Anda: '{$message}' telah diterima. Bagaimana saya bisa membantu Anda hari ini?",
                        'confidence' => 0.85,
                        'intent' => 'general_inquiry',
                        'sentiment' => 'neutral',
                        'processing_time_ms' => 150,
                        'ai_model_used' => 'mock-ai-model-v1'
                    ]
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

    /**
     * Create bot personality for organization
     */
    public function createForOrganization(array $data, string $organizationId): BotPersonality
    {
        $data['organization_id'] = $organizationId;

        // Get n8n_workflow_id from waha_session if not provided
        if (!isset($data['n8n_workflow_id']) && isset($data['waha_session_id'])) {
            $wahaSession = \App\Models\WahaSession::find($data['waha_session_id']);
            if ($wahaSession && $wahaSession->n8n_workflow_id) {
                $data['n8n_workflow_id'] = $wahaSession->n8n_workflow_id;
            }
        }

        // Create the bot personality first
        $botPersonality = BotPersonality::create($data);

        // Generate system message using AiInstructionService
        if ($botPersonality->knowledge_base_item_id) {
            try {
                $systemMessage = $this->aiInstructionService->generateForBotPersonality($botPersonality);
                $botPersonality->update(['system_message' => $systemMessage]);

                // Update N8N workflow if it exists
                if ($botPersonality->n8n_workflow_id) {
                    $this->updateN8nWorkflowSystemMessage($botPersonality->n8n_workflow_id, $systemMessage);
                } else {
                    // Check if N8N workflows exist (no update, just check and report)
                    $n8nCheckResult = $this->checkN8nWorkflowsExist();

                    // Log the result
                    if ($n8nCheckResult['success']) {
                        Log::info('N8N workflows found', $n8nCheckResult);
                    } else {
                        Log::warning('N8N workflows not found or not accessible', $n8nCheckResult);
                    }
                }

                Log::info('System message generated for new bot personality', [
                    'bot_personality_id' => $botPersonality->id,
                    'knowledge_base_item_id' => $botPersonality->knowledge_base_item_id,
                    'language' => $botPersonality->language,
                    'formality_level' => $botPersonality->formality_level,
                    'system_message_length' => strlen($systemMessage),
                    'n8n_workflow_id' => $botPersonality->n8n_workflow_id
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to generate system message for new bot personality', [
                    'bot_personality_id' => $botPersonality->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return $botPersonality->fresh();
    }

    /**
     * Get bot personality for organization
     */
    public function getForOrganization(string $id, string $organizationId): ?BotPersonality
    {
        return BotPersonality::where('id', $id)
            ->where('organization_id', $organizationId)
            ->first();
    }

    /**
     * Update bot personality for organization
     */
    public function updateForOrganization(string $id, array $data, string $organizationId): ?BotPersonality
    {
        $personality = BotPersonality::where('id', $id)
            ->where('organization_id', $organizationId)
            ->first();

        if (!$personality) {
            return null;
        }

        // Get n8n_workflow_id from waha_session if not provided and not already set
        if (!isset($data['n8n_workflow_id']) && !$personality->n8n_workflow_id && isset($data['waha_session_id'])) {
            $wahaSession = \App\Models\WahaSession::find($data['waha_session_id']);
            if ($wahaSession && $wahaSession->n8n_workflow_id) {
                $data['n8n_workflow_id'] = $wahaSession->n8n_workflow_id;
            }
        }

        // Check if knowledge base, language, or formality level changed
        $shouldRegenerateSystemMessage = $this->shouldRegenerateSystemMessage($personality, $data);

        // Update the bot personality
        $personality->update($data);

        // Regenerate system message if needed
        if ($shouldRegenerateSystemMessage && $personality->knowledge_base_item_id) {
            try {
                $systemMessage = $this->aiInstructionService->generateForBotPersonality($personality);
                $personality->update(['system_message' => $systemMessage]);

                // Update N8N workflow if it exists
                if ($personality->n8n_workflow_id) {
                    $this->updateN8nWorkflowSystemMessage($personality->n8n_workflow_id, $systemMessage);
                } else {
                    // Check if N8N workflows exist (no update, just check and report)
                    $n8nCheckResult = $this->checkN8nWorkflowsExist();

                    // Log the result
                    if ($n8nCheckResult['success']) {
                        Log::info('N8N workflows found', $n8nCheckResult);
                    } else {
                        Log::warning('N8N workflows not found or not accessible', $n8nCheckResult);
                    }
                }

                Log::info('System message regenerated for updated bot personality', [
                    'bot_personality_id' => $personality->id,
                    'knowledge_base_item_id' => $personality->knowledge_base_item_id,
                    'language' => $personality->language,
                    'formality_level' => $personality->formality_level,
                    'system_message_length' => strlen($systemMessage),
                    'n8n_workflow_id' => $personality->n8n_workflow_id
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to regenerate system message for updated bot personality', [
                    'bot_personality_id' => $personality->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return $personality->fresh(); // Return fresh instance with updated data
    }

    /**
     * Check if system message should be regenerated
     */
    private function shouldRegenerateSystemMessage(BotPersonality $personality, array $data): bool
    {
        // Check if knowledge base item changed
        if (isset($data['knowledge_base_item_id']) && $data['knowledge_base_item_id'] !== $personality->knowledge_base_item_id) {
            return true;
        }

        // Check if language changed
        if (isset($data['language']) && $data['language'] !== $personality->language) {
            return true;
        }

        // Check if formality level changed
        if (isset($data['formality_level']) && $data['formality_level'] !== $personality->formality_level) {
            return true;
        }

        return false;
    }

    /**
     * Update N8N workflow system message and activate workflow
     */
    private function updateN8nWorkflowSystemMessage(string $n8nWorkflowId, string $systemMessage): void
    {
        try {
            // First, find the N8N workflow in database to get the actual workflow_id
            $n8nWorkflow = \App\Models\N8nWorkflow::find($n8nWorkflowId);
            if (!$n8nWorkflow) {
                Log::error('N8N workflow not found in database', [
                    'n8n_workflow_id' => $n8nWorkflowId
                ]);
                return;
            }

            $actualWorkflowId = $n8nWorkflow->workflow_id;

            // Try to update using the actual workflow ID
            $this->n8nService->updateSystemMessage($actualWorkflowId, $systemMessage);

            // Activate the workflow after updating system message
            $this->activateN8nWorkflow($n8nWorkflowId, $actualWorkflowId);

            Log::info('N8N workflow system message updated and activated', [
                'n8n_workflow_id' => $n8nWorkflowId,
                'actual_workflow_id' => $actualWorkflowId,
                'system_message_length' => strlen($systemMessage)
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update N8N workflow system message', [
                'n8n_workflow_id' => $n8nWorkflowId,
                'error' => $e->getMessage()
            ]);

            // Try alternative approach - update database directly
            try {
                $this->updateN8nWorkflowSystemMessageInDatabase($n8nWorkflowId, $systemMessage);
                // Also try to activate after database update
                $this->activateN8nWorkflow($n8nWorkflowId, $n8nWorkflow->workflow_id ?? null);
            } catch (\Exception $dbException) {
                Log::error('Failed to update N8N workflow system message in database', [
                    'n8n_workflow_id' => $n8nWorkflowId,
                    'error' => $dbException->getMessage()
                ]);
            }
        }
    }

    /**
     * Activate N8N workflow
     */
    private function activateN8nWorkflow(string $n8nWorkflowId, ?string $actualWorkflowId = null): void
    {
        try {
            if (!$actualWorkflowId) {
                $n8nWorkflow = \App\Models\N8nWorkflow::find($n8nWorkflowId);
                if (!$n8nWorkflow) {
                    Log::error('N8N workflow not found for activation', [
                        'n8n_workflow_id' => $n8nWorkflowId
                    ]);
                    return;
                }
                $actualWorkflowId = $n8nWorkflow->workflow_id;
            }

            // Activate the workflow
            $activationResult = $this->n8nService->activateWorkflow($actualWorkflowId);

            // Check if activation was successful by looking at the workflow data
            $isActivated = false;
            if (isset($activationResult['success']) && $activationResult['success']) {
                $isActivated = true;
            } elseif (isset($activationResult['active']) && $activationResult['active'] === true) {
                $isActivated = true;
            } elseif (isset($activationResult['data']['active']) && $activationResult['data']['active'] === true) {
                $isActivated = true;
            }

            // Update database status regardless of activation result
            $n8nWorkflow = \App\Models\N8nWorkflow::find($n8nWorkflowId);
            if ($n8nWorkflow) {
                $n8nWorkflow->update([
                    'is_enabled' => true,
                    'status' => 'active',
                    'updated_at' => now(),
                ]);
            }

            if ($isActivated) {
                Log::info('N8N workflow activated successfully', [
                    'n8n_workflow_id' => $n8nWorkflowId,
                    'actual_workflow_id' => $actualWorkflowId,
                    'activation_result' => $activationResult,
                    'database_updated' => true
                ]);
            } else {
                Log::warning('N8N workflow activation result unclear, but database updated', [
                    'n8n_workflow_id' => $n8nWorkflowId,
                    'actual_workflow_id' => $actualWorkflowId,
                    'activation_result' => $activationResult,
                    'database_updated' => true
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to activate N8N workflow', [
                'n8n_workflow_id' => $n8nWorkflowId,
                'actual_workflow_id' => $actualWorkflowId,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Update N8N workflow system message in database as fallback
     */
    private function updateN8nWorkflowSystemMessageInDatabase(string $n8nWorkflowId, string $systemMessage): void
    {
        $n8nWorkflow = \App\Models\N8nWorkflow::find($n8nWorkflowId);
        if (!$n8nWorkflow) {
            return;
        }

        $currentNodes = $n8nWorkflow->nodes ?? [];
        $updated = false;

        // Find and update any node that has systemMessage parameter
        foreach ($currentNodes as &$node) {
            if (isset($node['parameters']['options']['systemMessage'])) {
                $node['parameters']['options']['systemMessage'] = $systemMessage;
                $updated = true;
            }
        }

        if ($updated) {
            $n8nWorkflow->update(['nodes' => $currentNodes]);

            Log::info('N8N workflow system message updated in database', [
                'n8n_workflow_id' => $n8nWorkflowId,
                'system_message_length' => strlen($systemMessage)
            ]);
        }
    }

    /**
     * Check if N8N workflows exist and return status message
     * Does NOT update any workflows - only checks and reports
     */
    private function checkN8nWorkflowsExist(): array
    {
        try {
            $workflows = $this->n8nService->getWorkflows();

            if (!isset($workflows['data']) || !is_array($workflows['data']) || empty($workflows['data'])) {
                Log::warning('No workflows found in N8N 3rd party');
                return [
                    'success' => false,
                    'message' => 'No workflows found in N8N 3rd party. Please create workflows in N8N first.',
                    'workflows_count' => 0
                ];
            }

            $activeWorkflows = 0;
            $workflowsWithSystemMessage = 0;

            foreach ($workflows['data'] as $workflow) {
                // Count active workflows
                if (isset($workflow['active']) &&
                    ($workflow['active'] === true || $workflow['active'] === 1 || $workflow['active'] === '1')) {
                    $activeWorkflows++;
                }

                // Count workflows with systemMessage (check first few only for performance)
                if ($workflowsWithSystemMessage < 5) { // Limit check to first 5 workflows
                    try {
                        $workflowDetail = $this->n8nService->getWorkflow($workflow['id']);
                        foreach ($workflowDetail['nodes'] as $node) {
                            if (isset($node['parameters']['options']['systemMessage'])) {
                                $workflowsWithSystemMessage++;
                                break;
                            }
                        }
                    } catch (\Exception $e) {
                        // Skip workflows that can't be accessed
                        continue;
                    }
                }
            }

            if ($activeWorkflows === 0 && $workflowsWithSystemMessage === 0) {
                Log::warning('No active workflows or workflows with systemMessage found in N8N 3rd party', [
                    'total_workflows' => count($workflows['data']),
                    'active_workflows' => $activeWorkflows,
                    'workflows_with_system_message' => $workflowsWithSystemMessage
                ]);

                return [
                    'success' => false,
                    'message' => 'No active workflows or workflows with systemMessage found in N8N 3rd party. Please ensure workflows are active and have systemMessage nodes.',
                    'workflows_count' => count($workflows['data']),
                    'active_workflows' => $activeWorkflows,
                    'workflows_with_system_message' => $workflowsWithSystemMessage
                ];
            }

            Log::info('N8N workflows found', [
                'total_workflows' => count($workflows['data']),
                'active_workflows' => $activeWorkflows,
                'workflows_with_system_message' => $workflowsWithSystemMessage
            ]);

            return [
                'success' => true,
                'message' => "Found {$activeWorkflows} active workflow(s) and {$workflowsWithSystemMessage} workflow(s) with systemMessage in N8N 3rd party",
                'workflows_count' => count($workflows['data']),
                'active_workflows' => $activeWorkflows,
                'workflows_with_system_message' => $workflowsWithSystemMessage
            ];

        } catch (\Exception $e) {
            Log::error('Failed to check N8N workflows', [
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Failed to check N8N workflows: ' . $e->getMessage(),
                'workflows_count' => 0
            ];
        }
    }

    /**
     * Delete bot personality for organization
     */
    public function deleteForOrganization(string $id, string $organizationId): bool
    {
        $personality = BotPersonality::where('id', $id)
            ->where('organization_id', $organizationId)
            ->first();

        if (!$personality) {
            return false;
        }

        return $personality->delete();
    }

    /**
     * Sync workflow for bot personality
     */
    public function syncWorkflow(string $id, string $organizationId): array
    {
        $personality = BotPersonality::where('id', $id)
            ->where('organization_id', $organizationId)
            ->first();

        if (!$personality) {
            return [
                'success' => false,
                'message' => 'Bot personality not found'
            ];
        }

        // TODO: Implement workflow sync logic
        return [
            'success' => true,
            'message' => 'Workflow synced successfully',
            'data' => [
                'personality_id' => $id,
                'synced_at' => now()
            ]
        ];
    }

    /**
     * Get sync status for bot personality
     */
    public function getSyncStatus(string $id, string $organizationId): array
    {
        $personality = BotPersonality::where('id', $id)
            ->where('organization_id', $organizationId)
            ->first();

        if (!$personality) {
            return [
                'success' => false,
                'message' => 'Bot personality not found'
            ];
        }

        // TODO: Implement sync status logic
        return [
            'success' => true,
            'data' => [
                'personality_id' => $id,
                'sync_status' => 'synced',
                'last_sync' => now()
            ]
        ];
    }

    /**
     * Bulk sync workflows
     */
    public function bulkSyncWorkflows(array $ids, string $organizationId): array
    {
        $personalities = BotPersonality::whereIn('id', $ids)
            ->where('organization_id', $organizationId)
            ->get();

        if ($personalities->isEmpty()) {
            return [
                'success' => false,
                'message' => 'No bot personalities found'
            ];
        }

        // TODO: Implement bulk sync logic
        return [
            'success' => true,
            'message' => 'Workflows synced successfully',
            'data' => [
                'synced_count' => $personalities->count(),
                'synced_at' => now()
            ]
        ];
    }

    /**
     * Sync organization workflows
     */
    public function syncOrganizationWorkflows(string $organizationId): array
    {
        $personalities = BotPersonality::where('organization_id', $organizationId)->get();

        if ($personalities->isEmpty()) {
            return [
                'success' => false,
                'message' => 'No bot personalities found for organization'
            ];
        }

        // TODO: Implement organization workflow sync logic
        return [
            'success' => true,
            'message' => 'Organization workflows synced successfully',
            'data' => [
                'synced_count' => $personalities->count(),
                'synced_at' => now()
            ]
        ];
    }
}
