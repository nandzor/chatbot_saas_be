<?php

namespace Database\Seeders;

use App\Models\PaymentTransaction;
use App\Models\Organization;
use App\Models\Subscription;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WebhookEventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating webhook events...');

        // Get existing organizations and subscriptions
        $organizations = Organization::all();
        $subscriptions = Subscription::all();

        if ($organizations->isEmpty() || $subscriptions->isEmpty()) {
            $this->command->warn('No organizations or subscriptions found. Please run other seeders first.');
            return;
        }

        $webhookEvents = [];

        // Create webhook events for different payment gateways
        $gateways = ['stripe', 'midtrans', 'xendit'];
        $eventTypes = [
            'stripe' => [
                'payment_intent.succeeded',
                'payment_intent.payment_failed',
                'payment_intent.canceled',
                'payment_intent.requires_action',
                'invoice.payment_succeeded',
                'invoice.payment_failed',
                'customer.subscription.created',
                'customer.subscription.updated',
                'customer.subscription.deleted',
            ],
            'midtrans' => [
                'payment.success',
                'payment.pending',
                'payment.failed',
                'payment.cancel',
                'payment.expire',
                'payment.settlement',
                'payment.deny',
            ],
            'xendit' => [
                'invoice.paid',
                'invoice.expired',
                'invoice.failed',
                'payment.succeeded',
                'payment.failed',
                'disbursement.completed',
                'disbursement.failed',
            ]
        ];

        foreach ($organizations as $organization) {
            foreach ($gateways as $gateway) {
                $events = $eventTypes[$gateway];

                // Create 3-5 webhook events per gateway per organization
                $eventCount = rand(3, 5);

                for ($i = 0; $i < $eventCount; $i++) {
                    $eventType = $events[array_rand($events)];
                    $subscription = $subscriptions->where('organization_id', $organization->id)->random();

                    $webhookEvents[] = [
                        'organization_id' => $organization->id,
                        'subscription_id' => $subscription->id,
                        'gateway' => $gateway,
                        'event_type' => $eventType,
                        'event_id' => $this->generateEventId($gateway),
                        'status' => $this->getRandomStatus(),
                        'payload' => $this->generatePayload($gateway, $eventType, $organization, $subscription),
                        'signature' => $this->generateSignature($gateway),
                        'processed_at' => $this->getRandomProcessedAt(),
                        'created_at' => now()->subDays(rand(1, 30)),
                        'updated_at' => now()->subDays(rand(1, 30)),
                    ];
                }
            }
        }

        // Insert webhook events in batches
        $chunks = array_chunk($webhookEvents, 100);
        foreach ($chunks as $chunk) {
            DB::table('webhook_events')->insert($chunk);
        }

        $this->command->info('Created ' . count($webhookEvents) . ' webhook events.');
    }

    /**
     * Generate event ID based on gateway
     */
    private function generateEventId(string $gateway): string
    {
        return match ($gateway) {
            'stripe' => 'evt_' . Str::random(24),
            'midtrans' => 'midtrans_' . Str::random(20),
            'xendit' => 'xendit_' . Str::random(20),
            default => 'evt_' . Str::random(24),
        };
    }

    /**
     * Get random status
     */
    private function getRandomStatus(): string
    {
        $statuses = ['pending', 'processed', 'failed', 'retrying'];
        return $statuses[array_rand($statuses)];
    }

    /**
     * Generate signature based on gateway
     */
    private function generateSignature(string $gateway): string
    {
        return match ($gateway) {
            'stripe' => 't=' . time() . ',v1=' . Str::random(64),
            'midtrans' => 'midtrans_' . Str::random(40),
            'xendit' => 'xendit_' . Str::random(40),
            default => 'signature_' . Str::random(40),
        };
    }

    /**
     * Get random processed at timestamp
     */
    private function getRandomProcessedAt(): ?string
    {
        $statuses = ['pending', 'processed', 'failed', 'retrying'];
        $status = $statuses[array_rand($statuses)];

        if ($status === 'pending') {
            return null;
        }

        return now()->subDays(rand(1, 30))->toDateTimeString();
    }

    /**
     * Generate payload based on gateway and event type
     */
    private function generatePayload(string $gateway, string $eventType, $organization, $subscription): string
    {
        $basePayload = [
            'organization_id' => $organization->id,
            'subscription_id' => $subscription->id,
            'amount' => rand(100000, 5000000), // IDR amounts
            'currency' => 'IDR',
        ];

        return match ($gateway) {
            'stripe' => $this->generateStripePayload($eventType, $basePayload),
            'midtrans' => $this->generateMidtransPayload($eventType, $basePayload),
            'xendit' => $this->generateXenditPayload($eventType, $basePayload),
            default => json_encode($basePayload),
        };
    }

    /**
     * Generate Stripe payload
     */
    private function generateStripePayload(string $eventType, array $basePayload): string
    {
        $payload = [
            'id' => 'evt_' . Str::random(24),
            'object' => 'event',
            'type' => $eventType,
            'created' => time(),
            'data' => [
                'object' => [
                    'id' => 'pi_' . Str::random(24),
                    'object' => 'payment_intent',
                    'amount' => $basePayload['amount'] * 100, // Stripe uses cents
                    'currency' => 'idr',
                    'status' => $this->getStripeStatus($eventType),
                    'client_secret' => 'pi_' . Str::random(24) . '_secret_' . Str::random(24),
                    'metadata' => [
                        'organization_id' => $basePayload['organization_id'],
                        'subscription_id' => $basePayload['subscription_id'],
                    ],
                ]
            ],
            'livemode' => false,
            'pending_webhooks' => 1,
            'request' => [
                'id' => 'req_' . Str::random(24),
                'idempotency_key' => null,
            ],
        ];

        return json_encode($payload);
    }

    /**
     * Generate Midtrans payload
     */
    private function generateMidtransPayload(string $eventType, array $basePayload): string
    {
        $payload = [
            'order_id' => 'ORDER_' . Str::random(20),
            'status_code' => $this->getMidtransStatusCode($eventType),
            'gross_amount' => number_format($basePayload['amount'], 2, '.', ''),
            'currency' => 'IDR',
            'payment_type' => $this->getRandomPaymentType(),
            'transaction_time' => now()->toISOString(),
            'transaction_status' => $this->getMidtransStatus($eventType),
            'fraud_status' => 'accept',
            'approval_code' => Str::random(10),
            'signature_key' => Str::random(64),
            'metadata' => [
                'organization_id' => $basePayload['organization_id'],
                'subscription_id' => $basePayload['subscription_id'],
            ],
        ];

        return json_encode($payload);
    }

    /**
     * Generate Xendit payload
     */
    private function generateXenditPayload(string $eventType, array $basePayload): string
    {
        $payload = [
            'id' => 'inv_' . Str::random(24),
            'external_id' => 'INV_' . Str::random(20),
            'status' => $this->getXenditStatus($eventType),
            'amount' => $basePayload['amount'],
            'currency' => 'IDR',
            'created' => now()->toISOString(),
            'updated' => now()->toISOString(),
            'paid_at' => $this->getXenditPaidAt($eventType),
            'payment_method' => $this->getRandomPaymentMethod(),
            'metadata' => [
                'organization_id' => $basePayload['organization_id'],
                'subscription_id' => $basePayload['subscription_id'],
            ],
        ];

        return json_encode($payload);
    }

    /**
     * Get Stripe status based on event type
     */
    private function getStripeStatus(string $eventType): string
    {
        return match ($eventType) {
            'payment_intent.succeeded' => 'succeeded',
            'payment_intent.payment_failed' => 'requires_payment_method',
            'payment_intent.canceled' => 'canceled',
            'payment_intent.requires_action' => 'requires_action',
            'invoice.payment_succeeded' => 'paid',
            'invoice.payment_failed' => 'open',
            default => 'succeeded',
        };
    }

    /**
     * Get Midtrans status code based on event type
     */
    private function getMidtransStatusCode(string $eventType): string
    {
        return match ($eventType) {
            'payment.success' => '200',
            'payment.pending' => '201',
            'payment.failed' => '400',
            'payment.cancel' => '202',
            'payment.expire' => '203',
            'payment.settlement' => '200',
            'payment.deny' => '400',
            default => '200',
        };
    }

    /**
     * Get Midtrans status based on event type
     */
    private function getMidtransStatus(string $eventType): string
    {
        return match ($eventType) {
            'payment.success' => 'settlement',
            'payment.pending' => 'pending',
            'payment.failed' => 'deny',
            'payment.cancel' => 'cancel',
            'payment.expire' => 'expire',
            'payment.settlement' => 'settlement',
            'payment.deny' => 'deny',
            default => 'settlement',
        };
    }

    /**
     * Get Xendit status based on event type
     */
    private function getXenditStatus(string $eventType): string
    {
        return match ($eventType) {
            'invoice.paid' => 'PAID',
            'invoice.expired' => 'EXPIRED',
            'invoice.failed' => 'FAILED',
            'payment.succeeded' => 'COMPLETED',
            'payment.failed' => 'FAILED',
            'disbursement.completed' => 'COMPLETED',
            'disbursement.failed' => 'FAILED',
            default => 'PAID',
        };
    }

    /**
     * Get Xendit paid at timestamp
     */
    private function getXenditPaidAt(string $eventType): ?string
    {
        if (in_array($eventType, ['invoice.paid', 'payment.succeeded', 'disbursement.completed'])) {
            return now()->subDays(rand(1, 30))->toISOString();
        }

        return null;
    }

    /**
     * Get random payment type
     */
    private function getRandomPaymentType(): string
    {
        $types = ['credit_card', 'bank_transfer', 'ewallet', 'qris', 'gopay', 'shopeepay'];
        return $types[array_rand($types)];
    }

    /**
     * Get random payment method
     */
    private function getRandomPaymentMethod(): string
    {
        $methods = ['CREDIT_CARD', 'BANK_TRANSFER', 'EWALLET', 'QRIS', 'GOPAY', 'SHOPEEPAY'];
        return $methods[array_rand($methods)];
    }
}
