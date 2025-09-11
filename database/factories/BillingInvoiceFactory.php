<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\BillingInvoice;
use App\Models\Subscription;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BillingInvoice>
 */
class BillingInvoiceFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = BillingInvoice::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = ['pending', 'processing', 'success', 'failed', 'expired', 'refunded', 'cancelled', 'disputed'];
        $currencies = ['IDR', 'USD', 'EUR', 'SGD'];
        $billingCycles = ['monthly', 'yearly'];

        $amount = $this->faker->randomFloat(2, 100000, 5000000);
        $currency = $this->faker->randomElement($currencies);
        $status = $this->faker->randomElement($statuses);
        $billingCycle = $this->faker->randomElement($billingCycles);

        $invoiceDate = $this->faker->dateTimeBetween('-60 days', 'now');
        $dueDate = $this->faker->dateTimeBetween($invoiceDate, '+30 days');
        $paidDate = $status === 'success' ? $this->faker->dateTimeBetween($invoiceDate, $dueDate) : null;

        return [
            'organization_id' => Organization::factory(),
            'subscription_id' => Subscription::factory(),
            'invoice_number' => 'INV-' . $this->faker->unique()->numerify('##########'),

            // Invoice Details
            'status' => $status,
            'invoice_date' => $invoiceDate,
            'due_date' => $dueDate,
            'paid_date' => $paidDate,

            // Amounts
            'subtotal' => $amount * 0.9, // 90% of total
            'tax_amount' => $amount * 0.1, // 10% tax
            'discount_amount' => $this->faker->randomFloat(2, 0, $amount * 0.2),
            'total_amount' => $amount,
            'currency' => $currency,

            // Payment Information
            'payment_method' => $this->faker->randomElement(['credit_card', 'bank_transfer', 'ewallet']),
            'transaction_id' => $status === 'success' ? 'TXN-' . $this->faker->numerify('##########') : null,
            'payment_gateway' => $this->faker->randomElement(['stripe', 'midtrans', 'xendit']),

            // Invoice Data
            'line_items' => [
                [
                    'description' => 'Subscription Fee',
                    'quantity' => 1,
                    'unit_price' => $amount * 0.9,
                    'total' => $amount * 0.9,
                ]
            ],
            'billing_address' => [
                'name' => $this->faker->company(),
                'email' => $this->faker->companyEmail(),
                'address' => $this->faker->address(),
                'phone' => $this->faker->phoneNumber(),
            ],

            // Metadata
            'metadata' => [
                'billing_cycle' => $billingCycle,
                'created_via' => 'factory',
                'invoice_type' => 'subscription',
            ],

            // Timestamps
            'created_at' => $invoiceDate,
            'updated_at' => $paidDate ?? $invoiceDate,
        ];
    }

    /**
     * Indicate that the invoice is paid.
     */
    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'success',
            'paid_date' => $this->faker->dateTimeBetween($attributes['invoice_date'], $attributes['due_date']),
            'transaction_id' => 'TXN-' . $this->faker->numerify('##########'),
        ]);
    }

    /**
     * Indicate that the invoice is overdue.
     */
    public function overdue(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'expired',
            'due_date' => $this->faker->dateTimeBetween('-30 days', '-1 day'),
            'paid_date' => null,
        ]);
    }

    /**
     * Indicate that the invoice is draft.
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'paid_date' => null,
            'transaction_id' => null,
        ]);
    }


    /**
     * Indicate that the invoice has a discount.
     */
    public function withDiscount(): static
    {
        return $this->state(fn (array $attributes) => [
            'discount_amount' => $this->faker->randomFloat(2, $attributes['total_amount'] * 0.05, $attributes['total_amount'] * 0.3),
        ]);
    }
}
