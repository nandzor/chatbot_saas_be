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
        Schema::create('billing_invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('organization_id');
            $table->uuid('subscription_id')->nullable();

            // Invoice Details
            $table->string('invoice_number', 50)->unique();
            $table->enum('status', ['pending', 'processing', 'success', 'failed', 'expired', 'refunded', 'cancelled', 'disputed'])->default('pending');

            // Amounts
            $table->decimal('subtotal', 10, 2);
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2);
            $table->string('currency', 3)->default('IDR');

            // Dates
            $table->timestamp('invoice_date')->default(now());
            $table->timestamp('due_date')->nullable();
            $table->timestamp('paid_date')->nullable();

            // Payment Information
            $table->string('payment_method', 100)->nullable();
            $table->string('transaction_id', 255)->nullable();
            $table->string('payment_gateway', 50)->nullable();

            // Invoice Data
            $table->json('line_items')->default('[]');
            $table->json('billing_address')->default('{}');

            // System fields
            $table->json('metadata')->default('{}');
            $table->timestamps();

            // Foreign keys
            $table->foreign('organization_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->foreign('subscription_id')->references('id')->on('subscriptions');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billing_invoices');
    }
};

