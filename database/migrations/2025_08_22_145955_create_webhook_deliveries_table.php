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
        Schema::create('webhook_deliveries', function (Blueprint $table) {
            $table->uuid('id');
            $table->foreignUuid('webhook_id')->constrained()->onDelete('cascade');
            
            // Delivery Details
            $table->string('event_type', 100);
            $table->json('payload');
            
            // HTTP Details
            $table->integer('http_status')->nullable();
            $table->text('response_body')->nullable();
            $table->json('response_headers')->nullable();
            
            // Timing
            $table->timestamp('delivered_at')->default(now());
            $table->integer('response_time_ms')->nullable();
            
            // Retry Logic
            $table->integer('attempt_number')->default(1);
            $table->boolean('is_success')->default(false);
            $table->text('error_message')->nullable();
            $table->timestamp('next_retry_at')->nullable();
            
            // System fields
            $table->timestamp('created_at')->useCurrent();
            
            $table->primary(['id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('webhook_deliveries');
    }
};
