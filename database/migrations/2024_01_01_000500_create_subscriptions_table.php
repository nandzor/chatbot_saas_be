<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('organization_id');
            $table->uuid('plan_id');

            // Subscription Details
            $table->enum('status', ['pending', 'processing', 'success', 'failed', 'expired', 'refunded', 'cancelled', 'disputed'])->default('pending');
            $table->enum('billing_cycle', ['monthly', 'quarterly', 'yearly', 'lifetime'])->default('monthly');
            $table->timestamp('current_period_start')->default(now());
            $table->timestamp('current_period_end')->nullable();
            $table->timestamp('trial_start')->nullable();
            $table->timestamp('trial_end')->nullable();

            // Pricing
            $table->decimal('unit_amount', 10, 2);
            $table->string('currency', 3)->default('IDR');
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('tax_amount', 10, 2)->default(0);

            // Payment Information
            $table->string('payment_method_id', 255)->nullable();
            $table->timestamp('last_payment_date')->nullable();
            $table->timestamp('next_payment_date')->nullable();

            // Cancellation
            $table->boolean('cancel_at_period_end')->default(false);
            $table->timestamp('canceled_at')->nullable();
            $table->text('cancellation_reason')->nullable();

            // System fields
            $table->json('metadata')->default('{}');
            $table->timestamps();

            // Foreign keys
            $table->foreign('organization_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->foreign('plan_id')->references('id')->on('subscription_plans');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};

