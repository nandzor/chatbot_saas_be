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
        Schema::create('permissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->nullable()->constrained()->onDelete('cascade');
            
            // Permission Identity
            $table->string('name', 100);
            $table->string('code', 100);
            $table->string('display_name', 255)->nullable();
            $table->text('description')->nullable();
            
            // Permission Details
            $table->enum('resource', ['users', 'agents', 'customers', 'chat_sessions', 'messages', 'knowledge_articles', 'knowledge_categories', 'bot_personalities', 'channel_configs', 'ai_models', 'workflows', 'analytics', 'billing', 'subscriptions', 'api_keys', 'webhooks', 'system_logs', 'organizations', 'roles', 'permissions', 'inbox']);
            $table->enum('action', ['create', 'read', 'update', 'delete', 'execute', 'approve', 'publish', 'export', 'import', 'manage', 'view_all', 'view_own', 'edit_all', 'edit_own']);
            $table->enum('scope', ['global', 'organization', 'department', 'team', 'personal'])->default('organization');
            
            // Conditions & Constraints
            $table->json('conditions')->default('{}');
            $table->json('constraints')->default('{}');
            
            // Grouping
            $table->string('category', 100)->nullable();
            $table->string('group_name', 100)->nullable();
            
            // System fields
            $table->boolean('is_system_permission')->default(false);
            $table->boolean('is_dangerous')->default(false);
            $table->boolean('requires_approval')->default(false);
            
            // UI/UX
            $table->integer('sort_order')->default(0);
            $table->boolean('is_visible')->default(true);
            
            // System fields
            $table->json('metadata')->default('{}');
            $table->enum('status', ['active', 'inactive', 'suspended', 'deleted', 'pending', 'draft', 'published', 'archived'])->default('active');
            $table->timestamps();
            
            $table->unique(['organization_id', 'code']);
            $table->unique(['resource', 'action', 'scope', 'organization_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permissions');
    }
};
