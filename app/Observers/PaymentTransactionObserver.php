<?php

namespace App\Observers;

use App\Models\PaymentTransaction;
use Illuminate\Support\Facades\Log;

class PaymentTransactionObserver
{
    /**
     * Handle the PaymentTransaction "created" event.
     */
    public function created(PaymentTransaction $paymentTransaction): void
    {
        Log::channel('payment')->info('Payment transaction created', [
            'transaction_id' => $paymentTransaction->id,
            'organization_id' => $paymentTransaction->organization_id,
            'amount' => $paymentTransaction->amount,
            'currency' => $paymentTransaction->currency,
            'gateway' => $paymentTransaction->gateway,
            'status' => $paymentTransaction->status,
            'gateway_transaction_id' => $paymentTransaction->gateway_transaction_id,
            'created_at' => $paymentTransaction->created_at,
        ]);

        // Log audit trail
        Log::channel('audit')->info('Payment transaction audit - created', [
            'transaction_id' => $paymentTransaction->id,
            'organization_id' => $paymentTransaction->organization_id,
            'action' => 'created',
            'amount' => $paymentTransaction->amount,
            'currency' => $paymentTransaction->currency,
            'gateway' => $paymentTransaction->gateway,
            'timestamp' => now(),
        ]);
    }

    /**
     * Handle the PaymentTransaction "updated" event.
     */
    public function updated(PaymentTransaction $paymentTransaction): void
    {
        $changes = $paymentTransaction->getChanges();
        $original = $paymentTransaction->getOriginal();

        // Log status changes specifically
        if (isset($changes['status']) && $changes['status'] !== $original['status']) {
            Log::channel('payment')->info('Payment transaction status changed', [
                'transaction_id' => $paymentTransaction->id,
                'organization_id' => $paymentTransaction->organization_id,
                'old_status' => $original['status'],
                'new_status' => $changes['status'],
                'gateway' => $paymentTransaction->gateway,
                'gateway_transaction_id' => $paymentTransaction->gateway_transaction_id,
                'updated_at' => $paymentTransaction->updated_at,
            ]);

            // Log security events for failed payments
            if ($changes['status'] === 'failed') {
                Log::channel('security')->warning('Payment transaction failed', [
                    'transaction_id' => $paymentTransaction->id,
                    'organization_id' => $paymentTransaction->organization_id,
                    'gateway' => $paymentTransaction->gateway,
                    'gateway_transaction_id' => $paymentTransaction->gateway_transaction_id,
                    'failure_reason' => $paymentTransaction->failure_reason,
                    'timestamp' => now(),
                ]);
            }
        }

        // Log all changes for audit
        Log::channel('audit')->info('Payment transaction audit - updated', [
            'transaction_id' => $paymentTransaction->id,
            'organization_id' => $paymentTransaction->organization_id,
            'action' => 'updated',
            'changes' => $changes,
            'original' => $original,
            'timestamp' => now(),
        ]);
    }

    /**
     * Handle the PaymentTransaction "deleted" event.
     */
    public function deleted(PaymentTransaction $paymentTransaction): void
    {
        Log::channel('payment')->warning('Payment transaction deleted', [
            'transaction_id' => $paymentTransaction->id,
            'organization_id' => $paymentTransaction->organization_id,
            'amount' => $paymentTransaction->amount,
            'currency' => $paymentTransaction->currency,
            'gateway' => $paymentTransaction->gateway,
            'status' => $paymentTransaction->status,
            'deleted_at' => now(),
        ]);

        // Log audit trail
        Log::channel('audit')->warning('Payment transaction audit - deleted', [
            'transaction_id' => $paymentTransaction->id,
            'organization_id' => $paymentTransaction->organization_id,
            'action' => 'deleted',
            'amount' => $paymentTransaction->amount,
            'currency' => $paymentTransaction->currency,
            'gateway' => $paymentTransaction->gateway,
            'timestamp' => now(),
        ]);
    }

    /**
     * Handle the PaymentTransaction "restored" event.
     */
    public function restored(PaymentTransaction $paymentTransaction): void
    {
        Log::channel('payment')->info('Payment transaction restored', [
            'transaction_id' => $paymentTransaction->id,
            'organization_id' => $paymentTransaction->organization_id,
            'amount' => $paymentTransaction->amount,
            'currency' => $paymentTransaction->currency,
            'gateway' => $paymentTransaction->gateway,
            'status' => $paymentTransaction->status,
            'restored_at' => now(),
        ]);

        // Log audit trail
        Log::channel('audit')->info('Payment transaction audit - restored', [
            'transaction_id' => $paymentTransaction->id,
            'organization_id' => $paymentTransaction->organization_id,
            'action' => 'restored',
            'amount' => $paymentTransaction->amount,
            'currency' => $paymentTransaction->currency,
            'gateway' => $paymentTransaction->gateway,
            'timestamp' => now(),
        ]);
    }

    /**
     * Handle the PaymentTransaction "force deleted" event.
     */
    public function forceDeleted(PaymentTransaction $paymentTransaction): void
    {
        Log::channel('payment')->critical('Payment transaction force deleted', [
            'transaction_id' => $paymentTransaction->id,
            'organization_id' => $paymentTransaction->organization_id,
            'amount' => $paymentTransaction->amount,
            'currency' => $paymentTransaction->currency,
            'gateway' => $paymentTransaction->gateway,
            'status' => $paymentTransaction->status,
            'force_deleted_at' => now(),
        ]);

        // Log audit trail
        Log::channel('audit')->critical('Payment transaction audit - force deleted', [
            'transaction_id' => $paymentTransaction->id,
            'organization_id' => $paymentTransaction->organization_id,
            'action' => 'force_deleted',
            'amount' => $paymentTransaction->amount,
            'currency' => $paymentTransaction->currency,
            'gateway' => $paymentTransaction->gateway,
            'timestamp' => now(),
        ]);
    }
}
