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
        Schema::create('n8n_executions', function (Blueprint $table) {
            $table->uuid('id');
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('workflow_id')->constrained('n8n_workflows')->onDelete('cascade');

            // Execution Identity
            $table->string('execution_id', 255);
            $table->string('parent_execution_id', 255)->nullable();

            // Execution Details
            $table->enum('status', ['running', 'success', 'failed', 'cancelled', 'waiting', 'timeout'])->default('running');
            $table->string('mode', 20)->default('trigger');

            // Timing
            $table->timestamp('started_at')->default(now());
            $table->timestamp('finished_at')->nullable();
            $table->integer('duration_ms')->nullable();

            // Data Flow
            $table->json('input_data')->default('{}');
            $table->json('output_data')->default('{}');
            $table->json('execution_data')->default('{}');

            // Error Handling
            $table->text('error_message')->nullable();
            $table->json('error_details')->default('{}');
            $table->integer('retry_count')->default(0);
            $table->integer('max_retries')->default(3);

            // Node Execution Details
            $table->json('node_executions')->default('[]');
            $table->json('failed_nodes')->default('[]');

            // Performance
            $table->integer('memory_usage_mb')->nullable();
            $table->decimal('cpu_usage_percent', 5, 2)->nullable();

            // Webhook/Trigger Info
            $table->json('trigger_data')->default('{}');
            $table->json('webhook_response')->default('{}');

            // System fields
            $table->json('metadata')->default('{}');
            $table->timestamp('created_at')->useCurrent();

            // Primary key and unique constraints
            $table->primary(['id', 'created_at']);
            $table->unique('execution_id', 'n8n_executions_execution_id_unique');
            $table->unique(['workflow_id', 'execution_id'], 'n8n_executions_workflow_execution_unique');
            $table->check('mode IN (\'trigger\', \'manual\', \'retry\')');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('n8n_executions');
    }
};
