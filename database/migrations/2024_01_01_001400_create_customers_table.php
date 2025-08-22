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
        Schema::create('customers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('organization_id');
            $table->string('external_id', 255)->nullable();

            // Basic Information
            $table->string('name', 255)->nullable();
            $table->string('first_name', 100)->nullable();
            $table->string('last_name', 100)->nullable();
            $table->string('email', 255)->nullable();
            $table->string('phone', 20)->nullable();

            // Channel Information
            $table->enum('channel', ['whatsapp', 'wordpress_sdk', 'telegram', 'webchat', 'api', 'facebook', 'instagram', 'line', 'slack', 'discord', 'teams', 'viber', 'wechat']);
            $table->string('channel_user_id', 255);

            // Profile & Preferences
            $table->string('avatar_url', 500)->nullable();
            $table->enum('language', ['indonesia', 'english', 'javanese', 'sundanese', 'balinese', 'minang', 'chinese', 'japanese', 'korean', 'spanish', 'french', 'german', 'arabic', 'thai', 'vietnamese'])->default('indonesia');
            $table->string('timezone', 100)->default('Asia/Jakarta');
            $table->json('profile_data')->default('{}');
            $table->json('preferences')->default('{}');

            // Segmentation & Marketing
            $table->json('tags')->nullable();
            $table->json('segments')->nullable();
            $table->string('source', 100)->nullable();
            $table->json('utm_data')->default('{}');

            // Interaction History
            $table->timestamp('last_interaction_at')->nullable();
            $table->integer('total_interactions')->default(0);
            $table->integer('total_messages')->default(0);
            $table->integer('avg_response_time')->nullable();
            $table->decimal('satisfaction_score', 3, 2)->nullable();

            // Behavioral Data
            $table->json('interaction_patterns')->default('{}');
            $table->json('interests')->nullable();
            $table->json('purchase_history')->default('[]');

            // AI Insights
            $table->json('sentiment_history')->default('[]');
            $table->json('intent_patterns')->default('{}');
            $table->decimal('engagement_score', 3, 2)->default(0);

            // System fields
            $table->text('notes')->nullable();
            $table->enum('status', ['active', 'inactive', 'suspended', 'deleted', 'pending', 'draft'])->default('active');
            $table->timestamps();

            // Foreign keys
            $table->foreign('organization_id')->references('id')->on('organizations')->onDelete('cascade');

            // Unique constraint
            $table->unique(['organization_id', 'channel', 'channel_user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};

