<?php

namespace App\Jobs;

use App\Models\PaymentTransaction;
use App\Services\PaymentGatewayService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ProcessPaymentWebhook implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $gateway;
    protected array $webhookData;
    protected string $signature;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The maximum number of seconds the job can run.
     */
    public int $timeout = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(string $gateway, array $webhookData, string $signature)
    {
        $this->gateway = $gateway;
        $this->webhookData = $webhookData;
        $this->signature = $signature;
    }

    /**
     * Execute the job.
     */
    public function handle(PaymentGatewayService $paymentGatewayService): void
    {
        try {
            Log::channel('webhook')->info('Processing payment webhook', [
                'gateway' => $this->gateway,
                'webhook_id' => $this->webhookData['id'] ?? 'unknown',
                'event_type' => $this->webhookData['type'] ?? 'unknown',
            ]);

            // Verify webhook signature
            $payload = json_encode($this->webhookData);
            if (!$paymentGatewayService->verifyWebhookSignature($this->gateway, $payload, $this->signature)) {
                Log::channel('webhook')->error('Invalid webhook signature', [
                    'gateway' => $this->gateway,
                    'webhook_id' => $this->webhookData['id'] ?? 'unknown',
                ]);

                $this->fail(new \Exception('Invalid webhook signature'));
                return;
            }

            // Process webhook based on gateway
            $this->processWebhookByGateway();

            Log::channel('webhook')->info('Payment webhook processed successfully', [
                'gateway' => $this->gateway,
                'webhook_id' => $this->webhookData['id'] ?? 'unknown',
            ]);

        } catch (\Exception $e) {
            Log::channel('webhook')->error('Failed to process payment webhook', [
                'gateway' => $this->gateway,
                'webhook_id' => $this->webhookData['id'] ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Process webhook based on gateway type.
     */
    protected function processWebhookByGateway(): void
    {
        switch ($this->gateway) {
            case 'stripe':
                $this->processStripeWebhook();
                break;
            case 'midtrans':
                $this->processMidtransWebhook();
                break;
            case 'xendit':
                $this->processXenditWebhook();
                break;
            default:
                throw new \Exception("Unsupported gateway: {$this->gateway}");
        }
    }

    /**
     * Process Stripe webhook.
     */
    protected function processStripeWebhook(): void
    {
        $eventType = $this->webhookData['type'] ?? '';
        $data = $this->webhookData['data']['object'] ?? [];

        switch ($eventType) {
            case 'payment_intent.succeeded':
                $this->updatePaymentStatus($data['id'], 'completed', $data);
                break;
            case 'payment_intent.payment_failed':
                $this->updatePaymentStatus($data['id'], 'failed', $data);
                break;
            case 'payment_intent.canceled':
                $this->updatePaymentStatus($data['id'], 'cancelled', $data);
                break;
            case 'payment_intent.requires_action':
                $this->updatePaymentStatus($data['id'], 'processing', $data);
                break;
            default:
                Log::channel('webhook')->info('Unhandled Stripe webhook event', [
                    'event_type' => $eventType,
                    'webhook_id' => $this->webhookData['id'] ?? 'unknown',
                ]);
        }
    }

    /**
     * Process Midtrans webhook.
     */
    protected function processMidtransWebhook(): void
    {
        $statusCode = $this->webhookData['status_code'] ?? '';
        $orderId = $this->webhookData['order_id'] ?? '';

        switch ($statusCode) {
            case '200':
                $this->updatePaymentStatus($orderId, 'completed', $this->webhookData);
                break;
            case '201':
                $this->updatePaymentStatus($orderId, 'pending', $this->webhookData);
                break;
            case '202':
                $this->updatePaymentStatus($orderId, 'processing', $this->webhookData);
                break;
            case '400':
            case '401':
            case '402':
            case '403':
            case '404':
            case '500':
                $this->updatePaymentStatus($orderId, 'failed', $this->webhookData);
                break;
            default:
                Log::channel('webhook')->info('Unhandled Midtrans webhook status', [
                    'status_code' => $statusCode,
                    'order_id' => $orderId,
                ]);
        }
    }

    /**
     * Process Xendit webhook.
     */
    protected function processXenditWebhook(): void
    {
        $status = $this->webhookData['status'] ?? '';
        $invoiceId = $this->webhookData['id'] ?? '';

        switch ($status) {
            case 'PAID':
                $this->updatePaymentStatus($invoiceId, 'completed', $this->webhookData);
                break;
            case 'PENDING':
                $this->updatePaymentStatus($invoiceId, 'pending', $this->webhookData);
                break;
            case 'EXPIRED':
                $this->updatePaymentStatus($invoiceId, 'cancelled', $this->webhookData);
                break;
            case 'FAILED':
                $this->updatePaymentStatus($invoiceId, 'failed', $this->webhookData);
                break;
            default:
                Log::channel('webhook')->info('Unhandled Xendit webhook status', [
                    'status' => $status,
                    'invoice_id' => $invoiceId,
                ]);
        }
    }

    /**
     * Update payment transaction status.
     */
    protected function updatePaymentStatus(string $transactionId, string $status, array $gatewayData): void
    {
        DB::transaction(function () use ($transactionId, $status, $gatewayData) {
            $payment = PaymentTransaction::where('gateway_transaction_id', $transactionId)->first();

            if (!$payment) {
                Log::channel('webhook')->warning('Payment transaction not found', [
                    'gateway_transaction_id' => $transactionId,
                    'status' => $status,
                ]);
                return;
            }

            $oldStatus = $payment->status;
            $payment->update([
                'status' => $status,
                'gateway_response' => $gatewayData,
                'updated_at' => now(),
            ]);

            Log::channel('payment')->info('Payment status updated via webhook', [
                'payment_id' => $payment->id,
                'gateway_transaction_id' => $transactionId,
                'old_status' => $oldStatus,
                'new_status' => $status,
                'gateway' => $this->gateway,
            ]);

            // Dispatch additional jobs based on status
            if ($status === 'completed') {
                ProcessPaymentSuccess::dispatch($payment);
            } elseif ($status === 'failed') {
                ProcessPaymentFailure::dispatch($payment);
            }
        });
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::channel('webhook')->error('Payment webhook job failed', [
            'gateway' => $this->gateway,
            'webhook_id' => $this->webhookData['id'] ?? 'unknown',
            'error' => $exception->getMessage(),
            'attempts' => $this->attempts(),
        ]);
    }
}
