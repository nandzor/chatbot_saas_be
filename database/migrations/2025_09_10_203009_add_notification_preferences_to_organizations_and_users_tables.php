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
        Schema::table('organizations', function (Blueprint $table) {
            $table->json('notification_preferences')->nullable()->after('settings');
            $table->string('phone')->nullable()->after('email');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->json('notification_preferences')->nullable()->after('settings');
            $table->string('phone')->nullable()->after('email');
            $table->json('device_tokens')->nullable()->after('notification_preferences');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->dropColumn(['notification_preferences', 'phone']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['notification_preferences', 'phone', 'device_tokens']);
        });
    }
};
