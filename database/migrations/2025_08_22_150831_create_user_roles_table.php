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
        Schema::create('user_roles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('role_id')->constrained('roles')->onDelete('cascade');
            
            // Assignment Details
            $table->boolean('is_active')->default(true);
            $table->boolean('is_primary')->default(false);
            
            // Scope & Context
            $table->enum('scope', ['global', 'organization', 'department', 'team', 'personal'])->default('organization');
            $table->json('scope_context')->default('{}');
            
            // Temporal Control
            $table->timestamp('effective_from')->default(now());
            $table->timestamp('effective_until')->nullable();
            
            // Assignment Audit
            $table->foreignUuid('assigned_by')->nullable()->constrained('users');
            $table->text('assigned_reason')->nullable();
            
            // System fields
            $table->json('metadata')->default('{}');
            $table->timestamps();
            
            $table->unique(['user_id', 'role_id', 'scope']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_roles');
    }
};
