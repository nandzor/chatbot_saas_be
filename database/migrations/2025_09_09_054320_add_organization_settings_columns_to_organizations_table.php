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
            $table->string('display_name')->nullable()->after('name');
            $table->text('description')->nullable()->after('address');
            $table->string('logo')->nullable()->after('description');
            $table->string('timezone')->default('UTC')->after('logo');
            $table->string('locale')->default('en')->after('timezone');
            $table->string('currency')->default('USD')->after('locale');

            // System settings
            $table->integer('founded_year')->nullable()->after('company_size');
            $table->integer('employee_count')->default(0)->after('founded_year');
            $table->decimal('annual_revenue', 15, 2)->default(0)->after('employee_count');
            $table->json('social_media')->nullable()->after('annual_revenue');

            // API settings
            $table->string('api_key')->nullable()->after('social_media');
            $table->string('webhook_url')->nullable()->after('api_key');
            $table->string('webhook_secret')->nullable()->after('webhook_url');
            $table->integer('rate_limit')->default(1000)->after('webhook_secret');
            $table->json('allowed_origins')->nullable()->after('rate_limit');
            $table->boolean('api_enabled')->default(false)->after('allowed_origins');
            $table->boolean('webhook_enabled')->default(false)->after('api_enabled');

            // Security settings
            $table->boolean('two_factor_enabled')->default(false)->after('webhook_enabled');
            $table->boolean('sso_enabled')->default(false)->after('two_factor_enabled');
            $table->string('sso_provider')->nullable()->after('sso_enabled');
            $table->json('password_policy')->nullable()->after('sso_provider');
            $table->integer('session_timeout')->default(30)->after('password_policy');
            $table->json('ip_whitelist')->nullable()->after('session_timeout');
            $table->json('allowed_domains')->nullable()->after('ip_whitelist');

            // Notification settings
            $table->json('email_notifications')->nullable()->after('allowed_domains');
            $table->json('push_notifications')->nullable()->after('email_notifications');
            $table->json('webhook_notifications')->nullable()->after('push_notifications');

            // Feature settings
            $table->json('chatbot_settings')->nullable()->after('webhook_notifications');
            $table->json('analytics_settings')->nullable()->after('chatbot_settings');
            $table->json('integrations_settings')->nullable()->after('analytics_settings');
            $table->json('custom_branding_settings')->nullable()->after('integrations_settings');
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
