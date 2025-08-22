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
        Schema::create('waha_business_features', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('session_id')->constrained('waha_sessions')->onDelete('cascade');

            // Business Identity
            $table->string('business_name', 255);
            $table->string('business_category', 100)->nullable();
            $table->text('business_description')->nullable();
            $table->string('business_website', 255)->nullable();
            $table->string('business_email', 255)->nullable();
            $table->text('business_address')->nullable();

            // Verification Status
            $table->boolean('is_verified')->default(false);
            $table->string('verification_status', 50)->nullable();
            $table->timestamp('verified_at')->nullable();

            // Business Hours & Configuration
            $table->json('business_hours')->nullable();
            $table->boolean('has_catalog')->default(false);
            $table->boolean('catalog_enabled')->default(false);
            $table->integer('product_count')->default(0);

            // UI Elements
            $table->json('labels')->nullable();
            $table->json('label_colors')->nullable();
            $table->json('quick_replies')->nullable();
            $table->text('greeting_message')->nullable();
            $table->text('away_message')->nullable();

            // Features
            $table->boolean('shopping_enabled')->default(false);
            $table->boolean('payment_enabled')->default(false);
            $table->boolean('cart_enabled')->default(false);

            // Metadata
            $table->json('metadata')->default('{}');
            $table->enum('status_type', ['active', 'inactive', 'suspended', 'deleted', 'pending', 'draft', 'published', 'archived'])->default('active');
            $table->timestamps();

            // Unique constraints for business logic
            $table->unique(['organization_id', 'session_id', 'business_name'], 'waha_business_features_org_session_name_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('waha_business_features');
    }
};
