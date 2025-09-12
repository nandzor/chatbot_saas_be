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
        // Drop foreign key constraints first
        DB::statement('ALTER TABLE organization_role_permissions DROP CONSTRAINT IF EXISTS organization_role_permissions_role_id_foreign');
        DB::statement('ALTER TABLE organization_role_permissions DROP CONSTRAINT IF EXISTS organization_role_permissions_permission_id_foreign');

        // Drop primary keys
        DB::statement('ALTER TABLE organization_permissions DROP CONSTRAINT IF EXISTS organization_permissions_pkey');
        DB::statement('ALTER TABLE organization_roles DROP CONSTRAINT IF EXISTS organization_roles_pkey');
        DB::statement('ALTER TABLE organization_role_permissions DROP CONSTRAINT IF EXISTS organization_role_permissions_pkey');
        DB::statement('ALTER TABLE organization_analytics DROP CONSTRAINT IF EXISTS organization_analytics_pkey');
        DB::statement('ALTER TABLE organization_audit_logs DROP CONSTRAINT IF EXISTS organization_audit_logs_pkey');

        // Change id columns to UUID
        DB::statement('ALTER TABLE organization_permissions ALTER COLUMN id SET DATA TYPE UUID USING gen_random_uuid()');
        DB::statement('ALTER TABLE organization_roles ALTER COLUMN id SET DATA TYPE UUID USING gen_random_uuid()');
        DB::statement('ALTER TABLE organization_role_permissions ALTER COLUMN id SET DATA TYPE UUID USING gen_random_uuid()');
        DB::statement('ALTER TABLE organization_analytics ALTER COLUMN id SET DATA TYPE UUID USING gen_random_uuid()');
        DB::statement('ALTER TABLE organization_audit_logs ALTER COLUMN id SET DATA TYPE UUID USING gen_random_uuid()');

        // Add primary keys back
        DB::statement('ALTER TABLE organization_permissions ADD PRIMARY KEY (id)');
        DB::statement('ALTER TABLE organization_roles ADD PRIMARY KEY (id)');
        DB::statement('ALTER TABLE organization_role_permissions ADD PRIMARY KEY (id)');
        DB::statement('ALTER TABLE organization_analytics ADD PRIMARY KEY (id)');
        DB::statement('ALTER TABLE organization_audit_logs ADD PRIMARY KEY (id)');

        // Update foreign key columns to UUID
        DB::statement('ALTER TABLE organization_role_permissions ALTER COLUMN role_id SET DATA TYPE UUID');
        DB::statement('ALTER TABLE organization_role_permissions ALTER COLUMN permission_id SET DATA TYPE UUID');

        // Add foreign key constraints back
        DB::statement('ALTER TABLE organization_role_permissions ADD CONSTRAINT organization_role_permissions_role_id_foreign FOREIGN KEY (role_id) REFERENCES organization_roles(id) ON DELETE CASCADE');
        DB::statement('ALTER TABLE organization_role_permissions ADD CONSTRAINT organization_role_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES organization_permissions(id) ON DELETE CASCADE');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This is complex to reverse, so we'll leave it as is
        // In production, you'd want to create a proper rollback
    }
};
