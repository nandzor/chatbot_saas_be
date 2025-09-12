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
        Schema::table('organization_permissions', function (Blueprint $table) {
            // Drop the global unique constraint on slug
            $table->dropUnique(['slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('organization_permissions', function (Blueprint $table) {
            // Re-add the global unique constraint on slug
            $table->unique('slug');
        });
    }
};
