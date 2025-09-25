<?php

namespace App\Listeners;

use App\Events\WhatsAppMessageReceived;
use App\Jobs\ProcessWhatsAppMessageJob;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class ProcessWhatsAppMessageListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the listener may be attempted.
     */
    public int $tries = 3;

    /**
     * The maximum number of seconds the listener can run.
     */
    public int $timeout = 30;

    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(WhatsAppMessageReceived $event): void
    {
        try {
            Log::info('WhatsApp message received event handled', [
                'organization_id' => $event->organizationId,
                'message_id' => $event->messageData['message_id'] ?? 'unknown',
                'from' => $event->messageData['from'] ?? 'unknown',
                'received_at' => $event->receivedAt,
            ]);

            // Dispatch job to process the message asynchronously
            ProcessWhatsAppMessageJob::dispatch($event->messageData, $event->organizationId)
                ->onQueue('whatsapp-messages')
                ->delay(now()->addSeconds(1)); // Small delay to prevent overwhelming the system

            Log::info('WhatsApp message processing job dispatched', [
                'organization_id' => $event->organizationId,
                'message_id' => $event->messageData['message_id'] ?? 'unknown',
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to handle WhatsApp message received event', [
                'organization_id' => $event->organizationId,
                'message_id' => $event->messageData['message_id'] ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Re-throw exception to trigger retry mechanism
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(WhatsAppMessageReceived $event, \Throwable $exception): void
    {
        Log::error('WhatsApp message listener failed permanently', [
            'organization_id' => $event->organizationId,
            'message_id' => $event->messageData['message_id'] ?? 'unknown',
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts(),
        ]);
    }
}
