<?php

namespace Database\Seeders;

use App\Models\Organization;
use Illuminate\Database\Seeder;
use App\Models\SubscriptionPlan;

class OrganizationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Starting Organization seeders...');

        // Get subscription plans
        $starterPlan = SubscriptionPlan::where('name', 'starter')->first();
        $professionalPlan = SubscriptionPlan::where('name', 'professional')->first();
        $enterprisePlan = SubscriptionPlan::where('name', 'enterprise')->first();

        $organizations = [
            [
                'org_code' => 'TECH001',
                'name' => 'TechCorp Indonesia',
                'display_name' => 'TechCorp ID',
                'email' => 'contact@techcorp.id',
                'phone' => '+62-21-1234-5678',
                'address' => 'Jl. Sudirman No. 123, Jakarta Pusat',
                'logo_url' => 'https://example.com/logos/techcorp.png',
                'website' => 'https://techcorp.id',
                'tax_id' => '12.345.678.9-123.456',
                'business_type' => 'technology',
                'industry' => 'technology',
                'company_size' => '51-200',
                'timezone' => 'Asia/Jakarta',
                'locale' => 'id',
                'currency' => 'IDR',
                'subscription_plan_id' => $professionalPlan?->id,
                'subscription_status' => 'active',
                'trial_ends_at' => null,
                'subscription_starts_at' => now()->subMonths(3),
                'subscription_ends_at' => now()->addMonths(9),
                'billing_cycle' => 'monthly',
                'current_usage' => [
                    'agents' => 5,
                    'channels' => 3,
                    'knowledge_articles' => 150,
                    'monthly_messages' => 2500,
                    'monthly_ai_requests' => 1200,
                    'storage_gb' => 8,
                    'api_calls_today' => 150
                ],
                'theme_config' => [
                    'primary_color' => '#2563eb',
                    'secondary_color' => '#64748b',
                    'logo_position' => 'left'
                ],
                'branding_config' => [
                    'company_name' => 'TechCorp Indonesia',
                    'slogan' => 'Innovating for Tomorrow',
                    'custom_domain' => 'chat.techcorp.id'
                ],
                'feature_flags' => [
                    'ai_chat' => true,
                    'knowledge_base' => true,
                    'multi_channel' => true,
                    'api_access' => true,
                    'analytics' => true,
                    'custom_branding' => true,
                    'priority_support' => false,
                    'white_label' => false,
                    'advanced_analytics' => false,
                    'custom_integrations' => false
                ],
                'ui_preferences' => [
                    'language' => 'id',
                    'theme' => 'light',
                    'notifications' => true
                ],
                'business_hours' => [
                    'monday' => ['09:00', '17:00'],
                    'tuesday' => ['09:00', '17:00'],
                    'wednesday' => ['09:00', '17:00'],
                    'thursday' => ['09:00', '17:00'],
                    'friday' => ['09:00', '17:00'],
                    'saturday' => ['09:00', '12:00'],
                    'sunday' => []
                ],
                'contact_info' => [
                    'primary_contact' => [
                        'name' => 'Budi Santoso',
                        'email' => 'budi@techcorp.id',
                        'phone' => '+62-812-3456-7890'
                    ],
                    'support_email' => 'support@techcorp.id',
                    'sales_email' => 'sales@techcorp.id'
                ],
                'social_media' => [
                    'linkedin' => 'https://linkedin.com/company/techcorp-id',
                    'twitter' => 'https://twitter.com/techcorp_id',
                    'facebook' => 'https://facebook.com/techcorp.id'
                ],
                'security_settings' => [
                    'two_factor_required' => true,
                    'session_timeout' => 3600,
                    'ip_whitelist' => [],
                    'password_policy' => 'strong'
                ],
                'api_enabled' => true,
                'webhook_url' => 'https://techcorp.id/webhooks/chatbot',
                'webhook_secret' => 'techcorp_webhook_secret_123',
                'settings' => [
                    'auto_backup' => true,
                    'backup_frequency' => 'daily',
                    'retention_days' => 30
                ],
                'metadata' => [
                    'founded_year' => 2020,
                    'headquarters' => 'Jakarta, Indonesia',
                    'employee_count' => 150
                ],
                'status' => 'active'
            ],
            [
                'org_code' => 'HEALTH001',
                'name' => 'MediCare Solutions',
                'display_name' => 'MediCare',
                'email' => 'info@medicare.id',
                'phone' => '+62-22-9876-5432',
                'address' => 'Jl. Asia Afrika No. 456, Bandung',
                'logo_url' => 'https://example.com/logos/medicare.png',
                'website' => 'https://medicare.id',
                'tax_id' => '12.345.678.9-987.654',
                'business_type' => 'healthcare',
                'industry' => 'healthcare',
                'company_size' => '201-500',
                'timezone' => 'Asia/Jakarta',
                'locale' => 'id',
                'currency' => 'IDR',
                'subscription_plan_id' => $enterprisePlan?->id ?? null,
                'subscription_status' => 'active',
                'trial_ends_at' => null,
                'subscription_starts_at' => now()->subMonths(6),
                'subscription_ends_at' => now()->addMonths(6),
                'billing_cycle' => 'yearly',
                'current_usage' => [
                    'agents' => 15,
                    'channels' => 8,
                    'knowledge_articles' => 500,
                    'monthly_messages' => 15000,
                    'monthly_ai_requests' => 8000,
                    'storage_gb' => 45,
                    'api_calls_today' => 800
                ],
                'theme_config' => [
                    'primary_color' => '#059669',
                    'secondary_color' => '#6b7280',
                    'logo_position' => 'center'
                ],
                'branding_config' => [
                    'company_name' => 'MediCare Solutions',
                    'slogan' => 'Caring for Your Health',
                    'custom_domain' => 'chat.medicare.id'
                ],
                'feature_flags' => [
                    'ai_chat' => true,
                    'knowledge_base' => true,
                    'multi_channel' => true,
                    'api_access' => true,
                    'analytics' => true,
                    'custom_branding' => true,
                    'priority_support' => true,
                    'white_label' => true,
                    'advanced_analytics' => true,
                    'custom_integrations' => true
                ],
                'ui_preferences' => [
                    'language' => 'id',
                    'theme' => 'light',
                    'notifications' => true
                ],
                'business_hours' => [
                    'monday' => ['08:00', '18:00'],
                    'tuesday' => ['08:00', '18:00'],
                    'wednesday' => ['08:00', '18:00'],
                    'thursday' => ['08:00', '18:00'],
                    'friday' => ['08:00', '18:00'],
                    'saturday' => ['08:00', '14:00'],
                    'sunday' => []
                ],
                'contact_info' => [
                    'primary_contact' => [
                        'name' => 'Dr. Siti Rahayu',
                        'email' => 'siti@medicare.id',
                        'phone' => '+62-822-9876-5432'
                    ],
                    'support_email' => 'support@medicare.id',
                    'emergency_contact' => '+62-811-1234-5678'
                ],
                'social_media' => [
                    'instagram' => 'https://instagram.com/medicare.id',
                    'facebook' => 'https://facebook.com/medicare.id',
                    'youtube' => 'https://youtube.com/medicare.id'
                ],
                'security_settings' => [
                    'two_factor_required' => true,
                    'session_timeout' => 1800,
                    'ip_whitelist' => ['192.168.1.0/24'],
                    'password_policy' => 'very_strong',
                    'hipaa_compliant' => true
                ],
                'api_enabled' => true,
                'webhook_url' => 'https://medicare.id/webhooks/patient-data',
                'webhook_secret' => 'medicare_webhook_secret_456',
                'settings' => [
                    'auto_backup' => true,
                    'backup_frequency' => 'hourly',
                    'retention_days' => 90,
                    'encryption_enabled' => true
                ],
                'metadata' => [
                    'founded_year' => 2018,
                    'headquarters' => 'Bandung, Indonesia',
                    'employee_count' => 350,
                    'certifications' => ['ISO 27001', 'HIPAA']
                ],
                'status' => 'active'
            ],
            [
                'org_code' => 'STARTUP001',
                'name' => 'InnovateLab',
                'display_name' => 'InnovateLab',
                'email' => 'hello@innovatelab.co',
                'phone' => '+62-361-1234-5678',
                'address' => 'Jl. Sunset Road No. 789, Bali',
                'logo_url' => 'https://example.com/logos/innovatelab.png',
                'website' => 'https://innovatelab.co',
                'tax_id' => '12.345.678.9-111.222',
                'business_type' => 'startup',
                'industry' => 'technology',
                'company_size' => '11-50',
                'timezone' => 'Asia/Jakarta',
                'locale' => 'id',
                'currency' => 'IDR',
                'subscription_plan_id' => $starterPlan?->id ?? null,
                'subscription_status' => 'trial',
                'trial_ends_at' => now()->addDays(7),
                'subscription_starts_at' => null,
                'subscription_ends_at' => null,
                'billing_cycle' => 'monthly',
                'current_usage' => [
                    'agents' => 1,
                    'channels' => 2,
                    'knowledge_articles' => 25,
                    'monthly_messages' => 300,
                    'monthly_ai_requests' => 150,
                    'storage_gb' => 1,
                    'api_calls_today' => 50
                ],
                'theme_config' => [
                    'primary_color' => '#f59e0b',
                    'secondary_color' => '#8b5cf6',
                    'logo_position' => 'left'
                ],
                'branding_config' => [
                    'company_name' => 'InnovateLab',
                    'slogan' => 'Building the Future',
                    'custom_domain' => null
                ],
                'feature_flags' => [
                    'ai_chat' => true,
                    'knowledge_base' => true,
                    'multi_channel' => true,
                    'api_access' => false,
                    'analytics' => false,
                    'custom_branding' => false,
                    'priority_support' => false,
                    'white_label' => false,
                    'advanced_analytics' => false,
                    'custom_integrations' => false
                ],
                'ui_preferences' => [
                    'language' => 'id',
                    'theme' => 'dark',
                    'notifications' => true
                ],
                'business_hours' => [
                    'monday' => ['10:00', '18:00'],
                    'tuesday' => ['10:00', '18:00'],
                    'wednesday' => ['10:00', '18:00'],
                    'thursday' => ['10:00', '18:00'],
                    'friday' => ['10:00', '18:00'],
                    'saturday' => ['10:00', '14:00'],
                    'sunday' => []
                ],
                'contact_info' => [
                    'primary_contact' => [
                        'name' => 'Ahmad Rizki',
                        'email' => 'rizki@innovatelab.co',
                        'phone' => '+62-812-3456-7890'
                    ],
                    'support_email' => 'support@innovatelab.co'
                ],
                'social_media' => [
                    'instagram' => 'https://instagram.com/innovatelab.co',
                    'twitter' => 'https://twitter.com/innovatelab_co',
                    'linkedin' => 'https://linkedin.com/company/innovatelab'
                ],
                'security_settings' => [
                    'two_factor_required' => false,
                    'session_timeout' => 7200,
                    'ip_whitelist' => [],
                    'password_policy' => 'medium'
                ],
                'api_enabled' => false,
                'webhook_url' => null,
                'webhook_secret' => null,
                'settings' => [
                    'auto_backup' => false,
                    'backup_frequency' => 'weekly',
                    'retention_days' => 7
                ],
                'metadata' => [
                    'founded_year' => 2023,
                    'headquarters' => 'Bali, Indonesia',
                    'employee_count' => 25,
                    'funding_stage' => 'seed'
                ],
                'status' => 'active'
            ]
        ];

        foreach ($organizations as $orgData) {
            Organization::updateOrCreate(
                ['org_code' => $orgData['org_code']],
                $orgData
            );
        }

        // Run organization-related seeders in order
        $this->call([
            OrganizationPermissionSeeder::class,
            OrganizationRoleSeeder::class,
            OrganizationRolePermissionSeeder::class,
            OrganizationAnalyticsSeeder::class,
            OrganizationAuditLogSeeder::class,
        ]);



        $this->command->info('Organization seeders completed successfully!');
    }
}
