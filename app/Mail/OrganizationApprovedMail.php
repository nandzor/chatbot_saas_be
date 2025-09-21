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

class OrganizationApprovedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public User $user;
    public Organization $organization;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, Organization $organization)
    {
        $this->user = $user;
        $this->organization = $organization;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Organization Has Been Approved - Chatbot SaaS',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.organization-approved',
            with: [
                'user' => $this->user,
                'organization' => $this->organization,
                'loginUrl' => $this->getLoginUrl(),
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
     * Get the login URL.
     */
    private function getLoginUrl(): string
    {
        return config('app.frontend_url') . '/auth/login';
    }
}
