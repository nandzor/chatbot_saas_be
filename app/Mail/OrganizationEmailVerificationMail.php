<?php

namespace App\Mail;

use App\Models\User;
use App\Models\Organization;
use App\Models\EmailVerificationToken;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrganizationEmailVerificationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public User $user;
    public Organization $organization;
    public EmailVerificationToken $token;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, Organization $organization, EmailVerificationToken $token)
    {
        $this->user = $user;
        $this->organization = $organization;
        $this->token = $token;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Verify Your Organization Email - Chatbot SaaS',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.organization-email-verification',
            with: [
                'user' => $this->user,
                'organization' => $this->organization,
                'verificationUrl' => $this->getVerificationUrl(),
                'expiresAt' => $this->token->expires_at,
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
     * Get the verification URL.
     */
    private function getVerificationUrl(): string
    {
        return config('app.frontend_url') . '/auth/verify-organization-email?token=' . $this->token->token;
    }
}
