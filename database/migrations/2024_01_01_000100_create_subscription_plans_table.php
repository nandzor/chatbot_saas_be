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
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 100);
            $table->string('display_name', 255);
            $table->text('description')->nullable();
            $table->enum('tier', ['trial', 'starter', 'professional', 'enterprise', 'custom']);

            // Pricing
            $table->decimal('price_monthly', 10, 2)->default(0);
            $table->decimal('price_quarterly', 10, 2)->default(0);
            $table->decimal('price_yearly', 10, 2)->default(0);
            $table->string('currency', 3)->default('IDR');

            // Features & Limits
            $table->integer('max_agents')->default(1);
            $table->integer('max_channels')->default(1);
            $table->integer('max_knowledge_articles')->default(100);
            $table->integer('max_monthly_messages')->default(1000);
            $table->integer('max_monthly_ai_requests')->default(100);
            $table->integer('max_storage_gb')->default(1);
            $table->integer('max_api_calls_per_day')->default(1000);

            // Feature Flags
            $table->json('features')->default(json_encode([
                'ai_assistant' => false,
                'sentiment_analysis' => false,
                'auto_translation' => false,
                'advanced_analytics' => false,
                'custom_branding' => false,
                'api_access' => false,
                'priority_support' => false,
                'sso' => false,
                'webhook' => false,
                'custom_integrations' => false
            ]));

            // Plan Configuration
            $table->integer('trial_days')->default(14);
            $table->boolean('is_popular')->default(false);
            $table->boolean('is_custom')->default(false);
            $table->integer('sort_order')->default(0);

            // System fields
            $table->enum('status', ['active', 'inactive', 'suspended', 'deleted', 'pending', 'draft'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_plans');
    }
};

