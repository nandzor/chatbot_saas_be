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
        // The constraint 'organization_permissions_slug_unique' does not exist
        // No action needed
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No action needed as this migration doesn't do anything
        // The constraint never existed in the first place
    }
};
