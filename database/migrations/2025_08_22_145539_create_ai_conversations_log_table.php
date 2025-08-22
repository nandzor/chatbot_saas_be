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
        Schema::create('ai_conversations_log', function (Blueprint $table) {
            $table->uuid('id');
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('session_id')->nullable()->constrained('chat_sessions');
            $table->foreignUuid('message_id')->nullable()->constrained('messages');
            
            // AI Request Details
            $table->foreignUuid('ai_model_id')->nullable()->constrained('ai_models');
            $table->text('prompt');
            $table->text('response')->nullable();
            
            // Performance Metrics
            $table->integer('response_time_ms')->nullable();
            $table->integer('token_count_input')->nullable();
            $table->integer('token_count_output')->nullable();
            $table->decimal('cost_usd', 10, 6)->nullable();
            
            // Quality Metrics
            $table->decimal('confidence_score', 3, 2)->nullable();
            $table->integer('user_feedback')->nullable();
            
            // Error Handling
            $table->text('error_message')->nullable();
            $table->integer('retry_count')->default(0);
            
            // System fields
            $table->timestamp('created_at')->useCurrent();
            
            $table->primary(['id', 'created_at']);
            $table->check('user_feedback >= -1 AND user_feedback <= 1');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_conversations_log');
    }
};
