<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Organization;
use App\Models\KnowledgeBaseItem;
use App\Models\KnowledgeBaseCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

class KnowledgeBaseOrganizationAccessTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $organization1;
    protected $organization2;
    protected $user1;
    protected $user2;
    protected $superAdmin;
    protected $category1;
    protected $category2;
    protected $knowledgeItem1;
    protected $knowledgeItem2;

    protected function setUp(): void
    {
        parent::setUp();

        // Create organizations
        $this->organization1 = Organization::factory()->create();
        $this->organization2 = Organization::factory()->create();

        // Create users for each organization
        $this->user1 = User::factory()->create([
            'organization_id' => $this->organization1->id,
            'role' => 'admin'
        ]);

        $this->user2 = User::factory()->create([
            'organization_id' => $this->organization2->id,
            'role' => 'admin'
        ]);

        // Create super admin
        $this->superAdmin = User::factory()->create([
            'role' => 'super_admin'
        ]);

        // Create categories for each organization
        $this->category1 = KnowledgeBaseCategory::factory()->create([
            'organization_id' => $this->organization1->id
        ]);

        $this->category2 = KnowledgeBaseCategory::factory()->create([
            'organization_id' => $this->organization2->id
        ]);

        // Create knowledge base items for each organization
        $this->knowledgeItem1 = KnowledgeBaseItem::factory()->create([
            'organization_id' => $this->organization1->id,
            'category_id' => $this->category1->id,
            'author_id' => $this->user1->id,
            'title' => 'Organization 1 Knowledge Item',
            'slug' => 'org-1-knowledge-item'
        ]);

        $this->knowledgeItem2 = KnowledgeBaseItem::factory()->create([
            'organization_id' => $this->organization2->id,
            'category_id' => $this->category2->id,
            'author_id' => $this->user2->id,
            'title' => 'Organization 2 Knowledge Item',
            'slug' => 'org-2-knowledge-item'
        ]);
    }

    /** @test */
    public function user_can_only_access_knowledge_base_items_from_their_organization()
    {
        // User 1 should be able to access their organization's knowledge base items
        $response = $this->actingAs($this->user1, 'api')
            ->getJson("/api/v1/knowledge-base/{$this->knowledgeItem1->id}");

        $response->assertStatus(200)
            ->assertJsonFragment(['title' => 'Organization 1 Knowledge Item']);

        // User 1 should NOT be able to access organization 2's knowledge base items
        $response = $this->actingAs($this->user1, 'api')
            ->getJson("/api/v1/knowledge-base/{$this->knowledgeItem2->id}");

        $response->assertStatus(403);
    }

    /** @test */
    public function user_can_only_access_knowledge_base_items_by_slug_from_their_organization()
    {
        // User 1 should be able to access their organization's knowledge base items by slug
        $response = $this->actingAs($this->user1, 'api')
            ->getJson("/api/v1/knowledge-base/slug/org-1-knowledge-item");

        $response->assertStatus(200)
            ->assertJsonFragment(['title' => 'Organization 1 Knowledge Item']);

        // User 1 should NOT be able to access organization 2's knowledge base items by slug
        $response = $this->actingAs($this->user1, 'api')
            ->getJson("/api/v1/knowledge-base/slug/org-2-knowledge-item");

        $response->assertStatus(403);
    }

    /** @test */
    public function user_can_only_update_knowledge_base_items_from_their_organization()
    {
        $updateData = [
            'title' => 'Updated Organization 1 Knowledge Item',
            'content' => 'Updated content'
        ];

        // User 1 should be able to update their organization's knowledge base items
        $response = $this->actingAs($this->user1, 'api')
            ->putJson("/api/v1/knowledge-base/{$this->knowledgeItem1->id}", $updateData);

        $response->assertStatus(200)
            ->assertJsonFragment(['title' => 'Updated Organization 1 Knowledge Item']);

        // User 1 should NOT be able to update organization 2's knowledge base items
        $response = $this->actingAs($this->user1, 'api')
            ->putJson("/api/v1/knowledge-base/{$this->knowledgeItem2->id}", $updateData);

        $response->assertStatus(403);
    }

    /** @test */
    public function user_can_only_delete_knowledge_base_items_from_their_organization()
    {
        // User 1 should be able to delete their organization's knowledge base items
        $response = $this->actingAs($this->user1, 'api')
            ->deleteJson("/api/v1/knowledge-base/{$this->knowledgeItem1->id}");

        $response->assertStatus(200);

        // Verify the item was deleted
        $this->assertDatabaseMissing('knowledge_base_items', [
            'id' => $this->knowledgeItem1->id
        ]);

        // User 1 should NOT be able to delete organization 2's knowledge base items
        $response = $this->actingAs($this->user1, 'api')
            ->deleteJson("/api/v1/knowledge-base/{$this->knowledgeItem2->id}");

        $response->assertStatus(403);
    }

    /** @test */
    public function super_admin_can_access_all_knowledge_base_items()
    {
        // Super admin should be able to access items from any organization
        $response = $this->actingAs($this->superAdmin, 'api')
            ->getJson("/api/v1/knowledge-base/{$this->knowledgeItem1->id}");

        $response->assertStatus(200)
            ->assertJsonFragment(['title' => 'Organization 1 Knowledge Item']);

        $response = $this->actingAs($this->superAdmin, 'api')
            ->getJson("/api/v1/knowledge-base/{$this->knowledgeItem2->id}");

        $response->assertStatus(200)
            ->assertJsonFragment(['title' => 'Organization 2 Knowledge Item']);
    }

    /** @test */
    public function user_can_only_see_knowledge_base_items_from_their_organization_in_list()
    {
        // User 1 should only see items from their organization
        $response = $this->actingAs($this->user1, 'api')
            ->getJson('/api/v1/knowledge-base');

        $response->assertStatus(200);

        $items = $response->json('data');
        $this->assertCount(1, $items);
        $this->assertEquals('Organization 1 Knowledge Item', $items[0]['title']);

        // User 2 should only see items from their organization
        $response = $this->actingAs($this->user2, 'api')
            ->getJson('/api/v1/knowledge-base');

        $response->assertStatus(200);

        $items = $response->json('data');
        $this->assertCount(1, $items);
        $this->assertEquals('Organization 2 Knowledge Item', $items[0]['title']);
    }

    /** @test */
    public function user_can_only_access_categories_from_their_organization()
    {
        // User 1 should only see categories from their organization
        $response = $this->actingAs($this->user1, 'api')
            ->getJson('/api/v1/knowledge-base/categories');

        $response->assertStatus(200);

        $categories = $response->json('data');
        $this->assertCount(1, $categories);
        $this->assertEquals($this->category1->id, $categories[0]['id']);
    }
}
