<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BillingException extends Exception
{
    protected $errorCode;
    protected $invoiceId;
    protected $organizationId;

    public function __construct(
        string $message = 'Billing operation failed',
        string $errorCode = 'BILLING_ERROR',
        string $invoiceId = null,
        string $organizationId = null,
        int $code = 400,
        Exception $previous = null
    ) {
        parent::__construct($message, $code, $previous);

        $this->errorCode = $errorCode;
        $this->invoiceId = $invoiceId;
        $this->organizationId = $organizationId;
    }

    /**
     * Get the error code.
     */
    public function getErrorCode(): string
    {
        return $this->errorCode;
    }

    /**
     * Get the invoice ID.
     */
    public function getInvoiceId(): ?string
    {
        return $this->invoiceId;
    }

    /**
     * Get the organization ID.
     */
    public function getOrganizationId(): ?string
    {
        return $this->organizationId;
    }

    /**
     * Render the exception as an HTTP response.
     */
    public function render(Request $request): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $this->getMessage(),
            'error' => $this->errorCode,
            'invoice_id' => $this->invoiceId,
            'organization_id' => $this->organizationId,
            'timestamp' => now()->toISOString(),
        ], $this->getCode());
    }

    /**
     * Create an invoice not found error.
     */
    public static function invoiceNotFound(string $invoiceId): self
    {
        return new self(
            'Invoice not found',
            'INVOICE_NOT_FOUND',
            $invoiceId,
            null,
            404
        );
    }

    /**
     * Create an invoice already paid error.
     */
    public static function invoiceAlreadyPaid(string $invoiceId): self
    {
        return new self(
            'Invoice has already been paid',
            'INVOICE_ALREADY_PAID',
            $invoiceId,
            null,
            409
        );
    }

    /**
     * Create an invoice cancelled error.
     */
    public static function invoiceCancelled(string $invoiceId): self
    {
        return new self(
            'Invoice has been cancelled',
            'INVOICE_CANCELLED',
            $invoiceId,
            null,
            409
        );
    }

    /**
     * Create an invoice overdue error.
     */
    public static function invoiceOverdue(string $invoiceId): self
    {
        return new self(
            'Invoice is overdue',
            'INVOICE_OVERDUE',
            $invoiceId,
            null,
            402
        );
    }

    /**
     * Create an invoice amount mismatch error.
     */
    public static function amountMismatch(
        string $invoiceId,
        float $expectedAmount,
        float $actualAmount
    ): self {
        return new self(
            "Payment amount mismatch. Expected: {$expectedAmount}, Actual: {$actualAmount}",
            'INVOICE_AMOUNT_MISMATCH',
            $invoiceId,
            null,
            422
        );
    }

    /**
     * Create an invoice currency mismatch error.
     */
    public static function currencyMismatch(
        string $invoiceId,
        string $expectedCurrency,
        string $actualCurrency
    ): self {
        return new self(
            "Payment currency mismatch. Expected: {$expectedCurrency}, Actual: {$actualCurrency}",
            'INVOICE_CURRENCY_MISMATCH',
            $invoiceId,
            null,
            422
        );
    }

    /**
     * Create an invoice generation error.
     */
    public static function generationError(string $organizationId, string $reason = null): self
    {
        $message = 'Failed to generate invoice';
        if ($reason) {
            $message .= ": {$reason}";
        }

        return new self(
            $message,
            'INVOICE_GENERATION_ERROR',
            null,
            $organizationId,
            500
        );
    }

    /**
     * Create an invoice validation error.
     */
    public static function validationError(string $message): self
    {
        return new self(
            "Invoice validation error: {$message}",
            'INVOICE_VALIDATION_ERROR',
            null,
            null,
            422
        );
    }

    /**
     * Create an invoice processing error.
     */
    public static function processingError(string $invoiceId, string $reason = null): self
    {
        $message = 'Failed to process invoice';
        if ($reason) {
            $message .= ": {$reason}";
        }

        return new self(
            $message,
            'INVOICE_PROCESSING_ERROR',
            $invoiceId,
            null,
            500
        );
    }

    /**
     * Create an invoice refund error.
     */
    public static function refundError(string $invoiceId, string $reason = null): self
    {
        $message = 'Failed to process invoice refund';
        if ($reason) {
            $message .= ": {$reason}";
        }

        return new self(
            $message,
            'INVOICE_REFUND_ERROR',
            $invoiceId,
            null,
            500
        );
    }

    /**
     * Create an invoice export error.
     */
    public static function exportError(string $format, string $reason = null): self
    {
        $message = "Failed to export invoices in {$format} format";
        if ($reason) {
            $message .= ": {$reason}";
        }

        return new self(
            $message,
            'INVOICE_EXPORT_ERROR',
            null,
            null,
            500
        );
    }
}
