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

            // Authentication Test Data (for development)
            AuthTestDataSeeder::class,

            // Other seeders
            ChatbotSaasSeeder::class,

            // Knowledge Base Seeder
            KnowledgeBaseSeeder::class,

            // Payment Transaction Seeder
            PaymentTransactionSeeder::class,

            // Subscription Seeder
            SubscriptionSeeder::class,
        ]);
    }
}
