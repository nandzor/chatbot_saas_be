<?php

namespace App\Services;

use App\Models\PaymentTransaction;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Validation\ValidationException;

class PaymentTransactionService extends BaseService
{
    /**
     * Get the model for the service.
     */
    protected function getModel(): \Illuminate\Database\Eloquent\Model
    {
        return new PaymentTransaction();
    }

    /**
     * Get all payment transactions with advanced filtering and pagination (Super Admin only).
     */
    public function getAllTransactions(
        ?Request $request = null,
        array $filters = [],
        array $relations = ['organization', 'subscription.plan', 'invoice']
    ): Collection|LengthAwarePaginator {
        $query = $this->getModel()->newQuery();

        // Apply relations
        if (!empty($relations)) {
            $query->with($relations);
        }

        // Apply filters
        $this->applyTransactionFilters($query, $filters);

        // Apply search
        if ($request && $request->has('search')) {
            $query->search($request->get('search'));
        }

        // Apply sorting
        if ($request) {
            $this->applyTransactionSorting($query, $request);
        }

        // Return paginated or all results
        if ($request && ($request->has('per_page') || $request->has('page'))) {
            $perPage = min(100, max(1, (int) $request->get('per_page', 15)));
            $page = max(1, (int) $request->get('page', 1));
            return $query->paginate($perPage, ['*'], 'page', $page);
        }

        return $query->get();
    }

    /**
     * Get transaction by ID with relations.
     */
    public function getTransactionById(string $id, array $relations = ['organization', 'subscription.plan', 'invoice']): ?PaymentTransaction
    {
        $query = $this->getModel()->newQuery();

        if (!empty($relations)) {
            $query->with($relations);
        }

        return $query->find($id);
    }

    /**
     * Get transactions by organization.
     */
    public function getTransactionsByOrganization(string $organizationId, array $filters = []): Collection
    {
        $query = $this->getModel()->newQuery()
            ->where('organization_id', $organizationId)
            ->with(['subscription.plan', 'invoice']);

        // Apply filters
        $this->applyTransactionFilters($query, $filters);

        return $query->latest()->get();
    }

    /**
     * Get transactions by subscription plan.
     */
    public function getTransactionsByPlan(string $planId, array $filters = []): Collection
    {
        $query = $this->getModel()->newQuery()
            ->whereHas('subscription', function ($q) use ($planId) {
                $q->where('plan_id', $planId);
            })
            ->with(['organization', 'subscription.plan', 'invoice']);

        // Apply filters
        $this->applyTransactionFilters($query, $filters);

        return $query->latest()->get();
    }

    /**
     * Get transaction statistics.
     */
    public function getTransactionStatistics(array $filters = []): array
    {
        $cacheKey = 'transaction_stats_' . md5(serialize($filters));

        return Cache::remember($cacheKey, 300, function () use ($filters) {
            $query = $this->getModel()->newQuery();

            // Apply filters
            $this->applyTransactionFilters($query, $filters);

            $totalTransactions = $query->count();
            $totalAmount = $query->sum('amount');
            $successfulTransactions = $query->clone()->successful()->count();
            $failedTransactions = $query->clone()->failed()->count();
            $pendingTransactions = $query->clone()->pending()->count();
            $refundedTransactions = $query->clone()->refunded()->count();

            // Calculate success rate
            $successRate = $totalTransactions > 0 ? round(($successfulTransactions / $totalTransactions) * 100, 2) : 0;

            // Get transactions by status
            $transactionsByStatus = $query->clone()
                ->selectRaw('status, COUNT(*) as count, SUM(amount) as total_amount')
                ->groupBy('status')
                ->get()
                ->keyBy('status');

            // Get transactions by payment method
            $transactionsByMethod = $query->clone()
                ->selectRaw('payment_method, COUNT(*) as count, SUM(amount) as total_amount')
                ->groupBy('payment_method')
                ->get()
                ->keyBy('payment_method');

            // Get transactions by payment gateway
            $transactionsByGateway = $query->clone()
                ->selectRaw('payment_gateway, COUNT(*) as count, SUM(amount) as total_amount')
                ->groupBy('payment_gateway')
                ->get()
                ->keyBy('payment_gateway');

            // Get monthly trends
            $monthlyTrends = $query->clone()
                ->selectRaw('DATE_TRUNC(\'month\', created_at) as month, COUNT(*) as count, SUM(amount) as total_amount')
                ->groupBy('month')
                ->orderBy('month', 'desc')
                ->limit(12)
                ->get();

            return [
                'total_transactions' => $totalTransactions,
                'total_amount' => $totalAmount,
                'successful_transactions' => $successfulTransactions,
                'failed_transactions' => $failedTransactions,
                'pending_transactions' => $pendingTransactions,
                'refunded_transactions' => $refundedTransactions,
                'success_rate' => $successRate,
                'transactions_by_status' => $transactionsByStatus,
                'transactions_by_method' => $transactionsByMethod,
                'transactions_by_gateway' => $transactionsByGateway,
                'monthly_trends' => $monthlyTrends,
            ];
        });
    }

    /**
     * Get plan transaction history.
     */
    public function getPlanTransactionHistory(string $planId, array $filters = []): array
    {
        $plan = SubscriptionPlan::find($planId);

        if (!$plan) {
            throw ValidationException::withMessages([
                'plan_id' => ['Subscription plan not found.']
            ]);
        }

        $transactions = $this->getTransactionsByPlan($planId, $filters);

        $totalTransactions = $transactions->count();
        $totalAmount = $transactions->sum('amount');
        $successfulTransactions = $transactions->where('status', 'completed')->count();
        $failedTransactions = $transactions->whereIn('status', ['failed', 'cancelled'])->count();

        $successRate = $totalTransactions > 0 ? round(($successfulTransactions / $totalTransactions) * 100, 2) : 0;

        return [
            'plan' => $plan,
            'total_transactions' => $totalTransactions,
            'total_amount' => $totalAmount,
            'successful_transactions' => $successfulTransactions,
            'failed_transactions' => $failedTransactions,
            'success_rate' => $successRate,
            'transactions' => $transactions,
        ];
    }

    /**
     * Get organization transaction history.
     */
    public function getOrganizationTransactionHistory(string $organizationId, array $filters = []): array
    {
        $transactions = $this->getTransactionsByOrganization($organizationId, $filters);

        $totalTransactions = $transactions->count();
        $totalAmount = $transactions->sum('amount');
        $successfulTransactions = $transactions->where('status', 'completed')->count();
        $failedTransactions = $transactions->whereIn('status', ['failed', 'cancelled'])->count();

        $successRate = $totalTransactions > 0 ? round(($successfulTransactions / $totalTransactions) * 100, 2) : 0;

        // Group by plan
        $transactionsByPlan = $transactions->groupBy('subscription.plan.name');

        return [
            'total_transactions' => $totalTransactions,
            'total_amount' => $totalAmount,
            'successful_transactions' => $successfulTransactions,
            'failed_transactions' => $failedTransactions,
            'success_rate' => $successRate,
            'transactions_by_plan' => $transactionsByPlan,
            'transactions' => $transactions,
        ];
    }

    /**
     * Export transaction data.
     */
    public function exportTransactions(array $filters = [], string $format = 'csv'): array
    {
        $transactions = $this->getAllTransactions(null, $filters, ['organization', 'subscription.plan', 'invoice']);

        $exportData = [];
        foreach ($transactions as $transaction) {
            $exportData[] = [
                'transaction_id' => $transaction->transaction_id,
                'organization' => $transaction->organization->name ?? 'N/A',
                'plan' => $transaction->subscription->plan->name ?? 'N/A',
                'amount' => $transaction->amount,
                'currency' => $transaction->currency,
                'payment_method' => $transaction->payment_method,
                'payment_gateway' => $transaction->payment_gateway,
                'status' => $transaction->status,
                'created_at' => $transaction->created_at->format('Y-m-d H:i:s'),
                'settled_at' => $transaction->settled_at?->format('Y-m-d H:i:s') ?? 'N/A',
            ];
        }

        return [
            'data' => $exportData,
            'total_records' => count($exportData),
            'format' => $format,
        ];
    }

    /**
     * Apply transaction filters.
     */
    protected function applyTransactionFilters($query, array $filters): void
    {
        if (isset($filters['status'])) {
            $query->byStatus($filters['status']);
        }

        if (isset($filters['payment_method'])) {
            $query->paymentMethod($filters['payment_method']);
        }

        if (isset($filters['payment_gateway'])) {
            $query->gateway($filters['payment_gateway']);
        }

        if (isset($filters['organization_id'])) {
            $query->where('organization_id', $filters['organization_id']);
        }

        if (isset($filters['plan_id'])) {
            $query->whereHas('subscription', function ($q) use ($filters) {
                $q->where('plan_id', $filters['plan_id']);
            });
        }

        if (isset($filters['amount_min'])) {
            $query->where('amount', '>=', $filters['amount_min']);
        }

        if (isset($filters['amount_max'])) {
            $query->where('amount', '<=', $filters['amount_max']);
        }

        if (isset($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        if (isset($filters['currency'])) {
            $query->where('currency', $filters['currency']);
        }
    }

    /**
     * Apply transaction sorting.
     */
    protected function applyTransactionSorting($query, Request $request): void
    {
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        $allowedSortFields = [
            'created_at', 'amount', 'status', 'payment_method', 'payment_gateway'
        ];

        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->latest();
        }
    }

    /**
     * Clear transaction cache.
     */
    protected function clearTransactionCache(): void
    {
        Cache::forget('transaction_stats_*');
    }

    /**
     * Get subscription transaction history.
     */
    public function getSubscriptionTransactionHistory(string $subscriptionId, array $filters = []): array
    {
        $transactions = $this->getModel()->newQuery()
            ->where('subscription_id', $subscriptionId)
            ->with(['organization', 'subscription.plan', 'invoice']);

        // Apply filters
        $this->applyTransactionFilters($transactions, $filters);

        $transactions = $transactions->latest()->get();

        $totalTransactions = $transactions->count();
        $totalAmount = $transactions->sum('amount');
        $successfulTransactions = $transactions->where('status', 'completed')->count();
        $failedTransactions = $transactions->whereIn('status', ['failed', 'cancelled'])->count();

        $successRate = $totalTransactions > 0 ? round(($successfulTransactions / $totalTransactions) * 100, 2) : 0;

        return [
            'subscription_id' => $subscriptionId,
            'total_transactions' => $totalTransactions,
            'total_amount' => $totalAmount,
            'successful_transactions' => $successfulTransactions,
            'failed_transactions' => $failedTransactions,
            'success_rate' => $successRate,
            'transactions' => $transactions,
        ];
    }

    /**
     * Get transaction analytics.
     */
    public function getTransactionAnalytics(array $filters = []): array
    {
        $query = $this->getModel()->newQuery();

        // Apply filters
        $this->applyTransactionFilters($query, $filters);

        // Revenue trends (last 12 months)
        $revenueTrends = $query->clone()
            ->selectRaw('DATE_TRUNC(\'month\', created_at) as month, SUM(amount) as revenue, COUNT(*) as count')
            ->where('created_at', '>=', now()->subMonths(12))
            ->where('status', 'completed')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => $item->month->format('Y-m'),
                    'revenue' => (float) $item->revenue,
                    'count' => $item->count,
                ];
            });

        // Payment method distribution
        $paymentMethodDistribution = $query->clone()
            ->selectRaw('payment_method, COUNT(*) as count, SUM(amount) as total_amount')
            ->groupBy('payment_method')
            ->get()
            ->map(function ($item) {
                return [
                    'payment_method' => $item->payment_method,
                    'count' => $item->count,
                    'total_amount' => (float) $item->total_amount,
                ];
            });

        // Payment gateway distribution
        $paymentGatewayDistribution = $query->clone()
            ->selectRaw('payment_gateway, COUNT(*) as count, SUM(amount) as total_amount')
            ->groupBy('payment_gateway')
            ->get()
            ->map(function ($item) {
                return [
                    'payment_gateway' => $item->payment_gateway,
                    'count' => $item->count,
                    'total_amount' => (float) $item->total_amount,
                ];
            });

        // Status distribution
        $statusDistribution = $query->clone()
            ->selectRaw('status, COUNT(*) as count, SUM(amount) as total_amount')
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => $item->status,
                    'count' => $item->count,
                    'total_amount' => (float) $item->total_amount,
                ];
            });

        // Average transaction amount by period
        $averageAmounts = $query->clone()
            ->selectRaw('DATE_TRUNC(\'month\', created_at) as month, AVG(amount) as avg_amount')
            ->where('created_at', '>=', now()->subMonths(12))
            ->where('status', 'completed')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => $item->month->format('Y-m'),
                    'avg_amount' => (float) $item->avg_amount,
                ];
            });

        return [
            'revenue_trends' => $revenueTrends,
            'payment_method_distribution' => $paymentMethodDistribution,
            'payment_gateway_distribution' => $paymentGatewayDistribution,
            'status_distribution' => $statusDistribution,
            'average_amounts' => $averageAmounts,
            'generated_at' => now()->toISOString(),
        ];
    }

    /**
     * Refund a transaction.
     */
    public function refundTransaction(string $id, array $data): ?array
    {
        $transaction = $this->getModel()->find($id);
        if (!$transaction) {
            return null;
        }

        // Simulate refund process
        $refundAmount = $data['amount'] ?? $transaction->amount;
        $refundResult = [
            'transaction_id' => $id,
            'refund_id' => 'refund_' . uniqid(),
            'amount' => $refundAmount,
            'currency' => $transaction->currency,
            'status' => 'success',
            'reason' => $data['reason'] ?? 'Customer request',
            'refunded_at' => now(),
            'notify_customer' => $data['notify_customer'] ?? true,
        ];

        // Update transaction status
        $transaction->update([
            'status' => 'refunded',
            'refunded_amount' => $refundAmount,
            'refunded_at' => now(),
        ]);

        Log::info('Transaction refunded', $refundResult);

        return $refundResult;
    }

    /**
     * Retry a failed transaction.
     */
    public function retryTransaction(string $id): ?array
    {
        $transaction = $this->getModel()->find($id);
        if (!$transaction) {
            return null;
        }

        // Simulate retry process
        $retryResult = [
            'transaction_id' => $id,
            'retry_id' => 'retry_' . uniqid(),
            'status' => 'success',
            'retried_at' => now(),
            'new_transaction_id' => 'txn_' . uniqid(),
        ];

        // Create new transaction or update existing
        $transaction->update([
            'status' => 'completed',
            'retried_at' => now(),
        ]);

        Log::info('Transaction retry performed', $retryResult);

        return $retryResult;
    }

    /**
     * Bulk refund transactions.
     */
    public function bulkRefundTransactions(array $transactionIds, array $data): array
    {
        $refunded = 0;
        $failed = 0;
        $results = [];

        foreach ($transactionIds as $id) {
            try {
                $result = $this->refundTransaction($id, $data);
                if ($result) {
                    $refunded++;
                    $results[] = $result;
                } else {
                    $failed++;
                }
            } catch (\Exception $e) {
                $failed++;
                Log::error('Bulk refund failed for transaction', [
                    'transaction_id' => $id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return [
            'refunded' => $refunded,
            'failed' => $failed,
            'total' => count($transactionIds),
            'results' => $results,
        ];
    }

    /**
     * Bulk retry transactions.
     */
    public function bulkRetryTransactions(array $transactionIds): array
    {
        $retried = 0;
        $failed = 0;
        $results = [];

        foreach ($transactionIds as $id) {
            try {
                $result = $this->retryTransaction($id);
                if ($result) {
                    $retried++;
                    $results[] = $result;
                } else {
                    $failed++;
                }
            } catch (\Exception $e) {
                $failed++;
                Log::error('Bulk retry failed for transaction', [
                    'transaction_id' => $id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return [
            'retried' => $retried,
            'failed' => $failed,
            'total' => count($transactionIds),
            'results' => $results,
        ];
    }

    /**
     * Get my transactions (organization-scoped).
     */
    public function getMyTransactions(string $organizationId, ?Request $request = null, array $filters = []): Collection|LengthAwarePaginator
    {
        $filters['organization_id'] = $organizationId;
        return $this->getAllTransactions($request, $filters, ['subscription.plan', 'invoice']);
    }

    /**
     * Get my specific transaction (organization-scoped).
     */
    public function getMyTransaction(string $id, string $organizationId): ?PaymentTransaction
    {
        return $this->getModel()->newQuery()
            ->where('id', $id)
            ->where('organization_id', $organizationId)
            ->with(['subscription.plan', 'invoice'])
            ->first();
    }

    /**
     * Get my transaction statistics (organization-scoped).
     */
    public function getMyTransactionStatistics(string $organizationId, array $filters = []): array
    {
        $filters['organization_id'] = $organizationId;
        return $this->getTransactionStatistics($filters);
    }

    /**
     * Handle Stripe webhook.
     */
    public function handleStripeWebhook(string $payload, ?string $signature = null): array
    {
        try {
            // In a real implementation, you would verify the signature
            $eventData = json_decode($payload, true);

            $eventType = $eventData['type'] ?? 'unknown';
            $eventId = $eventData['id'] ?? uniqid();

            $result = [
                'event_id' => $eventId,
                'event_type' => $eventType,
                'status' => 'processed',
                'processed_at' => now(),
            ];

            // Handle different event types
            switch ($eventType) {
                case 'payment_intent.succeeded':
                    $result['transaction_id'] = $this->processStripePaymentSuccess($eventData);
                    break;
                case 'payment_intent.payment_failed':
                    $result['transaction_id'] = $this->processStripePaymentFailure($eventData);
                    break;
                case 'charge.dispute.created':
                    $result['transaction_id'] = $this->processStripeDispute($eventData);
                    break;
                default:
                    $result['status'] = 'ignored';
                    $result['message'] = 'Event type not handled';
            }

            Log::info('Stripe webhook processed', $result);
            return $result;

        } catch (\Exception $e) {
            Log::error('Stripe webhook processing failed', [
                'error' => $e->getMessage(),
                'payload' => $payload
            ]);

            return [
                'status' => 'failed',
                'error' => $e->getMessage(),
                'processed_at' => now(),
            ];
        }
    }

    /**
     * Handle Midtrans webhook.
     */
    public function handleMidtransWebhook(array $payload): array
    {
        try {
            $transactionId = $payload['transaction_id'] ?? null;
            $status = $payload['transaction_status'] ?? 'unknown';
            $orderId = $payload['order_id'] ?? null;

            $result = [
                'transaction_id' => $transactionId,
                'order_id' => $orderId,
                'status' => $status,
                'processed_at' => now(),
            ];

            // Handle different statuses
            switch ($status) {
                case 'capture':
                case 'settlement':
                    $result['action'] = 'payment_success';
                    break;
                case 'deny':
                case 'cancel':
                case 'expire':
                    $result['action'] = 'payment_failed';
                    break;
                case 'pending':
                    $result['action'] = 'payment_pending';
                    break;
                default:
                    $result['action'] = 'unknown';
            }

            Log::info('Midtrans webhook processed', $result);
            return $result;

        } catch (\Exception $e) {
            Log::error('Midtrans webhook processing failed', [
                'error' => $e->getMessage(),
                'payload' => $payload
            ]);

            return [
                'status' => 'failed',
                'error' => $e->getMessage(),
                'processed_at' => now(),
            ];
        }
    }

    /**
     * Handle Xendit webhook.
     */
    public function handleXenditWebhook(array $payload): array
    {
        try {
            $eventType = $payload['event'] ?? 'unknown';
            $externalId = $payload['external_id'] ?? null;
            $status = $payload['status'] ?? 'unknown';

            $result = [
                'external_id' => $externalId,
                'event_type' => $eventType,
                'status' => $status,
                'processed_at' => now(),
            ];

            // Handle different event types
            switch ($eventType) {
                case 'payment.succeeded':
                    $result['action'] = 'payment_success';
                    break;
                case 'payment.failed':
                    $result['action'] = 'payment_failed';
                    break;
                case 'payment.pending':
                    $result['action'] = 'payment_pending';
                    break;
                default:
                    $result['action'] = 'unknown';
            }

            Log::info('Xendit webhook processed', $result);
            return $result;

        } catch (\Exception $e) {
            Log::error('Xendit webhook processing failed', [
                'error' => $e->getMessage(),
                'payload' => $payload
            ]);

            return [
                'status' => 'failed',
                'error' => $e->getMessage(),
                'processed_at' => now(),
            ];
        }
    }

    /**
     * Process Stripe payment success.
     */
    private function processStripePaymentSuccess(array $eventData): ?string
    {
        $paymentIntent = $eventData['data']['object'] ?? [];
        $transactionId = $paymentIntent['id'] ?? null;

        if ($transactionId) {
            // Update transaction status in database
            $this->getModel()->where('transaction_id', $transactionId)
                ->update([
                    'status' => 'completed',
                    'settled_at' => now(),
                ]);
        }

        return $transactionId;
    }

    /**
     * Process Stripe payment failure.
     */
    private function processStripePaymentFailure(array $eventData): ?string
    {
        $paymentIntent = $eventData['data']['object'] ?? [];
        $transactionId = $paymentIntent['id'] ?? null;

        if ($transactionId) {
            // Update transaction status in database
            $this->getModel()->where('transaction_id', $transactionId)
                ->update([
                    'status' => 'failed',
                    'failed_at' => now(),
                ]);
        }

        return $transactionId;
    }

    /**
     * Process Stripe dispute.
     */
    private function processStripeDispute(array $eventData): ?string
    {
        $dispute = $eventData['data']['object'] ?? [];
        $chargeId = $dispute['charge'] ?? null;

        if ($chargeId) {
            // Update transaction status in database
            $this->getModel()->where('transaction_id', $chargeId)
                ->update([
                    'status' => 'disputed',
                    'disputed_at' => now(),
                ]);
        }

        return $chargeId;
    }
}
