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
            // Drop the existing foreign key constraint with cascade delete
            $table->dropForeign(['n8n_workflow_id']);

            // Re-add the foreign key constraint without cascade delete
            $table->foreign('n8n_workflow_id')
                ->references('id')
                ->on('n8n_workflows')
                ->onDelete('set null'); // Set to null instead of cascade
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('waha_sessions', function (Blueprint $table) {
            // Drop the foreign key constraint
            $table->dropForeign(['n8n_workflow_id']);

            // Re-add the foreign key constraint with cascade delete
            $table->foreign('n8n_workflow_id')
                ->references('id')
                ->on('n8n_workflows')
                ->onDelete('cascade');
        });
    }
};
