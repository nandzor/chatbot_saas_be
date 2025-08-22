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
        Schema::create('analytics_daily', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');
            $table->date('date');
            
            // Session Metrics
            $table->integer('total_sessions')->default(0);
            $table->integer('bot_sessions')->default(0);
            $table->integer('agent_sessions')->default(0);
            $table->integer('handover_count')->default(0);
            
            // Message Metrics
            $table->integer('total_messages')->default(0);
            $table->integer('customer_messages')->default(0);
            $table->integer('bot_messages')->default(0);
            $table->integer('agent_messages')->default(0);
            
            // User Metrics
            $table->integer('unique_customers')->default(0);
            $table->integer('new_customers')->default(0);
            $table->integer('returning_customers')->default(0);
            $table->integer('active_agents')->default(0);
            
            // Performance Metrics
            $table->integer('avg_session_duration')->nullable();
            $table->integer('avg_response_time')->nullable();
            $table->integer('avg_resolution_time')->nullable();
            $table->integer('avg_wait_time')->nullable();
            $table->integer('first_response_time')->nullable();
            
            // Quality Metrics
            $table->decimal('satisfaction_avg', 3, 2)->nullable();
            $table->integer('satisfaction_count')->default(0);
            $table->decimal('resolution_rate', 5, 2)->nullable();
            $table->decimal('escalation_rate', 5, 2)->nullable();
            
            // AI Metrics
            $table->integer('ai_requests_count')->default(0);
            $table->decimal('ai_success_rate', 5, 2)->nullable();
            $table->decimal('ai_avg_confidence', 3, 2)->nullable();
            $table->decimal('ai_cost_usd', 10, 2)->default(0);
            
            // Channel Breakdown
            $table->json('channel_breakdown')->default('{}');
            
            // Popular Content
            $table->json('top_intents')->default('[]');
            $table->json('top_articles')->default('[]');
            $table->json('top_searches')->default('[]');
            
            // Agent Performance
            $table->json('agent_performance')->default('{}');
            
            // Time Analysis
            $table->json('peak_hours')->default('{}');
            $table->json('hourly_distribution')->default('{}');
            
            // Error & Issues
            $table->integer('error_count')->default(0);
            $table->integer('bot_fallback_count')->default(0);
            
            // Usage & Billing
            $table->json('usage_metrics')->default('{}');
            
            // System fields
            $table->timestamp('created_at')->useCurrent();
            
            $table->unique(['organization_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analytics_daily');
    }
};
