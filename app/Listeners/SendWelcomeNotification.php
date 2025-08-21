<?php

namespace App\Listeners;

use App\Events\UserRegistered;
use App\Jobs\SendWelcomeEmail;
use App\Notifications\WelcomeNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class SendWelcomeNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the listener may be attempted.
     */
    public int $tries = 3;

    /**
     * The maximum number of seconds the listener can run.
     */
    public int $timeout = 60;

    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(UserRegistered $event): void
    {
        $user = $event->user;

        try {
            Log::info('Processing user registration welcome notifications', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);

            // Send welcome email via job queue
            SendWelcomeEmail::dispatch($user)
                ->delay(now()->addMinutes(1)); // Delay by 1 minute

            // Send in-app notification
            $user->notify(new WelcomeNotification());

            // Note: Admin notification will be implemented when role system is available
            // $adminUsers = \App\Models\User::role('admin')->get();
            // Notification::send($adminUsers, new \App\Notifications\NewUserRegistrationNotification($user));

            Log::info('Welcome notifications queued successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to queue welcome notifications', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(UserRegistered $event, \Throwable $exception): void
    {
        Log::error('Welcome notification listener failed', [
            'user_id' => $event->user->id,
            'email' => $event->user->email,
            'error' => $exception->getMessage(),
        ]);
    }

    /**
     * Determine whether the listener should be queued.
     */
    public function shouldQueue(UserRegistered $event): bool
    {
        return $event->user->is_active;
    }

    /**
     * Get the name of the listener's queue.
     */
    public function viaQueue(): string
    {
        return 'notifications';
    }
}
