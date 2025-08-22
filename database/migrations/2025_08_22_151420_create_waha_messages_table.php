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
        Schema::create('waha_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('session_id')->constrained('waha_sessions')->onDelete('cascade');
            
            // Message Identity
            $table->string('message_id', 255)->unique();
            $table->string('chat_id', 255);
            $table->string('from_me', 10)->default('false');
            $table->string('from', 20);
            $table->string('to', 20);
            $table->string('chat_type', 20)->default('individual');
            
            // Message Content
            $table->text('text')->nullable();
            $table->string('type', 50)->default('text');
            $table->json('media_data')->nullable();
            $table->json('location_data')->nullable();
            $table->json('contact_data')->nullable();
            $table->json('sticker_data')->nullable();
            $table->json('reaction_data')->nullable();
            $table->json('quoted_message_data')->nullable();
            $table->json('forwarded_message_data')->nullable();
            $table->json('reply_data')->nullable();
            $table->json('button_data')->nullable();
            $table->json('list_data')->nullable();
            $table->json('template_data')->nullable();
            $table->json('interactive_data')->nullable();
            $table->json('order_data')->nullable();
            $table->json('product_data')->nullable();
            $table->json('catalog_data')->nullable();
            $table->json('payment_data')->nullable();
            $table->json('system_data')->nullable();
            $table->json('unknown_data')->nullable();
            
            // Message Status
            $table->string('status', 50)->default('sent');
            $table->timestamp('timestamp')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('played_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->text('failure_reason')->nullable();
            
            // Message Properties
            $table->boolean('is_forwarded')->default(false);
            $table->boolean('is_reply')->default(false);
            $table->boolean('is_edited')->default(false);
            $table->boolean('is_deleted')->default(false);
            $table->boolean('is_starred')->default(false);
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_broadcast')->default(false);
            $table->boolean('is_community')->default(false);
            $table->boolean('is_ephemeral')->default(false);
            $table->integer('ephemeral_timer')->nullable();
            
            // Group Message Properties
            $table->string('group_id', 255)->nullable();
            $table->string('group_name', 255)->nullable();
            $table->string('group_participant_count', 10)->nullable();
            $table->string('group_participants', 255)->nullable();
            $table->string('group_admins', 255)->nullable();
            $table->string('group_super_admins', 255)->nullable();
            $table->string('group_invite_code', 255)->nullable();
            $table->string('group_invite_link', 500)->nullable();
            $table->boolean('group_is_announcement')->default(false);
            $table->boolean('group_is_community')->default(false);
            $table->boolean('group_is_ephemeral')->default(false);
            $table->integer('group_ephemeral_timer')->nullable();
            $table->timestamp('group_created_at')->nullable();
            $table->timestamp('group_updated_at')->nullable();
            
            // Business Message Properties
            $table->string('business_phone_number', 20)->nullable();
            $table->string('business_name', 255)->nullable();
            $table->string('business_category', 100)->nullable();
            $table->text('business_description')->nullable();
            $table->string('business_website', 255)->nullable();
            $table->string('business_email', 255)->nullable();
            $table->text('business_address')->nullable();
            $table->json('business_hours')->nullable();
            $table->boolean('business_has_catalog')->default(false);
            $table->boolean('business_catalog_enabled')->default(false);
            $table->integer('business_product_count')->default(0);
            $table->json('business_labels')->nullable();
            $table->json('business_label_colors')->nullable();
            $table->json('business_quick_replies')->nullable();
            $table->text('business_greeting_message')->nullable();
            $table->text('business_away_message')->nullable();
            $table->boolean('business_shopping_enabled')->default(false);
            $table->boolean('business_payment_enabled')->default(false);
            $table->boolean('business_cart_enabled')->default(false);
            
            // Metadata
            $table->json('metadata')->default('{}');
            $table->enum('status_type', ['active', 'inactive', 'suspended', 'deleted', 'pending', 'draft', 'published', 'archived'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('waha_messages');
    }
};
