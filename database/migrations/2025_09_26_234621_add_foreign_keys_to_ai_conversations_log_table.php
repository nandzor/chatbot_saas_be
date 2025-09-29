<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add foreign key constraints only if the referenced tables exist
        if (Schema::hasTable('chat_sessions') && Schema::hasTable('messages')) {
            Schema::table('ai_conversations_log', function (Blueprint $table) {
                // Check if foreign key constraints don't already exist before adding them
                if (!$this->foreignKeyExists('ai_conversations_log', 'session_id')) {
                    $table->foreign('session_id')->references('id')->on('chat_sessions')->onDelete('set null');
                }

                if (!$this->foreignKeyExists('ai_conversations_log', 'message_id')) {
                    $table->foreign('message_id')->references('id')->on('messages')->onDelete('set null');
                }
            });
        }
    }

    /**
     * Check if a foreign key constraint exists
     */
    private function foreignKeyExists($table, $column)
    {
        $constraints = DB::select("
            SELECT constraint_name
            FROM information_schema.table_constraints
            WHERE table_name = ?
            AND constraint_type = 'FOREIGN KEY'
            AND constraint_name LIKE ?",
            [$table, "%{$column}_foreign"]
        );

        return count($constraints) > 0;
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ai_conversations_log', function (Blueprint $table) {
            $table->dropForeign(['session_id']);
            $table->dropForeign(['message_id']);
        });
    }
};
