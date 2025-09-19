<?php

namespace App\Services\Waha;

use App\Services\Http\BaseHttpClient;
use App\Services\Waha\Exceptions\WahaException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class WahaService extends BaseHttpClient
{
    protected string $apiKey;
    protected bool $mockResponses = false;

    public function __construct(array $config = [])
    {
        $this->apiKey = $config['api_key'] ?? '';
        $this->mockResponses = $config['mock_responses'] ?? false;

        // Validate configuration
        $this->validateConfig($config);

        $headers = [
            'X-API-Key' => $this->apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ];

        // Normalize base URL
        $rawBaseUrl = $config['base_url'] ?? 'http://localhost:3000';
        $normalizedBaseUrl = $this->normalizeBaseUrl($rawBaseUrl);

        parent::__construct($normalizedBaseUrl, [
            'headers' => $headers,
            'timeout' => $config['timeout'] ?? 30,
            'retry_attempts' => $config['retry_attempts'] ?? 3,
            'retry_delay' => $config['retry_delay'] ?? 1000,
            'max_retry_delay' => $config['max_retry_delay'] ?? 10000,
            'exponential_backoff' => $config['exponential_backoff'] ?? true,
            'log_requests' => $config['log_requests'] ?? true,
            'log_responses' => $config['log_responses'] ?? true,
        ]);

        // Service initialized silently
    }

    /**
     * Test WAHA server connection
     */
    public function testConnection(): array
    {
        try {
            if ($this->mockResponses) {
                return [
                    'success' => true,
                    'message' => 'WAHA service is in mock mode',
                    'base_url' => $this->baseUrl,
                    'mock_mode' => true,
                ];
            }

            // Basic configuration validation first
            if (empty($this->baseUrl)) {
                throw new Exception('WAHA base URL is not configured');
            }

            if (empty($this->apiKey)) {
                Log::warning('WAHA API key is not configured - some operations may fail');
            }

            // Try a simple connectivity test with very short timeout
            try {
                $response = Http::timeout(2)
                    ->connectTimeout(1)
                    ->withHeaders($this->defaultHeaders)
                    ->get($this->baseUrl . '/');

                return [
                    'success' => true,
                    'message' => 'WAHA server is reachable',
                    'base_url' => $this->baseUrl,
                    'status' => $response->status(),
                    'mock_mode' => false,
                ];
            } catch (\Illuminate\Http\Client\ConnectionException $e) {
                return [
                    'success' => false,
                    'message' => 'WAHA server is not running or not accessible',
                    'base_url' => $this->baseUrl,
                    'error' => 'Connection refused - server may be down',
                    'mock_mode' => false,
                ];
            } catch (\Illuminate\Http\Client\RequestException $e) {
                // Server responded but with error status
                return [
                    'success' => true,
                    'message' => 'WAHA server is reachable (but returned error)',
                    'base_url' => $this->baseUrl,
                    'status' => $e->response ? $e->response->status() : 'unknown',
                    'mock_mode' => false,
                ];
            } catch (Exception $e) {
                throw $e;
            }

        } catch (Exception $e) {
            Log::error('WAHA connection test failed', [
                'base_url' => $this->baseUrl,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'WAHA server is not reachable: ' . $e->getMessage(),
                'base_url' => $this->baseUrl,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get all sessions
     */
    public function getSessions(): array
    {
        if ($this->mockResponses) {
            return $this->getMockSessions();
        }

        $response = $this->get('/api/sessions');
        return $this->handleResponse($response, 'get sessions');
    }

    /**
     * Start a new session
     */
    public function startSession(string $sessionId, array $config = []): array
    {
        if ($this->mockResponses) {
            return $this->getMockSessionStart();
        }

        $data = [
            'name' => $sessionId,
            'config' => [
                'webhook' => $config['webhook'] ?? '',
                'webhook_by_events' => $config['webhook_by_events'] ?? false,
                'events' => $config['events'] ?? ['message', 'session.status'],
                'reject_calls' => $config['reject_calls'] ?? false,
                'mark_online_on_chat' => $config['mark_online_on_chat'] ?? true,
            ]
        ];

        $response = $this->post("/api/sessions/{$sessionId}/start", $data);
        return $this->handleResponse($response, 'start session');
    }

    /**
     * Stop a session
     */
    public function stopSession(string $sessionId): array
    {
        if ($this->mockResponses) {
            return $this->getMockSessionStop();
        }

        $response = $this->post("/api/sessions/{$sessionId}/stop");
        return $this->handleResponse($response, 'stop session');
    }

    /**
     * Get session status
     */
    public function getSessionStatus(string $sessionId): array
    {
        if ($this->mockResponses) {
            return $this->getMockSessionStatus();
        }

        $response = $this->get("/api/sessions/{$sessionId}/status");
        return $this->handleResponse($response, 'get session status');
    }

    /**
     * Send a text message
     */
    public function sendTextMessage(string $sessionId, string $to, string $text): array
    {
        if ($this->mockResponses) {
            return $this->getMockMessageSent();
        }

        $this->validatePhoneNumber($to);

        $data = [
            'to' => $to,
            'text' => $text,
        ];

        $response = $this->post("/api/sessions/{$sessionId}/sendText", $data);
        return $this->handleResponse($response, 'send text message');
    }

    /**
     * Send a media message
     */
    public function sendMediaMessage(string $sessionId, string $to, string $mediaUrl, string $caption = ''): array
    {
        if ($this->mockResponses) {
            return $this->getMockMessageSent();
        }

        $this->validatePhoneNumber($to);

        $data = [
            'to' => $to,
            'media' => $mediaUrl,
            'caption' => $caption,
        ];

        $response = $this->post("/api/sessions/{$sessionId}/sendMedia", $data);
        return $this->handleResponse($response, 'send media message');
    }

    /**
     * Get messages
     */
    public function getMessages(string $sessionId, int $limit = 50, int $page = 1): array
    {
        if ($this->mockResponses) {
            return $this->getMockMessages();
        }

        $response = $this->get("/api/sessions/{$sessionId}/messages", [
            'limit' => $limit,
            'page' => $page,
        ]);

        return $this->handleResponse($response, 'get messages');
    }

    /**
     * Get contacts
     */
    public function getContacts(string $sessionId): array
    {
        if ($this->mockResponses) {
            return $this->getMockContacts();
        }

        $response = $this->get("/api/sessions/{$sessionId}/contacts");
        return $this->handleResponse($response, 'get contacts');
    }

    /**
     * Get groups
     */
    public function getGroups(string $sessionId): array
    {
        if ($this->mockResponses) {
            return $this->getMockGroups();
        }

        $response = $this->get("/api/sessions/{$sessionId}/groups");
        return $this->handleResponse($response, 'get groups');
    }

    /**
     * Get session QR code
     */
    public function getQrCode(string $sessionId): array
    {
        if ($this->mockResponses) {
            return $this->getMockQrCode();
        }

        $response = $this->get("/api/sessions/{$sessionId}/qr");
        return $this->handleResponse($response, 'get QR code');
    }

    /**
     * Delete session
     */
    public function deleteSession(string $sessionId): array
    {
        if ($this->mockResponses) {
            return $this->getMockSessionDeleted();
        }

        $response = $this->delete("/api/sessions/{$sessionId}");
        return $this->handleResponse($response, 'delete session');
    }

    /**
     * Get session info
     */
    public function getSessionInfo(string $sessionId): array
    {
        if ($this->mockResponses) {
            return $this->getMockSessionInfo();
        }

        $response = $this->get("/api/sessions/{$sessionId}");
        return $this->handleResponse($response, 'get session info');
    }

    // Mock responses for testing
    private function getMockSessions(): array
    {
        return [
            'sessions' => [
                [
                    'id' => 'test-session',
                    'status' => 'WORKING',
                    'created_at' => now()->toISOString(),
                ]
            ]
        ];
    }

    private function getMockSessionStart(): array
    {
        return [
            'success' => true,
            'message' => 'Session started successfully',
            'session' => [
                'id' => 'test-session',
                'status' => 'STARTING',
            ]
        ];
    }

    private function getMockSessionStop(): array
    {
        return [
            'success' => true,
            'message' => 'Session stopped successfully',
        ];
    }

    private function getMockSessionStatus(): array
    {
        return [
            'status' => 'WORKING',
            'phone' => '+1234567890',
            'battery' => 85,
            'plugged' => true,
        ];
    }

    private function getMockMessageSent(): array
    {
        return [
            'success' => true,
            'messageId' => 'mock-message-id-' . uniqid(),
            'timestamp' => now()->timestamp,
        ];
    }

    private function getMockMessages(): array
    {
        return [
            'messages' => [
                [
                    'id' => 'mock-message-1',
                    'from' => '+1234567890',
                    'to' => '+0987654321',
                    'text' => 'Hello, this is a test message',
                    'timestamp' => now()->timestamp,
                    'type' => 'text',
                ]
            ],
            'pagination' => [
                'page' => 1,
                'limit' => 50,
                'total' => 1,
            ]
        ];
    }

    private function getMockContacts(): array
    {
        return [
            'contacts' => [
                [
                    'id' => '+1234567890',
                    'name' => 'Test Contact',
                    'isGroup' => false,
                    'isUser' => false,
                ]
            ]
        ];
    }

    private function getMockGroups(): array
    {
        return [
            'groups' => [
                [
                    'id' => 'test-group-id',
                    'name' => 'Test Group',
                    'isGroup' => true,
                    'participants' => ['+1234567890', '+0987654321'],
                ]
            ]
        ];
    }

    private function getMockQrCode(): array
    {
        return [
            'qr' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            'expires' => now()->addMinutes(5)->timestamp,
        ];
    }

    private function getMockSessionDeleted(): array
    {
        return [
            'success' => true,
            'message' => 'Session deleted successfully',
        ];
    }

    private function getMockSessionInfo(): array
    {
        return [
            'id' => 'test-session',
            'status' => 'WORKING',
            'phone' => '+1234567890',
            'battery' => 85,
            'plugged' => true,
            'created_at' => now()->toISOString(),
            'updated_at' => now()->toISOString(),
        ];
    }

    /**
     * Validate phone number format
     */
    private function validatePhoneNumber(string $phoneNumber): void
    {
        // Remove all non-digit characters except +
        $cleaned = preg_replace('/[^\d+]/', '', $phoneNumber);

        // Check if it starts with + and has at least 10 digits
        if (!preg_match('/^\+[1-9]\d{9,14}$/', $cleaned)) {
            throw WahaException::invalidPhoneNumber($phoneNumber);
        }
    }

    /**
     * Check if session exists and is connected
     */
    public function isSessionConnected(string $sessionId): bool
    {
        try {
            $status = $this->getSessionStatus($sessionId);
            return isset($status['status']) && $status['status'] === 'WORKING';
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Get session health status
     */
    public function getSessionHealth(string $sessionId): array
    {
        try {
            $status = $this->getSessionStatus($sessionId);
            return [
                'connected' => $status['status'] === 'WORKING',
                'battery' => $status['battery'] ?? 0,
                'plugged' => $status['plugged'] ?? false,
                'phone' => $status['phone'] ?? null,
                'last_seen' => now()->toISOString(),
            ];
        } catch (Exception $e) {
            return [
                'connected' => false,
                'error' => $e->getMessage(),
                'last_seen' => null,
            ];
        }
    }

    /**
     * Validate WAHA service configuration
     */
    protected function validateConfig(array $config): void
    {
        // Validate base URL
        if (empty($config['base_url'])) {
            throw new WahaException('WAHA base URL is required');
        }

        if (!filter_var($config['base_url'], FILTER_VALIDATE_URL)) {
            throw new WahaException('Invalid WAHA base URL format');
        }

        // Validate timeout
        if (isset($config['timeout']) && (!is_numeric($config['timeout']) || $config['timeout'] <= 0)) {
            throw new WahaException('WAHA timeout must be a positive number');
        }

        // Validate retry attempts
        if (isset($config['retry_attempts']) && (!is_numeric($config['retry_attempts']) || $config['retry_attempts'] < 0)) {
            throw new WahaException('WAHA retry attempts must be a non-negative number');
        }

        // Validate retry delay
        if (isset($config['retry_delay']) && (!is_numeric($config['retry_delay']) || $config['retry_delay'] < 0)) {
            throw new WahaException('WAHA retry delay must be a non-negative number');
        }

        // Warn if API key is missing in non-mock mode
        if (empty($this->apiKey) && !$this->mockResponses) {
            Log::warning('WAHA API key is missing - some operations may fail', [
                'base_url' => $config['base_url'],
                'mock_responses' => $this->mockResponses,
            ]);
        }
    }

    /**
     * Normalize base URL to ensure proper format
     */
    protected function normalizeBaseUrl(string $baseUrl): string
    {
        // Remove trailing slashes
        $baseUrl = rtrim($baseUrl, '/');

        // Ensure it has a protocol
        if (!preg_match('/^https?:\/\//', $baseUrl)) {
            $baseUrl = 'http://' . $baseUrl;
        }

        return $baseUrl;
    }

    /**
     * Enhanced error handling for WAHA specific errors
     */
    protected function handleResponse(Response $response, string $operation = 'request'): array
    {
        if ($response->successful()) {
            return $response->json() ?? [];
        }

        $statusCode = $response->status();
        $errorData = $response->json() ?? [];
        $errorMessage = $errorData['message'] ?? $response->body() ?? 'Unknown error';

        // Map WAHA specific error codes
        $wahaErrorMessages = [
            400 => 'Bad request - Invalid parameters provided',
            401 => 'Unauthorized - Invalid API key or session',
            403 => 'Forbidden - Access denied',
            404 => 'Not found - Session or resource not found',
            409 => 'Conflict - Session already exists or is in use',
            422 => 'Unprocessable entity - Invalid data format',
            429 => 'Too many requests - Rate limit exceeded',
            500 => 'Internal server error - WAHA server error',
            502 => 'Bad gateway - WAHA server unavailable',
            503 => 'Service unavailable - WAHA server overloaded',
        ];

        $mappedMessage = $wahaErrorMessages[$statusCode] ?? "HTTP error {$statusCode}";

        Log::error("WAHA API error during {$operation}", [
            'status' => $statusCode,
            'error' => $errorData,
            'operation' => $operation,
            'base_url' => $this->baseUrl,
        ]);

        throw new WahaException("WAHA API error ({$statusCode}): {$mappedMessage}. Operation: {$operation}", $statusCode, $errorData);
    }
}
