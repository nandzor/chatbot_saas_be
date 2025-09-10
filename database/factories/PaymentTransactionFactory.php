<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\PaymentTransaction;
use App\Models\Subscription;
use App\Models\BillingInvoice;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PaymentTransaction>
 */
class PaymentTransactionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = PaymentTransaction::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'];
        $paymentMethods = ['credit_card', 'debit_card', 'bank_transfer', 'ewallet', 'virtual_account'];
        $paymentGateways = ['stripe', 'midtrans', 'xendit'];
        $currencies = ['IDR', 'USD', 'EUR', 'SGD'];
        $cardBrands = ['visa', 'mastercard', 'amex', 'jcb'];

        $amount = $this->faker->randomFloat(2, 10000, 1000000);
        $currency = $this->faker->randomElement($currencies);
        $status = $this->faker->randomElement($statuses);
        $paymentMethod = $this->faker->randomElement($paymentMethods);
        $paymentGateway = $this->faker->randomElement($paymentGateways);

        return [
            'organization_id' => Organization::factory(),
            'subscription_id' => Subscription::factory(),
            'invoice_id' => BillingInvoice::factory(),
            'transaction_id' => 'TXN_' . $this->faker->unique()->numerify('##########'),
            'external_transaction_id' => 'EXT_' . $this->faker->unique()->numerify('##########'),
            'reference_number' => 'REF_' . $this->faker->unique()->numerify('##########'),

            // Amount and Currency
            'amount' => $amount,
            'currency' => $currency,
            'exchange_rate' => $currency === 'IDR' ? 1.0 : $this->faker->randomFloat(4, 0.5, 2.0),
            'amount_original' => $currency === 'IDR' ? $amount : $amount / $this->faker->randomFloat(4, 0.5, 2.0),
            'currency_original' => $currency === 'IDR' ? 'IDR' : $this->faker->randomElement(['USD', 'EUR']),

            // Payment Details
            'payment_method' => $paymentMethod,
            'payment_gateway' => $paymentGateway,
            'payment_channel' => $this->faker->randomElement(['online', 'offline', 'mobile']),
            'payment_type' => $this->faker->randomElement(['one_time', 'recurring', 'refund']),

            // Card Details (if applicable)
            'card_last_four' => $paymentMethod === 'credit_card' || $paymentMethod === 'debit_card'
                ? $this->faker->numerify('####')
                : null,
            'card_brand' => $paymentMethod === 'credit_card' || $paymentMethod === 'debit_card'
                ? $this->faker->randomElement($cardBrands)
                : null,
            'account_name' => $paymentMethod === 'bank_transfer'
                ? $this->faker->name()
                : null,
            'account_number_masked' => $paymentMethod === 'bank_transfer'
                ? '****' . $this->faker->numerify('####')
                : null,

            // Status
            'status' => $status,
            'gateway_status' => $this->getGatewayStatus($status),
            'gateway_message' => $this->getGatewayMessage($status),

            // Timing
            'initiated_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'authorized_at' => $status === 'completed' ? $this->faker->dateTimeBetween('-29 days', 'now') : null,
            'captured_at' => $status === 'completed' ? $this->faker->dateTimeBetween('-28 days', 'now') : null,
            'settled_at' => $status === 'completed' ? $this->faker->dateTimeBetween('-27 days', 'now') : null,
            'failed_at' => $status === 'failed' ? $this->faker->dateTimeBetween('-25 days', 'now') : null,

            // Fees
            'gateway_fee' => $this->faker->randomFloat(2, 0, $amount * 0.05),
            'platform_fee' => $this->faker->randomFloat(2, 0, $amount * 0.03),
            'processing_fee' => $this->faker->randomFloat(2, 0, $amount * 0.02),
            'tax_amount' => $this->faker->randomFloat(2, 0, $amount * 0.1),

            // Refund Information
            'refund_amount' => $status === 'refunded' ? $this->faker->randomFloat(2, 0, $amount) : null,
            'refunded_at' => $status === 'refunded' ? $this->faker->dateTimeBetween('-20 days', 'now') : null,
            'refund_reason' => $status === 'refunded' ? $this->faker->randomElement(['customer_request', 'fraud', 'duplicate', 'error']) : null,

            // Security
            'fraud_score' => $this->faker->randomFloat(2, 0, 100),
            'risk_assessment' => $this->faker->randomElement(['low', 'medium', 'high']),
            'ip_address' => $this->faker->ipv4(),
            'user_agent' => $this->faker->userAgent(),

            // Gateway Response
            'gateway_response' => $this->getGatewayResponse($paymentGateway, $status),

            // Additional Info
            'notes' => $this->faker->optional(0.3)->sentence(),
            'metadata' => $this->getMetadata($paymentMethod, $paymentGateway),
        ];
    }

    /**
     * Get gateway status based on transaction status
     */
    private function getGatewayStatus(string $status): string
    {
        return match ($status) {
            'completed' => 'success',
            'failed' => 'failed',
            'refunded' => 'refunded',
            'cancelled' => 'cancelled',
            'processing' => 'processing',
            default => 'pending',
        };
    }

    /**
     * Get gateway message based on status
     */
    private function getGatewayMessage(string $status): string
    {
        return match ($status) {
            'completed' => 'Transaction completed successfully',
            'failed' => 'Transaction failed',
            'refunded' => 'Transaction refunded',
            'cancelled' => 'Transaction cancelled',
            'processing' => 'Transaction is being processed',
            default => 'Transaction is pending',
        };
    }

    /**
     * Get gateway response based on gateway and status
     */
    private function getGatewayResponse(string $gateway, string $status): array
    {
        $baseResponse = [
            'gateway' => $gateway,
            'status' => $status,
            'timestamp' => now()->toISOString(),
        ];

        return match ($gateway) {
            'stripe' => array_merge($baseResponse, [
                'charge_id' => 'ch_' . $this->faker->asciify('********************'),
                'balance_transaction' => 'txn_' . $this->faker->asciify('********************'),
            ]),
            'midtrans' => array_merge($baseResponse, [
                'order_id' => 'ORDER_' . $this->faker->numerify('##########'),
                'transaction_id' => 'TXN_' . $this->faker->numerify('##########'),
            ]),
            'xendit' => array_merge($baseResponse, [
                'invoice_id' => 'INV_' . $this->faker->numerify('##########'),
                'payment_id' => 'PAY_' . $this->faker->numerify('##########'),
            ]),
            default => $baseResponse,
        };
    }

    /**
     * Get metadata based on payment method and gateway
     */
    private function getMetadata(string $paymentMethod, string $gateway): array
    {
        $metadata = [
            'payment_method' => $paymentMethod,
            'gateway' => $gateway,
            'created_via' => 'factory',
        ];

        if ($paymentMethod === 'credit_card' || $paymentMethod === 'debit_card') {
            $metadata['card_type'] = $this->faker->randomElement(['visa', 'mastercard', 'amex']);
            $metadata['card_country'] = $this->faker->countryCode();
        }

        if ($gateway === 'stripe') {
            $metadata['stripe_version'] = '2023-10-16';
        }

        return $metadata;
    }

    /**
     * Indicate that the model is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'gateway_status' => 'success',
            'authorized_at' => $this->faker->dateTimeBetween('-7 days', 'now'),
            'captured_at' => $this->faker->dateTimeBetween('-6 days', 'now'),
            'settled_at' => $this->faker->dateTimeBetween('-5 days', 'now'),
        ]);
    }

    /**
     * Indicate that the model is failed.
     */
    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'failed',
            'gateway_status' => 'failed',
            'failed_at' => $this->faker->dateTimeBetween('-7 days', 'now'),
            'gateway_message' => 'Transaction failed due to insufficient funds',
        ]);
    }

    /**
     * Indicate that the model is refunded.
     */
    public function refunded(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'refunded',
            'gateway_status' => 'refunded',
            'refund_amount' => $attributes['amount'],
            'refunded_at' => $this->faker->dateTimeBetween('-7 days', 'now'),
            'refund_reason' => 'customer_request',
        ]);
    }

    /**
     * Indicate that the model is high risk.
     */
    public function highRisk(): static
    {
        return $this->state(fn (array $attributes) => [
            'fraud_score' => $this->faker->randomFloat(2, 70, 100),
            'risk_assessment' => 'high',
        ]);
    }
}
