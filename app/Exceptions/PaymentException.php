<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentException extends Exception
{
    protected $errorCode;
    protected $gateway;
    protected $transactionId;

    public function __construct(
        string $message = 'Payment processing failed',
        string $errorCode = 'PAYMENT_ERROR',
        string $gateway = null,
        string $transactionId = null,
        int $code = 400,
        Exception $previous = null
    ) {
        parent::__construct($message, $code, $previous);

        $this->errorCode = $errorCode;
        $this->gateway = $gateway;
        $this->transactionId = $transactionId;
    }

    /**
     * Get the error code.
     */
    public function getErrorCode(): string
    {
        return $this->errorCode;
    }

    /**
     * Get the payment gateway.
     */
    public function getGateway(): ?string
    {
        return $this->gateway;
    }

    /**
     * Get the transaction ID.
     */
    public function getTransactionId(): ?string
    {
        return $this->transactionId;
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
            'gateway' => $this->gateway,
            'transaction_id' => $this->transactionId,
            'timestamp' => now()->toISOString(),
        ], $this->getCode());
    }

    /**
     * Create a payment gateway error.
     */
    public static function gatewayError(
        string $gateway,
        string $message,
        string $transactionId = null
    ): self {
        return new self(
            "Payment gateway error: {$message}",
            'PAYMENT_GATEWAY_ERROR',
            $gateway,
            $transactionId,
            502
        );
    }

    /**
     * Create a payment validation error.
     */
    public static function validationError(string $message): self
    {
        return new self(
            "Payment validation error: {$message}",
            'PAYMENT_VALIDATION_ERROR',
            null,
            null,
            422
        );
    }

    /**
     * Create a payment timeout error.
     */
    public static function timeoutError(string $gateway, string $transactionId = null): self
    {
        return new self(
            'Payment processing timeout',
            'PAYMENT_TIMEOUT',
            $gateway,
            $transactionId,
            408
        );
    }

    /**
     * Create a payment declined error.
     */
    public static function declinedError(
        string $gateway,
        string $reason,
        string $transactionId = null
    ): self {
        return new self(
            "Payment declined: {$reason}",
            'PAYMENT_DECLINED',
            $gateway,
            $transactionId,
            402
        );
    }

    /**
     * Create a payment fraud detected error.
     */
    public static function fraudDetectedError(
        string $gateway,
        string $transactionId = null
    ): self {
        return new self(
            'Payment blocked due to fraud detection',
            'PAYMENT_FRAUD_DETECTED',
            $gateway,
            $transactionId,
            403
        );
    }

    /**
     * Create a payment insufficient funds error.
     */
    public static function insufficientFundsError(
        string $gateway,
        string $transactionId = null
    ): self {
        return new self(
            'Insufficient funds for payment',
            'PAYMENT_INSUFFICIENT_FUNDS',
            $gateway,
            $transactionId,
            402
        );
    }

    /**
     * Create a payment card expired error.
     */
    public static function cardExpiredError(
        string $gateway,
        string $transactionId = null
    ): self {
        return new self(
            'Payment card has expired',
            'PAYMENT_CARD_EXPIRED',
            $gateway,
            $transactionId,
            402
        );
    }

    /**
     * Create a payment card invalid error.
     */
    public static function cardInvalidError(
        string $gateway,
        string $transactionId = null
    ): self {
        return new self(
            'Invalid payment card',
            'PAYMENT_CARD_INVALID',
            $gateway,
            $transactionId,
            402
        );
    }
}
