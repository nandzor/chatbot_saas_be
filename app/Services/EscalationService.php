<?php

namespace App\Services;

use App\Models\Agent;
use App\Models\ChatSession;
use App\Models\Message;
// Realtime messaging disabled
// use App\Events\SessionEscalated;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

/**
 * EscalationService - Handles automatic escalation logic for chat sessions
 *
 * This service provides reusable escalation logic that can be used across
 * different message processors and chat systems.
 */
class EscalationService
{
    /**
     * Escalation trigger types
     */
    public const TRIGGER_KEYWORD = 'keyword';
    public const TRIGGER_SENTIMENT = 'sentiment';
    public const TRIGGER_TIME = 'time';
    public const TRIGGER_INTENT = 'intent';
    public const TRIGGER_FAILED_RESPONSES = 'failed_responses';

    /**
     * Default escalation keywords
     */
    protected array $defaultEscalationKeywords = [
        'speak to human', 'talk to human', 'human agent', 'real person',
        'manager', 'supervisor', 'complaint', 'angry', 'frustrated',
        'not satisfied', 'terrible service', 'awful', 'worst',
        'cancel', 'refund', 'dispute', 'legal', 'lawyer'
    ];

    /**
     * Default negative sentiment keywords
     */
    protected array $defaultNegativeSentimentKeywords = [
        'angry', 'frustrated', 'annoyed', 'disappointed', 'upset',
        'terrible', 'awful', 'horrible', 'worst', 'hate', 'disgusted'
    ];

    /**
     * Check if message should trigger escalation
     */
    public function shouldEscalate(ChatSession $session, array $messageData, array $context = []): array
    {
        $triggers = [];
        $escalationReason = '';

        // 1. Keyword-based escalation
        if ($this->checkKeywordEscalation($messageData)) {
            $triggers[] = self::TRIGGER_KEYWORD;
            $escalationReason = 'Escalation keyword detected';
        }

        // 2. Sentiment-based escalation
        if ($this->checkSentimentEscalation($messageData)) {
            $triggers[] = self::TRIGGER_SENTIMENT;
            $escalationReason = 'Negative sentiment detected';
        }

        // 3. Time-based escalation
        if ($this->checkTimeEscalation($session, $context)) {
            $triggers[] = self::TRIGGER_TIME;
            $escalationReason = 'Session timeout reached';
        }

        // 4. Intent-based escalation
        if ($this->checkIntentEscalation($messageData, $context)) {
            $triggers[] = self::TRIGGER_INTENT;
            $escalationReason = 'Complex intent requiring human intervention';
        }

        // 5. Failed responses escalation
        if ($this->checkFailedResponsesEscalation($session, $context)) {
            $triggers[] = self::TRIGGER_FAILED_RESPONSES;
            $escalationReason = 'Multiple failed bot responses';
        }

        return [
            'should_escalate' => !empty($triggers),
            'triggers' => $triggers,
            'reason' => $escalationReason,
            'priority' => $this->calculateEscalationPriority($triggers)
        ];
    }

    /**
     * Find available agent for escalation
     */
    public function findAvailableAgent(string $organizationId, array $criteria = []): ?Agent
    {
        $query = Agent::where('organization_id', $organizationId)
            ->where('status', 'active')
            ->where('availability_status', 'available');

        // Apply criteria filters
        if (isset($criteria['department'])) {
            $query->where('department', $criteria['department']);
        }

        if (isset($criteria['specialization'])) {
            $query->whereJsonContains('specialization', $criteria['specialization']);
        }

        if (isset($criteria['languages'])) {
            $query->whereJsonContains('languages', $criteria['languages']);
        }

        // Find agent with lowest current load
        $availableAgents = $query->get()->filter(function ($agent) {
            return $agent->canHandleMoreChats();
        });

        if ($availableAgents->isEmpty()) {
            return null;
        }

        // Return agent with lowest current active chats
        return $availableAgents->sortBy('current_active_chats')->first();
    }

    /**
     * Escalate session to human agent
     */
    public function escalateToAgent(ChatSession $session, string $reason, array $context = []): array
    {
        try {
            DB::beginTransaction();

            // Find available agent
            $agent = $this->findAvailableAgent($session->organization_id, $context);

            if (!$agent) {
                Log::warning('No available agent found for escalation', [
                    'session_id' => $session->id,
                    'organization_id' => $session->organization_id,
                    'reason' => $reason
                ]);

                return [
                    'success' => false,
                    'error' => 'No available agents',
                    'session_id' => $session->id
                ];
            }

            // Perform handover
            $handoverSuccess = $session->handoverToAgent($agent, $reason);

            if (!$handoverSuccess) {
                throw new \Exception('Failed to handover session to agent');
            }

            // Log escalation
            Log::info('Session escalated to human agent', [
                'session_id' => $session->id,
                'agent_id' => $agent->id,
                'agent_name' => $agent->display_name,
                'reason' => $reason,
                'customer_id' => $session->customer_id
            ]);

            // Create escalation message
            $this->createEscalationMessage($session, $agent, $reason);

            // Realtime messaging disabled
            // event(new SessionEscalated($session, $agent, $reason, $context['triggers'] ?? [], $context['priority'] ?? 'normal'));

            DB::commit();

            return [
                'success' => true,
                'agent_id' => $agent->id,
                'agent_name' => $agent->display_name,
                'session_id' => $session->id,
                'reason' => $reason
            ];

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to escalate session to agent', [
                'session_id' => $session->id,
                'error' => $e->getMessage(),
                'reason' => $reason
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'session_id' => $session->id
            ];
        }
    }

    /**
     * Check keyword-based escalation
     */
    protected function checkKeywordEscalation(array $messageData): bool
    {
        $messageText = strtolower($messageData['text'] ?? '');

        if (empty($messageText)) {
            return false;
        }

        foreach ($this->defaultEscalationKeywords as $keyword) {
            if (str_contains($messageText, $keyword)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check sentiment-based escalation
     */
    protected function checkSentimentEscalation(array $messageData): bool
    {
        $messageText = strtolower($messageData['text'] ?? '');

        if (empty($messageText)) {
            return false;
        }

        $negativeCount = 0;
        foreach ($this->defaultNegativeSentimentKeywords as $keyword) {
            if (str_contains($messageText, $keyword)) {
                $negativeCount++;
            }
        }

        // Escalate if 2 or more negative sentiment keywords found
        return $negativeCount >= 2;
    }

    /**
     * Check time-based escalation
     */
    protected function checkTimeEscalation(ChatSession $session, array $context): bool
    {
        $escalationTimeout = $context['escalation_timeout_minutes'] ?? 30;
        $sessionDuration = $session->started_at->diffInMinutes(now());

        return $sessionDuration >= $escalationTimeout;
    }

    /**
     * Check intent-based escalation
     */
    protected function checkIntentEscalation(array $messageData, array $context): bool
    {
        $intent = $messageData['intent'] ?? 'general_inquiry';

        $complexIntents = [
            'billing_dispute',
            'legal_inquiry',
            'technical_escalation',
            'complaint',
            'refund_request'
        ];

        return in_array($intent, $complexIntents);
    }

    /**
     * Check failed responses escalation
     */
    protected function checkFailedResponsesEscalation(ChatSession $session, array $context): bool
    {
        $maxFailedResponses = $context['max_failed_responses'] ?? 3;

        // Count recent failed bot responses
        $failedResponses = Message::where('session_id', $session->id)
            ->where('sender_type', 'bot')
            ->where('created_at', '>=', now()->subMinutes(10))
            ->whereJsonContains('metadata->failed', true)
            ->count();

        return $failedResponses >= $maxFailedResponses;
    }

    /**
     * Calculate escalation priority based on triggers
     */
    protected function calculateEscalationPriority(array $triggers): string
    {
        if (in_array(self::TRIGGER_SENTIMENT, $triggers) || in_array(self::TRIGGER_KEYWORD, $triggers)) {
            return 'high';
        }

        if (in_array(self::TRIGGER_INTENT, $triggers)) {
            return 'medium';
        }

        return 'normal';
    }

    /**
     * Create escalation notification message
     */
    protected function createEscalationMessage(ChatSession $session, Agent $agent, string $reason): void
    {
        $escalationMessage = "🔔 Session escalated to human agent: {$agent->display_name}. Reason: {$reason}";

        Message::create([
            'organization_id' => $session->organization_id,
            'session_id' => $session->id,
            'sender_type' => 'system',
            'sender_id' => null,
            'sender_name' => 'System',
            'message_type' => 'text',
            'message_text' => $escalationMessage,
            'metadata' => [
                'escalation' => true,
                'agent_id' => $agent->id,
                'reason' => $reason,
                'escalated_at' => now()->toISOString()
            ],
            'is_read' => false,
            'read_at' => null,
            'delivered_at' => now(),
            'created_at' => now()->addSeconds(1)->addMicroseconds(rand(100000, 999999))
        ]);
    }

    /**
     * Get escalation configuration for organization
     */
    public function getEscalationConfig(string $organizationId): array
    {
        // This could be stored in database or config
        // For now, return default configuration
        return [
            'enabled' => true,
            'escalation_timeout_minutes' => 30,
            'max_failed_responses' => 3,
            'escalation_keywords' => $this->defaultEscalationKeywords,
            'negative_sentiment_keywords' => $this->defaultNegativeSentimentKeywords,
            'auto_assign_agent' => true,
            'notify_agent' => true,
            'priority_mapping' => [
                'high' => ['sentiment', 'keyword'],
                'medium' => ['intent'],
                'normal' => ['time', 'failed_responses']
            ]
        ];
    }
}
