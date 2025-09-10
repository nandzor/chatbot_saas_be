<?php

namespace App\Observers;

use App\Models\BillingInvoice;
use Illuminate\Support\Facades\Log;

class BillingInvoiceObserver
{
    /**
     * Handle the BillingInvoice "created" event.
     */
    public function created(BillingInvoice $billingInvoice): void
    {
        Log::channel('billing')->info('Billing invoice created', [
            'invoice_id' => $billingInvoice->id,
            'organization_id' => $billingInvoice->organization_id,
            'subscription_id' => $billingInvoice->subscription_id,
            'invoice_number' => $billingInvoice->invoice_number,
            'total_amount' => $billingInvoice->total_amount,
            'currency' => $billingInvoice->currency,
            'status' => $billingInvoice->status,
            'due_date' => $billingInvoice->due_date,
            'created_at' => $billingInvoice->created_at,
        ]);

        // Log audit trail
        Log::channel('audit')->info('Billing invoice audit - created', [
            'invoice_id' => $billingInvoice->id,
            'organization_id' => $billingInvoice->organization_id,
            'subscription_id' => $billingInvoice->subscription_id,
            'action' => 'created',
            'invoice_number' => $billingInvoice->invoice_number,
            'total_amount' => $billingInvoice->total_amount,
            'currency' => $billingInvoice->currency,
            'status' => $billingInvoice->status,
            'timestamp' => now(),
        ]);
    }

    /**
     * Handle the BillingInvoice "updated" event.
     */
    public function updated(BillingInvoice $billingInvoice): void
    {
        $changes = $billingInvoice->getChanges();
        $original = $billingInvoice->getOriginal();

        // Log status changes specifically
        if (isset($changes['status']) && $changes['status'] !== $original['status']) {
            Log::channel('billing')->info('Billing invoice status changed', [
                'invoice_id' => $billingInvoice->id,
                'organization_id' => $billingInvoice->organization_id,
                'subscription_id' => $billingInvoice->subscription_id,
                'invoice_number' => $billingInvoice->invoice_number,
                'old_status' => $original['status'],
                'new_status' => $changes['status'],
                'total_amount' => $billingInvoice->total_amount,
                'currency' => $billingInvoice->currency,
                'updated_at' => $billingInvoice->updated_at,
            ]);

            // Log security events for overdue invoices
            if ($changes['status'] === 'overdue') {
                Log::channel('security')->warning('Billing invoice marked as overdue', [
                    'invoice_id' => $billingInvoice->id,
                    'organization_id' => $billingInvoice->organization_id,
                    'subscription_id' => $billingInvoice->subscription_id,
                    'invoice_number' => $billingInvoice->invoice_number,
                    'total_amount' => $billingInvoice->total_amount,
                    'currency' => $billingInvoice->currency,
                    'due_date' => $billingInvoice->due_date,
                    'timestamp' => now(),
                ]);
            }

            // Log payment events
            if ($changes['status'] === 'paid') {
                Log::channel('payment')->info('Billing invoice marked as paid', [
                    'invoice_id' => $billingInvoice->id,
                    'organization_id' => $billingInvoice->organization_id,
                    'subscription_id' => $billingInvoice->subscription_id,
                    'invoice_number' => $billingInvoice->invoice_number,
                    'total_amount' => $billingInvoice->total_amount,
                    'currency' => $billingInvoice->currency,
                    'paid_date' => $billingInvoice->paid_date,
                    'timestamp' => now(),
                ]);
            }
        }

        // Log amount changes
        if (isset($changes['total_amount']) && $changes['total_amount'] !== $original['total_amount']) {
            Log::channel('billing')->warning('Billing invoice amount changed', [
                'invoice_id' => $billingInvoice->id,
                'organization_id' => $billingInvoice->organization_id,
                'subscription_id' => $billingInvoice->subscription_id,
                'invoice_number' => $billingInvoice->invoice_number,
                'old_amount' => $original['total_amount'],
                'new_amount' => $changes['total_amount'],
                'currency' => $billingInvoice->currency,
                'timestamp' => now(),
            ]);
        }

        // Log all changes for audit
        Log::channel('audit')->info('Billing invoice audit - updated', [
            'invoice_id' => $billingInvoice->id,
            'organization_id' => $billingInvoice->organization_id,
            'subscription_id' => $billingInvoice->subscription_id,
            'action' => 'updated',
            'changes' => $changes,
            'original' => $original,
            'timestamp' => now(),
        ]);
    }

    /**
     * Handle the BillingInvoice "deleted" event.
     */
    public function deleted(BillingInvoice $billingInvoice): void
    {
        Log::channel('billing')->warning('Billing invoice deleted', [
            'invoice_id' => $billingInvoice->id,
            'organization_id' => $billingInvoice->organization_id,
            'subscription_id' => $billingInvoice->subscription_id,
            'invoice_number' => $billingInvoice->invoice_number,
            'total_amount' => $billingInvoice->total_amount,
            'currency' => $billingInvoice->currency,
            'status' => $billingInvoice->status,
            'deleted_at' => now(),
        ]);

        // Log audit trail
        Log::channel('audit')->warning('Billing invoice audit - deleted', [
            'invoice_id' => $billingInvoice->id,
            'organization_id' => $billingInvoice->organization_id,
            'subscription_id' => $billingInvoice->subscription_id,
            'action' => 'deleted',
            'invoice_number' => $billingInvoice->invoice_number,
            'total_amount' => $billingInvoice->total_amount,
            'currency' => $billingInvoice->currency,
            'status' => $billingInvoice->status,
            'timestamp' => now(),
        ]);
    }

    /**
     * Handle the BillingInvoice "restored" event.
     */
    public function restored(BillingInvoice $billingInvoice): void
    {
        Log::channel('billing')->info('Billing invoice restored', [
            'invoice_id' => $billingInvoice->id,
            'organization_id' => $billingInvoice->organization_id,
            'subscription_id' => $billingInvoice->subscription_id,
            'invoice_number' => $billingInvoice->invoice_number,
            'total_amount' => $billingInvoice->total_amount,
            'currency' => $billingInvoice->currency,
            'status' => $billingInvoice->status,
            'restored_at' => now(),
        ]);

        // Log audit trail
        Log::channel('audit')->info('Billing invoice audit - restored', [
            'invoice_id' => $billingInvoice->id,
            'organization_id' => $billingInvoice->organization_id,
            'subscription_id' => $billingInvoice->subscription_id,
            'action' => 'restored',
            'invoice_number' => $billingInvoice->invoice_number,
            'total_amount' => $billingInvoice->total_amount,
            'currency' => $billingInvoice->currency,
            'status' => $billingInvoice->status,
            'timestamp' => now(),
        ]);
    }

    /**
     * Handle the BillingInvoice "force deleted" event.
     */
    public function forceDeleted(BillingInvoice $billingInvoice): void
    {
        Log::channel('billing')->critical('Billing invoice force deleted', [
            'invoice_id' => $billingInvoice->id,
            'organization_id' => $billingInvoice->organization_id,
            'subscription_id' => $billingInvoice->subscription_id,
            'invoice_number' => $billingInvoice->invoice_number,
            'total_amount' => $billingInvoice->total_amount,
            'currency' => $billingInvoice->currency,
            'status' => $billingInvoice->status,
            'force_deleted_at' => now(),
        ]);

        // Log audit trail
        Log::channel('audit')->critical('Billing invoice audit - force deleted', [
            'invoice_id' => $billingInvoice->id,
            'organization_id' => $billingInvoice->organization_id,
            'subscription_id' => $billingInvoice->subscription_id,
            'action' => 'force_deleted',
            'invoice_number' => $billingInvoice->invoice_number,
            'total_amount' => $billingInvoice->total_amount,
            'currency' => $billingInvoice->currency,
            'status' => $billingInvoice->status,
            'timestamp' => now(),
        ]);
    }
}
