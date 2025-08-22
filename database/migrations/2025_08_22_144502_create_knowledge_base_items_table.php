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
        Schema::create('knowledge_base_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('category_id')->constrained('knowledge_base_categories')->onDelete('cascade');
            
            // Basic Information
            $table->string('title', 500);
            $table->string('slug', 500);
            $table->text('description')->nullable();
            $table->string('content_type', 20)->default('article');
            
            // Content (for article type)
            $table->text('content')->nullable();
            $table->text('summary')->nullable();
            $table->text('excerpt')->nullable();
            
            // Content Management
            $table->json('tags')->nullable();
            $table->json('keywords')->nullable();
            $table->enum('language', ['indonesia', 'english', 'javanese', 'sundanese', 'balinese', 'minang', 'chinese', 'japanese', 'korean', 'spanish', 'french', 'german', 'arabic', 'thai', 'vietnamese'])->default('indonesia');
            $table->enum('difficulty_level', ['basic', 'intermediate', 'advanced', 'expert'])->default('basic');
            $table->string('priority', 20)->default('medium');
            $table->integer('estimated_read_time')->nullable();
            $table->integer('word_count')->default(0);
            
            // SEO & Frontend
            $table->string('meta_title', 255)->nullable();
            $table->text('meta_description')->nullable();
            $table->string('featured_image_url', 500)->nullable();
            
            // Publishing & Visibility
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_public')->default(true);
            $table->boolean('is_searchable')->default(true);
            $table->boolean('is_ai_trainable')->default(true);
            $table->boolean('requires_approval')->default(false);
            
            // Workflow & Status
            $table->string('workflow_status', 20)->default('draft');
            $table->string('approval_status', 20)->default('pending');
            
            // Author & Editorial
            $table->foreignUuid('author_id')->nullable()->constrained('users');
            $table->foreignUuid('reviewer_id')->nullable()->constrained('users');
            $table->foreignUuid('approved_by')->nullable()->constrained('users');
            $table->timestamp('published_at')->nullable();
            $table->timestamp('last_reviewed_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            
            // Analytics & Engagement
            $table->integer('view_count')->default(0);
            $table->integer('helpful_count')->default(0);
            $table->integer('not_helpful_count')->default(0);
            $table->integer('share_count')->default(0);
            $table->integer('comment_count')->default(0);
            $table->integer('search_hit_count')->default(0);
            $table->integer('ai_usage_count')->default(0);
            
            // AI & Search Enhancement
            $table->json('embeddings_data')->default('{}');
            $table->json('embeddings_vector')->default('{}');
            $table->text('search_vector')->nullable();
            $table->boolean('ai_generated')->default(false);
            $table->decimal('ai_confidence_score', 3, 2)->nullable();
            $table->timestamp('ai_last_processed_at')->nullable();
            
            // Version Control & History
            $table->integer('version')->default(1);
            $table->foreignUuid('previous_version_id')->nullable()->constrained('knowledge_base_items');
            $table->boolean('is_latest_version')->default(true);
            $table->text('change_summary')->nullable();
            
            // Performance & Quality Metrics
            $table->decimal('quality_score', 3, 2)->nullable();
            $table->decimal('effectiveness_score', 3, 2)->nullable();
            $table->timestamp('last_effectiveness_update')->nullable();
            
            // System fields
            $table->json('metadata')->default('{}');
            $table->json('configuration')->default('{}');
            $table->enum('status', ['active', 'inactive', 'suspended', 'deleted', 'pending', 'draft', 'published', 'archived'])->default('draft');
            $table->timestamps();
            
            $table->unique(['organization_id', 'slug']);
            $table->check('content_type IN (\'article\', \'qa_collection\', \'faq\', \'guide\', \'tutorial\')');
            $table->check('priority IN (\'low\', \'medium\', \'high\', \'critical\')');
            $table->check('workflow_status IN (\'draft\', \'review\', \'approved\', \'published\', \'archived\')');
            $table->check('approval_status IN (\'pending\', \'approved\', \'rejected\', \'auto_approved\')');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('knowledge_base_items');
    }
};
