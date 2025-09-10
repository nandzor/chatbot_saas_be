<?php

namespace Tests\Feature;

use App\Models\PaymentTransaction;
use App\Models\Organization;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class PaymentTransactionTest extends TestCase
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
    public function it_can_list_payment_transactions()
    {
        PaymentTransaction::factory()->count(5)->create([
            'organization_id' => $this->organization->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/payment-transactions');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => [
                        'id',
                        'organization_id',
                        'amount',
                        'currency',
                        'gateway',
                        'status',
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
    public function it_can_create_payment_transaction()
    {
        $paymentData = [
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
            'amount' => 150000.00,
            'currency' => 'IDR',
            'gateway' => 'stripe',
            'payment_method' => 'credit_card',
            'description' => 'Test payment',
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/payment-transactions', $paymentData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'organization_id',
                    'subscription_id',
                    'amount',
                    'currency',
                    'gateway',
                    'status',
                    'created_at',
                    'updated_at',
                ]
            ]);

        $this->assertDatabaseHas('payment_transactions', [
            'organization_id' => $this->organization->id,
            'amount' => 150000.00,
            'currency' => 'IDR',
            'gateway' => 'stripe',
        ]);
    }

    /** @test */
    public function it_can_show_payment_transaction()
    {
        $payment = PaymentTransaction::factory()->create([
            'organization_id' => $this->organization->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/payment-transactions/{$payment->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'organization_id',
                    'amount',
                    'currency',
                    'gateway',
                    'status',
                    'created_at',
                    'updated_at',
                ]
            ]);
    }

    /** @test */
    public function it_can_update_payment_transaction()
    {
        $payment = PaymentTransaction::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'pending',
        ]);

        $updateData = [
            'status' => 'completed',
            'gateway_transaction_id' => 'txn_123456789',
        ];

        $response = $this->actingAs($this->user)
            ->putJson("/api/payment-transactions/{$payment->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'status',
                    'gateway_transaction_id',
                ]
            ]);

        $this->assertDatabaseHas('payment_transactions', [
            'id' => $payment->id,
            'status' => 'completed',
            'gateway_transaction_id' => 'txn_123456789',
        ]);
    }

    /** @test */
    public function it_can_refund_payment_transaction()
    {
        $payment = PaymentTransaction::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'completed',
            'amount' => 150000.00,
        ]);

        $refundData = [
            'amount' => 150000.00,
            'reason' => 'Customer request',
            'refund_type' => 'full',
        ];

        $response = $this->actingAs($this->user)
            ->postJson("/api/payment-transactions/{$payment->id}/refund", $refundData);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'status',
                    'refund_amount',
                ]
            ]);
    }

    /** @test */
    public function it_can_export_payment_transactions()
    {
        PaymentTransaction::factory()->count(10)->create([
            'organization_id' => $this->organization->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/payment-transactions/export?format=csv');

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'text/csv');
    }

    /** @test */
    public function it_validates_payment_transaction_creation()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/payment-transactions', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'organization_id',
                'amount',
                'currency',
                'gateway',
            ]);
    }

    /** @test */
    public function it_can_filter_payment_transactions_by_status()
    {
        PaymentTransaction::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'completed',
        ]);

        PaymentTransaction::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'failed',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/payment-transactions?filter[status]=completed');

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('completed', $data[0]['status']);
    }

    /** @test */
    public function it_can_search_payment_transactions()
    {
        PaymentTransaction::factory()->create([
            'organization_id' => $this->organization->id,
            'gateway' => 'stripe',
            'description' => 'Stripe payment test',
        ]);

        PaymentTransaction::factory()->create([
            'organization_id' => $this->organization->id,
            'gateway' => 'paypal',
            'description' => 'PayPal payment test',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/payment-transactions?search=stripe');

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('stripe', $data[0]['gateway']);
    }

    /** @test */
    public function it_can_get_payment_statistics()
    {
        PaymentTransaction::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'completed',
            'amount' => 150000.00,
        ]);

        PaymentTransaction::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'failed',
            'amount' => 75000.00,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/payment-transactions/statistics');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'total_transactions',
                    'total_amount',
                    'successful_transactions',
                    'failed_transactions',
                    'success_rate',
                ]
            ]);
    }

    /** @test */
    public function it_requires_authentication()
    {
        $response = $this->getJson('/api/payment-transactions');

        $response->assertStatus(401);
    }

    /** @test */
    public function it_can_delete_payment_transaction()
    {
        $payment = PaymentTransaction::factory()->create([
            'organization_id' => $this->organization->id,
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/payment-transactions/{$payment->id}");

        $response->assertStatus(200);

        $this->assertSoftDeleted('payment_transactions', [
            'id' => $payment->id,
        ]);
    }
}
