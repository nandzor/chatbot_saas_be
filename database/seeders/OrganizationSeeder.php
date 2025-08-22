<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class OrganizationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get subscription plans
        $trialPlan = SubscriptionPlan::where('name', 'trial')->first();
        $starterPlan = SubscriptionPlan::where('name', 'starter')->first();
        $professionalPlan = SubscriptionPlan::where('name', 'professional')->first();

        // Validate that all required subscription plans exist
        if (!$trialPlan || !$starterPlan || !$professionalPlan) {
            throw new \Exception('Required subscription plans not found. Please run SubscriptionPlanSeeder first.');
        }

        $organizations = [
            [
                'org_code' => 'DEMO001',
                'name' => 'Demo Organization',
                'display_name' => 'Demo Organization - Sample Company',
                'email' => 'admin@demo-org.com',
                'phone' => '+6281234567890',
                'address' => 'Jl. Sudirman No. 123, Jakarta Pusat, DKI Jakarta 12190',
                'logo_url' => 'https://via.placeholder.com/200x200/3B82F6/FFFFFF?text=Demo',
                'favicon_url' => 'https://via.placeholder.com/32x32/3B82F6/FFFFFF?text=D',
                'website' => 'https://demo-org.com',
                'tax_id' => '123456789012345',
                'business_type' => 'PT',
                'industry' => 'Technology',
                'company_size' => '10-50',
                'timezone' => 'Asia/Jakarta',
                'locale' => 'id',
                'currency' => 'IDR',
                'subscription_plan_id' => $trialPlan->id,
                'subscription_status' => 'trial',
                'trial_ends_at' => now()->addDays(14),
                'billing_cycle' => 'monthly',
                'current_usage' => [
                    'messages' => 0,
                    'ai_requests' => 0,
                    'api_calls' => 0,
                    'storage_mb' => 0,
                    'active_agents' => 0,
                    'active_channels' => 0
                ],
                'theme_config' => [
                    'primaryColor' => '#3B82F6',
                    'secondaryColor' => '#10B981',
                    'darkMode' => false
                ],
                'branding_config' => [
                    'companyName' => 'Demo Organization',
                    'tagline' => 'Innovative Solutions for Modern Business',
                    'primaryColor' => '#3B82F6',
                    'secondaryColor' => '#10B981'
                ],
                'feature_flags' => [
                    'ai_assistant' => true,
                    'advanced_analytics' => false,
                    'custom_branding' => false
                ],
                'ui_preferences' => [
                    'defaultLanguage' => 'id',
                    'defaultTimezone' => 'Asia/Jakarta',
                    'dateFormat' => 'DD/MM/YYYY',
                    'timeFormat' => '24h'
                ],
                'business_hours' => [
                    'timezone' => 'Asia/Jakarta',
                    'days' => [
                        'monday' => ['start' => '09:00', 'end' => '17:00'],
                        'tuesday' => ['start' => '09:00', 'end' => '17:00'],
                        'wednesday' => ['start' => '09:00', 'end' => '17:00'],
                        'thursday' => ['start' => '09:00', 'end' => '17:00'],
                        'friday' => ['start' => '09:00', 'end' => '17:00'],
                        'saturday' => ['start' => '09:00', 'end' => '15:00'],
                        'sunday' => null
                    ]
                ],
                'contact_info' => [
                    'email' => 'contact@demo-org.com',
                    'phone' => '+6281234567890',
                    'address' => 'Jl. Sudirman No. 123, Jakarta Pusat, DKI Jakarta 12190',
                    'website' => 'https://demo-org.com'
                ],
                'social_media' => [
                    'facebook' => 'https://facebook.com/demo-org',
                    'twitter' => 'https://twitter.com/demo-org',
                    'linkedin' => 'https://linkedin.com/company/demo-org',
                    'instagram' => 'https://instagram.com/demo-org'
                ],
                'security_settings' => [
                    'password_policy' => [
                        'min_length' => 8,
                        'require_special' => true,
                        'require_numbers' => true,
                        'require_uppercase' => true
                    ],
                    'session_timeout' => 3600,
                    'ip_whitelist' => [],
                    'two_factor_required' => false
                ],
                'api_enabled' => false,
                'webhook_url' => null,
                'webhook_secret' => null,
                'settings' => [
                    'default_language' => 'id',
                    'auto_translate' => false,
                    'notification_email' => true,
                    'notification_push' => true
                ],
                'metadata' => [
                    'created_via' => 'seeder',
                    'demo_organization' => true
                ],
                'status' => 'active'
            ],
            [
                'org_code' => 'TECH001',
                'name' => 'TechCorp Solutions',
                'display_name' => 'TechCorp Solutions - Technology Company',
                'email' => 'admin@techcorp.com',
                'phone' => '+6282345678901',
                'address' => 'Jl. Thamrin No. 456, Jakarta Pusat, DKI Jakarta 10350',
                'logo_url' => 'https://via.placeholder.com/200x200/10B981/FFFFFF?text=Tech',
                'favicon_url' => 'https://via.placeholder.com/32x32/10B981/FFFFFF?text=T',
                'website' => 'https://techcorp.com',
                'tax_id' => '234567890123456',
                'business_type' => 'PT',
                'industry' => 'Software Development',
                'company_size' => '50-200',
                'timezone' => 'Asia/Jakarta',
                'locale' => 'id',
                'currency' => 'IDR',
                'subscription_plan_id' => $starterPlan->id,
                'subscription_status' => 'active',
                'subscription_starts_at' => now()->subMonth(),
                'subscription_ends_at' => now()->addMonths(11),
                'billing_cycle' => 'yearly',
                'current_usage' => [
                    'messages' => 1500,
                    'ai_requests' => 150,
                    'api_calls' => 1500,
                    'storage_mb' => 512,
                    'active_agents' => 2,
                    'active_channels' => 2
                ],
                'theme_config' => [
                    'primaryColor' => '#10B981',
                    'secondaryColor' => '#3B82F6',
                    'darkMode' => false
                ],
                'branding_config' => [
                    'companyName' => 'TechCorp Solutions',
                    'tagline' => 'Building Tomorrow\'s Technology Today',
                    'primaryColor' => '#10B981',
                    'secondaryColor' => '#3B82F6'
                ],
                'feature_flags' => [
                    'ai_assistant' => true,
                    'advanced_analytics' => false,
                    'custom_branding' => true
                ],
                'ui_preferences' => [
                    'defaultLanguage' => 'en',
                    'defaultTimezone' => 'Asia/Jakarta',
                    'dateFormat' => 'MM/DD/YYYY',
                    'timeFormat' => '12h'
                ],
                'business_hours' => [
                    'timezone' => 'Asia/Jakarta',
                    'days' => [
                        'monday' => ['start' => '08:00', 'end' => '18:00'],
                        'tuesday' => ['start' => '08:00', 'end' => '18:00'],
                        'wednesday' => ['start' => '08:00', 'end' => '18:00'],
                        'thursday' => ['start' => '08:00', 'end' => '18:00'],
                        'friday' => ['start' => '08:00', 'end' => '18:00'],
                        'saturday' => null,
                        'sunday' => null
                    ]
                ],
                'contact_info' => [
                    'email' => 'contact@techcorp.com',
                    'phone' => '+6282345678901',
                    'address' => 'Jl. Thamrin No. 456, Jakarta Pusat, DKI Jakarta 10350',
                    'website' => 'https://techcorp.com'
                ],
                'social_media' => [
                    'facebook' => 'https://facebook.com/techcorp',
                    'twitter' => 'https://twitter.com/techcorp',
                    'linkedin' => 'https://linkedin.com/company/techcorp',
                    'instagram' => 'https://instagram.com/techcorp'
                ],
                'security_settings' => [
                    'password_policy' => [
                        'min_length' => 10,
                        'require_special' => true,
                        'require_numbers' => true,
                        'require_uppercase' => true
                    ],
                    'session_timeout' => 7200,
                    'ip_whitelist' => [],
                    'two_factor_required' => true
                ],
                'api_enabled' => true,
                'webhook_url' => 'https://techcorp.com/webhooks/chatbot',
                'webhook_secret' => 'techcorp_webhook_secret_2024',
                'settings' => [
                    'default_language' => 'en',
                    'auto_translate' => true,
                    'notification_email' => true,
                    'notification_push' => true
                ],
                'metadata' => [
                    'created_via' => 'seeder',
                    'demo_organization' => false
                ],
                'status' => 'active'
            ],
            [
                'org_code' => 'ENTERPRISE001',
                'name' => 'Enterprise Solutions',
                'display_name' => 'Enterprise Solutions - Large Corporation',
                'email' => 'admin@enterprise-solutions.com',
                'phone' => '+6283456789012',
                'address' => 'Jl. Gatot Subroto No. 789, Jakarta Selatan, DKI Jakarta 12930',
                'logo_url' => 'https://via.placeholder.com/200x200/8B5CF6/FFFFFF?text=Enterprise',
                'favicon_url' => 'https://via.placeholder.com/32x32/8B5CF6/FFFFFF?text=E',
                'website' => 'https://enterprise-solutions.com',
                'tax_id' => '345678901234567',
                'business_type' => 'PT',
                'industry' => 'Consulting',
                'company_size' => '200+',
                'timezone' => 'Asia/Jakarta',
                'locale' => 'id',
                'currency' => 'IDR',
                'subscription_plan_id' => $professionalPlan->id,
                'subscription_status' => 'active',
                'subscription_starts_at' => now()->subMonths(3),
                'subscription_ends_at' => now()->addMonths(9),
                'billing_cycle' => 'yearly',
                'current_usage' => [
                    'messages' => 8000,
                    'ai_requests' => 800,
                    'api_calls' => 8000,
                    'storage_mb' => 2048,
                    'active_agents' => 8,
                    'active_channels' => 8
                ],
                'theme_config' => [
                    'primaryColor' => '#8B5CF6',
                    'secondaryColor' => '#F59E0B',
                    'darkMode' => true
                ],
                'branding_config' => [
                    'companyName' => 'Enterprise Solutions',
                    'tagline' => 'Empowering Businesses Through Innovation',
                    'primaryColor' => '#8B5CF6',
                    'secondaryColor' => '#F59E0B'
                ],
                'feature_flags' => [
                    'ai_assistant' => true,
                    'advanced_analytics' => true,
                    'custom_branding' => true
                ],
                'ui_preferences' => [
                    'defaultLanguage' => 'en',
                    'defaultTimezone' => 'Asia/Jakarta',
                    'dateFormat' => 'YYYY-MM-DD',
                    'timeFormat' => '24h'
                ],
                'business_hours' => [
                    'timezone' => 'Asia/Jakarta',
                    'days' => [
                        'monday' => ['start' => '07:00', 'end' => '19:00'],
                        'tuesday' => ['start' => '07:00', 'end' => '19:00'],
                        'wednesday' => ['start' => '07:00', 'end' => '19:00'],
                        'thursday' => ['start' => '07:00', 'end' => '19:00'],
                        'friday' => ['start' => '07:00', 'end' => '19:00'],
                        'saturday' => ['start' => '08:00', 'end' => '16:00'],
                        'sunday' => null
                    ]
                ],
                'contact_info' => [
                    'email' => 'contact@enterprise-solutions.com',
                    'phone' => '+6283456789012',
                    'address' => 'Jl. Gatot Subroto No. 789, Jakarta Selatan, DKI Jakarta 12930',
                    'website' => 'https://enterprise-solutions.com'
                ],
                'social_media' => [
                    'facebook' => 'https://facebook.com/enterprise-solutions',
                    'twitter' => 'https://twitter.com/enterprise-solutions',
                    'linkedin' => 'https://linkedin.com/company/enterprise-solutions',
                    'instagram' => 'https://instagram.com/enterprise-solutions'
                ],
                'security_settings' => [
                    'password_policy' => [
                        'min_length' => 12,
                        'require_special' => true,
                        'require_numbers' => true,
                        'require_uppercase' => true,
                        'require_lowercase' => true
                    ],
                    'session_timeout' => 3600,
                    'ip_whitelist' => ['192.168.1.0/24', '10.0.0.0/8'],
                    'two_factor_required' => true
                ],
                'api_enabled' => true,
                'webhook_url' => 'https://enterprise-solutions.com/webhooks/chatbot',
                'webhook_secret' => 'enterprise_webhook_secret_2024',
                'settings' => [
                    'default_language' => 'en',
                    'auto_translate' => true,
                    'notification_email' => true,
                    'notification_push' => true,
                    'advanced_analytics' => true
                ],
                'metadata' => [
                    'created_via' => 'seeder',
                    'demo_organization' => false,
                    'enterprise_customer' => true
                ],
                'status' => 'active'
            ]
        ];

        foreach ($organizations as $org) {
            Organization::create($org);
        }
    }
}
