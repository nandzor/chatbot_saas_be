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
        // Drop the incorrect single slug unique constraint
        // The correct constraint is the composite one: organization_id + slug
        // This constraint causes duplicate key violations when seeding
        Schema::table('organization_roles', function (Blueprint $table) {
            $table->dropUnique(['slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Re-add the single slug unique constraint if needed
        Schema::table('organization_roles', function (Blueprint $table) {
            $table->unique('slug');
        });
    }
};
