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
        Schema::create('email_verification_tokens', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('email', 255);
            $table->string('token', 255);
            $table->string('type', 50)->default('organization_verification'); // organization_verification
            $table->uuid('user_id')->nullable();
            $table->uuid('organization_id')->nullable();
            $table->timestamp('expires_at');
            $table->boolean('is_used')->default(false);
            $table->timestamp('used_at')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['email', 'type']);
            $table->index(['token', 'type']);
            $table->index(['user_id', 'type']);
            $table->index(['organization_id', 'type']);
            $table->index('expires_at');
            $table->index('is_used');

            // Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('organization_id')->references('id')->on('organizations')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_verification_tokens');
    }
};
