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
        Schema::create('system_logs', function (Blueprint $table) {
            $table->uuid('id');
            $table->foreignUuid('organization_id')->nullable()->constrained()->onDelete('cascade');
            
            // Log Identity
            $table->enum('level', ['debug', 'info', 'warn', 'error', 'fatal']);
            $table->string('logger_name', 255)->nullable();
            
            // Message Content
            $table->text('message');
            $table->text('formatted_message')->nullable();
            
            // Context Information
            $table->string('component', 100)->nullable();
            $table->string('service', 100)->nullable();
            $table->string('instance_id', 100)->nullable();
            
            // Request Context
            $table->string('request_id', 255)->nullable();
            $table->string('session_id', 255)->nullable();
            $table->foreignUuid('user_id')->nullable()->constrained('users');
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            
            // Error Details
            $table->string('error_code', 50)->nullable();
            $table->string('error_type', 100)->nullable();
            $table->text('stack_trace')->nullable();
            
            // Performance
            $table->integer('duration_ms')->nullable();
            $table->integer('memory_usage_mb')->nullable();
            $table->decimal('cpu_usage_percent', 5, 2)->nullable();
            
            // Additional Data
            $table->json('extra_data')->default('{}');
            $table->json('tags')->nullable();
            
            // System fields
            $table->timestamp('timestamp')->default(now());
            $table->timestamp('created_at')->useCurrent();
            
            $table->primary(['id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_logs');
    }
};
