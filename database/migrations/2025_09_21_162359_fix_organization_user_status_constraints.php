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
        // Fix organizations status constraint
        DB::statement('ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_status_check');
        DB::statement("ALTER TABLE organizations ADD CONSTRAINT organizations_status_check CHECK (status IN ('active', 'inactive', 'suspended', 'deleted', 'pending', 'draft', 'published', 'archived', 'pending_approval'))");

        // Fix users status constraint
        DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check');
        DB::statement("ALTER TABLE users ADD CONSTRAINT users_status_check CHECK (status IN ('active', 'inactive', 'suspended', 'deleted', 'pending', 'draft', 'published', 'archived', 'pending_verification'))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restore original constraints
        DB::statement('ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_status_check');
        DB::statement("ALTER TABLE organizations ADD CONSTRAINT organizations_status_check CHECK (status IN ('active', 'inactive', 'suspended', 'deleted', 'pending', 'draft', 'published', 'archived'))");

        DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check');
        DB::statement("ALTER TABLE users ADD CONSTRAINT users_status_check CHECK (status IN ('active', 'inactive', 'suspended', 'deleted', 'pending', 'draft', 'published', 'archived'))");
    }
};
