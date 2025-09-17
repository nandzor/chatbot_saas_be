<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\Waha\WahaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Exception;

class WahaController extends BaseApiController
{
    protected WahaService $wahaService;

    public function __construct(WahaService $wahaService)
    {
        $this->wahaService = $wahaService;
    }

    /**
     * Test WAHA server connection
     */
    public function testConnection(): JsonResponse
    {
        try {
            $result = $this->wahaService->testConnection();
            return $this->successResponse('WAHA connection test completed', $result);
        } catch (Exception $e) {
            Log::error('Failed to test WAHA connection', ['error' => $e->getMessage()]);
            return $this->errorResponse('Failed to test WAHA connection', 500);
        }
    }

    /**
     * Get all sessions
     */
    public function getSessions(): JsonResponse
    {
        try {
            $sessions = $this->wahaService->getSessions();
            return $this->successResponse('Sessions retrieved successfully', $sessions);
        } catch (Exception $e) {
            Log::error('Failed to get WAHA sessions', ['error' => $e->getMessage()]);
            return $this->errorResponse('Failed to retrieve sessions', 500);
        }
    }

    /**
     * Start a new session
     */
    public function startSession(Request $request, string $sessionId): JsonResponse
    {
        try {
            $config = $request->validate([
                'webhook' => 'nullable|string|url',
                'webhook_by_events' => 'boolean',
                'events' => 'array',
                'reject_calls' => 'boolean',
                'mark_online_on_chat' => 'boolean',
            ]);

            $result = $this->wahaService->startSession($sessionId, $config);
            return $this->successResponse('Session started successfully', $result);
        } catch (Exception $e) {
            Log::error('Failed to start WAHA session', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to start session', 500);
        }
    }

    /**
     * Stop a session
     */
    public function stopSession(string $sessionId): JsonResponse
    {
        try {
            $result = $this->wahaService->stopSession($sessionId);
            return $this->successResponse('Session stopped successfully', $result);
        } catch (Exception $e) {
            Log::error('Failed to stop WAHA session', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to stop session', 500);
        }
    }

    /**
     * Get session status
     */
    public function getSessionStatus(string $sessionId): JsonResponse
    {
        try {
            $status = $this->wahaService->getSessionStatus($sessionId);
            return $this->successResponse('Session status retrieved successfully', $status);
        } catch (Exception $e) {
            Log::error('Failed to get WAHA session status', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to retrieve session status', 500);
        }
    }

    /**
     * Send a text message
     */
    public function sendTextMessage(Request $request, string $sessionId): JsonResponse
    {
        try {
            $data = $request->validate([
                'to' => 'required|string',
                'text' => 'required|string|max:4096',
            ]);

            $result = $this->wahaService->sendTextMessage(
                $sessionId,
                $data['to'],
                $data['text']
            );

            return $this->successResponse('Message sent successfully', $result);
        } catch (Exception $e) {
            Log::error('Failed to send WAHA text message', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to send message', 500);
        }
    }

    /**
     * Send a media message
     */
    public function sendMediaMessage(Request $request, string $sessionId): JsonResponse
    {
        try {
            $data = $request->validate([
                'to' => 'required|string',
                'media_url' => 'required|string|url',
                'caption' => 'nullable|string|max:1024',
            ]);

            $result = $this->wahaService->sendMediaMessage(
                $sessionId,
                $data['to'],
                $data['media_url'],
                $data['caption'] ?? ''
            );

            return $this->successResponse('Media message sent successfully', $result);
        } catch (Exception $e) {
            Log::error('Failed to send WAHA media message', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to send media message', 500);
        }
    }

    /**
     * Get messages
     */
    public function getMessages(Request $request, string $sessionId): JsonResponse
    {
        try {
            $data = $request->validate([
                'limit' => 'integer|min:1|max:100',
                'page' => 'integer|min:1',
            ]);

            $messages = $this->wahaService->getMessages(
                $sessionId,
                $data['limit'] ?? 50,
                $data['page'] ?? 1
            );

            return $this->successResponse('Messages retrieved successfully', $messages);
        } catch (Exception $e) {
            Log::error('Failed to get WAHA messages', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to retrieve messages', 500);
        }
    }

    /**
     * Get contacts
     */
    public function getContacts(string $sessionId): JsonResponse
    {
        try {
            $contacts = $this->wahaService->getContacts($sessionId);
            return $this->successResponse('Contacts retrieved successfully', $contacts);
        } catch (Exception $e) {
            Log::error('Failed to get WAHA contacts', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to retrieve contacts', 500);
        }
    }

    /**
     * Get groups
     */
    public function getGroups(string $sessionId): JsonResponse
    {
        try {
            $groups = $this->wahaService->getGroups($sessionId);
            return $this->successResponse('Groups retrieved successfully', $groups);
        } catch (Exception $e) {
            Log::error('Failed to get WAHA groups', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to retrieve groups', 500);
        }
    }

    /**
     * Get QR code
     */
    public function getQrCode(string $sessionId): JsonResponse
    {
        try {
            $qrCode = $this->wahaService->getQrCode($sessionId);
            return $this->successResponse('QR code retrieved successfully', $qrCode);
        } catch (Exception $e) {
            Log::error('Failed to get WAHA QR code', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to retrieve QR code', 500);
        }
    }

    /**
     * Delete session
     */
    public function deleteSession(string $sessionId): JsonResponse
    {
        try {
            $result = $this->wahaService->deleteSession($sessionId);
            return $this->successResponse('Session deleted successfully', $result);
        } catch (Exception $e) {
            Log::error('Failed to delete WAHA session', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to delete session', 500);
        }
    }

    /**
     * Get session info
     */
    public function getSessionInfo(string $sessionId): JsonResponse
    {
        try {
            $info = $this->wahaService->getSessionInfo($sessionId);
            return $this->successResponse('Session info retrieved successfully', $info);
        } catch (Exception $e) {
            Log::error('Failed to get WAHA session info', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to retrieve session info', 500);
        }
    }

    /**
     * Check if session is connected
     */
    public function isSessionConnected(string $sessionId): JsonResponse
    {
        try {
            $connected = $this->wahaService->isSessionConnected($sessionId);
            return $this->successResponse('Session connection status retrieved successfully', ['connected' => $connected]);
        } catch (Exception $e) {
            Log::error('Failed to check WAHA session connection', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to check session connection', 500);
        }
    }

    /**
     * Get session health status
     */
    public function getSessionHealth(string $sessionId): JsonResponse
    {
        try {
            $health = $this->wahaService->getSessionHealth($sessionId);
            return $this->successResponse('Session health status retrieved successfully', $health);
        } catch (Exception $e) {
            Log::error('Failed to get WAHA session health', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            return $this->errorResponse('Failed to retrieve session health', 500);
        }
    }
}
