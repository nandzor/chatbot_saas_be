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
        Schema::create('webhook_events', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('subscription_id')->nullable()->constrained()->onDelete('set null');
            $table->string('gateway', 50)->index(); // stripe, midtrans, xendit
            $table->string('event_type', 100)->index(); // payment_intent.succeeded, payment.success, etc.
            $table->string('event_id', 100)->index(); // External event ID from gateway
            $table->enum('status', ['pending', 'processed', 'failed', 'retrying'])->default('pending')->index();
            $table->json('payload'); // Full webhook payload
            $table->string('signature', 500)->nullable(); // Webhook signature for verification
            $table->timestamp('processed_at')->nullable(); // When the webhook was processed
            $table->integer('retry_count')->default(0); // Number of retry attempts
            $table->timestamp('next_retry_at')->nullable(); // When to retry next
            $table->text('error_message')->nullable(); // Error message if processing failed
            $table->json('metadata')->nullable(); // Additional metadata
            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index(['organization_id', 'gateway', 'status']);
            $table->index(['gateway', 'event_type', 'status']);
            $table->index(['processed_at', 'status']);
            $table->index(['next_retry_at', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('webhook_events');
    }
};
