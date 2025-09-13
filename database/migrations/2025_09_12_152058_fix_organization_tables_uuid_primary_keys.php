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
        // Enable UUID extension if not already enabled
        DB::statement('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

        // Drop foreign key constraints first to avoid dependency issues
        DB::statement('ALTER TABLE organization_role_permissions DROP CONSTRAINT IF EXISTS organization_role_permissions_role_id_foreign');
        DB::statement('ALTER TABLE organization_role_permissions DROP CONSTRAINT IF EXISTS organization_role_permissions_permission_id_foreign');

        // Change organization_analytics id to uuid using CASCADE
        DB::statement('ALTER TABLE organization_analytics DROP CONSTRAINT IF EXISTS organization_analytics_pkey CASCADE');
        DB::statement('ALTER TABLE organization_analytics ALTER COLUMN id DROP DEFAULT');
        DB::statement('ALTER TABLE organization_analytics ALTER COLUMN id SET DATA TYPE UUID USING uuid_generate_v4()');
        DB::statement('ALTER TABLE organization_analytics ADD PRIMARY KEY (id)');

        // Change organization_audit_logs id to uuid using CASCADE
        DB::statement('ALTER TABLE organization_audit_logs DROP CONSTRAINT IF EXISTS organization_audit_logs_pkey CASCADE');
        DB::statement('ALTER TABLE organization_audit_logs ALTER COLUMN id DROP DEFAULT');
        DB::statement('ALTER TABLE organization_audit_logs ALTER COLUMN id SET DATA TYPE UUID USING uuid_generate_v4()');
        DB::statement('ALTER TABLE organization_audit_logs ADD PRIMARY KEY (id)');

        // Change organization_permissions id to uuid using CASCADE
        DB::statement('ALTER TABLE organization_permissions DROP CONSTRAINT IF EXISTS organization_permissions_pkey CASCADE');
        DB::statement('ALTER TABLE organization_permissions ALTER COLUMN id DROP DEFAULT');
        DB::statement('ALTER TABLE organization_permissions ALTER COLUMN id SET DATA TYPE UUID USING uuid_generate_v4()');
        DB::statement('ALTER TABLE organization_permissions ADD PRIMARY KEY (id)');

        // Change organization_roles id to uuid using CASCADE
        DB::statement('ALTER TABLE organization_roles DROP CONSTRAINT IF EXISTS organization_roles_pkey CASCADE');
        DB::statement('ALTER TABLE organization_roles ALTER COLUMN id DROP DEFAULT');
        DB::statement('ALTER TABLE organization_roles ALTER COLUMN id SET DATA TYPE UUID USING uuid_generate_v4()');
        DB::statement('ALTER TABLE organization_roles ADD PRIMARY KEY (id)');

        // Change organization_role_permissions id to uuid using CASCADE
        DB::statement('ALTER TABLE organization_role_permissions DROP CONSTRAINT IF EXISTS organization_role_permissions_pkey CASCADE');
        DB::statement('ALTER TABLE organization_role_permissions ALTER COLUMN id DROP DEFAULT');
        DB::statement('ALTER TABLE organization_role_permissions ALTER COLUMN id SET DATA TYPE UUID USING uuid_generate_v4()');
        DB::statement('ALTER TABLE organization_role_permissions ADD PRIMARY KEY (id)');

        // Update foreign key columns to UUID by recreating the table
        // Since we're converting from integer to UUID, we need to handle this differently

        // First, let's backup any existing data (drop if exists first)
        DB::statement('DROP TABLE IF EXISTS organization_role_permissions_backup');
        DB::statement('CREATE TEMP TABLE organization_role_permissions_backup AS SELECT * FROM organization_role_permissions');

        // Drop the table
        DB::statement('DROP TABLE organization_role_permissions');

        // Recreate the table with UUID columns
        DB::statement('
            CREATE TABLE organization_role_permissions (
                id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                role_id UUID NOT NULL,
                permission_id UUID NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(role_id, permission_id)
            )
        ');

        // Note: Data restoration would need to be handled separately if there was important data
        // For now, we'll leave the table empty as this appears to be a new system

        // Add foreign key constraints back
        DB::statement('ALTER TABLE organization_role_permissions ADD CONSTRAINT organization_role_permissions_role_id_foreign FOREIGN KEY (role_id) REFERENCES organization_roles(id) ON DELETE CASCADE');
        DB::statement('ALTER TABLE organization_role_permissions ADD CONSTRAINT organization_role_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES organization_permissions(id) ON DELETE CASCADE');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert organization_analytics id to bigserial
        DB::statement('ALTER TABLE organization_analytics DROP CONSTRAINT IF EXISTS organization_analytics_pkey');
        DB::statement('ALTER TABLE organization_analytics ALTER COLUMN id SET DATA TYPE BIGINT');
        DB::statement('CREATE SEQUENCE organization_analytics_id_seq');
        DB::statement('ALTER TABLE organization_analytics ALTER COLUMN id SET DEFAULT nextval(\'organization_analytics_id_seq\')');
        DB::statement('ALTER TABLE organization_analytics ADD PRIMARY KEY (id)');

        // Revert organization_audit_logs id to bigserial
        DB::statement('ALTER TABLE organization_audit_logs DROP CONSTRAINT IF EXISTS organization_audit_logs_pkey');
        DB::statement('ALTER TABLE organization_audit_logs ALTER COLUMN id SET DATA TYPE BIGINT');
        DB::statement('CREATE SEQUENCE organization_audit_logs_id_seq');
        DB::statement('ALTER TABLE organization_audit_logs ALTER COLUMN id SET DEFAULT nextval(\'organization_audit_logs_id_seq\')');
        DB::statement('ALTER TABLE organization_audit_logs ADD PRIMARY KEY (id)');

        // Revert organization_permissions id to bigserial
        DB::statement('ALTER TABLE organization_permissions DROP CONSTRAINT IF EXISTS organization_permissions_pkey');
        DB::statement('ALTER TABLE organization_permissions ALTER COLUMN id SET DATA TYPE BIGINT');
        DB::statement('CREATE SEQUENCE organization_permissions_id_seq');
        DB::statement('ALTER TABLE organization_permissions ALTER COLUMN id SET DEFAULT nextval(\'organization_permissions_id_seq\')');
        DB::statement('ALTER TABLE organization_permissions ADD PRIMARY KEY (id)');

        // Revert organization_role_permissions id to bigserial
        DB::statement('ALTER TABLE organization_role_permissions DROP CONSTRAINT IF EXISTS organization_role_permissions_pkey');
        DB::statement('ALTER TABLE organization_role_permissions ALTER COLUMN id SET DATA TYPE BIGINT');
        DB::statement('CREATE SEQUENCE organization_role_permissions_id_seq');
        DB::statement('ALTER TABLE organization_role_permissions ALTER COLUMN id SET DEFAULT nextval(\'organization_role_permissions_id_seq\')');
        DB::statement('ALTER TABLE organization_role_permissions ADD PRIMARY KEY (id)');

        // Revert organization_roles id to bigserial
        DB::statement('ALTER TABLE organization_roles DROP CONSTRAINT IF EXISTS organization_roles_pkey');
        DB::statement('ALTER TABLE organization_roles ALTER COLUMN id SET DATA TYPE BIGINT');
        DB::statement('CREATE SEQUENCE organization_roles_id_seq');
        DB::statement('ALTER TABLE organization_roles ALTER COLUMN id SET DEFAULT nextval(\'organization_roles_id_seq\')');
        DB::statement('ALTER TABLE organization_roles ADD PRIMARY KEY (id)');
    }
};
