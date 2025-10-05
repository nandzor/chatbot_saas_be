<?php

namespace App\Services;

use Exception;
use Carbon\Carbon;
use App\Models\AiModel;
use App\Models\Message;
use App\Models\Customer;
use App\Models\ChatSession;
use Illuminate\Http\Request;
use App\Models\BotPersonality;
use App\Services\N8n\N8nService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\RagWorkflowService;
use Illuminate\Support\Facades\Auth;
use App\Services\AiInstructionService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class BotPersonalityService
{
    protected AiInstructionService $aiInstructionService;
    protected N8nService $n8nService;
    protected RagWorkflowService $ragWorkflowService;

    public function __construct(
        AiInstructionService $aiInstructionService,
        N8nService $n8nService,
        RagWorkflowService $ragWorkflowService
    ) {
        $this->aiInstructionService = $aiInstructionService;
        $this->n8nService = $n8nService;
        $this->ragWorkflowService = $ragWorkflowService;
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

        } catch (Exception $e) {
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

        } catch (Exception $e) {
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

        // Persist Google Drive files if provided
        if (!empty($data['google_drive_files']) && is_array($data['google_drive_files'])) {
            $this->syncDriveFiles($botPersonality, $data['google_drive_files']);
        }

        // Activate N8N workflow if it exists
        if ($botPersonality->n8n_workflow_id) {
            $this->activateN8nWorkflow($botPersonality->n8n_workflow_id);
        }

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
            } catch (Exception $e) {
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

        // Sync Google Drive files if provided
        if (array_key_exists('google_drive_files', $data)) {
            $files = is_array($data['google_drive_files']) ? $data['google_drive_files'] : [];
            $this->syncDriveFiles($personality, $files);
        }

        // Activate N8N workflow if it exists
        if ($personality->n8n_workflow_id) {
            $this->activateN8nWorkflow($personality->n8n_workflow_id);
        }

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
            } catch (Exception $e) {
                Log::error('Failed to regenerate system message for updated bot personality', [
                    'bot_personality_id' => $personality->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return $personality->fresh(); // Return fresh instance with updated data
    }

    /**
     * Sync Google Drive files to relation table and update n8n workflow staticData.
     */
    protected function syncDriveFiles(BotPersonality $personality, array $files): void
    {
        // Map and validate
        $mapped = collect($files)->map(function ($file) use ($personality) {
            return [
                'organization_id' => $personality->organization_id,
                'bot_personality_id' => $personality->id,
                'file_id' => $file['id'] ?? $file['file_id'] ?? null,
                'file_name' => $file['name'] ?? $file['file_name'] ?? null,
                'mime_type' => $file['mimeType'] ?? $file['mime_type'] ?? null,
                'web_view_link' => $file['webViewLink'] ?? $file['web_view_link'] ?? null,
                'icon_link' => $file['iconLink'] ?? $file['icon_link'] ?? null,
                'size' => isset($file['size']) ? (int) $file['size'] : (isset($file['fileSize']) ? (int) $file['fileSize'] : 0),
                // Ensure JSON string for bulk insert (casts won't run on insert())
                'metadata' => is_string($file) ? $file : json_encode($file, JSON_UNESCAPED_SLASHES),
            ];
        })->filter(fn($row) => !empty($row['file_id']) && !empty($row['file_name']))->values();

        // Replace existing rows
        $personality->driveFiles()->delete();
        if ($mapped->isNotEmpty()) {
            \App\Models\BotPersonalityDriveFile::insert($mapped->map(function ($row) {
                $row['id'] = (string) \Illuminate\Support\Str::uuid();
                $row['created_at'] = now();
                $row['updated_at'] = now();
                return $row;
            })->toArray());
        }

        // Update n8n staticData if workflow exists
        if ($personality->n8n_workflow_id) {
            try {
                $filesForWorkflow = $mapped->map(function ($row) {
                    return [
                        'file_id' => $row['file_id'],
                        'file_name' => $row['file_name'],
                        'mime_type' => $row['mime_type'],
                        'web_view_link' => $row['web_view_link'],
                        'size' => $row['size'],
                    ];
                })->toArray();

                // Get user's Google Drive credentials for n8n integration
                $googleCredentials = $this->getUserGoogleDriveCredentials($personality->organization_id);

                // Create credentials in n8n if not exists
                if ($googleCredentials) {
                    $credentialResult = $this->n8nService->createGoogleDriveCredentials([
                        'organization_id' => $personality->organization_id,
                        'access_token' => $googleCredentials['access_token'],
                        'refresh_token' => $googleCredentials['refresh_token'],
                        'expires_at' => $googleCredentials['expires_at'],
                        'scope' => $googleCredentials['scope'],
                    ]);

                    if ($credentialResult['success']) {
                        $googleCredentials['n8n_credential_id'] = $credentialResult['credential_id'];
                    }
                }

                // Use RAG enhancement method if available, otherwise fallback to Google Drive tools
                if (method_exists($this->n8nService, 'enhanceWorkflowWithRag')) {
                    $this->n8nService->enhanceWorkflowWithRag($personality->n8n_workflow_id, [
                        'files' => $filesForWorkflow,
                        'organization_id' => $personality->organization_id,
                        'personality_id' => $personality->id,
                        'credentials' => $googleCredentials,
                    ]);
                } elseif (method_exists($this->n8nService, 'enhanceWorkflowWithGoogleDrive')) {
                    $this->n8nService->enhanceWorkflowWithGoogleDrive($personality->n8n_workflow_id, [
                        'files' => $filesForWorkflow,
                        'organization_id' => $personality->organization_id,
                        'personality_id' => $personality->id,
                        'credentials' => $googleCredentials,
                    ]);
                } elseif (method_exists($this->n8nService, 'updateWorkflowStaticData')) {
                    \call_user_func([
                        $this->n8nService,
                        'updateWorkflowStaticData'
                    ], $personality->n8n_workflow_id, [
                        'googleDrive' => [
                            'files' => $filesForWorkflow,
                            'organization_id' => $personality->organization_id,
                            'personality_id' => $personality->id,
                            'credentials' => $googleCredentials,
                        ]
                    ]);
                }
            } catch (\Throwable $e) {
                Log::warning('Failed to update n8n staticData with drive files', [
                    'workflow_id' => $personality->n8n_workflow_id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    /**
     * Get user's Google Drive credentials for n8n integration
     */
    private function getUserGoogleDriveCredentials(string $organizationId): ?array
    {
        try {
            $oauthCredential = \App\Models\OAuthCredential::where('organization_id', $organizationId)
                ->where('service', 'google-drive')
                ->where('status', 'active')
                ->first();

            if (!$oauthCredential) {
                Log::warning('No active Google Drive credentials found for organization', [
                    'organization_id' => $organizationId
                ]);
                return null;
            }

            return [
                'access_token' => $oauthCredential->access_token,
                'refresh_token' => $oauthCredential->refresh_token,
                'expires_at' => $oauthCredential->expires_at,
                'scope' => $oauthCredential->scope,
                'credential_id' => $oauthCredential->id,
            ];
        } catch (\Throwable $e) {
            Log::error('Failed to get Google Drive credentials', [
                'organization_id' => $organizationId,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
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
        } catch (Exception $e) {
            Log::error('Failed to update N8N workflow system message', [
                'n8n_workflow_id' => $n8nWorkflowId,
                'error' => $e->getMessage()
            ]);

            // Try alternative approach - update database directly
            try {
                $this->updateN8nWorkflowSystemMessageInDatabase($n8nWorkflowId, $systemMessage);
                // Also try to activate after database update
                $this->activateN8nWorkflow($n8nWorkflowId, $n8nWorkflow->workflow_id ?? null);
            } catch (Exception $dbException) {
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
        } catch (Exception $e) {
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
                    } catch (Exception $e) {
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

        } catch (Exception $e) {
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

        // Store workflow ID before deletion for cleanup
        $n8nWorkflowId = $personality->n8n_workflow_id;
        $wahaSessionId = $personality->waha_session_id;

        // Delete the personality
        $deleted = $personality->delete();

        if ($deleted) {
            // Clean up related resources
            $this->cleanupRelatedResources($n8nWorkflowId, $wahaSessionId, $organizationId);
        }

        return $deleted;
    }

    /**
     * Clean up related resources when bot personality is deleted
     */
    private function cleanupRelatedResources(?string $n8nWorkflowId, ?string $wahaSessionId, string $organizationId): void
    {
        try {
            // Check if N8N workflow is still being used by other personalities
            if ($n8nWorkflowId) {
                $otherPersonalitiesUsingWorkflow = BotPersonality::where('n8n_workflow_id', $n8nWorkflowId)
                    ->where('organization_id', $organizationId)
                    ->exists();

                if (!$otherPersonalitiesUsingWorkflow) {
                    // No other personalities using this workflow, deactivate it
                    $this->deactivateUnusedN8nWorkflow($n8nWorkflowId);
                }
            }

            Log::info('Bot personality cleanup completed', [
                'organization_id' => $organizationId,
                'n8n_workflow_id' => $n8nWorkflowId,
                'waha_session_id' => $wahaSessionId,
            ]);

        } catch (Exception $e) {
            Log::error('Error during bot personality cleanup', [
                'organization_id' => $organizationId,
                'n8n_workflow_id' => $n8nWorkflowId,
                'waha_session_id' => $wahaSessionId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Deactivate N8N workflow that's no longer used
     */
    private function deactivateUnusedN8nWorkflow(string $n8nWorkflowId): void
    {
        try {
            $workflow = \App\Models\N8nWorkflow::find($n8nWorkflowId);
            if ($workflow) {
                // Update database status to inactive
                $workflow->update([
                    'status' => 'inactive',
                    'is_enabled' => false,
                    'updated_at' => now(),
                ]);

                // Try to deactivate in N8N server
                try {
                    $this->n8nService->deactivateWorkflow($workflow->workflow_id);
                    Log::info('N8N workflow deactivated successfully', [
                        'n8n_workflow_id' => $n8nWorkflowId,
                        'workflow_id' => $workflow->workflow_id,
                    ]);
                } catch (Exception $e) {
                    Log::warning('Failed to deactivate N8N workflow in server, but database updated', [
                        'n8n_workflow_id' => $n8nWorkflowId,
                        'workflow_id' => $workflow->workflow_id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        } catch (Exception $e) {
            Log::error('Error deactivating unused N8N workflow', [
                'n8n_workflow_id' => $n8nWorkflowId,
                'error' => $e->getMessage(),
            ]);
        }
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

    /**
     * Create bot personality dengan RAG workflow
     */
    public function createPersonalityWithRag(array $data): array
    {
        try {
            DB::beginTransaction();

            // Create bot personality
            $personality = BotPersonality::create([
                'organization_id' => $data['organization_id'],
                'name' => $data['name'],
                'display_name' => $data['display_name'],
                'description' => $data['description'],
                'personality_traits' => $data['personality_traits'] ?? [],
                'communication_style' => $data['communication_style'] ?? 'professional',
                'language' => $data['language'] ?? 'en',
                'ai_model_id' => $data['ai_model_id'],
                'system_message' => $data['system_message'],
                'max_response_length' => $data['max_response_length'] ?? 500,
                'response_delay_ms' => $data['response_delay_ms'] ?? 1000,
                'confidence_threshold' => $data['confidence_threshold'] ?? 0.7,
                'color_scheme' => $data['color_scheme'] ?? ['primary' => '#3B82F6', 'secondary' => '#10B981'],
                'status' => $data['status'] ?? 'active',
                'rag_settings' => $data['rag_settings'] ?? null,
                'created_by' => Auth::id(),
                'updated_by' => Auth::id()
            ]);

            // Sync Google Drive files if provided
            if (!empty($data['google_drive_files']) && is_array($data['google_drive_files'])) {
                $this->syncDriveFiles($personality, $data['google_drive_files']);
            }

            // Create RAG workflow jika ada selected files
            if (!empty($data['rag_files']) && is_array($data['rag_files'])) {
                $ragResult = $this->createRagWorkflowForPersonality($personality, $data['rag_files'], $data['rag_settings'] ?? []);

                if (!$ragResult['success']) {
                    DB::rollBack();
                    return [
                        'success' => false,
                        'error' => 'Failed to create RAG workflow: ' . $ragResult['error']
                    ];
                }

                // Update personality dengan RAG settings
                $personality->update([
                    'rag_settings' => json_encode([
                        'enabled' => true,
                        'workflowId' => $ragResult['data']['workflowId'],
                        'sources' => $data['rag_files'],
                        'lastUpdated' => now()->toISOString()
                    ])
                ]);
            }

            DB::commit();

            return [
                'success' => true,
                'data' => [
                    'personality' => $personality,
                    'rag_workflow' => !empty($data['rag_files']) ? $ragResult['data'] : null
                ]
            ];

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to create bot personality with RAG', [
                'data' => $data,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Failed to create bot personality: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Update bot personality dengan RAG workflow
     */
    public function updatePersonalityWithRag(string $personalityId, array $data): array
    {
        try {
            $personality = BotPersonality::find($personalityId);

            if (!$personality) {
                return [
                    'success' => false,
                    'error' => 'Bot personality not found'
                ];
            }

            DB::beginTransaction();

            // Update basic personality data
            $personality->update([
                'name' => $data['name'] ?? $personality->name,
                'display_name' => $data['display_name'] ?? $personality->display_name,
                'description' => $data['description'] ?? $personality->description,
                'personality_traits' => $data['personality_traits'] ?? $personality->personality_traits,
                'communication_style' => $data['communication_style'] ?? $personality->communication_style,
                'language' => $data['language'] ?? $personality->language,
                'ai_model_id' => $data['ai_model_id'] ?? $personality->ai_model_id,
                'system_message' => $data['system_message'] ?? $personality->system_message,
                'max_response_length' => $data['max_response_length'] ?? $personality->max_response_length,
                'response_delay_ms' => $data['response_delay_ms'] ?? $personality->response_delay_ms,
                'confidence_threshold' => $data['confidence_threshold'] ?? $personality->confidence_threshold,
                'color_scheme' => $data['color_scheme'] ?? $personality->color_scheme,
                'status' => $data['status'] ?? $personality->status,
                'updated_by' => Auth::id()
            ]);

            // Sync Google Drive files if provided
            if (array_key_exists('google_drive_files', $data)) {
                $files = is_array($data['google_drive_files']) ? $data['google_drive_files'] : [];
                $this->syncDriveFiles($personality, $files);
            }

            // Handle RAG files update
            if (isset($data['rag_files'])) {
                if (!empty($data['rag_files']) && is_array($data['rag_files'])) {
                    // Update RAG workflow
                    $ragResult = $this->updateRagWorkflowForPersonality($personality, $data['rag_files'], $data['rag_settings'] ?? []);

                    if (!$ragResult['success']) {
                        DB::rollBack();
                        return [
                            'success' => false,
                            'error' => 'Failed to update RAG workflow: ' . $ragResult['error']
                        ];
                    }

                    // Update RAG settings
                    $personality->update([
                        'rag_settings' => json_encode([
                            'enabled' => true,
                            'workflowId' => $ragResult['data']['workflowId'],
                            'sources' => $data['rag_files'],
                            'lastUpdated' => now()->toISOString()
                        ])
                    ]);
                } else {
                    // Disable RAG
                    $this->disableRagWorkflowForPersonality($personality);
                    $personality->update([
                        'rag_settings' => json_encode([
                            'enabled' => false,
                            'sources' => [],
                            'workflowId' => null,
                            'lastUpdated' => now()->toISOString()
                        ])
                    ]);
                }
            }

            DB::commit();

            return [
                'success' => true,
                'data' => [
                    'personality' => $personality,
                    'rag_workflow' => isset($data['rag_files']) && !empty($data['rag_files']) ? $ragResult['data'] : null
                ]
            ];

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to update bot personality with RAG', [
                'personalityId' => $personalityId,
                'data' => $data,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Failed to update bot personality: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Create RAG workflow untuk bot personality
     */
    private function createRagWorkflowForPersonality(BotPersonality $personality, array $ragFiles, array $ragSettings = []): array
    {
        try {
            $workflowData = [
                'organizationId' => $personality->organization_id,
                'botPersonalityId' => $personality->id,
                'selectedFiles' => $ragFiles,
                'config' => [
                    'syncInterval' => 300,
                    'includeMetadata' => true,
                    'autoProcess' => true,
                    'notificationEnabled' => true
                ],
                'ragSettings' => array_merge([
                    'chunkSize' => 1000,
                    'chunkOverlap' => 200,
                    'embeddingModel' => 'text-embedding-ada-002',
                    'vectorStore' => 'chroma',
                    'similarityThreshold' => 0.7,
                    'maxResults' => 5
                ], $ragSettings)
            ];

            return $this->ragWorkflowService->createRagWorkflow($workflowData);

        } catch (Exception $e) {
            Log::error('Failed to create RAG workflow for personality', [
                'personalityId' => $personality->id,
                'ragFiles' => $ragFiles,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Failed to create RAG workflow: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Update RAG workflow untuk bot personality
     */
    private function updateRagWorkflowForPersonality(BotPersonality $personality, array $ragFiles, array $ragSettings = []): array
    {
        try {
            // Check if existing workflow
            $existingWorkflow = DB::table('rag_workflows')
                ->where('organization_id', $personality->organization_id)
                ->where('bot_personality_id', $personality->id)
                ->where('status', 'active')
                ->first();

            if ($existingWorkflow) {
                // Update existing workflow
                $updateData = [
                    'organizationId' => $personality->organization_id,
                    'botPersonalityId' => $personality->id,
                    'action' => 'update',
                    'files' => $ragFiles,
                    'ragSettings' => array_merge([
                        'chunkSize' => 1000,
                        'chunkOverlap' => 200,
                        'embeddingModel' => 'text-embedding-ada-002',
                        'similarityThreshold' => 0.7,
                        'maxResults' => 5
                    ], $ragSettings)
                ];

                return $this->ragWorkflowService->updateRagDocuments($updateData);
            } else {
                // Create new workflow
                return $this->createRagWorkflowForPersonality($personality, $ragFiles, $ragSettings);
            }

        } catch (Exception $e) {
            Log::error('Failed to update RAG workflow for personality', [
                'personalityId' => $personality->id,
                'ragFiles' => $ragFiles,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Failed to update RAG workflow: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Disable RAG workflow untuk bot personality
     */
    private function disableRagWorkflowForPersonality(BotPersonality $personality): void
    {
        try {
            $workflow = DB::table('rag_workflows')
                ->where('organization_id', $personality->organization_id)
                ->where('bot_personality_id', $personality->id)
                ->where('status', 'active')
                ->first();

            if ($workflow) {
                // Deactivate workflow di N8N
                $this->n8nService->deactivateWorkflow($workflow->n8n_workflow_id);

                // Update status di database
                DB::table('rag_workflows')
                    ->where('id', $workflow->id)
                    ->update([
                        'status' => 'inactive',
                        'updated_at' => now()
                    ]);

                // Update documents status
                DB::table('rag_documents')
                    ->where('organization_id', $personality->organization_id)
                    ->where('bot_personality_id', $personality->id)
                    ->update([
                        'status' => 'inactive',
                        'updated_at' => now()
                    ]);
            }
        } catch (Exception $e) {
            Log::error('Failed to disable RAG workflow for personality', [
                'personalityId' => $personality->id,
                'error' => $e->getMessage()
            ]);
        }
    }
}
