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
        Schema::table('bot_personalities', function (Blueprint $table) {
            // Add n8n_workflow_id field with foreign key constraint
            $table->foreignUuid('n8n_workflow_id')->nullable()->constrained('n8n_workflows')->onDelete('set null');

            // Add waha_session_id field (UUID) with foreign key constraint
            $table->foreignUuid('waha_session_id')->nullable()->constrained('waha_sessions')->onDelete('set null');

            // Add knowledge_base_item_id field (UUID) with foreign key constraint
            $table->foreignUuid('knowledge_base_item_id')->nullable()->constrained('knowledge_base_items')->onDelete('set null');

            // Add index for better performance
            $table->index('n8n_workflow_id', 'bot_personalities_n8n_workflow_id_index');
            $table->index('waha_session_id', 'bot_personalities_waha_session_id_index');
            $table->index('knowledge_base_item_id', 'bot_personalities_knowledge_base_item_id_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bot_personalities', function (Blueprint $table) {
            // Drop indexes first
            $table->dropIndex(['n8n_workflow_id']);
            $table->dropIndex(['waha_session_id']);
            $table->dropIndex(['knowledge_base_item_id']);

            // Drop foreign key constraints
            $table->dropForeign(['n8n_workflow_id']);
            $table->dropForeign(['waha_session_id']);
            $table->dropForeign(['knowledge_base_item_id']);

            // Drop columns
            $table->dropColumn(['n8n_workflow_id', 'waha_session_id', 'knowledge_base_item_id']);
        });
    }
};
