<?php

namespace Tests\Feature\Api;

use App\Models\PaymentTransaction;
use App\Models\Organization;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class PaymentTransactionIntegrationTest extends TestCase
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
    public function it_can_complete_payment_workflow_with_idr_currency()
    {
        // 1. Create payment transaction
        $paymentData = [
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
            'amount' => 250000.00,
            'currency' => 'IDR',
            'gateway' => 'stripe',
            'payment_method' => 'credit_card',
            'description' => 'Monthly subscription payment',
        ];

        $createResponse = $this->actingAs($this->user)
            ->postJson('/api/payment-transactions', $paymentData);

        $createResponse->assertStatus(201);
        $paymentId = $createResponse->json('data.id');

        // 2. Update payment status to completed
        $updateData = [
            'status' => 'completed',
            'gateway_transaction_id' => 'pi_1234567890',
            'paid_at' => now()->toISOString(),
        ];

        $updateResponse = $this->actingAs($this->user)
            ->putJson("/api/payment-transactions/{$paymentId}", $updateData);

        $updateResponse->assertStatus(200)
            ->assertJson([
                'data' => [
                    'status' => 'completed',
                    'gateway_transaction_id' => 'pi_1234567890',
                ]
            ]);

        // 3. Verify payment in database
        $this->assertDatabaseHas('payment_transactions', [
            'id' => $paymentId,
            'status' => 'completed',
            'amount' => 250000.00,
            'currency' => 'IDR',
            'gateway' => 'stripe',
        ]);

        // 4. Test refund functionality
        $refundData = [
            'amount' => 250000.00,
            'reason' => 'Customer request',
            'refund_type' => 'full',
        ];

        $refundResponse = $this->actingAs($this->user)
            ->postJson("/api/payment-transactions/{$paymentId}/refund", $refundData);

        $refundResponse->assertStatus(200);
    }

    /** @test */
    public function it_can_handle_midtrans_payment_workflow()
    {
        $paymentData = [
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
            'amount' => 500000.00,
            'currency' => 'IDR',
            'gateway' => 'midtrans',
            'payment_method' => 'bank_transfer',
            'description' => 'Bank transfer payment',
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/payment-transactions', $paymentData);

        $response->assertStatus(201)
            ->assertJson([
                'data' => [
                    'gateway' => 'midtrans',
                    'amount' => 500000.00,
                    'currency' => 'IDR',
                ]
            ]);
    }

    /** @test */
    public function it_can_handle_xendit_payment_workflow()
    {
        $paymentData = [
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
            'amount' => 750000.00,
            'currency' => 'IDR',
            'gateway' => 'xendit',
            'payment_method' => 'ewallet',
            'description' => 'E-wallet payment',
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/payment-transactions', $paymentData);

        $response->assertStatus(201)
            ->assertJson([
                'data' => [
                    'gateway' => 'xendit',
                    'amount' => 750000.00,
                    'currency' => 'IDR',
                ]
            ]);
    }

    /** @test */
    public function it_can_filter_payments_by_currency()
    {
        // Create payments with different currencies
        PaymentTransaction::factory()->create([
            'organization_id' => $this->organization->id,
            'amount' => 100000.00,
            'currency' => 'IDR',
            'gateway' => 'stripe',
        ]);

        PaymentTransaction::factory()->create([
            'organization_id' => $this->organization->id,
            'amount' => 50.00,
            'currency' => 'USD',
            'gateway' => 'stripe',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/payment-transactions?filter[currency]=IDR');

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('IDR', $data[0]['currency']);
        $this->assertEquals(100000.00, $data[0]['amount']);
    }

    /** @test */
    public function it_can_export_payments_in_idr_currency()
    {
        PaymentTransaction::factory()->count(5)->create([
            'organization_id' => $this->organization->id,
            'currency' => 'IDR',
            'amount' => 200000.00,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/payment-transactions/export?format=csv&currency=IDR');

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'text/csv');
    }

    /** @test */
    public function it_can_get_payment_statistics_for_idr_currency()
    {
        PaymentTransaction::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'completed',
            'amount' => 300000.00,
            'currency' => 'IDR',
        ]);

        PaymentTransaction::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'failed',
            'amount' => 150000.00,
            'currency' => 'IDR',
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

        $data = $response->json('data');
        $this->assertEquals(2, $data['total_transactions']);
        $this->assertEquals(450000.00, $data['total_amount']);
    }

    /** @test */
    public function it_validates_idr_currency_format()
    {
        $paymentData = [
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
            'amount' => 250000.00,
            'currency' => 'IDR',
            'gateway' => 'stripe',
            'payment_method' => 'credit_card',
            'description' => 'Test payment',
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/payment-transactions', $paymentData);

        $response->assertStatus(201);

        $this->assertDatabaseHas('payment_transactions', [
            'currency' => 'IDR',
            'amount' => 250000.00,
        ]);
    }

    /** @test */
    public function it_can_handle_large_idr_amounts()
    {
        $paymentData = [
            'organization_id' => $this->organization->id,
            'subscription_id' => $this->subscription->id,
            'amount' => 10000000.00, // 10 million IDR
            'currency' => 'IDR',
            'gateway' => 'stripe',
            'payment_method' => 'credit_card',
            'description' => 'Large amount payment',
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/payment-transactions', $paymentData);

        $response->assertStatus(201)
            ->assertJson([
                'data' => [
                    'amount' => 10000000.00,
                    'currency' => 'IDR',
                ]
            ]);
    }

    /** @test */
    public function it_can_search_payments_by_idr_amount()
    {
        PaymentTransaction::factory()->create([
            'organization_id' => $this->organization->id,
            'amount' => 500000.00,
            'currency' => 'IDR',
            'description' => 'Premium subscription',
        ]);

        PaymentTransaction::factory()->create([
            'organization_id' => $this->organization->id,
            'amount' => 100000.00,
            'currency' => 'IDR',
            'description' => 'Basic subscription',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/payment-transactions?search=500000');

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals(500000.00, $data[0]['amount']);
    }
}
