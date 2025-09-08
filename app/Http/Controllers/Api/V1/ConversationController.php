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
