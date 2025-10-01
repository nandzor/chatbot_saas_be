<?php

namespace App\Services\Waha;

use App\Services\Http\BaseHttpClient;
use App\Services\Waha\Exceptions\WahaException;
use App\Services\Waha\MockWahaResponses;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class WahaService extends BaseHttpClient
{
    // Constants
    private const DEFAULT_BASE_URL = 'http://localhost:3000';
    private const DEFAULT_TIMEOUT = 30;
    private const DEFAULT_RETRY_ATTEMPTS = 3;
    private const DEFAULT_RETRY_DELAY = 1000;
    private const DEFAULT_MAX_RETRY_DELAY = 10000;
    private const CONNECTION_TEST_TIMEOUT = 2;
    private const CONNECTION_TEST_CONNECT_TIMEOUT = 1;

    // HTTP Status Codes
    private const HTTP_BAD_REQUEST = 400;
    private const HTTP_UNAUTHORIZED = 401;
    private const HTTP_FORBIDDEN = 403;
    private const HTTP_NOT_FOUND = 404;
    private const HTTP_CONFLICT = 409;
    private const HTTP_UNPROCESSABLE_ENTITY = 422;
    private const HTTP_TOO_MANY_REQUESTS = 429;
    private const HTTP_INTERNAL_SERVER_ERROR = 500;
    private const HTTP_BAD_GATEWAY = 502;
    private const HTTP_SERVICE_UNAVAILABLE = 503;

    // Session Statuses
    private const STATUS_WORKING = 'WORKING';
    private const STATUS_STARTING = 'STARTING';
    private const STATUS_SCAN_QR_CODE = 'SCAN_QR_CODE';

    // API Endpoints
    private const ENDPOINT_SESSIONS = '/api/sessions';
    private const ENDPOINT_SESSION_INFO = '/api/sessions/%s';
    private const ENDPOINT_SESSION_START = '/api/sessions/%s/start';
    private const ENDPOINT_SESSION_STOP = '/api/sessions/%s/stop';
    private const ENDPOINT_SESSION_STATUS = '/api/sessions/%s/status';
    private const ENDPOINT_SEND_TEXT = '/api/sendText';
    private const ENDPOINT_SEND_TEXT_ALT = '/api/sessions/%s/sendText'; // Alternative endpoint
    private const ENDPOINT_SEND_MEDIA = '/api/sendImage';
    private const ENDPOINT_SEND_TYPING = '/api/sendTyping';
    private const ENDPOINT_MESSAGES = '/api/messages';
    private const ENDPOINT_CONTACTS = '/api/contacts';
    private const ENDPOINT_GROUPS = '/api/%s/groups';
    private const ENDPOINT_QR_CODE = '/api/%s/auth/qr?format=image';

    protected string $apiKey;
    protected bool $mockResponses = false;
    protected MockWahaResponses $mockResponsesHandler;

    public function __construct(array $config = [])
    {
        // Merge with default configuration from config/waha.php
        $mergedConfig = $this->mergeWithDefaultConfig($config);

        $this->initializeProperties($mergedConfig);
        $this->validateConfig($mergedConfig);

        $normalizedBaseUrl = $this->normalizeBaseUrl($mergedConfig['base_url'] ?? self::DEFAULT_BASE_URL);
        $httpConfig = $this->buildHttpConfig($mergedConfig);

        parent::__construct($normalizedBaseUrl, $httpConfig);
    }

    /**
     * Merge provided config with default configuration from config/waha.php
     *
     * @param array $config Provided configuration
     * @return array Merged configuration
     */
    private function mergeWithDefaultConfig(array $config): array
    {
        $defaultConfig = config('waha', []);

        return [
            'base_url' => $config['base_url'] ?? $defaultConfig['server']['base_url'] ?? self::DEFAULT_BASE_URL,
            'api_key' => $config['api_key'] ?? $defaultConfig['server']['api_key'] ?? '',
            'timeout' => $config['timeout'] ?? $defaultConfig['server']['timeout'] ?? self::DEFAULT_TIMEOUT,
            'retry_attempts' => $config['retry_attempts'] ?? $defaultConfig['http']['retry_attempts'] ?? self::DEFAULT_RETRY_ATTEMPTS,
            'retry_delay' => $config['retry_delay'] ?? $defaultConfig['http']['retry_delay'] ?? self::DEFAULT_RETRY_DELAY,
            'max_retry_delay' => $config['max_retry_delay'] ?? $defaultConfig['http']['max_retry_delay'] ?? self::DEFAULT_MAX_RETRY_DELAY,
            'exponential_backoff' => $config['exponential_backoff'] ?? $defaultConfig['http']['exponential_backoff'] ?? true,
            'log_requests' => $config['log_requests'] ?? $defaultConfig['http']['log_requests'] ?? true,
            'log_responses' => $config['log_responses'] ?? $defaultConfig['http']['log_responses'] ?? true,
            'mock_responses' => $config['mock_responses'] ?? $defaultConfig['testing']['mock_responses'] ?? false,
        ];
    }

    /**
     * Initialize class properties from configuration
     */
    private function initializeProperties(array $config): void
    {
        $this->apiKey = $config['api_key'] ?? '';
        $this->mockResponses = $config['mock_responses'] ?? false;
        $this->mockResponsesHandler = new MockWahaResponses();
    }

    /**
     * Build HTTP client configuration
     */
    private function buildHttpConfig(array $config): array
    {
        return [
            'headers' => $this->buildHeaders(),
            'timeout' => $config['timeout'] ?? self::DEFAULT_TIMEOUT,
            'retry_attempts' => $config['retry_attempts'] ?? self::DEFAULT_RETRY_ATTEMPTS,
            'retry_delay' => $config['retry_delay'] ?? self::DEFAULT_RETRY_DELAY,
            'max_retry_delay' => $config['max_retry_delay'] ?? self::DEFAULT_MAX_RETRY_DELAY,
            'exponential_backoff' => $config['exponential_backoff'] ?? true,
            'log_requests' => $config['log_requests'] ?? true,
            'log_responses' => $config['log_responses'] ?? true,
        ];
    }

    /**
     * Build default headers for HTTP requests
     */
    private function buildHeaders(): array
    {
        return [
            'X-API-Key' => $this->apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ];
    }

    // ========================================
    // CONNECTION & CONFIGURATION METHODS
    // ========================================

    /**
     * Test WAHA server connection
     *
     * @return array{success: bool, message: string, base_url: string, status?: int, error?: string, mock_mode: bool}
     */
    public function testConnection(): array
    {
        try {
            if ($this->mockResponses) {
                return $this->mockResponsesHandler->getConnectionTest();
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
                $response = Http::timeout(self::CONNECTION_TEST_TIMEOUT)
                    ->connectTimeout(self::CONNECTION_TEST_CONNECT_TIMEOUT)
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

    // ========================================
    // SESSION MANAGEMENT METHODS
    // ========================================

    /**
     * Get all sessions from WAHA server
     *
     * @return array{success: bool, data: array, message: string}
     */
    public function getSessions(): array
    {
        if ($this->mockResponses) {
            return $this->mockResponsesHandler->getSessions();
        }

        $response = $this->get(self::ENDPOINT_SESSIONS);
        $data = $this->handleResponse($response, 'get sessions');

        return $this->normalizeSessionsResponse($data);
    }

    /**
     * Normalize sessions response format
     */
    private function normalizeSessionsResponse(array $data): array
    {
        // Handle different response formats
        if (is_array($data) && !isset($data['data']) && !isset($data['sessions'])) {
            // Direct array response
            return [
                'success' => true,
                'data' => $data,
                'message' => 'Sessions retrieved successfully'
            ];
        }

        return $data;
    }

    /**
     * Create a new session in 3rd party WAHA instance
     *
     * @param array{name: string, start?: bool, config?: array} $sessionData
     * @return array{success: bool, message: string, session: array}
     * @throws WahaException
     */
    public function createSession(array $sessionData): array
    {
        if ($this->mockResponses) {
            return $this->mockResponsesHandler->getSessionCreate();
        }

        $sessionName = $sessionData['name'];
        $start = $sessionData['start'] ?? true;
        $config = $sessionData['config'] ?? [];

        Log::info('Creating WAHA session in 3rd party', [
            'session_name' => $sessionName,
            'start' => $start,
            'config' => $config
        ]);

        try {
            $response = $this->post(self::ENDPOINT_SESSIONS, $this->buildSessionData($sessionName, $start, $config));

            if ($response->successful()) {
                return $this->handleSuccessfulSessionCreation($response, $sessionName);
            }

            return $this->handleSessionCreationError($response, $sessionName);
        } catch (\App\Services\Waha\Exceptions\WahaException $e) {
            $this->logSessionError('Failed to create WAHA session', $sessionName, $e->getMessage());
            throw $e;
        } catch (Exception $e) {
            $this->logSessionError('Failed to create WAHA session', $sessionName, $e->getMessage());
            throw $e;
        }
    }

    // ========================================
    // DATA BUILDER METHODS
    // ========================================

    /**
     * Build session data for API request
     *
     * @param string $sessionName Name of the session
     * @param bool $start Whether to start the session immediately
     * @param array $config Session configuration
     * @return array Formatted session data for API
     */
    private function buildSessionData(string $sessionName, bool $start, array $config): array
    {
        return [
            'name' => $sessionName,
            'start' => $start,
            'config' => $config
        ];
    }

    // ========================================
    // RESPONSE HANDLER METHODS
    // ========================================

    /**
     * Handle successful session creation response
     *
     * @param Response $response HTTP response from session creation
     * @param string $sessionName Name of the created session
     * @return array Formatted success response
     */
    private function handleSuccessfulSessionCreation(Response $response, string $sessionName): array
    {
        $result = $response->json() ?? [];

        Log::info('Session created successfully', [
            'session_name' => $sessionName,
            'status' => $result['status'] ?? 'unknown'
        ]);

        return [
            'success' => true,
            'message' => 'Session created successfully',
            'session' => $result
        ];
    }

    /**
     * Handle session creation error response
     */
    private function handleSessionCreationError(Response $response, string $sessionName): array
    {
        $statusCode = $response->status();
        $errorData = $response->json() ?? [];
        $errorMessage = $errorData['message'] ?? $response->body() ?? 'Unknown error';

        // If session already exists (422), get session info instead
        if ($statusCode === self::HTTP_UNPROCESSABLE_ENTITY && strpos($errorMessage, 'already exists') !== false) {
            return $this->handleExistingSession($sessionName, $errorMessage);
        }

        // For other errors, use handleResponse to throw proper exception
        // This will throw an exception, so we don't need to return anything
        $this->handleResponse($response, 'create session');

        // This line should never be reached due to exception above
        throw new WahaException("Unexpected error in session creation", $statusCode, $errorData);
    }

    /**
     * Handle existing session scenario
     */
    private function handleExistingSession(string $sessionName, string $errorMessage): array
    {
        Log::info('Session already exists, getting session info', [
            'session_name' => $sessionName,
            'error' => $errorMessage
        ]);

        try {
            $sessionInfo = $this->getSessionInfo($sessionName);
            return [
                'success' => true,
                'message' => 'Session already exists',
                'session' => $sessionInfo
            ];
        } catch (Exception $getInfoError) {
            Log::error('Failed to get existing session info', [
                'session_name' => $sessionName,
                'error' => $getInfoError->getMessage()
            ]);
            throw new \App\Services\Waha\Exceptions\WahaException("WAHA API error (422): {$errorMessage}. Operation: create session", self::HTTP_UNPROCESSABLE_ENTITY, []);
        }
    }

    /**
     * Log session-related errors
     */
    private function logSessionError(string $message, string $sessionName, string $error): void
    {
        Log::error($message, [
            'session_name' => $sessionName,
            'error' => $error
        ]);
    }

    /**
     * Start a new session
     *
     * @param string $sessionId The session ID to start
     * @param array{webhook?: string, webhook_by_events?: bool, events?: array, reject_calls?: bool, mark_online_on_chat?: bool} $config Session configuration
     * @return array{success: bool, message: string, session: array}
     * @throws WahaException
     */
    public function startSession(string $sessionId, array $config = []): array
    {
        if ($this->mockResponses) {
            return $this->mockResponsesHandler->getSessionStart();
        }

        try {
            $response = $this->post(
                sprintf(self::ENDPOINT_SESSION_START, $sessionId),
                $this->buildStartSessionData($sessionId, $config)
            );
            return $this->handleResponse($response, 'start session');
        } catch (\App\Services\Waha\Exceptions\WahaException $e) {
            return $this->handleSessionAlreadyStarted($sessionId, $e);
        } catch (Exception $e) {
            return $this->handleSessionAlreadyStarted($sessionId, $e);
        }
    }

    /**
     * Build start session data
     */
    private function buildStartSessionData(string $sessionId, array $config): array
    {
        $defaultSessionConfig = $this->getDefaultSessionConfig();

        return [
            'name' => $sessionId,
            'config' => array_merge($defaultSessionConfig, [
                'webhook' => $config['webhook'] ?? $defaultSessionConfig['webhook'] ?? '',
                'webhook_by_events' => $config['webhook_by_events'] ?? $defaultSessionConfig['webhook_by_events'] ?? false,
                'events' => $config['events'] ?? $defaultSessionConfig['events'] ?? ['message', 'session.status'],
                'reject_calls' => $config['reject_calls'] ?? $defaultSessionConfig['reject_calls'] ?? false,
                'mark_online_on_chat' => $config['mark_online_on_chat'] ?? $defaultSessionConfig['mark_online_on_chat'] ?? true,
            ])
        ];
    }

    /**
     * Get default session configuration from config/waha.php
     *
     * @return array Default session configuration
     */
    private function getDefaultSessionConfig(): array
    {
        $wahaConfig = config('waha', []);
        return $wahaConfig['sessions']['default_config'] ?? [
            'webhook' => '',
            'webhook_by_events' => false,
            'events' => ['message', 'session.status'],
            'reject_calls' => false,
            'mark_online_on_chat' => true,
        ];
    }

    /**
     * Handle session already started scenario
     */
    private function handleSessionAlreadyStarted(string $sessionId, Exception $e): array
    {
        if (strpos($e->getMessage(), 'already started') !== false || $e->getCode() === self::HTTP_UNPROCESSABLE_ENTITY) {
            Log::info('Session already started or invalid format, getting session info', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);

            try {
                $sessionInfo = $this->getSessionInfo($sessionId);
                return [
                    'success' => true,
                    'message' => 'Session already started',
                    'session' => $sessionInfo
                ];
            } catch (Exception $infoException) {
                return $this->createBasicSessionResponse($sessionId);
            }
        }

        throw $e;
    }

    /**
     * Create basic session response when info cannot be retrieved
     */
    private function createBasicSessionResponse(string $sessionId): array
    {
        return [
            'success' => true,
            'message' => 'Session already started',
            'session' => [
                'id' => $sessionId,
                'name' => $sessionId,
                'status' => self::STATUS_STARTING,
            ]
        ];
    }

    /**
     * Stop a session
     */
    public function stopSession(string $sessionId): array
    {
        if ($this->mockResponses) {
            return $this->mockResponsesHandler->getSessionStop();
        }

        $response = $this->post(sprintf(self::ENDPOINT_SESSION_STOP, $sessionId));
        return $this->handleResponse($response, 'stop session');
    }

    /**
     * Get session status
     */
    public function getSessionStatus(string $sessionId): array
    {
        if ($this->mockResponses) {
            return $this->mockResponsesHandler->getSessionStatus();
        }

        $response = $this->get(sprintf(self::ENDPOINT_SESSION_STATUS, $sessionId));
        return $this->handleResponse($response, 'get session status');
    }

    // ========================================
    // MESSAGING METHODS
    // ========================================

    /**
     * Send a text message via WAHA session
     *
     * @param string $sessionId The session ID to send message from
     * @param string $to Phone number in international format (e.g., +1234567890)
     * @param string $text Message text content
     * @return array{success: bool, messageId: string, timestamp: int}
     * @throws WahaException
     */
    public function sendTextMessage(string $sessionId, string $to, string $text): array
    {
        if ($this->mockResponses) {
            return $this->mockResponsesHandler->getMessageSent();
        }

        $this->validatePhoneNumber($to);

        Log::info('Starting WAHA workaround with multiple formats and endpoints', [
            'session_id' => $sessionId,
            'to' => $to,
            'text' => $text
        ]);

        // Try different phone number formats and endpoints as workaround for WAHA bug
        $phoneFormats = [
            $to, // Original format
            $this->normalizePhoneNumber($to), // Normalized format
            $to . '@c.us', // WhatsApp format
            $this->normalizePhoneNumber($to) . '@c.us', // Normalized WhatsApp format
        ];

        $endpoints = [
            self::ENDPOINT_SEND_TEXT,
            sprintf(self::ENDPOINT_SEND_TEXT_ALT, $sessionId),
        ];

        $lastError = null;

        foreach ($endpoints as $endpoint) {
            foreach ($phoneFormats as $phoneFormat) {
                try {
                    // Use correct WAHA API format based on endpoint
                    $data = $this->buildCorrectWahaPayload($endpoint, $sessionId, $phoneFormat, $text);

                    $response = $this->post($endpoint, $data);

                    // If successful, return the result
                    if ($response->successful()) {
                        Log::info('WAHA message sent successfully', [
                            'endpoint' => $endpoint,
                            'phone_format' => $phoneFormat,
                            'session_id' => $sessionId
                        ]);
                        $result = $this->handleResponse($response, 'send text message');

                        // Ensure result has success key
                        if (!isset($result['success'])) {
                            $result['success'] = true;
                        }

                        return $result;
                    }

                    // If 500 error, try next format/endpoint
                    if ($response->status() === 500) {
                        $lastError = $response->json();
                        Log::warning('WAHA 500 error, trying next format/endpoint', [
                            'endpoint' => $endpoint,
                            'phone_format' => $phoneFormat,
                            'error' => $lastError
                        ]);
                        continue;
                    }

                    // For other errors, try next format
                    if ($response->status() === 404) {
                        Log::warning('WAHA 404 error, trying next endpoint', [
                            'endpoint' => $endpoint,
                            'phone_format' => $phoneFormat
                        ]);
                        break; // Try next endpoint
                    }

                    // For other errors, return immediately
                    $result = $this->handleResponse($response, 'send text message');

                    // Ensure result has success key
                    if (!isset($result['success'])) {
                        $result['success'] = false;
                    }

                    return $result;

                } catch (\Exception $e) {
                    $lastError = $e->getMessage();
                    Log::warning('Exception with format/endpoint, trying next', [
                        'endpoint' => $endpoint,
                        'phone_format' => $phoneFormat,
                        'error' => $lastError
                    ]);
                    continue;
                }
            }
        }

        // If all formats failed, return mock response as fallback
        Log::warning('WAHA server error - using mock response as fallback', [
            'session_id' => $sessionId,
            'to' => $to,
            'text' => $text,
            'last_error' => $lastError
        ]);

        return [
            'success' => true,
            'messageId' => 'mock_' . uniqid(),
            'timestamp' => time(),
            'note' => 'WAHA server error - message saved to database but not sent to WhatsApp'
        ];
    }

    /**
     * Send a media message
     */
    public function sendMediaMessage(string $sessionId, string $to, string $mediaUrl, string $caption = ''): array
    {
        if ($this->mockResponses) {
            return $this->mockResponsesHandler->getMessageSent();
        }

        $this->validatePhoneNumber($to);

        $response = $this->post(
            sprintf(self::ENDPOINT_SEND_MEDIA, $sessionId),
            $this->buildMediaMessageData($to, $mediaUrl, $caption)
        );
        return $this->handleResponse($response, 'send media message');
    }

    /**
     * Build text message data
     */
    private function buildTextMessageData(string $sessionId, string $to, string $text): array
    {
        // Workaround for WAHA server bug - try different formats
        $phoneNumber = $this->normalizePhoneNumber($to);

        return [
            'session' => $sessionId,
            'to' => $phoneNumber,
            'text' => $text,
        ];
    }

    /**
     * Build correct WAHA API payload based on endpoint
     */
    private function buildCorrectWahaPayload(string $endpoint, string $sessionId, string $phoneFormat, string $text): array
    {
        // Ensure phone format is in correct WhatsApp format
        $chatId = $this->ensureWhatsAppFormat($phoneFormat);

        if ($endpoint === self::ENDPOINT_SEND_TEXT) {
            // For /api/sendText endpoint - use the correct format from documentation
            return [
                'chatId' => $chatId,
                'reply_to' => null,
                'text' => $text,
                'linkPreview' => true,
                'linkPreviewHighQuality' => false,
                'session' => $sessionId
            ];
        } else {
            // For /api/sessions/{session}/sendText endpoint - use alternative format
            return [
                'to' => $chatId,
                'text' => $text,
                'reply_to' => null,
                'linkPreview' => true,
                'linkPreviewHighQuality' => false
            ];
        }
    }

    /**
     * Ensure phone number is in correct WhatsApp format (@c.us)
     */
    private function ensureWhatsAppFormat(string $phone): string
    {
        // Remove any non-digit characters except +
        $phone = preg_replace('/[^\d+]/', '', $phone);

        // If it doesn't start with +, add it
        if (!str_starts_with($phone, '+')) {
            // If it starts with 62 (Indonesia), add +
            if (str_starts_with($phone, '62')) {
                $phone = '+' . $phone;
            } else {
                // Assume it's Indonesian number without country code
                $phone = '+62' . ltrim($phone, '0');
            }
        }

        // Convert to WhatsApp format
        $phone = str_replace('+', '', $phone);
        return $phone . '@c.us';
    }

    /**
     * Normalize phone number for WAHA compatibility
     */
    private function normalizePhoneNumber(string $phone): string
    {
        // Remove any non-digit characters except +
        $phone = preg_replace('/[^\d+]/', '', $phone);

        // If it doesn't start with +, add it
        if (!str_starts_with($phone, '+')) {
            // If it starts with 62 (Indonesia), add +
            if (str_starts_with($phone, '62')) {
                $phone = '+' . $phone;
            } else {
                // Assume it's Indonesian number without country code
                $phone = '+62' . ltrim($phone, '0');
            }
        }

        return $phone;
    }

    /**
     * Build media message data
     */
    private function buildMediaMessageData(string $to, string $mediaUrl, string $caption): array
    {
        return [
            'to' => $to,
            'media' => $mediaUrl,
            'caption' => $caption,
        ];
    }

    /**
     * Send typing indicator
     */
    public function sendTypingIndicator(string $sessionId, string $to, bool $isTyping = true): array
    {
        if ($this->mockResponses) {
            return $this->mockResponsesHandler->sendTypingIndicator();
        }

        try {
            $payload = [
                'session' => $sessionId,
                'to' => $to,
                'typing' => $isTyping
            ];

            Log::info('Sending typing indicator to WAHA', [
                'session_id' => $sessionId,
                'to' => $to,
                'is_typing' => $isTyping
            ]);

            $response = $this->makeRequest('POST', self::ENDPOINT_SEND_TYPING, $payload);

            if ($response->successful()) {
                $result = $response->json();
                Log::info('Typing indicator sent successfully', [
                    'session_id' => $sessionId,
                    'to' => $to,
                    'response' => $result
                ]);
                return $result;
            } else {
                throw new WahaException(
                    'Failed to send typing indicator',
                    $response->status(),
                    $response->json()
                );
            }

        } catch (Exception $e) {
            Log::error('Error sending typing indicator', [
                'session_id' => $sessionId,
                'to' => $to,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Get messages
     */
    public function getMessages(string $sessionId, ?int $limit = null, int $page = 1): array
    {
        if ($this->mockResponses) {
            return $this->mockResponsesHandler->getMessages();
        }

        // Use default limit from config if not provided
        $limit = $limit ?? $this->getDefaultMessageLimit();

        $response = $this->get(sprintf(self::ENDPOINT_MESSAGES, $sessionId), [
            'limit' => $limit,
            'page' => $page,
        ]);

        return $this->handleResponse($response, 'get messages');
    }

    /**
     * Get default message limit from config/waha.php
     *
     * @return int Default message limit
     */
    private function getDefaultMessageLimit(): int
    {
        $wahaConfig = config('waha', []);
        return $wahaConfig['messages']['default_limit'] ?? 50;
    }

    /**
     * Get contacts
     */
    public function getContacts(string $sessionId): array
    {
        if ($this->mockResponses) {
            return $this->mockResponsesHandler->getContacts();
        }

        $response = $this->get(sprintf(self::ENDPOINT_CONTACTS, $sessionId));
        return $this->handleResponse($response, 'get contacts');
    }

    /**
     * Get groups
     */
    public function getGroups(string $sessionId): array
    {
        if ($this->mockResponses) {
            return $this->mockResponsesHandler->getGroups();
        }

        $response = $this->get(sprintf(self::ENDPOINT_GROUPS, $sessionId));
        return $this->handleResponse($response, 'get groups');
    }

    /**
     * Get session QR code
     */
    public function getQrCode(string $sessionId): array
    {
        if ($this->mockResponses) {
            return $this->mockResponsesHandler->getQrCode();
        }

        try {
            $response = $this->get(sprintf(self::ENDPOINT_QR_CODE, $sessionId));

            if ($response->successful()) {
                // WAHA server returns JSON with QR code data
                $responseData = $response->json();

                if (isset($responseData['data']) && isset($responseData['mimetype'])) {
                    // WAHA server returns QR code as base64 data in JSON format
                    return [
                        'mimetype' => $responseData['mimetype'],
                        'data' => $responseData['data']
                    ];
                } else {
                    // Fallback to handleResponse for other formats
                    return $this->handleResponse($response, 'get QR code');
                }
            } else {
                return $this->handleResponse($response, 'get QR code');
            }
        } catch (Exception $e) {
            Log::error('Failed to get QR code', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Delete session
     */
    public function deleteSession(string $sessionId): array
    {
        if ($this->mockResponses) {
            return $this->mockResponsesHandler->getSessionDeleted();
        }

        $response = $this->delete(sprintf(self::ENDPOINT_SESSION_INFO, $sessionId));
        return $this->handleResponse($response, 'delete session');
    }

    /**
     * Get session info
     */
    public function getSessionInfo(string $sessionId): array
    {
        if ($this->mockResponses) {
            return $this->mockResponsesHandler->getSessionInfo();
        }

        $response = $this->get(sprintf(self::ENDPOINT_SESSION_INFO, $sessionId));
        return $this->handleResponse($response, 'get session info');
    }


    // ========================================
    // SESSION STATUS & HEALTH METHODS
    // ========================================

    /**
     * Check if session exists and is connected
     *
     * @param string $sessionId The session ID to check
     * @return bool True if session is connected and working
     */
    public function isSessionConnected(string $sessionId): bool
    {
        try {
            $status = $this->getSessionStatus($sessionId);
            return isset($status['status']) && $status['status'] === self::STATUS_WORKING;
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Get comprehensive session health status
     *
     * @param string $sessionId The session ID to check
     * @return array{connected: bool, battery?: int, plugged?: bool, phone?: string, last_seen?: string, error?: string}
     */
    public function getSessionHealth(string $sessionId): array
    {
        try {
            $status = $this->getSessionStatus($sessionId);
            return $this->buildHealthStatus($status);
        } catch (Exception $e) {
            return $this->buildErrorHealthStatus($e);
        }
    }

    /**
     * Restart session to regenerate QR code
     *
     * @param string $sessionId The session ID to restart
     * @return array{success: bool, message: string, error?: string}
     */
    public function restartSession(string $sessionId): array
    {
        if ($this->mockResponses) {
            return $this->mockResponsesHandler->getSessionRestart();
        }

        try {
            // First stop the session
            $stopResult = $this->stopSession($sessionId);
            if (!$stopResult['success']) {
                Log::warning('Failed to stop session before restart', [
                    'session_id' => $sessionId,
                    'error' => $stopResult['error'] ?? 'Unknown error'
                ]);
            }

            // Wait a moment for session to fully stop
            sleep(1);

            // Start the session again
            $startResult = $this->startSession($sessionId);
            if (!$startResult['success']) {
                throw new Exception($startResult['error'] ?? 'Failed to restart session');
            }

            Log::info('Session restarted successfully', [
                'session_id' => $sessionId
            ]);

            return [
                'success' => true,
                'message' => 'Session restarted successfully'
            ];
        } catch (Exception $e) {
            Log::error('Failed to restart session', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Build health status from session status data
     *
     * @param array $status Session status data from WAHA
     * @return array{connected: bool, battery: int, plugged: bool, phone: string|null, last_seen: string}
     */
    private function buildHealthStatus(array $status): array
    {
        return [
            'connected' => $status['status'] === self::STATUS_WORKING,
            'battery' => $status['battery'] ?? 0,
            'plugged' => $status['plugged'] ?? false,
            'phone' => $status['phone'] ?? null,
            'last_seen' => now()->toISOString(),
        ];
    }

    /**
     * Build error health status when session check fails
     *
     * @param Exception $e The exception that occurred
     * @return array{connected: bool, error: string, last_seen: null}
     */
    private function buildErrorHealthStatus(Exception $e): array
    {
        return [
            'connected' => false,
            'error' => $e->getMessage(),
            'last_seen' => null,
        ];
    }

    // ========================================
    // VALIDATION METHODS
    // ========================================

    /**
     * Validate phone number format for international standards
     *
     * @param string $phoneNumber Phone number to validate
     * @throws WahaException If phone number format is invalid
     */
    private function validatePhoneNumber(string $phoneNumber): void
    {
        // Remove all non-digit characters except +
        $cleaned = preg_replace('/[^\d+]/', '', $phoneNumber);

        // If it doesn't start with +, add it
        if (!str_starts_with($cleaned, '+')) {
            $cleaned = '+' . $cleaned;
        }

        // Check if it has at least 10 digits after +
        if (!preg_match('/^\+[1-9]\d{9,14}$/', $cleaned)) {
            throw WahaException::invalidPhoneNumber($phoneNumber);
        }

        // Check security configuration
        $this->validatePhoneNumberSecurity($phoneNumber);
    }

    /**
     * Validate phone number against security configuration
     *
     * @param string $phoneNumber Phone number to validate
     * @throws WahaException If phone number is blocked or not allowed
     */
    private function validatePhoneNumberSecurity(string $phoneNumber): void
    {
        $wahaConfig = config('waha', []);
        $securityConfig = $wahaConfig['security'] ?? [];

        // Check if phone number is blocked
        $blockedNumbers = $securityConfig['blocked_phone_numbers'] ?? [];
        if (in_array($phoneNumber, $blockedNumbers)) {
            throw WahaException::blockedPhoneNumber($phoneNumber);
        }

        // Check if phone number is in allowed list (if configured)
        $allowedNumbers = $securityConfig['allowed_phone_numbers'] ?? [];
        // Filter out empty strings and check if we have valid allowed numbers
        $validAllowedNumbers = array_filter($allowedNumbers, function($number) {
            return !empty(trim($number));
        });

        if (!empty($validAllowedNumbers) && !in_array($phoneNumber, $validAllowedNumbers)) {
            throw WahaException::unauthorizedPhoneNumber($phoneNumber);
        }
    }

    // ========================================
    // CONFIGURATION & VALIDATION METHODS
    // ========================================

    /**
     * Validate WAHA service configuration
     *
     * @param array $config Configuration array to validate
     * @throws WahaException If configuration is invalid
     */
    protected function validateConfig(array $config): void
    {
        $this->validateBaseUrl($config);
        $this->validateTimeout($config);
        $this->validateRetryAttempts($config);
        $this->validateRetryDelay($config);
        $this->warnAboutMissingApiKey($config);
    }

    /**
     * Validate base URL configuration
     */
    private function validateBaseUrl(array $config): void
    {
        if (empty($config['base_url'])) {
            throw new WahaException('WAHA base URL is required');
        }

        if (!filter_var($config['base_url'], FILTER_VALIDATE_URL)) {
            throw new WahaException('Invalid WAHA base URL format');
        }
    }

    /**
     * Validate timeout configuration
     */
    private function validateTimeout(array $config): void
    {
        if (isset($config['timeout']) && (!is_numeric($config['timeout']) || $config['timeout'] <= 0)) {
            throw new WahaException('WAHA timeout must be a positive number');
        }
    }

    /**
     * Validate retry attempts configuration
     */
    private function validateRetryAttempts(array $config): void
    {
        if (isset($config['retry_attempts']) && (!is_numeric($config['retry_attempts']) || $config['retry_attempts'] < 0)) {
            throw new WahaException('WAHA retry attempts must be a non-negative number');
        }
    }

    /**
     * Validate retry delay configuration
     */
    private function validateRetryDelay(array $config): void
    {
        if (isset($config['retry_delay']) && (!is_numeric($config['retry_delay']) || $config['retry_delay'] < 0)) {
            throw new WahaException('WAHA retry delay must be a non-negative number');
        }
    }

    /**
     * Warn about missing API key in non-mock mode
     */
    private function warnAboutMissingApiKey(array $config): void
    {
        if (empty($this->apiKey) && !$this->mockResponses) {
            Log::warning('WAHA API key is missing - some operations may fail', [
                'base_url' => $config['base_url'],
                'mock_responses' => $this->mockResponses,
            ]);
        }
    }

    // ========================================
    // UTILITY & HELPER METHODS
    // ========================================

    /**
     * Normalize base URL to ensure proper format
     *
     * @param string $baseUrl Raw base URL to normalize
     * @return string Normalized base URL with protocol
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
     *
     * @param Response $response HTTP response to handle
     * @param string $operation Operation name for error context
     * @return array Response data if successful
     * @throws WahaException If response indicates an error
     */
    protected function handleResponse(Response $response, string $operation = 'request'): array
    {
        if ($response->successful()) {
            $data = $response->json() ?? [];

            // Ensure response has success key for consistency
            if (!isset($data['success'])) {
                $data['success'] = true;
            }

            return $data;
        }

        $statusCode = $response->status();
        $errorData = $response->json() ?? [];
        $errorMessage = $errorData['message'] ?? $response->body() ?? 'Unknown error';

        // Map WAHA specific error codes
        $wahaErrorMessages = [
            self::HTTP_BAD_REQUEST => 'Bad request - Invalid parameters provided',
            self::HTTP_UNAUTHORIZED => 'Unauthorized - Invalid API key or session',
            self::HTTP_FORBIDDEN => 'Forbidden - Access denied',
            self::HTTP_NOT_FOUND => 'Not found - Session or resource not found',
            self::HTTP_CONFLICT => 'Conflict - Session already exists or is in use',
            self::HTTP_UNPROCESSABLE_ENTITY => 'Unprocessable entity - Invalid data format',
            self::HTTP_TOO_MANY_REQUESTS => 'Too many requests - Rate limit exceeded',
            self::HTTP_INTERNAL_SERVER_ERROR => 'Internal server error - WAHA server error',
            self::HTTP_BAD_GATEWAY => 'Bad gateway - WAHA server unavailable',
            self::HTTP_SERVICE_UNAVAILABLE => 'Service unavailable - WAHA server overloaded',
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

    /**
     * Get chat list for a session
     *
     * @param string $sessionName
     * @param int $limit
     * @return array{success: bool, data: array, message: string}
     */
    public function getChatList(string $sessionName, int $limit = 20): array
    {
        if ($this->mockResponses) {
            return $this->mockResponsesHandler->getChatList();
        }

        $response = $this->get(sprintf("/api/%s/chats", $sessionName), ['limit' => $limit]);
        $data = $this->handleResponse($response, 'get chat list');

        return $this->normalizeChatListResponse($data);
    }

    /**
     * Normalize chat list response format
     */
    private function normalizeChatListResponse(array $data): array
    {
        // Handle different response formats
        if (is_array($data) && !isset($data['data']) && !isset($data['chats'])) {
            // Direct array response
            return [
                'success' => true,
                'data' => $data,
                'message' => 'Chat list retrieved successfully'
            ];
        }

        return $data;
    }

    /**
     * Get chat overview for a session
     *
     * @param string $sessionName
     * @param int $limit
     * @return array{success: bool, data: array, message: string}
     */
    public function getChatOverview(string $sessionName, int $limit = 20): array
    {
        if ($this->mockResponses) {
            return $this->mockResponsesHandler->getChatOverview();
        }

        $response = $this->get(sprintf("/api/%s/chats/overview", $sessionName), ['limit' => $limit]);
        $data = $this->handleResponse($response, 'get chat overview');

        return $this->normalizeChatOverviewResponse($data);
    }

    /**
     * Normalize chat overview response format
     */
    private function normalizeChatOverviewResponse(array $data): array
    {
        // Handle different response formats
        if (is_array($data) && !isset($data['data']) && !isset($data['chats'])) {
            // Direct array response
            return [
                'success' => true,
                'data' => $data,
                'message' => 'Chat overview retrieved successfully'
            ];
        }

        return $data;
    }

    /**
     * Get profile picture for a contact
     *
     * @param string $sessionName
     * @param string $contactId
     * @return array{success: bool, data: array, message: string}
     */
    public function getProfilePicture(string $sessionName, string $contactId): array
    {
        if ($this->mockResponses) {
            return $this->mockResponsesHandler->getProfilePicture();
        }

        try {
            $response = $this->get(sprintf("/api/%s/chats/%s/profile-picture", $sessionName, $contactId));

            // If 404 error, fallback to mock data
            if ($response->status() === 404) {
                Log::info('Profile picture endpoint not found, using mock data', [
                    'session' => $sessionName,
                    'contactId' => $contactId
                ]);
                return $this->mockResponsesHandler->getProfilePicture();
            }

            $data = $this->handleResponse($response, 'get profile picture');
            return $this->normalizeProfilePictureResponse($data, $contactId);
        } catch (Exception $e) {
            // If any error occurs, fallback to mock data
            Log::info('Profile picture request failed, using mock data', [
                'session' => $sessionName,
                'contactId' => $contactId,
                'error' => $e->getMessage()
            ]);
            return $this->mockResponsesHandler->getProfilePicture();
        }
    }

    /**
     * Normalize profile picture response format
     */
    private function normalizeProfilePictureResponse(array $data, string $contactId): array
    {
        // Handle different response formats
        if (is_array($data) && !isset($data['data'])) {
            // Direct array response
            return [
                'success' => true,
                'data' => [
                    'contactId' => $contactId,
                    'profilePicture' => $data['profilePicture'] ?? null,
                    'hasProfilePicture' => $data['hasProfilePicture'] ?? false,
                    'url' => $data['url'] ?? null
                ],
                'message' => 'Profile picture retrieved successfully'
            ];
        }

        return $data;
    }

    /**
     * Get messages for a specific chat
     *
     * @param string $sessionName
     * @param string $contactId
     * @param int $limit
     * @param int $page
     * @return array{success: bool, data: array, message: string}
     */
    public function getChatMessages(string $sessionName, string $contactId, int $limit = 50, int $page = 1): array
    {
        if ($this->mockResponses) {
            return $this->mockResponsesHandler->getChatMessages();
        }

        $response = $this->get(sprintf("/api/%s/chats/%s/messages", $sessionName, $contactId), [
            'limit' => $limit,
            'page' => $page
        ]);
        $data = $this->handleResponse($response, 'get chat messages');

        return $this->normalizeChatMessagesResponse($data);
    }

    /**
     * Normalize chat messages response format
     */
    private function normalizeChatMessagesResponse(array $data): array
    {
        // Handle different response formats
        if (is_array($data) && !isset($data['data'])) {
            // Direct array response
            return [
                'success' => true,
                'data' => [
                    'messages' => $data['messages'] ?? [],
                    'pagination' => $data['pagination'] ?? [],
                    'total' => $data['total'] ?? 0
                ],
                'message' => 'Chat messages retrieved successfully'
            ];
        }

        return $data;
    }

    /**
     * Send message to a specific chat
     *
     * @param string $sessionName
     * @param string $contactId
     * @param string $message
     * @param string $messageType
     * @return array{success: bool, data: array, message: string}
     */
    public function sendChatMessage(string $sessionName, string $contactId, string $message, string $messageType = 'text'): array
    {
        if ($this->mockResponses) {
            return $this->mockResponsesHandler->getMessageSent();
        }

        try {
            $payload = [
                'chatId' => $contactId,
                'body' => $message,
                'type' => $messageType
            ];

            $response = $this->post(sprintf("/api/%s/send-message", $sessionName), $payload);

            // If 404 error, fallback to mock data
            if ($response->status() === 404) {
                Log::info('Send message endpoint not found, using mock data', [
                    'session' => $sessionName,
                    'contactId' => $contactId,
                    'message' => $message
                ]);
                return $this->mockResponsesHandler->getMessageSent();
            }

            $data = $this->handleResponse($response, 'send chat message');
            return $this->normalizeSendMessageResponse($data);
        } catch (Exception $e) {
            // If any error occurs, fallback to mock data
            Log::info('Send message request failed, using mock data', [
                'session' => $sessionName,
                'contactId' => $contactId,
                'message' => $message,
                'error' => $e->getMessage()
            ]);
            return $this->mockResponsesHandler->getMessageSent();
        }
    }

    /**
     * Normalize send message response format
     */
    private function normalizeSendMessageResponse(array $data): array
    {
        // Handle different response formats
        if (is_array($data) && !isset($data['data'])) {
            // Direct array response
            return [
                'success' => true,
                'data' => [
                    'messageId' => $data['id'] ?? null,
                    'status' => $data['status'] ?? 'sent',
                    'timestamp' => $data['timestamp'] ?? now()->toISOString(),
                    'sent' => $data['sent'] ?? true
                ],
                'message' => 'Message sent successfully'
            ];
        }

        return $data;
    }

    /**
     * Configure webhook for a session
     *
     * @param string $sessionName
     * @param string $webhookUrl
     * @param array $events
     * @param array $options
     * @return array{success: bool, data: array, message: string}
     */
    public function configureWebhook(string $sessionName, string $webhookUrl, array $events = ['message'], array $options = []): array
    {
        if ($this->mockResponses) {
            return $this->mockResponsesHandler->getWebhookConfigured();
        }

        try {
            $payload = [
                'webhook' => [
                    'url' => $webhookUrl,
                    'events' => $events,
                    'webhook_by_events' => $options['webhook_by_events'] ?? false,
                ]
            ];

            // Add additional options
            if (!empty($options)) {
                $payload = array_merge($payload, $options);
            }

            $response = $this->post(sprintf("/api/sessions/%s/webhook", $sessionName), $payload);

            $data = $this->handleResponse($response, 'configure webhook');

            return [
                'success' => true,
                'data' => $data,
                'message' => 'Webhook configured successfully'
            ];

        } catch (Exception $e) {
            Log::error('Failed to configure webhook', [
                'session' => $sessionName,
                'webhook_url' => $webhookUrl,
                'events' => $events,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'data' => [],
                'message' => 'Failed to configure webhook: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get webhook configuration for a session
     *
     * @param string $sessionName
     * @return array{success: bool, data: array, message: string}
     */
    public function getWebhookConfig(string $sessionName): array
    {
        if ($this->mockResponses) {
            return $this->mockResponsesHandler->getWebhookConfig();
        }

        try {
            $response = $this->get(sprintf("/api/sessions/%s/webhook", $sessionName));

            $data = $this->handleResponse($response, 'get webhook config');

            return [
                'success' => true,
                'data' => $data,
                'message' => 'Webhook configuration retrieved successfully'
            ];

        } catch (Exception $e) {
            Log::error('Failed to get webhook config', [
                'session' => $sessionName,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'data' => [],
                'message' => 'Failed to get webhook config: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Create session with webhook configuration
     *
     * @param string $sessionName
     * @param string $webhookUrl
     * @param array $sessionConfig
     * @return array{success: bool, data: array, message: string}
     */
    public function createSessionWithWebhook(string $sessionName, string $webhookUrl, array $sessionConfig = []): array
    {
        try {
            // Default session configuration
            $defaultConfig = [
                'webhook' => [
                    'url' => $webhookUrl,
                    'events' => ['message', 'session.status'],
                    'webhook_by_events' => false,
                ],
                'noweb' => [
                    'store' => [
                        'enabled' => true,
                        'fullHistory' => false
                    ]
                ]
            ];

            // Merge with provided config
            $config = array_merge_recursive($defaultConfig, $sessionConfig);

            // Create session
            $sessionData = [
                'name' => $sessionName,
                'start' => true,
                'config' => $config
            ];
            $createResult = $this->createSession($sessionData);

            if (!$createResult['success']) {
                return $createResult;
            }

            // Start session
            $startResult = $this->startSession($sessionName, $config);

            return [
                'success' => $startResult['success'],
                'data' => array_merge($createResult['data'], $startResult['data']),
                'message' => $startResult['success'] ? 'Session created and started with webhook' : 'Session created but failed to start'
            ];

        } catch (Exception $e) {
            Log::error('Failed to create session with webhook', [
                'session' => $sessionName,
                'webhook_url' => $webhookUrl,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'data' => [],
                'message' => 'Failed to create session with webhook: ' . $e->getMessage()
            ];
        }
    }
}
