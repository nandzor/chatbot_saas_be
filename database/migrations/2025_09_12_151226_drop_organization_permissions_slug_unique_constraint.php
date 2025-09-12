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
            // Drop the specific unique constraint by name
            $table->dropUnique('organization_permissions_slug_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('organization_permissions', function (Blueprint $table) {
            // Re-add the unique constraint
            $table->unique('slug', 'organization_permissions_slug_unique');
        });
    }
};
