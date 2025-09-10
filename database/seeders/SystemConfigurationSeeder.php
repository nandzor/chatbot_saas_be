<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SystemConfigurationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating system configurations...');

        $configurations = [
            // Payment Gateway Configurations
            [
                'category' => 'payment_gateways',
                'key' => 'stripe_enabled',
                'value' => 'true',
                'type' => 'boolean',
                'description' => 'Enable Stripe payment gateway',
                'is_public' => false,
                'is_editable' => true,
            ],
            [
                'category' => 'payment_gateways',
                'key' => 'stripe_public_key',
                'value' => 'pk_test_51234567890abcdef',
                'type' => 'string',
                'description' => 'Stripe public key for frontend',
                'is_public' => true,
                'is_editable' => true,
            ],
            [
                'category' => 'payment_gateways',
                'key' => 'stripe_secret_key',
                'value' => 'sk_test_51234567890abcdef',
                'type' => 'string',
                'description' => 'Stripe secret key for backend',
                'is_public' => false,
                'is_editable' => true,
            ],
            [
                'category' => 'payment_gateways',
                'key' => 'stripe_webhook_secret',
                'value' => 'whsec_51234567890abcdef',
                'type' => 'string',
                'description' => 'Stripe webhook secret for verification',
                'is_public' => false,
                'is_editable' => true,
            ],
            [
                'category' => 'payment_gateways',
                'key' => 'midtrans_enabled',
                'value' => 'true',
                'type' => 'boolean',
                'description' => 'Enable Midtrans payment gateway',
                'is_public' => false,
                'is_editable' => true,
            ],
            [
                'category' => 'payment_gateways',
                'key' => 'midtrans_server_key',
                'value' => 'SB-Mid-server-51234567890abcdef',
                'type' => 'string',
                'description' => 'Midtrans server key',
                'is_public' => false,
                'is_editable' => true,
            ],
            [
                'category' => 'payment_gateways',
                'key' => 'midtrans_client_key',
                'value' => 'SB-Mid-client-51234567890abcdef',
                'type' => 'string',
                'description' => 'Midtrans client key',
                'is_public' => true,
                'is_editable' => true,
            ],
            [
                'category' => 'payment_gateways',
                'key' => 'xendit_enabled',
                'value' => 'true',
                'type' => 'boolean',
                'description' => 'Enable Xendit payment gateway',
                'is_public' => false,
                'is_editable' => true,
            ],
            [
                'category' => 'payment_gateways',
                'key' => 'xendit_secret_key',
                'value' => 'xnd_public_development_51234567890abcdef',
                'type' => 'string',
                'description' => 'Xendit secret key',
                'is_public' => false,
                'is_editable' => true,
            ],
            [
                'category' => 'payment_gateways',
                'key' => 'xendit_public_key',
                'value' => 'xnd_public_development_51234567890abcdef',
                'type' => 'string',
                'description' => 'Xendit public key',
                'is_public' => true,
                'is_editable' => true,
            ],

            // Billing Configurations
            [
                'category' => 'billing',
                'key' => 'default_currency',
                'value' => 'IDR',
                'type' => 'string',
                'description' => 'Default currency for billing',
                'is_public' => true,
                'is_editable' => true,
            ],
            [
                'category' => 'billing',
                'key' => 'invoice_prefix',
                'value' => 'INV',
                'type' => 'string',
                'description' => 'Prefix for invoice numbers',
                'is_public' => true,
                'is_editable' => true,
            ],
            [
                'category' => 'billing',
                'key' => 'invoice_due_days',
                'value' => '30',
                'type' => 'integer',
                'description' => 'Default due days for invoices',
                'is_public' => true,
                'is_editable' => true,
            ],
            [
                'category' => 'billing',
                'key' => 'overdue_grace_period_days',
                'value' => '7',
                'type' => 'integer',
                'description' => 'Grace period before marking invoice as overdue',
                'is_public' => true,
                'is_editable' => true,
            ],
            [
                'category' => 'billing',
                'key' => 'auto_generate_invoices',
                'value' => 'true',
                'type' => 'boolean',
                'description' => 'Automatically generate invoices for subscriptions',
                'is_public' => false,
                'is_editable' => true,
            ],
            [
                'category' => 'billing',
                'key' => 'invoice_reminder_days',
                'value' => '7,3,1',
                'type' => 'string',
                'description' => 'Days before due date to send reminders (comma-separated)',
                'is_public' => true,
                'is_editable' => true,
            ],

            // Email Configurations
            [
                'category' => 'email',
                'key' => 'from_name',
                'value' => 'Chatbot SaaS Platform',
                'type' => 'string',
                'description' => 'Default sender name for emails',
                'is_public' => true,
                'is_editable' => true,
            ],
            [
                'category' => 'email',
                'key' => 'from_email',
                'value' => 'noreply@chatbotsaas.com',
                'type' => 'string',
                'description' => 'Default sender email address',
                'is_public' => true,
                'is_editable' => true,
            ],
            [
                'category' => 'email',
                'key' => 'support_email',
                'value' => 'support@chatbotsaas.com',
                'type' => 'string',
                'description' => 'Support email address',
                'is_public' => true,
                'is_editable' => true,
            ],
            [
                'category' => 'email',
                'key' => 'billing_email',
                'value' => 'billing@chatbotsaas.com',
                'type' => 'string',
                'description' => 'Billing email address',
                'is_public' => true,
                'is_editable' => true,
            ],

            // System Configurations
            [
                'category' => 'system',
                'key' => 'app_name',
                'value' => 'Chatbot SaaS Platform',
                'type' => 'string',
                'description' => 'Application name',
                'is_public' => true,
                'is_editable' => true,
            ],
            [
                'category' => 'system',
                'key' => 'app_version',
                'value' => '1.0.0',
                'type' => 'string',
                'description' => 'Application version',
                'is_public' => true,
                'is_editable' => false,
            ],
            [
                'category' => 'system',
                'key' => 'maintenance_mode',
                'value' => 'false',
                'type' => 'boolean',
                'description' => 'Enable maintenance mode',
                'is_public' => true,
                'is_editable' => true,
            ],
            [
                'category' => 'system',
                'key' => 'debug_mode',
                'value' => 'false',
                'type' => 'boolean',
                'description' => 'Enable debug mode',
                'is_public' => false,
                'is_editable' => true,
            ],
            [
                'category' => 'system',
                'key' => 'timezone',
                'value' => 'Asia/Jakarta',
                'type' => 'string',
                'description' => 'Default timezone',
                'is_public' => true,
                'is_editable' => true,
            ],
            [
                'category' => 'system',
                'key' => 'locale',
                'value' => 'id',
                'type' => 'string',
                'description' => 'Default locale',
                'is_public' => true,
                'is_editable' => true,
            ],

            // Queue Configurations
            [
                'category' => 'queue',
                'key' => 'default_queue',
                'value' => 'default',
                'type' => 'string',
                'description' => 'Default queue connection',
                'is_public' => false,
                'is_editable' => true,
            ],
            [
                'category' => 'queue',
                'key' => 'max_retry_attempts',
                'value' => '3',
                'type' => 'integer',
                'description' => 'Maximum retry attempts for failed jobs',
                'is_public' => false,
                'is_editable' => true,
            ],
            [
                'category' => 'queue',
                'key' => 'job_timeout',
                'value' => '300',
                'type' => 'integer',
                'description' => 'Job timeout in seconds',
                'is_public' => false,
                'is_editable' => true,
            ],
            [
                'category' => 'queue',
                'key' => 'queue_worker_count',
                'value' => '4',
                'type' => 'integer',
                'description' => 'Number of queue workers',
                'is_public' => false,
                'is_editable' => true,
            ],

            // Cache Configurations
            [
                'category' => 'cache',
                'key' => 'default_cache_ttl',
                'value' => '3600',
                'type' => 'integer',
                'description' => 'Default cache TTL in seconds',
                'is_public' => false,
                'is_editable' => true,
            ],
            [
                'category' => 'cache',
                'key' => 'payment_cache_ttl',
                'value' => '1800',
                'type' => 'integer',
                'description' => 'Payment cache TTL in seconds',
                'is_public' => false,
                'is_editable' => true,
            ],
            [
                'category' => 'cache',
                'key' => 'billing_cache_ttl',
                'value' => '7200',
                'type' => 'integer',
                'description' => 'Billing cache TTL in seconds',
                'is_public' => false,
                'is_editable' => true,
            ],

            // Security Configurations
            [
                'category' => 'security',
                'key' => 'rate_limit_requests',
                'value' => '100',
                'type' => 'integer',
                'description' => 'Rate limit requests per minute',
                'is_public' => false,
                'is_editable' => true,
            ],
            [
                'category' => 'security',
                'key' => 'rate_limit_burst',
                'value' => '200',
                'type' => 'integer',
                'description' => 'Rate limit burst requests',
                'is_public' => false,
                'is_editable' => true,
            ],
            [
                'category' => 'security',
                'key' => 'session_timeout',
                'value' => '7200',
                'type' => 'integer',
                'description' => 'Session timeout in seconds',
                'is_public' => false,
                'is_editable' => true,
            ],
            [
                'category' => 'security',
                'key' => 'password_min_length',
                'value' => '8',
                'type' => 'integer',
                'description' => 'Minimum password length',
                'is_public' => true,
                'is_editable' => true,
            ],
            [
                'category' => 'security',
                'key' => 'password_require_special',
                'value' => 'true',
                'type' => 'boolean',
                'description' => 'Require special characters in password',
                'is_public' => true,
                'is_editable' => true,
            ],

            // AI/ML Configurations
            [
                'category' => 'ai',
                'key' => 'openai_api_key',
                'value' => 'sk-51234567890abcdef',
                'type' => 'string',
                'description' => 'OpenAI API key',
                'is_public' => false,
                'is_editable' => true,
            ],
            [
                'category' => 'ai',
                'key' => 'openai_model',
                'value' => 'gpt-3.5-turbo',
                'type' => 'string',
                'description' => 'Default OpenAI model',
                'is_public' => true,
                'is_editable' => true,
            ],
            [
                'category' => 'ai',
                'key' => 'max_tokens',
                'value' => '1000',
                'type' => 'integer',
                'description' => 'Maximum tokens per request',
                'is_public' => true,
                'is_editable' => true,
            ],
            [
                'category' => 'ai',
                'key' => 'temperature',
                'value' => '0.7',
                'type' => 'float',
                'description' => 'AI response temperature',
                'is_public' => true,
                'is_editable' => true,
            ],

            // Monitoring Configurations
            [
                'category' => 'monitoring',
                'key' => 'health_check_interval',
                'value' => '300',
                'type' => 'integer',
                'description' => 'Health check interval in seconds',
                'is_public' => false,
                'is_editable' => true,
            ],
            [
                'category' => 'monitoring',
                'key' => 'log_retention_days',
                'value' => '90',
                'type' => 'integer',
                'description' => 'Log retention period in days',
                'is_public' => false,
                'is_editable' => true,
            ],
            [
                'category' => 'monitoring',
                'key' => 'performance_monitoring',
                'value' => 'true',
                'type' => 'boolean',
                'description' => 'Enable performance monitoring',
                'is_public' => false,
                'is_editable' => true,
            ],
            [
                'category' => 'monitoring',
                'key' => 'error_reporting',
                'value' => 'true',
                'type' => 'boolean',
                'description' => 'Enable error reporting',
                'is_public' => false,
                'is_editable' => true,
            ],
        ];

        // Insert configurations in batches
        $chunks = array_chunk($configurations, 50);
        foreach ($chunks as $chunk) {
            DB::table('system_configurations')->insert($chunk);
        }

        $this->command->info('Created ' . count($configurations) . ' system configurations.');
    }
}
