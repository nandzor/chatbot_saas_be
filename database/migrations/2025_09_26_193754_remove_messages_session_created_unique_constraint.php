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
        // Drop the problematic unique constraint using raw SQL to ensure it works
        DB::statement('ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_session_created_unique');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            // Re-add the unique constraint if needed to rollback
            $table->unique(['session_id', 'created_at'], 'messages_session_created_unique');
        });
    }
};
