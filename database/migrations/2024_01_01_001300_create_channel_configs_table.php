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
        Schema::create('channel_configs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('organization_id');
            $table->enum('channel', ['whatsapp', 'wordpress_sdk', 'telegram', 'webchat', 'api', 'facebook', 'instagram', 'line', 'slack', 'discord', 'teams', 'viber', 'wechat']);
            $table->string('channel_identifier', 255);
            $table->string('name', 255);
            $table->string('display_name', 255)->nullable();
            $table->text('description')->nullable();

            // Bot Configuration
            $table->uuid('personality_id')->nullable();

            // Connection Settings
            $table->string('webhook_url', 500)->nullable();
            $table->text('api_key_encrypted')->nullable();
            $table->text('api_secret_encrypted')->nullable();
            $table->text('access_token_encrypted')->nullable();
            $table->text('refresh_token_encrypted')->nullable();
            $table->timestamp('token_expires_at')->nullable();

            // Channel-specific Settings
            $table->json('settings')->default('{}');
            $table->json('rate_limits')->default(json_encode(['messages_per_minute' => 60, 'messages_per_hour' => 1000]));

            // UI Configuration
            $table->json('widget_config')->default('{}');
            $table->json('theme_config')->default('{}');

            // Features & Capabilities
            $table->json('supported_message_types')->default(json_encode(['text']));
            $table->json('features')->default(json_encode(['typing_indicator' => true, 'read_receipts' => true, 'file_upload' => false]));

            // Status & Health
            $table->boolean('is_active')->default(true);
            $table->string('health_status', 20)->default('unknown');
            $table->timestamp('last_connected_at')->nullable();
            $table->text('last_error')->nullable();
            $table->integer('connection_attempts')->default(0);

            // Analytics
            $table->integer('total_messages_sent')->default(0);
            $table->integer('total_messages_received')->default(0);
            $table->decimal('uptime_percentage', 5, 2)->default(100);

            // System fields
            $table->enum('status', ['active', 'inactive', 'suspended', 'deleted', 'pending', 'draft'])->default('active');
            $table->timestamps();

            // Foreign keys
            $table->foreign('organization_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->foreign('personality_id')->references('id')->on('bot_personalities');

            // Unique constraint
            $table->unique(['organization_id', 'channel', 'channel_identifier']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('channel_configs');
    }
};

