<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop the existing foreign key constraint manually
        DB::statement('ALTER TABLE channel_configs DROP CONSTRAINT IF EXISTS channel_configs_personality_id_foreign');

        // Add the foreign key constraint with SET NULL on delete
        DB::statement('ALTER TABLE channel_configs ADD CONSTRAINT channel_configs_personality_id_foreign FOREIGN KEY (personality_id) REFERENCES bot_personalities(id) ON DELETE SET NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the foreign key constraint
        DB::statement('ALTER TABLE channel_configs DROP CONSTRAINT IF EXISTS channel_configs_personality_id_foreign');

        // Add back the original foreign key constraint without onDelete
        DB::statement('ALTER TABLE channel_configs ADD CONSTRAINT channel_configs_personality_id_foreign FOREIGN KEY (personality_id) REFERENCES bot_personalities(id)');
    }
};
