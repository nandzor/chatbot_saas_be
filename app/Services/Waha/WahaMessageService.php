<?php

namespace App\Services\Waha;

use App\Models\WahaSession;
use Illuminate\Support\Facades\Log;

class WahaMessageService
{
    protected WahaService $wahaService;
    protected WahaSyncService $wahaSyncService;

    public function __construct(
        WahaService $wahaService,
        WahaSyncService $wahaSyncService
    ) {
        $this->wahaService = $wahaService;
        $this->wahaSyncService = $wahaSyncService;
    }

    /**
     * Send text message
     */
    public function sendTextMessage(string $sessionId, string $to, string $text, string $organizationId): array
    {
        try {
            // Verify session belongs to current organization
            $localSession = $this->wahaSyncService->verifySessionAccess($organizationId, $sessionId);
            if (!$localSession) {
                return [
                    'success' => false,
                    'message' => 'Session not found',
                    'code' => 404
                ];
            }

            $result = $this->wahaService->sendTextMessage($sessionId, $to, $text);

            // Update message count in local session
            if ($result['success'] ?? false) {
                $localSession->increment('total_messages_sent');
            }

            return [
                'success' => true,
                'message' => 'Message sent successfully',
                'data' => $result
            ];

        } catch (\Exception $e) {
            Log::error('Failed to send WAHA text message', [
                'session_id' => $sessionId,
                'organization_id' => $organizationId,
                'error' => $e->getMessage()
            ]);
            return [
                'success' => false,
                'message' => 'Failed to send message',
                'code' => 500
            ];
        }
    }

    /**
     * Send media message
     */
    public function sendMediaMessage(string $sessionId, string $to, string $mediaUrl, ?string $caption, string $organizationId): array
    {
        try {
            // Verify session belongs to current organization
            $localSession = $this->wahaSyncService->verifySessionAccess($organizationId, $sessionId);
            if (!$localSession) {
                return [
                    'success' => false,
                    'message' => 'Session not found',
                    'code' => 404
                ];
            }

            $result = $this->wahaService->sendMediaMessage($sessionId, $to, $mediaUrl, $caption ?? '');

            // Update media count in local session
            if ($result['success'] ?? false) {
                $localSession->increment('total_media_sent');
            }

            return [
                'success' => true,
                'message' => 'Media message sent successfully',
                'data' => $result
            ];

        } catch (\Exception $e) {
            Log::error('Failed to send WAHA media message', [
                'session_id' => $sessionId,
                'organization_id' => $organizationId,
                'error' => $e->getMessage()
            ]);
            return [
                'success' => false,
                'message' => 'Failed to send media message',
                'code' => 500
            ];
        }
    }

    /**
     * Get messages
     */
    public function getMessages(string $sessionId, ?int $limit, int $page, string $organizationId): array
    {
        try {
            // Verify session belongs to current organization
            $localSession = $this->wahaSyncService->verifySessionAccess($organizationId, $sessionId);
            if (!$localSession) {
                return [
                    'success' => false,
                    'message' => 'Session not found',
                    'code' => 404
                ];
            }

            $messages = $this->wahaService->getMessages($sessionId, $limit, $page);

            return [
                'success' => true,
                'message' => 'Messages retrieved successfully',
                'data' => $messages
            ];

        } catch (\Exception $e) {
            Log::error('Failed to get WAHA messages', [
                'session_id' => $sessionId,
                'organization_id' => $organizationId,
                'error' => $e->getMessage()
            ]);
            return [
                'success' => false,
                'message' => 'Failed to retrieve messages',
                'code' => 500
            ];
        }
    }

    /**
     * Get contacts
     */
    public function getContacts(string $sessionId, string $organizationId): array
    {
        try {
            // Verify session belongs to current organization
            $localSession = $this->wahaSyncService->verifySessionAccess($organizationId, $sessionId);
            if (!$localSession) {
                return [
                    'success' => false,
                    'message' => 'Session not found',
                    'code' => 404
                ];
            }

            $contacts = $this->wahaService->getContacts($sessionId);

            return [
                'success' => true,
                'message' => 'Contacts retrieved successfully',
                'data' => $contacts
            ];

        } catch (\Exception $e) {
            Log::error('Failed to get WAHA contacts', [
                'session_id' => $sessionId,
                'organization_id' => $organizationId,
                'error' => $e->getMessage()
            ]);
            return [
                'success' => false,
                'message' => 'Failed to retrieve contacts',
                'code' => 500
            ];
        }
    }

    /**
     * Get groups
     */
    public function getGroups(string $sessionId, string $organizationId): array
    {
        try {
            // Verify session belongs to current organization
            $localSession = $this->wahaSyncService->verifySessionAccess($organizationId, $sessionId);
            if (!$localSession) {
                return [
                    'success' => false,
                    'message' => 'Session not found',
                    'code' => 404
                ];
            }

            $groups = $this->wahaService->getGroups($sessionId);

            return [
                'success' => true,
                'message' => 'Groups retrieved successfully',
                'data' => $groups
            ];

        } catch (\Exception $e) {
            Log::error('Failed to get WAHA groups', [
                'session_id' => $sessionId,
                'organization_id' => $organizationId,
                'error' => $e->getMessage()
            ]);
            return [
                'success' => false,
                'message' => 'Failed to retrieve groups',
                'code' => 500
            ];
        }
    }

    /**
     * Get chat list
     */
    public function getChatList(string $sessionId, int $limit, string $organizationId): array
    {
        try {
            // Get session name from database
            $session = $this->wahaSyncService->verifySessionAccessById($organizationId, $sessionId);
            if (!$session) {
                return [
                    'success' => false,
                    'message' => 'Session not found',
                    'code' => 404
                ];
            }

            $sessionName = $session->session_name;
            $result = $this->wahaService->getChatList($sessionName, $limit);

            return [
                'success' => true,
                'message' => $result['message'] ?? 'Chat list retrieved successfully',
                'data' => [
                    'chats' => $result['data']['chats'] ?? [],
                    'total' => $result['data']['total'] ?? 0,
                    'limit' => $limit,
                    'session_id' => $sessionId,
                    'session_name' => $sessionName
                ]
            ];

        } catch (\Exception $e) {
            Log::error('Failed to get chat list', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            return [
                'success' => false,
                'message' => 'Failed to get chat list: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }

    /**
     * Get chat overview
     */
    public function getChatOverview(string $sessionId, int $limit, string $organizationId): array
    {
        try {
            // Get session name from database
            $session = $this->wahaSyncService->verifySessionAccessById($organizationId, $sessionId);
            if (!$session) {
                return [
                    'success' => false,
                    'message' => 'Session not found',
                    'code' => 404
                ];
            }

            $sessionName = $session->session_name;
            $result = $this->wahaService->getChatOverview($sessionName, $limit);

            return [
                'success' => true,
                'message' => $result['message'] ?? 'Chat overview retrieved successfully',
                'data' => [
                    'chats' => $result['data']['chats'] ?? [],
                    'total' => $result['data']['total'] ?? 0,
                    'limit' => $limit,
                    'session_id' => $sessionId,
                    'session_name' => $sessionName
                ]
            ];

        } catch (\Exception $e) {
            Log::error('Failed to get chat overview', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            return [
                'success' => false,
                'message' => 'Failed to get chat overview: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }

    /**
     * Get profile picture
     */
    public function getProfilePicture(string $sessionId, string $contactId, string $organizationId): array
    {
        try {
            // Get session name from database
            $session = $this->wahaSyncService->verifySessionAccessById($organizationId, $sessionId);
            if (!$session) {
                return [
                    'success' => false,
                    'message' => 'Session not found',
                    'code' => 404
                ];
            }

            $sessionName = $session->session_name;
            $result = $this->wahaService->getProfilePicture($sessionName, $contactId);

            return [
                'success' => true,
                'message' => $result['message'] ?? 'Profile picture retrieved successfully',
                'data' => $result['data'] ?? []
            ];

        } catch (\Exception $e) {
            Log::error('Failed to get profile picture', [
                'session_id' => $sessionId,
                'contact_id' => $contactId,
                'error' => $e->getMessage()
            ]);
            return [
                'success' => false,
                'message' => 'Failed to get profile picture: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }

    /**
     * Get chat messages
     */
    public function getChatMessages(string $sessionId, string $contactId, int $limit, int $page, string $organizationId): array
    {
        try {
            // Get session name from database
            $session = $this->wahaSyncService->verifySessionAccessById($organizationId, $sessionId);
            if (!$session) {
                return [
                    'success' => false,
                    'message' => 'Session not found',
                    'code' => 404
                ];
            }

            $sessionName = $session->session_name;
            $result = $this->wahaService->getChatMessages($sessionName, $contactId, $limit, $page);

            return [
                'success' => true,
                'message' => $result['message'] ?? 'Chat messages retrieved successfully',
                'data' => $result['data'] ?? []
            ];

        } catch (\Exception $e) {
            Log::error('Failed to get chat messages', [
                'session_id' => $sessionId,
                'contact_id' => $contactId,
                'error' => $e->getMessage()
            ]);
            return [
                'success' => false,
                'message' => 'Failed to get chat messages: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }

    /**
     * Send chat message
     */
    public function sendChatMessage(string $sessionId, string $contactId, string $message, string $type, string $organizationId): array
    {
        try {
            // Get session name from database
            $session = $this->wahaSyncService->verifySessionAccessById($organizationId, $sessionId);
            if (!$session) {
                return [
                    'success' => false,
                    'message' => 'Session not found',
                    'code' => 404
                ];
            }

            $sessionName = $session->session_name;
            $result = $this->wahaService->sendChatMessage($sessionName, $contactId, $message, $type);

            return [
                'success' => true,
                'message' => $result['message'] ?? 'Message sent successfully',
                'data' => $result['data'] ?? []
            ];

        } catch (\Exception $e) {
            Log::error('Failed to send chat message', [
                'session_id' => $sessionId,
                'contact_id' => $contactId,
                'error' => $e->getMessage()
            ]);
            return [
                'success' => false,
                'message' => 'Failed to send chat message: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }

    /**
     * Check if session is connected
     */
    public function isSessionConnected(string $sessionId, string $organizationId): array
    {
        try {
            // Verify session belongs to current organization
            $localSession = $this->wahaSyncService->verifySessionAccess($organizationId, $sessionId);
            if (!$localSession) {
                return [
                    'success' => false,
                    'message' => 'Session not found',
                    'code' => 404
                ];
            }

            $connected = $this->wahaService->isSessionConnected($sessionId);

            return [
                'success' => true,
                'message' => 'Session connection status retrieved successfully',
                'data' => ['connected' => $connected]
            ];

        } catch (\Exception $e) {
            Log::error('Failed to check WAHA session connection', [
                'session_id' => $sessionId,
                'organization_id' => $organizationId,
                'error' => $e->getMessage()
            ]);
            return [
                'success' => false,
                'message' => 'Failed to check session connection',
                'code' => 500
            ];
        }
    }

    /**
     * Get session health
     */
    public function getSessionHealth(string $sessionId, string $organizationId): array
    {
        try {
            // Verify session belongs to current organization
            $localSession = $this->wahaSyncService->verifySessionAccess($organizationId, $sessionId);
            if (!$localSession) {
                return [
                    'success' => false,
                    'message' => 'Session not found',
                    'code' => 404
                ];
            }

            $health = $this->wahaService->getSessionHealth($sessionId);

            return [
                'success' => true,
                'message' => 'Session health status retrieved successfully',
                'data' => $health
            ];

        } catch (\Exception $e) {
            Log::error('Failed to get WAHA session health', [
                'session_id' => $sessionId,
                'organization_id' => $organizationId,
                'error' => $e->getMessage()
            ]);
            return [
                'success' => false,
                'message' => 'Failed to retrieve session health',
                'code' => 500
            ];
        }
    }
}
