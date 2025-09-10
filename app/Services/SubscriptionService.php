<?php

namespace App\Services;

use App\Models\Subscription;
use App\Models\Organization;
use App\Models\SubscriptionPlan;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SubscriptionService
{
    /**
     * Get subscriptions with filtering and pagination.
     *
     * @param array $filters
     * @return LengthAwarePaginator
     */
    public function getSubscriptions(array $filters = []): LengthAwarePaginator
    {
        $query = Subscription::with(['organization', 'plan']);

        // Apply filters
        if (!empty($filters['organization_id'])) {
            $query->where('organization_id', $filters['organization_id']);
        }

        if (!empty($filters['plan_id'])) {
            $query->where('plan_id', $filters['plan_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['billing_cycle'])) {
            $query->where('billing_cycle', $filters['billing_cycle']);
        }

        if (!empty($filters['search'])) {
            $searchTerm = $filters['search'];
            $query->where(function ($q) use ($searchTerm) {
                $q->whereHas('organization', function ($orgQuery) use ($searchTerm) {
                    $orgQuery->where('name', 'ilike', "%{$searchTerm}%")
                        ->orWhere('display_name', 'ilike', "%{$searchTerm}%")
                        ->orWhere('email', 'ilike', "%{$searchTerm}%");
                })
                ->orWhereHas('plan', function ($planQuery) use ($searchTerm) {
                    $planQuery->where('name', 'ilike', "%{$searchTerm}%")
                        ->orWhere('display_name', 'ilike', "%{$searchTerm}%");
                })
                ->orWhere('currency', 'ilike', "%{$searchTerm}%")
                ->orWhere('cancellation_reason', 'ilike', "%{$searchTerm}%");
            });
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', Carbon::parse($filters['date_from'])->startOfDay());
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', Carbon::parse($filters['date_to'])->endOfDay());
        }

        // Apply sorting
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortDirection = $filters['sort_direction'] ?? 'desc';

        // Handle special sorting cases
        switch ($sortBy) {
            case 'organization_name':
                $query->join('organizations', 'subscriptions.organization_id', '=', 'organizations.id')
                    ->orderBy('organizations.name', $sortDirection)
                    ->select('subscriptions.*');
                break;
            case 'plan_name':
                $query->join('subscription_plans', 'subscriptions.plan_id', '=', 'subscription_plans.id')
                    ->orderBy('subscription_plans.name', $sortDirection)
                    ->select('subscriptions.*');
                break;
            case 'amount':
                $query->orderBy('unit_amount', $sortDirection);
                break;
            default:
                $query->orderBy($sortBy, $sortDirection);
                break;
        }

        // Pagination
        $perPage = min($filters['per_page'] ?? 15, 100); // Max 100 per page
        $page = $filters['page'] ?? 1;

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get subscription by ID.
     *
     * @param string $id
     * @return Subscription|null
     */
    public function getSubscriptionById(string $id): ?Subscription
    {
        return Subscription::with(['organization', 'plan'])->find($id);
    }

    /**
     * Get subscription statistics.
     *
     * @param array $filters
     * @return array
     */
    public function getSubscriptionStatistics(array $filters = []): array
    {
        $query = Subscription::query();

        // Apply filters
        if (!empty($filters['organization_id'])) {
            $query->where('organization_id', $filters['organization_id']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', Carbon::parse($filters['date_from'])->startOfDay());
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', Carbon::parse($filters['date_to'])->endOfDay());
        }

        $totalSubscriptions = $query->count();
        $activeSubscriptions = $query->clone()->where('status', 'success')->count();
        $pendingSubscriptions = $query->clone()->where('status', 'pending')->count();
        $cancelledSubscriptions = $query->clone()->where('status', 'cancelled')->count();
        $failedSubscriptions = $query->clone()->where('status', 'failed')->count();

        // Revenue statistics
        $totalRevenue = $query->clone()->where('status', 'success')->sum('unit_amount');
        $monthlyRevenue = $query->clone()
            ->where('status', 'success')
            ->where('billing_cycle', 'monthly')
            ->sum('unit_amount');
        $quarterlyRevenue = $query->clone()
            ->where('status', 'success')
            ->where('billing_cycle', 'quarterly')
            ->sum('unit_amount');
        $yearlyRevenue = $query->clone()
            ->where('status', 'success')
            ->where('billing_cycle', 'yearly')
            ->sum('unit_amount');

        // Billing cycle distribution
        $billingCycleStats = $query->clone()
            ->selectRaw('billing_cycle, COUNT(*) as count')
            ->groupBy('billing_cycle')
            ->pluck('count', 'billing_cycle')
            ->toArray();

        // Status distribution
        $statusStats = $query->clone()
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Plan distribution
        $planStats = $query->clone()
            ->join('subscription_plans', 'subscriptions.plan_id', '=', 'subscription_plans.id')
            ->selectRaw('subscription_plans.name as plan_name, COUNT(*) as count')
            ->groupBy('subscription_plans.name')
            ->pluck('count', 'plan_name')
            ->toArray();

        // Monthly trends (last 12 months)
        $monthlyTrends = $query->clone()
            ->where('created_at', '>=', now()->subMonths(12))
            ->selectRaw('DATE_TRUNC(\'month\', created_at) as month, COUNT(*) as count, SUM(unit_amount) as total_amount')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => $item->month->format('Y-m-d H:i:s'),
                    'count' => $item->count,
                    'total_amount' => (float) $item->total_amount,
                ];
            });

        // Success rate calculation
        $successRate = $totalSubscriptions > 0 ? ($activeSubscriptions / $totalSubscriptions) * 100 : 0;

        return [
            'total_subscriptions' => $totalSubscriptions,
            'active_subscriptions' => $activeSubscriptions,
            'pending_subscriptions' => $pendingSubscriptions,
            'cancelled_subscriptions' => $cancelledSubscriptions,
            'failed_subscriptions' => $failedSubscriptions,
            'total_revenue' => (float) $totalRevenue,
            'monthly_revenue' => (float) $monthlyRevenue,
            'quarterly_revenue' => (float) $quarterlyRevenue,
            'yearly_revenue' => (float) $yearlyRevenue,
            'success_rate' => round($successRate, 2),
            'billing_cycle_distribution' => $billingCycleStats,
            'status_distribution' => $statusStats,
            'plan_distribution' => $planStats,
            'monthly_trends' => $monthlyTrends,
        ];
    }

    /**
     * Get subscriptions by organization.
     *
     * @param string $organizationId
     * @param array $filters
     * @return LengthAwarePaginator
     */
    public function getSubscriptionsByOrganization(string $organizationId, array $filters = []): LengthAwarePaginator
    {
        $filters['organization_id'] = $organizationId;
        return $this->getSubscriptions($filters);
    }

    /**
     * Get subscriptions by status.
     *
     * @param string $status
     * @param array $filters
     * @return LengthAwarePaginator
     */
    public function getSubscriptionsByStatus(string $status, array $filters = []): LengthAwarePaginator
    {
        $filters['status'] = $status;
        return $this->getSubscriptions($filters);
    }

    /**
     * Get subscriptions by billing cycle.
     *
     * @param string $billingCycle
     * @param array $filters
     * @return LengthAwarePaginator
     */
    public function getSubscriptionsByBillingCycle(string $billingCycle, array $filters = []): LengthAwarePaginator
    {
        $filters['billing_cycle'] = $billingCycle;
        return $this->getSubscriptions($filters);
    }

    /**
     * Create a new subscription.
     *
     * @param array $data
     * @return Subscription
     */
    public function createSubscription(array $data): Subscription
    {
        return DB::transaction(function () use ($data) {
            $subscription = Subscription::create([
                'organization_id' => $data['organization_id'],
                'plan_id' => $data['plan_id'],
                'status' => 'pending',
                'billing_cycle' => $data['billing_cycle'],
                'unit_amount' => $data['unit_amount'],
                'currency' => $data['currency'],
                'discount_amount' => $data['discount_amount'] ?? 0,
                'tax_amount' => $data['tax_amount'] ?? 0,
                'trial_start' => $data['trial_start'] ?? null,
                'trial_end' => $data['trial_end'] ?? null,
                'current_period_start' => $data['current_period_start'],
                'current_period_end' => $data['current_period_end'],
                'metadata' => $data['metadata'] ?? [],
            ]);

            // Load relationships
            $subscription->load(['organization', 'plan']);

            return $subscription;
        });
    }

    /**
     * Update a subscription.
     *
     * @param string $id
     * @param array $data
     * @return Subscription|null
     */
    public function updateSubscription(string $id, array $data): ?Subscription
    {
        return DB::transaction(function () use ($id, $data) {
            $subscription = Subscription::find($id);

            if (!$subscription) {
                return null;
            }

            $subscription->update($data);
            $subscription->load(['organization', 'plan']);

            return $subscription;
        });
    }

    /**
     * Cancel a subscription.
     *
     * @param string $id
     * @param array $data
     * @return Subscription|null
     */
    public function cancelSubscription(string $id, array $data): ?Subscription
    {
        return DB::transaction(function () use ($id, $data) {
            $subscription = Subscription::find($id);

            if (!$subscription) {
                return null;
            }

            $subscription->update([
                'status' => 'cancelled',
                'canceled_at' => now(),
                'cancel_at_period_end' => $data['cancel_at_period_end'] ?? true,
                'cancellation_reason' => $data['cancellation_reason'] ?? null,
            ]);

            $subscription->load(['organization', 'plan']);

            return $subscription;
        });
    }

    /**
     * Renew a subscription.
     *
     * @param string $id
     * @param array $data
     * @return Subscription|null
     */
    public function renewSubscription(string $id, array $data): ?Subscription
    {
        return DB::transaction(function () use ($id, $data) {
            $subscription = Subscription::find($id);

            if (!$subscription) {
                return null;
            }

            $updateData = [];

            if (isset($data['billing_cycle'])) {
                $updateData['billing_cycle'] = $data['billing_cycle'];
            }

            if (isset($data['unit_amount'])) {
                $updateData['unit_amount'] = $data['unit_amount'];
            }

            // Calculate new period dates based on billing cycle
            $billingCycle = $data['billing_cycle'] ?? $subscription->billing_cycle;
            $currentEnd = Carbon::parse($subscription->current_period_end);

            switch ($billingCycle) {
                case 'monthly':
                    $newEnd = $currentEnd->copy()->addMonth();
                    break;
                case 'quarterly':
                    $newEnd = $currentEnd->copy()->addMonths(3);
                    break;
                case 'yearly':
                    $newEnd = $currentEnd->copy()->addYear();
                    break;
                case 'lifetime':
                    $newEnd = $currentEnd->copy()->addYears(100); // Effectively lifetime
                    break;
                default:
                    $newEnd = $currentEnd->copy()->addMonth();
            }

            $updateData['current_period_start'] = $currentEnd->copy();
            $updateData['current_period_end'] = $newEnd;
            $updateData['status'] = 'success';
            $updateData['next_payment_date'] = $newEnd;

            $subscription->update($updateData);
            $subscription->load(['organization', 'plan']);

            return $subscription;
        });
    }

    /**
     * Bulk update subscriptions.
     *
     * @param array $data
     * @return array
     */
    public function bulkUpdateSubscriptions(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $subscriptionIds = $data['subscription_ids'];
            $updateData = collect($data)->except('subscription_ids')->toArray();

            $updated = Subscription::whereIn('id', $subscriptionIds)
                ->update($updateData);

            return [
                'updated' => $updated,
                'total' => count($subscriptionIds),
                'failed' => count($subscriptionIds) - $updated,
            ];
        });
    }

    /**
     * Export subscriptions.
     *
     * @param array $filters
     * @return array
     */
    public function exportSubscriptions(array $filters = []): array
    {
        $query = Subscription::with(['organization', 'plan']);

        // Apply same filters as getSubscriptions
        if (!empty($filters['organization_id'])) {
            $query->where('organization_id', $filters['organization_id']);
        }

        if (!empty($filters['plan_id'])) {
            $query->where('plan_id', $filters['plan_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['billing_cycle'])) {
            $query->where('billing_cycle', $filters['billing_cycle']);
        }

        if (!empty($filters['search'])) {
            $searchTerm = $filters['search'];
            $query->where(function ($q) use ($searchTerm) {
                $q->whereHas('organization', function ($orgQuery) use ($searchTerm) {
                    $orgQuery->where('name', 'ilike', "%{$searchTerm}%")
                        ->orWhere('display_name', 'ilike', "%{$searchTerm}%")
                        ->orWhere('email', 'ilike', "%{$searchTerm}%");
                })
                ->orWhereHas('plan', function ($planQuery) use ($searchTerm) {
                    $planQuery->where('name', 'ilike', "%{$searchTerm}%")
                        ->orWhere('display_name', 'ilike', "%{$searchTerm}%");
                });
            });
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', Carbon::parse($filters['date_from'])->startOfDay());
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', Carbon::parse($filters['date_to'])->endOfDay());
        }

        $subscriptions = $query->get();

        return $subscriptions->map(function ($subscription) {
            return [
                'id' => $subscription->id,
                'organization_name' => $subscription->organization->name,
                'organization_email' => $subscription->organization->email,
                'plan_name' => $subscription->plan->name,
                'plan_tier' => $subscription->plan->tier,
                'status' => $subscription->status,
                'billing_cycle' => $subscription->billing_cycle,
                'unit_amount' => $subscription->unit_amount,
                'currency' => $subscription->currency,
                'discount_amount' => $subscription->discount_amount,
                'tax_amount' => $subscription->tax_amount,
                'total_amount' => $subscription->unit_amount - $subscription->discount_amount + $subscription->tax_amount,
                'current_period_start' => $subscription->current_period_start?->format('Y-m-d H:i:s'),
                'current_period_end' => $subscription->current_period_end?->format('Y-m-d H:i:s'),
                'trial_start' => $subscription->trial_start?->format('Y-m-d H:i:s'),
                'trial_end' => $subscription->trial_end?->format('Y-m-d H:i:s'),
                'last_payment_date' => $subscription->last_payment_date?->format('Y-m-d H:i:s'),
                'next_payment_date' => $subscription->next_payment_date?->format('Y-m-d H:i:s'),
                'cancel_at_period_end' => $subscription->cancel_at_period_end,
                'canceled_at' => $subscription->canceled_at?->format('Y-m-d H:i:s'),
                'cancellation_reason' => $subscription->cancellation_reason,
                'created_at' => $subscription->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $subscription->updated_at->format('Y-m-d H:i:s'),
            ];
        })->toArray();
    }

    /**
     * Get subscription analytics.
     *
     * @param array $filters
     * @return array
     */
    public function getSubscriptionAnalytics(array $filters = []): array
    {
        $query = Subscription::query();

        // Apply filters
        if (!empty($filters['organization_id'])) {
            $query->where('organization_id', $filters['organization_id']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', Carbon::parse($filters['date_from'])->startOfDay());
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', Carbon::parse($filters['date_to'])->endOfDay());
        }

        $period = $filters['period'] ?? 'monthly';
        $dateFormat = $this->getDateFormatForPeriod($period);

        // Growth metrics
        $growthData = $query->clone()
            ->selectRaw("DATE_TRUNC('{$period}', created_at) as period, COUNT(*) as count")
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->map(function ($item) {
                return [
                    'period' => $item->period->format('Y-m-d'),
                    'count' => $item->count,
                ];
            });

        // Revenue trends
        $revenueData = $query->clone()
            ->selectRaw("DATE_TRUNC('{$period}', created_at) as period, SUM(unit_amount) as revenue")
            ->where('status', 'success')
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->map(function ($item) {
                return [
                    'period' => $item->period->format('Y-m-d'),
                    'revenue' => (float) $item->revenue,
                ];
            });

        // Churn analysis
        $churnData = $query->clone()
            ->selectRaw("DATE_TRUNC('{$period}', canceled_at) as period, COUNT(*) as churned")
            ->whereNotNull('canceled_at')
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->map(function ($item) {
                return [
                    'period' => $item->period->format('Y-m-d'),
                    'churned' => $item->churned,
                ];
            });

        // Plan performance
        $planPerformance = $query->clone()
            ->join('subscription_plans', 'subscriptions.plan_id', '=', 'subscription_plans.id')
            ->selectRaw('subscription_plans.name as plan_name, COUNT(*) as count, SUM(unit_amount) as revenue')
            ->groupBy('subscription_plans.name')
            ->get()
            ->map(function ($item) {
                return [
                    'plan_name' => $item->plan_name,
                    'count' => $item->count,
                    'revenue' => (float) $item->revenue,
                ];
            });

        // Geographic distribution (if organization has location data)
        $geographicData = $query->clone()
            ->join('organizations', 'subscriptions.organization_id', '=', 'organizations.id')
            ->selectRaw('organizations.timezone, COUNT(*) as count')
            ->groupBy('organizations.timezone')
            ->get()
            ->map(function ($item) {
                return [
                    'timezone' => $item->timezone,
                    'count' => $item->count,
                ];
            });

        return [
            'growth_metrics' => $growthData,
            'revenue_trends' => $revenueData,
            'churn_analysis' => $churnData,
            'plan_performance' => $planPerformance,
            'geographic_distribution' => $geographicData,
            'period' => $period,
            'generated_at' => now()->toISOString(),
        ];
    }

    /**
     * Get date format for period.
     *
     * @param string $period
     * @return string
     */
    private function getDateFormatForPeriod(string $period): string
    {
        return match ($period) {
            'daily' => 'day',
            'weekly' => 'week',
            'monthly' => 'month',
            'yearly' => 'year',
            default => 'month',
        };
    }

    /**
     * Handle webhook events for subscriptions.
     *
     * @param string $eventType
     * @param array $subscriptionData
     * @return array
     */
    public function handleWebhookEvent(string $eventType, array $subscriptionData): array
    {
        return DB::transaction(function () use ($eventType, $subscriptionData) {
            $subscriptionId = $subscriptionData['id'] ?? null;

            if (!$subscriptionId) {
                throw new \Exception('Subscription ID is required for webhook events');
            }

            $subscription = Subscription::find($subscriptionId);
            if (!$subscription) {
                throw new \Exception('Subscription not found');
            }

            $result = ['processed' => false, 'event_type' => $eventType];

            switch ($eventType) {
                case 'subscription.created':
                    $result['processed'] = true;
                    $result['message'] = 'Subscription created event processed';
                    break;

                case 'subscription.updated':
                    if (isset($subscriptionData['status'])) {
                        $subscription->update(['status' => $subscriptionData['status']]);
                    }
                    $result['processed'] = true;
                    $result['message'] = 'Subscription updated event processed';
                    break;

                case 'subscription.cancelled':
                    $subscription->update([
                        'status' => 'cancelled',
                        'canceled_at' => now(),
                        'cancellation_reason' => $subscriptionData['cancellation_reason'] ?? 'Webhook cancellation',
                    ]);
                    $result['processed'] = true;
                    $result['message'] = 'Subscription cancelled event processed';
                    break;

                case 'subscription.renewed':
                    $subscription->update([
                        'status' => 'success',
                        'current_period_start' => $subscriptionData['current_period_start'] ?? now(),
                        'current_period_end' => $subscriptionData['current_period_end'] ?? now()->addMonth(),
                        'next_payment_date' => $subscriptionData['next_payment_date'] ?? now()->addMonth(),
                    ]);
                    $result['processed'] = true;
                    $result['message'] = 'Subscription renewed event processed';
                    break;

                case 'payment.succeeded':
                    $subscription->update([
                        'status' => 'success',
                        'last_payment_date' => now(),
                    ]);
                    $result['processed'] = true;
                    $result['message'] = 'Payment succeeded event processed';
                    break;

                case 'payment.failed':
                    $subscription->update(['status' => 'failed']);
                    $result['processed'] = true;
                    $result['message'] = 'Payment failed event processed';
                    break;

                default:
                    $result['message'] = 'Unknown event type';
                    break;
            }

            // Log the webhook event
            Log::info('Subscription webhook processed', [
                'subscription_id' => $subscriptionId,
                'event_type' => $eventType,
                'processed' => $result['processed'],
            ]);

            return $result;
        });
    }

    /**
     * Get subscription usage statistics.
     *
     * @param array $filters
     * @return array
     */
    public function getSubscriptionUsage(array $filters = []): array
    {
        $query = Subscription::with(['organization', 'plan']);

        // Apply filters
        if (!empty($filters['organization_id'])) {
            $query->where('organization_id', $filters['organization_id']);
        }

        if (!empty($filters['subscription_id'])) {
            $query->where('id', $filters['subscription_id']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', Carbon::parse($filters['date_from'])->startOfDay());
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', Carbon::parse($filters['date_to'])->endOfDay());
        }

        $subscriptions = $query->get();

        $usageStats = [
            'total_subscriptions' => $subscriptions->count(),
            'active_subscriptions' => $subscriptions->where('status', 'success')->count(),
            'trial_subscriptions' => $subscriptions->where('status', 'pending')->count(),
            'cancelled_subscriptions' => $subscriptions->where('status', 'cancelled')->count(),
            'failed_subscriptions' => $subscriptions->where('status', 'failed')->count(),
            'total_revenue' => $subscriptions->where('status', 'success')->sum('unit_amount'),
            'average_revenue_per_subscription' => $subscriptions->where('status', 'success')->avg('unit_amount'),
            'billing_cycle_distribution' => $subscriptions->groupBy('billing_cycle')->map->count(),
            'plan_distribution' => $subscriptions->groupBy('plan.name')->map->count(),
            'monthly_recurring_revenue' => $subscriptions->where('status', 'success')
                ->where('billing_cycle', 'monthly')->sum('unit_amount'),
            'quarterly_recurring_revenue' => $subscriptions->where('status', 'success')
                ->where('billing_cycle', 'quarterly')->sum('unit_amount'),
            'yearly_recurring_revenue' => $subscriptions->where('status', 'success')
                ->where('billing_cycle', 'yearly')->sum('unit_amount'),
        ];

        return $usageStats;
    }

    /**
     * Get subscription history/audit log.
     *
     * @param string $subscriptionId
     * @param array $filters
     * @return LengthAwarePaginator
     */
    public function getSubscriptionHistory(string $subscriptionId, array $filters = []): LengthAwarePaginator
    {
        // For now, we'll create a mock history based on subscription changes
        // In a real implementation, you would have a separate audit_logs table

        $subscription = Subscription::find($subscriptionId);
        if (!$subscription) {
            return new LengthAwarePaginator([], 0, 15, 1);
        }

        $history = collect([
            [
                'id' => 1,
                'subscription_id' => $subscriptionId,
                'action' => 'created',
                'description' => 'Subscription created',
                'old_values' => null,
                'new_values' => $subscription->toArray(),
                'user_id' => null,
                'user_name' => 'System',
                'created_at' => $subscription->created_at,
            ],
            [
                'id' => 2,
                'subscription_id' => $subscriptionId,
                'action' => 'updated',
                'description' => 'Subscription status updated',
                'old_values' => ['status' => 'pending'],
                'new_values' => ['status' => $subscription->status],
                'user_id' => null,
                'user_name' => 'System',
                'created_at' => $subscription->updated_at,
            ],
        ]);

        // Apply filters
        if (!empty($filters['action'])) {
            $history = $history->where('action', $filters['action']);
        }

        if (!empty($filters['date_from'])) {
            $history = $history->where('created_at', '>=', Carbon::parse($filters['date_from'])->startOfDay());
        }

        if (!empty($filters['date_to'])) {
            $history = $history->where('created_at', '<=', Carbon::parse($filters['date_to'])->endOfDay());
        }

        $perPage = $filters['per_page'] ?? 15;
        $page = $filters['page'] ?? 1;

        return new LengthAwarePaginator(
            $history->forPage($page, $perPage)->values(),
            $history->count(),
            $perPage,
            $page,
            ['path' => request()->url()]
        );
    }
}
