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
        // Fix the id column to have a default UUID value
        DB::statement('ALTER TABLE knowledge_base_item_tags ALTER COLUMN id SET DEFAULT gen_random_uuid()');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove the default value
        DB::statement('ALTER TABLE knowledge_base_item_tags ALTER COLUMN id DROP DEFAULT');
    }
};
