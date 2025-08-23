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
        Schema::create('permission_groups', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->nullable()->constrained()->onDelete('cascade');

            // Group Identity
            $table->string('name', 100);
            $table->string('code', 50);
            $table->string('display_name', 255)->nullable();
            $table->text('description')->nullable();

            // Grouping
            $table->string('category', 100)->nullable();
            $table->uuid('parent_group_id')->nullable(); // Will add foreign key constraint after table creation

            // UI/UX
            $table->string('icon', 50)->nullable();
            $table->string('color', 7)->default('#6B7280');
            $table->integer('sort_order')->default(0);

            // System fields
            $table->enum('status', ['active', 'inactive', 'suspended', 'deleted', 'pending', 'draft', 'published', 'archived'])->default('active');
            $table->timestamps();

            $table->unique(['organization_id', 'code']);
        });

        // Add self-referencing foreign key constraint after table creation
        Schema::table('permission_groups', function (Blueprint $table) {
            $table->foreign('parent_group_id')->references('id')->on('permission_groups')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop foreign key constraint first
        Schema::table('permission_groups', function (Blueprint $table) {
            $table->dropForeign(['parent_group_id']);
        });

        Schema::dropIfExists('permission_groups');
    }
};
