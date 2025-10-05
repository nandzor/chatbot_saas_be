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
        Schema::create('oauth_credentials', function (Blueprint $table) {
            $table->id();
            $table->string('organization_id');
            $table->string('service'); // 'google-sheets', 'google-docs', 'google-drive'
            $table->string('n8n_credential_id'); // N8N credential ID
            $table->text('access_token'); // Encrypted
            $table->text('refresh_token'); // Encrypted
            $table->timestamp('expires_at');
            $table->text('scope')->nullable();
            $table->timestamps();

            $table->unique(['organization_id', 'service']);
            $table->index(['expires_at']);
            $table->index(['n8n_credential_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('oauth_credentials');
    }
};
