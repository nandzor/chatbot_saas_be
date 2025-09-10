<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NotificationTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating notification templates...');

        $templates = [
            // Payment Notifications
            [
                'name' => 'payment_success',
                'type' => 'email',
                'category' => 'payment',
                'subject' => 'Pembayaran Berhasil - {{organization_name}}',
                'body' => $this->getPaymentSuccessTemplate(),
                'variables' => json_encode([
                    'organization_name',
                    'amount',
                    'currency',
                    'payment_method',
                    'transaction_id',
                    'date'
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'payment_failure',
                'type' => 'email',
                'category' => 'payment',
                'subject' => 'Pembayaran Gagal - {{organization_name}}',
                'body' => $this->getPaymentFailureTemplate(),
                'variables' => json_encode([
                    'organization_name',
                    'amount',
                    'currency',
                    'payment_method',
                    'transaction_id',
                    'failure_reason',
                    'date'
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'payment_refund',
                'type' => 'email',
                'category' => 'payment',
                'subject' => 'Pengembalian Dana - {{organization_name}}',
                'body' => $this->getPaymentRefundTemplate(),
                'variables' => json_encode([
                    'organization_name',
                    'amount',
                    'currency',
                    'refund_amount',
                    'transaction_id',
                    'refund_reason',
                    'date'
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Billing Notifications
            [
                'name' => 'invoice_generated',
                'type' => 'email',
                'category' => 'billing',
                'subject' => 'Tagihan Baru - {{organization_name}}',
                'body' => $this->getInvoiceGeneratedTemplate(),
                'variables' => json_encode([
                    'organization_name',
                    'invoice_number',
                    'amount',
                    'currency',
                    'due_date',
                    'billing_period'
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'invoice_overdue',
                'type' => 'email',
                'category' => 'billing',
                'subject' => 'Tagihan Jatuh Tempo - {{organization_name}}',
                'body' => $this->getInvoiceOverdueTemplate(),
                'variables' => json_encode([
                    'organization_name',
                    'invoice_number',
                    'amount',
                    'currency',
                    'due_date',
                    'overdue_days'
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'invoice_paid',
                'type' => 'email',
                'category' => 'billing',
                'subject' => 'Tagihan Lunas - {{organization_name}}',
                'body' => $this->getInvoicePaidTemplate(),
                'variables' => json_encode([
                    'organization_name',
                    'invoice_number',
                    'amount',
                    'currency',
                    'payment_date',
                    'payment_method'
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Subscription Notifications
            [
                'name' => 'subscription_activated',
                'type' => 'email',
                'category' => 'subscription',
                'subject' => 'Langganan Diaktifkan - {{organization_name}}',
                'body' => $this->getSubscriptionActivatedTemplate(),
                'variables' => json_encode([
                    'organization_name',
                    'plan_name',
                    'amount',
                    'currency',
                    'billing_cycle',
                    'start_date',
                    'end_date'
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'subscription_cancelled',
                'type' => 'email',
                'category' => 'subscription',
                'subject' => 'Langganan Dibatalkan - {{organization_name}}',
                'body' => $this->getSubscriptionCancelledTemplate(),
                'variables' => json_encode([
                    'organization_name',
                    'plan_name',
                    'cancellation_reason',
                    'end_date',
                    'refund_amount'
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'subscription_expired',
                'type' => 'email',
                'category' => 'subscription',
                'subject' => 'Langganan Berakhir - {{organization_name}}',
                'body' => $this->getSubscriptionExpiredTemplate(),
                'variables' => json_encode([
                    'organization_name',
                    'plan_name',
                    'expiry_date',
                    'renewal_options'
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // System Notifications
            [
                'name' => 'maintenance_notice',
                'type' => 'email',
                'category' => 'system',
                'subject' => 'Pemberitahuan Pemeliharaan Sistem - {{organization_name}}',
                'body' => $this->getMaintenanceNoticeTemplate(),
                'variables' => json_encode([
                    'organization_name',
                    'maintenance_date',
                    'maintenance_duration',
                    'affected_services'
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'security_alert',
                'type' => 'email',
                'category' => 'security',
                'subject' => 'Peringatan Keamanan - {{organization_name}}',
                'body' => $this->getSecurityAlertTemplate(),
                'variables' => json_encode([
                    'organization_name',
                    'alert_type',
                    'alert_description',
                    'action_required',
                    'timestamp'
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // SMS Templates
            [
                'name' => 'payment_success_sms',
                'type' => 'sms',
                'category' => 'payment',
                'subject' => null,
                'body' => 'Pembayaran Rp {{amount}} berhasil. ID Transaksi: {{transaction_id}}. Terima kasih!',
                'variables' => json_encode([
                    'amount',
                    'transaction_id'
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'invoice_overdue_sms',
                'type' => 'sms',
                'category' => 'billing',
                'subject' => null,
                'body' => 'Tagihan {{invoice_number}} jatuh tempo. Jumlah: Rp {{amount}}. Segera lakukan pembayaran.',
                'variables' => json_encode([
                    'invoice_number',
                    'amount'
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Push Notification Templates
            [
                'name' => 'payment_success_push',
                'type' => 'push',
                'category' => 'payment',
                'subject' => 'Pembayaran Berhasil',
                'body' => 'Pembayaran Rp {{amount}} berhasil diproses. Terima kasih!',
                'variables' => json_encode([
                    'amount'
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'invoice_overdue_push',
                'type' => 'push',
                'category' => 'billing',
                'subject' => 'Tagihan Jatuh Tempo',
                'body' => 'Tagihan {{invoice_number}} jatuh tempo. Segera lakukan pembayaran.',
                'variables' => json_encode([
                    'invoice_number'
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Insert templates in batches
        $chunks = array_chunk($templates, 50);
        foreach ($chunks as $chunk) {
            DB::table('notification_templates')->insert($chunk);
        }

        $this->command->info('Created ' . count($templates) . ' notification templates.');
    }

    /**
     * Get payment success email template
     */
    private function getPaymentSuccessTemplate(): string
    {
        return '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Pembayaran Berhasil</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #28a745;">✅ Pembayaran Berhasil</h2>

                <p>Halo <strong>{{organization_name}}</strong>,</p>

                <p>Pembayaran Anda telah berhasil diproses dengan detail sebagai berikut:</p>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <table style="width: 100%;">
                        <tr>
                            <td><strong>Jumlah:</strong></td>
                            <td>Rp {{amount}} {{currency}}</td>
                        </tr>
                        <tr>
                            <td><strong>Metode Pembayaran:</strong></td>
                            <td>{{payment_method}}</td>
                        </tr>
                        <tr>
                            <td><strong>ID Transaksi:</strong></td>
                            <td>{{transaction_id}}</td>
                        </tr>
                        <tr>
                            <td><strong>Tanggal:</strong></td>
                            <td>{{date}}</td>
                        </tr>
                    </table>
                </div>

                <p>Terima kasih telah menggunakan layanan kami!</p>

                <p>Jika Anda memiliki pertanyaan, silakan hubungi tim support kami.</p>

                <hr style="margin: 30px 0;">
                <p style="font-size: 12px; color: #666;">
                    Email ini dikirim secara otomatis. Mohon tidak membalas email ini.
                </p>
            </div>
        </body>
        </html>';
    }

    /**
     * Get payment failure email template
     */
    private function getPaymentFailureTemplate(): string
    {
        return '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Pembayaran Gagal</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #dc3545;">❌ Pembayaran Gagal</h2>

                <p>Halo <strong>{{organization_name}}</strong>,</p>

                <p>Maaf, pembayaran Anda gagal diproses dengan detail sebagai berikut:</p>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <table style="width: 100%;">
                        <tr>
                            <td><strong>Jumlah:</strong></td>
                            <td>Rp {{amount}} {{currency}}</td>
                        </tr>
                        <tr>
                            <td><strong>Metode Pembayaran:</strong></td>
                            <td>{{payment_method}}</td>
                        </tr>
                        <tr>
                            <td><strong>ID Transaksi:</strong></td>
                            <td>{{transaction_id}}</td>
                        </tr>
                        <tr>
                            <td><strong>Alasan Gagal:</strong></td>
                            <td>{{failure_reason}}</td>
                        </tr>
                        <tr>
                            <td><strong>Tanggal:</strong></td>
                            <td>{{date}}</td>
                        </tr>
                    </table>
                </div>

                <p>Silakan coba lagi atau gunakan metode pembayaran lain.</p>

                <p>Jika masalah berlanjut, silakan hubungi tim support kami.</p>

                <hr style="margin: 30px 0;">
                <p style="font-size: 12px; color: #666;">
                    Email ini dikirim secara otomatis. Mohon tidak membalas email ini.
                </p>
            </div>
        </body>
        </html>';
    }

    /**
     * Get payment refund email template
     */
    private function getPaymentRefundTemplate(): string
    {
        return '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Pengembalian Dana</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #17a2b8;">💰 Pengembalian Dana</h2>

                <p>Halo <strong>{{organization_name}}</strong>,</p>

                <p>Pengembalian dana telah diproses dengan detail sebagai berikut:</p>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <table style="width: 100%;">
                        <tr>
                            <td><strong>Jumlah Asli:</strong></td>
                            <td>Rp {{amount}} {{currency}}</td>
                        </tr>
                        <tr>
                            <td><strong>Jumlah Pengembalian:</strong></td>
                            <td>Rp {{refund_amount}} {{currency}}</td>
                        </tr>
                        <tr>
                            <td><strong>ID Transaksi:</strong></td>
                            <td>{{transaction_id}}</td>
                        </tr>
                        <tr>
                            <td><strong>Alasan:</strong></td>
                            <td>{{refund_reason}}</td>
                        </tr>
                        <tr>
                            <td><strong>Tanggal:</strong></td>
                            <td>{{date}}</td>
                        </tr>
                    </table>
                </div>

                <p>Dana akan dikembalikan ke rekening Anda dalam 3-5 hari kerja.</p>

                <p>Jika Anda memiliki pertanyaan, silakan hubungi tim support kami.</p>

                <hr style="margin: 30px 0;">
                <p style="font-size: 12px; color: #666;">
                    Email ini dikirim secara otomatis. Mohon tidak membalas email ini.
                </p>
            </div>
        </body>
        </html>';
    }

    /**
     * Get invoice generated email template
     */
    private function getInvoiceGeneratedTemplate(): string
    {
        return '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Tagihan Baru</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #007bff;">📄 Tagihan Baru</h2>

                <p>Halo <strong>{{organization_name}}</strong>,</p>

                <p>Tagihan baru telah dibuat untuk Anda dengan detail sebagai berikut:</p>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <table style="width: 100%;">
                        <tr>
                            <td><strong>Nomor Tagihan:</strong></td>
                            <td>{{invoice_number}}</td>
                        </tr>
                        <tr>
                            <td><strong>Jumlah:</strong></td>
                            <td>Rp {{amount}} {{currency}}</td>
                        </tr>
                        <tr>
                            <td><strong>Jatuh Tempo:</strong></td>
                            <td>{{due_date}}</td>
                        </tr>
                        <tr>
                            <td><strong>Periode:</strong></td>
                            <td>{{billing_period}}</td>
                        </tr>
                    </table>
                </div>

                <p>Silakan lakukan pembayaran sebelum tanggal jatuh tempo.</p>

                <p>Jika Anda memiliki pertanyaan, silakan hubungi tim support kami.</p>

                <hr style="margin: 30px 0;">
                <p style="font-size: 12px; color: #666;">
                    Email ini dikirim secara otomatis. Mohon tidak membalas email ini.
                </p>
            </div>
        </body>
        </html>';
    }

    /**
     * Get invoice overdue email template
     */
    private function getInvoiceOverdueTemplate(): string
    {
        return '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Tagihan Jatuh Tempo</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #dc3545;">⚠️ Tagihan Jatuh Tempo</h2>

                <p>Halo <strong>{{organization_name}}</strong>,</p>

                <p>Tagihan Anda telah jatuh tempo dengan detail sebagai berikut:</p>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <table style="width: 100%;">
                        <tr>
                            <td><strong>Nomor Tagihan:</strong></td>
                            <td>{{invoice_number}}</td>
                        </tr>
                        <tr>
                            <td><strong>Jumlah:</strong></td>
                            <td>Rp {{amount}} {{currency}}</td>
                        </tr>
                        <tr>
                            <td><strong>Jatuh Tempo:</strong></td>
                            <td>{{due_date}}</td>
                        </tr>
                        <tr>
                            <td><strong>Terlambat:</strong></td>
                            <td>{{overdue_days}} hari</td>
                        </tr>
                    </table>
                </div>

                <p><strong>Segera lakukan pembayaran untuk menghindari gangguan layanan.</strong></p>

                <p>Jika Anda memiliki pertanyaan, silakan hubungi tim support kami.</p>

                <hr style="margin: 30px 0;">
                <p style="font-size: 12px; color: #666;">
                    Email ini dikirim secara otomatis. Mohon tidak membalas email ini.
                </p>
            </div>
        </body>
        </html>';
    }

    /**
     * Get invoice paid email template
     */
    private function getInvoicePaidTemplate(): string
    {
        return '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Tagihan Lunas</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #28a745;">✅ Tagihan Lunas</h2>

                <p>Halo <strong>{{organization_name}}</strong>,</p>

                <p>Tagihan Anda telah berhasil dibayar dengan detail sebagai berikut:</p>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <table style="width: 100%;">
                        <tr>
                            <td><strong>Nomor Tagihan:</strong></td>
                            <td>{{invoice_number}}</td>
                        </tr>
                        <tr>
                            <td><strong>Jumlah:</strong></td>
                            <td>Rp {{amount}} {{currency}}</td>
                        </tr>
                        <tr>
                            <td><strong>Tanggal Pembayaran:</strong></td>
                            <td>{{payment_date}}</td>
                        </tr>
                        <tr>
                            <td><strong>Metode Pembayaran:</strong></td>
                            <td>{{payment_method}}</td>
                        </tr>
                    </table>
                </div>

                <p>Terima kasih telah melakukan pembayaran tepat waktu!</p>

                <p>Jika Anda memiliki pertanyaan, silakan hubungi tim support kami.</p>

                <hr style="margin: 30px 0;">
                <p style="font-size: 12px; color: #666;">
                    Email ini dikirim secara otomatis. Mohon tidak membalas email ini.
                </p>
            </div>
        </body>
        </html>';
    }

    /**
     * Get subscription activated email template
     */
    private function getSubscriptionActivatedTemplate(): string
    {
        return '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Langganan Diaktifkan</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #28a745;">🎉 Langganan Diaktifkan</h2>

                <p>Halo <strong>{{organization_name}}</strong>,</p>

                <p>Selamat! Langganan Anda telah berhasil diaktifkan dengan detail sebagai berikut:</p>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <table style="width: 100%;">
                        <tr>
                            <td><strong>Paket:</strong></td>
                            <td>{{plan_name}}</td>
                        </tr>
                        <tr>
                            <td><strong>Harga:</strong></td>
                            <td>Rp {{amount}} {{currency}}</td>
                        </tr>
                        <tr>
                            <td><strong>Siklus:</strong></td>
                            <td>{{billing_cycle}}</td>
                        </tr>
                        <tr>
                            <td><strong>Mulai:</strong></td>
                            <td>{{start_date}}</td>
                        </tr>
                        <tr>
                            <td><strong>Berakhir:</strong></td>
                            <td>{{end_date}}</td>
                        </tr>
                    </table>
                </div>

                <p>Nikmati layanan premium kami!</p>

                <p>Jika Anda memiliki pertanyaan, silakan hubungi tim support kami.</p>

                <hr style="margin: 30px 0;">
                <p style="font-size: 12px; color: #666;">
                    Email ini dikirim secara otomatis. Mohon tidak membalas email ini.
                </p>
            </div>
        </body>
        </html>';
    }

    /**
     * Get subscription cancelled email template
     */
    private function getSubscriptionCancelledTemplate(): string
    {
        return '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Langganan Dibatalkan</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #dc3545;">❌ Langganan Dibatalkan</h2>

                <p>Halo <strong>{{organization_name}}</strong>,</p>

                <p>Langganan Anda telah dibatalkan dengan detail sebagai berikut:</p>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <table style="width: 100%;">
                        <tr>
                            <td><strong>Paket:</strong></td>
                            <td>{{plan_name}}</td>
                        </tr>
                        <tr>
                            <td><strong>Alasan:</strong></td>
                            <td>{{cancellation_reason}}</td>
                        </tr>
                        <tr>
                            <td><strong>Berakhir:</strong></td>
                            <td>{{end_date}}</td>
                        </tr>
                        <tr>
                            <td><strong>Pengembalian:</strong></td>
                            <td>Rp {{refund_amount}}</td>
                        </tr>
                    </table>
                </div>

                <p>Terima kasih telah menggunakan layanan kami.</p>

                <p>Jika Anda ingin berlangganan kembali, silakan hubungi tim support kami.</p>

                <hr style="margin: 30px 0;">
                <p style="font-size: 12px; color: #666;">
                    Email ini dikirim secara otomatis. Mohon tidak membalas email ini.
                </p>
            </div>
        </body>
        </html>';
    }

    /**
     * Get subscription expired email template
     */
    private function getSubscriptionExpiredTemplate(): string
    {
        return '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Langganan Berakhir</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #ffc107;">⏰ Langganan Berakhir</h2>

                <p>Halo <strong>{{organization_name}}</strong>,</p>

                <p>Langganan Anda telah berakhir dengan detail sebagai berikut:</p>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <table style="width: 100%;">
                        <tr>
                            <td><strong>Paket:</strong></td>
                            <td>{{plan_name}}</td>
                        </tr>
                        <tr>
                            <td><strong>Berakhir:</strong></td>
                            <td>{{expiry_date}}</td>
                        </tr>
                    </table>
                </div>

                <p>Opsi perpanjangan:</p>
                <ul>
                    <li>{{renewal_options}}</li>
                </ul>

                <p>Jika Anda ingin memperpanjang langganan, silakan hubungi tim support kami.</p>

                <hr style="margin: 30px 0;">
                <p style="font-size: 12px; color: #666;">
                    Email ini dikirim secara otomatis. Mohon tidak membalas email ini.
                </p>
            </div>
        </body>
        </html>';
    }

    /**
     * Get maintenance notice email template
     */
    private function getMaintenanceNoticeTemplate(): string
    {
        return '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Pemberitahuan Pemeliharaan</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #ffc107;">🔧 Pemeliharaan Sistem</h2>

                <p>Halo <strong>{{organization_name}}</strong>,</p>

                <p>Kami akan melakukan pemeliharaan sistem dengan detail sebagai berikut:</p>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <table style="width: 100%;">
                        <tr>
                            <td><strong>Tanggal:</strong></td>
                            <td>{{maintenance_date}}</td>
                        </tr>
                        <tr>
                            <td><strong>Durasi:</strong></td>
                            <td>{{maintenance_duration}}</td>
                        </tr>
                        <tr>
                            <td><strong>Layanan Terpengaruh:</strong></td>
                            <td>{{affected_services}}</td>
                        </tr>
                    </table>
                </div>

                <p>Mohon maaf atas ketidaknyamanan ini.</p>

                <p>Jika Anda memiliki pertanyaan, silakan hubungi tim support kami.</p>

                <hr style="margin: 30px 0;">
                <p style="font-size: 12px; color: #666;">
                    Email ini dikirim secara otomatis. Mohon tidak membalas email ini.
                </p>
            </div>
        </body>
        </html>';
    }

    /**
     * Get security alert email template
     */
    private function getSecurityAlertTemplate(): string
    {
        return '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Peringatan Keamanan</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #dc3545;">🚨 Peringatan Keamanan</h2>

                <p>Halo <strong>{{organization_name}}</strong>,</p>

                <p>Kami mendeteksi aktivitas yang mencurigakan pada akun Anda:</p>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <table style="width: 100%;">
                        <tr>
                            <td><strong>Jenis Peringatan:</strong></td>
                            <td>{{alert_type}}</td>
                        </tr>
                        <tr>
                            <td><strong>Deskripsi:</strong></td>
                            <td>{{alert_description}}</td>
                        </tr>
                        <tr>
                            <td><strong>Waktu:</strong></td>
                            <td>{{timestamp}}</td>
                        </tr>
                        <tr>
                            <td><strong>Tindakan:</strong></td>
                            <td>{{action_required}}</td>
                        </tr>
                    </table>
                </div>

                <p><strong>Segera lakukan tindakan yang diperlukan untuk mengamankan akun Anda.</strong></p>

                <p>Jika Anda memiliki pertanyaan, silakan hubungi tim support kami.</p>

                <hr style="margin: 30px 0;">
                <p style="font-size: 12px; color: #666;">
                    Email ini dikirim secara otomatis. Mohon tidak membalas email ini.
                </p>
            </div>
        </body>
        </html>';
    }
}
