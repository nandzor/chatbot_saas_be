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

            // AI Model Seeder (required for bot personalities)
            AiModelSeeder::class,

            // Bot Personality Seeder (for inbox/bot-personalities endpoint)
            SimpleBotPersonalitySeeder::class,

            // Chat Session Seeder (for inbox/sessions endpoint)
            SimpleChatSessionSeeder::class,

            // Knowledge Base Seeder
            KnowledgeBaseSeeder::class,

            // System Configuration Seeder
            SystemConfigurationSeeder::class,

            // Payment Transaction Seeder
            PaymentTransactionSeeder::class,

            // Subscription Seeder
            SubscriptionSeeder::class,

            // Billing Invoice Seeder
            BillingInvoiceSeeder::class,

            // // Webhook Event Seeder
            // WebhookEventSeeder::class,

            // // Queue Job Seeder
            // QueueJobSeeder::class,

            // Audit Log Seeder
            // AuditLogSeeder::class,

            // Notification Template Seeder
            // NotificationTemplateSeeder::class,

            // Organization Dashboard Seeder (for dashboard data)
            OrganizationDashboardSeeder::class,
        ]);
    }
}
