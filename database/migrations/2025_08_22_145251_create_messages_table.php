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
        Schema::create('messages', function (Blueprint $table) {
            $table->uuid('id');
            $table->foreignUuid('session_id')->constrained('chat_sessions');
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');

            // Sender Information
            $table->string('sender_type', 20);
            $table->foreignUuid('sender_id')->nullable();
            $table->string('sender_name', 255)->nullable();

            // Message Content
            $table->text('message_text')->nullable();
            $table->enum('message_type', ['text', 'image', 'audio', 'video', 'file', 'location', 'contact', 'sticker', 'template', 'quick_reply', 'button', 'list', 'carousel', 'poll', 'form'])->default('text');

            // Rich Media
            $table->string('media_url', 500)->nullable();
            $table->string('media_type', 50)->nullable();
            $table->integer('media_size')->nullable();
            $table->json('media_metadata')->default('{}');
            $table->string('thumbnail_url', 500)->nullable();

            // Interactive Elements
            $table->json('quick_replies')->nullable();
            $table->json('buttons')->nullable();
            $table->json('template_data')->nullable();

            // AI & Intent
            $table->string('intent', 100)->nullable();
            $table->json('entities')->default('{}');
            $table->decimal('confidence_score', 3, 2)->nullable();
            $table->boolean('ai_generated')->default(false);
            $table->string('ai_model_used', 100)->nullable();

            // Sentiment Analysis
            $table->decimal('sentiment_score', 3, 2)->nullable();
            $table->string('sentiment_label', 20)->nullable();
            $table->json('emotion_scores')->default('{}');

            // Status & Delivery
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->text('failed_reason')->nullable();

            // Threading & Context
            $table->foreignUuid('reply_to_message_id')->nullable();
            $table->foreignUuid('thread_id')->nullable();
            $table->json('context')->default('{}');

            // Performance
            $table->integer('processing_time_ms')->nullable();

            // System fields
            $table->json('metadata')->default('{}');
            $table->timestamp('created_at')->useCurrent();

            // Primary key and unique constraints
            $table->primary(['id', 'created_at']);
            $table->unique(['session_id', 'created_at'], 'messages_session_created_unique');
            $table->check('sender_type IN (\'customer\', \'bot\', \'agent\', \'system\')');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
