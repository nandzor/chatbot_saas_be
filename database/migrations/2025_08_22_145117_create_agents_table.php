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
        Schema::create('agents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->unique()->constrained()->onDelete('cascade');
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');
            $table->string('agent_code', 50);

            // Profile Information
            $table->string('display_name', 255)->nullable();
            $table->string('department', 100)->nullable();
            $table->string('job_title', 100)->nullable();
            $table->json('specialization')->nullable();
            $table->text('bio')->nullable();

            // Capacity & Availability
            $table->integer('max_concurrent_chats')->default(5);
            $table->integer('current_active_chats')->default(0);
            $table->string('availability_status', 20)->default('offline');
            $table->boolean('auto_accept_chats')->default(false);

            // Working Schedule
            $table->json('working_hours')->default('{}');
            $table->json('breaks')->default('[]');
            $table->json('time_off')->default('[]');

            // Skills & Languages
            $table->json('skills')->nullable();
            $table->json('languages')->default('["indonesia"]');
            $table->json('expertise_areas')->nullable();
            $table->json('certifications')->nullable();

            // Performance Metrics
            $table->json('performance_metrics')->default('{"response_time": 0, "resolution_rate": 0, "satisfaction": 0}');
            $table->decimal('rating', 3, 2)->default(0.00);
            $table->integer('total_handled_chats')->default(0);
            $table->integer('total_resolved_chats')->default(0);
            $table->integer('avg_response_time')->nullable();
            $table->integer('avg_resolution_time')->nullable();

            // AI Assistance
            $table->boolean('ai_suggestions_enabled')->default(true);
            $table->boolean('ai_auto_responses_enabled')->default(false);

            // Gamification & Motivation
            $table->integer('points')->default(0);
            $table->integer('level')->default(1);
            $table->json('badges')->nullable();
            $table->json('achievements')->default('[]');

            // System fields
            $table->enum('status', ['active', 'inactive', 'suspended', 'deleted', 'pending', 'draft', 'published', 'archived'])->default('active');
            $table->timestamps();

            // Unique constraints for business logic
            $table->unique(['organization_id', 'agent_code'], 'agents_org_agent_code_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agents');
    }
};
