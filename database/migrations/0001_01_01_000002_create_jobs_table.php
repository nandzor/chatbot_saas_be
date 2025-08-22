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
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->string('queue', 100)->index();
            $table->longText('payload');
            $table->unsignedTinyInteger('attempts');
            $table->unsignedInteger('reserved_at')->nullable();
            $table->unsignedInteger('available_at');
            $table->unsignedInteger('created_at');

            // Enhanced indexes for chatbot queue processing
            $table->index(['queue', 'available_at'], 'jobs_queue_available_index');
            $table->index(['reserved_at', 'available_at'], 'jobs_reserved_available_index');
            $table->index('attempts', 'jobs_attempts_index');
        });

        Schema::create('job_batches', function (Blueprint $table) {
            $table->string('id', 255)->primary();
            $table->string('name', 255);
            $table->integer('total_jobs');
            $table->integer('pending_jobs');
            $table->integer('failed_jobs');
            $table->longText('failed_job_ids');
            $table->mediumText('options')->nullable();
            $table->integer('cancelled_at')->nullable();
            $table->integer('created_at');
            $table->integer('finished_at')->nullable();

            // Enhanced indexes for batch processing
            $table->index(['name', 'created_at'], 'job_batches_name_created_index');
            $table->index(['pending_jobs', 'failed_jobs'], 'job_batches_status_index');
            $table->index('finished_at', 'job_batches_finished_index');
        });

        Schema::create('failed_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('uuid', 255)->unique();
            $table->string('connection', 255);
            $table->string('queue', 255);
            $table->longText('payload');
            $table->longText('exception');
            $table->timestamp('failed_at')->useCurrent();

            // Enhanced indexes for failed job analysis
            $table->index(['queue', 'failed_at'], 'failed_jobs_queue_failed_index');
            $table->index('failed_at', 'failed_jobs_failed_at_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jobs');
        Schema::dropIfExists('job_batches');
        Schema::dropIfExists('failed_jobs');
    }
};
