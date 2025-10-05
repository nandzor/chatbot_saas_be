<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bot_personality_drive_files', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('bot_personality_id')->constrained('bot_personalities')->onDelete('cascade');

            // Google Drive file info
            $table->string('file_id', 255);
            $table->string('file_name', 512);
            $table->string('mime_type', 255)->nullable();
            $table->string('web_view_link', 1024)->nullable();
            $table->string('icon_link', 1024)->nullable();
            $table->bigInteger('size')->nullable();

            $table->json('metadata')->nullable();

            $table->timestamps();

            $table->index(['organization_id', 'bot_personality_id']);
            $table->unique(['bot_personality_id', 'file_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bot_personality_drive_files');
    }
};


