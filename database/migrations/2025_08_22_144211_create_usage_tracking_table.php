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
        Schema::create('usage_tracking', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->enum('quota_type', ['messages', 'api_calls', 'storage', 'agents', 'channels', 'knowledge_articles', 'ai_requests']);
            
            // Usage Data
            $table->integer('used_amount')->default(0);
            $table->integer('quota_limit')->default(0);
            $table->integer('overage_amount')->default(0);
            
            // Billing
            $table->decimal('unit_cost', 10, 4)->default(0);
            $table->decimal('total_cost', 10, 2)->default(0);
            
            // System fields
            $table->timestamp('created_at')->useCurrent();
            
            $table->unique(['organization_id', 'date', 'quota_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usage_tracking');
    }
};
