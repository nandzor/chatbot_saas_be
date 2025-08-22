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
        Schema::create('enhanced_users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('organization_id');
            $table->string('email', 255);
            $table->string('username', 100);
            $table->string('password_hash', 255);
            $table->string('full_name', 255);
            $table->string('first_name', 100)->nullable();
            $table->string('last_name', 100)->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('avatar_url', 500)->nullable();
            $table->enum('role', ['super_admin', 'org_admin', 'agent', 'customer', 'viewer', 'moderator', 'developer'])->default('customer');

            // Authentication & Security
            $table->boolean('is_email_verified')->default(false);
            $table->boolean('is_phone_verified')->default(false);
            $table->boolean('two_factor_enabled')->default(false);
            $table->string('two_factor_secret', 255)->nullable();
            $table->json('backup_codes')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->ipAddress('last_login_ip')->nullable();
            $table->integer('login_count')->default(0);
            $table->integer('failed_login_attempts')->default(0);
            $table->timestamp('locked_until')->nullable();
            $table->timestamp('password_changed_at')->default(now());

            // Session Management
            $table->json('active_sessions')->default('[]');
            $table->integer('max_concurrent_sessions')->default(3);

            // UI/UX Preferences
            $table->json('ui_preferences')->default(json_encode([
                'theme' => 'light',
                'language' => 'id',
                'timezone' => 'Asia/Jakarta',
                'notifications' => ['email' => true, 'push' => true]
            ]));
            $table->json('dashboard_config')->default('{}');
            $table->json('notification_preferences')->default('{}');

            // Profile & Activity
            $table->text('bio')->nullable();
            $table->string('location', 255)->nullable();
            $table->string('department', 100)->nullable();
            $table->string('job_title', 100)->nullable();
            $table->json('skills')->nullable();
            $table->json('languages')->default(json_encode(['indonesia']));

            // API Access
            $table->boolean('api_access_enabled')->default(false);
            $table->integer('api_rate_limit')->default(100);

            // System fields
            $table->json('permissions')->default('{}');
            $table->enum('status', ['active', 'inactive', 'suspended', 'deleted', 'pending', 'draft'])->default('active');
            $table->timestamps();
            $table->timestamp('deleted_at')->nullable();

            // Foreign keys
            $table->foreign('organization_id')->references('id')->on('organizations')->onDelete('cascade');

            // Unique constraints for business logic
            $table->unique(['organization_id', 'email'], 'enhanced_users_org_email_unique');
            $table->unique(['organization_id', 'username'], 'enhanced_users_org_username_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enhanced_users');
    }
};

