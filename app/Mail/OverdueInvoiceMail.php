<?php

namespace App\Mail;

use App\Models\BillingInvoice;
use App\Models\Organization;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OverdueInvoiceMail extends Mailable
{
    use Queueable, SerializesModels;

    protected BillingInvoice $invoice;
    protected Organization $organization;

    /**
     * Create a new message instance.
     */
    public function __construct(BillingInvoice $invoice, Organization $organization)
    {
        $this->invoice = $invoice;
        $this->organization = $organization;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Invoice Overdue - ' . $this->invoice->invoice_number,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.billing.overdue',
            with: [
                'invoice' => $this->invoice,
                'organization' => $this->organization,
                'appName' => config('app.name'),
                'appUrl' => config('app.url'),
                'overdueDays' => now()->diffInDays($this->invoice->due_date),
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
}
