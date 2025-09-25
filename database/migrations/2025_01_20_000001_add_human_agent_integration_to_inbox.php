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
        // Add human agent integration columns to existing chat_sessions table
        Schema::table('chat_sessions', function (Blueprint $table) {
            // Human Agent Integration
            $table->foreignUuid('assigned_agent_id')->nullable()->after('agent_id')->constrained('agents')->onDelete('set null');
            $table->enum('handling_mode', ['bot_only', 'human_only', 'hybrid'])->default('hybrid')->after('is_bot_session');
            $table->enum('session_status', ['bot_handled', 'agent_assigned', 'agent_handling', 'escalated', 'resolved', 'closed'])->default('bot_handled')->after('handling_mode');
            // Priority column already exists in chat_sessions table

            // Bot Integration Enhancement
            $table->foreignUuid('bot_personality_id')->nullable()->after('assigned_agent_id')->constrained()->onDelete('set null');
            $table->foreignUuid('waha_session_id')->nullable()->after('bot_personality_id')->constrained()->onDelete('set null');
            $table->json('bot_context')->nullable()->after('waha_session_id');
            $table->timestamp('last_bot_response_at')->nullable()->after('bot_context');
            $table->integer('bot_message_count')->default(0)->after('last_bot_response_at');

            // Human Agent Management
            $table->boolean('requires_human')->default(false)->after('bot_message_count');
            $table->timestamp('human_requested_at')->nullable()->after('requires_human');
            $table->timestamp('assigned_at')->nullable()->after('human_requested_at');
            $table->timestamp('agent_started_at')->nullable()->after('assigned_at');
            $table->timestamp('agent_ended_at')->nullable()->after('agent_started_at');
            $table->integer('agent_message_count')->default(0)->after('agent_ended_at');
            $table->integer('response_time_seconds')->nullable()->after('agent_message_count');
            $table->integer('resolution_time_seconds')->nullable()->after('response_time_seconds');

            // Escalation and Transfer
            $table->foreignUuid('escalated_from_agent_id')->nullable()->after('resolution_time_seconds')->constrained('agents')->onDelete('set null');
            $table->foreignUuid('transferred_to_agent_id')->nullable()->after('escalated_from_agent_id')->constrained('agents')->onDelete('set null');
            $table->text('escalation_reason')->nullable()->after('transferred_to_agent_id');
            $table->text('transfer_notes')->nullable()->after('escalation_reason');

            // Customer Information Enhancement
            $table->string('customer_name', 255)->nullable()->after('customer_id');
            $table->string('customer_phone', 50)->nullable()->after('customer_name');
            $table->string('customer_email', 255)->nullable()->after('customer_phone');
            $table->json('customer_metadata')->nullable()->after('customer_email');

            // Indexes for performance
            $table->index(['organization_id', 'session_status']);
            $table->index(['assigned_agent_id', 'session_status']);
            // Priority index removed as priority column already exists
            $table->index(['requires_human', 'session_status']);
        });

        // Add human agent integration columns to existing messages table
        Schema::table('messages', function (Blueprint $table) {
            // Agent Attribution
            $table->foreignUuid('sender_agent_id')->nullable()->after('sender_id')->constrained('agents')->onDelete('set null');
            $table->foreignUuid('bot_personality_id')->nullable()->after('sender_agent_id')->constrained()->onDelete('set null');

            // Message Status Enhancement
            $table->enum('message_status', ['sent', 'delivered', 'read', 'failed'])->default('sent')->after('message_type');
            // sent_at, delivered_at, read_at already exist in messages table

            // Bot Integration
            $table->boolean('is_bot_generated')->default(false)->after('message_status');
            $table->json('bot_context')->nullable()->after('is_bot_generated');
            $table->decimal('bot_confidence', 3, 2)->nullable()->after('bot_context');

            // Agent Integration
            $table->boolean('is_agent_generated')->default(false)->after('bot_confidence');
            $table->json('agent_context')->nullable()->after('is_agent_generated');
            $table->boolean('is_auto_response')->default(false)->after('agent_context');
            $table->text('agent_notes')->nullable()->after('is_auto_response');

            // Indexes for performance
            // sent_at indexes not added as sent_at already exists in original table
            $table->index(['sender_agent_id', 'created_at']);
        });

        // Create Agent Queue Management table
        Schema::create('agent_queues', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('agent_id')->constrained('agents')->onDelete('cascade');
            $table->foreignUuid('chat_session_id')->constrained('chat_sessions')->onDelete('cascade');

            // Queue Information
            $table->enum('queue_type', ['inbox', 'escalated', 'transferred', 'follow_up'])->default('inbox');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->enum('status', ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'])->default('pending');

            // Assignment Details
            $table->timestamp('queued_at');
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->integer('wait_time_seconds')->nullable();
            $table->integer('handling_time_seconds')->nullable();

            // Context and Notes
            $table->text('assignment_notes')->nullable();
            $table->json('customer_context')->nullable();
            $table->json('bot_context')->nullable();

            // System fields
            $table->timestamps();

            // Indexes
            $table->index(['agent_id', 'status']);
            $table->index(['organization_id', 'queue_type', 'status']);
            $table->index(['priority', 'queued_at']);
        });

        // Create Agent Availability and Status table
        Schema::create('agent_availability', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('agent_id')->constrained('agents')->onDelete('cascade');
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');

            // Availability Status
            $table->enum('status', ['online', 'busy', 'away', 'offline'])->default('offline');
            $table->enum('work_mode', ['available', 'do_not_disturb', 'break', 'training'])->default('available');
            $table->integer('current_active_chats')->default(0);
            $table->integer('max_concurrent_chats')->default(5);

            // Working Hours
            $table->json('working_hours')->nullable();
            $table->json('break_schedule')->nullable();
            $table->timestamp('last_activity_at')->nullable();
            $table->timestamp('status_changed_at')->nullable();

            // Skills and Specialization
            $table->json('available_skills')->nullable();
            $table->json('language_preferences')->nullable();
            $table->json('channel_preferences')->nullable();

            // Performance Tracking
            $table->integer('total_chats_today')->default(0);
            $table->integer('total_resolved_today')->default(0);
            $table->decimal('avg_response_time', 8, 2)->nullable();
            $table->decimal('avg_resolution_time', 8, 2)->nullable();

            // System fields
            $table->timestamps();

            // Indexes
            $table->index(['agent_id', 'status']);
            $table->index(['organization_id', 'status']);
            $table->index(['work_mode', 'status']);
        });

        // Create Message Templates for Agents table
        Schema::create('agent_message_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('created_by_agent_id')->nullable()->constrained('agents')->onDelete('set null');

            // Template Information
            $table->string('name', 255);
            $table->string('category', 100)->nullable();
            $table->text('content');
            $table->json('variables')->nullable(); // For dynamic content
            $table->json('metadata')->nullable();

            // Usage and Performance
            $table->integer('usage_count')->default(0);
            $table->decimal('success_rate', 5, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_public')->default(false); // Available to all agents

            // System fields
            $table->timestamps();

            // Indexes
            $table->index(['organization_id', 'category']);
            $table->index(['is_active', 'is_public']);
        });

        // Create Conversation Analytics and Insights table
        Schema::create('conversation_analytics', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('chat_session_id')->constrained('chat_sessions')->onDelete('cascade');
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');

            // Analytics Data
            $table->json('sentiment_analysis')->nullable();
            $table->json('intent_classification')->nullable();
            $table->json('topic_extraction')->nullable();
            $table->json('customer_satisfaction')->nullable();
            $table->json('agent_performance')->nullable();
            $table->json('bot_performance')->nullable();

            // Metrics
            $table->integer('total_messages')->default(0);
            $table->integer('bot_messages')->default(0);
            $table->integer('agent_messages')->default(0);
            $table->integer('customer_messages')->default(0);
            $table->integer('response_time_avg')->nullable();
            $table->integer('resolution_time')->nullable();

            // System fields
            $table->timestamps();

            // Indexes
            $table->index(['organization_id', 'created_at']);
            $table->index(['chat_session_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop new tables
        Schema::dropIfExists('conversation_analytics');
        Schema::dropIfExists('agent_message_templates');
        Schema::dropIfExists('agent_availability');
        Schema::dropIfExists('agent_queues');

        // Remove added columns from messages table
        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex(['sender_agent_id', 'created_at']);

            $table->dropColumn([
                'sender_agent_id',
                'bot_personality_id',
                'message_status',
                // 'sent_at', 'delivered_at', 'read_at' not dropped as they exist in original table
                'is_bot_generated',
                'bot_context',
                'bot_confidence',
                'is_agent_generated',
                'agent_context',
                'is_auto_response',
                'agent_notes'
            ]);
        });

        // Remove added columns from chat_sessions table
        Schema::table('chat_sessions', function (Blueprint $table) {
            $table->dropIndex(['organization_id', 'session_status']);
            $table->dropIndex(['assigned_agent_id', 'session_status']);
            // Priority index not dropped as it was not created in this migration
            $table->dropIndex(['requires_human', 'session_status']);

            $table->dropColumn([
                'assigned_agent_id',
                'handling_mode',
                'session_status',
                // 'priority', // Not dropped as it already exists in original table
                'bot_personality_id',
                'waha_session_id',
                'bot_context',
                'last_bot_response_at',
                'bot_message_count',
                'requires_human',
                'human_requested_at',
                'assigned_at',
                'agent_started_at',
                'agent_ended_at',
                'agent_message_count',
                'response_time_seconds',
                'resolution_time_seconds',
                'escalated_from_agent_id',
                'transferred_to_agent_id',
                'escalation_reason',
                'transfer_notes',
                'customer_name',
                'customer_phone',
                'customer_email',
                'customer_metadata'
            ]);
        });
    }
};
