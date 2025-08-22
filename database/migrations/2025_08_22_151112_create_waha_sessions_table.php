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
        Schema::create('waha_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('channel_config_id')->constrained('channel_configs');

            // Session Identity
            $table->string('session_name', 255);
            $table->string('phone_number', 20);
            $table->string('instance_id', 255);

            // Connection Status
            $table->enum('status', ['working', 'not_working', 'connecting', 'disconnected', 'error'])->default('connecting');
            $table->boolean('is_authenticated')->default(false);
            $table->boolean('is_connected')->default(false);
            $table->boolean('is_ready')->default(false);

            // Health & Monitoring
            $table->enum('health_status', ['healthy', 'warning', 'critical', 'unknown'])->default('unknown');
            $table->timestamp('last_health_check')->nullable();
            $table->integer('error_count')->default(0);
            $table->text('last_error')->nullable();

            // Business Features
            $table->boolean('has_business_features')->default(false);
            $table->string('business_name', 255)->nullable();
            $table->string('business_category', 100)->nullable();
            $table->text('business_description')->nullable();
            $table->string('business_website', 255)->nullable();
            $table->string('business_email', 255)->nullable();
            $table->text('business_address')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->string('verification_status', 50)->nullable();
            $table->json('business_hours')->nullable();
            $table->boolean('has_catalog')->default(false);
            $table->boolean('catalog_enabled')->default(false);
            $table->integer('product_count')->default(0);
            $table->json('labels')->nullable();
            $table->json('label_colors')->nullable();
            $table->json('quick_replies')->nullable();
            $table->text('greeting_message')->nullable();
            $table->text('away_message')->nullable();
            $table->boolean('shopping_enabled')->default(false);
            $table->boolean('payment_enabled')->default(false);
            $table->boolean('cart_enabled')->default(false);

            // Features & Capabilities
            $table->json('features')->default('{
                "media_upload": false,
                "voice_messages": false,
                "video_calls": false,
                "group_chat": false,
                "broadcast": false,
                "templates": false,
                "quick_replies": false,
                "labels": false,
                "catalog": false,
                "shopping": false,
                "payment": false
            }');

            // Rate Limiting
            $table->json('rate_limits')->default('{
                "messages_per_minute": 60,
                "messages_per_hour": 1000,
                "media_per_minute": 10,
                "media_per_hour": 100
            }');

            // Statistics
            $table->integer('total_messages_sent')->default(0);
            $table->integer('total_messages_received')->default(0);
            $table->integer('total_media_sent')->default(0);
            $table->integer('total_media_received')->default(0);
            $table->integer('total_contacts')->default(0);
            $table->integer('total_groups')->default(0);
            $table->timestamp('last_message_at')->nullable();
            $table->timestamp('last_media_at')->nullable();

            // Configuration
            $table->json('session_config')->default('{}');
            $table->json('webhook_config')->default('{}');
            $table->json('metadata')->default('{}');

            // System fields
            $table->enum('status_type', ['active', 'inactive', 'suspended', 'deleted', 'pending', 'draft', 'published', 'archived'])->default('active');
            $table->timestamps();

            // Unique constraints for business logic
            $table->unique(['organization_id', 'session_name'], 'waha_sessions_org_session_name_unique');
            $table->unique(['organization_id', 'phone_number'], 'waha_sessions_org_phone_unique');
            $table->unique(['organization_id', 'instance_id'], 'waha_sessions_org_instance_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('waha_sessions');
    }
};
