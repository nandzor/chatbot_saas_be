<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\CreateChatSessionRequest;
use App\Http\Requests\UpdateChatSessionRequest;
use App\Http\Requests\TransferSessionRequest;
use App\Http\Requests\EndSessionRequest;
use App\Http\Requests\SendMessageRequest;
use App\Http\Resources\ChatSessionResource;
use App\Http\Resources\MessageResource;
use App\Http\Resources\InboxStatsResource;
use App\Http\Resources\BotPersonalityResource;
use App\Services\InboxService;
use App\Services\BotPersonalityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;

class InboxController extends BaseApiController
{
    protected InboxService $inboxService;
    protected BotPersonalityService $botPersonalityService;

    public function __construct(InboxService $inboxService, BotPersonalityService $botPersonalityService)
    {
        $this->inboxService = $inboxService;
        $this->botPersonalityService = $botPersonalityService;
    }

    /**
     * Get inbox statistics
     */
    public function statistics(Request $request): JsonResponse
    {
        try {
            $filters = $this->getFilterParams($request, [
                'date_from', 'date_to', 'session_type', 'agent_id', 'status'
            ]);

            $stats = $this->inboxService->getInboxStatistics($filters);

            $this->logApiAction('inbox_statistics_retrieved', [
                'filters' => $filters
            ]);

            return $this->successResponseWithLog(
                'inbox_statistics_retrieved',
                'Inbox statistics retrieved successfully',
                new InboxStatsResource($stats)
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'inbox_statistics_error',
                'Failed to retrieve inbox statistics',
                $e->getMessage(),
                500,
                'INBOX_STATISTICS_ERROR'
            );
        }
    }

    /**
     * Get all chat sessions for inbox
     */
    public function sessions(Request $request): JsonResponse
    {
        try {
            $pagination = $this->getPaginationParams($request);
            $filters = $this->getFilterParams($request, [
                'status', 'session_type', 'is_active', 'is_bot_session', 'agent_id', 'customer_id',
                'priority', 'is_resolved', 'date_from', 'date_to'
            ]);

            $sessions = $this->inboxService->getSessions($request, $filters, [
                'customer', 'agent', 'botPersonality', 'channelConfig', 'messages'
            ]);

            $this->logApiAction('inbox_sessions_listed', [
                'filters' => $filters,
                'pagination' => $pagination
            ]);

            return $this->successResponseWithLog(
                'inbox_sessions_listed',
                'Chat sessions retrieved successfully',
                $sessions->through(fn($session) => new ChatSessionResource($session)),
                200,
                ['pagination' => $pagination]
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'inbox_sessions_list_error',
                'Failed to retrieve chat sessions',
                $e->getMessage(),
                500,
                'INBOX_SESSIONS_LIST_ERROR'
            );
        }
    }

    /**
     * Get active sessions
     */
    public function activeSessions(Request $request): JsonResponse
    {
        try {
            $pagination = $this->getPaginationParams($request);
            $filters = $this->getFilterParams($request, [
                'agent_id', 'session_type', 'priority'
            ]);

            $sessions = $this->inboxService->getActiveSessions($request, $filters, [
                'customer', 'agent', 'botPersonality', 'channelConfig'
            ]);

            $this->logApiAction('active_sessions_listed', [
                'filters' => $filters,
                'pagination' => $pagination
            ]);

            return $this->successResponseWithLog(
                'active_sessions_listed',
                'Active sessions retrieved successfully',
                $sessions->through(fn($session) => new ChatSessionResource($session)),
                200,
                ['pagination' => $pagination]
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'active_sessions_list_error',
                'Failed to retrieve active sessions',
                $e->getMessage(),
                500,
                'ACTIVE_SESSIONS_LIST_ERROR'
            );
        }
    }

    /**
     * Get pending sessions
     */
    public function pendingSessions(Request $request): JsonResponse
    {
        try {
            $pagination = $this->getPaginationParams($request);
            $filters = $this->getFilterParams($request, [
                'session_type', 'priority', 'wait_time_min'
            ]);

            $sessions = $this->inboxService->getPendingSessions($request, $filters, [
                'customer', 'agent', 'botPersonality', 'channelConfig'
            ]);

            $this->logApiAction('pending_sessions_listed', [
                'filters' => $filters,
                'pagination' => $pagination
            ]);

            return $this->successResponseWithLog(
                'pending_sessions_listed',
                'Pending sessions retrieved successfully',
                $sessions->through(fn($session) => new ChatSessionResource($session)),
                200,
                ['pagination' => $pagination]
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'pending_sessions_list_error',
                'Failed to retrieve pending sessions',
                $e->getMessage(),
                500,
                'PENDING_SESSIONS_LIST_ERROR'
            );
        }
    }

    /**
     * Get a specific chat session
     */
    public function showSession(string $id): JsonResponse
    {
        try {
            $session = $this->inboxService->getSessionById($id, [
                'customer', 'agent', 'botPersonality', 'channelConfig', 'messages'
            ]);

            if (!$session) {
                return $this->errorResponseWithLog(
                    'session_not_found',
                    'Chat session not found',
                    "Chat session with ID {$id} not found",
                    404,
                    'SESSION_NOT_FOUND'
                );
            }

            $this->logApiAction('session_viewed', [
                'session_id' => $session->id,
                'session_type' => $session->session_type
            ]);

            return $this->successResponseWithLog(
                'session_viewed',
                'Chat session retrieved successfully',
                new ChatSessionResource($session)
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'session_retrieval_error',
                'Failed to retrieve chat session',
                $e->getMessage(),
                500,
                'SESSION_RETRIEVAL_ERROR'
            );
        }
    }

    /**
     * Create a new chat session
     */
    public function createSession(CreateChatSessionRequest $request): JsonResponse
    {
        try {
            $session = $this->inboxService->createSession($request->validated());

            $this->logApiAction('session_created', [
                'session_id' => $session->id,
                'session_type' => $session->session_type,
                'customer_id' => $session->customer_id
            ]);

            return $this->successResponseWithLog(
                'session_created',
                'Chat session created successfully',
                new ChatSessionResource($session),
                201
            );
        } catch (ValidationException $e) {
            return $this->errorResponseWithLog(
                'session_validation_error',
                'Validation failed',
                $e->getMessage(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'session_creation_error',
                'Failed to create chat session',
                $e->getMessage(),
                500,
                'SESSION_CREATION_ERROR'
            );
        }
    }

    /**
     * Update a chat session
     */
    public function updateSession(UpdateChatSessionRequest $request, string $id): JsonResponse
    {
        try {
            $session = $this->inboxService->updateSession($id, $request->validated());

            if (!$session) {
                return $this->errorResponseWithLog(
                    'session_not_found',
                    'Chat session not found',
                    "Chat session with ID {$id} not found",
                    404,
                    'SESSION_NOT_FOUND'
                );
            }

            $this->logApiAction('session_updated', [
                'session_id' => $session->id,
                'updated_fields' => array_keys($request->validated())
            ]);

            return $this->successResponseWithLog(
                'session_updated',
                'Chat session updated successfully',
                new ChatSessionResource($session)
            );
        } catch (ValidationException $e) {
            return $this->errorResponseWithLog(
                'session_validation_error',
                'Validation failed',
                $e->getMessage(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'session_update_error',
                'Failed to update chat session',
                $e->getMessage(),
                500,
                'SESSION_UPDATE_ERROR'
            );
        }
    }

    /**
     * Transfer session to agent
     */
    public function transferSession(TransferSessionRequest $request, string $id): JsonResponse
    {
        try {
            $session = $this->inboxService->transferSession($id, $request->validated());

            if (!$session) {
                return $this->errorResponseWithLog(
                    'session_not_found',
                    'Chat session not found',
                    "Chat session with ID {$id} not found",
                    404,
                    'SESSION_NOT_FOUND'
                );
            }

            $this->logApiAction('session_transferred', [
                'session_id' => $session->id,
                'agent_id' => $request->agent_id,
                'reason' => $request->reason
            ]);

            return $this->successResponseWithLog(
                'session_transferred',
                'Session transferred successfully',
                new ChatSessionResource($session)
            );
        } catch (ValidationException $e) {
            return $this->errorResponseWithLog(
                'session_transfer_validation_error',
                'Transfer validation failed',
                $e->getMessage(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'session_transfer_error',
                'Failed to transfer session',
                $e->getMessage(),
                500,
                'SESSION_TRANSFER_ERROR'
            );
        }
    }

    /**
     * End a chat session
     */
    public function endSession(EndSessionRequest $request, string $id): JsonResponse
    {
        try {
            $session = $this->inboxService->endSession($id, $request->validated());

            if (!$session) {
                return $this->errorResponseWithLog(
                    'session_not_found',
                    'Chat session not found',
                    "Chat session with ID {$id} not found",
                    404,
                    'SESSION_NOT_FOUND'
                );
            }

            $this->logApiAction('session_ended', [
                'session_id' => $session->id,
                'resolution_type' => $request->resolution_type,
                'duration' => $session->resolution_time
            ]);

            return $this->successResponseWithLog(
                'session_ended',
                'Session ended successfully',
                new ChatSessionResource($session)
            );
        } catch (ValidationException $e) {
            return $this->errorResponseWithLog(
                'session_end_validation_error',
                'End session validation failed',
                $e->getMessage(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'session_end_error',
                'Failed to end session',
                $e->getMessage(),
                500,
                'SESSION_END_ERROR'
            );
        }
    }

    /**
     * Get session messages
     */
    public function sessionMessages(Request $request, string $id): JsonResponse
    {
        try {
            $session = $this->inboxService->getSessionById($id);

            if (!$session) {
                return $this->errorResponseWithLog(
                    'session_not_found',
                    'Chat session not found',
                    "Chat session with ID {$id} not found",
                    404,
                    'SESSION_NOT_FOUND'
                );
            }

            $pagination = $this->getPaginationParams($request);
            $filters = $this->getFilterParams($request, [
                'sender_type', 'message_type', 'is_read', 'date_from', 'date_to'
            ]);

            $messages = $this->inboxService->getSessionMessages($id, $request, $filters);

            $this->logApiAction('session_messages_retrieved', [
                'session_id' => $id,
                'filters' => $filters,
                'pagination' => $pagination
            ]);

            return $this->successResponseWithLog(
                'session_messages_retrieved',
                'Session messages retrieved successfully',
                $messages->through(fn($message) => new MessageResource($message)),
                200,
                ['pagination' => $pagination]
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'session_messages_retrieval_error',
                'Failed to retrieve session messages',
                $e->getMessage(),
                500,
                'SESSION_MESSAGES_RETRIEVAL_ERROR'
            );
        }
    }

    /**
     * Send message in session
     */
    public function sendMessage(SendMessageRequest $request, string $id): JsonResponse
    {
        try {
            $result = $this->inboxService->sendMessage($id, $request->validated());

            if (!$result) {
                return $this->errorResponseWithLog(
                    'session_not_found',
                    'Chat session not found',
                    "Chat session with ID {$id} not found",
                    404,
                    'SESSION_NOT_FOUND'
                );
            }

            $this->logApiAction('message_sent', [
                'session_id' => $id,
                'message_id' => $result['message']->id,
                'sender_type' => $result['message']->sender_type
            ]);

            return $this->successResponseWithLog(
                'message_sent',
                'Message sent successfully',
                [
                    'message' => new MessageResource($result['message']),
                    'session' => new ChatSessionResource($result['session'])
                ]
            );
        } catch (ValidationException $e) {
            return $this->errorResponseWithLog(
                'message_validation_error',
                'Message validation failed',
                $e->getMessage(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'message_send_error',
                'Failed to send message',
                $e->getMessage(),
                500,
                'MESSAGE_SEND_ERROR'
            );
        }
    }

    /**
     * Mark message as read
     */
    public function markMessageRead(string $sessionId, string $messageId): JsonResponse
    {
        try {
            $message = $this->inboxService->markMessageAsRead($sessionId, $messageId);

            if (!$message) {
                return $this->errorResponseWithLog(
                    'message_not_found',
                    'Message not found',
                    "Message with ID {$messageId} not found in session {$sessionId}",
                    404,
                    'MESSAGE_NOT_FOUND'
                );
            }

            $this->logApiAction('message_marked_read', [
                'session_id' => $sessionId,
                'message_id' => $messageId
            ]);

            return $this->successResponseWithLog(
                'message_marked_read',
                'Message marked as read',
                new MessageResource($message)
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'message_mark_read_error',
                'Failed to mark message as read',
                $e->getMessage(),
                500,
                'MESSAGE_MARK_READ_ERROR'
            );
        }
    }

    /**
     * Get session analytics
     */
    public function sessionAnalytics(Request $request, string $id): JsonResponse
    {
        try {
            $session = $this->inboxService->getSessionById($id);

            if (!$session) {
                return $this->errorResponseWithLog(
                    'session_not_found',
                    'Chat session not found',
                    "Chat session with ID {$id} not found",
                    404,
                    'SESSION_NOT_FOUND'
                );
            }

            $analytics = $this->inboxService->getSessionAnalytics($id);

            $this->logApiAction('session_analytics_retrieved', [
                'session_id' => $id
            ]);

            return $this->successResponseWithLog(
                'session_analytics_retrieved',
                'Session analytics retrieved successfully',
                $analytics
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'session_analytics_error',
                'Failed to retrieve session analytics',
                $e->getMessage(),
                500,
                'SESSION_ANALYTICS_ERROR'
            );
        }
    }

    /**
     * Export inbox data
     */
    public function export(Request $request): JsonResponse
    {
        try {
            $filters = $this->getFilterParams($request, [
                'date_from', 'date_to', 'session_type', 'agent_id', 'status', 'format'
            ]);

            $exportData = $this->inboxService->exportInboxData($filters);

            $this->logApiAction('inbox_data_exported', [
                'filters' => $filters,
                'format' => $filters['format'] ?? 'csv'
            ]);

            return $this->successResponseWithLog(
                'inbox_data_exported',
                'Inbox data exported successfully',
                $exportData
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'inbox_export_error',
                'Failed to export inbox data',
                $e->getMessage(),
                500,
                'INBOX_EXPORT_ERROR'
            );
        }
    }

    /**
     * Get bot personalities for inbox
     */
    public function botPersonalities(Request $request): JsonResponse
    {
        try {
            $organizationId = Auth::user()->organization_id;
            $personalities = $this->botPersonalityService->getPersonalitiesForInbox($request, $organizationId);

            $this->logApiAction('inbox_bot_personalities_listed', [
                'organization_id' => $organizationId,
                'count' => $personalities->count()
            ]);

            return $this->successResponseWithLog(
                'inbox_bot_personalities_listed',
                'Bot personalities retrieved successfully',
                $personalities->through(fn($personality) => new BotPersonalityResource($personality)),
                200,
                ['pagination' => [
                    'current_page' => $personalities->currentPage(),
                    'total_pages' => $personalities->lastPage(),
                    'total_items' => $personalities->total(),
                    'items_per_page' => $personalities->perPage()
                ]]
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'inbox_bot_personalities_list_error',
                'Failed to retrieve bot personalities',
                $e->getMessage(),
                500,
                'INBOX_BOT_PERSONALITIES_LIST_ERROR'
            );
        }
    }

    /**
     * Get available bot personalities for session assignment
     */
    public function availableBotPersonalities(Request $request): JsonResponse
    {
        try {
            $organizationId = Auth::user()->organization_id;
            $filters = $request->only(['language', 'ai_model_id', 'min_performance']);

            $personalities = $this->botPersonalityService->getAvailablePersonalities($organizationId, $filters);

            $this->logApiAction('inbox_available_bot_personalities_retrieved', [
                'organization_id' => $organizationId,
                'filters' => $filters,
                'count' => count($personalities)
            ]);

            return $this->successResponseWithLog(
                'inbox_available_bot_personalities_retrieved',
                'Available bot personalities retrieved successfully',
                $personalities
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'inbox_available_bot_personalities_error',
                'Failed to retrieve available bot personalities',
                $e->getMessage(),
                500,
                'INBOX_AVAILABLE_BOT_PERSONALITIES_ERROR'
            );
        }
    }

    /**
     * Assign bot personality to session
     */
    public function assignBotPersonality(Request $request, string $sessionId): JsonResponse
    {
        try {
            $request->validate([
                'personality_id' => 'required|uuid|exists:bot_personalities,id'
            ]);

            $organizationId = Auth::user()->organization_id;
            $personalityId = $request->input('personality_id');

            $assigned = $this->botPersonalityService->assignPersonalityToSession(
                $sessionId,
                $personalityId,
                $organizationId
            );

            if (!$assigned) {
                return $this->errorResponseWithLog(
                    'session_or_personality_not_found',
                    'Session or bot personality not found',
                    "Session {$sessionId} or personality {$personalityId} not found",
                    404,
                    'SESSION_OR_PERSONALITY_NOT_FOUND'
                );
            }

            $this->logApiAction('bot_personality_assigned_to_session', [
                'session_id' => $sessionId,
                'personality_id' => $personalityId,
                'organization_id' => $organizationId
            ]);

            return $this->successResponseWithLog(
                'bot_personality_assigned_to_session',
                'Bot personality assigned to session successfully',
                ['session_id' => $sessionId, 'personality_id' => $personalityId]
            );
        } catch (ValidationException $e) {
            return $this->errorResponseWithLog(
                'bot_personality_assignment_validation_error',
                'Assignment validation failed',
                $e->getMessage(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'bot_personality_assignment_error',
                'Failed to assign bot personality',
                $e->getMessage(),
                500,
                'BOT_PERSONALITY_ASSIGNMENT_ERROR'
            );
        }
    }

    /**
     * Generate AI response using bot personality
     */
    public function generateAiResponse(Request $request, string $sessionId): JsonResponse
    {
        try {
            $request->validate([
                'message' => 'required|string|max:5000',
                'personality_id' => 'required|uuid|exists:bot_personalities,id',
                'context' => 'nullable|array'
            ]);

            $organizationId = Auth::user()->organization_id;
            $personalityId = $request->input('personality_id');
            $message = $request->input('message');
            $context = $request->input('context', []);

            // Add session context
            $session = $this->inboxService->getSessionById($sessionId);
            if ($session) {
                $context['session'] = $session->toArray();
                $context['conversation_history'] = $session->messages()
                    ->orderBy('created_at', 'desc')
                    ->limit(10)
                    ->get()
                    ->map(function ($msg) {
                        return [
                            'sender_type' => $msg->sender_type,
                            'content' => $msg->content,
                            'created_at' => $msg->created_at
                        ];
                    })
                    ->toArray();
            }

            $result = $this->botPersonalityService->generateAiResponse($personalityId, $message, $context);

            if (!$result['success']) {
                return $this->errorResponseWithLog(
                    'ai_response_generation_failed',
                    'Failed to generate AI response',
                    $result['error'],
                    500,
                    'AI_RESPONSE_GENERATION_FAILED'
                );
            }

            $this->logApiAction('ai_response_generated', [
                'session_id' => $sessionId,
                'personality_id' => $personalityId,
                'message_length' => strlen($message),
                'response_length' => strlen($result['data']['content']),
                'confidence' => $result['data']['confidence']
            ]);

            return $this->successResponseWithLog(
                'ai_response_generated',
                'AI response generated successfully',
                $result['data']
            );
        } catch (ValidationException $e) {
            return $this->errorResponseWithLog(
                'ai_response_validation_error',
                'AI response validation failed',
                $e->getMessage(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'ai_response_generation_error',
                'Failed to generate AI response',
                $e->getMessage(),
                500,
                'AI_RESPONSE_GENERATION_ERROR'
            );
        }
    }

    /**
     * Get bot personality statistics
     */
    public function botPersonalityStatistics(Request $request): JsonResponse
    {
        try {
            $organizationId = Auth::user()->organization_id;
            $filters = $request->only(['date_from', 'date_to']);

            $stats = $this->botPersonalityService->getPersonalityStatistics($organizationId, $filters);

            $this->logApiAction('inbox_bot_personality_statistics_retrieved', [
                'organization_id' => $organizationId,
                'filters' => $filters
            ]);

            return $this->successResponseWithLog(
                'inbox_bot_personality_statistics_retrieved',
                'Bot personality statistics retrieved successfully',
                $stats
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'inbox_bot_personality_statistics_error',
                'Failed to retrieve bot personality statistics',
                $e->getMessage(),
                500,
                'INBOX_BOT_PERSONALITY_STATISTICS_ERROR'
            );
        }
    }

    /**
     * Get bot personality performance
     */
    public function botPersonalityPerformance(Request $request, string $personalityId): JsonResponse
    {
        try {
            $days = $request->get('days', 30);
            $performance = $this->botPersonalityService->getPersonalityPerformance($personalityId, $days);

            if (empty($performance)) {
                return $this->errorResponseWithLog(
                    'bot_personality_not_found',
                    'Bot personality not found',
                    "Bot personality with ID {$personalityId} not found",
                    404,
                    'BOT_PERSONALITY_NOT_FOUND'
                );
            }

            $this->logApiAction('inbox_bot_personality_performance_retrieved', [
                'personality_id' => $personalityId,
                'days' => $days
            ]);

            return $this->successResponseWithLog(
                'inbox_bot_personality_performance_retrieved',
                'Bot personality performance retrieved successfully',
                $performance
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'inbox_bot_personality_performance_error',
                'Failed to retrieve bot personality performance',
                $e->getMessage(),
                500,
                'INBOX_BOT_PERSONALITY_PERFORMANCE_ERROR'
            );
        }
    }

    /**
     * Assign session to agent
     */
    public function assignSession(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'agent_id' => 'required|string'
            ]);

            $agentId = $request->input('agent_id');
            $currentUser = Auth::user();

            // Handle special case where we want to assign to current user
            if ($agentId === 'current_agent' || $agentId === 'current_user') {
                // Check if current user has an agent profile
                if (!$currentUser->agent) {
                    return $this->errorResponseWithLog(
                        'user_not_agent',
                        'Current user is not an agent',
                        'User does not have an agent profile',
                        400,
                        'USER_NOT_AGENT'
                    );
                }
                $agentId = $currentUser->agent->id;
            } else {
                // Validate that the provided agent_id is a valid UUID and exists
                if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $agentId)) {
                    return $this->errorResponseWithLog(
                        'invalid_agent_id_format',
                        'Invalid agent ID format',
                        'Agent ID must be a valid UUID',
                        422,
                        'INVALID_AGENT_ID_FORMAT'
                    );
                }

                // Check if agent exists
                $agent = \App\Models\Agent::find($agentId);
                if (!$agent) {
                    return $this->errorResponseWithLog(
                        'agent_not_found',
                        'Agent not found',
                        "Agent with ID {$agentId} not found",
                        404,
                        'AGENT_NOT_FOUND'
                    );
                }
            }

            $session = $this->inboxService->assignSession($id, $agentId);

            if (!$session) {
                return $this->errorResponseWithLog(
                    'session_not_found',
                    'Session not found',
                    "Session {$id} not found",
                    404,
                    'SESSION_NOT_FOUND'
                );
            }

            $this->logApiAction('session_assigned', [
                'session_id' => $id,
                'agent_id' => $agentId,
                'organization_id' => $currentUser->organization_id
            ]);

            return $this->successResponseWithLog(
                'session_assigned',
                'Session assigned successfully',
                new ChatSessionResource($session)
            );
        } catch (ValidationException $e) {
            return $this->errorResponseWithLog(
                'session_assignment_validation_error',
                'Assignment validation failed',
                $e->getMessage(),
                422,
                'SESSION_ASSIGNMENT_VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'session_assignment_error',
                'Failed to assign session',
                $e->getMessage(),
                500,
                'SESSION_ASSIGNMENT_ERROR'
            );
        }
    }
}
