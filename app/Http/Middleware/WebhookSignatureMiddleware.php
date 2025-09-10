<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use App\Traits\Api\ApiResponseTrait;

class WebhookSignatureMiddleware
{
    use ApiResponseTrait;

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            // Get the webhook signature from headers
            $signature = $request->header('X-Webhook-Signature') ??
                        $request->header('X-Hub-Signature-256') ??
                        $request->header('Stripe-Signature');

            if (!$signature) {
                Log::warning('Webhook request without signature', [
                    'url' => $request->url(),
                    'headers' => $request->headers->all(),
                    'ip' => $request->ip()
                ]);

                return $this->unauthorizedResponse('Webhook signature required');
            }

            // Get the webhook secret from config
            $webhookSecret = config('webhooks.secret') ?? config('app.webhook_secret');

            if (!$webhookSecret) {
                Log::error('Webhook secret not configured');
                return $this->serverErrorResponse('Webhook configuration error');
            }

            // Verify the signature
            $payload = $request->getContent();
            $expectedSignature = $this->generateSignature($payload, $webhookSecret);

            if (!$this->verifySignature($signature, $expectedSignature)) {
                Log::warning('Invalid webhook signature', [
                    'received' => $signature,
                    'expected' => $expectedSignature,
                    'url' => $request->url(),
                    'ip' => $request->ip()
                ]);

                return $this->unauthorizedResponse('Invalid webhook signature');
            }

            // Add webhook context to request
            $request->merge([
                'webhook_context' => [
                    'signature' => $signature,
                    'verified' => true,
                    'timestamp' => now()->toISOString(),
                ]
            ]);

            return $next($request);

        } catch (\Exception $e) {
            Log::error('Webhook signature verification failed', [
                'error' => $e->getMessage(),
                'url' => $request->url(),
                'ip' => $request->ip()
            ]);

            return $this->serverErrorResponse('Webhook verification failed');
        }
    }

    /**
     * Generate signature for payload.
     */
    protected function generateSignature(string $payload, string $secret): string
    {
        return 'sha256=' . hash_hmac('sha256', $payload, $secret);
    }

    /**
     * Verify webhook signature.
     */
    protected function verifySignature(string $received, string $expected): bool
    {
        // Use hash_equals for timing attack protection
        return hash_equals($expected, $received);
    }

    /**
     * Return unauthorized response.
     */
    protected function unauthorizedResponse(string $message): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'error' => 'WEBHOOK_SIGNATURE_INVALID',
        ], 401);
    }

    /**
     * Return server error response.
     */
    protected function serverErrorResponse(string $message): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'error' => 'WEBHOOK_VERIFICATION_ERROR',
        ], 500);
    }
}
