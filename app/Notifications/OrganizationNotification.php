<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;
use Illuminate\Notifications\Notification;

class OrganizationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $organizationId;
    public $notificationType;
    public $title;
    public $message;
    public $data;
    public $priority;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        string $organizationId,
        string $notificationType,
        string $title,
        string $message,
        array $data = [],
        string $priority = 'normal'
    ) {
        $this->organizationId = $organizationId;
        $this->notificationType = $notificationType;
        $this->title = $title;
        $this->message = $message;
        $this->data = $data;
        $this->priority = $priority;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $mailMessage = (new MailMessage)
            ->subject($this->title)
            ->greeting('Hello!')
            ->line($this->message);

        // Add specific content based on notification type
        switch ($this->notificationType) {
            case 'user_invited':
                $mailMessage->action('Accept Invitation', $this->data['invitation_url'] ?? '#');
                break;
            case 'password_reset':
                $mailMessage->action('Reset Password', $this->data['reset_url'] ?? '#');
                break;
            case 'organization_updated':
                $mailMessage->action('View Organization', $this->data['organization_url'] ?? '#');
                break;
            case 'subscription_expiring':
                $mailMessage->action('Renew Subscription', $this->data['renewal_url'] ?? '#');
                break;
        }

        $mailMessage->line('Thank you for using our service!');

        return $mailMessage;
    }

    /**
     * Get the database representation of the notification.
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'organization_id' => $this->organizationId,
            'notification_type' => $this->notificationType,
            'title' => $this->title,
            'message' => $this->message,
            'data' => $this->data,
            'priority' => $this->priority,
            'created_at' => now(),
        ];
    }

    /**
     * Get the broadcast representation of the notification.
     */
    public function toBroadcast(object $notifiable): array
    {
        return [
            'organization_id' => $this->organizationId,
            'notification_type' => $this->notificationType,
            'title' => $this->title,
            'message' => $this->message,
            'data' => $this->data,
            'priority' => $this->priority,
            'timestamp' => now()->toISOString(),
        ];
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'organization_id' => $this->organizationId,
            'notification_type' => $this->notificationType,
            'title' => $this->title,
            'message' => $this->message,
            'data' => $this->data,
            'priority' => $this->priority,
        ];
    }
}
