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
        Schema::table('notifications', function (Blueprint $table) {
            // Scheduling columns
            $table->timestamp('scheduled_at')->nullable()->after('sent_at');
            $table->string('timezone')->nullable()->after('scheduled_at');
            $table->timestamp('cancelled_at')->nullable()->after('timezone');

            // Read receipt and tracking
            $table->string('user_agent')->nullable()->after('is_read');
            $table->string('ip_address')->nullable()->after('user_agent');

            // Additional metadata
            $table->json('metadata')->nullable()->after('data');
            $table->string('correlation_id')->nullable()->after('metadata');
            $table->integer('retry_count')->default(0)->after('correlation_id');
            $table->timestamp('last_retry_at')->nullable()->after('retry_count');

            // Delivery confirmation
            $table->boolean('delivery_confirmed')->default(false)->after('last_retry_at');
            $table->timestamp('delivery_confirmed_at')->nullable()->after('delivery_confirmed');

            // Add indexes for performance
            $table->index(['status', 'scheduled_at']);
            $table->index(['correlation_id']);
            $table->index(['created_at', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex(['status', 'scheduled_at']);
            $table->dropIndex(['correlation_id']);
            $table->dropIndex(['created_at', 'status']);

            $table->dropColumn([
                'scheduled_at',
                'timezone',
                'cancelled_at',
                'user_agent',
                'ip_address',
                'metadata',
                'correlation_id',
                'retry_count',
                'last_retry_at',
                'delivery_confirmed',
                'delivery_confirmed_at'
            ]);
        });
    }
};
