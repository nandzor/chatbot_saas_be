<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\CreateConversationRequest;
use App\Http\Requests\SendMessageRequest;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Services\ConversationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ConversationController extends BaseApiController
{
    protected ConversationService $conversationService;

    public function __construct(ConversationService $conversationService)
    {
        $this->conversationService = $conversationService;
    }

    /**
     * Get all conversations for the organization
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $pagination = $this->getPaginationParams($request);
            $filters = $this->getFilterParams($request, [
                'status', 'session_type', 'is_active', 'is_bot_session', 'agent_id', 'customer_id'
            ]);

            $conversations = $this->conversationService->getAll($request, $filters, ['customer', 'agent', 'botPersonality']);

            $this->logApiAction('conversations_listed', [
                'filters' => $filters,
                'pagination' => $pagination
            ]);

            return $this->successResponseWithLog(
                'conversations_listed',
                'Conversations retrieved successfully',
                $conversations->through(fn($conversation) => new ConversationResource($conversation)),
                200,
                ['pagination' => $pagination]
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'conversations_list_error',
                'Failed to retrieve conversations',
                $e->getMessage(),
                500,
                'CONVERSATIONS_LIST_ERROR'
            );
        }
    }

    /**
     * Create a new conversation
     */
    public function store(CreateConversationRequest $request): JsonResponse
    {
        try {
            $conversation = $this->conversationService->create($request->validated());

            $this->logApiAction('conversation_created', [
                'conversation_id' => $conversation->id,
                'session_type' => $conversation->session_type,
                'organization_id' => $conversation->organization_id
            ]);

            return $this->successResponseWithLog(
                'conversation_created',
                'Conversation created successfully',
                new ConversationResource($conversation),
                201
            );
        } catch (ValidationException $e) {
            return $this->errorResponseWithLog(
                'conversation_validation_error',
                'Validation failed',
                $e->getMessage(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'conversation_creation_error',
                'Failed to create conversation',
                $e->getMessage(),
                500,
                'CONVERSATION_CREATION_ERROR'
            );
        }
    }

    /**
     * Get a specific conversation
     */
    public function show(string $id): JsonResponse
    {
        try {
            $conversation = $this->conversationService->getById($id, [
                'customer', 'agent', 'botPersonality', 'messages'
            ]);

            if (!$conversation) {
                return $this->errorResponseWithLog(
                    'conversation_not_found',
                    'Conversation not found',
                    "Conversation with ID {$id} not found",
                    404,
                    'CONVERSATION_NOT_FOUND'
                );
            }

            $this->logApiAction('conversation_viewed', [
                'conversation_id' => $conversation->id,
                'session_type' => $conversation->session_type
            ]);

            return $this->successResponseWithLog(
                'conversation_viewed',
                'Conversation retrieved successfully',
                new ConversationResource($conversation)
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'conversation_retrieval_error',
                'Failed to retrieve conversation',
                $e->getMessage(),
                500,
                'CONVERSATION_RETRIEVAL_ERROR'
            );
        }
    }

    /**
     * Send a message in a conversation
     */
    public function sendMessage(SendMessageRequest $request, string $id): JsonResponse
    {
        try {
            $result = $this->conversationService->sendMessage($id, $request->validated());

            if (!$result) {
                return $this->errorResponseWithLog(
                    'conversation_not_found',
                    'Conversation not found',
                    "Conversation with ID {$id} not found",
                    404,
                    'CONVERSATION_NOT_FOUND'
                );
            }

            $this->logApiAction('message_sent', [
                'conversation_id' => $id,
                'message_id' => $result['message']->id,
                'sender_type' => $result['message']->sender_type
            ]);

            return $this->successResponseWithLog(
                'message_sent',
                'Message sent successfully',
                [
                    'message' => new MessageResource($result['message']),
                    'conversation' => new ConversationResource($result['conversation'])
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
     * Get conversation messages
     */
    public function messages(Request $request, string $id): JsonResponse
    {
        try {
            $conversation = $this->conversationService->getById($id);

            if (!$conversation) {
                return $this->errorResponseWithLog(
                    'conversation_not_found',
                    'Conversation not found',
                    "Conversation with ID {$id} not found",
                    404,
                    'CONVERSATION_NOT_FOUND'
                );
            }

            $pagination = $this->getPaginationParams($request);
            $messages = $this->conversationService->getMessages($id, $request);

            return $this->successResponse(
                'Messages retrieved successfully',
                $messages->through(fn($message) => new MessageResource($message)),
                200,
                ['pagination' => $pagination]
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'messages_retrieval_error',
                'Failed to retrieve messages',
                $e->getMessage(),
                500,
                'MESSAGES_RETRIEVAL_ERROR'
            );
        }
    }

    /**
     * End a conversation
     */
    public function end(string $id): JsonResponse
    {
        try {
            $conversation = $this->conversationService->end($id);

            if (!$conversation) {
                return $this->errorResponseWithLog(
                    'conversation_not_found',
                    'Conversation not found',
                    "Conversation with ID {$id} not found",
                    404,
                    'CONVERSATION_NOT_FOUND'
                );
            }

            $this->logApiAction('conversation_ended', [
                'conversation_id' => $conversation->id,
                'duration' => $conversation->resolution_time
            ]);

            return $this->successResponseWithLog(
                'conversation_ended',
                'Conversation ended successfully',
                new ConversationResource($conversation)
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'conversation_end_error',
                'Failed to end conversation',
                $e->getMessage(),
                500,
                'CONVERSATION_END_ERROR'
            );
        }
    }

    /**
     * Transfer conversation to agent
     */
    public function transfer(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'agent_id' => 'required|uuid|exists:agents,id',
                'reason' => 'nullable|string|max:500',
                'notes' => 'nullable|string|max:1000'
            ]);

            $conversation = $this->conversationService->transfer($id, $request->validated());

            if (!$conversation) {
                return $this->errorResponseWithLog(
                    'conversation_not_found',
                    'Conversation not found',
                    "Conversation with ID {$id} not found",
                    404,
                    'CONVERSATION_NOT_FOUND'
                );
            }

            $this->logApiAction('conversation_transferred', [
                'conversation_id' => $conversation->id,
                'agent_id' => $request->agent_id,
                'reason' => $request->reason
            ]);

            return $this->successResponseWithLog(
                'conversation_transferred',
                'Conversation transferred successfully',
                new ConversationResource($conversation)
            );
        } catch (ValidationException $e) {
            return $this->errorResponseWithLog(
                'conversation_transfer_validation_error',
                'Transfer validation failed',
                $e->getMessage(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'conversation_transfer_error',
                'Failed to transfer conversation',
                $e->getMessage(),
                500,
                'CONVERSATION_TRANSFER_ERROR'
            );
        }
    }

    /**
     * Get conversation history for AI Agent workflow
     */
    public function history(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'session_id' => 'required|string|max:255',
                'limit' => 'nullable|integer|min:1|max:100',
                'offset' => 'nullable|integer|min:0',
                'include_metadata' => 'nullable|boolean'
            ]);

            $sessionId = $request->input('session_id');
            $limit = $request->input('limit', 10);
            $offset = $request->input('offset', 0);
            $includeMetadata = $request->input('include_metadata', false);

            $history = $this->conversationService->getConversationHistory(
                $sessionId,
                $limit,
                $offset,
                $includeMetadata
            );

            $this->logApiAction('conversation_history_retrieved', [
                'session_id' => $sessionId,
                'limit' => $limit,
                'offset' => $offset,
                'result_count' => count($history['data'] ?? [])
            ]);

            return $this->successResponseWithLog(
                'conversation_history_retrieved',
                'Conversation history retrieved successfully',
                $history
            );
        } catch (ValidationException $e) {
            return $this->errorResponseWithLog(
                'conversation_history_validation_error',
                'History validation failed',
                $e->getMessage(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'conversation_history_error',
                'Failed to retrieve conversation history',
                $e->getMessage(),
                500,
                'CONVERSATION_HISTORY_ERROR'
            );
        }
    }

    /**
     * Log conversation for AI Agent workflow
     */
    public function logConversation(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'session_id' => 'required|string|max:255',
                'customer_message' => 'required|string',
                'agent_response' => 'required|string',
                'organization_id' => 'required|uuid|exists:organizations,id',
                'knowledge_base_used' => 'nullable|array',
                'ai_metadata' => 'nullable|array'
            ]);

            $result = $this->conversationService->logAiAgentConversation($request->validated());

            $this->logApiAction('ai_conversation_logged', [
                'session_id' => $request->input('session_id'),
                'organization_id' => $request->input('organization_id'),
                'conversation_id' => $result['conversation_id'] ?? null,
                'message_ids' => $result['message_ids'] ?? []
            ]);

            return $this->successResponseWithLog(
                'ai_conversation_logged',
                'AI conversation logged successfully',
                $result,
                201
            );
        } catch (ValidationException $e) {
            return $this->errorResponseWithLog(
                'conversation_log_validation_error',
                'Conversation log validation failed',
                $e->getMessage(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'conversation_log_error',
                'Failed to log conversation',
                $e->getMessage(),
                500,
                'CONVERSATION_LOG_ERROR'
            );
        }
    }

    /**
     * Get conversation statistics
     */
    public function statistics(Request $request): JsonResponse
    {
        try {
            $filters = $this->getFilterParams($request, [
                'date_from', 'date_to', 'session_type', 'agent_id'
            ]);

            $stats = $this->conversationService->getStatistics($filters);

            return $this->successResponse(
                'Conversation statistics retrieved successfully',
                $stats
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'conversation_statistics_error',
                'Failed to retrieve conversation statistics',
                $e->getMessage(),
                500,
                'CONVERSATION_STATISTICS_ERROR'
            );
        }
    }
}
