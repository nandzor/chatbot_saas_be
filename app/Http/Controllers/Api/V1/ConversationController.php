<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Conversation\SendMessageRequest;
use App\Http\Requests\Conversation\UpdateSessionRequest;
use App\Http\Requests\Conversation\TransferSessionRequest;
use App\Http\Requests\Conversation\ResolveSessionRequest;
use App\Http\Resources\Conversation\ConversationResource;
use App\Http\Resources\Conversation\MessageResource;
use App\Services\ConversationService;
use App\Services\MessageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ConversationController extends BaseApiController
{
    public function __construct(
        private ConversationService $conversationService,
        private MessageService $messageService
    ) {}

    /**
     * Get messages for a conversation (legacy method for existing routes)
     */
    public function messages(Request $request, string $id): JsonResponse
    {
        return $this->getMessages($request, $id);
    }

    /**
     * Get conversation details with messages
     */
    public function show(Request $request, string $sessionId): JsonResponse
    {
        try {
            $session = $this->conversationService->getItemById(
                $sessionId,
                ['customer', 'agent', 'messages']
            );

            if (!$session) {
                return $this->notFoundResponse('Session');
            }

            return $this->successResponse(
                'Conversation retrieved successfully',
                new ConversationResource($session)
            );

        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'fetch_conversation',
                'Failed to fetch conversation',
                $e->getMessage(),
                500,
                'CONVERSATION_FETCH_ERROR',
                ['session_id' => $sessionId]
            );
        }
    }

    /**
     * Get session messages with pagination
     */
    public function getMessages(Request $request, string $sessionId): JsonResponse
    {
        try {
            $perPage = $request->get('per_page', 50);
            $page = $request->get('page', 1);
            $sortBy = $request->get('sort_by', 'created_at');
            $sortDirection = $request->get('sort_direction', 'asc');

            $messages = $this->conversationService->getMessages($sessionId, $request);

            // Check if messages is paginated or collection
            if ($messages instanceof \Illuminate\Pagination\LengthAwarePaginator) {
                return $this->successResponse(
                    'Messages retrieved successfully',
                    [
                        'messages' => MessageResource::collection($messages->items()),
                        'pagination' => [
                            'current_page' => $messages->currentPage(),
                            'last_page' => $messages->lastPage(),
                            'per_page' => $messages->perPage(),
                            'total' => $messages->total(),
                            'from' => $messages->firstItem(),
                            'to' => $messages->lastItem(),
                        ]
                    ]
                );
            } else {
                return $this->successResponse(
                    'Messages retrieved successfully',
                    [
                        'messages' => MessageResource::collection($messages),
                        'pagination' => null
                    ]
                );
            }

        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'fetch_messages',
                'Failed to fetch messages',
                $e->getMessage(),
                500,
                'MESSAGES_FETCH_ERROR',
                ['session_id' => $sessionId]
            );
        }
    }

    /**
     * Send a new message
     */
    public function sendMessage(SendMessageRequest $request, string $sessionId): JsonResponse
    {
        try {
            $message = $this->messageService->sendMessage(
                $sessionId,
                Auth::user()->organization_id,
                $request->validated()
            );

            return $this->successResponse(
                'Message sent successfully',
                new MessageResource($message)
            );

        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'send_message',
                'Failed to send message',
                $e->getMessage(),
                500,
                'MESSAGE_SEND_ERROR',
                ['session_id' => $sessionId, 'request_data' => $request->validated()]
            );
        }
    }

    /**
     * Update session details
     */
    public function updateSession(UpdateSessionRequest $request, string $sessionId): JsonResponse
    {
        try {
            $session = $this->conversationService->updateSession(
                $sessionId,
                Auth::user()->organization_id,
                $request->validated()
            );

            return $this->successResponse(
                'Session updated successfully',
                new ConversationResource($session)
            );

        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'update_session',
                'Failed to update session',
                $e->getMessage(),
                500,
                'SESSION_UPDATE_ERROR',
                ['session_id' => $sessionId]
            );
        }
    }

    /**
     * Assign session to current user
     */
    public function assignToMe(Request $request, string $sessionId): JsonResponse
    {
        try {
            $session = $this->conversationService->assignToMe($sessionId);

            return $this->successResponse(
                'Session assigned successfully',
                new ConversationResource($session)
            );

        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'assign_session',
                'Unable to assign session to you: Please ensure you have the necessary permissions or contact support.',
                $e->getMessage(),
                500,
                'SESSION_ASSIGN_ERROR',
                ['session_id' => $sessionId, 'agent_id' => Auth::id()]
            );
        }
    }

    /**
     * Transfer session to another agent
     */
    public function transferSession(TransferSessionRequest $request, string $sessionId): JsonResponse
    {
        try {
            $session = $this->conversationService->transferSession(
                $sessionId,
                Auth::user()->organization_id,
                $request->validated()
            );

            return $this->successResponse(
                'Session transferred successfully',
                new ConversationResource($session)
            );

        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'transfer_session',
                'Failed to transfer session',
                $e->getMessage(),
                500,
                'SESSION_TRANSFER_ERROR',
                ['session_id' => $sessionId]
            );
        }
    }

    /**
     * Resolve/End session
     */
    public function resolveSession(ResolveSessionRequest $request, string $sessionId): JsonResponse
    {
        try {
            $session = $this->conversationService->resolveSession(
                $sessionId,
                Auth::user()->organization_id,
                $request->validated()
            );

            return $this->successResponse(
                'Session resolved successfully',
                new ConversationResource($session)
            );

        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'resolve_session',
                'Failed to resolve session',
                $e->getMessage(),
                500,
                'SESSION_RESOLVE_ERROR',
                ['session_id' => $sessionId]
            );
        }
    }

    /**
     * Get session analytics
     */
    public function getAnalytics(Request $request, string $sessionId): JsonResponse
    {
        try {
            $analytics = $this->conversationService->getSessionAnalytics(
                $sessionId,
                Auth::user()->organization_id
            );

            return $this->successResponse(
                'Analytics retrieved successfully',
                $analytics
            );

        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'fetch_analytics',
                'Failed to fetch analytics',
                $e->getMessage(),
                500,
                'ANALYTICS_FETCH_ERROR',
                ['session_id' => $sessionId]
            );
        }
    }

    /**
     * Mark messages as read
     */
    public function markAsRead(Request $request, string $sessionId): JsonResponse
    {
        try {
            $messageIds = $request->get('message_ids', []);

            $this->conversationService->markMessagesAsRead(
                $sessionId,
                Auth::user()->organization_id,
                $messageIds
            );

            return $this->successResponse('Messages marked as read');

        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'mark_messages_read',
                'Failed to mark messages as read',
                $e->getMessage(),
                500,
                'MARK_READ_ERROR',
                ['session_id' => $sessionId]
            );
        }
    }

    /**
     * Get typing indicators
     */
    public function getTypingStatus(Request $request, string $sessionId): JsonResponse
    {
        try {
            $typingUsers = $this->conversationService->getTypingUsers(
                $sessionId,
                Auth::user()->organization_id
            );

            return $this->successResponse(
                'Typing status retrieved successfully',
                ['typing_users' => $typingUsers]
            );

        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'fetch_typing_status',
                'Failed to fetch typing status',
                $e->getMessage(),
                500,
                'TYPING_STATUS_ERROR',
                ['session_id' => $sessionId]
            );
        }
    }

    /**
     * Send typing indicator
     */
    public function sendTypingIndicator(Request $request, string $sessionId): JsonResponse
    {
        try {
            $isTyping = $request->get('is_typing', true);

            $this->messageService->sendTypingIndicator(
                $sessionId,
                Auth::user()->organization_id,
                Auth::id(),
                Auth::user()->name ?? 'Unknown User',
                $isTyping
            );

            return $this->successResponse('Typing indicator sent');

        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'send_typing_indicator',
                'Failed to send typing indicator',
                $e->getMessage(),
                500,
                'TYPING_INDICATOR_ERROR',
                ['session_id' => $sessionId]
            );
        }
    }

    /**
     * Get conversation summary
     */
    public function getConversationSummary(Request $request, string $sessionId): JsonResponse
    {
        try {
            $session = $this->conversationService->getItemById($sessionId, ['customer', 'agent', 'messages']);

            if (!$session) {
                return $this->notFoundResponse('Session');
            }

            $summary = $this->conversationService->getConversationSummary($sessionId);

            return $this->successResponse(
                'Conversation summary retrieved successfully',
                $summary
            );

        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'get_conversation_summary',
                'Failed to get conversation summary',
                $e->getMessage(),
                500,
                'CONVERSATION_SUMMARY_ERROR',
                ['session_id' => $sessionId]
            );
        }
    }

    /**
     * Search messages in conversation
     */
    public function searchMessages(Request $request, string $sessionId): JsonResponse
    {
        try {
            $query = $request->get('q', '');
            $senderType = $request->get('sender_type');
            $messageType = $request->get('message_type');
            $dateFrom = $request->get('date_from');
            $dateTo = $request->get('date_to');
            $perPage = $request->get('per_page', 20);

            if (empty($query)) {
                return $this->errorResponse('Search query is required', [], 400);
            }

            $messages = $this->messageService->searchMessages(
                $sessionId,
                $query,
                [
                    'sender_type' => $senderType,
                    'message_type' => $messageType,
                    'date_from' => $dateFrom,
                    'date_to' => $dateTo,
                ],
                $perPage
            );

            return $this->successResponse(
                'Messages found successfully',
                [
                    'messages' => MessageResource::collection($messages),
                    'search_query' => $query,
                    'total_found' => $messages->total(),
                    'session_id' => $sessionId
                ]
            );

        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'search_messages',
                'Failed to search messages',
                $e->getMessage(),
                500,
                'MESSAGE_SEARCH_ERROR',
                ['session_id' => $sessionId, 'query' => $request->get('q')]
            );
        }
    }

    /**
     * Get unread message count for session
     */
    public function getUnreadCount(Request $request, string $sessionId): JsonResponse
    {
        try {
            $unreadCount = $this->messageService->getUnreadCount($sessionId);

            return $this->successResponse(
                'Unread count retrieved successfully',
                [
                    'session_id' => $sessionId,
                    'unread_count' => $unreadCount,
                    'has_unread' => $unreadCount > 0
                ]
            );

        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'get_unread_count',
                'Failed to get unread count',
                $e->getMessage(),
                500,
                'UNREAD_COUNT_ERROR',
                ['session_id' => $sessionId]
            );
        }
    }

    /**
     * Get conversation with recent messages
     */
    public function getConversationWithRecent(Request $request, string $sessionId): JsonResponse
    {
        try {
            $limit = $request->get('limit', 10);
            $includeRelations = ['customer', 'agent', 'messages' => function($query) use ($limit) {
                $query->latest()->limit($limit);
            }];

            $session = $this->conversationService->getItemById($sessionId, $includeRelations);

            if (!$session) {
                return $this->notFoundResponse('Session');
            }

            return $this->successResponse(
                'Conversation with recent messages retrieved successfully',
                [
                    'conversation' => new ConversationResource($session),
                    'recent_messages_limit' => $limit,
                    'total_messages' => $session->messages()->count()
                ]
            );

        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'get_conversation_with_recent',
                'Failed to get conversation with recent messages',
                $e->getMessage(),
                500,
                'CONVERSATION_RECENT_ERROR',
                ['session_id' => $sessionId]
            );
        }
    }

}
