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
        // Chatbot sessions tracking for better performance
        Schema::create('chatbot_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('session_id', 255)->unique();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->uuid('organization_id')->nullable();
            $table->string('channel', 100); // whatsapp, telegram, web, etc
            $table->string('platform', 100); // waha, native, etc
            $table->json('metadata')->default('{}');
            $table->timestamp('last_activity_at');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('organization_id')->references('id')->on('organizations')->onDelete('cascade');

            // Indexes for performance (optimized for 5000+ users)
            $table->index(['user_id', 'is_active'], 'chatbot_sessions_user_active_index');
            $table->index(['organization_id', 'is_active'], 'chatbot_sessions_org_active_index');
            $table->index(['channel', 'is_active'], 'chatbot_sessions_channel_active_index');
            $table->index('last_activity_at', 'chatbot_sessions_activity_index');
            $table->index(['organization_id', 'last_activity_at'], 'chatbot_sessions_org_activity_index');
        });

        // Chatbot performance metrics (optimized for high-volume data)
        Schema::create('chatbot_metrics', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('organization_id')->nullable();
            $table->string('metric_type', 100); // response_time, message_count, error_rate, etc
            $table->string('metric_key', 255);
            $table->decimal('value', 20, 6);
            $table->json('tags')->default('{}'); // channel, bot_id, etc
            $table->timestamp('recorded_at');
            $table->timestamps();

            // Foreign keys
            $table->foreign('organization_id')->references('id')->on('organizations')->onDelete('cascade');

            // Indexes for metrics queries (optimized for time-series data)
            $table->index(['metric_type', 'recorded_at'], 'chatbot_metrics_type_time_index');
            $table->index(['organization_id', 'metric_type'], 'chatbot_metrics_org_type_index');
            $table->index(['metric_key', 'recorded_at'], 'chatbot_metrics_key_time_index');
            $table->index('recorded_at', 'chatbot_metrics_time_index');
            $table->index(['organization_id', 'recorded_at'], 'chatbot_metrics_org_time_index');
        });

        // Enhanced cache for chatbot responses (optimized for fast lookups)
        Schema::create('chatbot_response_cache', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('cache_key', 500)->unique();
            $table->uuid('organization_id')->nullable();
            $table->string('bot_type', 100); // ai, rule_based, hybrid
            $table->text('input_hash'); // hash of input for matching
            $table->longText('response_data');
            $table->json('metadata')->default('{}');
            $table->integer('hit_count')->default(0);
            $table->timestamp('expires_at');
            $table->timestamp('last_used_at');
            $table->timestamps();

            // Foreign keys
            $table->foreign('organization_id')->references('id')->on('organizations')->onDelete('cascade');

            // Indexes for fast cache lookups (optimized for cache performance)
            $table->index(['input_hash', 'expires_at'], 'chatbot_cache_hash_expires_index');
            $table->index(['organization_id', 'bot_type'], 'chatbot_cache_org_type_index');
            $table->index('expires_at', 'chatbot_cache_expires_index');
            $table->index(['hit_count', 'last_used_at'], 'chatbot_cache_usage_index');
            $table->index(['organization_id', 'expires_at'], 'chatbot_cache_org_expires_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chatbot_response_cache');
        Schema::dropIfExists('chatbot_metrics');
        Schema::dropIfExists('chatbot_sessions');
    }
};
