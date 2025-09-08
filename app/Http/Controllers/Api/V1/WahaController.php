<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\WahaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Exception;

class WahaController extends BaseApiController
{
    protected WahaService $wahaService;

    public function __construct(WahaService $wahaService)
    {
        $this->wahaService = $wahaService;
    }

    /**
     * Test WAHA connection
     */
    public function testConnection(): JsonResponse
    {
        try {
            $result = $this->wahaService->testConnection();

            if ($result['success']) {
                return $this->successResponse($result['message'], $result['server_info'] ?? []);
            }

            return $this->errorResponse($result['message'], $result['error'] ?? null, 500);
        } catch (Exception $e) {
            Log::error('Failed to test WAHA connection in controller', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->errorResponse('Failed to test connection: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get all sessions
     */
    public function getSessions(): JsonResponse
    {
        try {
            $result = $this->wahaService->getSessions();

            if ($result['success']) {
                return $this->successResponse('Sessions retrieved successfully', $result['data']);
            }

            return $this->errorResponse($result['message'], $result['error'] ?? null, 500);
        } catch (Exception $e) {
            Log::error('Failed to get WAHA sessions in controller', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->errorResponse('Failed to retrieve sessions: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get session information
     */
    public function getSession(string $sessionId): JsonResponse
    {
        try {
            $result = $this->wahaService->getSession($sessionId);

            if ($result['success']) {
                return $this->successResponse('Session information retrieved successfully', $result['data']);
            }

            return $this->errorResponse($result['message'], $result['error'] ?? null, 500);
        } catch (Exception $e) {
            Log::error('Failed to get WAHA session in controller', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->errorResponse('Failed to retrieve session: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Start a session
     */
    public function startSession(Request $request, string $sessionId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'config' => 'array',
            ]);

            if ($validator->fails()) {
                return $this->errorResponse('Validation failed', $validator->errors()->toArray(), 422);
            }

            $config = $request->input('config', []);
            $result = $this->wahaService->startSession($sessionId, $config);

            if ($result['success']) {
                return $this->successResponse($result['message'], $result['data'] ?? []);
            }

            return $this->errorResponse($result['message'], $result['error'] ?? null, 500);
        } catch (Exception $e) {
            Log::error('Failed to start WAHA session in controller', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->errorResponse('Failed to start session: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Stop a session
     */
    public function stopSession(string $sessionId): JsonResponse
    {
        try {
            $result = $this->wahaService->stopSession($sessionId);

            if ($result['success']) {
                return $this->successResponse($result['message'], $result['data'] ?? []);
            }

            return $this->errorResponse($result['message'], $result['error'] ?? null, 500);
        } catch (Exception $e) {
            Log::error('Failed to stop WAHA session in controller', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->errorResponse('Failed to stop session: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete a session
     */
    public function deleteSession(string $sessionId): JsonResponse
    {
        try {
            $result = $this->wahaService->deleteSession($sessionId);

            if ($result['success']) {
                return $this->successResponse($result['message'], $result['data'] ?? []);
            }

            return $this->errorResponse($result['message'], $result['error'] ?? null, 500);
        } catch (Exception $e) {
            Log::error('Failed to delete WAHA session in controller', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->errorResponse('Failed to delete session: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Send text message
     */
    public function sendTextMessage(Request $request, string $sessionId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'to' => 'required|string',
                'text' => 'required|string',
            ]);

            if ($validator->fails()) {
                return $this->errorResponse('Validation failed', $validator->errors()->toArray(), 422);
            }

            $to = $request->input('to');
            $text = $request->input('text');
            $result = $this->wahaService->sendTextMessage($sessionId, $to, $text);

            if ($result['success']) {
                return $this->successResponse($result['message'], $result['data']);
            }

            return $this->errorResponse($result['message'], $result['error'] ?? null, 500);
        } catch (Exception $e) {
            Log::error('Failed to send WAHA text message in controller', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->errorResponse('Failed to send message: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get chats
     */
    public function getChats(string $sessionId): JsonResponse
    {
        try {
            $result = $this->wahaService->getChats($sessionId);

            if ($result['success']) {
                return $this->successResponse('Chats retrieved successfully', $result['data']);
            }

            return $this->errorResponse($result['message'], $result['error'] ?? null, 500);
        } catch (Exception $e) {
            Log::error('Failed to get WAHA chats in controller', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->errorResponse('Failed to retrieve chats: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get messages
     */
    public function getMessages(Request $request, string $sessionId, string $chatId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'limit' => 'integer|min:1|max:100',
            ]);

            if ($validator->fails()) {
                return $this->errorResponse('Validation failed', $validator->errors()->toArray(), 422);
            }

            $limit = $request->input('limit', 50);
            $result = $this->wahaService->getMessages($sessionId, $chatId, $limit);

            if ($result['success']) {
                return $this->successResponse('Messages retrieved successfully', $result['data']);
            }

            return $this->errorResponse($result['message'], $result['error'] ?? null, 500);
        } catch (Exception $e) {
            Log::error('Failed to get WAHA messages in controller', [
                'session_id' => $sessionId,
                'chat_id' => $chatId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->errorResponse('Failed to retrieve messages: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get contacts
     */
    public function getContacts(string $sessionId): JsonResponse
    {
        try {
            $result = $this->wahaService->getContacts($sessionId);

            if ($result['success']) {
                return $this->successResponse('Contacts retrieved successfully', $result['data']);
            }

            return $this->errorResponse($result['message'], $result['error'] ?? null, 500);
        } catch (Exception $e) {
            Log::error('Failed to get WAHA contacts in controller', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->errorResponse('Failed to retrieve contacts: ' . $e->getMessage(), 500);
        }
    }
}
