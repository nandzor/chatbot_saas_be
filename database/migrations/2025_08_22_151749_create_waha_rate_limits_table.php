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
        Schema::create('waha_rate_limits', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('session_id')->constrained('waha_sessions')->onDelete('cascade');
            
            // Rate Limit Identity
            $table->string('rate_limit_type', 50);
            $table->string('window_type', 50)->default('sliding');
            $table->timestamp('window_start')->default(now());
            $table->timestamp('window_end')->nullable();
            
            // Limits & Counters
            $table->integer('limit_threshold');
            $table->integer('current_count')->default(0);
            $table->integer('remaining_count')->nullable();
            $table->decimal('usage_percentage', 5, 2)->nullable();
            
            // Rate Limit Status
            $table->boolean('is_active')->default(true);
            $table->boolean('is_exceeded')->default(false);
            $table->timestamp('exceeded_at')->nullable();
            $table->timestamp('reset_at')->nullable();
            
            // Configuration
            $table->json('config')->default('{}');
            $table->json('metadata')->default('{}');
            $table->enum('status_type', ['active', 'inactive', 'suspended', 'deleted', 'pending', 'draft', 'published', 'archived'])->default('active');
            $table->timestamps();
            
            $table->unique(['session_id', 'rate_limit_type', 'window_start']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('waha_rate_limits');
    }
};
