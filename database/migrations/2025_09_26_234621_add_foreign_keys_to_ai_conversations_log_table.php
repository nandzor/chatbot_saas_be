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
                // Add foreign key constraint for session_id
                $table->foreign('session_id')->references('id')->on('chat_sessions')->onDelete('set null');

                // Add foreign key constraint for message_id
                $table->foreign('message_id')->references('id')->on('messages')->onDelete('set null');
            });
        }
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
