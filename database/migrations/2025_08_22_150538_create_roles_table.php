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
        Schema::create('roles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');

            // Role Identity
            $table->string('name', 100);
            $table->string('code', 50);
            $table->string('display_name', 255)->nullable();
            $table->text('description')->nullable();

            // Role Configuration
            $table->enum('scope', ['global', 'organization', 'department', 'team', 'personal'])->default('organization');
            $table->integer('level')->default(1);
            $table->boolean('is_system_role')->default(false);
            $table->boolean('is_default')->default(false);

            // Inheritance
            $table->uuid('parent_role_id')->nullable(); // Will add foreign key constraint after table creation
            $table->boolean('inherits_permissions')->default(true);

            // Access Control
            $table->integer('max_users')->nullable();
            $table->integer('current_users')->default(0);

            // UI/UX
            $table->string('color', 7)->default('#6B7280');
            $table->string('icon', 50)->nullable();
            $table->string('badge_text', 20)->nullable();

            // System fields
            $table->json('metadata')->default('{}');
            $table->enum('status', ['active', 'inactive', 'suspended', 'deleted', 'pending', 'draft', 'published', 'archived'])->default('active');
            $table->timestamps();

            $table->unique(['organization_id', 'code']);
        });

        // Add self-referencing foreign key constraint after table creation
        Schema::table('roles', function (Blueprint $table) {
            $table->foreign('parent_role_id')->references('id')->on('roles')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop foreign key constraint first
        Schema::table('roles', function (Blueprint $table) {
            $table->dropForeign(['parent_role_id']);
        });

        Schema::dropIfExists('roles');
    }
};
