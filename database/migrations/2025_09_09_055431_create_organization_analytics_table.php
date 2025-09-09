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
        Schema::create('organization_analytics', function (Blueprint $table) {
            $table->id();
            $table->uuid('organization_id');
            $table->foreign('organization_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->date('date');
            $table->integer('total_users')->default(0);
            $table->integer('active_users')->default(0);
            $table->integer('new_users')->default(0);
            $table->integer('total_conversations')->default(0);
            $table->integer('completed_conversations')->default(0);
            $table->decimal('avg_response_time', 8, 2)->default(0);
            $table->decimal('satisfaction_score', 3, 1)->default(0);
            $table->decimal('revenue', 10, 2)->default(0);
            $table->timestamps();

            $table->unique(['organization_id', 'date']);
            $table->index(['organization_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organization_analytics');
    }
};
