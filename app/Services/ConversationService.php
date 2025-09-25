<?php

namespace App\Services;

use App\Models\ChatSession;
use App\Models\Message;
use App\Models\Customer;
use App\Models\Agent;
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

class ConversationService extends BaseService
{
    use CacheHelper;
    /**
     * Get the model for the service.
     */
    protected function getModel(): \Illuminate\Database\Eloquent\Model
    {
        return new ChatSession();
    }

    /**
     * Get all conversations with advanced filtering and pagination.
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
                'id', 'organization_id', 'customer_id', 'channel_config_id', 'agent_id',
                'session_token', 'session_type', 'started_at', 'ended_at', 'last_activity_at',
                'first_response_at', 'is_active', 'is_bot_session', 'handover_reason',
                'handover_at', 'total_messages', 'customer_messages', 'bot_messages',
                'agent_messages', 'response_time_avg', 'resolution_time', 'wait_time',
                'satisfaction_rating', 'feedback_text', 'feedback_tags', 'csat_submitted_at',
                'intent', 'category', 'subcategory', 'priority', 'tags', 'is_resolved',
                'resolved_at', 'resolution_type', 'resolution_notes', 'sentiment_analysis',
                'ai_summary', 'topics_discussed', 'session_data', 'metadata',
                'created_at', 'updated_at'
            ]);
        }

        if (Auth::user()->role !== 'super_admin') {
            // Apply organization filter for non-super admins
            $query->where('organization_id', $this->getCurrentOrganizationId());
        }

        // Apply filters
        $this->applyConversationFilters($query, $filters);

        // Apply search
        if ($request && $request->has('search')) {
            $query->search($request->get('search'));
        }

        // Apply sorting
        if ($request) {
            $this->applyConversationSorting($query, $request);
        }

        // Return paginated or all results
        if ($request && $request->has('per_page')) {
            $perPage = min(100, max(1, (int) $request->get('per_page', 15)));
            return $query->paginate($perPage);
        }

        return $query->get();
    }

    /**
     * Get conversation by ID with relations.
     */
    public function getItemById(string $id, array $relations = ['customer', 'agent', 'botPersonality', 'messages']): ?ChatSession
    {
        $query = $this->getModel()->newQuery();

        if (!empty($relations)) {
            $query->with($relations);
        }

        return $query->where('organization_id', $this->getCurrentOrganizationId())
                    ->find($id);
    }

    /**
     * Create a new conversation.
     */
    public function createItem(array $data): ChatSession
    {
        return DB::transaction(function () use ($data) {
            // Set organization ID
            $data['organization_id'] = $this->getCurrentOrganizationId();

            // Generate session token if not provided
            if (!isset($data['session_token'])) {
                $data['session_token'] = Str::uuid();
            }

            // Set default values
            $data['session_type'] = $data['session_type'] ?? 'customer';
            $data['started_at'] = $data['started_at'] ?? now();
            $data['is_active'] = $data['is_active'] ?? true;
            $data['is_bot_session'] = $data['is_bot_session'] ?? false;
            $data['total_messages'] = 0;
            $data['customer_messages'] = 0;
            $data['bot_messages'] = 0;
            $data['agent_messages'] = 0;

            // Create the conversation
            $conversation = $this->getModel()->create($data);

            // Clear cache
            $this->clearConversationCache();

            // Log the creation
            Log::info('Conversation created', [
                'conversation_id' => $conversation->id,
                'session_type' => $conversation->session_type,
                'organization_id' => $conversation->organization_id
            ]);

            return $conversation;
        });
    }

    /**
     * Send a message in a conversation.
     */
    public function sendMessage(string $conversationId, array $data): array
    {
        return DB::transaction(function () use ($conversationId, $data) {
            $conversation = $this->getItemById($conversationId);

            if (!$conversation) {
                throw ValidationException::withMessages([
                    'conversation_id' => ['Conversation not found.']
                ]);
            }

            // Check if conversation is active
            if (!$conversation->is_active) {
                throw ValidationException::withMessages([
                    'conversation' => ['Conversation is not active.']
                ]);
            }

            // Create the message
            $message = Message::create([
                'organization_id' => $this->getCurrentOrganizationId(),
                'chat_session_id' => $conversation->id,
                'sender_type' => $data['sender_type'],
                'sender_id' => $data['sender_id'] ?? null,
                'message_type' => $data['message_type'] ?? 'text',
                'content' => $data['content'],
                'metadata' => $data['metadata'] ?? []
            ]);

            // Update conversation statistics
            $this->updateConversationStats($conversation, $data['sender_type']);

            // Update last activity
            $conversation->update(['last_activity_at' => now()]);

            // Clear cache
            $this->clearConversationCache();

            // Log the message
            Log::info('Message sent', [
                'conversation_id' => $conversation->id,
                'message_id' => $message->id,
                'sender_type' => $message->sender_type
            ]);

            return [
                'message' => $message,
                'conversation' => $conversation->fresh()
            ];
        });
    }

    /**
     * Get messages for a conversation.
     */
    public function getMessages(string $conversationId, Request $request): Collection|LengthAwarePaginator
    {
        $conversation = $this->getItemById($conversationId);

        if (!$conversation) {
            throw ValidationException::withMessages([
                'conversation_id' => ['Conversation not found.']
            ]);
        }

        $query = Message::where('chat_session_id', $conversationId)
            ->where('organization_id', $this->getCurrentOrganizationId())
            ->orderBy('created_at', 'asc');

        // Apply pagination
        if ($request->has('per_page')) {
            $perPage = min(100, max(1, (int) $request->get('per_page', 20)));
            return $query->paginate($perPage);
        }

        return $query->get();
    }

    /**
     * End a conversation.
     */
    public function end(string $conversationId): ?ChatSession
    {
        return DB::transaction(function () use ($conversationId) {
            $conversation = $this->getItemById($conversationId);

            if (!$conversation) {
                return null;
            }

            // Check if user has permission to end conversation
            if (!$this->canEndConversation($conversation)) {
                throw ValidationException::withMessages([
                    'permission' => ['You do not have permission to end this conversation.']
                ]);
            }

            // Calculate resolution time
            $resolutionTime = $conversation->started_at->diffInMinutes(now());

            // Update conversation
            $conversation->update([
                'is_active' => false,
                'ended_at' => now(),
                'resolution_time' => $resolutionTime,
                'is_resolved' => true,
                'resolved_at' => now(),
                'resolution_type' => 'manual'
            ]);

            // Clear cache
            $this->clearConversationCache();

            // Log the end
            Log::info('Conversation ended', [
                'conversation_id' => $conversation->id,
                'resolution_time' => $resolutionTime,
                'ended_by' => $this->getCurrentUserId()
            ]);

            return $conversation->fresh();
        });
    }

    /**
     * Transfer conversation to agent.
     */
    public function transfer(string $conversationId, array $data): ?ChatSession
    {
        return DB::transaction(function () use ($conversationId, $data) {
            $conversation = $this->getItemById($conversationId);

            if (!$conversation) {
                return null;
            }

            // Check if user has permission to transfer conversation
            if (!$this->canTransferConversation($conversation)) {
                throw ValidationException::withMessages([
                    'permission' => ['You do not have permission to transfer this conversation.']
                ]);
            }

            // Update conversation
            $conversation->update([
                'agent_id' => $data['agent_id'],
                'handover_reason' => $data['reason'] ?? 'Manual transfer',
                'handover_at' => now(),
                'is_bot_session' => false,
                'session_type' => 'agent'
            ]);

            // Clear cache
            $this->clearConversationCache();

            // Log the transfer
            Log::info('Conversation transferred', [
                'conversation_id' => $conversation->id,
                'agent_id' => $data['agent_id'],
                'reason' => $data['reason'] ?? 'Manual transfer',
                'transferred_by' => $this->getCurrentUserId()
            ]);

            return $conversation->fresh();
        });
    }

    /**
     * Get conversation statistics with Laravel 12 optimizations.
     */
    public function getStatistics(array $filters = []): array
    {
        $cacheKey = $this->getCacheKey('conversation_stats_' . md5(serialize($filters)));

        return $this->rememberWithOrganization($cacheKey, 300, function () use ($filters) {
            $query = $this->getModel()->newQuery()
                ->where('organization_id', $this->getCurrentOrganizationId());

            // Apply date filters
            if (isset($filters['date_from'])) {
                $query->where('started_at', '>=', $filters['date_from']);
            }
            if (isset($filters['date_to'])) {
                $query->where('started_at', '<=', $filters['date_to']);
            }

            // Apply other filters
            if (isset($filters['session_type'])) {
                $query->where('session_type', $filters['session_type']);
            }
            if (isset($filters['agent_id'])) {
                $query->where('agent_id', $filters['agent_id']);
            }

            // Use Laravel 12 optimized single query with selectRaw for better performance
            $stats = $query->selectRaw('
                COUNT(*) as total_conversations,
                SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_conversations,
                SUM(CASE WHEN is_bot_session = true THEN 1 ELSE 0 END) as bot_sessions,
                SUM(CASE WHEN is_bot_session = false THEN 1 ELSE 0 END) as agent_sessions,
                SUM(CASE WHEN is_resolved = true THEN 1 ELSE 0 END) as resolved_conversations,
                AVG(CASE WHEN resolution_time IS NOT NULL THEN resolution_time END) as avg_resolution_time,
                AVG(CASE WHEN response_time_avg IS NOT NULL THEN response_time_avg END) as avg_response_time,
                AVG(CASE WHEN satisfaction_rating IS NOT NULL THEN satisfaction_rating END) as avg_satisfaction_rating
            ')->first();

            $resolutionRate = $stats->total_conversations > 0
                ? round(($stats->resolved_conversations / $stats->total_conversations) * 100, 2)
                : 0;

            return [
                'total_conversations' => $stats->total_conversations ?? 0,
                'active_conversations' => $stats->active_conversations ?? 0,
                'bot_sessions' => $stats->bot_sessions ?? 0,
                'agent_sessions' => $stats->agent_sessions ?? 0,
                'resolved_conversations' => $stats->resolved_conversations ?? 0,
                'avg_resolution_time' => round($stats->avg_resolution_time ?? 0, 2),
                'avg_response_time' => round($stats->avg_response_time ?? 0, 2),
                'avg_satisfaction_rating' => round($stats->avg_satisfaction_rating ?? 0, 2),
                'resolution_rate' => $resolutionRate
            ];
        });
    }

    /**
     * Apply conversation specific filters.
     */
    protected function applyConversationFilters($query, array $filters): void
    {
        if (isset($filters['status'])) {
            if ($filters['status'] === 'active') {
                $query->where('is_active', true);
            } elseif ($filters['status'] === 'ended') {
                $query->where('is_active', false);
            }
        }

        if (isset($filters['session_type'])) {
            $query->where('session_type', $filters['session_type']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        if (isset($filters['is_bot_session'])) {
            $query->where('is_bot_session', $filters['is_bot_session']);
        }

        if (isset($filters['agent_id'])) {
            $query->where('agent_id', $filters['agent_id']);
        }

        if (isset($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        if (isset($filters['date_from'])) {
            $query->where('started_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('started_at', '<=', $filters['date_to']);
        }

        if (isset($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        if (isset($filters['is_resolved'])) {
            $query->where('is_resolved', $filters['is_resolved']);
        }
    }

    /**
     * Apply conversation specific sorting.
     */
    protected function applyConversationSorting($query, Request $request): void
    {
        $sortBy = $request->get('sort_by', 'started_at');
        $sortOrder = $request->get('sort_order', 'desc');

        $allowedSortFields = [
            'started_at', 'ended_at', 'last_activity_at', 'total_messages',
            'response_time_avg', 'resolution_time', 'satisfaction_rating', 'priority'
        ];

        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('started_at', 'desc');
        }
    }

    /**
     * Update conversation statistics.
     */
    protected function updateConversationStats(ChatSession $conversation, string $senderType): void
    {
        $conversation->increment('total_messages');

        switch ($senderType) {
            case 'customer':
                $conversation->increment('customer_messages');
                break;
            case 'bot':
                $conversation->increment('bot_messages');
                break;
            case 'agent':
                $conversation->increment('agent_messages');
                break;
        }

        // Set first response time if this is the first non-customer message
        if (!$conversation->first_response_at && $senderType !== 'customer') {
            $firstResponseTime = $conversation->started_at->diffInSeconds(now());
            $conversation->update([
                'first_response_at' => now(),
                'response_time_avg' => $firstResponseTime
            ]);
        }
    }

    /**
     * Check if user can end the conversation.
     */
    protected function canEndConversation(ChatSession $conversation): bool
    {
        $user = $this->getCurrentUser();

        // Super admin can end any conversation
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Agent can end their own conversations
        if ($conversation->agent_id === $user->id) {
            return true;
        }

        // Check if user has end conversation permission
        return $user->hasPermission('conversations.end');
    }

    /**
     * Check if user can transfer the conversation.
     */
    protected function canTransferConversation(ChatSession $conversation): bool
    {
        $user = $this->getCurrentUser();

        // Super admin can transfer any conversation
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Agent can transfer their own conversations
        if ($conversation->agent_id === $user->id) {
            return true;
        }

        // Check if user has transfer conversation permission
        return $user->hasPermission('conversations.transfer');
    }

    /**
     * Clear conversation cache.
     */
    protected function clearConversationCache(): void
    {
        $organizationId = $this->getCurrentOrganizationId();

        $patterns = [
            "conversation_*_org_{$organizationId}",
            "conversation_stats_*"
        ];

        $this->clearCacheByPatterns($patterns);
    }

    /**
     * Get optimized relations based on request parameters.
     */
    protected function getOptimizedRelations(?Request $request = null): array
    {
        $baseRelations = [
            'customer:id,name,email,phone',
            'agent:id,display_name'
        ];

        if ($request) {
            if ($request->has('include')) {
                $includeRelations = explode(',', $request->get('include'));
                $baseRelations = array_merge($baseRelations, $includeRelations);
            }

            if ($request->get('include_bot', false)) {
                $baseRelations[] = 'botPersonality:id,name,display_name';
            }

            if ($request->get('include_messages', false)) {
                $baseRelations[] = 'messages:id,chat_session_id,sender_type,content,created_at';
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

    /**
     * Get conversation history for AI Agent workflow
     */
    public function getConversationHistory(
        string $sessionId,
        int $limit = 10,
        int $offset = 0,
        bool $includeMetadata = false
    ): array {
        try {
            // Find conversation by session ID
            $conversation = $this->getModel()->newQuery()
                ->where('session_id', $sessionId)
                ->orWhere('external_session_id', $sessionId)
                ->first();

            if (!$conversation) {
                return [
                    'success' => true,
                    'data' => [],
                    'meta' => [
                        'total' => 0,
                        'limit' => $limit,
                        'offset' => $offset,
                        'has_more' => false
                    ]
                ];
            }

            // Get messages with pagination
            $messagesQuery = Message::where('chat_session_id', $conversation->id)
                ->orderBy('created_at', 'desc')
                ->offset($offset)
                ->limit($limit + 1); // Get one extra to check if there are more

            if ($includeMetadata) {
                $messagesQuery->with(['sender']);
            }

            $messages = $messagesQuery->get();
            $hasMore = $messages->count() > $limit;

            if ($hasMore) {
                $messages = $messages->take($limit);
            }

            // Format messages for AI Agent workflow
            $formattedMessages = $messages->reverse()->map(function ($message) use ($includeMetadata) {
                $data = [
                    'id' => $message->id,
                    'message' => $message->content,
                    'sender' => $message->sender_type === 'customer' ? 'customer' : 'agent',
                    'timestamp' => $message->created_at->toISOString(),
                    'message_type' => $message->message_type ?? 'text'
                ];

                if ($includeMetadata) {
                    $data['metadata'] = [
                        'sender_id' => $message->sender_id,
                        'sender_name' => $message->sender?->display_name ?? $message->sender?->name ?? 'Unknown',
                        'message_id' => $message->id,
                        'chat_session_id' => $message->chat_session_id,
                        'created_at' => $message->created_at->toISOString(),
                        'updated_at' => $message->updated_at->toISOString()
                    ];
                }

                return $data;
            })->values();

            return [
                'success' => true,
                'data' => $formattedMessages,
                'meta' => [
                    'total' => $conversation->messages()->count(),
                    'limit' => $limit,
                    'offset' => $offset,
                    'has_more' => $hasMore,
                    'conversation_id' => $conversation->id,
                    'session_id' => $sessionId
                ]
            ];

        } catch (\Exception $e) {
            Log::error('Failed to get conversation history', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'data' => [],
                'error' => $e->getMessage(),
                'meta' => [
                    'total' => 0,
                    'limit' => $limit,
                    'offset' => $offset,
                    'has_more' => false
                ]
            ];
        }
    }

    /**
     * Log AI Agent conversation
     */
    public function logAiAgentConversation(array $data): array
    {
        try {
            DB::beginTransaction();

            $sessionId = $data['session_id'];
            $organizationId = $data['organization_id'];
            $customerMessage = $data['customer_message'];
            $agentResponse = $data['agent_response'];
            $knowledgeBaseUsed = $data['knowledge_base_used'] ?? [];
            $aiMetadata = $data['ai_metadata'] ?? [];

            // Find or create conversation
            $conversation = $this->getModel()->newQuery()
                ->where('session_id', $sessionId)
                ->orWhere('external_session_id', $sessionId)
                ->first();

            if (!$conversation) {
                // Create new conversation for AI Agent
                $conversation = $this->getModel()->create([
                    'id' => Str::uuid(),
                    'session_id' => $sessionId,
                    'external_session_id' => $sessionId,
                    'organization_id' => $organizationId,
                    'session_type' => 'ai_agent',
                    'status' => 'active',
                    'is_bot_session' => true,
                    'platform' => 'whatsapp',
                    'channel' => 'waha',
                    'started_at' => now(),
                    'metadata' => [
                        'ai_agent' => true,
                        'knowledge_base_used' => $knowledgeBaseUsed,
                        'ai_metadata' => $aiMetadata
                    ]
                ]);
            } else {
                // Update existing conversation metadata
                $existingMetadata = $conversation->metadata ?? [];
                $conversation->update([
                    'metadata' => array_merge($existingMetadata, [
                        'last_ai_interaction' => now()->toISOString(),
                        'knowledge_base_used' => $knowledgeBaseUsed,
                        'ai_metadata' => $aiMetadata
                    ]),
                    'updated_at' => now()
                ]);
            }

            $messageIds = [];

            // Log customer message
            $customerMessageRecord = Message::create([
                'id' => Str::uuid(),
                'chat_session_id' => $conversation->id,
                'sender_type' => 'customer',
                'sender_id' => null, // AI Agent doesn't have specific customer ID
                'content' => $customerMessage,
                'message_type' => 'text',
                'platform' => 'whatsapp',
                'external_message_id' => $aiMetadata['customer_message_id'] ?? null,
                'metadata' => [
                    'ai_processed' => true,
                    'session_id' => $sessionId,
                    'organization_id' => $organizationId
                ],
                'created_at' => now(),
                'updated_at' => now()
            ]);

            $messageIds[] = $customerMessageRecord->id;

            // Log agent (AI) response
            $agentMessageRecord = Message::create([
                'id' => Str::uuid(),
                'chat_session_id' => $conversation->id,
                'sender_type' => 'agent',
                'sender_id' => null, // AI Agent
                'content' => $agentResponse,
                'message_type' => 'text',
                'platform' => 'whatsapp',
                'external_message_id' => $aiMetadata['agent_message_id'] ?? null,
                'metadata' => [
                    'ai_generated' => true,
                    'knowledge_base_used' => $knowledgeBaseUsed,
                    'ai_metadata' => $aiMetadata,
                    'session_id' => $sessionId,
                    'organization_id' => $organizationId
                ],
                'created_at' => now(),
                'updated_at' => now()
            ]);

            $messageIds[] = $agentMessageRecord->id;

            // Update conversation stats
            $conversation->increment('message_count', 2);
            $conversation->touch(); // Update updated_at

            DB::commit();

            Log::info('AI Agent conversation logged successfully', [
                'session_id' => $sessionId,
                'conversation_id' => $conversation->id,
                'organization_id' => $organizationId,
                'message_count' => 2
            ]);

            return [
                'success' => true,
                'conversation_id' => $conversation->id,
                'message_ids' => $messageIds,
                'session_id' => $sessionId,
                'organization_id' => $organizationId
            ];

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to log AI Agent conversation', [
                'session_id' => $data['session_id'] ?? null,
                'organization_id' => $data['organization_id'] ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'session_id' => $data['session_id'] ?? null,
                'organization_id' => $data['organization_id'] ?? null
            ];
        }
    }

    // ====================================================================
    // ENHANCED FILTERING & TEMPLATE METHODS
    // ====================================================================

    /**
     * Get filter options for conversations
     */
    public function getFilterOptions(string $organizationId): array
    {
        return [
            'status_options' => ['active', 'pending', 'resolved', 'closed', 'escalated'],
            'priority_options' => ['low', 'normal', 'high', 'urgent'],
            'channel_options' => ['whatsapp', 'webchat', 'facebook', 'email', 'telegram'],
            'date_ranges' => ['today', 'yesterday', 'week', 'month', 'custom'],
            'custom_filters' => [
                'has_ai_suggestions' => 'boolean',
                'requires_human' => 'boolean',
                'assigned_agent' => 'string',
                'customer_satisfaction' => 'string'
            ]
        ];
    }

    /**
     * Get conversation templates
     */
    public function getTemplates(string $organizationId, string $category = 'all'): \Illuminate\Support\Collection
    {
        // This would typically query from a templates table
        // For now, return sample templates
        $templates = collect([
            (object) [
                'id' => 'template_1',
                'name' => 'Greeting Template',
                'category' => 'greeting',
                'content' => 'Hello! How can I help you today?',
                'variables' => ['customer_name'],
                'usage_count' => 15,
                'last_used' => now()->subHours(2),
                'is_favorite' => true,
                'tags' => ['welcome', 'friendly'],
                'created_by' => 'system'
            ],
            (object) [
                'id' => 'template_2',
                'name' => 'Closing Template',
                'category' => 'closing',
                'content' => 'Thank you for contacting us. Have a great day!',
                'variables' => [],
                'usage_count' => 8,
                'last_used' => now()->subHours(5),
                'is_favorite' => false,
                'tags' => ['closing', 'polite'],
                'created_by' => 'system'
            ],
            (object) [
                'id' => 'template_3',
                'name' => 'Escalation Template',
                'category' => 'escalation',
                'content' => 'I understand your concern. Let me transfer you to a specialist who can better assist you.',
                'variables' => ['issue_type'],
                'usage_count' => 3,
                'last_used' => now()->subDays(1),
                'is_favorite' => false,
                'tags' => ['escalation', 'professional'],
                'created_by' => 'system'
            ]
        ]);

        if ($category !== 'all') {
            $templates = $templates->filter(function ($template) use ($category) {
                return $template->category === $category;
            });
        }

        return $templates;
    }

    /**
     * Save conversation template
     */
    public function saveTemplate(array $data): object
    {
        // This would typically save to a templates table
        // For now, return a mock template object
        return (object) [
            'id' => 'template_' . uniqid(),
            'name' => $data['name'],
            'category' => $data['category'],
            'content' => $data['content'],
            'variables' => $data['variables'] ?? [],
            'tags' => $data['tags'] ?? [],
            'is_favorite' => $data['is_favorite'] ?? false,
            'created_by' => $data['created_by'],
            'organization_id' => $data['organization_id'],
            'created_at' => now(),
            'updated_at' => now()
        ];
    }

}
