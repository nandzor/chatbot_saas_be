<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use App\Services\WebSocketIntegrationService;

class WebSocketController extends Controller
{
    protected $integrationService;

    public function __construct(WebSocketIntegrationService $integrationService)
    {
        $this->integrationService = $integrationService;
    }

    /**
     * Health check for WebSocket connection
     */
    public function health(): JsonResponse
    {
        $result = $this->integrationService->testConnection();
        
        $statusCode = $result['status'] === 'ok' ? 200 : 503;
        
        return response()->json($result, $statusCode);
    }

    /**
     * Get WebSocket configuration for frontend
     */
    public function config(): JsonResponse
    {
        $config = $this->integrationService->getWebSocketConfig();
        return response()->json($config);
    }

    /**
     * Test WebSocket connection
     */
    public function test(Request $request): JsonResponse
    {
        $channel = $request->input('channel', 'test-channel');
        $message = $request->input('message', 'Test message');
        
        $result = $this->integrationService->broadcastTestMessage($channel, $message);
        
        $statusCode = $result['status'] === 'success' ? 200 : 500;
        
        return response()->json($result, $statusCode);
    }
}
