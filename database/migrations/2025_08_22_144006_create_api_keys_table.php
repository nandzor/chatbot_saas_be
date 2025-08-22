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
        Schema::create('api_keys', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');
            $table->string('name', 255);
            $table->string('key_hash', 255)->unique();
            $table->string('key_prefix', 20);
            
            // Permissions & Scope
            $table->json('scopes')->default('["read"]');
            $table->json('permissions')->default('{}');
            $table->integer('rate_limit_per_minute')->default(60);
            $table->integer('rate_limit_per_hour')->default(1000);
            $table->integer('rate_limit_per_day')->default(10000);
            
            // Usage Tracking
            $table->timestamp('last_used_at')->nullable();
            $table->integer('total_requests')->default(0);
            
            // Expiration & Security
            $table->timestamp('expires_at')->nullable();
            $table->json('allowed_ips')->nullable();
            $table->json('user_agent_restrictions')->nullable();
            
            // System fields
            $table->enum('status', ['active', 'inactive', 'suspended', 'deleted', 'pending', 'draft', 'published', 'archived'])->default('active');
            $table->foreignUuid('created_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_keys');
    }
};
