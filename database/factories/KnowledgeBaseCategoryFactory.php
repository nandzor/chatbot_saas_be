<?php

namespace Database\Factories;

use App\Models\KnowledgeBaseCategory;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class KnowledgeBaseCategoryFactory extends Factory
{
    protected $model = KnowledgeBaseCategory::class;

    public function definition(): array
    {
        $name = $this->faker->words(2, true);

        return [
            'organization_id' => Organization::factory(),
            'parent_id' => null,
            'name' => ucwords($name),
            'slug' => Str::slug($name),
            'description' => $this->faker->sentence(),
            'icon' => $this->faker->randomElement([
                'help-circle', 'book', 'settings', 'info', 'question-mark',
                'support', 'guide', 'faq', 'knowledge', 'tutorial'
            ]),
            'color' => $this->faker->hexColor(),
            'order_index' => $this->faker->numberBetween(0, 10),
            'is_public' => $this->faker->boolean(90),
            'is_featured' => $this->faker->boolean(20),
            'is_system_category' => $this->faker->boolean(10),
            'supports_articles' => $this->faker->boolean(90),
            'supports_qa' => $this->faker->boolean(80),
            'supports_faq' => $this->faker->boolean(70),
            'meta_title' => $this->faker->optional()->sentence(3),
            'meta_description' => $this->faker->optional()->sentence(),
            'meta_keywords' => $this->faker->optional()->words(5),
            'total_content_count' => $this->faker->numberBetween(0, 50),
            'article_count' => $this->faker->numberBetween(0, 30),
            'qa_count' => $this->faker->numberBetween(0, 20),
            'view_count' => $this->faker->numberBetween(0, 1000),
            'search_count' => $this->faker->numberBetween(0, 500),
            'is_ai_trainable' => $this->faker->boolean(80),
            'ai_category_embeddings' => [
                'vector' => array_map(fn() => $this->faker->randomFloat(6, -1, 1), range(1, 10)),
                'model' => 'text-embedding-ada-002',
                'created_at' => now()->toISOString(),
            ],
            'ai_processing_priority' => $this->faker->numberBetween(1, 10),
            'auto_categorize' => $this->faker->boolean(30),
            'category_rules' => [
                'keywords' => $this->faker->optional()->words(5),
                'patterns' => $this->faker->optional()->words(3),
                'conditions' => [
                    'min_confidence' => 0.7,
                    'auto_assign' => true,
                ],
            ],
            'metadata' => [
                'created_by' => 'system',
                'source' => $this->faker->randomElement(['manual', 'import', 'api']),
                'tags' => $this->faker->optional()->words(3),
            ],
            'status' => 'active',
        ];
    }

    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
            'order_index' => $this->faker->numberBetween(0, 3),
        ]);
    }

    public function system(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_system_category' => true,
            'is_public' => true,
            'name' => $this->faker->randomElement([
                'General FAQ', 'Technical Support', 'Product Information',
                'Service Policies', 'Getting Started', 'Troubleshooting'
            ]),
        ]);
    }

    public function withParent(KnowledgeBaseCategory $parent = null): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_id' => $parent?->id ?? KnowledgeBaseCategory::factory(),
            'organization_id' => $parent?->organization_id ?? $attributes['organization_id'],
        ]);
    }

    public function articlesOnly(): static
    {
        return $this->state(fn (array $attributes) => [
            'supports_articles' => true,
            'supports_qa' => false,
            'supports_faq' => false,
        ]);
    }

    public function qaOnly(): static
    {
        return $this->state(fn (array $attributes) => [
            'supports_articles' => false,
            'supports_qa' => true,
            'supports_faq' => false,
        ]);
    }

    public function faqOnly(): static
    {
        return $this->state(fn (array $attributes) => [
            'supports_articles' => false,
            'supports_qa' => false,
            'supports_faq' => true,
        ]);
    }

    public function withContent(): static
    {
        return $this->state(fn (array $attributes) => [
            'total_content_count' => $this->faker->numberBetween(10, 100),
            'article_count' => $this->faker->numberBetween(5, 60),
            'qa_count' => $this->faker->numberBetween(5, 40),
            'view_count' => $this->faker->numberBetween(100, 5000),
            'search_count' => $this->faker->numberBetween(50, 2000),
        ]);
    }

    public function private(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_public' => false,
        ]);
    }

    public function highPriority(): static
    {
        return $this->state(fn (array $attributes) => [
            'ai_processing_priority' => $this->faker->numberBetween(8, 10),
            'auto_categorize' => true,
            'is_featured' => true,
        ]);
    }
}
