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
        // Change organization_analytics id to uuid
        Schema::table('organization_analytics', function (Blueprint $table) {
            $table->dropPrimary(['id']);
            $table->uuid('id')->primary()->change();
        });

        // Change organization_audit_logs id to uuid
        Schema::table('organization_audit_logs', function (Blueprint $table) {
            $table->dropPrimary(['id']);
            $table->uuid('id')->primary()->change();
        });

        // Change organization_permissions id to uuid
        Schema::table('organization_permissions', function (Blueprint $table) {
            $table->dropPrimary(['id']);
            $table->uuid('id')->primary()->change();
        });

        // Change organization_role_permissions id to uuid
        Schema::table('organization_role_permissions', function (Blueprint $table) {
            $table->dropPrimary(['id']);
            $table->uuid('id')->primary()->change();
        });

        // Change organization_roles id to uuid
        Schema::table('organization_roles', function (Blueprint $table) {
            $table->dropPrimary(['id']);
            $table->uuid('id')->primary()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert organization_analytics id to bigserial
        Schema::table('organization_analytics', function (Blueprint $table) {
            $table->dropPrimary(['id']);
            $table->bigIncrements('id')->change();
        });

        // Revert organization_audit_logs id to bigserial
        Schema::table('organization_audit_logs', function (Blueprint $table) {
            $table->dropPrimary(['id']);
            $table->bigIncrements('id')->change();
        });

        // Revert organization_permissions id to bigserial
        Schema::table('organization_permissions', function (Blueprint $table) {
            $table->dropPrimary(['id']);
            $table->bigIncrements('id')->change();
        });

        // Revert organization_role_permissions id to bigserial
        Schema::table('organization_role_permissions', function (Blueprint $table) {
            $table->dropPrimary(['id']);
            $table->bigIncrements('id')->change();
        });

        // Revert organization_roles id to bigserial
        Schema::table('organization_roles', function (Blueprint $table) {
            $table->dropPrimary(['id']);
            $table->bigIncrements('id')->change();
        });
    }
};
