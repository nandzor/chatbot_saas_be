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
        Schema::table('knowledge_base_items', function (Blueprint $table) {
            // Composite indexes for common query patterns
            $table->index(['organization_id', 'status', 'created_at'], 'idx_kb_org_status_created');
            $table->index(['organization_id', 'workflow_status', 'created_at'], 'idx_kb_org_workflow_created');
            $table->index(['organization_id', 'approval_status', 'created_at'], 'idx_kb_org_approval_created');
            $table->index(['organization_id', 'category_id', 'created_at'], 'idx_kb_org_category_created');
            $table->index(['organization_id', 'author_id', 'created_at'], 'idx_kb_org_author_created');

            // Indexes for filtering and sorting
            $table->index(['organization_id', 'is_public', 'is_featured'], 'idx_kb_org_public_featured');
            $table->index(['organization_id', 'content_type', 'created_at'], 'idx_kb_org_content_type_created');
            $table->index(['organization_id', 'language', 'created_at'], 'idx_kb_org_language_created');
            $table->index(['organization_id', 'priority', 'created_at'], 'idx_kb_org_priority_created');

            // Indexes for search and performance
            $table->index(['organization_id', 'is_searchable', 'created_at'], 'idx_kb_org_searchable_created');
            $table->index(['organization_id', 'is_ai_trainable', 'created_at'], 'idx_kb_org_ai_trainable_created');
            $table->index(['organization_id', 'is_latest_version', 'created_at'], 'idx_kb_org_latest_version_created');

            // Indexes for analytics and metrics
            $table->index(['organization_id', 'view_count'], 'idx_kb_org_view_count');
            $table->index(['organization_id', 'quality_score'], 'idx_kb_org_quality_score');
            $table->index(['organization_id', 'effectiveness_score'], 'idx_kb_org_effectiveness_score');

            // Indexes for date-based queries
            $table->index(['organization_id', 'published_at'], 'idx_kb_org_published_at');
            $table->index(['organization_id', 'last_reviewed_at'], 'idx_kb_org_last_reviewed_at');
            $table->index(['organization_id', 'approved_at'], 'idx_kb_org_approved_at');

            // Full-text search index (if supported by database)
            if (DB::getDriverName() === 'mysql') {
                $table->fullText(['title', 'description', 'content'], 'idx_kb_fulltext_search');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('knowledge_base_items', function (Blueprint $table) {
            // Drop composite indexes
            $table->dropIndex('idx_kb_org_status_created');
            $table->dropIndex('idx_kb_org_workflow_created');
            $table->dropIndex('idx_kb_org_approval_created');
            $table->dropIndex('idx_kb_org_category_created');
            $table->dropIndex('idx_kb_org_author_created');
            $table->dropIndex('idx_kb_org_public_featured');
            $table->dropIndex('idx_kb_org_content_type_created');
            $table->dropIndex('idx_kb_org_language_created');
            $table->dropIndex('idx_kb_org_priority_created');
            $table->dropIndex('idx_kb_org_searchable_created');
            $table->dropIndex('idx_kb_org_ai_trainable_created');
            $table->dropIndex('idx_kb_org_latest_version_created');
            $table->dropIndex('idx_kb_org_view_count');
            $table->dropIndex('idx_kb_org_quality_score');
            $table->dropIndex('idx_kb_org_effectiveness_score');
            $table->dropIndex('idx_kb_org_published_at');
            $table->dropIndex('idx_kb_org_last_reviewed_at');
            $table->dropIndex('idx_kb_org_approved_at');

            // Drop full-text index
            if (DB::getDriverName() === 'mysql') {
                $table->dropFullText('idx_kb_fulltext_search');
            }
        });
    }
};
