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
        // This migration is not needed as the original table creation
        // only has a composite unique constraint on ['organization_id', 'slug']
        // not a single unique constraint on 'slug' alone
        // The constraint on ['slug'] does not exist
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
