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
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('subscription_id')->nullable()->constrained('subscriptions');
            $table->foreignUuid('invoice_id')->nullable()->constrained('billing_invoices');
            
            // Transaction Identity
            $table->string('transaction_id', 255)->unique();
            $table->string('external_transaction_id', 255)->nullable();
            $table->string('reference_number', 100)->nullable();
            
            // Payment Details
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('IDR');
            $table->decimal('exchange_rate', 10, 6)->default(1.0);
            $table->decimal('amount_original', 12, 2)->nullable();
            $table->string('currency_original', 3)->nullable();
            
            // Payment Method
            $table->string('payment_method', 50);
            $table->string('payment_gateway', 50);
            $table->string('payment_channel', 50)->nullable();
            
            // Card/Account Details (encrypted)
            $table->string('card_last_four', 4)->nullable();
            $table->string('card_brand', 20)->nullable();
            $table->string('account_name', 255)->nullable();
            $table->string('account_number_masked', 50)->nullable();
            
            // Transaction Flow
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'disputed', 'expired'])->default('pending');
            $table->string('payment_type', 20)->default('one_time');
            
            // Timing
            $table->timestamp('initiated_at')->default(now());
            $table->timestamp('authorized_at')->nullable();
            $table->timestamp('captured_at')->nullable();
            $table->timestamp('settled_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            
            // Gateway Response
            $table->json('gateway_response')->default('{}');
            $table->decimal('gateway_fee', 10, 2)->default(0);
            $table->string('gateway_status', 50)->nullable();
            $table->text('gateway_message')->nullable();
            
            // Fraud & Security
            $table->decimal('fraud_score', 3, 2)->nullable();
            $table->json('risk_assessment')->default('{}');
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            
            // Fees & Charges
            $table->decimal('platform_fee', 10, 2)->default(0);
            $table->decimal('processing_fee', 10, 2)->default(0);
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('net_amount', 12, 2)->nullable();
            
            // Refund Information
            $table->decimal('refund_amount', 12, 2)->default(0);
            $table->timestamp('refunded_at')->nullable();
            $table->text('refund_reason')->nullable();
            
            // System fields
            $table->text('notes')->nullable();
            $table->json('metadata')->default('{}');
            $table->timestamps();
            
            $table->check('payment_type IN (\'one_time\', \'recurring\', \'refund\')');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
    }
};
