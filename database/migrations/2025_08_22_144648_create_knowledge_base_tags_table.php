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
        Schema::create('knowledge_base_tags', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');

            // Tag Information
            $table->string('name', 100);
            $table->string('slug', 100);
            $table->text('description')->nullable();
            $table->string('color', 7)->default('#6B7280');
            $table->string('icon', 50)->nullable();

            // Tag Classification
            $table->string('tag_type', 20)->default('general');
            $table->foreignUuid('parent_tag_id')->nullable()->constrained('knowledge_base_tags');

            // Usage Statistics
            $table->integer('usage_count')->default(0);
            $table->integer('item_count')->default(0);

            // Configuration
            $table->boolean('is_system_tag')->default(false);
            $table->boolean('is_auto_suggested')->default(true);
            $table->json('auto_apply_rules')->default('{}');

            // System fields
            $table->enum('status', ['active', 'inactive', 'suspended', 'deleted', 'pending', 'draft', 'published', 'archived'])->default('active');
            $table->timestamps();

            // Unique constraints for business logic
            $table->unique(['organization_id', 'slug'], 'knowledge_base_tags_org_slug_unique');
            $table->unique(['organization_id', 'name'], 'knowledge_base_tags_org_name_unique');
            $table->check('tag_type IN (\'general\', \'category\', \'topic\', \'skill\', \'department\', \'product\', \'service\')');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('knowledge_base_tags');
    }
};
