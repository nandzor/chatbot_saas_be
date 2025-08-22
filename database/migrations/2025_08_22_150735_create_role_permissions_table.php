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
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('role_id')->constrained('roles')->onDelete('cascade');
            $table->foreignUuid('permission_id')->constrained('permissions')->onDelete('cascade');
            
            // Permission Configuration
            $table->boolean('is_granted')->default(true);
            $table->boolean('is_inherited')->default(false);
            
            // Conditions & Overrides
            $table->json('conditions')->default('{}');
            $table->json('constraints')->default('{}');
            
            // Audit
            $table->foreignUuid('granted_by')->nullable()->constrained('users');
            $table->timestamp('granted_at')->default(now());
            
            // System fields
            $table->json('metadata')->default('{}');
            $table->timestamps();
            
            $table->unique(['role_id', 'permission_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_permissions');
    }
};
