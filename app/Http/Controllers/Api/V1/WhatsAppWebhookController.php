<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\InboxService;
use App\Services\WhatsAppMessageProcessor;
use App\Models\ChatSession;
use App\Models\Customer;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class WhatsAppWebhookController extends Controller
{
    protected $inboxService;
    protected $messageProcessor;

    public function __construct(InboxService $inboxService, WhatsAppMessageProcessor $messageProcessor)
    {
        $this->inboxService = $inboxService;
        $this->messageProcessor = $messageProcessor;
    }

    /**
     * Handle incoming WhatsApp messages
     */
    public function handleMessage(Request $request): JsonResponse
    {
        try {
            Log::info('WhatsApp webhook received', [
                'payload' => $request->all(),
                'timestamp' => now()
            ]);

            // Validate webhook signature (optional but recommended)
            if (!$this->validateWebhookSignature($request)) {
                return response()->json(['error' => 'Invalid signature'], 401);
            }

            // Extract message data
            $messageData = $this->extractMessageData($request);

            if (!$messageData) {
                return response()->json(['error' => 'Invalid message format'], 400);
            }

            // Process the message
            $result = $this->messageProcessor->processIncomingMessage($messageData);

            return response()->json([
                'status' => 'success',
                'message' => 'Message processed successfully',
                'session_id' => $result['session_id'] ?? null,
                'response_sent' => $result['response_sent'] ?? false
            ]);

        } catch (\Exception $e) {
            Log::error('WhatsApp webhook error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'payload' => $request->all()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to process message'
            ], 500);
        }
    }

    /**
     * Validate webhook signature for security
     */
    private function validateWebhookSignature(Request $request): bool
    {
        $signature = $request->header('X-Hub-Signature-256');
        $payload = $request->getContent();
        $secret = config('whatsapp.webhook_secret');

        if (!$signature || !$secret) {
            return true; // Skip validation if not configured
        }

        $expectedSignature = 'sha256=' . hash_hmac('sha256', $payload, $secret);
        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Extract and normalize message data from webhook
     */
    private function extractMessageData(Request $request): ?array
    {
        $data = $request->all();

        // Handle different webhook formats (WAHA, WhatsApp Business API, etc.)
        if (isset($data['message'])) {
            // WAHA format
            return [
                'message_id' => $data['message']['id'] ?? Str::uuid(),
                'from' => $data['message']['from'] ?? null,
                'to' => $data['message']['to'] ?? null,
                'text' => $data['message']['text']['body'] ?? null,
                'message_type' => $data['message']['type'] ?? 'text',
                'timestamp' => $data['message']['timestamp'] ?? now()->timestamp,
                'organization_id' => $this->getOrganizationFromPhone($data['message']['to'] ?? null),
                'customer_phone' => $data['message']['from'] ?? null,
                'session_name' => $data['session'] ?? null,
                'raw_data' => $data
            ];
        }

        // WhatsApp Business API format
        if (isset($data['entry'][0]['changes'][0]['value']['messages'][0])) {
            $message = $data['entry'][0]['changes'][0]['value']['messages'][0];
            $contact = $data['entry'][0]['changes'][0]['value']['contacts'][0] ?? [];

            return [
                'message_id' => $message['id'] ?? Str::uuid(),
                'from' => $message['from'] ?? null,
                'to' => $data['entry'][0]['changes'][0]['value']['metadata']['phone_number_id'] ?? null,
                'text' => $message['text']['body'] ?? null,
                'message_type' => $message['type'] ?? 'text',
                'timestamp' => $message['timestamp'] ?? now()->timestamp,
                'organization_id' => $this->getOrganizationFromPhone($message['to'] ?? null),
                'customer_phone' => $message['from'] ?? null,
                'customer_name' => $contact['profile']['name'] ?? null,
                'raw_data' => $data
            ];
        }

        return null;
    }

    /**
     * Get organization ID from phone number
     */
    private function getOrganizationFromPhone(?string $phone): ?string
    {
        if (!$phone) return null;

        // Find organization by phone number in channel configs
        $channelConfig = \App\Models\ChannelConfig::where('channel_identifier', 'like', "%{$phone}%")
            ->orWhere('settings->phone_number', $phone)
            ->first();

        return $channelConfig?->organization_id;
    }
}
