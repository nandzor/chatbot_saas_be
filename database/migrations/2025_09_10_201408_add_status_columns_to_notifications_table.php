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
            $table->string('status')->default('pending')->after('is_read');
            $table->timestamp('email_sent_at')->nullable()->after('sent_at');
            $table->string('email_status')->nullable()->after('email_sent_at');
            $table->text('email_error')->nullable()->after('email_status');
            $table->timestamp('email_failed_at')->nullable()->after('email_error');
            $table->timestamp('webhook_sent_at')->nullable()->after('email_failed_at');
            $table->string('webhook_status')->nullable()->after('webhook_sent_at');
            $table->text('webhook_error')->nullable()->after('webhook_status');
            $table->timestamp('webhook_failed_at')->nullable()->after('webhook_error');
            $table->text('webhook_response')->nullable()->after('webhook_failed_at');
            $table->timestamp('in_app_sent_at')->nullable()->after('webhook_response');
            $table->string('in_app_status')->nullable()->after('in_app_sent_at');
            $table->text('in_app_error')->nullable()->after('in_app_status');
            $table->timestamp('in_app_failed_at')->nullable()->after('in_app_error');
            $table->text('error_message')->nullable()->after('in_app_failed_at');
            $table->timestamp('failed_at')->nullable()->after('error_message');
            $table->timestamp('sms_sent_at')->nullable()->after('failed_at');
            $table->string('sms_status')->nullable()->after('sms_sent_at');
            $table->text('sms_error')->nullable()->after('sms_status');
            $table->timestamp('sms_failed_at')->nullable()->after('sms_error');
            $table->string('sms_provider')->nullable()->after('sms_failed_at');
            $table->string('sms_message_id')->nullable()->after('sms_provider');
            $table->timestamp('push_sent_at')->nullable()->after('sms_message_id');
            $table->string('push_status')->nullable()->after('push_sent_at');
            $table->text('push_error')->nullable()->after('push_status');
            $table->timestamp('push_failed_at')->nullable()->after('push_error');
            $table->string('push_provider')->nullable()->after('push_failed_at');
            $table->string('push_message_id')->nullable()->after('push_provider');
            $table->integer('push_success_count')->nullable()->after('push_message_id');
            $table->integer('push_failure_count')->nullable()->after('push_success_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn([
                'status',
                'email_sent_at',
                'email_status',
                'email_error',
                'email_failed_at',
                'webhook_sent_at',
                'webhook_status',
                'webhook_error',
                'webhook_failed_at',
                'webhook_response',
                'in_app_sent_at',
                'in_app_status',
                'in_app_error',
                'in_app_failed_at',
                'error_message',
                'failed_at',
                'sms_sent_at',
                'sms_status',
                'sms_error',
                'sms_failed_at',
                'sms_provider',
                'sms_message_id',
                'push_sent_at',
                'push_status',
                'push_error',
                'push_failed_at',
                'push_provider',
                'push_message_id',
                'push_success_count',
                'push_failure_count'
            ]);
        });
    }
};
