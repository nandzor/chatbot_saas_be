<?php

namespace Database\Seeders;

use App\Models\PaymentTransaction;
use App\Models\BillingInvoice;
use App\Models\Organization;
use App\Models\Subscription;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class QueueJobSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating queue jobs...');

        // Get existing data
        $organizations = Organization::all();
        $subscriptions = Subscription::all();
        $payments = PaymentTransaction::all();
        $invoices = BillingInvoice::all();

        if ($organizations->isEmpty()) {
            $this->command->warn('No organizations found. Please run other seeders first.');
            return;
        }

        $queueJobs = [];

        // Create payment processing jobs
        foreach ($payments->take(20) as $payment) {
            $queueJobs[] = [
                'queue' => 'payment',
                'payload' => $this->generatePaymentJobPayload($payment),
                'attempts' => rand(0, 3),
                'reserved_at' => $this->getRandomReservedAt(),
                'available_at' => now()->subMinutes(rand(1, 60)),
                'created_at' => now()->subMinutes(rand(1, 120)),
            ];
        }

        // Create billing processing jobs
        foreach ($invoices->take(15) as $invoice) {
            $queueJobs[] = [
                'queue' => 'billing',
                'payload' => $this->generateBillingJobPayload($invoice),
                'attempts' => rand(0, 2),
                'reserved_at' => $this->getRandomReservedAt(),
                'available_at' => now()->subMinutes(rand(1, 60)),
                'created_at' => now()->subMinutes(rand(1, 120)),
            ];
        }

        // Create notification jobs
        foreach ($organizations->take(10) as $organization) {
            $queueJobs[] = [
                'queue' => 'notifications',
                'payload' => $this->generateNotificationJobPayload($organization),
                'attempts' => rand(0, 1),
                'reserved_at' => $this->getRandomReservedAt(),
                'available_at' => now()->subMinutes(rand(1, 30)),
                'created_at' => now()->subMinutes(rand(1, 60)),
            ];
        }

        // Create webhook processing jobs
        foreach ($organizations->take(8) as $organization) {
            $queueJobs[] = [
                'queue' => 'webhooks',
                'payload' => $this->generateWebhookJobPayload($organization),
                'attempts' => rand(0, 2),
                'reserved_at' => $this->getRandomReservedAt(),
                'available_at' => now()->subMinutes(rand(1, 45)),
                'created_at' => now()->subMinutes(rand(1, 90)),
            ];
        }

        // Create high priority jobs
        foreach ($organizations->take(5) as $organization) {
            $queueJobs[] = [
                'queue' => 'high_priority',
                'payload' => $this->generateHighPriorityJobPayload($organization),
                'attempts' => 0,
                'reserved_at' => null,
                'available_at' => now()->subMinutes(rand(1, 15)),
                'created_at' => now()->subMinutes(rand(1, 30)),
            ];
        }

        // Insert queue jobs in batches
        $chunks = array_chunk($queueJobs, 100);
        foreach ($chunks as $chunk) {
            DB::table('jobs')->insert($chunk);
        }

        $this->command->info('Created ' . count($queueJobs) . ' queue jobs.');
    }

    /**
     * Generate payment job payload
     */
    private function generatePaymentJobPayload($payment): string
    {
        $jobTypes = [
            'ProcessPaymentWebhook',
            'ProcessPaymentSuccess',
            'ProcessPaymentFailure',
            'SendPaymentSuccessEmail',
            'SendPaymentFailureEmail',
        ];

        $jobType = $jobTypes[array_rand($jobTypes)];

        $payload = [
            'uuid' => str()->uuid(),
            'displayName' => "App\\Jobs\\{$jobType}",
            'job' => "Illuminate\\Queue\\CallQueuedHandler@call",
            'maxTries' => 3,
            'maxExceptions' => null,
            'failOnTimeout' => false,
            'backoff' => null,
            'timeout' => null,
            'retryUntil' => null,
            'data' => [
                'commandName' => "App\\Jobs\\{$jobType}",
                'command' => serialize([
                    'payment_id' => $payment->id,
                    'organization_id' => $payment->organization_id,
                    'amount' => $payment->amount,
                    'currency' => $payment->currency,
                    'gateway' => $payment->gateway,
                    'status' => $payment->status,
                ]),
            ],
        ];

        return json_encode($payload);
    }

    /**
     * Generate billing job payload
     */
    private function generateBillingJobPayload($invoice): string
    {
        $jobTypes = [
            'GenerateBillingInvoices',
            'ProcessOverdueInvoices',
            'SendInvoiceGeneratedEmail',
            'SendOverdueInvoiceEmail',
        ];

        $jobType = $jobTypes[array_rand($jobTypes)];

        $payload = [
            'uuid' => str()->uuid(),
            'displayName' => "App\\Jobs\\{$jobType}",
            'job' => "Illuminate\\Queue\\CallQueuedHandler@call",
            'maxTries' => 3,
            'maxExceptions' => null,
            'failOnTimeout' => false,
            'backoff' => null,
            'timeout' => null,
            'retryUntil' => null,
            'data' => [
                'commandName' => "App\\Jobs\\{$jobType}",
                'command' => serialize([
                    'invoice_id' => $invoice->id,
                    'organization_id' => $invoice->organization_id,
                    'subscription_id' => $invoice->subscription_id,
                    'total_amount' => $invoice->total_amount,
                    'currency' => $invoice->currency,
                    'status' => $invoice->status,
                ]),
            ],
        ];

        return json_encode($payload);
    }

    /**
     * Generate notification job payload
     */
    private function generateNotificationJobPayload($organization): string
    {
        $jobTypes = [
            'SendPaymentSuccessEmail',
            'SendPaymentFailureEmail',
            'SendInvoiceGeneratedEmail',
            'SendOverdueInvoiceEmail',
        ];

        $jobType = $jobTypes[array_rand($jobTypes)];

        $payload = [
            'uuid' => str()->uuid(),
            'displayName' => "App\\Jobs\\{$jobType}",
            'job' => "Illuminate\\Queue\\CallQueuedHandler@call",
            'maxTries' => 2,
            'maxExceptions' => null,
            'failOnTimeout' => false,
            'backoff' => null,
            'timeout' => null,
            'retryUntil' => null,
            'data' => [
                'commandName' => "App\\Jobs\\{$jobType}",
                'command' => serialize([
                    'organization_id' => $organization->id,
                    'organization_name' => $organization->name,
                    'email' => $organization->email,
                    'notification_type' => strtolower(str_replace('Send', '', str_replace('Email', '', $jobType))),
                ]),
            ],
        ];

        return json_encode($payload);
    }

    /**
     * Generate webhook job payload
     */
    private function generateWebhookJobPayload($organization): string
    {
        $gateways = ['stripe', 'midtrans', 'xendit'];
        $gateway = $gateways[array_rand($gateways)];

        $payload = [
            'uuid' => str()->uuid(),
            'displayName' => 'App\\Jobs\\ProcessPaymentWebhook',
            'job' => 'Illuminate\\Queue\\CallQueuedHandler@call',
            'maxTries' => 3,
            'maxExceptions' => null,
            'failOnTimeout' => false,
            'backoff' => null,
            'timeout' => null,
            'retryUntil' => null,
            'data' => [
                'commandName' => 'App\\Jobs\\ProcessPaymentWebhook',
                'command' => serialize([
                    'gateway' => $gateway,
                    'organization_id' => $organization->id,
                    'webhook_data' => [
                        'id' => 'evt_' . Str::random(24),
                        'type' => 'payment_intent.succeeded',
                        'created' => time(),
                        'data' => [
                            'object' => [
                                'id' => 'pi_' . Str::random(24),
                                'amount' => rand(100000, 5000000), // IDR amounts
                                'currency' => 'idr',
                                'status' => 'succeeded',
                            ]
                        ]
                    ],
                    'signature' => 't=' . time() . ',v1=' . Str::random(64),
                ]),
            ],
        ];

        return json_encode($payload);
    }

    /**
     * Generate high priority job payload
     */
    private function generateHighPriorityJobPayload($organization): string
    {
        $jobTypes = [
            'ProcessPaymentWebhook',
            'ProcessPaymentSuccess',
            'ProcessPaymentFailure',
        ];

        $jobType = $jobTypes[array_rand($jobTypes)];

        $payload = [
            'uuid' => str()->uuid(),
            'displayName' => "App\\Jobs\\{$jobType}",
            'job' => 'Illuminate\\Queue\\CallQueuedHandler@call',
            'maxTries' => 5,
            'maxExceptions' => null,
            'failOnTimeout' => false,
            'backoff' => null,
            'timeout' => null,
            'retryUntil' => null,
            'data' => [
                'commandName' => "App\\Jobs\\{$jobType}",
                'command' => serialize([
                    'organization_id' => $organization->id,
                    'priority' => 'high',
                    'amount' => rand(500000, 10000000), // IDR amounts
                    'currency' => 'IDR',
                    'gateway' => 'stripe',
                    'status' => 'pending',
                ]),
            ],
        ];

        return json_encode($payload);
    }

    /**
     * Get random reserved at timestamp
     */
    private function getRandomReservedAt(): ?int
    {
        $attempts = rand(0, 3);

        if ($attempts === 0) {
            return null; // Not reserved yet
        }

        return now()->subMinutes(rand(1, 60))->timestamp;
    }
}
