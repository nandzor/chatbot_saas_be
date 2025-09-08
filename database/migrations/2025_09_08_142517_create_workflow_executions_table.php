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
        Schema::create('workflow_executions', function (Blueprint $table) {
            $table->id();
            $table->string('workflow_id')->index();
            $table->string('execution_id')->unique();
            $table->uuid('organization_id')->index();
            $table->string('session_id')->index();
            $table->string('user_phone')->nullable();
            $table->string('event_type', 100)->index();
            $table->json('metrics');
            $table->timestamp('timestamp')->index();
            $table->timestamps();

            // Indexes for performance
            $table->index(['organization_id', 'timestamp']);
            $table->index(['workflow_id', 'timestamp']);
            $table->index(['event_type', 'timestamp']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workflow_executions');
    }
};
