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
        // RAG Workflows Table
        Schema::create('rag_workflows', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('organization_id');
            $table->uuid('bot_personality_id')->nullable();
            $table->string('n8n_workflow_id');
            $table->string('workflow_name');
            $table->string('workflow_type')->default('rag-integration');
            $table->json('config')->nullable();
            $table->json('rag_settings')->nullable();
            $table->json('selected_files')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();

            $table->index(['organization_id', 'bot_personality_id']);
            $table->index(['n8n_workflow_id']);
            $table->index(['status']);
        });

        // RAG Documents Table
        Schema::create('rag_documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('organization_id');
            $table->uuid('bot_personality_id');
            $table->string('file_id');
            $table->string('file_name');
            $table->string('file_type'); // 'google-sheets', 'google-docs', 'pdf'
            $table->string('content_hash');
            $table->integer('chunk_count')->default(0);
            $table->timestamp('last_processed_at')->nullable();
            $table->string('status')->default('active'); // 'active', 'inactive', 'error'
            $table->timestamps();

            $table->unique(['organization_id', 'bot_personality_id', 'file_id']);
            $table->index(['organization_id', 'bot_personality_id']);
            $table->index(['file_type']);
            $table->index(['status']);
        });

        // RAG Chunks Table
        Schema::create('rag_chunks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('document_id');
            $table->integer('chunk_index');
            $table->text('content');
            $table->string('content_hash');
            $table->json('metadata')->nullable();
            $table->text('embedding')->nullable(); // Vector embedding untuk similarity search
            $table->timestamps();

            $table->foreign('document_id')->references('id')->on('rag_documents')->onDelete('cascade');
            $table->index(['document_id', 'chunk_index']);
            $table->index(['content_hash']);
        });

        // RAG Queries Table (untuk tracking queries)
        Schema::create('rag_queries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('organization_id');
            $table->uuid('bot_personality_id');
            $table->text('query');
            $table->json('results')->nullable();
            $table->integer('result_count')->default(0);
            $table->float('similarity_threshold')->default(0.7);
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'bot_personality_id']);
            $table->index(['processed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rag_queries');
        Schema::dropIfExists('rag_chunks');
        Schema::dropIfExists('rag_documents');
        Schema::dropIfExists('rag_workflows');
    }
};
