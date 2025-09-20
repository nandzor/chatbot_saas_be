<?php

namespace App\Services\Waha;

/**
 * Mock responses for WAHA service testing
 *
 * This class provides mock responses for all WAHA API endpoints
 * to enable testing without requiring a real WAHA server.
 */
class MockWahaResponses
{
    /**
     * Get mock sessions response
     *
     * @return array{sessions: array}
     */
    public function getSessions(): array
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

    /**
     * Get mock session creation response
     *
     * @return array{success: bool, message: string, session: array}
     */
    public function getSessionCreate(): array
    {
        return [
            'success' => true,
            'message' => 'Session created successfully',
            'session' => [
                'id' => 'test-session',
                'name' => 'default',
                'status' => 'SCAN_QR_CODE',
                'created_at' => now()->toISOString(),
            ]
        ];
    }

    /**
     * Get mock session start response
     *
     * @return array{success: bool, message: string, session: array}
     */
    public function getSessionStart(): array
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

    /**
     * Get mock session stop response
     *
     * @return array{success: bool, message: string}
     */
    public function getSessionStop(): array
    {
        return [
            'success' => true,
            'message' => 'Session stopped successfully',
        ];
    }

    /**
     * Get mock session status response
     *
     * @return array{status: string, phone: string, battery: int, plugged: bool}
     */
    public function getSessionStatus(): array
    {
        return [
            'status' => 'WORKING',
            'phone' => '+1234567890',
            'battery' => 85,
            'plugged' => true,
        ];
    }

    /**
     * Get mock message sent response
     *
     * @return array{success: bool, messageId: string, timestamp: int}
     */
    public function getMessageSent(): array
    {
        return [
            'success' => true,
            'messageId' => 'mock-message-id-' . uniqid(),
            'timestamp' => now()->timestamp,
        ];
    }

    /**
     * Get mock messages response
     *
     * @return array{messages: array, pagination: array}
     */
    public function getMessages(): array
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

    /**
     * Get mock contacts response
     *
     * @return array{contacts: array}
     */
    public function getContacts(): array
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

    /**
     * Get mock groups response
     *
     * @return array{groups: array}
     */
    public function getGroups(): array
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

    /**
     * Get mock QR code response
     *
     * @return array{qr: string, expires: int}
     */
    public function getQrCode(): array
    {
        return [
            'qr' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            'expires' => now()->addMinutes(5)->timestamp,
        ];
    }

    /**
     * Get mock session deleted response
     *
     * @return array{success: bool, message: string}
     */
    public function getSessionDeleted(): array
    {
        return [
            'success' => true,
            'message' => 'Session deleted successfully',
        ];
    }

    /**
     * Get mock session info response
     *
     * @return array{id: string, status: string, phone: string, battery: int, plugged: bool, created_at: string, updated_at: string}
     */
    public function getSessionInfo(): array
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
     * Get mock connection test response
     *
     * @return array{success: bool, message: string, base_url: string, mock_mode: bool}
     */
    public function getConnectionTest(): array
    {
        return [
            'success' => true,
            'message' => 'WAHA service is in mock mode',
            'base_url' => 'http://localhost:3000',
            'mock_mode' => true,
        ];
    }
}
