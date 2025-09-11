<?php

namespace App\Events;

use App\Models\Organization;
use App\Models\Notification;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificationBroadcast implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Organization $organization;
    public Notification $notification;
    public array $notificationData;

    /**
     * Create a new event instance.
     */
    public function __construct(Organization $organization, Notification $notification, array $notificationData)
    {
        $this->organization = $organization;
        $this->notification = $notification;
        $this->notificationData = $notificationData;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('organization.' . $this->organization->id),
            new PrivateChannel('notifications.' . $this->organization->id)
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        return [
            'notification' => array_merge($this->notificationData, [
                'id' => $this->notification->id,
                'organization_id' => $this->organization->id,
                'formatted_time' => $this->notification->created_at->diffForHumans(),
                'timestamp' => $this->notification->created_at->timestamp
            ]),
            'organization' => [
                'id' => $this->organization->id,
                'name' => $this->organization->name,
                'code' => $this->organization->code
            ],
            'meta' => [
                'event' => 'notification.received',
                'timestamp' => now()->timestamp,
                'channel' => 'in_app'
            ]
        ];
    }

    /**
     * The event's broadcast name.
     *
     * @return string
     */
    public function broadcastAs(): string
    {
        return 'notification.received';
    }

    /**
     * Determine if this event should broadcast.
     *
     * @return bool
     */
    public function shouldBroadcast(): bool
    {
        // Only broadcast if broadcasting is enabled and organization allows it
        return config('broadcasting.default') !== 'null' &&
               ($this->organization->settings['notifications']['broadcast'] ?? true);
    }
}
