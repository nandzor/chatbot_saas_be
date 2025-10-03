<?php

namespace App\Services;

use App\Events\MessageReadEvent;
use App\Events\MessageSent;
use App\Events\MessageProcessed;
use App\Events\SessionAssigned;
use App\Events\SessionTransferred;
use App\Events\SessionUpdated;
use App\Events\SessionEnded;
use App\Events\TypingIndicator;
use App\Events\UserOnline;
use App\Events\UserOffline;
use App\Events\UserTyping;
use App\Models\ChatSession;
use App\Models\Message;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class BroadcastEventService
{
    /**
     * Log using broadcast channel
     */
    private function logBroadcast(string $level, string $message, array $context = [])
    {
        Log::channel('broadcast')->log($level, $message, $context);
    }
    /**
     * Broadcast message sent from frontend/agent
     */
    public function broadcastMessageSent(Message $message, $sessionId, $organizationId)
    {
        try {
            event(new MessageSent($message, $sessionId, $organizationId));

            $this->logBroadcast('info', 'MessageSent event broadcasted', [
                'event_type' => 'MessageSent',
                'message_id' => $message->id,
                'session_id' => $sessionId,
                'organization_id' => $organizationId,
            ]);

            return true;
        } catch (\Exception $e) {
            $this->logBroadcast('error', 'Failed to broadcast MessageSent event', [
                'event_type' => 'MessageSent',
                'message_id' => $message->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Broadcast message processed (incoming from customer)
     */
    public function broadcastMessageProcessed(ChatSession $session, Message $message, array $result = [])
    {
        try {
            event(new MessageProcessed($session, $message, $result));

            Log::channel("broadcast")->info('MessageProcessed event broadcasted', [
                'message_id' => $message->id,
                'session_id' => $session->id,
                'organization_id' => $session->organization_id,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::channel("broadcast")->error('Failed to broadcast MessageProcessed event', [
                'message_id' => $message->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Broadcast message read
     */
    public function broadcastMessageRead(Message $message, ChatSession $session)
    {
        try {
            event(new MessageReadEvent($message, $session));

            Log::channel("broadcast")->info('MessageRead event broadcasted', [
                'message_id' => $message->id,
                'session_id' => $session->id,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::channel("broadcast")->error('Failed to broadcast MessageRead event', [
                'message_id' => $message->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Broadcast session assigned
     */
    public function broadcastSessionAssigned(ChatSession $session, $fromAgent = null)
    {
        try {
            event(new SessionAssigned($session, $fromAgent));

            Log::channel("broadcast")->info('SessionAssigned event broadcasted', [
                'session_id' => $session->id,
                'agent_id' => $session->agent_id,
                'organization_id' => $session->organization_id,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::channel("broadcast")->error('Failed to broadcast SessionAssigned event', [
                'session_id' => $session->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Broadcast session transferred
     */
    public function broadcastSessionTransferred(ChatSession $session, $fromAgent, $toAgent, $reason = null)
    {
        try {
            event(new SessionTransferred($session, $fromAgent, $toAgent, $reason));

            Log::channel("broadcast")->info('SessionTransferred event broadcasted', [
                'session_id' => $session->id,
                'from_agent' => $fromAgent,
                'to_agent' => $toAgent,
                'organization_id' => $session->organization_id,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::channel("broadcast")->error('Failed to broadcast SessionTransferred event', [
                'session_id' => $session->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Broadcast session updated
     */
    public function broadcastSessionUpdated(ChatSession $session, array $changes = [])
    {
        try {
            event(new SessionUpdated($session->id, 'session_updated', $changes));

            Log::channel("broadcast")->info('SessionUpdated event broadcasted', [
                'session_id' => $session->id,
                'changes' => $changes,
                'organization_id' => $session->organization_id,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::channel("broadcast")->error('Failed to broadcast SessionUpdated event', [
                'session_id' => $session->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Broadcast session ended
     */
    public function broadcastSessionEnded(ChatSession $session, $reason = null, $endedBy = null)
    {
        try {
            event(new SessionEnded($session, $reason, $endedBy));

            Log::channel("broadcast")->info('SessionEnded event broadcasted', [
                'session_id' => $session->id,
                'reason' => $reason,
                'ended_by' => $endedBy,
                'organization_id' => $session->organization_id,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::channel("broadcast")->error('Failed to broadcast SessionEnded event', [
                'session_id' => $session->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Broadcast typing indicator
     */
    public function broadcastTypingIndicator($sessionId, $userId, $userName, $isTyping)
    {
        try {
            event(new TypingIndicator($sessionId, $userId, $isTyping, $userName));

            Log::channel("broadcast")->debug('TypingIndicator event broadcasted', [
                'session_id' => $sessionId,
                'user_id' => $userId,
                'is_typing' => $isTyping,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::channel("broadcast")->error('Failed to broadcast TypingIndicator event', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Broadcast user online
     */
    public function broadcastUserOnline(User $user, $organizationId)
    {
        try {
            event(new UserOnline($user, $organizationId));

            Log::channel("broadcast")->info('UserOnline event broadcasted', [
                'user_id' => $user->id,
                'organization_id' => $organizationId,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::channel("broadcast")->error('Failed to broadcast UserOnline event', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Broadcast user offline
     */
    public function broadcastUserOffline(User $user, $organizationId)
    {
        try {
            event(new UserOffline($user, $organizationId));

            Log::channel("broadcast")->info('UserOffline event broadcasted', [
                'user_id' => $user->id,
                'organization_id' => $organizationId,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::channel("broadcast")->error('Failed to broadcast UserOffline event', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Broadcast user typing
     */
    public function broadcastUserTyping($userId, $userName, $organizationId, $sessionId = null, $isTyping = true)
    {
        try {
            event(new UserTyping($userId, $userName, $organizationId, $sessionId, $isTyping));

            Log::channel("broadcast")->debug('UserTyping event broadcasted', [
                'user_id' => $userId,
                'organization_id' => $organizationId,
                'session_id' => $sessionId,
                'is_typing' => $isTyping,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::channel("broadcast")->error('Failed to broadcast UserTyping event', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
}
