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
        Schema::create('knowledge_articles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('organization_id');
            $table->uuid('category_id');
            $table->string('title', 500);
            $table->string('slug', 500);
            $table->text('content');
            $table->text('summary')->nullable();
            $table->text('excerpt')->nullable();

            // Q&A Enhancement
            $table->enum('article_type', ['article', 'qa', 'faq'])->default('article');
            $table->text('question')->nullable();
            $table->text('answer')->nullable();
            $table->json('keywords')->nullable();
            $table->json('related_questions')->nullable();

            // Content Management
            $table->json('tags')->nullable();
            $table->enum('language', ['indonesia', 'english', 'javanese', 'sundanese', 'balinese', 'minang', 'chinese', 'japanese', 'korean', 'spanish', 'french', 'german', 'arabic', 'thai', 'vietnamese'])->default('indonesia');
            $table->enum('difficulty_level', ['basic', 'intermediate', 'advanced', 'expert'])->default('basic');
            $table->integer('estimated_read_time')->nullable();

            // SEO & Frontend
            $table->string('meta_title', 255)->nullable();
            $table->text('meta_description')->nullable();
            $table->string('featured_image_url', 500)->nullable();

            // Analytics & Engagement
            $table->integer('view_count')->default(0);
            $table->integer('helpful_count')->default(0);
            $table->integer('not_helpful_count')->default(0);
            $table->integer('share_count')->default(0);
            $table->integer('comment_count')->default(0);

            // Publishing & Visibility
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_public')->default(true);
            $table->boolean('is_searchable')->default(true);
            $table->boolean('is_ai_trainable')->default(true);

            // Author & Editorial
            $table->uuid('author_id')->nullable();
            $table->uuid('reviewer_id')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamp('last_reviewed_at')->nullable();

            // AI & Search Enhancement
            $table->json('embeddings_data')->default('{}');
            $table->json('embeddings_vector')->default('{}');
            $table->text('search_vector')->nullable(); // Will be handled by PostgreSQL tsvector
            $table->boolean('ai_generated')->default(false);
            $table->decimal('confidence_score', 3, 2)->nullable();

            // Version Control
            $table->integer('version')->default(1);
            $table->uuid('previous_version_id')->nullable();

            // System fields
            $table->json('metadata')->default('{}');
            $table->enum('status', ['active', 'inactive', 'suspended', 'deleted', 'pending', 'draft'])->default('draft');
            $table->timestamps();

            // Foreign keys
            $table->foreign('organization_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->foreign('category_id')->references('id')->on('knowledge_categories')->onDelete('cascade');
            $table->foreign('author_id')->references('id')->on('enhanced_users');
            $table->foreign('reviewer_id')->references('id')->on('enhanced_users');
            $table->foreign('previous_version_id')->references('id')->on('knowledge_articles');

            // Unique constraint
            $table->unique(['organization_id', 'slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('knowledge_articles');
    }
};

