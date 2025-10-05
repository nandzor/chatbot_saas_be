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
        Schema::table('bot_personalities', function (Blueprint $table) {
            // Remove unused Google Drive fields
            $table->dropColumn([
                'google_drive_file_id',
                'google_drive_file_type',
                'google_drive_file_name'
            ]);

            // Update google_drive_integration_enabled to be computed based on related files
            // We'll handle this in the model/service layer instead of storing it in DB
            $table->dropColumn('google_drive_integration_enabled');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bot_personalities', function (Blueprint $table) {
            // Re-add the fields if needed to rollback
            $table->string('google_drive_file_id')->nullable()->after('knowledge_base_item_id');
            $table->enum('google_drive_file_type', ['docs', 'sheets'])->nullable()->after('google_drive_file_id');
            $table->string('google_drive_file_name')->nullable()->after('google_drive_file_type');
            $table->boolean('google_drive_integration_enabled')->default(false)->after('google_drive_file_name');
        });
    }
};
