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
        $statuses = ['draft', 'pending', 'paid', 'overdue', 'cancelled', 'refunded'];
        $currencies = ['IDR', 'USD', 'EUR', 'SGD'];
        $billingCycles = ['monthly', 'yearly'];

        $amount = $this->faker->randomFloat(2, 100000, 5000000);
        $currency = $this->faker->randomElement($currencies);
        $status = $this->faker->randomElement($statuses);
        $billingCycle = $this->faker->randomElement($billingCycles);

        $invoiceDate = $this->faker->dateTimeBetween('-60 days', 'now');
        $dueDate = $this->faker->dateTimeBetween($invoiceDate, '+30 days');
        $paidDate = $status === 'paid' ? $this->faker->dateTimeBetween($invoiceDate, $dueDate) : null;

        return [
            'organization_id' => Organization::factory(),
            'subscription_id' => Subscription::factory(),
            'invoice_number' => 'INV-' . $this->faker->unique()->numerify('##########'),
            'external_invoice_id' => 'EXT-INV-' . $this->faker->unique()->numerify('##########'),

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

            // Billing Information
            'billing_cycle' => $billingCycle,
            'period_start' => $this->faker->dateTimeBetween('-90 days', '-30 days'),
            'period_end' => $this->faker->dateTimeBetween('-30 days', 'now'),

            // Payment Information
            'payment_method' => $this->faker->randomElement(['credit_card', 'bank_transfer', 'ewallet']),
            'payment_gateway' => $this->faker->randomElement(['stripe', 'midtrans', 'xendit']),
            'payment_reference' => $status === 'paid' ? 'PAY-' . $this->faker->numerify('##########') : null,

            // Customer Information
            'customer_name' => $this->faker->company(),
            'customer_email' => $this->faker->companyEmail(),
            'customer_address' => $this->faker->address(),
            'customer_phone' => $this->faker->phoneNumber(),

            // Additional Information
            'notes' => $this->faker->optional(0.3)->sentence(),
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
            'status' => 'paid',
            'paid_date' => $this->faker->dateTimeBetween($attributes['invoice_date'], $attributes['due_date']),
            'payment_reference' => 'PAY-' . $this->faker->numerify('##########'),
        ]);
    }

    /**
     * Indicate that the invoice is overdue.
     */
    public function overdue(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'overdue',
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
            'status' => 'draft',
            'paid_date' => null,
            'payment_reference' => null,
        ]);
    }

    /**
     * Indicate that the invoice is for monthly billing.
     */
    public function monthly(): static
    {
        return $this->state(fn (array $attributes) => [
            'billing_cycle' => 'monthly',
            'period_start' => $this->faker->dateTimeBetween('-60 days', '-30 days'),
            'period_end' => $this->faker->dateTimeBetween('-30 days', 'now'),
        ]);
    }

    /**
     * Indicate that the invoice is for yearly billing.
     */
    public function yearly(): static
    {
        return $this->state(fn (array $attributes) => [
            'billing_cycle' => 'yearly',
            'period_start' => $this->faker->dateTimeBetween('-365 days', '-30 days'),
            'period_end' => $this->faker->dateTimeBetween('-30 days', 'now'),
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
