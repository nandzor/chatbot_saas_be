<?php

namespace App\Services;

use App\Models\NotificationTemplate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class NotificationTemplateService
{
    /**
     * Get notification template
     */
    public function getTemplate(string $name, string $type = null, string $language = 'id'): ?NotificationTemplate
    {
        try {
            return NotificationTemplate::getTemplate($name, $type, $language);
        } catch (\Exception $e) {
            Log::error('Failed to get notification template', [
                'name' => $name,
                'type' => $type,
                'language' => $language,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Get templates by category
     */
    public function getTemplatesByCategory(string $category, string $type = null, string $language = 'id'): array
    {
        try {
            return NotificationTemplate::getTemplatesByCategory($category, $type, $language);
        } catch (\Exception $e) {
            Log::error('Failed to get notification templates by category', [
                'category' => $category,
                'type' => $type,
                'language' => $language,
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    /**
     * Send notification using template
     */
    public function send(string $templateName, array $data, array $recipients, string $type = null, string $language = 'id'): array
    {
        try {
            $template = $this->getTemplate($templateName, $type, $language);

            if (!$template) {
                throw new \Exception("Template '{$templateName}' not found");
            }

            // Validate data
            $errors = $template->validateData($data);
            if (!empty($errors)) {
                throw new \Exception('Template validation failed: ' . implode(', ', $errors));
            }

            // Render template
            $rendered = $template->render($data);

            // Send based on type
            $results = [];
            foreach ($recipients as $recipient) {
                $results[] = $this->sendNotification($template, $rendered, $recipient);
            }

            Log::info('Notification sent using template', [
                'template' => $templateName,
                'type' => $template->type,
                'recipients_count' => count($recipients),
            ]);

            return $results;
        } catch (\Exception $e) {
            Log::error('Failed to send notification using template', [
                'template' => $templateName,
                'type' => $type,
                'language' => $language,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Send email notification
     */
    public function sendEmail(string $templateName, array $data, string $to, string $language = 'id'): array
    {
        return $this->send($templateName, $data, [$to], 'email', $language);
    }

    /**
     * Send SMS notification
     */
    public function sendSms(string $templateName, array $data, string $to, string $language = 'id'): array
    {
        return $this->send($templateName, $data, [$to], 'sms', $language);
    }

    /**
     * Send push notification
     */
    public function sendPush(string $templateName, array $data, string $to, string $language = 'id'): array
    {
        return $this->send($templateName, $data, [$to], 'push', $language);
    }

    /**
     * Send webhook notification
     */
    public function sendWebhook(string $templateName, array $data, string $url, string $language = 'id'): array
    {
        return $this->send($templateName, $data, [$url], 'webhook', $language);
    }

    /**
     * Create or update template
     */
    public function createOrUpdate(array $data): NotificationTemplate
    {
        try {
            $template = NotificationTemplate::updateOrCreate(
                [
                    'name' => $data['name'],
                    'type' => $data['type'],
                    'language' => $data['language'] ?? 'id',
                ],
                $data
            );

            // Clear cache
            NotificationTemplate::clearCache($template->name);

            Log::info('Notification template created/updated', [
                'name' => $template->name,
                'type' => $template->type,
                'language' => $template->language,
            ]);

            return $template;
        } catch (\Exception $e) {
            Log::error('Failed to create/update notification template', [
                'data' => $data,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Delete template
     */
    public function delete(string $name, string $type = null, string $language = 'id'): bool
    {
        try {
            $query = NotificationTemplate::where('name', $name)
                ->where('language', $language);

            if ($type) {
                $query->where('type', $type);
            }

            $template = $query->first();

            if ($template) {
                $template->delete();
                NotificationTemplate::clearCache($name);

                Log::info('Notification template deleted', [
                    'name' => $name,
                    'type' => $type,
                    'language' => $language,
                ]);

                return true;
            }

            return false;
        } catch (\Exception $e) {
            Log::error('Failed to delete notification template', [
                'name' => $name,
                'type' => $type,
                'language' => $language,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Get template preview
     */
    public function getPreview(string $name, string $type = null, string $language = 'id'): array
    {
        try {
            $template = $this->getTemplate($name, $type, $language);

            if (!$template) {
                throw new \Exception("Template '{$name}' not found");
            }

            $previewData = $template->getPreviewData();
            $rendered = $template->render($previewData);

            return [
                'template' => $template->toArray(),
                'preview_data' => $previewData,
                'rendered' => $rendered,
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get template preview', [
                'name' => $name,
                'type' => $type,
                'language' => $language,
                'error' => $e->getMessage(),
            ]);

            return [
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Validate template data
     */
    public function validateTemplateData(string $name, array $data, string $type = null, string $language = 'id'): array
    {
        try {
            $template = $this->getTemplate($name, $type, $language);

            if (!$template) {
                return ['Template not found'];
            }

            return $template->validateData($data);
        } catch (\Exception $e) {
            Log::error('Failed to validate template data', [
                'name' => $name,
                'type' => $type,
                'language' => $language,
                'error' => $e->getMessage(),
            ]);

            return ['Validation failed: ' . $e->getMessage()];
        }
    }

    /**
     * Get available templates
     */
    public function getAvailableTemplates(string $category = null, string $type = null, string $language = 'id'): array
    {
        try {
            $query = NotificationTemplate::active()->byLanguage($language);

            if ($category) {
                $query->byCategory($category);
            }

            if ($type) {
                $query->byType($type);
            }

            return $query->get()->toArray();
        } catch (\Exception $e) {
            Log::error('Failed to get available templates', [
                'category' => $category,
                'type' => $type,
                'language' => $language,
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    /**
     * Clear template cache
     */
    public function clearCache(?string $name = null): void
    {
        try {
            NotificationTemplate::clearCache($name);
        } catch (\Exception $e) {
            Log::error('Failed to clear notification template cache', [
                'name' => $name,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send notification based on template type
     */
    protected function sendNotification(NotificationTemplate $template, array $rendered, string $recipient): array
    {
        try {
            switch ($template->type) {
                case 'email':
                    return $this->sendEmailNotification($rendered, $recipient);
                case 'sms':
                    return $this->sendSmsNotification($rendered, $recipient);
                case 'push':
                    return $this->sendPushNotification($rendered, $recipient);
                case 'webhook':
                    return $this->sendWebhookNotification($rendered, $recipient);
                default:
                    throw new \Exception("Unsupported notification type: {$template->type}");
            }
        } catch (\Exception $e) {
            Log::error('Failed to send notification', [
                'type' => $template->type,
                'recipient' => $recipient,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Send email notification
     */
    protected function sendEmailNotification(array $rendered, string $to): array
    {
        try {
            // Here you would implement actual email sending
            // For now, we'll just log it
            Log::info('Email notification sent', [
                'to' => $to,
                'subject' => $rendered['subject'],
            ]);

            return [
                'success' => true,
                'type' => 'email',
                'recipient' => $to,
                'message_id' => 'email_' . uniqid(),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'type' => 'email',
                'recipient' => $to,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Send SMS notification
     */
    protected function sendSmsNotification(array $rendered, string $to): array
    {
        try {
            // Here you would implement actual SMS sending
            // For now, we'll just log it
            Log::info('SMS notification sent', [
                'to' => $to,
                'body' => $rendered['body'],
            ]);

            return [
                'success' => true,
                'type' => 'sms',
                'recipient' => $to,
                'message_id' => 'sms_' . uniqid(),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'type' => 'sms',
                'recipient' => $to,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Send push notification
     */
    protected function sendPushNotification(array $rendered, string $to): array
    {
        try {
            // Here you would implement actual push notification sending
            // For now, we'll just log it
            Log::info('Push notification sent', [
                'to' => $to,
                'title' => $rendered['subject'],
                'body' => $rendered['body'],
            ]);

            return [
                'success' => true,
                'type' => 'push',
                'recipient' => $to,
                'message_id' => 'push_' . uniqid(),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'type' => 'push',
                'recipient' => $to,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Send webhook notification
     */
    protected function sendWebhookNotification(array $rendered, string $url): array
    {
        try {
            // Here you would implement actual webhook sending
            // For now, we'll just log it
            Log::info('Webhook notification sent', [
                'url' => $url,
                'payload' => $rendered,
            ]);

            return [
                'success' => true,
                'type' => 'webhook',
                'recipient' => $url,
                'message_id' => 'webhook_' . uniqid(),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'type' => 'webhook',
                'recipient' => $url,
                'error' => $e->getMessage(),
            ];
        }
    }
}
