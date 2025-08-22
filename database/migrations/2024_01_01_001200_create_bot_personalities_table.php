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
        Schema::create('bot_personalities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('organization_id');
            $table->string('name', 255);
            $table->string('code', 50);
            $table->string('display_name', 255)->nullable();
            $table->text('description')->nullable();

            // AI Model Configuration
            $table->uuid('ai_model_id')->nullable();

            // Language & Communication
            $table->enum('language', ['indonesia', 'english', 'javanese', 'sundanese', 'balinese', 'minang', 'chinese', 'japanese', 'korean', 'spanish', 'french', 'german', 'arabic', 'thai', 'vietnamese']);
            $table->string('tone', 50)->nullable();
            $table->string('communication_style', 50)->nullable();
            $table->enum('formality_level', ['formal', 'informal', 'casual'])->default('formal');

            // UI Customization
            $table->string('avatar_url', 500)->nullable();
            $table->json('color_scheme')->default(json_encode(['primary' => '#3B82F6', 'secondary' => '#10B981']));

            // Messages & Responses
            $table->text('greeting_message')->nullable();
            $table->text('farewell_message')->nullable();
            $table->text('error_message')->nullable();
            $table->text('waiting_message')->nullable();
            $table->text('transfer_message')->nullable();
            $table->text('fallback_message')->nullable();

            // AI Configuration
            $table->text('system_message')->nullable();
            $table->json('personality_traits')->default('{}');
            $table->json('custom_vocabulary')->default('{}');
            $table->json('response_templates')->default('{}');
            $table->json('conversation_starters')->nullable();

            // Behavior Settings
            $table->integer('response_delay_ms')->default(1000);
            $table->boolean('typing_indicator')->default(true);
            $table->integer('max_response_length')->default(1000);
            $table->boolean('enable_small_talk')->default(true);
            $table->decimal('confidence_threshold', 3, 2)->default(0.7);

            // Learning & Training
            $table->boolean('learning_enabled')->default(true);
            $table->json('training_data_sources')->nullable();
            $table->timestamp('last_trained_at')->nullable();

            // Performance Metrics
            $table->integer('total_conversations')->default(0);
            $table->decimal('avg_satisfaction_score', 3, 2)->default(0);
            $table->decimal('success_rate', 5, 2)->default(0);

            // System fields
            $table->boolean('is_default')->default(false);
            $table->enum('status', ['active', 'inactive', 'suspended', 'deleted', 'pending', 'draft'])->default('active');
            $table->timestamps();

            // Foreign keys
            $table->foreign('organization_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->foreign('ai_model_id')->references('id')->on('ai_models');

            // Unique constraint
            $table->unique(['organization_id', 'code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bot_personalities');
    }
};

