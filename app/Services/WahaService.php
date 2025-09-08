<?php

namespace App\Services;

use CCK\LaravelWahaSaloonSdk\Waha\Waha;
use Illuminate\Support\Facades\Log;
use Exception;

class WahaService
{
    protected Waha $wahaClient;
    protected bool $mockResponses;

    public function __construct()
    {
        $this->wahaClient = new Waha(
            config('waha.server.url'),
            config('waha.server.api_key')
        );
        $this->mockResponses = config('waha.testing.mock_responses', false);
    }

    /**
     * Test connection to WAHA server
     */
    public function testConnection(): array
    {
        try {
            if ($this->mockResponses) {
                return [
                    'success' => true,
                    'message' => 'Mock WAHA connection successful',
                    'server_info' => [
                        'version' => 'mock-1.0.0',
                        'status' => 'running',
                        'timestamp' => now()->toISOString(),
                    ]
                ];
            }

            // Test connection by getting server status
            $response = $this->wahaClient->server()->getTheServerStatus();

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'WAHA connection successful',
                    'server_info' => [
                        'status' => 'running',
                        'timestamp' => now()->toISOString(),
                        'data' => $response->json()
                    ]
                ];
            }

            return [
                'success' => false,
                'message' => 'WAHA connection failed',
                'error' => $response->body(),
            ];
        } catch (Exception $e) {
            Log::error('WAHA connection test failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Connection failed: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get all sessions
     */
    public function getSessions(): array
    {
        try {
            if ($this->mockResponses) {
                return $this->getMockSessions();
            }

            $response = $this->wahaClient->misc()->listAllSessions('true');

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to fetch sessions',
                'error' => $response->body(),
            ];
        } catch (Exception $e) {
            Log::error('Failed to fetch WAHA sessions', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to fetch sessions: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get session information
     */
    public function getSession(string $sessionId): array
    {
        try {
            if ($this->mockResponses) {
                return $this->getMockSession($sessionId);
            }

            $response = $this->wahaClient->sessions()->getSessionInformation($sessionId);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to fetch session information',
                'error' => $response->body(),
            ];
        } catch (Exception $e) {
            Log::error('Failed to fetch WAHA session', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to fetch session: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Start a session
     */
    public function startSession(string $sessionId, array $config = []): array
    {
        try {
            if ($this->mockResponses) {
                return [
                    'success' => true,
                    'message' => 'Session started successfully (mock)',
                    'session_id' => $sessionId,
                ];
            }

            // If settings exist, use upsertAndStartSession; otherwise simple start
            if (!empty($config)) {
                $response = $this->wahaClient->misc()->upsertAndStartSession($sessionId, $config);
            } else {
                $response = $this->wahaClient->sessions()->startTheSession($sessionId);
            }

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Session started successfully',
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to start session',
                'error' => $response->body(),
            ];
        } catch (Exception $e) {
            Log::error('Failed to start WAHA session', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to start session: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Stop a session
     */
    public function stopSession(string $sessionId): array
    {
        try {
            if ($this->mockResponses) {
                return [
                    'success' => true,
                    'message' => 'Session stopped successfully (mock)',
                    'session_id' => $sessionId,
                ];
            }

            $response = $this->wahaClient->sessions()->stopTheSession($sessionId);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Session stopped successfully',
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to stop session',
                'error' => $response->body(),
            ];
        } catch (Exception $e) {
            Log::error('Failed to stop WAHA session', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to stop session: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Delete a session
     */
    public function deleteSession(string $sessionId): array
    {
        try {
            if ($this->mockResponses) {
                return [
                    'success' => true,
                    'message' => 'Session deleted successfully (mock)',
                    'session_id' => $sessionId,
                ];
            }

            $response = $this->wahaClient->sessions()->deleteTheSession($sessionId);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Session deleted successfully',
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to delete session',
                'error' => $response->body(),
            ];
        } catch (Exception $e) {
            Log::error('Failed to delete WAHA session', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to delete session: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Send text message
     */
    public function sendTextMessage(string $sessionId, string $to, string $text): array
    {
        try {
            if ($this->mockResponses) {
                return $this->getMockMessageResponse($sessionId, $to, $text);
            }

            $response = $this->wahaClient->sendText()->sendTextMessageDuplicate1($to, $text, $sessionId);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Message sent successfully',
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to send message',
                'error' => $response->body(),
            ];
        } catch (Exception $e) {
            Log::error('Failed to send WAHA text message', [
                'session_id' => $sessionId,
                'to' => $to,
                'text' => $text,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to send message: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get chats
     */
    public function getChats(string $sessionId): array
    {
        try {
            if ($this->mockResponses) {
                return $this->getMockChats();
            }

            $response = $this->wahaClient->misc()->getChats($sessionId, null, null, null, null);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to fetch chats',
                'error' => $response->body(),
            ];
        } catch (Exception $e) {
            Log::error('Failed to fetch WAHA chats', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to fetch chats: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get messages
     */
    public function getMessages(string $sessionId, string $chatId, int $limit = 50): array
    {
        try {
            if ($this->mockResponses) {
                return $this->getMockMessages($chatId, $limit);
            }

            $response = $this->wahaClient->chats()->getsMessagesInTheChat($sessionId, $chatId, null, (string)$limit, null, null, null, null, null);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to fetch messages',
                'error' => $response->body(),
            ];
        } catch (Exception $e) {
            Log::error('Failed to fetch WAHA messages', [
                'session_id' => $sessionId,
                'chat_id' => $chatId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to fetch messages: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get contacts
     */
    public function getContacts(string $sessionId): array
    {
        try {
            if ($this->mockResponses) {
                return $this->getMockContacts();
            }

            $response = $this->wahaClient->contacts()->getAllContacts($sessionId, null, null, null, null);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to fetch contacts',
                'error' => $response->body(),
            ];
        } catch (Exception $e) {
            Log::error('Failed to fetch WAHA contacts', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to fetch contacts: ' . $e->getMessage(),
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Mock responses for testing
     */
    protected function getMockSessions(): array
    {
        return [
            'success' => true,
            'data' => [
                [
                    'id' => 'mock-session-1',
                    'name' => 'Test Session 1',
                    'status' => 'started',
                    'created_at' => now()->toISOString(),
                ],
                [
                    'id' => 'mock-session-2',
                    'name' => 'Test Session 2',
                    'status' => 'stopped',
                    'created_at' => now()->subHours(2)->toISOString(),
                ],
            ],
        ];
    }

    protected function getMockSession(string $sessionId): array
    {
        return [
            'success' => true,
            'data' => [
                'id' => $sessionId,
                'name' => 'Mock Session',
                'status' => 'started',
                'created_at' => now()->toISOString(),
                'phone' => '+1234567890',
                'webhook' => 'https://example.com/webhook',
            ],
        ];
    }

    protected function getMockMessageResponse(string $sessionId, string $to, string $text): array
    {
        return [
            'success' => true,
            'message' => 'Message sent successfully (mock)',
            'data' => [
                'id' => 'mock-message-' . uniqid(),
                'sessionId' => $sessionId,
                'to' => $to,
                'text' => $text,
                'status' => 'sent',
                'timestamp' => now()->toISOString(),
            ],
        ];
    }

    protected function getMockChats(): array
    {
        return [
            'success' => true,
            'data' => [
                [
                    'id' => 'mock-chat-1',
                    'name' => 'John Doe',
                    'unreadCount' => 2,
                    'lastMessage' => 'Hello there!',
                    'timestamp' => now()->subMinutes(5)->toISOString(),
                ],
                [
                    'id' => 'mock-chat-2',
                    'name' => 'Jane Smith',
                    'unreadCount' => 0,
                    'lastMessage' => 'Thanks for the info',
                    'timestamp' => now()->subHours(1)->toISOString(),
                ],
            ],
        ];
    }

    protected function getMockMessages(string $chatId, int $limit): array
    {
        $messages = [];
        for ($i = 0; $i < min($limit, 10); $i++) {
            $messages[] = [
                'id' => 'mock-message-' . $i,
                'chatId' => $chatId,
                'text' => 'Mock message ' . $i,
                'fromMe' => $i % 2 === 0,
                'timestamp' => now()->subMinutes($i)->toISOString(),
            ];
        }

        return [
            'success' => true,
            'data' => $messages,
        ];
    }

    protected function getMockContacts(): array
    {
        return [
            'success' => true,
            'data' => [
                [
                    'id' => 'mock-contact-1',
                    'name' => 'John Doe',
                    'phone' => '+1234567890',
                    'isGroup' => false,
                ],
                [
                    'id' => 'mock-contact-2',
                    'name' => 'Jane Smith',
                    'phone' => '+0987654321',
                    'isGroup' => false,
                ],
            ],
        ];
    }
}
