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
        Schema::table('waha_sessions', function (Blueprint $table) {
            // Add foreign key to n8n_workflows table
            $table->foreignUuid('n8n_workflow_id')->nullable()->after('organization_id')
                ->constrained('n8n_workflows', 'id')->onDelete('cascade');

            // Add index for better performance
            $table->index('n8n_workflow_id', 'waha_sessions_n8n_workflow_id_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('waha_sessions', function (Blueprint $table) {
            // Drop foreign key constraint first
            $table->dropForeign(['n8n_workflow_id']);

            // Drop index
            $table->dropIndex('waha_sessions_n8n_workflow_id_index');

            // Drop column
            $table->dropColumn('n8n_workflow_id');
        });
    }
};
