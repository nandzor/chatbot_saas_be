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

class NotificationSent
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Organization $organization;
    public Notification $notification;
    public array $data;
    public string $type;

    /**
     * Create a new event instance.
     */
    public function __construct(Organization $organization, Notification $notification, string $type, array $data = [])
    {
        $this->organization = $organization;
        $this->notification = $notification;
        $this->type = $type;
        $this->data = $data;
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
        ];
    }
}
