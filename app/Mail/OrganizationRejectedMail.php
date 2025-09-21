<?php

namespace App\Mail;

use App\Models\User;
use App\Models\Organization;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrganizationRejectedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public User $user;
    public Organization $organization;
    public string $reason;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, Organization $organization, string $reason)
    {
        $this->user = $user;
        $this->organization = $organization;
        $this->reason = $reason;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Organization Registration Update - Chatbot SaaS',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.organization-rejected',
            with: [
                'user' => $this->user,
                'organization' => $this->organization,
                'reason' => $this->reason,
                'supportUrl' => $this->getSupportUrl(),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }

    /**
     * Get the support URL.
     */
    private function getSupportUrl(): string
    {
        return config('app.frontend_url') . '/support';
    }
}
