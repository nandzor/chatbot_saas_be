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
        Schema::create('knowledge_base_item_relationships', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('source_item_id')->constrained('knowledge_base_items')->onDelete('cascade');
            $table->foreignUuid('target_item_id')->constrained('knowledge_base_items')->onDelete('cascade');
            
            // Relationship Details
            $table->string('relationship_type', 50);
            $table->decimal('strength', 3, 2)->default(0.5);
            $table->text('description')->nullable();
            
            // Auto-discovery
            $table->boolean('is_auto_discovered')->default(false);
            $table->string('discovery_method', 50)->nullable();
            $table->decimal('discovery_confidence', 3, 2)->nullable();
            
            // System fields
            $table->timestamps();
            
            $table->unique(['source_item_id', 'target_item_id', 'relationship_type']);
            $table->check('relationship_type IN (\'related\', \'prerequisite\', \'followup\', \'alternative\', \'supersedes\', \'references\')');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('knowledge_base_item_relationships');
    }
};
