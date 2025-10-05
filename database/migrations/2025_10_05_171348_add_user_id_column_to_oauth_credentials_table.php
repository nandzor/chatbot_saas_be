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
            // Check if column doesn't exist before adding
            if (!Schema::hasColumn('oauth_credentials', 'user_id')) {
                $table->uuid('user_id')->nullable()->after('organization_id');
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
                $table->index(['user_id']);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('oauth_credentials', function (Blueprint $table) {
            if (Schema::hasColumn('oauth_credentials', 'user_id')) {
                $table->dropForeign(['user_id']);
                $table->dropIndex(['user_id']);
                $table->dropColumn('user_id');
            }
        });
    }
};
