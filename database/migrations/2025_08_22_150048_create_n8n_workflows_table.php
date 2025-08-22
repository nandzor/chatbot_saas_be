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
        Schema::create('n8n_workflows', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');

            // Workflow Identity
            $table->string('workflow_id', 255);
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->string('category', 100)->nullable();
            $table->json('tags')->nullable();

            // Workflow Definition
            $table->json('workflow_data');
            $table->json('nodes')->default('[]');
            $table->json('connections')->default('{}');
            $table->json('settings')->default('{}');

            // Execution Configuration
            $table->string('trigger_type', 50)->nullable();
            $table->json('trigger_config')->default('{}');
            $table->string('schedule_expression', 100)->nullable();

            // Version Control
            $table->integer('version')->default(1);
            $table->foreignUuid('previous_version_id')->nullable()->constrained('n8n_workflows');
            $table->boolean('is_latest_version')->default(true);

            // Status & Health
            $table->enum('status', ['active', 'inactive', 'paused', 'error', 'testing'])->default('inactive');
            $table->boolean('is_enabled')->default(false);
            $table->timestamp('last_execution_at')->nullable();
            $table->timestamp('next_execution_at')->nullable();

            // Performance Metrics
            $table->integer('total_executions')->default(0);
            $table->integer('successful_executions')->default(0);
            $table->integer('failed_executions')->default(0);
            $table->integer('avg_execution_time')->nullable();

            // Access Control
            $table->foreignUuid('created_by')->nullable()->constrained('users');
            $table->json('shared_with')->default('[]');
            $table->json('permissions')->default('{"read": [], "write": [], "execute": []}');

            // Integration
            $table->string('webhook_url', 500)->nullable();
            $table->string('webhook_secret', 255)->nullable();
            $table->json('api_endpoints')->default('[]');

            // System fields
            $table->json('metadata')->default('{}');
            $table->timestamps();

            // Unique constraints for business logic
            $table->unique('workflow_id', 'n8n_workflows_workflow_id_unique');
            $table->unique(['organization_id', 'name'], 'n8n_workflows_org_name_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('n8n_workflows');
    }
};
