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
        Schema::create('chat_sessions', function (Blueprint $table) {
            $table->uuid('id');
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('customer_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('channel_config_id')->constrained('channel_configs');
            $table->foreignUuid('agent_id')->nullable()->constrained('agents');

            // Session Information
            $table->string('session_token', 255);
            $table->string('session_type', 20)->default('customer_initiated');

            // Timing
            $table->timestamp('started_at')->default(now());
            $table->timestamp('ended_at')->nullable();
            $table->timestamp('last_activity_at')->default(now());
            $table->timestamp('first_response_at')->nullable();

            // Status & Flow
            $table->boolean('is_active')->default(true);
            $table->boolean('is_bot_session')->default(true);
            $table->text('handover_reason')->nullable();
            $table->timestamp('handover_at')->nullable();

            // Analytics & Metrics
            $table->integer('total_messages')->default(0);
            $table->integer('customer_messages')->default(0);
            $table->integer('bot_messages')->default(0);
            $table->integer('agent_messages')->default(0);
            $table->integer('response_time_avg')->nullable();
            $table->integer('resolution_time')->nullable();
            $table->integer('wait_time')->nullable();

            // Quality & Feedback
            $table->integer('satisfaction_rating')->nullable();
            $table->text('feedback_text')->nullable();
            $table->json('feedback_tags')->nullable();
            $table->timestamp('csat_submitted_at')->nullable();

            // Categorization
            $table->string('intent', 100)->nullable();
            $table->string('category', 100)->nullable();
            $table->string('subcategory', 100)->nullable();
            $table->string('priority', 20)->default('normal');
            $table->json('tags')->nullable();

            // Resolution
            $table->boolean('is_resolved')->default(false);
            $table->timestamp('resolved_at')->nullable();
            $table->string('resolution_type', 50)->nullable();
            $table->text('resolution_notes')->nullable();

            // AI Analytics
            $table->json('sentiment_analysis')->default('{}');
            $table->text('ai_summary')->nullable();
            $table->json('topics_discussed')->nullable();

            // System fields
            $table->json('session_data')->default('{}');
            $table->json('metadata')->default('{}');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();

            // Primary key and unique constraints
            $table->primary(['id', 'created_at']);
            $table->unique('session_token', 'chat_sessions_session_token_unique');
            $table->unique(['organization_id', 'customer_id', 'started_at'], 'chat_sessions_org_customer_started_unique');
            $table->check('session_type IN (\'customer_initiated\', \'agent_initiated\', \'bot_initiated\', \'system_initiated\')');
            $table->check('priority IN (\'low\', \'normal\', \'high\', \'urgent\')');
            $table->check('satisfaction_rating >= 1 AND satisfaction_rating <= 5');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_sessions');
    }
};
