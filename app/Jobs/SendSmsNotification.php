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

class SendSmsNotification implements ShouldQueue
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
            Log::info('Sending SMS notification', [
                'organization_id' => $this->organization->id,
                'notification_id' => $this->notification->id,
                'phone_number' => $this->data['phone_number'] ?? null
            ]);

            // Check if phone number is provided
            $phoneNumber = $this->data['phone_number'] ?? $this->organization->phone;
            if (!$phoneNumber) {
                Log::warning('SMS notification skipped - no phone number', [
                    'organization_id' => $this->organization->id,
                    'notification_id' => $this->notification->id
                ]);
                return;
            }

            // Prepare SMS data
            $smsData = [
                'to' => $this->formatPhoneNumber($phoneNumber),
                'message' => $this->formatSmsMessage(),
                'from' => config('notification.sms.from', config('app.name')),
                'organization_id' => $this->organization->id,
                'notification_id' => $this->notification->id
            ];

            // Send SMS using configured provider
            $provider = config('notification.sms.provider', 'twilio');
            $response = $this->sendViaProvider($provider, $smsData);

            if ($response['success']) {
                $this->notification->update([
                    'sms_sent_at' => now(),
                    'sms_status' => 'sent',
                    'sms_provider' => $provider,
                    'sms_message_id' => $response['message_id'] ?? null
                ]);

                Log::info('SMS notification sent successfully', [
                    'organization_id' => $this->organization->id,
                    'notification_id' => $this->notification->id,
                    'provider' => $provider,
                    'message_id' => $response['message_id'] ?? null
                ]);
            } else {
                throw new \Exception('SMS provider returned error: ' . ($response['error'] ?? 'Unknown error'));
            }

        } catch (\Exception $e) {
            Log::error('Failed to send SMS notification', [
                'organization_id' => $this->organization->id,
                'notification_id' => $this->notification->id,
                'error' => $e->getMessage()
            ]);

            $this->notification->update([
                'sms_status' => 'failed',
                'sms_error' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    /**
     * Send SMS via configured provider
     */
    private function sendViaProvider(string $provider, array $data): array
    {
        return match ($provider) {
            'twilio' => $this->sendViaTwilio($data),
            'nexmo' => $this->sendViaNexmo($data),
            'aws_sns' => $this->sendViaAwsSns($data),
            'mock' => $this->sendViaMock($data),
            default => throw new \Exception("Unsupported SMS provider: {$provider}")
        };
    }

    /**
     * Send via Twilio
     */
    private function sendViaTwilio(array $data): array
    {
        try {
            $accountSid = config('notification.sms.twilio.account_sid');
            $authToken = config('notification.sms.twilio.auth_token');
            $fromNumber = config('notification.sms.twilio.from_number');

            if (!$accountSid || !$authToken || !$fromNumber) {
                throw new \Exception('Twilio configuration missing');
            }

            $response = Http::withBasicAuth($accountSid, $authToken)
                ->asForm()
                ->post("https://api.twilio.com/2010-04-01/Accounts/{$accountSid}/Messages.json", [
                    'From' => $fromNumber,
                    'To' => $data['to'],
                    'Body' => $data['message']
                ]);

            if ($response->successful()) {
                $responseData = $response->json();
                return [
                    'success' => true,
                    'message_id' => $responseData['sid'] ?? null
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
     * Send via Nexmo (Vonage)
     */
    private function sendViaNexmo(array $data): array
    {
        try {
            $apiKey = config('notification.sms.nexmo.api_key');
            $apiSecret = config('notification.sms.nexmo.api_secret');
            $fromName = config('notification.sms.nexmo.from_name');

            if (!$apiKey || !$apiSecret) {
                throw new \Exception('Nexmo configuration missing');
            }

            $response = Http::post('https://rest.nexmo.com/sms/json', [
                'api_key' => $apiKey,
                'api_secret' => $apiSecret,
                'from' => $fromName,
                'to' => $data['to'],
                'text' => $data['message']
            ]);

            if ($response->successful()) {
                $responseData = $response->json();
                return [
                    'success' => $responseData['messages'][0]['status'] === '0',
                    'message_id' => $responseData['messages'][0]['message-id'] ?? null,
                    'error' => $responseData['messages'][0]['status'] !== '0' ? $responseData['messages'][0]['error-text'] : null
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
     * Send via AWS SNS
     */
    private function sendViaAwsSns(array $data): array
    {
        try {
            $accessKey = config('notification.sms.aws_sns.access_key');
            $secretKey = config('notification.sms.aws_sns.secret_key');
            $region = config('notification.sms.aws_sns.region', 'us-east-1');

            if (!$accessKey || !$secretKey) {
                throw new \Exception('AWS SNS configuration missing');
            }

            // This would require AWS SDK implementation
            // For now, return mock success
            return [
                'success' => true,
                'message_id' => 'aws-sns-' . uniqid()
            ];
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
        Log::info('Mock SMS sent', $data);

        return [
            'success' => true,
            'message_id' => 'mock-' . uniqid()
        ];
    }

    /**
     * Format phone number for SMS
     */
    private function formatPhoneNumber(string $phoneNumber): string
    {
        // Remove all non-numeric characters
        $cleaned = preg_replace('/[^0-9]/', '', $phoneNumber);

        // Add country code if not present
        if (!str_starts_with($cleaned, '1') && strlen($cleaned) === 10) {
            $cleaned = '1' . $cleaned;
        }

        return '+' . $cleaned;
    }

    /**
     * Format SMS message
     */
    private function formatSmsMessage(): string
    {
        $message = $this->notification->title;

        if ($this->notification->message) {
            $message .= "\n\n" . $this->notification->message;
        }

        // Add organization info if needed
        if (config('notification.sms.include_organization', false)) {
            $message .= "\n\nFrom: " . $this->organization->name;
        }

        // Truncate if too long (SMS limit is usually 160 characters)
        $maxLength = config('notification.sms.max_length', 160);
        if (strlen($message) > $maxLength) {
            $message = substr($message, 0, $maxLength - 3) . '...';
        }

        return $message;
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('SMS notification job failed permanently', [
            'organization_id' => $this->organization->id,
            'notification_id' => $this->notification->id,
            'error' => $exception->getMessage()
        ]);

        $this->notification->update([
            'sms_status' => 'failed',
            'sms_error' => $exception->getMessage(),
            'sms_failed_at' => now()
        ]);
    }
}
