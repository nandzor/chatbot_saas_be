<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class UserRolePermissionManagementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call([
            // Step 1: Create subscription plans first (required for organizations)
            SubscriptionPlanSeeder::class,

            // Step 2: Create organizations
            OrganizationSeeder::class,

            // Step 3: Create permissions (both system and organization-specific)
            PermissionSeeder::class,

            // Step 4: Create roles (both system and organization-specific)
            RoleSeeder::class,

            // Step 5: Create users (both system and organization-specific)
            UserSeeder::class,

            // Step 6: Assign permissions to roles
            RolePermissionSeeder::class,

            // Step 7: Assign roles to users
            UserRoleSeeder::class,
        ]);
    }
}
