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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('id');
            $table->foreignUuid('organization_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignUuid('user_id')->nullable()->constrained('users')->onDelete('set null');

            // Action Details
            $table->enum('action', ['create', 'update', 'delete', 'login', 'logout', 'export', 'import', 'view', 'download', 'api_call', 'payment', 'subscription_change']);
            $table->string('resource_type', 100);
            $table->foreignUuid('resource_id')->nullable();
            $table->string('resource_name', 255)->nullable();

            // Change Details
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->json('changes')->nullable();

            // Request Context
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->foreignUuid('api_key_id')->nullable()->constrained('api_keys');
            $table->string('session_id', 255)->nullable();

            // Additional Context
            $table->text('description')->nullable();
            $table->string('severity', 20)->default('info');

            // System fields
            $table->timestamp('created_at')->useCurrent();

            // Primary key and unique constraints
            $table->primary(['id', 'created_at']);
            $table->unique(['organization_id', 'resource_type', 'resource_id', 'created_at'], 'audit_logs_org_resource_time_unique');
            $table->check('severity IN (\'info\', \'warning\', \'error\', \'critical\')');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
