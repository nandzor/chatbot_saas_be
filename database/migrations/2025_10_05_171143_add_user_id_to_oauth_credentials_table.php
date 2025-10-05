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
        Schema::table('oauth_credentials', function (Blueprint $table) {
            $table->uuid('user_id')->nullable()->after('organization_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['user_id']);

            // Update unique constraint to include user_id
            $table->dropUnique(['organization_id', 'service']);
            $table->unique(['organization_id', 'user_id', 'service']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('oauth_credentials', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropIndex(['user_id']);
            $table->dropUnique(['organization_id', 'user_id', 'service']);
            $table->dropColumn('user_id');

            // Restore original unique constraint
            $table->unique(['organization_id', 'service']);
        });
    }
};
