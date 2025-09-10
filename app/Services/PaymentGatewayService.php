<?php

namespace App\Services;

use App\Exceptions\PaymentException;
use App\Models\PaymentTransaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class PaymentGatewayService
{
    protected array $gateways;
    protected string $defaultGateway;

    public function __construct()
    {
        $this->gateways = config('payment.supported_gateways', []);
        $this->defaultGateway = config('payment.default_gateway', 'stripe');
    }

    /**
     * Process payment through specified gateway.
     */
    public function processPayment(array $paymentData, string $gateway = null): array
    {
        $gateway = $gateway ?? $this->defaultGateway;

        if (!in_array($gateway, $this->gateways)) {
            throw PaymentException::validationError("Unsupported payment gateway: {$gateway}");
        }

        try {
            $result = match ($gateway) {
                'stripe' => $this->processStripePayment($paymentData),
                'midtrans' => $this->processMidtransPayment($paymentData),
                'xendit' => $this->processXenditPayment($paymentData),
                default => throw PaymentException::validationError("Gateway not implemented: {$gateway}"),
            };

            $this->logPaymentAttempt($gateway, $paymentData, $result, 'success');

            return $result;
        } catch (PaymentException $e) {
            $this->logPaymentAttempt($gateway, $paymentData, ['error' => $e->getMessage()], 'failed');
            throw $e;
        } catch (\Exception $e) {
            $this->logPaymentAttempt($gateway, $paymentData, ['error' => $e->getMessage()], 'error');
            throw PaymentException::gatewayError($gateway, $e->getMessage());
        }
    }

    /**
     * Process payment through Stripe.
     */
    protected function processStripePayment(array $paymentData): array
    {
        $config = config('payment.stripe');
        $apiKey = $config['secret_key'];
        $isTestMode = $config['test_mode'];

        $payload = [
            'amount' => $paymentData['amount'] * 100, // Convert to cents
            'currency' => strtolower($paymentData['currency']),
            'payment_method' => $paymentData['payment_method_id'],
            'confirmation_method' => 'manual',
            'confirm' => true,
            'return_url' => $paymentData['return_url'] ?? null,
            'metadata' => [
                'organization_id' => $paymentData['organization_id'],
                'subscription_id' => $paymentData['subscription_id'] ?? null,
                'invoice_id' => $paymentData['invoice_id'] ?? null,
            ],
        ];

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$apiKey}",
            'Stripe-Version' => $config['api_version'],
        ])->timeout($config['timeout'])
        ->post('https://api.stripe.com/v1/payment_intents', $payload);

        if (!$response->successful()) {
            $error = $response->json();
            throw PaymentException::gatewayError(
                'stripe',
                $error['error']['message'] ?? 'Payment failed',
                $error['error']['payment_intent']['id'] ?? null
            );
        }

        $data = $response->json();

        return [
            'transaction_id' => $data['id'],
            'status' => $this->mapStripeStatus($data['status']),
            'gateway_response' => $data,
            'requires_action' => $data['status'] === 'requires_action',
            'client_secret' => $data['client_secret'] ?? null,
        ];
    }

    /**
     * Process payment through Midtrans.
     */
    protected function processMidtransPayment(array $paymentData): array
    {
        $config = config('payment.midtrans');
        $serverKey = $config['server_key'];
        $isProduction = $config['is_production'];

        $payload = [
            'transaction_details' => [
                'order_id' => $paymentData['order_id'] ?? 'ORDER_' . uniqid(),
                'gross_amount' => $paymentData['amount'],
            ],
            'payment_type' => $paymentData['payment_type'] ?? 'credit_card',
            'credit_card' => [
                'token_id' => $paymentData['token_id'],
                'authentication' => $config['is_3ds'],
            ],
            'customer_details' => [
                'first_name' => $paymentData['customer_name'],
                'email' => $paymentData['customer_email'],
            ],
            'metadata' => [
                'organization_id' => $paymentData['organization_id'],
                'subscription_id' => $paymentData['subscription_id'] ?? null,
                'invoice_id' => $paymentData['invoice_id'] ?? null,
            ],
        ];

        $response = Http::withHeaders([
            'Accept' => 'application/json',
            'Authorization' => "Basic " . base64_encode($serverKey . ':'),
            'Content-Type' => 'application/json',
        ])->timeout(30)
        ->post($config['api_url'] . '/v2/charge', $payload);

        if (!$response->successful()) {
            $error = $response->json();
            throw PaymentException::gatewayError(
                'midtrans',
                $error['status_message'] ?? 'Payment failed',
                $error['order_id'] ?? null
            );
        }

        $data = $response->json();

        return [
            'transaction_id' => $data['order_id'],
            'status' => $this->mapMidtransStatus($data['status_code']),
            'gateway_response' => $data,
            'redirect_url' => $data['redirect_url'] ?? null,
        ];
    }

    /**
     * Process payment through Xendit.
     */
    protected function processXenditPayment(array $paymentData): array
    {
        $config = config('payment.xendit');
        $secretKey = $config['secret_key'];

        $payload = [
            'amount' => $paymentData['amount'],
            'currency' => $paymentData['currency'],
            'payment_method' => $paymentData['payment_method'] ?? 'CREDIT_CARD',
            'external_id' => $paymentData['external_id'] ?? 'PAYMENT_' . uniqid(),
            'description' => $paymentData['description'] ?? 'Payment',
            'customer' => [
                'given_names' => $paymentData['customer_name'],
                'email' => $paymentData['customer_email'],
            ],
            'metadata' => [
                'organization_id' => $paymentData['organization_id'],
                'subscription_id' => $paymentData['subscription_id'] ?? null,
                'invoice_id' => $paymentData['invoice_id'] ?? null,
            ],
        ];

        $response = Http::withHeaders([
            'Authorization' => "Basic " . base64_encode($secretKey . ':'),
            'Content-Type' => 'application/json',
        ])->timeout($config['timeout'])
        ->post($config['api_url'] . '/v2/invoices', $payload);

        if (!$response->successful()) {
            $error = $response->json();
            throw PaymentException::gatewayError(
                'xendit',
                $error['message'] ?? 'Payment failed',
                $error['id'] ?? null
            );
        }

        $data = $response->json();

        return [
            'transaction_id' => $data['id'],
            'status' => $this->mapXenditStatus($data['status']),
            'gateway_response' => $data,
            'invoice_url' => $data['invoice_url'] ?? null,
        ];
    }

    /**
     * Verify webhook signature.
     */
    public function verifyWebhookSignature(string $gateway, string $payload, string $signature): bool
    {
        return match ($gateway) {
            'stripe' => $this->verifyStripeSignature($payload, $signature),
            'midtrans' => $this->verifyMidtransSignature($payload, $signature),
            'xendit' => $this->verifyXenditSignature($payload, $signature),
            default => false,
        };
    }

    /**
     * Verify Stripe webhook signature.
     */
    protected function verifyStripeSignature(string $payload, string $signature): bool
    {
        $webhookSecret = config('payment.stripe.webhook_secret');

        if (!$webhookSecret) {
            return false;
        }

        $expectedSignature = hash_hmac('sha256', $payload, $webhookSecret);

        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Verify Midtrans webhook signature.
     */
    protected function verifyMidtransSignature(string $payload, string $signature): bool
    {
        $webhookSecret = config('payment.midtrans.webhook_secret');

        if (!$webhookSecret) {
            return false;
        }

        $expectedSignature = hash_hmac('sha256', $payload, $webhookSecret);

        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Verify Xendit webhook signature.
     */
    protected function verifyXenditSignature(string $payload, string $signature): bool
    {
        $webhookToken = config('payment.xendit.webhook_token');

        if (!$webhookToken) {
            return false;
        }

        $expectedSignature = hash_hmac('sha256', $payload, $webhookToken);

        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Map Stripe status to our status.
     */
    protected function mapStripeStatus(string $status): string
    {
        return match ($status) {
            'succeeded' => 'completed',
            'requires_payment_method', 'requires_confirmation' => 'pending',
            'requires_action' => 'processing',
            'processing' => 'processing',
            'canceled' => 'cancelled',
            default => 'failed',
        };
    }

    /**
     * Map Midtrans status to our status.
     */
    protected function mapMidtransStatus(string $statusCode): string
    {
        return match ($statusCode) {
            '200' => 'completed',
            '201' => 'pending',
            '202' => 'processing',
            '400', '401', '402', '403', '404', '500' => 'failed',
            default => 'pending',
        };
    }

    /**
     * Map Xendit status to our status.
     */
    protected function mapXenditStatus(string $status): string
    {
        return match ($status) {
            'PAID' => 'completed',
            'PENDING' => 'pending',
            'EXPIRED' => 'cancelled',
            'FAILED' => 'failed',
            default => 'pending',
        };
    }

    /**
     * Log payment attempt.
     */
    protected function logPaymentAttempt(string $gateway, array $paymentData, array $result, string $status): void
    {
        if (!config('payment.logging.enabled')) {
            return;
        }

        $logData = [
            'gateway' => $gateway,
            'status' => $status,
            'amount' => $paymentData['amount'] ?? null,
            'currency' => $paymentData['currency'] ?? null,
            'organization_id' => $paymentData['organization_id'] ?? null,
            'transaction_id' => $result['transaction_id'] ?? null,
        ];

        if (config('payment.logging.log_sensitive_data')) {
            $logData['payment_data'] = $paymentData;
            $logData['result'] = $result;
        }

        Log::channel('payment')->info('Payment attempt', $logData);
    }
}
