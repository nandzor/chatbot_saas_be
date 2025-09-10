<?php

namespace Tests\Feature\Api;

use App\Models\BillingInvoice;
use App\Models\Organization;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class BillingInvoiceIntegrationTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;
    protected Organization $organization;
    protected Subscription $subscription;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->organization = Organization::factory()->create();
        $this->subscription = Subscription::factory()->create([
            'organization_id' => $this->organization->id,
        ]);
    }

    /** @test */
    public function it_can_complete_billing_workflow_with_idr_currency()
    {
        // 1. Create billing invoice
        $invoiceData = [
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
            'total_amount' => 500000.00,
            'currency' => 'IDR',
            'billing_cycle' => 'monthly',
            'due_date' => now()->addDays(30)->format('Y-m-d'),
            'period_start' => now()->format('Y-m-d'),
            'period_end' => now()->addMonth()->format('Y-m-d'),
        ];

        $createResponse = $this->actingAs($this->user)
            ->postJson('/api/billing-invoices', $invoiceData);

        $createResponse->assertStatus(201);
        $invoiceId = $createResponse->json('data.id');

        // 2. Mark invoice as paid
        $paymentData = [
            'paid_date' => now()->format('Y-m-d'),
            'payment_method' => 'stripe',
            'payment_reference' => 'pi_1234567890',
        ];

        $paidResponse = $this->actingAs($this->user)
            ->patchJson("/api/billing-invoices/{$invoiceId}/mark-paid", $paymentData);

        $paidResponse->assertStatus(200)
            ->assertJson([
                'data' => [
                    'status' => 'paid',
                ]
            ]);

        // 3. Verify invoice in database
        $this->assertDatabaseHas('billing_invoices', [
            'id' => $invoiceId,
            'status' => 'paid',
            'total_amount' => 500000.00,
            'currency' => 'IDR',
        ]);
    }

    /** @test */
    public function it_can_handle_overdue_invoice_workflow()
    {
        // 1. Create invoice with past due date
        $invoiceData = [
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
            'total_amount' => 750000.00,
            'currency' => 'IDR',
            'billing_cycle' => 'monthly',
            'due_date' => now()->subDays(5)->format('Y-m-d'),
            'period_start' => now()->subMonth()->format('Y-m-d'),
            'period_end' => now()->format('Y-m-d'),
        ];

        $createResponse = $this->actingAs($this->user)
            ->postJson('/api/billing-invoices', $invoiceData);

        $createResponse->assertStatus(201);
        $invoiceId = $createResponse->json('data.id');

        // 2. Mark invoice as overdue
        $overdueResponse = $this->actingAs($this->user)
            ->patchJson("/api/billing-invoices/{$invoiceId}/mark-overdue");

        $overdueResponse->assertStatus(200)
            ->assertJson([
                'data' => [
                    'status' => 'overdue',
                ]
            ]);

        // 3. Verify invoice status
        $this->assertDatabaseHas('billing_invoices', [
            'id' => $invoiceId,
            'status' => 'overdue',
        ]);
    }

    /** @test */
    public function it_can_handle_invoice_cancellation_workflow()
    {
        // 1. Create pending invoice
        $invoiceData = [
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
            'total_amount' => 300000.00,
            'currency' => 'IDR',
            'billing_cycle' => 'monthly',
            'due_date' => now()->addDays(30)->format('Y-m-d'),
        ];

        $createResponse = $this->actingAs($this->user)
            ->postJson('/api/billing-invoices', $invoiceData);

        $createResponse->assertStatus(201);
        $invoiceId = $createResponse->json('data.id');

        // 2. Cancel invoice
        $cancelData = [
            'reason' => 'Customer request',
        ];

        $cancelResponse = $this->actingAs($this->user)
            ->patchJson("/api/billing-invoices/{$invoiceId}/cancel", $cancelData);

        $cancelResponse->assertStatus(200)
            ->assertJson([
                'data' => [
                    'status' => 'cancelled',
                ]
            ]);

        // 3. Verify invoice status
        $this->assertDatabaseHas('billing_invoices', [
            'id' => $invoiceId,
            'status' => 'cancelled',
        ]);
    }

    /** @test */
    public function it_can_filter_invoices_by_currency()
    {
        // Create invoices with different currencies
        BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'total_amount' => 500000.00,
            'currency' => 'IDR',
            'status' => 'paid',
        ]);

        BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'total_amount' => 50.00,
            'currency' => 'USD',
            'status' => 'paid',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/billing-invoices?filter[currency]=IDR');

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('IDR', $data[0]['currency']);
        $this->assertEquals(500000.00, $data[0]['total_amount']);
    }

    /** @test */
    public function it_can_get_organization_invoices_with_idr_currency()
    {
        BillingInvoice::factory()->count(3)->create([
            'organization_id' => $this->organization->id,
            'currency' => 'IDR',
            'total_amount' => 400000.00,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/billing-invoices/organization/{$this->organization->id}");

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertCount(3, $data);

        foreach ($data as $invoice) {
            $this->assertEquals('IDR', $invoice['currency']);
            $this->assertEquals(400000.00, $invoice['total_amount']);
        }
    }

    /** @test */
    public function it_can_get_subscription_invoices_with_idr_currency()
    {
        BillingInvoice::factory()->count(2)->create([
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
            'currency' => 'IDR',
            'total_amount' => 600000.00,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/billing-invoices/subscription/{$this->subscription->id}");

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertCount(2, $data);

        foreach ($data as $invoice) {
            $this->assertEquals('IDR', $invoice['currency']);
            $this->assertEquals(600000.00, $invoice['total_amount']);
        }
    }

    /** @test */
    public function it_can_get_overdue_invoices_with_idr_currency()
    {
        BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'overdue',
            'due_date' => now()->subDays(10),
            'currency' => 'IDR',
            'total_amount' => 800000.00,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/billing-invoices/overdue/list');

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('IDR', $data[0]['currency']);
        $this->assertEquals(800000.00, $data[0]['total_amount']);
    }

    /** @test */
    public function it_can_get_upcoming_invoices_with_idr_currency()
    {
        BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'pending',
            'due_date' => now()->addDays(5),
            'currency' => 'IDR',
            'total_amount' => 900000.00,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/billing-invoices/upcoming/list');

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('IDR', $data[0]['currency']);
        $this->assertEquals(900000.00, $data[0]['total_amount']);
    }

    /** @test */
    public function it_can_get_invoice_statistics_with_idr_currency()
    {
        BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'paid',
            'total_amount' => 1000000.00,
            'currency' => 'IDR',
        ]);

        BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'overdue',
            'total_amount' => 500000.00,
            'currency' => 'IDR',
        ]);

        BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'pending',
            'total_amount' => 750000.00,
            'currency' => 'IDR',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/billing-invoices/statistics/summary');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'total_invoices',
                    'total_amount',
                    'paid_invoices',
                    'overdue_invoices',
                    'pending_invoices',
                    'collection_rate',
                ]
            ]);

        $data = $response->json('data');
        $this->assertEquals(3, $data['total_invoices']);
        $this->assertEquals(2250000.00, $data['total_amount']);
    }

    /** @test */
    public function it_validates_idr_currency_format()
    {
        $invoiceData = [
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
            'total_amount' => 350000.00,
            'currency' => 'IDR',
            'billing_cycle' => 'monthly',
            'due_date' => now()->addDays(30)->format('Y-m-d'),
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/billing-invoices', $invoiceData);

        $response->assertStatus(201);

        $this->assertDatabaseHas('billing_invoices', [
            'currency' => 'IDR',
            'total_amount' => 350000.00,
        ]);
    }

    /** @test */
    public function it_can_handle_large_idr_amounts()
    {
        $invoiceData = [
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
            'total_amount' => 50000000.00, // 50 million IDR
            'currency' => 'IDR',
            'billing_cycle' => 'yearly',
            'due_date' => now()->addDays(30)->format('Y-m-d'),
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/billing-invoices', $invoiceData);

        $response->assertStatus(201)
            ->assertJson([
                'data' => [
                    'total_amount' => 50000000.00,
                    'currency' => 'IDR',
                ]
            ]);
    }

    /** @test */
    public function it_can_search_invoices_by_idr_amount()
    {
        BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'invoice_number' => 'INV-2024-001',
            'total_amount' => 1200000.00,
            'currency' => 'IDR',
        ]);

        BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'invoice_number' => 'INV-2024-002',
            'total_amount' => 800000.00,
            'currency' => 'IDR',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/billing-invoices?search=1200000');

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals(1200000.00, $data[0]['total_amount']);
    }
}
