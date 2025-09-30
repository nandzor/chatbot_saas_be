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
        Schema::table('channel_configs', function (Blueprint $table) {
            if (!Schema::hasColumn('channel_configs', 'type')) {
                $table->string('type', 50)->default('web')->after('name');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('channel_configs', function (Blueprint $table) {
            if (Schema::hasColumn('channel_configs', 'type')) {
                $table->dropColumn('type');
            }
        });
    }
};


