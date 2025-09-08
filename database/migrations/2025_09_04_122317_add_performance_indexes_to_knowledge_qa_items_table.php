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
        Schema::table('knowledge_qa_items', function (Blueprint $table) {
            // Composite indexes for efficient QA queries
            $table->index(['knowledge_item_id', 'is_active'], 'idx_kb_qa_items_active');
            $table->index(['knowledge_item_id', 'is_primary'], 'idx_kb_qa_items_primary');
            $table->index(['knowledge_item_id', 'order_index'], 'idx_kb_qa_items_order');

            // Indexes for organization-based queries
            $table->index(['organization_id', 'is_active', 'created_at'], 'idx_kb_qa_org_active_created');
            $table->index(['organization_id', 'is_primary', 'created_at'], 'idx_kb_qa_org_primary_created');

            // Indexes for usage and performance metrics
            $table->index(['knowledge_item_id', 'usage_count'], 'idx_kb_qa_items_usage');
            $table->index(['knowledge_item_id', 'success_rate'], 'idx_kb_qa_items_success');
            $table->index(['knowledge_item_id', 'user_satisfaction'], 'idx_kb_qa_items_satisfaction');

            // Indexes for AI-related queries
            $table->index(['knowledge_item_id', 'ai_confidence'], 'idx_kb_qa_items_ai_confidence');
            $table->index(['organization_id', 'ai_confidence'], 'idx_kb_qa_org_ai_confidence');

            // Indexes for date-based queries
            $table->index(['knowledge_item_id', 'last_used_at'], 'idx_kb_qa_items_last_used');
            $table->index(['knowledge_item_id', 'ai_last_trained_at'], 'idx_kb_qa_items_ai_trained');

            // Full-text search index for questions and answers
            if (DB::getDriverName() === 'mysql') {
                $table->fullText(['question', 'answer'], 'idx_kb_qa_fulltext_search');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('knowledge_qa_items', function (Blueprint $table) {
            $table->dropIndex('idx_kb_qa_items_active');
            $table->dropIndex('idx_kb_qa_items_primary');
            $table->dropIndex('idx_kb_qa_items_order');
            $table->dropIndex('idx_kb_qa_org_active_created');
            $table->dropIndex('idx_kb_qa_org_primary_created');
            $table->dropIndex('idx_kb_qa_items_usage');
            $table->dropIndex('idx_kb_qa_items_success');
            $table->dropIndex('idx_kb_qa_items_satisfaction');
            $table->dropIndex('idx_kb_qa_items_ai_confidence');
            $table->dropIndex('idx_kb_qa_org_ai_confidence');
            $table->dropIndex('idx_kb_qa_items_last_used');
            $table->dropIndex('idx_kb_qa_items_ai_trained');

            // Drop full-text index
            if (DB::getDriverName() === 'mysql') {
                $table->dropFullText('idx_kb_qa_fulltext_search');
            }
        });
    }
};
