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
        // Database query cache for heavy operations
        Schema::create('chatbot_query_cache', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('query_hash', 255)->unique();
            $table->string('table_name', 100);
            $table->longText('query_sql');
            $table->longText('result_data');
            $table->json('dependencies')->default('[]'); // table names this query depends on
            $table->integer('hit_count')->default(0);
            $table->timestamp('expires_at');
            $table->timestamp('last_accessed_at');
            $table->timestamps();

            // Indexes for query cache management
            $table->index(['table_name', 'expires_at'], 'query_cache_table_expires_index');
            $table->index('expires_at', 'query_cache_expires_index');
            $table->index(['hit_count', 'last_accessed_at'], 'query_cache_usage_index');
        });

        // Lock management for concurrent operations
        Schema::create('chatbot_locks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('lock_key', 255)->unique();
            $table->string('lock_type', 100); // session, ai_processing, data_sync, etc
            $table->string('owner_id', 255); // process/session that owns the lock
            $table->json('lock_data')->default('{}');
            $table->timestamp('acquired_at');
            $table->timestamp('expires_at');
            $table->timestamps();

            // Indexes for lock management
            $table->index(['lock_type', 'expires_at'], 'chatbot_locks_type_expires_index');
            $table->index('expires_at', 'chatbot_locks_expires_index');
            $table->index('owner_id', 'chatbot_locks_owner_index');
        });

        // Database health monitoring
        Schema::create('chatbot_db_health', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('metric_name', 100);
            $table->decimal('metric_value', 20, 6);
            $table->string('metric_unit', 50)->nullable();
            $table->json('details')->default('{}');
            $table->enum('status', ['healthy', 'warning', 'critical'])->default('healthy');
            $table->timestamp('measured_at');
            $table->timestamps();

            // Indexes for health monitoring
            $table->index(['metric_name', 'measured_at'], 'db_health_metric_time_index');
            $table->index(['status', 'measured_at'], 'db_health_status_time_index');
            $table->index('measured_at', 'db_health_time_index');
        });

        // Migration tracking with enhanced metadata
        Schema::create('chatbot_migration_log', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('migration_file', 500);
            $table->integer('batch');
            $table->enum('status', ['pending', 'running', 'completed', 'failed', 'rolled_back'])->default('pending');
            $table->text('sql_executed')->nullable();
            $table->text('error_message')->nullable();
            $table->decimal('execution_time', 10, 3)->nullable(); // in seconds
            $table->json('metadata')->default('{}');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            // Indexes for migration management
            $table->index(['batch', 'status'], 'migration_log_batch_status_index');
            $table->index(['status', 'started_at'], 'migration_log_status_time_index');
            $table->index('migration_file', 'migration_log_file_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chatbot_migration_log');
        Schema::dropIfExists('chatbot_db_health');
        Schema::dropIfExists('chatbot_locks');
        Schema::dropIfExists('chatbot_query_cache');
    }
};
