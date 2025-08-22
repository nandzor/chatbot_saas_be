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
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('subscription_id')->nullable()->constrained('subscriptions');

            // Invoice Details
            $table->string('invoice_number', 50);
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

            // Unique constraints for business logic
            $table->unique('invoice_number', 'billing_invoices_invoice_number_unique');
            $table->unique(['organization_id', 'invoice_number'], 'billing_invoices_org_invoice_number_unique');
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
