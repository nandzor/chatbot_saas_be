<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\PaymentTransactionService;
use App\Http\Resources\PaymentTransactionResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class PaymentTransactionController extends BaseApiController
{
    protected PaymentTransactionService $paymentTransactionService;

    public function __construct(PaymentTransactionService $paymentTransactionService)
    {
        $this->paymentTransactionService = $paymentTransactionService;
    }

    /**
     * Get all payment transactions (Super Admin only)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only([
                'status', 'payment_method', 'payment_gateway', 'organization_id',
                'plan_id', 'amount_min', 'amount_max', 'date_from', 'date_to', 'currency'
            ]);

            $transactions = $this->paymentTransactionService->getAllTransactions($request, $filters);

            return $this->successResponse(
                'Daftar riwayat transaksi berhasil diambil',
                $transactions->through(fn($transaction) => new PaymentTransactionResource($transaction))
            );
        } catch (\Exception $e) {
            Log::error('Error fetching payment transactions', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal mengambil daftar riwayat transaksi'
            );
        }
    }

    /**
     * Get transaction by ID (Super Admin only)
     */
    public function show(string $id): JsonResponse
    {
        try {
            $transaction = $this->paymentTransactionService->getTransactionById($id);

            if (!$transaction) {
                return $this->notFoundResponse('Transaksi', $id);
            }

            return $this->successResponse(
                'Detail transaksi berhasil diambil',
                new PaymentTransactionResource($transaction)
            );
        } catch (\Exception $e) {
            Log::error('Error fetching payment transaction', [
                'error' => $e->getMessage(),
                'transaction_id' => $id,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal mengambil detail transaksi'
            );
        }
    }

    /**
     * Get transaction statistics (Super Admin only)
     */
    public function statistics(Request $request): JsonResponse
    {
        try {
            $filters = $request->only([
                'status', 'payment_method', 'payment_gateway', 'organization_id',
                'plan_id', 'amount_min', 'amount_max', 'date_from', 'date_to', 'currency'
            ]);

            $stats = $this->paymentTransactionService->getTransactionStatistics($filters);

            return $this->successResponse(
                'Statistik transaksi berhasil diambil',
                $stats
            );
        } catch (\Exception $e) {
            Log::error('Error fetching transaction statistics', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal mengambil statistik transaksi'
            );
        }
    }

    /**
     * Get plan transaction history (Super Admin only)
     */
    public function planHistory(string $planId, Request $request): JsonResponse
    {
        try {
            $filters = $request->only([
                'status', 'payment_method', 'payment_gateway', 'organization_id',
                'amount_min', 'amount_max', 'date_from', 'date_to', 'currency'
            ]);

            $history = $this->paymentTransactionService->getPlanTransactionHistory($planId, $filters);

            return $this->successResponse(
                'Riwayat transaksi plan berhasil diambil',
                $history
            );
        } catch (\Exception $e) {
            Log::error('Error fetching plan transaction history', [
                'error' => $e->getMessage(),
                'plan_id' => $planId,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal mengambil riwayat transaksi plan'
            );
        }
    }

    /**
     * Get organization transaction history (Super Admin only)
     */
    public function organizationHistory(string $organizationId, Request $request): JsonResponse
    {
        try {
            $filters = $request->only([
                'status', 'payment_method', 'payment_gateway', 'plan_id',
                'amount_min', 'amount_max', 'date_from', 'date_to', 'currency'
            ]);

            $history = $this->paymentTransactionService->getOrganizationTransactionHistory($organizationId, $filters);

            return $this->successResponse(
                'Riwayat transaksi organization berhasil diambil',
                $history
            );
        } catch (\Exception $e) {
            Log::error('Error fetching organization transaction history', [
                'error' => $e->getMessage(),
                'organization_id' => $organizationId,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal mengambil riwayat transaksi organization'
            );
        }
    }

    /**
     * Export transaction data (Super Admin only)
     */
    public function export(Request $request): JsonResponse
    {
        try {
            $filters = $request->only([
                'status', 'payment_method', 'payment_gateway', 'organization_id',
                'plan_id', 'amount_min', 'amount_max', 'date_from', 'date_to', 'currency'
            ]);

            $format = $request->get('format', 'csv');

            if (!in_array($format, ['csv', 'json', 'xlsx'])) {
                return $this->validationErrorResponse(
                    ['format' => ['Format export tidak valid. Gunakan: csv, json, atau xlsx']],
                    'Format export tidak valid'
                );
            }

            $exportData = $this->paymentTransactionService->exportTransactions($filters, $format);

            return $this->successResponse(
                'Data transaksi berhasil diekspor',
                $exportData
            );
        } catch (\Exception $e) {
            Log::error('Error exporting transaction data', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal mengekspor data transaksi'
            );
        }
    }

    /**
     * Get transactions by status (Super Admin only)
     */
    public function byStatus(string $status, Request $request): JsonResponse
    {
        try {
            $validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'disputed', 'expired'];

            if (!in_array($status, $validStatuses)) {
                return $this->validationErrorResponse(
                    ['status' => ['Status transaksi tidak valid']],
                    'Status transaksi tidak valid'
                );
            }

            $filters = array_merge($request->only([
                'payment_method', 'payment_gateway', 'organization_id',
                'plan_id', 'amount_min', 'amount_max', 'date_from', 'date_to', 'currency'
            ]), ['status' => $status]);

            $transactions = $this->paymentTransactionService->getAllTransactions($request, $filters);

            return $this->successResponse(
                "Daftar transaksi dengan status {$status} berhasil diambil",
                $transactions->through(fn($transaction) => new PaymentTransactionResource($transaction))
            );
        } catch (\Exception $e) {
            Log::error('Error fetching transactions by status', [
                'error' => $e->getMessage(),
                'status' => $status,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal mengambil transaksi berdasarkan status'
            );
        }
    }

    /**
     * Get transactions by payment method (Super Admin only)
     */
    public function byPaymentMethod(string $method, Request $request): JsonResponse
    {
        try {
            $filters = array_merge($request->only([
                'status', 'payment_gateway', 'organization_id',
                'plan_id', 'amount_min', 'amount_max', 'date_from', 'date_to', 'currency'
            ]), ['payment_method' => $method]);

            $transactions = $this->paymentTransactionService->getAllTransactions($request, $filters);

            return $this->successResponse(
                "Daftar transaksi dengan metode pembayaran {$method} berhasil diambil",
                $transactions->through(fn($transaction) => new PaymentTransactionResource($transaction))
            );
        } catch (\Exception $e) {
            Log::error('Error fetching transactions by payment method', [
                'error' => $e->getMessage(),
                'method' => $method,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal mengambil transaksi berdasarkan metode pembayaran'
            );
        }
    }

    /**
     * Get transactions by payment gateway (Super Admin only)
     */
    public function byPaymentGateway(string $gateway, Request $request): JsonResponse
    {
        try {
            $filters = array_merge($request->only([
                'status', 'payment_method', 'organization_id',
                'plan_id', 'amount_min', 'amount_max', 'date_from', 'date_to', 'currency'
            ]), ['payment_gateway' => $gateway]);

            $transactions = $this->paymentTransactionService->getAllTransactions($request, $filters);

            return $this->successResponse(
                "Daftar transaksi dengan gateway pembayaran {$gateway} berhasil diambil",
                $transactions->through(fn($transaction) => new PaymentTransactionResource($transaction))
            );
        } catch (\Exception $e) {
            Log::error('Error fetching transactions by payment gateway', [
                'error' => $e->getMessage(),
                'gateway' => $gateway,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal mengambil transaksi berdasarkan gateway pembayaran'
            );
        }
    }

    /**
     * Get transactions by date range (Super Admin only)
     */
    public function byDateRange(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'date_from' => 'required|date',
                'date_to' => 'required|date|after_or_equal:date_from'
            ]);

            $filters = array_merge($request->only([
                'status', 'payment_method', 'payment_gateway', 'organization_id',
                'plan_id', 'amount_min', 'amount_max', 'currency'
            ]), [
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to')
            ]);

            $transactions = $this->paymentTransactionService->getAllTransactions($request, $filters);

            return $this->successResponse(
                'Daftar transaksi berdasarkan rentang tanggal berhasil diambil',
                $transactions->through(fn($transaction) => new PaymentTransactionResource($transaction))
            );
        } catch (\Exception $e) {
            Log::error('Error fetching transactions by date range', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal mengambil transaksi berdasarkan rentang tanggal'
            );
        }
    }

    /**
     * Get transactions by amount range (Super Admin only)
     */
    public function byAmountRange(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'amount_min' => 'required|numeric|min:0',
                'amount_max' => 'required|numeric|min:0|gte:amount_min'
            ]);

            $filters = array_merge($request->only([
                'status', 'payment_method', 'payment_gateway', 'organization_id',
                'plan_id', 'date_from', 'date_to', 'currency'
            ]), [
                'amount_min' => $request->get('amount_min'),
                'amount_max' => $request->get('amount_max')
            ]);

            $transactions = $this->paymentTransactionService->getAllTransactions($request, $filters);

            return $this->successResponse(
                'Daftar transaksi berdasarkan rentang jumlah berhasil diambil',
                $transactions->through(fn($transaction) => new PaymentTransactionResource($transaction))
            );
        } catch (\Exception $e) {
            Log::error('Error fetching transactions by amount range', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal mengambil transaksi berdasarkan rentang jumlah'
            );
        }
    }

    /**
     * Get subscription transaction history (Super Admin only)
     */
    public function subscriptionHistory(string $subscriptionId, Request $request): JsonResponse
    {
        try {
            $filters = $request->only([
                'status', 'payment_method', 'payment_gateway',
                'amount_min', 'amount_max', 'date_from', 'date_to', 'currency'
            ]);

            $history = $this->paymentTransactionService->getSubscriptionTransactionHistory($subscriptionId, $filters);

            return $this->successResponse(
                'Riwayat transaksi subscription berhasil diambil',
                $history
            );
        } catch (\Exception $e) {
            Log::error('Error fetching subscription transaction history', [
                'error' => $e->getMessage(),
                'subscription_id' => $subscriptionId,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal mengambil riwayat transaksi subscription'
            );
        }
    }

    /**
     * Get transaction analytics (Super Admin only)
     */
    public function analytics(Request $request): JsonResponse
    {
        try {
            $filters = $request->only([
                'status', 'payment_method', 'payment_gateway', 'organization_id',
                'plan_id', 'amount_min', 'amount_max', 'date_from', 'date_to', 'currency'
            ]);

            $analytics = $this->paymentTransactionService->getTransactionAnalytics($filters);

            return $this->successResponse(
                'Analitik transaksi berhasil diambil',
                $analytics
            );
        } catch (\Exception $e) {
            Log::error('Error fetching transaction analytics', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal mengambil analitik transaksi'
            );
        }
    }

    /**
     * Refund a transaction (Super Admin only)
     */
    public function refund(Request $request, string $id): JsonResponse
    {
        try {
            $request->validate([
                'amount' => 'nullable|numeric|min:0',
                'reason' => 'nullable|string|max:500',
                'notify_customer' => 'nullable|boolean'
            ]);

            $refundData = $request->only(['amount', 'reason', 'notify_customer']);
            $result = $this->paymentTransactionService->refundTransaction($id, $refundData);

            if (!$result) {
                return $this->notFoundResponse('Transaksi', $id);
            }

            Log::info('Transaction refunded', [
                'user_id' => $this->getCurrentUser()?->id,
                'transaction_id' => $id,
                'refund_amount' => $refundData['amount'] ?? null
            ]);

            return $this->successResponse(
                'Transaksi berhasil direfund',
                $result
            );
        } catch (\Exception $e) {
            Log::error('Error refunding transaction', [
                'error' => $e->getMessage(),
                'transaction_id' => $id,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal melakukan refund transaksi'
            );
        }
    }

    /**
     * Retry a failed transaction (Super Admin only)
     */
    public function retry(string $id): JsonResponse
    {
        try {
            $result = $this->paymentTransactionService->retryTransaction($id);

            if (!$result) {
                return $this->notFoundResponse('Transaksi', $id);
            }

            Log::info('Transaction retry initiated', [
                'user_id' => $this->getCurrentUser()?->id,
                'transaction_id' => $id
            ]);

            return $this->successResponse(
                'Retry transaksi berhasil diinisiasi',
                $result
            );
        } catch (\Exception $e) {
            Log::error('Error retrying transaction', [
                'error' => $e->getMessage(),
                'transaction_id' => $id,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal melakukan retry transaksi'
            );
        }
    }

    /**
     * Bulk refund transactions (Super Admin only)
     */
    public function bulkRefund(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'transaction_ids' => 'required|array|min:1',
                'transaction_ids.*' => 'required|string|exists:payment_transactions,id',
                'amount' => 'nullable|numeric|min:0',
                'reason' => 'nullable|string|max:500',
                'notify_customer' => 'nullable|boolean'
            ]);

            $refundData = $request->only(['amount', 'reason', 'notify_customer']);
            $result = $this->paymentTransactionService->bulkRefundTransactions($request->transaction_ids, $refundData);

            Log::info('Bulk transaction refund', [
                'user_id' => $this->getCurrentUser()?->id,
                'transaction_count' => count($request->transaction_ids),
                'refund_amount' => $refundData['amount'] ?? null
            ]);

            return $this->successResponse(
                "Berhasil melakukan refund {$result['refunded']} transaksi",
                $result
            );
        } catch (\Exception $e) {
            Log::error('Error bulk refunding transactions', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal melakukan bulk refund transaksi'
            );
        }
    }

    /**
     * Bulk retry transactions (Super Admin only)
     */
    public function bulkRetry(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'transaction_ids' => 'required|array|min:1',
                'transaction_ids.*' => 'required|string|exists:payment_transactions,id'
            ]);

            $result = $this->paymentTransactionService->bulkRetryTransactions($request->transaction_ids);

            Log::info('Bulk transaction retry', [
                'user_id' => $this->getCurrentUser()?->id,
                'transaction_count' => count($request->transaction_ids)
            ]);

            return $this->successResponse(
                "Berhasil melakukan retry {$result['retried']} transaksi",
                $result
            );
        } catch (\Exception $e) {
            Log::error('Error bulk retrying transactions', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal melakukan bulk retry transaksi'
            );
        }
    }

    /**
     * Get my transactions (Organization-scoped)
     */
    public function myTransactions(Request $request): JsonResponse
    {
        try {
            $user = $this->getCurrentUser();
            $filters = $request->only([
                'status', 'payment_method', 'payment_gateway',
                'plan_id', 'amount_min', 'amount_max', 'date_from', 'date_to', 'currency'
            ]);

            $transactions = $this->paymentTransactionService->getMyTransactions($user->organization_id, $request, $filters);

            return $this->successResponse(
                'Daftar transaksi saya berhasil diambil',
                $transactions->through(fn($transaction) => new PaymentTransactionResource($transaction))
            );
        } catch (\Exception $e) {
            Log::error('Error fetching my transactions', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal mengambil daftar transaksi saya'
            );
        }
    }

    /**
     * Get my specific transaction (Organization-scoped)
     */
    public function myTransaction(string $id): JsonResponse
    {
        try {
            $user = $this->getCurrentUser();
            $transaction = $this->paymentTransactionService->getMyTransaction($id, $user->organization_id);

            if (!$transaction) {
                return $this->notFoundResponse('Transaksi', $id);
            }

            return $this->successResponse(
                'Detail transaksi saya berhasil diambil',
                new PaymentTransactionResource($transaction)
            );
        } catch (\Exception $e) {
            Log::error('Error fetching my transaction', [
                'error' => $e->getMessage(),
                'transaction_id' => $id,
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal mengambil detail transaksi saya'
            );
        }
    }

    /**
     * Get my transaction statistics (Organization-scoped)
     */
    public function myStatistics(Request $request): JsonResponse
    {
        try {
            $user = $this->getCurrentUser();
            $filters = $request->only([
                'status', 'payment_method', 'payment_gateway',
                'plan_id', 'amount_min', 'amount_max', 'date_from', 'date_to', 'currency'
            ]);

            $stats = $this->paymentTransactionService->getMyTransactionStatistics($user->organization_id, $filters);

            return $this->successResponse(
                'Statistik transaksi saya berhasil diambil',
                $stats
            );
        } catch (\Exception $e) {
            Log::error('Error fetching my transaction statistics', [
                'error' => $e->getMessage(),
                'user_id' => $this->getCurrentUser()?->id
            ]);

            return $this->serverErrorResponse(
                'Gagal mengambil statistik transaksi saya'
            );
        }
    }

    /**
     * Handle Stripe webhook
     */
    public function stripeWebhook(Request $request): JsonResponse
    {
        try {
            $payload = $request->getContent();
            $signature = $request->header('Stripe-Signature');

            $result = $this->paymentTransactionService->handleStripeWebhook($payload, $signature);

            Log::info('Stripe webhook processed', [
                'event_type' => $result['event_type'] ?? 'unknown',
                'transaction_id' => $result['transaction_id'] ?? null
            ]);

            return $this->successResponse(
                'Stripe webhook berhasil diproses',
                $result
            );
        } catch (\Exception $e) {
            Log::error('Error processing Stripe webhook', [
                'error' => $e->getMessage(),
                'payload' => $request->getContent()
            ]);

            return $this->serverErrorResponse(
                'Gagal memproses Stripe webhook'
            );
        }
    }

    /**
     * Handle Midtrans webhook
     */
    public function midtransWebhook(Request $request): JsonResponse
    {
        try {
            $payload = $request->all();
            $result = $this->paymentTransactionService->handleMidtransWebhook($payload);

            Log::info('Midtrans webhook processed', [
                'transaction_id' => $result['transaction_id'] ?? null,
                'status' => $result['status'] ?? 'unknown'
            ]);

            return $this->successResponse(
                'Midtrans webhook berhasil diproses',
                $result
            );
        } catch (\Exception $e) {
            Log::error('Error processing Midtrans webhook', [
                'error' => $e->getMessage(),
                'payload' => $request->all()
            ]);

            return $this->serverErrorResponse(
                'Gagal memproses Midtrans webhook'
            );
        }
    }

    /**
     * Handle Xendit webhook
     */
    public function xenditWebhook(Request $request): JsonResponse
    {
        try {
            $payload = $request->all();
            $result = $this->paymentTransactionService->handleXenditWebhook($payload);

            Log::info('Xendit webhook processed', [
                'transaction_id' => $result['transaction_id'] ?? null,
                'status' => $result['status'] ?? 'unknown'
            ]);

            return $this->successResponse(
                'Xendit webhook berhasil diproses',
                $result
            );
        } catch (\Exception $e) {
            Log::error('Error processing Xendit webhook', [
                'error' => $e->getMessage(),
                'payload' => $request->all()
            ]);

            return $this->serverErrorResponse(
                'Gagal memproses Xendit webhook'
            );
        }
    }
}
