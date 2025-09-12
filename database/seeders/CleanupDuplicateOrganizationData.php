<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CleanupDuplicateOrganizationData extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Starting cleanup of duplicate organization data...');

        $this->cleanupDuplicatePermissions();
        $this->cleanupDuplicateRoles();
        $this->cleanupDuplicateAnalytics();
        $this->cleanupDuplicateRolePermissions();

        $this->command->info('Cleanup completed successfully!');
    }

    /**
     * Clean up duplicate permissions
     */
    private function cleanupDuplicatePermissions(): void
    {
        $this->command->info('Cleaning up duplicate permissions...');

        // Find and remove duplicate permissions (keep the oldest one)
        $duplicates = DB::select("
            SELECT organization_id, slug, MIN(id) as keep_id, COUNT(*) as count
            FROM organization_permissions
            GROUP BY organization_id, slug
            HAVING COUNT(*) > 1
        ");

        $deletedCount = 0;
        foreach ($duplicates as $duplicate) {
            $deleted = DB::table('organization_permissions')
                ->where('organization_id', $duplicate->organization_id)
                ->where('slug', $duplicate->slug)
                ->where('id', '!=', $duplicate->keep_id)
                ->delete();

            $deletedCount += $deleted;
        }

        $this->command->info("Removed {$deletedCount} duplicate permissions");
    }

    /**
     * Clean up duplicate roles
     */
    private function cleanupDuplicateRoles(): void
    {
        $this->command->info('Cleaning up duplicate roles...');

        // Find and remove duplicate roles (keep the oldest one)
        $duplicates = DB::select("
            SELECT organization_id, slug, MIN(id) as keep_id, COUNT(*) as count
            FROM organization_roles
            GROUP BY organization_id, slug
            HAVING COUNT(*) > 1
        ");

        $deletedCount = 0;
        foreach ($duplicates as $duplicate) {
            $deleted = DB::table('organization_roles')
                ->where('organization_id', $duplicate->organization_id)
                ->where('slug', $duplicate->slug)
                ->where('id', '!=', $duplicate->keep_id)
                ->delete();

            $deletedCount += $deleted;
        }

        $this->command->info("Removed {$deletedCount} duplicate roles");
    }

    /**
     * Clean up duplicate analytics data
     */
    private function cleanupDuplicateAnalytics(): void
    {
        $this->command->info('Cleaning up duplicate analytics data...');

        // Find and remove duplicate analytics (keep the oldest one)
        $duplicates = DB::select("
            SELECT organization_id, date, MIN(id) as keep_id, COUNT(*) as count
            FROM organization_analytics
            GROUP BY organization_id, date
            HAVING COUNT(*) > 1
        ");

        $deletedCount = 0;
        foreach ($duplicates as $duplicate) {
            $deleted = DB::table('organization_analytics')
                ->where('organization_id', $duplicate->organization_id)
                ->where('date', $duplicate->date)
                ->where('id', '!=', $duplicate->keep_id)
                ->delete();

            $deletedCount += $deleted;
        }

        $this->command->info("Removed {$deletedCount} duplicate analytics records");
    }

    /**
     * Clean up duplicate role-permission relationships
     */
    private function cleanupDuplicateRolePermissions(): void
    {
        $this->command->info('Cleaning up duplicate role-permission relationships...');

        // Find and remove duplicate role-permission relationships
        $duplicates = DB::select("
            SELECT role_id, permission_id, MIN(id) as keep_id, COUNT(*) as count
            FROM organization_role_permissions
            GROUP BY role_id, permission_id
            HAVING COUNT(*) > 1
        ");

        $deletedCount = 0;
        foreach ($duplicates as $duplicate) {
            $deleted = DB::table('organization_role_permissions')
                ->where('role_id', $duplicate->role_id)
                ->where('permission_id', $duplicate->permission_id)
                ->where('id', '!=', $duplicate->keep_id)
                ->delete();

            $deletedCount += $deleted;
        }

        $this->command->info("Removed {$deletedCount} duplicate role-permission relationships");
    }

    /**
     * Show statistics of organization data
     */
    private function showStatistics(): void
    {
        $this->command->info('Organization Data Statistics:');

        $permissionsCount = DB::table('organization_permissions')->count();
        $rolesCount = DB::table('organization_roles')->count();
        $rolePermissionsCount = DB::table('organization_role_permissions')->count();
        $analyticsCount = DB::table('organization_analytics')->count();
        $auditLogsCount = DB::table('organization_audit_logs')->count();

        $this->command->info("- Permissions: {$permissionsCount}");
        $this->command->info("- Roles: {$rolesCount}");
        $this->command->info("- Role-Permission Relationships: {$rolePermissionsCount}");
        $this->command->info("- Analytics Records: {$analyticsCount}");
        $this->command->info("- Audit Logs: {$auditLogsCount}");
    }
}
