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
        Schema::create('api_rate_limits', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignUuid('api_key_id')->nullable()->constrained('api_keys')->onDelete('cascade');
            $table->ipAddress('ip_address')->nullable();

            // Rate Limiting
            $table->string('endpoint', 255)->nullable();
            $table->string('method', 10)->nullable();
            $table->integer('requests_count')->default(1);
            $table->timestamp('window_start')->default(now());
            $table->integer('window_duration_seconds')->default(60);

            // System fields
            $table->timestamps();

            // Unique constraints for business logic
            $table->unique(['api_key_id', 'endpoint', 'method', 'window_start'], 'api_rate_limits_key_endpoint_method_window_unique');
            $table->unique(['ip_address', 'endpoint', 'method', 'window_start'], 'api_rate_limits_ip_endpoint_method_window_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_rate_limits');
    }
};
