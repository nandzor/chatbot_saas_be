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
        Schema::create('waha_analytics_daily', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('session_id')->constrained('waha_sessions')->onDelete('cascade');
            $table->date('date');
            
            // Message Metrics
            $table->integer('total_messages_sent')->default(0);
            $table->integer('total_messages_received')->default(0);
            $table->integer('total_media_sent')->default(0);
            $table->integer('total_media_received')->default(0);
            $table->integer('total_text_messages')->default(0);
            $table->integer('total_voice_messages')->default(0);
            $table->integer('total_video_messages')->default(0);
            $table->integer('total_file_messages')->default(0);
            $table->integer('total_location_messages')->default(0);
            $table->integer('total_contact_messages')->default(0);
            $table->integer('total_sticker_messages')->default(0);
            $table->integer('total_template_messages')->default(0);
            $table->integer('total_interactive_messages')->default(0);
            
            // Contact Metrics
            $table->integer('total_contacts')->default(0);
            $table->integer('new_contacts')->default(0);
            $table->integer('active_contacts')->default(0);
            $table->integer('business_contacts')->default(0);
            $table->integer('verified_contacts')->default(0);
            
            // Group Metrics
            $table->integer('total_groups')->default(0);
            $table->integer('new_groups')->default(0);
            $table->integer('active_groups')->default(0);
            $table->integer('announcement_groups')->default(0);
            $table->integer('community_groups')->default(0);
            $table->integer('ephemeral_groups')->default(0);
            
            // Business Metrics
            $table->integer('total_business_features')->default(0);
            $table->integer('verified_businesses')->default(0);
            $table->integer('businesses_with_catalog')->default(0);
            $table->integer('businesses_with_shopping')->default(0);
            $table->integer('businesses_with_payment')->default(0);
            
            // Performance Metrics
            $table->integer('avg_response_time_ms')->nullable();
            $table->integer('total_api_requests')->default(0);
            $table->integer('successful_api_requests')->default(0);
            $table->integer('failed_api_requests')->default(0);
            $table->integer('rate_limited_requests')->default(0);
            $table->integer('total_webhook_events')->default(0);
            $table->integer('processed_webhook_events')->default(0);
            $table->integer('failed_webhook_events')->default(0);
            
            // Error Metrics
            $table->integer('total_errors')->default(0);
            $table->integer('connection_errors')->default(0);
            $table->integer('authentication_errors')->default(0);
            $table->integer('rate_limit_errors')->default(0);
            $table->integer('webhook_errors')->default(0);
            
            // Time-based Metrics
            $table->json('hourly_message_distribution')->default('{}');
            $table->json('peak_hours')->default('{}');
            $table->json('daily_trends')->default('{}');
            
            // Metadata
            $table->json('metadata')->default('{}');
            $table->enum('status_type', ['active', 'inactive', 'suspended', 'deleted', 'pending', 'draft', 'published', 'archived'])->default('active');
            $table->timestamp('created_at')->useCurrent();
            
            $table->unique(['organization_id', 'session_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('waha_analytics_daily');
    }
};
