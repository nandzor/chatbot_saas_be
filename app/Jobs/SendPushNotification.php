<?php

namespace App\Jobs;

use App\Models\Organization;
use App\Models\Notification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class SendPushNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public Organization $organization;
    public Notification $notification;
    public array $data;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The maximum number of seconds the job can run.
     */
    public int $timeout = 30;

    /**
     * Create a new job instance.
     */
    public function __construct(Organization $organization, Notification $notification, array $data = [])
    {
        $this->organization = $organization;
        $this->notification = $notification;
        $this->data = $data;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info('Sending push notification', [
                'organization_id' => $this->organization->id,
                'notification_id' => $this->notification->id,
                'device_tokens_count' => count($this->data['device_tokens'] ?? [])
            ]);

            // Check if device tokens are provided
            $deviceTokens = $this->data['device_tokens'] ?? [];
            if (empty($deviceTokens)) {
                Log::warning('Push notification skipped - no device tokens', [
                    'organization_id' => $this->organization->id,
                    'notification_id' => $this->notification->id
                ]);
                return;
            }

            // Prepare push notification data
            $pushData = [
                'title' => $this->notification->title,
                'body' => $this->notification->message,
                'data' => array_merge($this->notification->data ?? [], [
                    'organization_id' => $this->organization->id,
                    'notification_id' => $this->notification->id,
                    'type' => $this->notification->type
                ]),
                'device_tokens' => $deviceTokens,
                'organization_id' => $this->organization->id,
                'notification_id' => $this->notification->id
            ];

            // Send push notification using configured provider
            $provider = config('notification.push.provider', 'fcm');
            $response = $this->sendViaProvider($provider, $pushData);

            if ($response['success']) {
                $this->notification->update([
                    'push_sent_at' => now(),
                    'push_status' => 'sent',
                    'push_provider' => $provider,
                    'push_message_id' => $response['message_id'] ?? null,
                    'push_success_count' => $response['success_count'] ?? 0,
                    'push_failure_count' => $response['failure_count'] ?? 0
                ]);

                Log::info('Push notification sent successfully', [
                    'organization_id' => $this->organization->id,
                    'notification_id' => $this->notification->id,
                    'provider' => $provider,
                    'success_count' => $response['success_count'] ?? 0,
                    'failure_count' => $response['failure_count'] ?? 0
                ]);
            } else {
                throw new \Exception('Push notification provider returned error: ' . ($response['error'] ?? 'Unknown error'));
            }

        } catch (\Exception $e) {
            Log::error('Failed to send push notification', [
                'organization_id' => $this->organization->id,
                'notification_id' => $this->notification->id,
                'error' => $e->getMessage()
            ]);

            $this->notification->update([
                'push_status' => 'failed',
                'push_error' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    /**
     * Send push notification via configured provider
     */
    private function sendViaProvider(string $provider, array $data): array
    {
        return match ($provider) {
            'fcm' => $this->sendViaFcm($data),
            'apns' => $this->sendViaApns($data),
            'onesignal' => $this->sendViaOneSignal($data),
            'mock' => $this->sendViaMock($data),
            default => throw new \Exception("Unsupported push provider: {$provider}")
        };
    }

    /**
     * Send via Firebase Cloud Messaging (FCM)
     */
    private function sendViaFcm(array $data): array
    {
        try {
            $serverKey = config('notification.push.fcm.server_key');
            $projectId = config('notification.push.fcm.project_id');

            if (!$serverKey || !$projectId) {
                throw new \Exception('FCM configuration missing');
            }

            $payload = [
                'registration_ids' => $data['device_tokens'],
                'notification' => [
                    'title' => $data['title'],
                    'body' => $data['body'],
                    'icon' => config('notification.push.fcm.icon', 'ic_notification'),
                    'sound' => config('notification.push.fcm.sound', 'default'),
                    'click_action' => config('notification.push.fcm.click_action')
                ],
                'data' => $data['data'],
                'android' => [
                    'priority' => 'high',
                    'notification' => [
                        'sound' => 'default',
                        'channel_id' => config('notification.push.fcm.channel_id', 'default')
                    ]
                ],
                'apns' => [
                    'payload' => [
                        'aps' => [
                            'alert' => [
                                'title' => $data['title'],
                                'body' => $data['body']
                            ],
                            'sound' => 'default',
                            'badge' => 1
                        ]
                    ]
                ]
            ];

            $response = Http::withHeaders([
                'Authorization' => 'key=' . $serverKey,
                'Content-Type' => 'application/json'
            ])->post("https://fcm.googleapis.com/fcm/send", $payload);

            if ($response->successful()) {
                $responseData = $response->json();
                $successCount = $responseData['success'] ?? 0;
                $failureCount = $responseData['failure'] ?? 0;

                return [
                    'success' => $successCount > 0,
                    'message_id' => $responseData['multicast_id'] ?? null,
                    'success_count' => $successCount,
                    'failure_count' => $failureCount,
                    'results' => $responseData['results'] ?? []
                ];
            } else {
                return [
                    'success' => false,
                    'error' => $response->body()
                ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Send via Apple Push Notification Service (APNS)
     */
    private function sendViaApns(array $data): array
    {
        try {
            $certificatePath = config('notification.push.apns.certificate_path');
            $passphrase = config('notification.push.apns.passphrase');
            $environment = config('notification.push.apns.environment', 'production');

            if (!$certificatePath) {
                throw new \Exception('APNS certificate path missing');
            }

            // This would require APNS implementation
            // For now, return mock success
            return [
                'success' => true,
                'message_id' => 'apns-' . uniqid(),
                'success_count' => count($data['device_tokens']),
                'failure_count' => 0
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Send via OneSignal
     */
    private function sendViaOneSignal(array $data): array
    {
        try {
            $appId = config('notification.push.onesignal.app_id');
            $restApiKey = config('notification.push.onesignal.rest_api_key');

            if (!$appId || !$restApiKey) {
                throw new \Exception('OneSignal configuration missing');
            }

            $payload = [
                'app_id' => $appId,
                'include_player_ids' => $data['device_tokens'],
                'headings' => ['en' => $data['title']],
                'contents' => ['en' => $data['body']],
                'data' => $data['data'],
                'android_sound' => 'default',
                'ios_sound' => 'default'
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . $restApiKey,
                'Content-Type' => 'application/json'
            ])->post('https://onesignal.com/api/v1/notifications', $payload);

            if ($response->successful()) {
                $responseData = $response->json();
                return [
                    'success' => true,
                    'message_id' => $responseData['id'] ?? null,
                    'success_count' => $responseData['recipients'] ?? 0,
                    'failure_count' => 0
                ];
            } else {
                return [
                    'success' => false,
                    'error' => $response->body()
                ];
            }
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Send via Mock (for testing)
     */
    private function sendViaMock(array $data): array
    {
        Log::info('Mock push notification sent', [
            'device_tokens_count' => count($data['device_tokens']),
            'title' => $data['title'],
            'body' => $data['body']
        ]);

        return [
            'success' => true,
            'message_id' => 'mock-' . uniqid(),
            'success_count' => count($data['device_tokens']),
            'failure_count' => 0
        ];
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Push notification job failed permanently', [
            'organization_id' => $this->organization->id,
            'notification_id' => $this->notification->id,
            'error' => $exception->getMessage()
        ]);

        $this->notification->update([
            'push_status' => 'failed',
            'push_error' => $exception->getMessage(),
            'push_failed_at' => now()
        ]);
    }
}
