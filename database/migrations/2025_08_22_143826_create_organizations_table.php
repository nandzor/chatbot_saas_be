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
        Schema::create('organizations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('org_code', 50);
            $table->string('name', 255);
            $table->string('display_name', 255)->nullable();
            $table->string('email', 255);
            $table->string('phone', 20)->nullable();
            $table->text('address')->nullable();
            $table->string('logo_url', 500)->nullable();
            $table->string('favicon_url', 500)->nullable();
            $table->string('website', 255)->nullable();
            $table->string('tax_id', 50)->nullable();
            $table->string('business_type', 100)->nullable();
            $table->string('industry', 100)->nullable();
            $table->string('company_size', 50)->nullable();
            $table->string('timezone', 100)->default('Asia/Jakarta');
            $table->string('locale', 10)->default('id');
            $table->string('currency', 3)->default('IDR');

            // Subscription & Billing
            $table->foreignUuid('subscription_plan_id')->nullable()->constrained('subscription_plans');
            $table->string('subscription_status', 20)->default('trial');
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('subscription_starts_at')->nullable();
            $table->timestamp('subscription_ends_at')->nullable();
            $table->enum('billing_cycle', ['monthly', 'quarterly', 'yearly', 'lifetime'])->default('monthly');

            // Usage Tracking
            $table->json('current_usage')->default('{
                "messages": 0,
                "ai_requests": 0,
                "api_calls": 0,
                "storage_mb": 0,
                "active_agents": 0,
                "active_channels": 0
            }');

            // UI/UX Configuration
            $table->json('theme_config')->default('{"primaryColor": "#3B82F6", "secondaryColor": "#10B981", "darkMode": false}');
            $table->json('branding_config')->default('{}');
            $table->json('feature_flags')->default('{}');
            $table->json('ui_preferences')->default('{}');

            // Business Configuration
            $table->json('business_hours')->default('{"timezone": "Asia/Jakarta", "days": {}}');
            $table->json('contact_info')->default('{}');
            $table->json('social_media')->default('{}');

            // Security Settings
            $table->json('security_settings')->default('{
                "password_policy": {"min_length": 8, "require_special": true},
                "session_timeout": 3600,
                "ip_whitelist": [],
                "two_factor_required": false
            }');

            // API Configuration
            $table->boolean('api_enabled')->default(false);
            $table->string('webhook_url', 500)->nullable();
            $table->string('webhook_secret', 255)->nullable();

            // System fields
            $table->json('settings')->default('{}');
            $table->json('metadata')->default('{}');
            $table->enum('status', ['active', 'inactive', 'suspended', 'deleted', 'pending', 'draft', 'published', 'archived'])->default('active');
            $table->timestamps();
            $table->softDeletes();

            // Unique constraints for business logic
            $table->unique('org_code', 'organizations_org_code_unique');
            $table->unique('email', 'organizations_email_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organizations');
    }
};
