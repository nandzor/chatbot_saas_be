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
        Schema::create('waha_api_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('session_id')->constrained('waha_sessions')->onDelete('cascade');
            
            // Request Identity
            $table->string('request_id', 255)->unique();
            $table->string('endpoint', 255);
            $table->string('method', 10);
            $table->timestamp('request_timestamp')->default(now());
            
            // Request Data
            $table->json('request_headers')->nullable();
            $table->json('request_body')->nullable();
            $table->json('request_params')->nullable();
            $table->string('request_ip', 45)->nullable();
            $table->text('user_agent')->nullable();
            
            // Response Data
            $table->integer('response_status_code')->nullable();
            $table->json('response_headers')->nullable();
            $table->json('response_body')->nullable();
            $table->timestamp('response_timestamp')->nullable();
            
            // Performance Metrics
            $table->integer('response_time_ms')->nullable();
            $table->integer('request_size_bytes')->nullable();
            $table->integer('response_size_bytes')->nullable();
            
            // Processing Status
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'timeout'])->default('pending');
            $table->text('error_message')->nullable();
            $table->integer('retry_count')->default(0);
            $table->timestamp('retry_at')->nullable();
            
            // Rate Limiting
            $table->boolean('was_rate_limited')->default(false);
            $table->string('rate_limit_type', 50)->nullable();
            $table->integer('rate_limit_remaining')->nullable();
            $table->timestamp('rate_limit_reset_at')->nullable();
            
            // Metadata
            $table->json('metadata')->default('{}');
            $table->enum('status_type', ['active', 'inactive', 'suspended', 'deleted', 'pending', 'draft', 'published', 'archived'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('waha_api_requests');
    }
};
