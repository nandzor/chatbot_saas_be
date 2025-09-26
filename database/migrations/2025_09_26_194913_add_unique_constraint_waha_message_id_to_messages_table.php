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
        Schema::table('messages', function (Blueprint $table) {
            // Add unique constraint on waha_message_id + organization_id to prevent duplicate messages
            $table->unique(['organization_id', 'metadata->waha_message_id'], 'messages_org_waha_message_id_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            // Drop the unique constraint
            $table->dropUnique('messages_org_waha_message_id_unique');
        });
    }
};
