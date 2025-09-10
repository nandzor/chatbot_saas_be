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
        Schema::create('system_configurations', function (Blueprint $table) {
            $table->id();
            $table->string('category', 100)->index(); // payment_gateways, billing, email, system, etc.
            $table->string('key', 100)->index(); // Configuration key
            $table->text('value'); // Configuration value
            $table->enum('type', ['string', 'integer', 'float', 'boolean', 'json', 'array'])->default('string');
            $table->text('description')->nullable(); // Description of the configuration
            $table->boolean('is_public')->default(false); // Whether this config can be accessed publicly
            $table->boolean('is_editable')->default(true); // Whether this config can be edited via admin
            $table->json('validation_rules')->nullable(); // Validation rules for the value
            $table->json('options')->nullable(); // Available options for select/radio inputs
            $table->string('default_value')->nullable(); // Default value
            $table->integer('sort_order')->default(0); // Sort order for display
            $table->timestamps();

            // Unique constraint
            $table->unique(['category', 'key']);

            // Indexes for performance
            $table->index(['category', 'is_public']);
            $table->index(['is_editable', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_configurations');
    }
};
