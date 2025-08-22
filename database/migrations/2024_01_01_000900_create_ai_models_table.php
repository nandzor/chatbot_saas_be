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
        Schema::create('ai_models', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('organization_id');
            $table->string('name', 255);
            $table->enum('model_type', ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'claude-3-sonnet', 'claude-3-opus', 'gemini-pro', 'custom']);

            // Configuration
            $table->string('api_endpoint', 500)->nullable();
            $table->text('api_key_encrypted')->nullable();
            $table->string('model_version', 50)->nullable();

            // Parameters
            $table->decimal('temperature', 3, 2)->default(0.7);
            $table->integer('max_tokens')->default(150);
            $table->decimal('top_p', 3, 2)->default(1.0);
            $table->decimal('frequency_penalty', 3, 2)->default(0.0);
            $table->decimal('presence_penalty', 3, 2)->default(0.0);

            // System Prompts
            $table->text('system_prompt')->nullable();
            $table->text('context_prompt')->nullable();
            $table->json('fallback_responses')->nullable();

            // Usage & Performance
            $table->integer('total_requests')->default(0);
            $table->integer('avg_response_time')->default(0);
            $table->decimal('success_rate', 5, 2)->default(0);
            $table->decimal('cost_per_request', 10, 6)->default(0);

            // System fields
            $table->boolean('is_default')->default(false);
            $table->enum('status', ['active', 'inactive', 'suspended', 'deleted', 'pending', 'draft'])->default('active');
            $table->timestamps();

            // Foreign keys
            $table->foreign('organization_id')->references('id')->on('organizations')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_models');
    }
};

