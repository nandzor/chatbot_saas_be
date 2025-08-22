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
        Schema::create('ai_training_data', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');
            $table->string('source_type', 50);
            $table->foreignUuid('source_id')->nullable();
            
            // Training Content
            $table->text('input_text');
            $table->text('expected_output')->nullable();
            $table->text('context')->nullable();
            $table->string('intent', 100)->nullable();
            $table->json('entities')->default('{}');
            
            // Quality & Validation
            $table->boolean('is_validated')->default(false);
            $table->decimal('validation_score', 3, 2)->nullable();
            $table->boolean('human_reviewed')->default(false);
            $table->foreignUuid('reviewed_by')->nullable()->constrained('users');
            $table->timestamp('reviewed_at')->nullable();
            
            // Training Metadata
            $table->enum('language', ['indonesia', 'english', 'javanese', 'sundanese', 'balinese', 'minang', 'chinese', 'japanese', 'korean', 'spanish', 'french', 'german', 'arabic', 'thai', 'vietnamese'])->default('indonesia');
            $table->enum('difficulty_level', ['basic', 'intermediate', 'advanced', 'expert'])->default('basic');
            $table->json('training_tags')->nullable();
            
            // System fields
            $table->enum('status', ['active', 'inactive', 'suspended', 'deleted', 'pending', 'draft', 'published', 'archived'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_training_data');
    }
};
