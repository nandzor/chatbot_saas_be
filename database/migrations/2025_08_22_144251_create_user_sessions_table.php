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
        Schema::create('user_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->onDelete('cascade');
            $table->string('session_token', 255);

            // Session Details
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->json('device_info')->default('{}');
            $table->json('location_info')->default('{}');

            // Security
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_activity_at')->default(now());

            // System fields
            $table->timestamps();
            $table->timestamp('expires_at');

            // Unique constraints for business logic
            $table->unique('session_token', 'user_sessions_session_token_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_sessions');
    }
};
