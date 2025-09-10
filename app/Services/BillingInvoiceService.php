<?php

namespace App\Services;

use App\Models\BillingInvoice;
use App\Models\Organization;
use App\Models\Subscription;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BillingInvoiceService extends BaseService
{
    /**
     * Get the model instance.
     */
    protected function getModel(): BillingInvoice
    {
        return new BillingInvoice();
    }

    /**
     * Get invoices with filters and pagination.
     */
    public function getInvoices(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = BillingInvoice::query()
            ->with(['organization', 'subscription.plan']);

        // Apply filters
        $this->applyInvoiceFilters($query, $filters);

        return $query->latest('invoice_date')->paginate($perPage);
    }

    /**
     * Get invoice by ID.
     */
    public function getInvoiceById(string $id): ?BillingInvoice
    {
        return BillingInvoice::with(['organization', 'subscription.plan'])
            ->find($id);
    }

    /**
     * Create a new invoice.
     */
    public function createInvoice(array $data): BillingInvoice
    {
        return DB::transaction(function () use ($data) {
            $invoice = BillingInvoice::create($data);

            Log::info('Invoice created', [
                'invoice_id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'organization_id' => $invoice->organization_id,
            ]);

            return $invoice->load(['organization', 'subscription.plan']);
        });
    }

    /**
     * Update an invoice.
     */
    public function updateInvoice(string $id, array $data): ?BillingInvoice
    {
        return DB::transaction(function () use ($id, $data) {
            $invoice = BillingInvoice::find($id);
            if (!$invoice) {
                return null;
            }

            $invoice->update($data);

            Log::info('Invoice updated', [
                'invoice_id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'changes' => array_keys($data),
            ]);

            return $invoice->load(['organization', 'subscription.plan']);
        });
    }

    /**
     * Mark invoice as paid.
     */
    public function markAsPaid(string $id, array $paymentData = []): ?BillingInvoice
    {
        return DB::transaction(function () use ($id, $paymentData) {
            $invoice = BillingInvoice::find($id);
            if (!$invoice) {
                return null;
            }

            $invoice->update([
                'status' => 'paid',
                'paid_date' => now(),
                'payment_reference' => $paymentData['payment_reference'] ?? null,
                'payment_method' => $paymentData['payment_method'] ?? $invoice->payment_method,
                'payment_gateway' => $paymentData['payment_gateway'] ?? $invoice->payment_gateway,
            ]);

            Log::info('Invoice marked as paid', [
                'invoice_id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'payment_reference' => $invoice->payment_reference,
            ]);

            return $invoice->load(['organization', 'subscription.plan']);
        });
    }

    /**
     * Mark invoice as overdue.
     */
    public function markAsOverdue(string $id): ?BillingInvoice
    {
        return DB::transaction(function () use ($id) {
            $invoice = BillingInvoice::find($id);
            if (!$invoice) {
                return null;
            }

            $invoice->update([
                'status' => 'overdue',
            ]);

            Log::info('Invoice marked as overdue', [
                'invoice_id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
            ]);

            return $invoice->load(['organization', 'subscription.plan']);
        });
    }

    /**
     * Cancel an invoice.
     */
    public function cancelInvoice(string $id, string $reason = null): ?BillingInvoice
    {
        return DB::transaction(function () use ($id, $reason) {
            $invoice = BillingInvoice::find($id);
            if (!$invoice) {
                return null;
            }

            $invoice->update([
                'status' => 'cancelled',
                'notes' => $reason ? ($invoice->notes . "\nCancelled: " . $reason) : $invoice->notes,
            ]);

            Log::info('Invoice cancelled', [
                'invoice_id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'reason' => $reason,
            ]);

            return $invoice->load(['organization', 'subscription.plan']);
        });
    }

    /**
     * Get organization invoices.
     */
    public function getOrganizationInvoices(string $organizationId, array $filters = []): Collection
    {
        $query = BillingInvoice::query()
            ->where('organization_id', $organizationId)
            ->with(['subscription.plan']);

        $this->applyInvoiceFilters($query, $filters);

        return $query->latest('invoice_date')->get();
    }

    /**
     * Get subscription invoices.
     */
    public function getSubscriptionInvoices(string $subscriptionId): Collection
    {
        return BillingInvoice::query()
            ->where('subscription_id', $subscriptionId)
            ->with(['organization', 'subscription.plan'])
            ->latest('invoice_date')
            ->get();
    }

    /**
     * Get overdue invoices.
     */
    public function getOverdueInvoices(): Collection
    {
        return BillingInvoice::query()
            ->where('status', 'overdue')
            ->where('due_date', '<', now())
            ->with(['organization', 'subscription.plan'])
            ->get();
    }

    /**
     * Get upcoming invoices (due within next 7 days).
     */
    public function getUpcomingInvoices(): Collection
    {
        return BillingInvoice::query()
            ->where('status', 'pending')
            ->where('due_date', '<=', now()->addDays(7))
            ->where('due_date', '>', now())
            ->with(['organization', 'subscription.plan'])
            ->get();
    }

    /**
     * Get invoice statistics.
     */
    public function getInvoiceStatistics(array $filters = []): array
    {
        $query = BillingInvoice::query();
        $this->applyInvoiceFilters($query, $filters);

        $totalInvoices = $query->count();
        $totalAmount = $query->sum('total_amount');
        $paidInvoices = $query->clone()->where('status', 'paid')->count();
        $overdueInvoices = $query->clone()->where('status', 'overdue')->count();
        $pendingInvoices = $query->clone()->where('status', 'pending')->count();

        $paidAmount = $query->clone()->where('status', 'paid')->sum('total_amount');
        $overdueAmount = $query->clone()->where('status', 'overdue')->sum('total_amount');
        $pendingAmount = $query->clone()->where('status', 'pending')->sum('total_amount');

        return [
            'total_invoices' => $totalInvoices,
            'total_amount' => $totalAmount,
            'paid_invoices' => $paidInvoices,
            'overdue_invoices' => $overdueInvoices,
            'pending_invoices' => $pendingInvoices,
            'paid_amount' => $paidAmount,
            'overdue_amount' => $overdueAmount,
            'pending_amount' => $pendingAmount,
            'collection_rate' => $totalAmount > 0 ? round(($paidAmount / $totalAmount) * 100, 2) : 0,
        ];
    }

    /**
     * Generate invoice number.
     */
    public function generateInvoiceNumber(): string
    {
        $prefix = 'INV';
        $year = now()->year;
        $month = now()->format('m');

        $lastInvoice = BillingInvoice::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastInvoice ?
            (int) substr($lastInvoice->invoice_number, -6) + 1 : 1;

        return $prefix . $year . $month . str_pad($sequence, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Apply filters to invoice query.
     */
    protected function applyInvoiceFilters($query, array $filters): void
    {
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['organization_id'])) {
            $query->where('organization_id', $filters['organization_id']);
        }

        if (isset($filters['subscription_id'])) {
            $query->where('subscription_id', $filters['subscription_id']);
        }

        if (isset($filters['billing_cycle'])) {
            $query->where('billing_cycle', $filters['billing_cycle']);
        }

        if (isset($filters['currency'])) {
            $query->where('currency', $filters['currency']);
        }

        if (isset($filters['date_from'])) {
            $query->where('invoice_date', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('invoice_date', '<=', $filters['date_to']);
        }

        if (isset($filters['amount_min'])) {
            $query->where('total_amount', '>=', $filters['amount_min']);
        }

        if (isset($filters['amount_max'])) {
            $query->where('total_amount', '<=', $filters['amount_max']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_email', 'like', "%{$search}%");
            });
        }
    }
}
