<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // User, Role, Permission, and Organization Management
            UserRolePermissionManagementSeeder::class,

            // Other seeders
            ChatbotSaasSeeder::class,
        ]);
    }
}
