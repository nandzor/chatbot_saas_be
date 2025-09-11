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
        Schema::table('webhook_events', function (Blueprint $table) {
            // Drop the existing foreign key constraints
            $table->dropForeign(['organization_id']);
            $table->dropForeign(['subscription_id']);

            // Drop the existing columns
            $table->dropColumn(['organization_id', 'subscription_id']);
        });

        Schema::table('webhook_events', function (Blueprint $table) {
            // Add the new UUID columns with foreign key constraints
            $table->foreignUuid('organization_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('subscription_id')->nullable()->constrained()->onDelete('set null');

            // Re-add the index that was on the original column
            $table->index(['organization_id', 'gateway', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('webhook_events', function (Blueprint $table) {
            // Drop the UUID foreign key constraints
            $table->dropForeign(['organization_id']);
            $table->dropForeign(['subscription_id']);

            // Drop the UUID columns
            $table->dropColumn(['organization_id', 'subscription_id']);
        });

        Schema::table('webhook_events', function (Blueprint $table) {
            // Restore the original bigint columns with foreign key constraints
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('subscription_id')->nullable()->constrained()->onDelete('set null');

            // Re-add the index
            $table->index(['organization_id', 'gateway', 'status']);
        });
    }
};
