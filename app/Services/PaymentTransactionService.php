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
}
