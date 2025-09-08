<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\CreateChatbotRequest;
use App\Http\Requests\UpdateChatbotRequest;
use App\Http\Requests\TrainChatbotRequest;
use App\Http\Requests\ChatRequest;
use App\Http\Resources\ChatbotResource;
use App\Services\ChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ChatbotController extends BaseApiController
{
    protected ChatbotService $chatbotService;

    public function __construct(ChatbotService $chatbotService)
    {
        $this->chatbotService = $chatbotService;
    }

    /**
     * Get all chatbots for the organization
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $pagination = $this->getPaginationParams($request);
            $filters = $this->getFilterParams($request, [
                'status', 'language', 'ai_model_id', 'is_active'
            ]);

            $chatbots = $this->chatbotService->getAll($request, $filters, ['aiModel', 'organization']);

            $this->logApiAction('chatbots_listed', [
                'filters' => $filters,
                'pagination' => $pagination
            ]);

            return $this->successResponseWithLog(
                'chatbots_listed',
                'Chatbots retrieved successfully',
                $chatbots->through(fn($chatbot) => new ChatbotResource($chatbot)),
                200,
                ['pagination' => $pagination]
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'chatbots_list_error',
                'Failed to retrieve chatbots',
                $e->getMessage(),
                500,
                'CHATBOTS_LIST_ERROR'
            );
        }
    }

    /**
     * Create a new chatbot
     */
    public function store(CreateChatbotRequest $request): JsonResponse
    {
        try {
            $chatbot = $this->chatbotService->create($request->validated());

            $this->logApiAction('chatbot_created', [
                'chatbot_id' => $chatbot->id,
                'name' => $chatbot->name,
                'organization_id' => $chatbot->organization_id
            ]);

            return $this->successResponseWithLog(
                'chatbot_created',
                'Chatbot created successfully',
                new ChatbotResource($chatbot),
                201
            );
        } catch (ValidationException $e) {
            return $this->errorResponseWithLog(
                'chatbot_validation_error',
                'Validation failed',
                $e->getMessage(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'chatbot_creation_error',
                'Failed to create chatbot',
                $e->getMessage(),
                500,
                'CHATBOT_CREATION_ERROR'
            );
        }
    }

    /**
     * Get a specific chatbot
     */
    public function show(string $id): JsonResponse
    {
        try {
            $chatbot = $this->chatbotService->getById($id, [
                'aiModel', 'organization', 'channelConfigs'
            ]);

            if (!$chatbot) {
                return $this->errorResponseWithLog(
                    'chatbot_not_found',
                    'Chatbot not found',
                    "Chatbot with ID {$id} not found",
                    404,
                    'CHATBOT_NOT_FOUND'
                );
            }

            $this->logApiAction('chatbot_viewed', [
                'chatbot_id' => $chatbot->id,
                'name' => $chatbot->name
            ]);

            return $this->successResponseWithLog(
                'chatbot_viewed',
                'Chatbot retrieved successfully',
                new ChatbotResource($chatbot)
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'chatbot_retrieval_error',
                'Failed to retrieve chatbot',
                $e->getMessage(),
                500,
                'CHATBOT_RETRIEVAL_ERROR'
            );
        }
    }

    /**
     * Update a chatbot
     */
    public function update(UpdateChatbotRequest $request, string $id): JsonResponse
    {
        try {
            $chatbot = $this->chatbotService->update($id, $request->validated());

            if (!$chatbot) {
                return $this->errorResponseWithLog(
                    'chatbot_not_found',
                    'Chatbot not found',
                    "Chatbot with ID {$id} not found",
                    404,
                    'CHATBOT_NOT_FOUND'
                );
            }

            $this->logApiAction('chatbot_updated', [
                'chatbot_id' => $chatbot->id,
                'name' => $chatbot->name,
                'updated_fields' => array_keys($request->validated())
            ]);

            return $this->successResponseWithLog(
                'chatbot_updated',
                'Chatbot updated successfully',
                new ChatbotResource($chatbot)
            );
        } catch (ValidationException $e) {
            return $this->errorResponseWithLog(
                'chatbot_validation_error',
                'Validation failed',
                $e->getMessage(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'chatbot_update_error',
                'Failed to update chatbot',
                $e->getMessage(),
                500,
                'CHATBOT_UPDATE_ERROR'
            );
        }
    }

    /**
     * Delete a chatbot
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $deleted = $this->chatbotService->delete($id);

            if (!$deleted) {
                return $this->errorResponseWithLog(
                    'chatbot_not_found',
                    'Chatbot not found',
                    "Chatbot with ID {$id} not found",
                    404,
                    'CHATBOT_NOT_FOUND'
                );
            }

            $this->logApiAction('chatbot_deleted', [
                'chatbot_id' => $id
            ]);

            return $this->successResponseWithLog(
                'chatbot_deleted',
                'Chatbot deleted successfully',
                null
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'chatbot_deletion_error',
                'Failed to delete chatbot',
                $e->getMessage(),
                500,
                'CHATBOT_DELETION_ERROR'
            );
        }
    }

    /**
     * Train a chatbot with new data
     */
    public function train(TrainChatbotRequest $request, string $id): JsonResponse
    {
        try {
            $result = $this->chatbotService->train($id, $request->validated());

            if (!$result) {
                return $this->errorResponseWithLog(
                    'chatbot_not_found',
                    'Chatbot not found',
                    "Chatbot with ID {$id} not found",
                    404,
                    'CHATBOT_NOT_FOUND'
                );
            }

            $this->logApiAction('chatbot_trained', [
                'chatbot_id' => $id,
                'training_data_count' => $result['training_items_count'] ?? 0,
                'training_duration' => $result['training_duration'] ?? 0
            ]);

            return $this->successResponseWithLog(
                'chatbot_trained',
                'Chatbot training completed successfully',
                $result
            );
        } catch (ValidationException $e) {
            return $this->errorResponseWithLog(
                'chatbot_training_validation_error',
                'Training validation failed',
                $e->getMessage(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'chatbot_training_error',
                'Failed to train chatbot',
                $e->getMessage(),
                500,
                'CHATBOT_TRAINING_ERROR'
            );
        }
    }

    /**
     * Chat with a chatbot
     */
    public function chat(ChatRequest $request, string $id): JsonResponse
    {
        try {
            $response = $this->chatbotService->processMessage($id, $request->validated());

            if (!$response) {
                return $this->errorResponseWithLog(
                    'chatbot_not_found',
                    'Chatbot not found',
                    "Chatbot with ID {$id} not found",
                    404,
                    'CHATBOT_NOT_FOUND'
                );
            }

            $this->logApiAction('chatbot_message_processed', [
                'chatbot_id' => $id,
                'session_id' => $response['session_id'] ?? null,
                'message_length' => strlen($request->get('message', '')),
                'response_time' => $response['response_time'] ?? 0
            ]);

            return $this->successResponseWithLog(
                'chatbot_message_processed',
                'Message processed successfully',
                $response
            );
        } catch (ValidationException $e) {
            return $this->errorResponseWithLog(
                'chatbot_chat_validation_error',
                'Chat validation failed',
                $e->getMessage(),
                422,
                'VALIDATION_ERROR'
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'chatbot_chat_error',
                'Failed to process message',
                $e->getMessage(),
                500,
                'CHATBOT_CHAT_ERROR'
            );
        }
    }

    /**
     * Get chatbot statistics
     */
    public function statistics(string $id): JsonResponse
    {
        try {
            $stats = $this->chatbotService->getChatbotStatistics($id);

            if (empty($stats)) {
                return $this->errorResponseWithLog(
                    'chatbot_not_found',
                    'Chatbot not found',
                    "Chatbot with ID {$id} not found",
                    404,
                    'CHATBOT_NOT_FOUND'
                );
            }

            return $this->successResponse(
                'Chatbot statistics retrieved successfully',
                $stats
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'chatbot_statistics_error',
                'Failed to retrieve chatbot statistics',
                $e->getMessage(),
                500,
                'CHATBOT_STATISTICS_ERROR'
            );
        }
    }

    /**
     * Test chatbot configuration
     */
    public function test(string $id): JsonResponse
    {
        try {
            $testResult = $this->chatbotService->testConfiguration($id);

            if (!$testResult) {
                return $this->errorResponseWithLog(
                    'chatbot_not_found',
                    'Chatbot not found',
                    "Chatbot with ID {$id} not found",
                    404,
                    'CHATBOT_NOT_FOUND'
                );
            }

            $this->logApiAction('chatbot_tested', [
                'chatbot_id' => $id,
                'test_result' => $testResult['status']
            ]);

            return $this->successResponseWithLog(
                'chatbot_tested',
                'Chatbot test completed',
                $testResult
            );
        } catch (\Exception $e) {
            return $this->errorResponseWithLog(
                'chatbot_test_error',
                'Failed to test chatbot',
                $e->getMessage(),
                500,
                'CHATBOT_TEST_ERROR'
            );
        }
    }
}
