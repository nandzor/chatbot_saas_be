<?php

namespace Tests\Feature;

use App\Models\BillingInvoice;
use App\Models\Organization;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class BillingInvoiceTest extends TestCase
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
    public function it_can_list_billing_invoices()
    {
        BillingInvoice::factory()->count(5)->create([
            'organization_id' => $this->organization->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/billing-invoices');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => [
                        'id',
                        'organization_id',
                        'invoice_number',
                        'total_amount',
                        'currency',
                        'status',
                        'due_date',
                        'created_at',
                        'updated_at',
                    ]
                ],
                'meta' => [
                    'pagination'
                ]
            ]);
    }

    /** @test */
    public function it_can_create_billing_invoice()
    {
        $invoiceData = [
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
            'total_amount' => 250000.00,
            'currency' => 'IDR',
            'billing_cycle' => 'monthly',
            'due_date' => now()->addDays(30)->format('Y-m-d'),
            'period_start' => now()->format('Y-m-d'),
            'period_end' => now()->addMonth()->format('Y-m-d'),
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/billing-invoices', $invoiceData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'organization_id',
                    'subscription_id',
                    'invoice_number',
                    'total_amount',
                    'currency',
                    'status',
                    'due_date',
                    'created_at',
                    'updated_at',
                ]
            ]);

        $this->assertDatabaseHas('billing_invoices', [
            'organization_id' => $this->organization->id,
            'total_amount' => 250000.00,
            'currency' => 'IDR',
            'billing_cycle' => 'monthly',
        ]);
    }

    /** @test */
    public function it_can_show_billing_invoice()
    {
        $invoice = BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'currency' => 'IDR',
            'total_amount' => 300000.00,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/billing-invoices/{$invoice->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'organization_id',
                    'invoice_number',
                    'total_amount',
                    'currency',
                    'status',
                    'due_date',
                    'created_at',
                    'updated_at',
                ]
            ]);
    }

    /** @test */
    public function it_can_update_billing_invoice()
    {
        $invoice = BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'pending',
            'currency' => 'IDR',
            'total_amount' => 200000.00,
        ]);

        $updateData = [
            'total_amount' => 250000.00,
            'status' => 'paid',
            'paid_date' => now()->format('Y-m-d'),
        ];

        $response = $this->actingAs($this->user)
            ->putJson("/api/billing-invoices/{$invoice->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'total_amount',
                    'status',
                    'paid_date',
                ]
            ]);

        $this->assertDatabaseHas('billing_invoices', [
            'id' => $invoice->id,
            'total_amount' => 250000.00,
            'status' => 'paid',
        ]);
    }

    /** @test */
    public function it_can_mark_invoice_as_paid()
    {
        $invoice = BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'pending',
            'currency' => 'IDR',
            'total_amount' => 150000.00,
        ]);

        $paymentData = [
            'paid_date' => now()->format('Y-m-d'),
            'payment_method' => 'stripe',
            'payment_reference' => 'pi_1234567890',
        ];

        $response = $this->actingAs($this->user)
            ->patchJson("/api/billing-invoices/{$invoice->id}/mark-paid", $paymentData);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'status',
                    'paid_date',
                    'payment_method',
                ]
            ]);

        $this->assertDatabaseHas('billing_invoices', [
            'id' => $invoice->id,
            'status' => 'paid',
        ]);
    }

    /** @test */
    public function it_can_mark_invoice_as_overdue()
    {
        $invoice = BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'pending',
            'due_date' => now()->subDays(5),
            'currency' => 'IDR',
            'total_amount' => 100000.00,
        ]);

        $response = $this->actingAs($this->user)
            ->patchJson("/api/billing-invoices/{$invoice->id}/mark-overdue");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'status',
                    'overdue_date',
                ]
            ]);

        $this->assertDatabaseHas('billing_invoices', [
            'id' => $invoice->id,
            'status' => 'overdue',
        ]);
    }

    /** @test */
    public function it_can_cancel_invoice()
    {
        $invoice = BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'pending',
            'currency' => 'IDR',
            'total_amount' => 175000.00,
        ]);

        $cancelData = [
            'reason' => 'Customer request',
        ];

        $response = $this->actingAs($this->user)
            ->patchJson("/api/billing-invoices/{$invoice->id}/cancel", $cancelData);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'status',
                    'cancelled_at',
                ]
            ]);

        $this->assertDatabaseHas('billing_invoices', [
            'id' => $invoice->id,
            'status' => 'cancelled',
        ]);
    }

    /** @test */
    public function it_can_get_organization_invoices()
    {
        BillingInvoice::factory()->count(3)->create([
            'organization_id' => $this->organization->id,
            'currency' => 'IDR',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/billing-invoices/organization/{$this->organization->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => [
                        'id',
                        'organization_id',
                        'invoice_number',
                        'total_amount',
                        'currency',
                        'status',
                    ]
                ]
            ]);
    }

    /** @test */
    public function it_can_get_subscription_invoices()
    {
        BillingInvoice::factory()->count(2)->create([
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
            'currency' => 'IDR',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/billing-invoices/subscription/{$this->subscription->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => [
                        'id',
                        'subscription_id',
                        'invoice_number',
                        'total_amount',
                        'currency',
                        'status',
                    ]
                ]
            ]);
    }

    /** @test */
    public function it_can_get_overdue_invoices()
    {
        BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'overdue',
            'due_date' => now()->subDays(10),
            'currency' => 'IDR',
            'total_amount' => 500000.00,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/billing-invoices/overdue/list');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => [
                        'id',
                        'organization_id',
                        'invoice_number',
                        'total_amount',
                        'currency',
                        'status',
                        'due_date',
                    ]
                ]
            ]);
    }

    /** @test */
    public function it_can_get_upcoming_invoices()
    {
        BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'pending',
            'due_date' => now()->addDays(5),
            'currency' => 'IDR',
            'total_amount' => 400000.00,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/billing-invoices/upcoming/list');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => [
                        'id',
                        'organization_id',
                        'invoice_number',
                        'total_amount',
                        'currency',
                        'status',
                        'due_date',
                    ]
                ]
            ]);
    }

    /** @test */
    public function it_can_get_invoice_statistics()
    {
        BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'paid',
            'total_amount' => 300000.00,
            'currency' => 'IDR',
        ]);

        BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'overdue',
            'total_amount' => 200000.00,
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
    }

    /** @test */
    public function it_validates_billing_invoice_creation()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/billing-invoices', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'organization_id',
                'total_amount',
                'currency',
                'due_date',
            ]);
    }

    /** @test */
    public function it_can_filter_invoices_by_status()
    {
        BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'paid',
            'currency' => 'IDR',
        ]);

        BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'overdue',
            'currency' => 'IDR',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/billing-invoices?filter[status]=paid');

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('paid', $data[0]['status']);
    }

    /** @test */
    public function it_can_search_invoices()
    {
        BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'invoice_number' => 'INV-2024-001',
            'currency' => 'IDR',
        ]);

        BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'invoice_number' => 'INV-2024-002',
            'currency' => 'IDR',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/billing-invoices?search=INV-2024-001');

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('INV-2024-001', $data[0]['invoice_number']);
    }

    /** @test */
    public function it_requires_authentication()
    {
        $response = $this->getJson('/api/billing-invoices');

        $response->assertStatus(401);
    }

    /** @test */
    public function it_can_delete_billing_invoice()
    {
        $invoice = BillingInvoice::factory()->create([
            'organization_id' => $this->organization->id,
            'currency' => 'IDR',
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/billing-invoices/{$invoice->id}");

        $response->assertStatus(200);

        $this->assertSoftDeleted('billing_invoices', [
            'id' => $invoice->id,
        ]);
    }
}
