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
        Schema::create('waha_contacts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('session_id')->constrained('waha_sessions')->onDelete('cascade');
            
            // Contact Identity
            $table->string('contact_id', 255)->unique();
            $table->string('phone_number', 20);
            $table->string('name', 255)->nullable();
            $table->string('push_name', 255)->nullable();
            $table->string('short_name', 100)->nullable();
            
            // Profile Information
            $table->string('profile_picture_url', 500)->nullable();
            $table->text('status_message')->nullable();
            $table->timestamp('status_message_timestamp')->nullable();
            $table->boolean('is_contact')->default(false);
            $table->boolean('is_business')->default(false);
            $table->boolean('is_verified')->default(false);
            
            // Business Information
            $table->string('business_name', 255)->nullable();
            $table->string('business_category', 100)->nullable();
            $table->text('business_description')->nullable();
            $table->string('business_website', 255)->nullable();
            $table->string('business_email', 255)->nullable();
            $table->text('business_address')->nullable();
            $table->json('business_hours')->nullable();
            $table->boolean('has_catalog')->default(false);
            $table->boolean('catalog_enabled')->default(false);
            $table->integer('product_count')->default(0);
            $table->json('labels')->nullable();
            $table->json('label_colors')->nullable();
            $table->json('quick_replies')->nullable();
            $table->text('greeting_message')->nullable();
            $table->text('away_message')->nullable();
            $table->boolean('shopping_enabled')->default(false);
            $table->boolean('payment_enabled')->default(false);
            $table->boolean('cart_enabled')->default(false);
            
            // Interaction History
            $table->timestamp('last_seen')->nullable();
            $table->timestamp('last_message_at')->nullable();
            $table->integer('total_messages_sent')->default(0);
            $table->integer('total_messages_received')->default(0);
            $table->integer('total_media_sent')->default(0);
            $table->integer('total_media_received')->default(0);
            
            // Metadata
            $table->json('metadata')->default('{}');
            $table->enum('status_type', ['active', 'inactive', 'suspended', 'deleted', 'pending', 'draft', 'published', 'archived'])->default('active');
            $table->timestamps();
            
            $table->unique(['organization_id', 'session_id', 'phone_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('waha_contacts');
    }
};
