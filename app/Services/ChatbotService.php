<?php

namespace App\Services;

use App\Models\BotPersonality;
use App\Models\AiModel;
use App\Models\ChatSession;
use App\Models\Message;
use App\Models\AiTrainingData;
use App\Traits\CacheHelper;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;
use Illuminate\Pagination\LengthAwarePaginator;

class ChatbotService extends BaseService
{
    use CacheHelper;
    /**
     * Get the model for the service.
     */
    protected function getModel(): \Illuminate\Database\Eloquent\Model
    {
        return new BotPersonality();
    }

    /**
     * Get all chatbots with advanced filtering and pagination.
     */
    public function getAllItems(
        ?Request $request = null,
        array $filters = [],
        ?array $relations = null
    ): Collection|LengthAwarePaginator {
        // Use optimized relations by default
        if ($relations === null) {
            $relations = $this->getOptimizedRelations($request);
        }

        $query = $this->getModel()->newQuery();

        // Apply optimized eager loading
        $query->with($relations);

        // Select only necessary columns for list view
        if ($request && $request->get('list_view', true)) {
            $query->select([
                'id', 'organization_id', 'name', 'code', 'display_name', 'description',
                'ai_model_id', 'language', 'tone', 'communication_style', 'formality_level',
                'avatar_url', 'color_scheme', 'greeting_message', 'farewell_message',
                'is_active', 'status', 'total_conversations', 'total_messages',
                'avg_response_time', 'satisfaction_score', 'last_activity_at',
                'created_at', 'updated_at'
            ]);
        }

        if (Auth::user()->role !== 'super_admin') {
            // Apply organization filter for non-super admins
            $query->where('organization_id', $this->getCurrentOrganizationId());
        }

        // Apply filters
        $this->applyChatbotFilters($query, $filters);

        // Apply search
        if ($request && $request->has('search')) {
            $query->search($request->get('search'));
        }

        // Apply sorting
        if ($request) {
            $this->applyChatbotSorting($query, $request);
        }

        // Return paginated or all results
        if ($request && $request->has('per_page')) {
            $perPage = min(100, max(1, (int) $request->get('per_page', 15)));
            return $query->paginate($perPage);
        }

        return $query->get();
    }

    /**
     * Get chatbot by ID with relations.
     */
    public function getItemById(string $id, array $relations = ['aiModel', 'organization', 'channelConfigs']): ?BotPersonality
    {
        $query = $this->getModel()->newQuery();

        if (!empty($relations)) {
            $query->with($relations);
        }

        return $query->where('organization_id', $this->getCurrentOrganizationId())
                    ->find($id);
    }

    /**
     * Create a new chatbot.
     */
    public function createItem(array $data): BotPersonality
    {
        return DB::transaction(function () use ($data) {
            // Set organization ID
            $data['organization_id'] = $this->getCurrentOrganizationId();

            // Generate code if not provided
            if (!isset($data['code'])) {
                $data['code'] = $this->generateUniqueCode($data['name']);
            }

            // Set default values
            $data['status'] = $data['status'] ?? 'active';
            $data['is_active'] = $data['is_active'] ?? true;
            $data['formality_level'] = $data['formality_level'] ?? 'formal';
            $data['response_delay_ms'] = $data['response_delay_ms'] ?? 1000;
            $data['typing_indicator'] = $data['typing_indicator'] ?? true;
            $data['max_response_length'] = $data['max_response_length'] ?? 1000;
            $data['enable_small_talk'] = $data['enable_small_talk'] ?? true;
            $data['confidence_threshold'] = $data['confidence_threshold'] ?? 0.7;
            $data['learning_enabled'] = $data['learning_enabled'] ?? true;

            // Set default messages if not provided
            $data['greeting_message'] = $data['greeting_message'] ?? 'Hello! How can I help you today?';
            $data['farewell_message'] = $data['farewell_message'] ?? 'Thank you for chatting with me. Have a great day!';
            $data['error_message'] = $data['error_message'] ?? 'I apologize, but I encountered an error. Please try again.';
            $data['waiting_message'] = $data['waiting_message'] ?? 'Please wait while I process your request...';
            $data['transfer_message'] = $data['transfer_message'] ?? 'I\'m transferring you to a human agent. Please hold on.';
            $data['fallback_message'] = $data['fallback_message'] ?? 'I\'m not sure how to help with that. Could you please rephrase your question?';

            // Create the chatbot
            $chatbot = $this->getModel()->create($data);

            // Clear cache
            $this->clearChatbotCache();

            // Log the creation
            Log::info('Chatbot created', [
                'chatbot_id' => $chatbot->id,
                'name' => $chatbot->name,
                'code' => $chatbot->code,
                'organization_id' => $chatbot->organization_id
            ]);

            return $chatbot;
        });
    }

    /**
     * Update a chatbot.
     */
    public function updateItem(string $id, array $data): BotPersonality
    {
        return DB::transaction(function () use ($id, $data) {
            $chatbot = $this->getItemById($id);

            if (!$chatbot) {
                throw ValidationException::withMessages([
                    'id' => ['Chatbot not found.']
                ]);
            }

            // Check if user has permission to edit
            if (!$this->canEditChatbot($chatbot)) {
                throw ValidationException::withMessages([
                    'permission' => ['You do not have permission to edit this chatbot.']
                ]);
            }

            // Generate new code if name changed
            if (isset($data['name']) && $data['name'] !== $chatbot->name) {
                $data['code'] = $this->generateUniqueCode($data['name'], $id);
            }

            // Update the chatbot
            $chatbot->update($data);

            // Clear cache
            $this->clearChatbotCache();

            // Log the update
            Log::info('Chatbot updated', [
                'chatbot_id' => $chatbot->id,
                'name' => $chatbot->name,
                'updated_by' => $this->getCurrentUserId()
            ]);

            return $chatbot->fresh(['aiModel', 'organization', 'channelConfigs']);
        });
    }

    /**
     * Delete a chatbot.
     */
    public function deleteItem(string $id): bool
    {
        return DB::transaction(function () use ($id) {
            $chatbot = $this->getItemById($id);

            if (!$chatbot) {
                throw ValidationException::withMessages([
                    'id' => ['Chatbot not found.']
                ]);
            }

            // Check if user has permission to delete
            if (!$this->canDeleteChatbot($chatbot)) {
                throw ValidationException::withMessages([
                    'permission' => ['You do not have permission to delete this chatbot.']
                ]);
            }

            // Soft delete the chatbot
            $deleted = $chatbot->delete();

            if ($deleted) {
                // Clear cache
                $this->clearChatbotCache();

                // Log the deletion
                Log::info('Chatbot deleted', [
                    'chatbot_id' => $chatbot->id,
                    'name' => $chatbot->name,
                    'deleted_by' => $this->getCurrentUserId()
                ]);
            }

            return $deleted;
        });
    }

    /**
     * Train a chatbot with new data.
     */
    public function train(string $id, array $data): array
    {
        return DB::transaction(function () use ($id, $data) {
            $chatbot = $this->getItemById($id);

            if (!$chatbot) {
                throw ValidationException::withMessages([
                    'id' => ['Chatbot not found.']
                ]);
            }

            // Check if user has permission to train
            if (!$this->canTrainChatbot($chatbot)) {
                throw ValidationException::withMessages([
                    'permission' => ['You do not have permission to train this chatbot.']
                ]);
            }

            $startTime = microtime(true);
            $trainingItemsCount = 0;

            // Process training data
            if (isset($data['training_data']) && is_array($data['training_data'])) {
                foreach ($data['training_data'] as $trainingItem) {
                    AiTrainingData::create([
                        'organization_id' => $this->getCurrentOrganizationId(),
                        'bot_personality_id' => $chatbot->id,
                        'input_text' => $trainingItem['input'] ?? '',
                        'expected_output' => $trainingItem['output'] ?? '',
                        'context' => $trainingItem['context'] ?? null,
                        'category' => $trainingItem['category'] ?? 'general',
                        'confidence_score' => $trainingItem['confidence'] ?? 1.0,
                        'is_active' => true
                    ]);
                    $trainingItemsCount++;
                }
            }

            // Update chatbot training timestamp
            $chatbot->update([
                'last_trained_at' => now(),
                'training_data_sources' => array_merge(
                    $chatbot->training_data_sources ?? [],
                    [$data['source'] ?? 'manual_training']
                )
            ]);

            $trainingDuration = microtime(true) - $startTime;

            // Clear cache
            $this->clearChatbotCache();

            // Log the training
            Log::info('Chatbot trained', [
                'chatbot_id' => $chatbot->id,
                'training_items_count' => $trainingItemsCount,
                'training_duration' => $trainingDuration,
                'trained_by' => $this->getCurrentUserId()
            ]);

            return [
                'chatbot_id' => $chatbot->id,
                'training_items_count' => $trainingItemsCount,
                'training_duration' => round($trainingDuration, 2),
                'last_trained_at' => $chatbot->last_trained_at
            ];
        });
    }

    /**
     * Process a message with the chatbot.
     */
    public function processMessage(string $id, array $data): array
    {
        return DB::transaction(function () use ($id, $data) {
            $chatbot = $this->getItemById($id);

            if (!$chatbot) {
                throw ValidationException::withMessages([
                    'id' => ['Chatbot not found.']
                ]);
            }

            $startTime = microtime(true);

            // Get or create chat session
            $session = $this->getOrCreateSession($data['session_id'] ?? null, $chatbot);

            // Create customer message
            $customerMessage = Message::create([
                'organization_id' => $this->getCurrentOrganizationId(),
                'chat_session_id' => $session->id,
                'sender_type' => 'customer',
                'sender_id' => $data['customer_id'] ?? null,
                'message_type' => 'text',
                'content' => $data['message'],
                'metadata' => $data['metadata'] ?? []
            ]);

            // Process the message with AI
            $aiResponse = $this->generateAIResponse($chatbot, $data['message'], $session);

            // Create bot response message
            $botMessage = Message::create([
                'organization_id' => $this->getCurrentOrganizationId(),
                'chat_session_id' => $session->id,
                'sender_type' => 'bot',
                'sender_id' => $chatbot->id,
                'message_type' => 'text',
                'content' => $aiResponse['content'],
                'metadata' => $aiResponse['metadata'] ?? []
            ]);

            // Update session statistics
            $session->increment('total_messages');
            $session->increment('bot_messages');
            $session->update(['last_activity_at' => now()]);

            $responseTime = microtime(true) - $startTime;

            // Log the interaction
            Log::info('Chatbot message processed', [
                'chatbot_id' => $chatbot->id,
                'session_id' => $session->id,
                'response_time' => $responseTime,
                'message_length' => strlen($data['message'])
            ]);

            return [
                'session_id' => $session->id,
                'bot_response' => $aiResponse['content'],
                'response_time' => round($responseTime, 2),
                'confidence_score' => $aiResponse['confidence'] ?? 0.8,
                'suggested_actions' => $aiResponse['suggested_actions'] ?? [],
                'metadata' => $aiResponse['metadata'] ?? []
            ];
        });
    }

    /**
     * Get chatbot statistics with Laravel 12 optimizations.
     */
    public function getChatbotStatistics(string $id): array
    {
        $chatbot = $this->getItemById($id);

        if (!$chatbot) {
            return [];
        }

        $cacheKey = $this->getCacheKey("chatbot_stats_{$id}");

        return $this->rememberWithOrganization($cacheKey, 300, function () use ($chatbot) {
            // Use Laravel 12 optimized query with selectRaw for better performance
            $stats = ChatSession::where('organization_id', $chatbot->organization_id)
                ->where('bot_personality_id', $chatbot->id)
                ->selectRaw('
                    COUNT(*) as total_sessions,
                    SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_sessions,
                    AVG(response_time_avg) as avg_response_time,
                    AVG(satisfaction_rating) as satisfaction_score
                ')
                ->first();

            $totalMessages = Message::where('organization_id', $chatbot->organization_id)
                ->where('sender_id', $chatbot->id)
                ->count();

            return [
                'total_conversations' => $stats->total_sessions ?? 0,
                'active_conversations' => $stats->active_sessions ?? 0,
                'total_messages' => $totalMessages,
                'avg_response_time' => round($stats->avg_response_time ?? 0, 2),
                'satisfaction_score' => round($stats->satisfaction_score ?? 0, 2),
                'last_activity_at' => $chatbot->last_activity_at,
                'created_at' => $chatbot->created_at
            ];
        });
    }

    /**
     * Test chatbot configuration.
     */
    public function testConfiguration(string $id): array
    {
        $chatbot = $this->getItemById($id);

        if (!$chatbot) {
            return [];
        }

        $tests = [
            'ai_model_connection' => $this->testAIModelConnection($chatbot),
            'greeting_message' => !empty($chatbot->greeting_message),
            'fallback_message' => !empty($chatbot->fallback_message),
            'language_support' => $this->testLanguageSupport($chatbot),
            'response_templates' => !empty($chatbot->response_templates)
        ];

        $allPassed = collect($tests)->every(fn($test) => $test === true);

        return [
            'status' => $allPassed ? 'passed' : 'failed',
            'tests' => $tests,
            'overall_score' => round((collect($tests)->sum() / count($tests)) * 100, 1)
        ];
    }

    /**
     * Apply chatbot specific filters.
     */
    protected function applyChatbotFilters($query, array $filters): void
    {
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['language'])) {
            $query->where('language', $filters['language']);
        }

        if (isset($filters['ai_model_id'])) {
            $query->where('ai_model_id', $filters['ai_model_id']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        if (isset($filters['tone'])) {
            $query->where('tone', $filters['tone']);
        }

        if (isset($filters['communication_style'])) {
            $query->where('communication_style', $filters['communication_style']);
        }
    }

    /**
     * Apply chatbot specific sorting.
     */
    protected function applyChatbotSorting($query, Request $request): void
    {
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        $allowedSortFields = [
            'name', 'created_at', 'updated_at', 'last_activity_at',
            'total_conversations', 'total_messages', 'satisfaction_score'
        ];

        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }
    }

    /**
     * Generate unique code for chatbot.
     */
    protected function generateUniqueCode(string $name, ?string $excludeId = null): string
    {
        $baseCode = Str::slug($name, '_');
        $code = $baseCode;
        $counter = 1;

        $query = $this->getModel()->newQuery()
            ->where('organization_id', $this->getCurrentOrganizationId())
            ->where('code', $code);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        while ($query->exists()) {
            $code = $baseCode . '_' . $counter;
            $query->where('code', $code);
            $counter++;
        }

        return $code;
    }

    /**
     * Get or create chat session.
     */
    protected function getOrCreateSession(?string $sessionId, BotPersonality $chatbot): ChatSession
    {
        if ($sessionId) {
            $session = ChatSession::where('id', $sessionId)
                ->where('organization_id', $this->getCurrentOrganizationId())
                ->first();

            if ($session) {
                return $session;
            }
        }

        return ChatSession::create([
            'organization_id' => $this->getCurrentOrganizationId(),
            'bot_personality_id' => $chatbot->id,
            'session_token' => Str::uuid(),
            'session_type' => 'bot',
            'started_at' => now(),
            'is_active' => true,
            'is_bot_session' => true
        ]);
    }

    /**
     * Generate AI response for the message.
     */
    protected function generateAIResponse(BotPersonality $chatbot, string $message, ChatSession $session): array
    {
        // This is a simplified AI response generation
        // In a real implementation, you would integrate with your AI service

        $responses = [
            'Hello' => $chatbot->greeting_message,
            'Goodbye' => $chatbot->farewell_message,
            'Thank you' => 'You\'re welcome! Is there anything else I can help you with?',
            'Help' => 'I\'m here to help! What would you like to know?'
        ];

        $messageLower = strtolower($message);
        $response = $chatbot->fallback_message;

        foreach ($responses as $keyword => $reply) {
            if (str_contains($messageLower, strtolower($keyword))) {
                $response = $reply;
                break;
            }
        }

        return [
            'content' => $response,
            'confidence' => 0.8,
            'metadata' => [
                'model_used' => $chatbot->ai_model_id,
                'response_time' => 0.5,
                'tokens_used' => strlen($response)
            ]
        ];
    }

    /**
     * Test AI model connection.
     */
    protected function testAIModelConnection(BotPersonality $chatbot): bool
    {
        if (!$chatbot->ai_model_id) {
            return false;
        }

        $aiModel = AiModel::find($chatbot->ai_model_id);
        return $aiModel && $aiModel->is_active;
    }

    /**
     * Test language support.
     */
    protected function testLanguageSupport(BotPersonality $chatbot): bool
    {
        $supportedLanguages = ['indonesia', 'english'];
        return in_array($chatbot->language, $supportedLanguages);
    }

    /**
     * Check if user can edit the chatbot.
     */
    protected function canEditChatbot(BotPersonality $chatbot): bool
    {
        $user = $this->getCurrentUser();

        // Super admin can edit anything
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Check if user has edit permission
        return $user->hasPermission('bots.edit');
    }

    /**
     * Check if user can delete the chatbot.
     */
    protected function canDeleteChatbot(BotPersonality $chatbot): bool
    {
        $user = $this->getCurrentUser();

        // Super admin can delete anything
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Check if user has delete permission
        return $user->hasPermission('bots.delete');
    }

    /**
     * Check if user can train the chatbot.
     */
    protected function canTrainChatbot(BotPersonality $chatbot): bool
    {
        $user = $this->getCurrentUser();

        // Super admin can train anything
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Check if user has train permission
        return $user->hasPermission('bots.train');
    }

    /**
     * Clear chatbot cache.
     */
    protected function clearChatbotCache(): void
    {
        $organizationId = $this->getCurrentOrganizationId();

        $patterns = [
            "chatbot_*_org_{$organizationId}",
            "chatbot_stats_*"
        ];

        $this->clearCacheByPatterns($patterns);
    }

    /**
     * Get optimized relations based on request parameters.
     */
    protected function getOptimizedRelations(?Request $request = null): array
    {
        $baseRelations = [
            'aiModel:id,name,provider,model_name,is_active',
            'organization:id,name,org_code'
        ];

        if ($request) {
            if ($request->has('include')) {
                $includeRelations = explode(',', $request->get('include'));
                $baseRelations = array_merge($baseRelations, $includeRelations);
            }

            if ($request->get('include_channels', false)) {
                $baseRelations[] = 'channelConfigs:id,name,channel_type,is_active';
            }
        }

        return array_unique($baseRelations);
    }


    /**
     * Get current organization ID.
     */
    protected function getCurrentOrganizationId(): string
    {
        $user = $this->getCurrentUser();
        return $user->organization_id ?? '';
    }

    /**
     * Get current user ID.
     */
    protected function getCurrentUserId(): string
    {
        return $this->getCurrentUser()->id;
    }

    /**
     * Get current user.
     */
    protected function getCurrentUser(): \App\Models\User
    {
        return Auth::user();
    }
}
