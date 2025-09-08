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
        Schema::table('knowledge_base_item_tags', function (Blueprint $table) {
            // Composite indexes for efficient tag queries
            $table->index(['knowledge_item_id', 'tag_id'], 'idx_kb_item_tags_item_tag');
            $table->index(['tag_id', 'knowledge_item_id'], 'idx_kb_item_tags_tag_item');

            // Index for auto-assigned tags filtering
            $table->index(['knowledge_item_id', 'is_auto_assigned'], 'idx_kb_item_tags_auto_assigned');
            $table->index(['tag_id', 'is_auto_assigned'], 'idx_kb_item_tags_tag_auto_assigned');

            // Index for confidence score queries
            $table->index(['knowledge_item_id', 'confidence_score'], 'idx_kb_item_tags_confidence');
            $table->index(['tag_id', 'confidence_score'], 'idx_kb_item_tags_tag_confidence');

            // Index for assigned_by queries
            $table->index(['knowledge_item_id', 'assigned_by'], 'idx_kb_item_tags_assigned_by');
            $table->index(['tag_id', 'assigned_by'], 'idx_kb_item_tags_tag_assigned_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('knowledge_base_item_tags', function (Blueprint $table) {
            $table->dropIndex('idx_kb_item_tags_item_tag');
            $table->dropIndex('idx_kb_item_tags_tag_item');
            $table->dropIndex('idx_kb_item_tags_auto_assigned');
            $table->dropIndex('idx_kb_item_tags_tag_auto_assigned');
            $table->dropIndex('idx_kb_item_tags_confidence');
            $table->dropIndex('idx_kb_item_tags_tag_confidence');
            $table->dropIndex('idx_kb_item_tags_assigned_by');
            $table->dropIndex('idx_kb_item_tags_tag_assigned_by');
        });
    }
};
