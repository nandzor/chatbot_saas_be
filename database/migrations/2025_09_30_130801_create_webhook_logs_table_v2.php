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
        Schema::create('webhook_logs', function (Blueprint $table) {
            $table->id();
            $table->string('message_id')->index();
            $table->string('organization_id')->index();
            $table->string('webhook_type')->index();
            $table->enum('status', ['processed', 'failed', 'duplicate'])->index();
            $table->json('payload')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            // Composite index for efficient duplicate checking
            $table->index(['message_id', 'organization_id', 'created_at']);

            // Index for cleanup queries
            $table->index(['created_at', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('webhook_logs');
    }
};
