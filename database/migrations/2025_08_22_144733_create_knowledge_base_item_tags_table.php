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
        Schema::create('knowledge_base_item_tags', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('knowledge_item_id')->constrained('knowledge_base_items')->onDelete('cascade');
            $table->foreignUuid('tag_id')->constrained('knowledge_base_tags')->onDelete('cascade');

            // Tag Assignment Details
            $table->foreignUuid('assigned_by')->nullable()->constrained('users');
            $table->timestamp('assigned_at')->default(now());
            $table->boolean('is_auto_assigned')->default(false);
            $table->decimal('confidence_score', 3, 2)->nullable();

            // Unique constraints for business logic
            $table->unique(['knowledge_item_id', 'tag_id'], 'knowledge_base_item_tags_item_tag_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('knowledge_base_item_tags');
    }
};
