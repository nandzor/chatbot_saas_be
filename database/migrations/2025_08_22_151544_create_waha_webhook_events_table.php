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
        Schema::create('waha_webhook_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('session_id')->constrained('waha_sessions')->onDelete('cascade');

            // Event Identity
            $table->string('event_id', 255);
            $table->string('event_type', 100);
            $table->timestamp('event_timestamp')->nullable();

            // Event Data
            $table->json('event_data');
            $table->json('session_data')->nullable();
            $table->json('contact_data')->nullable();
            $table->json('group_data')->nullable();
            $table->json('message_data')->nullable();
            $table->json('business_data')->nullable();
            $table->json('catalog_data')->nullable();
            $table->json('order_data')->nullable();
            $table->json('payment_data')->nullable();
            $table->json('system_data')->nullable();
            $table->json('unknown_data')->nullable();

            // Processing Status
            $table->enum('processing_status', ['pending', 'processing', 'completed', 'failed', 'retry'])->default('pending');
            $table->integer('retry_count')->default(0);
            $table->timestamp('processed_at')->nullable();
            $table->text('processing_error')->nullable();

            // Webhook Delivery
            $table->boolean('webhook_sent')->default(false);
            $table->timestamp('webhook_sent_at')->nullable();
            $table->integer('webhook_response_code')->nullable();
            $table->text('webhook_response_body')->nullable();
            $table->text('webhook_error')->nullable();

            // Metadata
            $table->json('metadata')->default('{}');
            $table->enum('status_type', ['active', 'inactive', 'suspended', 'deleted', 'pending', 'draft', 'published', 'archived'])->default('active');
            $table->timestamps();

            // Unique constraints for business logic
            $table->unique(['organization_id', 'event_id'], 'waha_webhook_events_org_event_id_unique');
            $table->unique(['session_id', 'event_id'], 'waha_webhook_events_session_event_id_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('waha_webhook_events');
    }
};
