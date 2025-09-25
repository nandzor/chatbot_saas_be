<?php

namespace App\Services;

use App\Models\ChatSession;
use App\Models\Customer;
use App\Models\Organization;
use App\Models\ChannelConfig;
use App\Models\BotPersonality;
use App\Models\Message;
use App\Services\InboxService;
use App\Services\BotPersonalityService;
use App\Services\EscalationService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;

class WhatsAppMessageProcessor
{
    protected $inboxService;
    protected $botPersonalityService;
    protected $escalationService;

    public function __construct(
        InboxService $inboxService,
        BotPersonalityService $botPersonalityService,
        EscalationService $escalationService
    ) {
        $this->inboxService = $inboxService;
        $this->botPersonalityService = $botPersonalityService;
        $this->escalationService = $escalationService;
    }

    /**
     * Process incoming WhatsApp message and create/update session
     */
    public function processIncomingMessage(array $messageData): array
    {
        try {
            Log::info('Processing WhatsApp message', [
                'from' => $messageData['from'] ?? 'unknown',
                'text' => $messageData['text'] ?? 'no text',
                'organization_id' => $messageData['organization_id'] ?? 'unknown'
            ]);

            Log::info('Starting message processing flow', [
                'message_data_keys' => array_keys($messageData)
            ]);

            // 1. Get or create customer
            $customer = $this->getOrCreateCustomer($messageData);

            // 2. Get or create chat session
            $session = $this->getOrCreateSession($messageData, $customer);

            // 3. Customer message is now handled by webhook, skip creation here

            // 4. Process with bot personality
            Log::info('About to process with bot', [
                'session_id' => $session->id,
                'organization_id' => $session->organization_id
            ]);

            $botResponse = $this->processWithBot($session, $messageData);

            Log::info('Bot processing completed', [
                'session_id' => $session->id,
                'bot_response' => $botResponse
            ]);

            // 5. Check for escalation triggers
            $escalationResult = $this->checkAndHandleEscalation($session, $messageData, $botResponse);

            // 6. Update session metrics
            $this->updateSessionMetrics($session);

            return [
                'session_id' => $session->id,
                'message_id' => null, // Customer message now handled by webhook
                'response_sent' => $botResponse['sent'] ?? false,
                'bot_response' => $botResponse['content'] ?? null,
                'escalated' => $escalationResult['escalated'] ?? false,
                'escalation_result' => $escalationResult
            ];

        } catch (\Exception $e) {
            Log::error('WhatsApp message processing failed', [
                'error' => $e->getMessage(),
                'message_data' => $messageData
            ]);
            throw $e;
        }
    }

    /**
     * Get or create customer from message data
     */
    private function getOrCreateCustomer(array $messageData): Customer
    {
        Log::info('Getting or creating customer', [
            'phone' => $messageData['customer_phone'] ?? $messageData['from'],
            'organization_id' => $messageData['organization_id']
        ]);

        $phone = $messageData['customer_phone'] ?? $messageData['from'];
        $organizationId = $messageData['organization_id'];

        if (!$phone || !$organizationId) {
            throw new \Exception('Missing phone number or organization ID');
        }

        // Find existing customer
        $customer = Customer::where('organization_id', $organizationId)
            ->where('phone', $phone)
            ->first();

        if (!$customer) {
            // Create new customer
            $customerName = $messageData['customer_name'] ?? 'WhatsApp User';
            Log::info('Creating new customer with name', [
                'phone' => $phone,
                'organization_id' => $organizationId,
                'customer_name' => $customerName
            ]);

            $customer = Customer::create([
                'organization_id' => $organizationId,
                'name' => $customerName,
                'phone' => $phone,
                'email' => null,
                'status' => 'active',
                'source' => 'whatsapp',
                'channel' => 'whatsapp',
                'channel_user_id' => $phone,
                'metadata' => [
                    'whatsapp_id' => $phone,
                    'first_contact' => now()->toISOString(),
                    'last_contact' => now()->toISOString()
                ]
            ]);

            Log::info('New customer created', [
                'customer_id' => $customer->id,
                'phone' => $phone,
                'organization_id' => $organizationId
            ]);
        } else {
            // Update last contact
            $customer->update([
                'last_contact_at' => now(),
                'metadata' => array_merge($customer->metadata ?? [], [
                    'last_contact' => now()->toISOString()
                ])
            ]);
        }

        Log::info('Customer ready', [
            'customer_id' => $customer->id,
            'phone' => $customer->phone,
            'organization_id' => $customer->organization_id
        ]);

        return $customer;
    }

    /**
     * Get or create chat session
     */
    private function getOrCreateSession(array $messageData, Customer $customer): ChatSession
    {
        Log::info('Getting or creating session', [
            'customer_id' => $customer->id,
            'organization_id' => $customer->organization_id
        ]);

        $organizationId = $customer->organization_id;
        $phone = $customer->phone;

        // Check for active session
        $activeSession = ChatSession::where('organization_id', $organizationId)
            ->where('customer_id', $customer->id)
            ->where('is_active', true)
            ->where('session_type', 'customer_initiated')
            ->first();

        if ($activeSession) {
            Log::info('Using existing active session', [
                'session_id' => $activeSession->id,
                'customer_id' => $customer->id
            ]);
            return $activeSession;
        }

        // Create new session
        $channelConfig = $this->getChannelConfig($organizationId, $messageData);
        $botPersonality = $this->getBotPersonality($organizationId);

        $session = ChatSession::create([
            'organization_id' => $organizationId,
            'customer_id' => $customer->id,
            'channel_config_id' => $channelConfig?->id,
            'agent_id' => null,
            'session_token' => 'sess_' . Str::uuid(),
            'session_type' => 'customer_initiated',
            'started_at' => now(),
            'ended_at' => null,
            'last_activity_at' => now(),
            'first_response_at' => null,
            'is_active' => true,
            'is_bot_session' => true,
            'handover_reason' => null,
            'handover_at' => null,
            'total_messages' => 0,
            'customer_messages' => 0,
            'bot_messages' => 0,
            'agent_messages' => 0,
            'response_time_avg' => 0,
            'resolution_time' => null,
            'wait_time' => 0,
            'satisfaction_rating' => null,
            'feedback_text' => null,
            'feedback_tags' => null,
            'csat_submitted_at' => null,
            'intent' => $this->detectIntent($messageData['text'] ?? ''),
            'category' => 'general',
            'subcategory' => 'inquiry',
            'priority' => 'normal',
            'tags' => ['whatsapp', 'incoming'],
            'is_resolved' => false,
            'resolved_at' => null,
            'resolution_type' => null,
            'resolution_notes' => null,
            'sentiment_analysis' => $this->analyzeSentiment($messageData['text'] ?? ''),
            'ai_summary' => null,
            'topics_discussed' => [],
            'session_data' => [
                'platform' => 'whatsapp',
                'phone_number' => $phone,
                'session_name' => $messageData['session_name'] ?? null,
                'message_id' => $messageData['message_id'] ?? null
            ],
            'metadata' => [
                'source' => 'whatsapp_webhook',
                'created_via' => 'automatic',
                'bot_personality_id' => $botPersonality?->id,
                'channel_type' => 'whatsapp',
                'session_name' => $messageData['session_name'] ?? null
            ]
        ]);

        Log::info('New chat session created', [
            'session_id' => $session->id,
            'customer_id' => $customer->id,
            'organization_id' => $organizationId,
            'intent' => $session->intent
        ]);

        Log::info('Session ready', [
            'session_id' => $session->id,
            'customer_id' => $customer->id,
            'is_active' => $session->is_active
        ]);

        return $session;
    }


    /**
     * Process message with bot personality
     */
    private function processWithBot(ChatSession $session, array $messageData): array
    {
        try {
            Log::info('Starting bot processing', [
                'session_id' => $session->id,
                'organization_id' => $session->organization_id
            ]);

            // Get bot personality for this session
            $botPersonality = $this->getBotPersonality($session->organization_id);

            if (!$botPersonality) {
                Log::warning('No bot personality found for organization', [
                    'organization_id' => $session->organization_id
                ]);
                return ['sent' => false, 'content' => null];
            }

            // Generate AI response
            $response = $this->botPersonalityService->generateAiResponse(
                $botPersonality->id,
                $messageData['text'] ?? '',
                ['session_id' => $session->id, 'customer_id' => $session->customer_id]
            );

            Log::info('Bot response generated successfully', [
                'response' => $response,
                'has_content' => isset($response['data']['content']),
                'content_length' => isset($response['data']['content']) ? strlen($response['data']['content']) : 0
            ]);

            if ($response && isset($response['data']['content'])) {
                Log::info('Creating bot message', [
                    'session_id' => $session->id,
                    'bot_personality_id' => $botPersonality->id,
                    'content' => $response['data']['content']
                ]);

                // Create bot response message
                $botMessage = Message::create([
                    'organization_id' => $session->organization_id,
                    'session_id' => $session->id,
                    'sender_type' => 'bot',
                    'sender_id' => $botPersonality->id,
                    'sender_name' => $botPersonality->name,
                    'message_type' => 'text',
                    'message_text' => $response['data']['content'],
                    'metadata' => [
                        'bot_personality_id' => $botPersonality->id,
                        'ai_model' => $response['data']['ai_model_used'] ?? null,
                        'confidence' => $response['data']['confidence'] ?? null,
                        'processing_time' => $response['data']['processing_time_ms'] ?? null
                    ],
                    'is_read' => false,
                    'read_at' => null,
                    'delivered_at' => now(),
                    'created_at' => now()->addSeconds(rand(1, 3))
                ]);

                Log::info('Bot message created successfully', [
                    'bot_message_id' => $botMessage->id,
                    'session_id' => $session->id,
                    'content' => $response['data']['content']
                ]);

                // Send response to WhatsApp (implement based on your WAHA setup)
                $this->sendWhatsAppResponse($session, $response['data']['content']);

                return [
                    'sent' => true,
                    'content' => $response['data']['content'],
                    'message_id' => $botMessage->id
                ];
            }

            return ['sent' => false, 'content' => null];

        } catch (\Exception $e) {
            Log::error('Bot processing failed', [
                'session_id' => $session->id,
                'error' => $e->getMessage()
            ]);
            return ['sent' => false, 'content' => null];
        }
    }

    /**
     * Update session metrics
     */
    private function updateSessionMetrics(ChatSession $session): void
    {
        $session->update([
            'last_activity_at' => now(),
            'total_messages' => $session->messages()->count(),
            'customer_messages' => $session->messages()->where('sender_type', 'customer')->count(),
            'bot_messages' => $session->messages()->where('sender_type', 'bot')->count(),
            'agent_messages' => $session->messages()->where('sender_type', 'agent')->count()
        ]);
    }

    /**
     * Get channel config for organization
     */
    private function getChannelConfig(string $organizationId, array $messageData): ?ChannelConfig
    {
        Log::info('Getting channel config', [
            'organization_id' => $organizationId
        ]);

        $config = ChannelConfig::where('organization_id', $organizationId)
            ->where('channel', 'whatsapp')
            ->where('is_active', true)
            ->first();

        // If no specific WhatsApp config, try to get default channel config
        if (!$config) {
            $config = ChannelConfig::where('organization_id', $organizationId)
                ->where('is_active', true)
                ->first();
        }

        // If still no config, create a default one
        if (!$config) {
            $config = ChannelConfig::create([
                'organization_id' => $organizationId,
                'channel' => 'whatsapp',
                'channel_identifier' => 'whatsapp_' . $organizationId,
                'name' => 'Default WhatsApp Config',
                'config' => [],
                'is_active' => true
            ]);
        }

        Log::info('Channel config found', [
            'organization_id' => $organizationId,
            'config_id' => $config ? $config->id : null,
            'channel' => $config ? $config->channel : null
        ]);

        return $config;
    }

    /**
     * Get bot personality for organization
     */
    private function getBotPersonality(string $organizationId): ?BotPersonality
    {
        Log::info('Getting bot personality', [
            'organization_id' => $organizationId
        ]);

        $botPersonality = BotPersonality::where('organization_id', $organizationId)
            ->where('status', 'active')
            ->where('is_default', true)
            ->first();

        Log::info('Bot personality found', [
            'organization_id' => $organizationId,
            'found' => $botPersonality ? true : false,
            'bot_id' => $botPersonality ? $botPersonality->id : null,
            'bot_name' => $botPersonality ? $botPersonality->name : null
        ]);

        return $botPersonality;
    }

    /**
     * Detect intent from message text
     */
    private function detectIntent(string $text): string
    {
        $text = strtolower($text);

        if (str_contains($text, 'help') || str_contains($text, 'support') || str_contains($text, 'problem') || str_contains($text, 'issue')) {
            return 'support';
        }

        if (str_contains($text, 'price') || str_contains($text, 'cost') || str_contains($text, 'payment') || str_contains($text, 'billing')) {
            return 'billing_question';
        }

        if (str_contains($text, 'buy') || str_contains($text, 'purchase') || str_contains($text, 'order')) {
            return 'purchase_inquiry';
        }

        if (str_contains($text, 'thank') || str_contains($text, 'thanks') || str_contains($text, 'appreciate')) {
            return 'compliment';
        }

        return 'general_inquiry';
    }

    /**
     * Analyze sentiment of message
     */
    private function analyzeSentiment(string $text): array
    {
        // Simple sentiment analysis (you can integrate with AI service)
        $positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'thank'];
        $negativeWords = ['bad', 'terrible', 'awful', 'hate', 'angry', 'frustrated'];

        $text = strtolower($text);
        $positiveCount = 0;
        $negativeCount = 0;

        foreach ($positiveWords as $word) {
            if (str_contains($text, $word)) $positiveCount++;
        }

        foreach ($negativeWords as $word) {
            if (str_contains($text, $word)) $negativeCount++;
        }

        if ($positiveCount > $negativeCount) {
            $sentiment = 'positive';
            $score = min(1.0, 0.5 + ($positiveCount * 0.1));
        } elseif ($negativeCount > $positiveCount) {
            $sentiment = 'negative';
            $score = max(0.0, 0.5 - ($negativeCount * 0.1));
        } else {
            $sentiment = 'neutral';
            $score = 0.5;
        }

        return [
            'overall_sentiment' => $sentiment,
            'sentiment_score' => $score,
            'emotion_detected' => $sentiment,
            'confidence' => 0.8,
            'analysis_timestamp' => now()->toISOString()
        ];
    }

    /**
     * Send response back to WhatsApp
     */
    private function sendWhatsAppResponse(ChatSession $session, string $content): void
    {
        try {
            Log::info('Sending WhatsApp response', [
                'session_id' => $session->id,
                'content' => $content,
                'to' => $session->customer->phone
            ]);

            // Get WAHA session name from session metadata
            $wahaSessionName = $session->metadata['session_name'] ?? null;
            if (!$wahaSessionName) {
                Log::warning('No WAHA session name found in session metadata', [
                    'session_id' => $session->id,
                    'metadata' => $session->metadata
                ]);
                return;
            }

            // Use WAHA service to send message
            $wahaService = app(\App\Services\Waha\WahaService::class);

            $result = $wahaService->sendTextMessage(
                $wahaSessionName,
                $session->customer->phone,
                $content
            );

            if ($result['success']) {
                Log::info('WhatsApp response sent successfully', [
                    'session_id' => $session->id,
                    'waha_message_id' => $result['data']['id'] ?? null,
                    'to' => $session->customer->phone
                ]);
            } else {
                Log::error('Failed to send WhatsApp response', [
                    'session_id' => $session->id,
                    'error' => $result['error'] ?? 'Unknown error',
                    'to' => $session->customer->phone
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Exception while sending WhatsApp response', [
                'session_id' => $session->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Check for escalation triggers and handle escalation if needed
     */
    private function checkAndHandleEscalation(ChatSession $session, array $messageData, array $botResponse): array
    {
        try {
            // Skip escalation if session is already handled by human agent
            if (!$session->is_bot_session || $session->agent_id) {
                return [
                    'escalated' => false,
                    'reason' => 'Session already handled by human agent'
                ];
            }

            // Get escalation configuration
            $escalationConfig = $this->escalationService->getEscalationConfig($session->organization_id);

            if (!$escalationConfig['enabled']) {
                return [
                    'escalated' => false,
                    'reason' => 'Escalation disabled'
                ];
            }

            // Prepare context for escalation check
            $context = [
                'escalation_timeout_minutes' => $escalationConfig['escalation_timeout_minutes'],
                'max_failed_responses' => $escalationConfig['max_failed_responses'],
                'bot_response_failed' => !($botResponse['sent'] ?? false)
            ];

            // Check if escalation should be triggered
            $escalationCheck = $this->escalationService->shouldEscalate($session, $messageData, $context);

            if (!$escalationCheck['should_escalate']) {
                return [
                    'escalated' => false,
                    'reason' => 'No escalation triggers detected',
                    'triggers_checked' => $escalationCheck['triggers']
                ];
            }

            Log::info('Escalation triggers detected', [
                'session_id' => $session->id,
                'triggers' => $escalationCheck['triggers'],
                'reason' => $escalationCheck['reason'],
                'priority' => $escalationCheck['priority']
            ]);

            // Perform escalation
            $escalationResult = $this->escalationService->escalateToAgent(
                $session,
                $escalationCheck['reason'],
                $context
            );

            if ($escalationResult['success']) {
                Log::info('Session successfully escalated to human agent', [
                    'session_id' => $session->id,
                    'agent_id' => $escalationResult['agent_id'],
                    'agent_name' => $escalationResult['agent_name'],
                    'reason' => $escalationResult['reason']
                ]);

                return [
                    'escalated' => true,
                    'success' => true,
                    'agent_id' => $escalationResult['agent_id'],
                    'agent_name' => $escalationResult['agent_name'],
                    'reason' => $escalationResult['reason'],
                    'triggers' => $escalationCheck['triggers'],
                    'priority' => $escalationCheck['priority']
                ];
            } else {
                Log::warning('Failed to escalate session to human agent', [
                    'session_id' => $session->id,
                    'error' => $escalationResult['error'],
                    'reason' => $escalationCheck['reason']
                ]);

                return [
                    'escalated' => false,
                    'success' => false,
                    'error' => $escalationResult['error'],
                    'reason' => $escalationCheck['reason'],
                    'triggers' => $escalationCheck['triggers']
                ];
            }

        } catch (\Exception $e) {
            Log::error('Error during escalation check', [
                'session_id' => $session->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'escalated' => false,
                'success' => false,
                'error' => 'Escalation check failed: ' . $e->getMessage()
            ];
        }
    }
}
