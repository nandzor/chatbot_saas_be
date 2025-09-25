<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if columns already exist and are UUID type
        $columns = DB::select("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'webhook_events' AND column_name IN ('organization_id', 'subscription_id')");

        $needsUpdate = false;
        foreach ($columns as $column) {
            if ($column->data_type !== 'uuid') {
                $needsUpdate = true;
                break;
            }
        }

        if (!$needsUpdate) {
            // Columns are already UUID, just ensure the index exists
            Schema::table('webhook_events', function (Blueprint $table) {
                // Check if index exists before creating
                $indexExists = DB::select("SELECT indexname FROM pg_indexes WHERE tablename = 'webhook_events' AND indexname LIKE '%organization_id%gateway%status%'");
                if (empty($indexExists)) {
                    $table->index(['organization_id', 'gateway', 'status']);
                }
            });
            return;
        }

        Schema::table('webhook_events', function (Blueprint $table) {
            // Drop the existing foreign key constraints if they exist
            try {
                $table->dropForeign(['organization_id']);
            } catch (\Exception $e) {
                // Foreign key might not exist
            }

            try {
                $table->dropForeign(['subscription_id']);
            } catch (\Exception $e) {
                // Foreign key might not exist
            }

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
            // Drop the UUID foreign key constraints if they exist
            try {
                $table->dropForeign(['organization_id']);
            } catch (\Exception $e) {
                // Foreign key might not exist
            }

            try {
                $table->dropForeign(['subscription_id']);
            } catch (\Exception $e) {
                // Foreign key might not exist
            }

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
