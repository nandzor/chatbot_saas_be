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
        Schema::table('organizations', function (Blueprint $table) {
            // General settings
            if (!Schema::hasColumn('organizations', 'display_name')) {
                $table->string('display_name')->nullable()->after('name');
            }
            if (!Schema::hasColumn('organizations', 'description')) {
                $table->text('description')->nullable()->after('address');
            }
            if (!Schema::hasColumn('organizations', 'logo')) {
                $table->string('logo')->nullable()->after('description');
            }
            if (!Schema::hasColumn('organizations', 'timezone')) {
                $table->string('timezone')->default('UTC')->after('logo');
            }
            if (!Schema::hasColumn('organizations', 'locale')) {
                $table->string('locale')->default('en')->after('timezone');
            }
            if (!Schema::hasColumn('organizations', 'currency')) {
                $table->string('currency')->default('USD')->after('locale');
            }

            // System settings
            if (!Schema::hasColumn('organizations', 'founded_year')) {
                $table->integer('founded_year')->nullable()->after('company_size');
            }
            if (!Schema::hasColumn('organizations', 'employee_count')) {
                $table->integer('employee_count')->default(0)->after('founded_year');
            }
            if (!Schema::hasColumn('organizations', 'annual_revenue')) {
                $table->decimal('annual_revenue', 15, 2)->default(0)->after('employee_count');
            }
            if (!Schema::hasColumn('organizations', 'social_media')) {
                $table->json('social_media')->nullable()->after('annual_revenue');
            }

            // API settings
            if (!Schema::hasColumn('organizations', 'api_key')) {
                $table->string('api_key')->nullable()->after('social_media');
            }
            if (!Schema::hasColumn('organizations', 'webhook_url')) {
                $table->string('webhook_url')->nullable()->after('api_key');
            }
            if (!Schema::hasColumn('organizations', 'webhook_secret')) {
                $table->string('webhook_secret')->nullable()->after('webhook_url');
            }
            if (!Schema::hasColumn('organizations', 'rate_limit')) {
                $table->integer('rate_limit')->default(1000)->after('webhook_secret');
            }
            if (!Schema::hasColumn('organizations', 'allowed_origins')) {
                $table->json('allowed_origins')->nullable()->after('rate_limit');
            }
            if (!Schema::hasColumn('organizations', 'api_enabled')) {
                $table->boolean('api_enabled')->default(false)->after('allowed_origins');
            }
            if (!Schema::hasColumn('organizations', 'webhook_enabled')) {
                $table->boolean('webhook_enabled')->default(false)->after('api_enabled');
            }

            // Security settings
            if (!Schema::hasColumn('organizations', 'two_factor_enabled')) {
                $table->boolean('two_factor_enabled')->default(false)->after('webhook_enabled');
            }
            if (!Schema::hasColumn('organizations', 'sso_enabled')) {
                $table->boolean('sso_enabled')->default(false)->after('two_factor_enabled');
            }
            if (!Schema::hasColumn('organizations', 'sso_provider')) {
                $table->string('sso_provider')->nullable()->after('sso_enabled');
            }
            if (!Schema::hasColumn('organizations', 'password_policy')) {
                $table->json('password_policy')->nullable()->after('sso_provider');
            }
            if (!Schema::hasColumn('organizations', 'session_timeout')) {
                $table->integer('session_timeout')->default(30)->after('password_policy');
            }
            if (!Schema::hasColumn('organizations', 'ip_whitelist')) {
                $table->json('ip_whitelist')->nullable()->after('session_timeout');
            }
            if (!Schema::hasColumn('organizations', 'allowed_domains')) {
                $table->json('allowed_domains')->nullable()->after('ip_whitelist');
            }

            // Notification settings
            if (!Schema::hasColumn('organizations', 'email_notifications')) {
                $table->json('email_notifications')->nullable()->after('allowed_domains');
            }
            if (!Schema::hasColumn('organizations', 'push_notifications')) {
                $table->json('push_notifications')->nullable()->after('email_notifications');
            }
            if (!Schema::hasColumn('organizations', 'webhook_notifications')) {
                $table->json('webhook_notifications')->nullable()->after('push_notifications');
            }

            // Feature settings
            if (!Schema::hasColumn('organizations', 'chatbot_settings')) {
                $table->json('chatbot_settings')->nullable()->after('webhook_notifications');
            }
            if (!Schema::hasColumn('organizations', 'analytics_settings')) {
                $table->json('analytics_settings')->nullable()->after('chatbot_settings');
            }
            if (!Schema::hasColumn('organizations', 'integrations_settings')) {
                $table->json('integrations_settings')->nullable()->after('analytics_settings');
            }
            if (!Schema::hasColumn('organizations', 'custom_branding_settings')) {
                $table->json('custom_branding_settings')->nullable()->after('integrations_settings');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            // Drop all added columns
            $table->dropColumn([
                'display_name',
                'description',
                'logo',
                'timezone',
                'locale',
                'currency',
                'founded_year',
                'employee_count',
                'annual_revenue',
                'social_media',
                'api_key',
                'webhook_url',
                'webhook_secret',
                'rate_limit',
                'allowed_origins',
                'api_enabled',
                'webhook_enabled',
                'two_factor_enabled',
                'sso_enabled',
                'sso_provider',
                'password_policy',
                'session_timeout',
                'ip_whitelist',
                'allowed_domains',
                'email_notifications',
                'push_notifications',
                'webhook_notifications',
                'chatbot_settings',
                'analytics_settings',
                'integrations_settings',
                'custom_branding_settings'
            ]);
        });
    }
};
