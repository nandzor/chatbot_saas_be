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
        Schema::create('waha_groups', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('session_id')->constrained('waha_sessions')->onDelete('cascade');

            // Group Identity
            $table->string('group_id', 255);
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->string('profile_picture_url', 500)->nullable();

            // Group Configuration
            $table->boolean('is_announcement')->default(false);
            $table->boolean('is_community')->default(false);
            $table->boolean('is_ephemeral')->default(false);
            $table->integer('ephemeral_timer')->nullable();

            // Member Information
            $table->integer('participant_count')->default(0);
            $table->json('participants')->default('[]');
            $table->json('admins')->default('[]');
            $table->json('super_admins')->default('[]');
            $table->string('invite_code', 255)->nullable();
            $table->string('invite_link', 500)->nullable();

            // Group Settings
            $table->boolean('only_admins_can_send_messages')->default(false);
            $table->boolean('only_admins_can_edit_info')->default(false);
            $table->boolean('only_admins_can_edit_settings')->default(false);
            $table->boolean('only_admins_can_invite')->default(false);
            $table->boolean('only_admins_can_pin_messages')->default(false);
            $table->boolean('only_admins_can_manage_calls')->default(false);
            $table->boolean('only_admins_can_manage_webhooks')->default(false);

            // Activity & Statistics
            $table->timestamp('last_activity_at')->nullable();
            $table->integer('total_messages')->default(0);
            $table->integer('total_media_messages')->default(0);
            $table->json('recent_messages')->default('[]');

            // Metadata
            $table->json('metadata')->default('{}');
            $table->enum('status_type', ['active', 'inactive', 'suspended', 'deleted', 'pending', 'draft', 'published', 'archived'])->default('active');
            $table->timestamps();

            // Unique constraints for business logic
            $table->unique(['organization_id', 'group_id'], 'waha_groups_org_group_id_unique');
            $table->unique(['session_id', 'group_id'], 'waha_groups_session_group_id_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('waha_groups');
    }
};
