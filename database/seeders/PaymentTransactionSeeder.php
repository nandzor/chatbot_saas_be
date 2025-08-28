<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Faker\Factory as Faker;
use App\Models\Organization;
use App\Models\Subscription;
use App\Models\BillingInvoice;
use App\Models\PaymentTransaction;

class PaymentTransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('id_ID');

        // Clear existing data
        DB::statement('TRUNCATE TABLE payment_transactions CASCADE');

        // Get existing organizations, subscriptions, and invoices
        $organizations = Organization::all();
        $subscriptions = Subscription::all();
        $invoices = BillingInvoice::all();

        if ($organizations->isEmpty()) {
            $this->command->warn('No organizations found. Please run OrganizationSeeder first.');
            return;
        }

        $this->command->info('Creating payment transactions...');

        // Payment methods and gateways
        $paymentMethods = [
            'credit_card' => ['Visa', 'Mastercard', 'JCB', 'American Express'],
            'bank_transfer' => ['BCA', 'Mandiri', 'BNI', 'BRI'],
            'e_wallet' => ['GoPay', 'OVO', 'DANA', 'LinkAja', 'ShopeePay'],
            'virtual_account' => ['BCA VA', 'Mandiri VA', 'BNI VA', 'BRI VA'],
            'convenience_store' => ['Indomaret', 'Alfamart', '7-Eleven'],
            'qris' => ['QRIS'],
            'paylater' => ['Kredivo', 'Akulaku', 'Home Credit']
        ];

        $paymentGateways = [
            'midtrans' => ['credit_card', 'bank_transfer', 'e_wallet', 'virtual_account', 'convenience_store', 'qris'],
            'xendit' => ['credit_card', 'bank_transfer', 'e_wallet', 'virtual_account', 'qris'],
            'stripe' => ['credit_card', 'e_wallet'],
            'paypal' => ['credit_card', 'e_wallet'],
            'razorpay' => ['credit_card', 'bank_transfer', 'e_wallet', 'paylater']
        ];

        $statuses = ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'disputed', 'expired'];
        $currencies = ['IDR', 'USD', 'EUR', 'SGD', 'MYR'];

        $transactionCount = 0;
        $maxTransactions = 500; // Limit to prevent memory issues

        foreach ($organizations as $organization) {
            // Create 5-20 transactions per organization
            $orgTransactionCount = rand(5, 20);

            for ($i = 0; $i < $orgTransactionCount && $transactionCount < $maxTransactions; $i++) {
                $this->createPaymentTransaction(
                    $faker,
                    $organization,
                    $subscriptions,
                    $invoices,
                    $paymentMethods,
                    $paymentGateways,
                    $statuses,
                    $currencies
                );
                $transactionCount++;
            }
        }

        $this->command->info("Created {$transactionCount} payment transactions successfully!");
    }

    /**
     * Create a single payment transaction
     */
    private function createPaymentTransaction(
        $faker,
        $organization,
        $subscriptions,
        $invoices,
        $paymentMethods,
        $paymentGateways,
        $statuses,
        $currencies
    ): void {
        // Select random subscription and invoice for this organization
        $subscription = $subscriptions->where('organization_id', $organization->id)->random();
        $invoice = $invoices->where('organization_id', $organization->id)->random();

        // Select payment method and gateway
        $paymentMethod = $faker->randomElement(array_keys($paymentMethods));
        $gateway = $this->getRandomGatewayForMethod($paymentGateways, $paymentMethod);

        // Generate transaction data
        $amount = $faker->randomFloat(2, 50000, 5000000);
        $currency = $faker->randomElement($currencies);
        $status = $faker->randomElement($statuses);

        // Calculate fees
        $gatewayFee = $this->calculateGatewayFee($amount, $gateway);
        $platformFee = $this->calculatePlatformFee($amount);
        $processingFee = $this->calculateProcessingFee($amount, $paymentMethod);
        $taxAmount = $this->calculateTaxAmount($amount);
        $netAmount = $amount - $gatewayFee - $platformFee - $processingFee - $taxAmount;

        // Generate transaction ID
        $transactionId = 'TXN-' . strtoupper(Str::random(8)) . '-' . time();

        // Create transaction data
        $transactionData = [
            'id' => Str::uuid(),
            'organization_id' => $organization->id,
            'subscription_id' => $subscription ? $subscription->id : null,
            'invoice_id' => $invoice ? $invoice->id : null,

            // Transaction Identity
            'transaction_id' => $transactionId,
            'external_transaction_id' => $this->generateExternalTransactionId($gateway),
            'reference_number' => 'REF-' . strtoupper(Str::random(10)),

            // Payment Details
            'amount' => $amount,
            'currency' => $currency,
            'exchange_rate' => $this->getExchangeRate($currency),
            'amount_original' => $currency !== 'IDR' ? $amount * $this->getExchangeRate($currency) : null,
            'currency_original' => $currency !== 'IDR' ? 'IDR' : null,

            // Payment Method
            'payment_method' => $paymentMethod,
            'payment_gateway' => $gateway,
            'payment_channel' => $this->getPaymentChannel($paymentMethod, $gateway),

            // Card/Account Details
            'card_last_four' => $this->getCardLastFour($paymentMethod),
            'card_brand' => $this->getCardBrand($paymentMethod),
            'account_name' => $this->getAccountName($paymentMethod),
            'account_number_masked' => $this->getAccountNumberMasked($paymentMethod),

            // Transaction Flow
            'status' => $status,
            'payment_type' => $faker->randomElement(['one_time', 'recurring']),

            // Timing
            'initiated_at' => $faker->dateTimeBetween('-6 months', 'now'),
            'authorized_at' => $this->getAuthorizedAt($status),
            'captured_at' => $this->getCapturedAt($status),
            'settled_at' => $this->getSettledAt($status),
            'failed_at' => $this->getFailedAt($status),

            // Gateway Response
            'gateway_response' => $this->generateGatewayResponse($gateway, $status),
            'gateway_fee' => $gatewayFee,
            'gateway_status' => $this->getGatewayStatus($status),
            'gateway_message' => $this->getGatewayMessage($status),

            // Fraud & Security
            'fraud_score' => $faker->randomFloat(2, 0, 1),
            'risk_assessment' => $this->generateRiskAssessment(),
            'ip_address' => $faker->ipv4,
            'user_agent' => $faker->userAgent,

            // Fees & Charges
            'platform_fee' => $platformFee,
            'processing_fee' => $processingFee,
            'tax_amount' => $taxAmount,
            'net_amount' => $netAmount,

            // Refund Information
            'refund_amount' => $status === 'refunded' ? $amount * $faker->randomFloat(2, 0.1, 1.0) : 0,
            'refunded_at' => $status === 'refunded' ? $faker->dateTimeBetween('-3 months', 'now') : null,
            'refund_reason' => $status === 'refunded' ? $faker->randomElement([
                'Customer request', 'Duplicate transaction', 'Service not provided',
                'Technical issue', 'Fraudulent transaction'
            ]) : null,

            // System fields
            'notes' => $faker->optional(0.3)->sentence(),
            'metadata' => $this->generateMetadata($paymentMethod, $gateway),
            'created_at' => $faker->dateTimeBetween('-6 months', 'now'),
            'updated_at' => $faker->dateTimeBetween('-6 months', 'now'),
        ];

        // Insert transaction
        DB::table('payment_transactions')->insert($transactionData);
    }

    /**
     * Get random gateway for payment method
     */
    private function getRandomGatewayForMethod(array $paymentGateways, string $paymentMethod): string
    {
        $availableGateways = [];
        foreach ($paymentGateways as $gateway => $methods) {
            if (in_array($paymentMethod, $methods)) {
                $availableGateways[] = $gateway;
            }
        }
        return $availableGateways[array_rand($availableGateways)];
    }

    /**
     * Generate external transaction ID
     */
    private function generateExternalTransactionId(string $gateway): string
    {
        $prefixes = [
            'midtrans' => 'MID',
            'xendit' => 'XND',
            'stripe' => 'STR',
            'paypal' => 'PPL',
            'razorpay' => 'RZP'
        ];

        $prefix = $prefixes[$gateway] ?? 'EXT';
        return $prefix . strtoupper(Str::random(12));
    }

    /**
     * Get exchange rate for currency
     */
    private function getExchangeRate(string $currency): float
    {
        $rates = [
            'IDR' => 1.0,
            'USD' => 0.000065,
            'EUR' => 0.000060,
            'SGD' => 0.000088,
            'MYR' => 0.00031
        ];

        return $rates[$currency] ?? 1.0;
    }

    /**
     * Get payment channel
     */
    private function getPaymentChannel(string $paymentMethod, string $gateway): string
    {
        $channels = [
            'credit_card' => ['online', 'mobile', 'terminal'],
            'bank_transfer' => ['online', 'mobile', 'atm'],
            'e_wallet' => ['mobile', 'online'],
            'virtual_account' => ['online', 'mobile', 'atm'],
            'convenience_store' => ['offline'],
            'qris' => ['mobile', 'online'],
            'paylater' => ['online', 'mobile']
        ];

        $availableChannels = $channels[$paymentMethod] ?? ['online'];
        return $availableChannels[array_rand($availableChannels)];
    }

    /**
     * Get card last four digits
     */
    private function getCardLastFour(string $paymentMethod): ?string
    {
        if ($paymentMethod === 'credit_card') {
            return str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT);
        }
        return null;
    }

    /**
     * Get card brand
     */
    private function getCardBrand(string $paymentMethod): ?string
    {
        if ($paymentMethod === 'credit_card') {
            $brands = ['Visa', 'Mastercard', 'JCB', 'American Express'];
            return $brands[array_rand($brands)];
        }
        return null;
    }

    /**
     * Get account name
     */
    private function getAccountName(string $paymentMethod): ?string
    {
        if (in_array($paymentMethod, ['bank_transfer', 'virtual_account'])) {
            return 'John Doe';
        }
        return null;
    }

    /**
     * Get account number masked
     */
    private function getAccountNumberMasked(string $paymentMethod): ?string
    {
        if (in_array($paymentMethod, ['bank_transfer', 'virtual_account'])) {
            return '****' . rand(1000, 9999);
        }
        return null;
    }

    /**
     * Get authorized at timestamp
     */
    private function getAuthorizedAt(string $status): ?string
    {
        if (in_array($status, ['completed', 'processing'])) {
            return now()->subMinutes(rand(1, 30))->toDateTimeString();
        }
        return null;
    }

    /**
     * Get captured at timestamp
     */
    private function getCapturedAt(string $status): ?string
    {
        if ($status === 'completed') {
            return now()->subMinutes(rand(1, 60))->toDateTimeString();
        }
        return null;
    }

    /**
     * Get settled at timestamp
     */
    private function getSettledAt(string $status): ?string
    {
        if ($status === 'completed') {
            return now()->subDays(rand(1, 7))->toDateTimeString();
        }
        return null;
    }

    /**
     * Get failed at timestamp
     */
    private function getFailedAt(string $status): ?string
    {
        if (in_array($status, ['failed', 'cancelled', 'expired'])) {
            return now()->subMinutes(rand(1, 120))->toDateTimeString();
        }
        return null;
    }

    /**
     * Generate gateway response
     */
    private function generateGatewayResponse(string $gateway, string $status): string
    {
        $responses = [
            'midtrans' => [
                'status_code' => $status === 'completed' ? '200' : '400',
                'status_message' => $status === 'completed' ? 'Success' : 'Failed',
                'transaction_id' => 'MID-' . strtoupper(Str::random(12)),
                'order_id' => 'ORD-' . strtoupper(Str::random(8)),
                'payment_type' => 'credit_card',
                'signature_key' => Str::random(64)
            ],
            'xendit' => [
                'status' => $status === 'completed' ? 'PAID' : 'FAILED',
                'external_id' => 'XND-' . strtoupper(Str::random(12)),
                'payment_channel' => 'CREDIT_CARD',
                'payment_method' => 'CREDIT_CARD'
            ],
            'stripe' => [
                'id' => 'pi_' . Str::random(24),
                'object' => 'payment_intent',
                'status' => $status === 'completed' ? 'succeeded' : 'failed',
                'amount' => rand(1000, 100000)
            ]
        ];

        return json_encode($responses[$gateway] ?? []);
    }

    /**
     * Get gateway status
     */
    private function getGatewayStatus(string $status): string
    {
        $statusMap = [
            'pending' => 'pending',
            'processing' => 'processing',
            'completed' => 'success',
            'failed' => 'failed',
            'cancelled' => 'cancelled',
            'refunded' => 'refunded',
            'disputed' => 'disputed',
            'expired' => 'expired'
        ];

        return $statusMap[$status] ?? 'unknown';
    }

    /**
     * Get gateway message
     */
    private function getGatewayMessage(string $status): string
    {
        $messages = [
            'pending' => 'Payment is pending confirmation',
            'processing' => 'Payment is being processed',
            'completed' => 'Payment completed successfully',
            'failed' => 'Payment failed',
            'cancelled' => 'Payment was cancelled',
            'refunded' => 'Payment was refunded',
            'disputed' => 'Payment is under dispute',
            'expired' => 'Payment has expired'
        ];

        return $messages[$status] ?? 'Unknown status';
    }

    /**
     * Calculate gateway fee
     */
    private function calculateGatewayFee(float $amount, string $gateway): float
    {
        $rates = [
            'midtrans' => 0.029, // 2.9%
            'xendit' => 0.025,   // 2.5%
            'stripe' => 0.029,   // 2.9%
            'paypal' => 0.029,   // 2.9%
            'razorpay' => 0.025  // 2.5%
        ];

        $rate = $rates[$gateway] ?? 0.025;
        return round($amount * $rate, 2);
    }

    /**
     * Calculate platform fee
     */
    private function calculatePlatformFee(float $amount): float
    {
        return round($amount * 0.01, 2); // 1%
    }

    /**
     * Calculate processing fee
     */
    private function calculateProcessingFee(float $amount, string $paymentMethod): float
    {
        $rates = [
            'credit_card' => 0.015,    // 1.5%
            'bank_transfer' => 0.005,   // 0.5%
            'e_wallet' => 0.01,         // 1%
            'virtual_account' => 0.005, // 0.5%
            'convenience_store' => 0.01, // 1%
            'qris' => 0.005,            // 0.5%
            'paylater' => 0.02          // 2%
        ];

        $rate = $rates[$paymentMethod] ?? 0.01;
        return round($amount * $rate, 2);
    }

    /**
     * Calculate tax amount
     */
    private function calculateTaxAmount(float $amount): float
    {
        return round($amount * 0.11, 2); // 11% VAT
    }

    /**
     * Generate risk assessment
     */
    private function generateRiskAssessment(): string
    {
        return json_encode([
            'risk_score' => rand(1, 100),
            'risk_level' => ['low', 'medium', 'high'][array_rand(['low', 'medium', 'high'])],
            'fraud_indicators' => [],
            'location_risk' => rand(1, 10),
            'device_risk' => rand(1, 10),
            'behavior_risk' => rand(1, 10)
        ]);
    }

    /**
     * Generate metadata
     */
    private function generateMetadata(string $paymentMethod, string $gateway): string
    {
        return json_encode([
            'source' => 'api',
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'ip_country' => 'ID',
            'device_type' => ['desktop', 'mobile', 'tablet'][array_rand(['desktop', 'mobile', 'tablet'])],
            'payment_method_category' => $this->getPaymentMethodCategory($paymentMethod),
            'gateway_version' => 'v1.0',
            'integration_type' => 'direct',
            'test_mode' => false
        ]);
    }

    /**
     * Get payment method category
     */
    private function getPaymentMethodCategory(string $paymentMethod): string
    {
        $categories = [
            'credit_card' => 'card',
            'bank_transfer' => 'bank',
            'e_wallet' => 'digital_wallet',
            'virtual_account' => 'bank',
            'convenience_store' => 'retail',
            'qris' => 'qr_code',
            'paylater' => 'credit'
        ];

        return $categories[$paymentMethod] ?? 'other';
    }
}
