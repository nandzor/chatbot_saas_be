<?php

namespace App\Services;

use App\Models\ChatSession;
use App\Models\Message;
use App\Models\Agent;
use App\Models\Customer;
use App\Models\BotPersonality;
use App\Models\ChannelConfig;
use App\Events\MessageSent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Carbon\Carbon;

class InboxService
{

    /**
     * Get inbox statistics
     */
    public function getInboxStatistics(array $filters = []): array
    {
        $query = ChatSession::query();

        // Apply organization filter
        if (Auth::check() && Auth::user()->organization_id) {
            $query->where('organization_id', Auth::user()->organization_id);
        }

        // Apply date filters
        if (isset($filters['date_from'])) {
            $query->where('started_at', '>=', Carbon::parse($filters['date_from']));
        }
        if (isset($filters['date_to'])) {
            $query->where('started_at', '<=', Carbon::parse($filters['date_to']));
        }

        // Apply other filters
        if (isset($filters['session_type'])) {
            $query->where('session_type', $filters['session_type']);
        }
        if (isset($filters['agent_id'])) {
            $query->where('agent_id', $filters['agent_id']);
        }
        if (isset($filters['status'])) {
            $query->where('is_active', $filters['status'] === 'active');
        }

        $totalSessions = $query->count();
        $activeSessions = (clone $query)->where('is_active', true)->count();
        $pendingSessions = (clone $query)->where('is_active', true)
            ->whereNull('agent_id')
            ->where('is_bot_session', false)
            ->count();
        $resolvedSessions = (clone $query)->where('is_resolved', true)->count();

        // Calculate average response time
        $avgResponseTime = (clone $query)->whereNotNull('first_response_at')
            ->selectRaw('AVG(EXTRACT(EPOCH FROM (first_response_at - started_at))) as avg_response_time')
            ->value('avg_response_time') ?? 0;

        // Calculate satisfaction rate
        $satisfactionRate = (clone $query)->whereNotNull('satisfaction_rating')
            ->selectRaw('AVG(satisfaction_rating) as avg_rating')
            ->value('avg_rating') ?? 0;

        return [
            'total_sessions' => $totalSessions,
            'active_sessions' => $activeSessions,
            'pending_sessions' => $pendingSessions,
            'resolved_sessions' => $resolvedSessions,
            'avg_response_time' => round($avgResponseTime, 2),
            'satisfaction_rate' => round($satisfactionRate * 20, 1), // Convert to percentage
            'satisfaction_count' => (clone $query)->whereNotNull('satisfaction_rating')->count(),
            'total_messages' => (clone $query)->sum('total_messages') ?? 0,
            'avg_session_duration' => $this->calculateAverageSessionDuration($query),
            'handover_rate' => $this->calculateHandoverRate($query),
            'resolution_rate' => $this->calculateResolutionRate($query),
        ];
    }

    /**
     * Get all chat sessions with filters
     */
    public function getSessions(Request $request, array $filters = [], array $with = []): LengthAwarePaginator
    {
        $query = ChatSession::query();

        // Apply organization filter
        if (Auth::check() && Auth::user()->organization_id) {
            $query->where('organization_id', Auth::user()->organization_id);
        }

        // Apply filters
        $query = $this->applyFilters($query, $filters);

        // Apply relationships
        if (!empty($with)) {
            $query->with($with);
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'last_activity_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        // Apply pagination
        $perPage = $request->get('per_page', 15);
        return $query->paginate($perPage);
    }

    /**
     * Get active sessions
     */
    public function getActiveSessions(Request $request, array $filters = [], array $with = []): LengthAwarePaginator
    {
        $query = ChatSession::query()
            ->where('is_active', true);

        // Apply organization filter
        if (Auth::check() && Auth::user()->organization_id) {
            $query->where('organization_id', Auth::user()->organization_id);
        }

        // Apply filters
        $query = $this->applyFilters($query, $filters);

        // Apply relationships
        if (!empty($with)) {
            $query->with($with);
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'last_activity_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        // Apply pagination
        $perPage = $request->get('per_page', 15);
        return $query->paginate($perPage);
    }

    /**
     * Get pending sessions
     */
    public function getPendingSessions(Request $request, array $filters = [], array $with = []): LengthAwarePaginator
    {
        $query = ChatSession::query()
            ->where('is_active', true)
            ->whereNull('agent_id')
            ->where('is_bot_session', false);

        // Apply organization filter
        if (Auth::check() && Auth::user()->organization_id) {
            $query->where('organization_id', Auth::user()->organization_id);
        }

        // Apply filters
        $query = $this->applyFilters($query, $filters);

        // Apply wait time filter
        if (isset($filters['wait_time_min'])) {
            $waitTime = Carbon::now()->subMinutes($filters['wait_time_min']);
            $query->where('started_at', '<=', $waitTime);
        }

        // Apply relationships
        if (!empty($with)) {
            $query->with($with);
        }

        // Apply sorting by wait time
        $query->orderBy('started_at', 'asc');

        // Apply pagination
        $perPage = $request->get('per_page', 15);
        return $query->paginate($perPage);
    }

    /**
     * Get session by ID
     */
    public function getSessionById(string $id, array $with = []): ?ChatSession
    {
        $query = ChatSession::query();

        // Apply organization filter
        if (Auth::check() && Auth::user()->organization_id) {
            $query->where('organization_id', Auth::user()->organization_id);
        }

        if (!empty($with)) {
            $query->with($with);
        }

        return $query->find($id);
    }

    /**
     * Create a new chat session
     */
    public function createSession(array $data): ChatSession
    {
        // Set organization ID if not provided
        if (!isset($data['organization_id']) && Auth::check()) {
            $data['organization_id'] = Auth::user()->organization_id;
        }

        // Generate session token if not provided
        if (!isset($data['session_token'])) {
            $data['session_token'] = Str::uuid();
        }

        // Set started_at if not provided
        if (!isset($data['started_at'])) {
            $data['started_at'] = now();
        }

        // Set last_activity_at
        $data['last_activity_at'] = now();

        return ChatSession::create($data);
    }

    /**
     * Update a chat session
     */
    public function updateSession(string $id, array $data): ?ChatSession
    {
        $session = $this->getSessionById($id);

        if (!$session) {
            return null;
        }

        // Update last_activity_at if session is being modified
        $data['last_activity_at'] = now();

        $session->update($data);
        return $session->fresh();
    }

    /**
     * Transfer session to agent
     */
    public function transferSession(string $id, array $data): ?ChatSession
    {
        $session = $this->getSessionById($id);

        if (!$session) {
            return null;
        }

        // Check if agent exists and can handle more chats
        $agent = Agent::find($data['agent_id']);
        if (!$agent || !$agent->canHandleMoreChats()) {
            throw new \Exception('Agent not available or at capacity');
        }

        // Transfer session
        $session->handoverToAgent($agent, $data['reason'] ?? null);

        return $session->fresh();
    }

    /**
     * Assign session to agent
     */
    public function assignSession(string $sessionId, string $agentId): ?ChatSession
    {
        $session = $this->getSessionById($sessionId);

        if (!$session) {
            return null;
        }

        // Update the session with the assigned agent
        $session->update([
            'agent_id' => $agentId,
            'assigned_at' => now(),
            'status' => 'assigned'
        ]);

        return $session->fresh();
    }

    /**
     * End a chat session
     */
    public function endSession(string $id, array $data = []): ?ChatSession
    {
        $session = $this->getSessionById($id);

        if (!$session) {
            return null;
        }

        $session->endSession(
            $data['resolution_type'] ?? null,
            $data['resolution_notes'] ?? null
        );

        return $session->fresh();
    }

    /**
     * Get session messages
     */
    public function getSessionMessages(string $sessionId, Request $request, array $filters = []): LengthAwarePaginator
    {
        $query = Message::query()
            ->where('session_id', $sessionId);

        // Apply organization filter
        if (Auth::check() && Auth::user()->organization_id) {
            $query->where('organization_id', Auth::user()->organization_id);
        }

        // Apply filters
        if (isset($filters['sender_type'])) {
            $query->where('sender_type', $filters['sender_type']);
        }
        if (isset($filters['message_type'])) {
            $query->where('message_type', $filters['message_type']);
        }
        if (isset($filters['is_read'])) {
            $query->where('is_read', $filters['is_read']);
        }
        if (isset($filters['date_from'])) {
            $query->where('created_at', '>=', Carbon::parse($filters['date_from']));
        }
        if (isset($filters['date_to'])) {
            $query->where('created_at', '<=', Carbon::parse($filters['date_to']));
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'asc');
        $query->orderBy($sortBy, $sortDirection);

        // Apply pagination
        $perPage = $request->get('per_page', 50);
        return $query->paginate($perPage);
    }

    /**
     * Send message in session
     */
    public function sendMessage(string $sessionId, array $data): ?array
    {
        $session = $this->getSessionById($sessionId);

        if (!$session) {
            return null;
        }

        // Set organization ID if not provided
        if (!isset($data['organization_id']) && Auth::check()) {
            $data['organization_id'] = Auth::user()->organization_id;
        }

        // Set session ID
        $data['session_id'] = $sessionId;

        // Set sender information
        if (Auth::check()) {
            $data['sender_id'] = Auth::id();
            $data['sender_name'] = Auth::user()->name;
            $data['sender_type'] = 'agent';
        }

        // Set message type if not provided
        if (!isset($data['message_type'])) {
            $data['message_type'] = 'text';
        }

        // Map content to message_text for database
        if (isset($data['content'])) {
            $data['message_text'] = $data['content'];
        }

        // Set content from message_text if provided
        if (isset($data['message_text'])) {
            $data['content'] = $data['message_text'];
        }

        // Ensure content is set
        if (!isset($data['content']) && isset($data['message'])) {
            $data['content'] = $data['message'];
            $data['message_text'] = $data['message'];
        }

        // Create message
        try {
            $message = Message::create($data);
        } catch (\Exception $e) {
            Log::error('Failed to create message', [
                'session_id' => $session->id,
                'data' => $data,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }

        // Log before triggering event
        Log::info('Triggering MessageSent event', [
            'session_id' => $session->id,
            'message_id' => $message->id,
            'content' => $message->content ?? $message->message_text,
            'sender_type' => $message->sender_type
        ]);

        // Trigger MessageSent event for WAHA integration
        event(new MessageSent($message, $session, $data));

        // Update session activity
        $session->updateActivity();

        // Update message counts
        $this->updateSessionMessageCounts($session);

        return [
            'message' => $message,
            'session' => $session->fresh()
        ];
    }

    /**
     * Mark message as read
     */
    public function markMessageAsRead(string $sessionId, string $messageId): ?Message
    {
        $message = Message::where('chat_session_id', $sessionId)
            ->where('id', $messageId)
            ->first();

        if (!$message) {
            return null;
        }

        $message->markAsRead();
        return $message->fresh();
    }

    /**
     * Get session analytics
     */
    public function getSessionAnalytics(string $sessionId): array
    {
        $session = $this->getSessionById($sessionId);

        if (!$session) {
            return [];
        }

        $messages = $session->messages;
        $customerMessages = $messages->where('sender_type', 'customer');
        $agentMessages = $messages->where('sender_type', 'agent');
        $botMessages = $messages->where('sender_type', 'bot');

        return [
            'session_id' => $session->id,
            'total_messages' => $messages->count(),
            'customer_messages' => $customerMessages->count(),
            'agent_messages' => $agentMessages->count(),
            'bot_messages' => $botMessages->count(),
            'avg_response_time' => $session->response_time_avg,
            'session_duration' => $session->duration,
            'wait_time' => $session->wait_time,
            'satisfaction_rating' => $session->satisfaction_rating,
            'sentiment_analysis' => $session->sentiment_analysis,
            'topics_discussed' => $session->topics_discussed,
            'is_resolved' => $session->is_resolved,
            'resolution_type' => $session->resolution_type,
            'handover_count' => $session->hasHandover() ? 1 : 0,
            'ai_generated_messages' => $botMessages->where('ai_generated', true)->count(),
            'media_messages' => $messages->whereNotNull('media_url')->count(),
        ];
    }

    /**
     * Export inbox data
     */
    public function exportInboxData(array $filters = []): array
    {
        $query = ChatSession::query();

        // Apply organization filter
        if (Auth::check() && Auth::user()->organization_id) {
            $query->where('organization_id', Auth::user()->organization_id);
        }

        // Apply filters
        $query = $this->applyFilters($query, $filters);

        $sessions = $query->with(['customer', 'agent', 'botPersonality', 'channelConfig'])
            ->orderBy('started_at', 'desc')
            ->get();

        $format = $filters['format'] ?? 'csv';
        $filename = 'inbox_export_' . now()->format('Y-m-d_H-i-s') . '.' . $format;

        return [
            'filename' => $filename,
            'format' => $format,
            'data' => $sessions,
            'count' => $sessions->count(),
            'exported_at' => now()->toISOString(),
        ];
    }

    /**
     * Apply filters to query
     */
    private function applyFilters(Builder $query, array $filters): Builder
    {
        if (isset($filters['status'])) {
            $query->where('is_active', $filters['status'] === 'active');
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
        if (isset($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }
        if (isset($filters['is_resolved'])) {
            $query->where('is_resolved', $filters['is_resolved']);
        }
        if (isset($filters['date_from'])) {
            $query->where('started_at', '>=', Carbon::parse($filters['date_from']));
        }
        if (isset($filters['date_to'])) {
            $query->where('started_at', '<=', Carbon::parse($filters['date_to']));
        }

        return $query;
    }

    /**
     * Calculate average session duration
     */
    private function calculateAverageSessionDuration(Builder $query): float
    {
        $avgDuration = (clone $query)
            ->whereNotNull('started_at')
            ->whereNotNull('ended_at')
            ->selectRaw('AVG(EXTRACT(EPOCH FROM (ended_at - started_at))) as avg_duration')
            ->value('avg_duration');

        return round($avgDuration / 60, 2); // Convert to minutes
    }

    /**
     * Calculate handover rate
     */
    private function calculateHandoverRate(Builder $query): float
    {
        $totalSessions = (clone $query)->count();
        $handoverSessions = (clone $query)->whereNotNull('handover_at')->count();

        if ($totalSessions === 0) {
            return 0;
        }

        return round(($handoverSessions / $totalSessions) * 100, 2);
    }

    /**
     * Calculate resolution rate
     */
    private function calculateResolutionRate(Builder $query): float
    {
        $totalSessions = (clone $query)->count();
        $resolvedSessions = (clone $query)->where('is_resolved', true)->count();

        if ($totalSessions === 0) {
            return 0;
        }

        return round(($resolvedSessions / $totalSessions) * 100, 2);
    }

    /**
     * Update session message counts
     */
    private function updateSessionMessageCounts(ChatSession $session): void
    {
        $customerCount = $session->messages()->where('sender_type', 'customer')->count();
        $botCount = $session->messages()->where('sender_type', 'bot')->count();
        $agentCount = $session->messages()->where('sender_type', 'agent')->count();

        $session->update([
            'total_messages' => $customerCount + $botCount + $agentCount,
            'customer_messages' => $customerCount,
            'bot_messages' => $botCount,
            'agent_messages' => $agentCount,
        ]);
    }
}
