<?php

namespace App\Services;

use App\Events\MessageSent;
use App\Events\TypingIndicator;
use App\Models\InboxSession;
use App\Models\Message;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Broadcast;

class WebSocketIntegrationService
{
    /**
     * Broadcast message to conversation participants
     */
    public function broadcastMessage(Message $message, InboxSession $session)
    {
        try {
            // Broadcast to conversation channel
            broadcast(new MessageSent($message, $session->id, $session->organization_id));
            
            Log::info('Message broadcasted successfully', [
                'message_id' => $message->id,
                'session_id' => $session->id,
                'organization_id' => $session->organization_id
            ]);
            
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to broadcast message', [
                'message_id' => $message->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Broadcast typing indicator
     */
    public function broadcastTypingIndicator(InboxSession $session, User $user, bool $isTyping)
    {
        try {
            broadcast(new TypingIndicator($session->id, $user->id, $isTyping, $user->name));
            
            Log::debug('Typing indicator broadcasted', [
                'session_id' => $session->id,
                'user_id' => $user->id,
                'is_typing' => $isTyping
            ]);
            
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to broadcast typing indicator', [
                'session_id' => $session->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Broadcast session updates
     */
    public function broadcastSessionUpdate(InboxSession $session, string $eventType, array $data = [])
    {
        try {
            $eventData = array_merge([
                'session_id' => $session->id,
                'organization_id' => $session->organization_id,
                'event_type' => $eventType,
                'timestamp' => now()->toISOString()
            ], $data);

            // Broadcast to organization channel
            broadcast(new \App\Events\SessionUpdated($session, $eventType, $eventData));
            
            Log::info('Session update broadcasted', [
                'session_id' => $session->id,
                'event_type' => $eventType
            ]);
            
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to broadcast session update', [
                'session_id' => $session->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Get WebSocket configuration for frontend
     */
    public function getWebSocketConfig()
    {
        return [
            'host' => config('reverb.host'),
            'port' => config('reverb.port'),
            'scheme' => config('reverb.scheme'),
            'app_key' => config('reverb.app_key'),
            'auth_endpoint' => url('/broadcasting/auth'),
            'features' => [
                'compression' => config('reverb.server.enable_compression', false),
                'metrics' => config('reverb.server.enable_metrics', false),
            ],
            'channels' => [
                'organization' => 'private-organization.{organizationId}',
                'conversation' => 'private-conversation.{sessionId}',
                'inbox' => 'private-inbox.{organizationId}',
            ]
        ];
    }

    /**
     * Test WebSocket connection
     */
    public function testConnection()
    {
        try {
            $host = config('reverb.host', 'localhost');
            $port = config('reverb.port', 8081);
            
            $connection = @fsockopen($host, $port, $errno, $errstr, 5);
            
            if (!$connection) {
                return [
                    'status' => 'error',
                    'message' => 'Reverb server is not accessible',
                    'details' => [
                        'host' => $host,
                        'port' => $port,
                        'error' => $errstr ?? 'Connection failed'
                    ]
                ];
            }
            
            fclose($connection);
            
            return [
                'status' => 'ok',
                'message' => 'WebSocket server is running',
                'details' => [
                    'host' => $host,
                    'port' => $port,
                    'max_connections' => config('reverb.server.max_connections'),
                    'heartbeat_interval' => config('reverb.server.heartbeat_interval'),
                ]
            ];
            
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Health check failed',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Broadcast test message
     */
    public function broadcastTestMessage(string $channel, string $message)
    {
        try {
            broadcast(new \App\Events\TestMessage($message, $channel));
            
            return [
                'status' => 'success',
                'message' => 'Test message broadcasted',
                'channel' => $channel
            ];
            
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Test failed',
                'error' => $e->getMessage()
            ];
        }
    }
}
