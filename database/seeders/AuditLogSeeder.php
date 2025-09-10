<?php

namespace Database\Seeders;

use App\Models\PaymentTransaction;
use App\Models\BillingInvoice;
use App\Models\Organization;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AuditLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating audit logs...');

        // Get existing data
        $organizations = Organization::all();
        $users = User::all();
        $subscriptions = Subscription::all();
        $payments = PaymentTransaction::all();
        $invoices = BillingInvoice::all();

        if ($organizations->isEmpty() || $users->isEmpty()) {
            $this->command->warn('No organizations or users found. Please run other seeders first.');
            return;
        }

        $auditLogs = [];

        // Create audit logs for payment transactions
        foreach ($payments->take(30) as $payment) {
            $auditLogs[] = [
                'organization_id' => $payment->organization_id,
                'user_id' => $users->random()->id,
                'action' => $this->getRandomPaymentAction(),
                'resource_type' => 'PaymentTransaction',
                'resource_id' => $payment->id,
                'old_values' => $this->generateOldValues($payment),
                'new_values' => $this->generateNewValues($payment),
                'ip_address' => $this->generateRandomIP(),
                'user_agent' => $this->generateRandomUserAgent(),
                'created_at' => now()->subDays(rand(1, 30)),
                'updated_at' => now()->subDays(rand(1, 30)),
            ];
        }

        // Create audit logs for billing invoices
        foreach ($invoices->take(25) as $invoice) {
            $auditLogs[] = [
                'organization_id' => $invoice->organization_id,
                'user_id' => $users->random()->id,
                'action' => $this->getRandomInvoiceAction(),
                'resource_type' => 'BillingInvoice',
                'resource_id' => $invoice->id,
                'old_values' => $this->generateOldValues($invoice),
                'new_values' => $this->generateNewValues($invoice),
                'ip_address' => $this->generateRandomIP(),
                'user_agent' => $this->generateRandomUserAgent(),
                'created_at' => now()->subDays(rand(1, 30)),
                'updated_at' => now()->subDays(rand(1, 30)),
            ];
        }

        // Create audit logs for subscriptions
        foreach ($subscriptions->take(20) as $subscription) {
            $auditLogs[] = [
                'organization_id' => $subscription->organization_id,
                'user_id' => $users->random()->id,
                'action' => $this->getRandomSubscriptionAction(),
                'resource_type' => 'Subscription',
                'resource_id' => $subscription->id,
                'old_values' => $this->generateOldValues($subscription),
                'new_values' => $this->generateNewValues($subscription),
                'ip_address' => $this->generateRandomIP(),
                'user_agent' => $this->generateRandomUserAgent(),
                'created_at' => now()->subDays(rand(1, 30)),
                'updated_at' => now()->subDays(rand(1, 30)),
            ];
        }

        // Create audit logs for organizations
        foreach ($organizations->take(15) as $organization) {
            $auditLogs[] = [
                'organization_id' => $organization->id,
                'user_id' => $users->random()->id,
                'action' => $this->getRandomOrganizationAction(),
                'resource_type' => 'Organization',
                'resource_id' => $organization->id,
                'old_values' => $this->generateOldValues($organization),
                'new_values' => $this->generateNewValues($organization),
                'ip_address' => $this->generateRandomIP(),
                'user_agent' => $this->generateRandomUserAgent(),
                'created_at' => now()->subDays(rand(1, 30)),
                'updated_at' => now()->subDays(rand(1, 30)),
            ];
        }

        // Create audit logs for users
        foreach ($users->take(10) as $user) {
            $auditLogs[] = [
                'organization_id' => $organizations->random()->id,
                'user_id' => $user->id,
                'action' => $this->getRandomUserAction(),
                'resource_type' => 'User',
                'resource_id' => $user->id,
                'old_values' => $this->generateOldValues($user),
                'new_values' => $this->generateNewValues($user),
                'ip_address' => $this->generateRandomIP(),
                'user_agent' => $this->generateRandomUserAgent(),
                'created_at' => now()->subDays(rand(1, 30)),
                'updated_at' => now()->subDays(rand(1, 30)),
            ];
        }

        // Insert audit logs in batches
        $chunks = array_chunk($auditLogs, 100);
        foreach ($chunks as $chunk) {
            DB::table('audit_logs')->insert($chunk);
        }

        $this->command->info('Created ' . count($auditLogs) . ' audit logs.');
    }

    /**
     * Get random payment action
     */
    private function getRandomPaymentAction(): string
    {
        $actions = [
            'created',
            'updated',
            'status_changed',
            'refunded',
            'cancelled',
            'webhook_received',
            'webhook_processed',
            'webhook_failed',
        ];
        return $actions[array_rand($actions)];
    }

    /**
     * Get random invoice action
     */
    private function getRandomInvoiceAction(): string
    {
        $actions = [
            'created',
            'updated',
            'status_changed',
            'marked_paid',
            'marked_overdue',
            'cancelled',
            'payment_received',
            'payment_failed',
        ];
        return $actions[array_rand($actions)];
    }

    /**
     * Get random subscription action
     */
    private function getRandomSubscriptionAction(): string
    {
        $actions = [
            'created',
            'updated',
            'activated',
            'suspended',
            'cancelled',
            'renewed',
            'upgraded',
            'downgraded',
        ];
        return $actions[array_rand($actions)];
    }

    /**
     * Get random organization action
     */
    private function getRandomOrganizationAction(): string
    {
        $actions = [
            'created',
            'updated',
            'activated',
            'suspended',
            'cancelled',
            'settings_updated',
            'billing_updated',
            'permissions_updated',
        ];
        return $actions[array_rand($actions)];
    }

    /**
     * Get random user action
     */
    private function getRandomUserAction(): string
    {
        $actions = [
            'created',
            'updated',
            'activated',
            'deactivated',
            'password_changed',
            'role_assigned',
            'role_removed',
            'permissions_updated',
        ];
        return $actions[array_rand($actions)];
    }

    /**
     * Generate old values for audit log
     */
    private function generateOldValues($model): ?string
    {
        $oldValues = [];

        if ($model instanceof PaymentTransaction) {
            $oldValues = [
                'status' => 'pending',
                'amount' => $model->amount - rand(1000, 10000),
                'currency' => $model->currency,
                'gateway' => $model->gateway,
            ];
        } elseif ($model instanceof BillingInvoice) {
            $oldValues = [
                'status' => 'pending',
                'total_amount' => $model->total_amount - rand(1000, 10000),
                'currency' => $model->currency,
                'due_date' => $model->due_date,
            ];
        } elseif ($model instanceof Subscription) {
            $oldValues = [
                'status' => 'pending',
                'unit_amount' => $model->unit_amount - rand(1000, 10000),
                'currency' => $model->currency,
                'billing_cycle' => $model->billing_cycle,
            ];
        } elseif ($model instanceof Organization) {
            $oldValues = [
                'name' => $model->name . ' (Old)',
                'email' => 'old_' . $model->email,
                'status' => 'pending',
            ];
        } elseif ($model instanceof User) {
            $oldValues = [
                'name' => $model->name . ' (Old)',
                'email' => 'old_' . $model->email,
                'status' => 'pending',
            ];
        }

        return json_encode($oldValues);
    }

    /**
     * Generate new values for audit log
     */
    private function generateNewValues($model): ?string
    {
        $newValues = [];

        if ($model instanceof PaymentTransaction) {
            $newValues = [
                'status' => $model->status,
                'amount' => $model->amount,
                'currency' => $model->currency,
                'gateway' => $model->gateway,
                'gateway_transaction_id' => 'txn_' . Str::random(20),
                'paid_at' => now()->toISOString(),
            ];
        } elseif ($model instanceof BillingInvoice) {
            $newValues = [
                'status' => $model->status,
                'total_amount' => $model->total_amount,
                'currency' => $model->currency,
                'due_date' => $model->due_date,
                'paid_at' => $model->status === 'paid' ? now()->toISOString() : null,
            ];
        } elseif ($model instanceof Subscription) {
            $newValues = [
                'status' => $model->status,
                'unit_amount' => $model->unit_amount,
                'currency' => $model->currency,
                'billing_cycle' => $model->billing_cycle,
                'current_period_start' => $model->current_period_start,
                'current_period_end' => $model->current_period_end,
            ];
        } elseif ($model instanceof Organization) {
            $newValues = [
                'name' => $model->name,
                'email' => $model->email,
                'status' => $model->status,
                'updated_at' => now()->toISOString(),
            ];
        } elseif ($model instanceof User) {
            $newValues = [
                'name' => $model->name,
                'email' => $model->email,
                'status' => $model->status,
                'updated_at' => now()->toISOString(),
            ];
        }

        return json_encode($newValues);
    }

    /**
     * Generate random IP address
     */
    private function generateRandomIP(): string
    {
        $ips = [
            '192.168.1.100',
            '10.0.0.50',
            '172.16.0.25',
            '203.142.1.100',
            '114.120.1.50',
            '180.250.1.25',
            '103.10.1.100',
            '125.160.1.50',
        ];
        return $ips[array_rand($ips)];
    }

    /**
     * Generate random user agent
     */
    private function generateRandomUserAgent(): string
    {
        $userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/91.0.864.59',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
            'PostmanRuntime/7.28.0',
            'curl/7.68.0',
            'Laravel/9.0.0',
        ];
        return $userAgents[array_rand($userAgents)];
    }
}
