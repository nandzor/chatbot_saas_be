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
}
