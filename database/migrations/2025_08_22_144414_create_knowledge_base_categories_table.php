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
        Schema::create('knowledge_base_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('parent_id')->nullable()->constrained('knowledge_base_categories')->onDelete('cascade');
            
            // Basic Information
            $table->string('name', 255);
            $table->string('slug', 255);
            $table->text('description')->nullable();
            $table->string('icon', 100)->nullable();
            $table->string('color', 7)->nullable();
            $table->integer('order_index')->default(0);
            
            // Visibility & Access
            $table->boolean('is_public')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_system_category')->default(false);
            
            // Content Type Support
            $table->boolean('supports_articles')->default(true);
            $table->boolean('supports_qa')->default(true);
            $table->boolean('supports_faq')->default(true);
            
            // SEO & Frontend
            $table->string('meta_title', 255)->nullable();
            $table->text('meta_description')->nullable();
            $table->json('meta_keywords')->nullable();
            
            // Statistics & Analytics
            $table->integer('total_content_count')->default(0);
            $table->integer('article_count')->default(0);
            $table->integer('qa_count')->default(0);
            $table->integer('view_count')->default(0);
            $table->integer('search_count')->default(0);
            
            // AI Training & Processing
            $table->boolean('is_ai_trainable')->default(true);
            $table->json('ai_category_embeddings')->default('{}');
            $table->integer('ai_processing_priority')->default(5);
            
            // Configuration
            $table->boolean('auto_categorize')->default(false);
            $table->json('category_rules')->default('{}');
            
            // System fields
            $table->json('metadata')->default('{}');
            $table->enum('status', ['active', 'inactive', 'suspended', 'deleted', 'pending', 'draft', 'published', 'archived'])->default('active');
            $table->timestamps();
            
            $table->unique(['organization_id', 'slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('knowledge_base_categories');
    }
};
