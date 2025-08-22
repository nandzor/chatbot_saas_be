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
        Schema::create('realtime_metrics', function (Blueprint $table) {
            $table->uuid('id');
            $table->foreignUuid('organization_id')->nullable()->constrained()->onDelete('cascade');
            
            // Metric Identity
            $table->string('metric_name', 255);
            $table->enum('metric_type', ['counter', 'gauge', 'histogram', 'summary']);
            $table->string('namespace', 100)->default('default');
            
            // Metric Value
            $table->decimal('value', 15, 6);
            $table->string('unit', 20)->nullable();
            
            // Dimensions/Labels
            $table->json('labels')->default('{}');
            $table->json('dimensions')->default('{}');
            
            // Source Information
            $table->string('source', 100)->nullable();
            $table->string('component', 100)->nullable();
            $table->string('instance_id', 100)->nullable();
            
            // Aggregation Support
            $table->string('aggregation_period', 20)->nullable();
            $table->string('aggregation_type', 20)->nullable();
            
            // Time Information
            $table->timestamp('timestamp')->default(now());
            
            // Additional Context
            $table->json('context')->default('{}');
            $table->json('metadata')->default('{}');
            
            // System fields
            $table->timestamp('created_at')->useCurrent();
            
            $table->primary(['id', 'created_at']);
            $table->check('aggregation_type IN (\'sum\', \'avg\', \'min\', \'max\', \'count\')');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('realtime_metrics');
    }
};
