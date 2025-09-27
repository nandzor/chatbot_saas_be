<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\Waha\WahaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WahaStatusController extends Controller
{
    protected WahaService $wahaService;

    public function __construct(WahaService $wahaService)
    {
        $this->wahaService = $wahaService;
    }

    /**
     * Get WAHA server status and health
     */
    public function getStatus()
    {
        try {
            // Test connection
            $connectionTest = $this->wahaService->testConnection();

            // Get sessions
            $sessions = $this->wahaService->getSessions();

            // Test message sending capability
            $messageTest = $this->testMessageSending();

            return response()->json([
                'success' => true,
                'data' => [
                    'connection' => $connectionTest,
                    'sessions' => $sessions,
                    'message_test' => $messageTest,
                    'status' => $this->determineOverallStatus($connectionTest, $messageTest),
                    'recommendations' => $this->getRecommendations($messageTest)
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get WAHA status', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get WAHA status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test message sending capability
     */
    private function testMessageSending()
    {
        try {
            // Use a test session and phone number
            $testSession = '01c28196-7161-45b2-9807-b268b3d8c44b_session-3rwr';
            $testPhone = '6282354777001';
            $testMessage = 'WAHA_TEST_MESSAGE_' . time();

            $result = $this->wahaService->sendTextMessage($testSession, $testPhone, $testMessage);

            return [
                'success' => $result['success'] ?? false,
                'message_id' => $result['messageId'] ?? null,
                'note' => $result['note'] ?? null,
                'error' => $result['error'] ?? null,
                'is_mock_response' => isset($result['note']) && str_contains($result['note'], 'WAHA server error')
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'is_mock_response' => false
            ];
        }
    }

    /**
     * Determine overall WAHA status
     */
    private function determineOverallStatus($connectionTest, $messageTest)
    {
        if (!$connectionTest['success']) {
            return 'offline';
        }

        if ($messageTest['is_mock_response']) {
            return 'bug_detected';
        }

        if ($messageTest['success']) {
            return 'working';
        }

        return 'error';
    }

    /**
     * Get recommendations based on status
     */
    private function getRecommendations($messageTest)
    {
        $recommendations = [];

        if ($messageTest['is_mock_response']) {
            $recommendations[] = 'WAHA server has a bug in ensureSuffix function - update to newer version';
            $recommendations[] = 'Messages are being saved to database but not sent to WhatsApp';
            $recommendations[] = 'Consider using alternative WhatsApp API or fixing WAHA server';
        }

        if (!$messageTest['success'] && !$messageTest['is_mock_response']) {
            $recommendations[] = 'Check WAHA server configuration and API key';
            $recommendations[] = 'Verify session status and connectivity';
        }

        if (empty($recommendations)) {
            $recommendations[] = 'WAHA server is working correctly';
        }

        return $recommendations;
    }
}
