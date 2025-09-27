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
        // Add foreign key constraint only if the referenced table exists
        if (Schema::hasTable('chat_sessions')) {
            Schema::table('messages', function (Blueprint $table) {
                $table->foreign('session_id')->references('id')->on('chat_sessions')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropForeign(['session_id']);
        });
    }
};
