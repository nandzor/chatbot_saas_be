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
        Schema::create('notification_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique(); // Template identifier (e.g., payment_success)
            $table->enum('type', ['email', 'sms', 'push', 'webhook'])->index(); // Notification type
            $table->string('category', 50)->index(); // payment, billing, subscription, system, security
            $table->string('subject', 255)->nullable(); // Email subject or push title
            $table->longText('body'); // Template body/content
            $table->json('variables')->nullable(); // Available variables for the template
            $table->json('settings')->nullable(); // Additional settings (priority, delay, etc.)
            $table->boolean('is_active')->default(true)->index(); // Whether template is active
            $table->string('language', 10)->default('id'); // Template language
            $table->string('version', 20)->default('1.0'); // Template version
            $table->text('description')->nullable(); // Template description
            $table->json('metadata')->nullable(); // Additional metadata
            $table->timestamps();

            // Indexes for performance
            $table->index(['type', 'category', 'is_active']);
            $table->index(['category', 'language', 'is_active']);
            $table->index(['name', 'type', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_templates');
    }
};
