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
        Schema::create('knowledge_qa_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('knowledge_item_id')->constrained('knowledge_base_items')->onDelete('cascade');
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');

            // Q&A Content
            $table->text('question');
            $table->text('answer');
            $table->json('question_variations')->nullable();
            $table->json('answer_variations')->nullable();

            // Context & Metadata
            $table->text('context')->nullable();
            $table->string('intent', 100)->nullable();
            $table->string('confidence_level', 20)->default('high');

            // Keywords & Search
            $table->json('keywords')->nullable();
            $table->json('search_keywords')->nullable();
            $table->json('trigger_phrases')->nullable();

            // Conditions & Rules
            $table->json('conditions')->default('{}');
            $table->json('response_rules')->default('{}');

            // Performance Metrics
            $table->integer('usage_count')->default(0);
            $table->decimal('success_rate', 5, 2)->default(0);
            $table->decimal('user_satisfaction', 3, 2)->default(0);
            $table->timestamp('last_used_at')->nullable();

            // AI Enhancement
            $table->decimal('ai_confidence', 3, 2)->nullable();
            $table->json('ai_embeddings')->default('{}');
            $table->timestamp('ai_last_trained_at')->nullable();
            $table->text('search_vector')->nullable();

            // Order & Priority
            $table->integer('order_index')->default(0);
            $table->boolean('is_primary')->default(false);
            $table->boolean('is_active')->default(true);

            // System fields
            $table->json('metadata')->default('{}');
            $table->timestamps();

            $table->check('confidence_level IN (\'low\', \'medium\', \'high\')');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('knowledge_qa_items');
    }
};
