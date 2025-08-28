<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\SubscriptionPlan;
use App\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

class SubscriptionPlanTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;
    protected Organization $organization;

    protected function setUp(): void
    {
        parent::setUp();

        // Create organization
        $this->organization = Organization::factory()->create();

        // Create user with admin permissions
        $this->user = User::factory()->create([
            'organization_id' => $this->organization->id,
            'role' => 'admin'
        ]);
    }

    /** @test */
    public function it_can_list_all_subscription_plans()
    {
        // Create some subscription plans
        SubscriptionPlan::factory()->count(3)->create();

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/subscription-plans');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        '*' => [
                            'id',
                            'name',
                            'display_name',
                            'description',
                            'tier',
                            'pricing',
                            'limits',
                            'features',
                            'trial_days',
                            'is_popular',
                            'is_custom',
                            'sort_order',
                            'status',
                            'created_at',
                            'updated_at'
                        ]
                    ],
                    'meta' => [
                        'total',
                        'tiers',
                        'popular_count',
                        'custom_count',
                        'active_count'
                    ]
                ]);
    }

    /** @test */
    public function it_can_get_popular_subscription_plans()
    {
        // Create popular and non-popular plans
        SubscriptionPlan::factory()->create(['is_popular' => true]);
        SubscriptionPlan::factory()->create(['is_popular' => false]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/subscription-plans/popular');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data'
                ]);

        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertTrue($data[0]['is_popular']);
    }

    /** @test */
    public function it_can_get_plans_by_tier()
    {
        // Create plans with different tiers
        SubscriptionPlan::factory()->create(['tier' => 'basic']);
        SubscriptionPlan::factory()->create(['tier' => 'professional']);
        SubscriptionPlan::factory()->create(['tier' => 'basic']);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/subscription-plans/tier/basic');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data'
                ]);

        $data = $response->json('data');
        $this->assertCount(2, $data);
        foreach ($data as $plan) {
            $this->assertEquals('basic', $plan['tier']);
        }
    }

    /** @test */
    public function it_can_get_custom_plans()
    {
        // Create custom and non-custom plans
        SubscriptionPlan::factory()->create(['is_custom' => true]);
        SubscriptionPlan::factory()->create(['is_custom' => false]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/subscription-plans/custom');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data'
                ]);

        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertTrue($data[0]['is_custom']);
    }

    /** @test */
    public function it_can_get_single_subscription_plan()
    {
        $plan = SubscriptionPlan::factory()->create();

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/subscription-plans/{$plan->id}");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'id',
                        'name',
                        'display_name',
                        'description',
                        'tier',
                        'pricing',
                        'limits',
                        'features',
                        'trial_days',
                        'is_popular',
                        'is_custom',
                        'sort_order',
                        'status',
                        'created_at',
                        'updated_at'
                    ]
                ]);

        $this->assertEquals($plan->id, $response->json('data.id'));
    }

    /** @test */
    public function it_returns_404_for_nonexistent_plan()
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/subscription-plans/nonexistent-id');

        $response->assertStatus(404);
    }

    /** @test */
    public function it_can_create_subscription_plan()
    {
        $planData = [
            'name' => 'test-plan',
            'display_name' => 'Test Plan',
            'description' => 'A test subscription plan',
            'tier' => 'basic',
            'price_monthly' => 29.99,
            'price_quarterly' => 79.99,
            'price_yearly' => 299.99,
            'currency' => 'USD',
            'max_agents' => 5,
            'max_channels' => 5,
            'max_knowledge_articles' => 500,
            'max_monthly_messages' => 5000,
            'max_monthly_ai_requests' => 2500,
            'max_storage_gb' => 25,
            'max_api_calls_per_day' => 5000,
            'features' => [
                'ai_chat' => true,
                'knowledge_base' => true,
                'multi_channel' => true,
                'api_access' => false,
                'analytics' => false,
                'custom_branding' => false,
                'priority_support' => false,
                'white_label' => false,
                'advanced_analytics' => false,
                'custom_integrations' => false,
            ],
            'trial_days' => 14,
            'is_popular' => false,
            'is_custom' => false,
            'status' => 'active'
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/subscription-plans', $planData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data'
                ]);

        $this->assertDatabaseHas('subscription_plans', [
            'name' => 'test-plan',
            'display_name' => 'Test Plan',
            'tier' => 'basic'
        ]);
    }

    /** @test */
    public function it_validates_required_fields_when_creating_plan()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/subscription-plans', []);

        $response->assertStatus(422)
                ->assertJsonValidationErrors([
                    'name',
                    'display_name',
                    'tier',
                    'price_monthly',
                    'currency',
                    'max_agents',
                    'max_channels',
                    'max_knowledge_articles',
                    'max_monthly_messages',
                    'max_monthly_ai_requests',
                    'max_storage_gb',
                    'max_api_calls_per_day'
                ]);
    }

    /** @test */
    public function it_can_update_subscription_plan()
    {
        $plan = SubscriptionPlan::factory()->create();

        $updateData = [
            'display_name' => 'Updated Plan Name',
            'description' => 'Updated description',
            'price_monthly' => 39.99
        ];

        $response = $this->actingAs($this->user)
            ->putJson("/api/v1/subscription-plans/{$plan->id}", $updateData);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data'
                ]);

        $this->assertDatabaseHas('subscription_plans', [
            'id' => $plan->id,
            'display_name' => 'Updated Plan Name',
            'description' => 'Updated description',
            'price_monthly' => 39.99
        ]);
    }

    /** @test */
    public function it_can_delete_subscription_plan()
    {
        $plan = SubscriptionPlan::factory()->create();

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/v1/subscription-plans/{$plan->id}");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message'
                ]);

        $this->assertDatabaseMissing('subscription_plans', [
            'id' => $plan->id
        ]);
    }

    /** @test */
    public function it_can_toggle_plan_popularity()
    {
        $plan = SubscriptionPlan::factory()->create(['is_popular' => false]);

        $response = $this->actingAs($this->user)
            ->patchJson("/api/v1/subscription-plans/{$plan->id}/toggle-popular");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data'
                ]);

        $this->assertDatabaseHas('subscription_plans', [
            'id' => $plan->id,
            'is_popular' => true
        ]);
    }

    /** @test */
    public function it_can_get_plan_statistics()
    {
        // Create plans with different statuses
        SubscriptionPlan::factory()->create(['status' => 'active']);
        SubscriptionPlan::factory()->create(['status' => 'active']);
        SubscriptionPlan::factory()->create(['status' => 'inactive']);
        SubscriptionPlan::factory()->create(['is_popular' => true]);
        SubscriptionPlan::factory()->create(['is_custom' => true]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/subscription-plans/statistics');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'data' => [
                        'total_plans',
                        'active_plans',
                        'popular_plans',
                        'custom_plans',
                        'plans_by_tier'
                    ]
                ]);

        $data = $response->json('data');
        $this->assertEquals(5, $data['total_plans']);
        $this->assertEquals(2, $data['active_plans']);
        $this->assertEquals(1, $data['popular_plans']);
        $this->assertEquals(1, $data['custom_plans']);
    }

    /** @test */
    public function it_can_update_plan_sort_order()
    {
        $plan1 = SubscriptionPlan::factory()->create(['sort_order' => 1]);
        $plan2 = SubscriptionPlan::factory()->create(['sort_order' => 2]);

        $sortData = [
            ['id' => $plan1->id, 'sort_order' => 3],
            ['id' => $plan2->id, 'sort_order' => 1]
        ];

        $response = $this->actingAs($this->user)
            ->patchJson('/api/v1/subscription-plans/sort-order', [
                'sort_data' => $sortData
            ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message'
                ]);

        $this->assertDatabaseHas('subscription_plans', [
            'id' => $plan1->id,
            'sort_order' => 3
        ]);

        $this->assertDatabaseHas('subscription_plans', [
            'id' => $plan2->id,
            'sort_order' => 1
        ]);
    }
}
