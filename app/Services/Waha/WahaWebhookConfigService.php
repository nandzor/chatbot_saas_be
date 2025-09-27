<?php

namespace App\Services\Waha;

use Illuminate\Support\Facades\Log;

class WahaWebhookConfigService
{
    protected WahaService $wahaService;
    protected WahaSyncService $wahaSyncService;

    public function __construct(
        WahaService $wahaService,
        WahaSyncService $wahaSyncService
    ) {
        $this->wahaService = $wahaService;
        $this->wahaSyncService = $wahaSyncService;
    }

    /**
     * Get webhook configuration for a session
     */
    public function getWebhookConfig(string $sessionId, string $organizationId): array
    {
        try {
            // Verify session belongs to current organization
            $localSession = $this->wahaSyncService->verifySessionAccessById($organizationId, $sessionId);
            if (!$localSession) {
                return [
                    'success' => false,
                    'message' => 'Session not found',
                    'code' => 404
                ];
            }

            $sessionName = $localSession->session_name;
            $result = $this->wahaService->getWebhookConfig($sessionName);

            return [
                'success' => true,
                'message' => $result['message'] ?? 'Webhook configuration retrieved successfully',
                'data' => $result['data'] ?? []
            ];

        } catch (\Exception $e) {
            Log::error('Failed to get webhook config', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            return [
                'success' => false,
                'message' => 'Failed to get webhook config: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }

    /**
     * Configure webhook for a session
     */
    public function configureWebhook(string $sessionId, array $webhookData, string $organizationId): array
    {
        try {
            // Verify session belongs to current organization
            $localSession = $this->wahaSyncService->verifySessionAccessById($organizationId, $sessionId);
            if (!$localSession) {
                return [
                    'success' => false,
                    'message' => 'Session not found',
                    'code' => 404
                ];
            }

            $sessionName = $localSession->session_name;
            $webhookUrl = $webhookData['webhook_url'];
            $events = $webhookData['events'] ?? ['message', 'session.status'];
            $options = array_intersect_key($webhookData, array_flip(['webhook_by_events']));

            $result = $this->wahaService->configureWebhook($sessionName, $webhookUrl, $events, $options);

            return [
                'success' => true,
                'message' => $result['message'] ?? 'Webhook configured successfully',
                'data' => $result['data'] ?? []
            ];

        } catch (\Exception $e) {
            Log::error('Failed to configure webhook', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            return [
                'success' => false,
                'message' => 'Failed to configure webhook: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }

    /**
     * Update webhook configuration for a session
     */
    public function updateWebhookConfig(string $sessionId, array $webhookData, string $organizationId): array
    {
        try {
            // Verify session belongs to current organization
            $localSession = $this->wahaSyncService->verifySessionAccessById($organizationId, $sessionId);
            if (!$localSession) {
                return [
                    'success' => false,
                    'message' => 'Session not found',
                    'code' => 404
                ];
            }

            $sessionName = $localSession->session_name;
            $webhookUrl = $webhookData['webhook_url'] ?? null;
            $events = $webhookData['events'] ?? ['message', 'session.status'];
            $options = array_intersect_key($webhookData, array_flip(['webhook_by_events']));

            $result = $this->wahaService->configureWebhook($sessionName, $webhookUrl, $events, $options);

            return [
                'success' => true,
                'message' => $result['message'] ?? 'Webhook configuration updated successfully',
                'data' => $result['data'] ?? []
            ];

        } catch (\Exception $e) {
            Log::error('Failed to update webhook config', [
                'session_id' => $sessionId,
                'error' => $e->getMessage()
            ]);
            return [
                'success' => false,
                'message' => 'Failed to update webhook config: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }
}
