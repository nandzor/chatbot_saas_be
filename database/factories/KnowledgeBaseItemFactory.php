<?php

namespace Database\Factories;

use App\Models\KnowledgeBaseCategory;
use App\Models\KnowledgeBaseItem;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class KnowledgeBaseItemFactory extends Factory
{
    protected $model = KnowledgeBaseItem::class;

    public function definition(): array
    {
        $title = $this->faker->sentence(4);
        $contentType = $this->faker->randomElement(['article', 'qa_collection', 'faq', 'guide', 'tutorial']);
        $content = $this->generateContent($contentType);

        return [
            'organization_id' => Organization::factory(),
            'category_id' => KnowledgeBaseCategory::factory(),
            'title' => $title,
            'slug' => Str::slug($title),
            'description' => $this->faker->sentence(),
            'content_type' => $contentType,
            'content' => $content,
            'summary' => $this->faker->optional()->paragraph(),
            'excerpt' => $this->faker->optional()->text(200),
            'tags' => $this->faker->optional()->words($this->faker->numberBetween(2, 6)),
            'keywords' => $this->faker->words($this->faker->numberBetween(3, 8)),
            'language' => $this->faker->randomElement(['indonesia', 'english']),
            'difficulty_level' => $this->faker->randomElement(['basic', 'intermediate', 'advanced', 'expert']),
            'priority' => $this->faker->randomElement(['low', 'medium', 'high', 'critical']),
            'estimated_read_time' => $this->faker->numberBetween(1, 15),
            'word_count' => str_word_count(strip_tags($content)),
            'meta_title' => $this->faker->optional()->sentence(3),
            'meta_description' => $this->faker->optional()->sentence(),
            'featured_image_url' => $this->faker->optional()->imageUrl(800, 400, 'business'),
            'is_featured' => $this->faker->boolean(15),
            'is_public' => $this->faker->boolean(85),
            'is_searchable' => $this->faker->boolean(90),
            'is_ai_trainable' => $this->faker->boolean(80),
            'requires_approval' => $this->faker->boolean(40),
            'workflow_status' => $this->faker->randomElement(['draft', 'review', 'approved', 'published', 'archived']),
            'approval_status' => $this->faker->randomElement(['pending', 'approved', 'rejected', 'auto_approved']),
            'author_id' => User::factory(),
            'reviewer_id' => $this->faker->optional()->randomElement([User::factory()]),
            'approved_by' => null,
            'published_at' => $this->faker->optional()->dateTimeBetween('-30 days', 'now'),
            'last_reviewed_at' => $this->faker->optional()->dateTimeBetween('-30 days', 'now'),
            'approved_at' => null,
            'view_count' => $this->faker->numberBetween(0, 1000),
            'helpful_count' => $this->faker->numberBetween(0, 100),
            'not_helpful_count' => $this->faker->numberBetween(0, 20),
            'share_count' => $this->faker->numberBetween(0, 50),
            'comment_count' => $this->faker->numberBetween(0, 30),
            'search_hit_count' => $this->faker->numberBetween(0, 500),
            'ai_usage_count' => $this->faker->numberBetween(0, 200),
            'embeddings_data' => [
                'model' => 'text-embedding-ada-002',
                'created_at' => now()->toISOString(),
                'chunks' => $this->faker->numberBetween(1, 5),
            ],
            'embeddings_vector' => [
                'vector' => array_map(fn() => $this->faker->randomFloat(6, -1, 1), range(1, 20)),
                'dimension' => 20,
            ],
            'ai_generated' => $this->faker->boolean(20),
            'ai_confidence_score' => $this->faker->optional()->randomFloat(2, 0.5, 1),
            'ai_last_processed_at' => $this->faker->optional()->dateTimeBetween('-7 days', 'now'),
            'version' => 1,
            'previous_version_id' => null,
            'is_latest_version' => true,
            'change_summary' => $this->faker->optional()->sentence(),
            'quality_score' => $this->faker->randomFloat(2, 0.5, 1),
            'effectiveness_score' => $this->faker->randomFloat(2, 0.4, 1),
            'last_effectiveness_update' => $this->faker->optional()->dateTimeBetween('-30 days', 'now'),
            'metadata' => [
                'source' => $this->faker->randomElement(['manual', 'import', 'ai_generated']),
                'last_updated_by' => 'user',
                'revision_notes' => $this->faker->optional()->sentence(),
            ],
            'configuration' => [
                'auto_publish' => $this->faker->boolean(30),
                'notify_subscribers' => $this->faker->boolean(70),
                'enable_comments' => $this->faker->boolean(60),
            ],
            'status' => $this->faker->randomElement(['draft', 'active', 'archived']),
        ];
    }

    private function generateContent(string $contentType): string
    {
        return match ($contentType) {
            'article' => $this->generateArticleContent(),
            'qa_collection' => $this->generateQAContent(),
            'faq' => $this->generateFAQContent(),
            'guide' => $this->generateGuideContent(),
            'tutorial' => $this->generateTutorialContent(),
            default => $this->faker->paragraphs(3, true),
        };
    }

    private function generateArticleContent(): string
    {
        return "# " . $this->faker->sentence() . "\n\n" .
               $this->faker->paragraph() . "\n\n" .
               "## " . $this->faker->sentence() . "\n\n" .
               $this->faker->paragraphs(2, true) . "\n\n" .
               "## " . $this->faker->sentence() . "\n\n" .
               $this->faker->paragraphs(2, true);
    }

    private function generateQAContent(): string
    {
        return "Kumpulan Q&A terkait " . $this->faker->words(3, true) . "\n\n" .
               "Artikel ini berisi kumpulan pertanyaan dan jawaban yang sering ditanyakan mengenai topik ini.";
    }

    private function generateFAQContent(): string
    {
        return "# Frequently Asked Questions\n\n" .
               "Berikut adalah pertanyaan yang sering ditanyakan:\n\n" .
               $this->faker->paragraph();
    }

    private function generateGuideContent(): string
    {
        return "# Panduan " . $this->faker->words(2, true) . "\n\n" .
               "Panduan lengkap untuk memahami dan menggunakan fitur ini.\n\n" .
               "## Langkah 1\n" . $this->faker->paragraph() . "\n\n" .
               "## Langkah 2\n" . $this->faker->paragraph() . "\n\n" .
               "## Langkah 3\n" . $this->faker->paragraph();
    }

    private function generateTutorialContent(): string
    {
        return "# Tutorial: " . $this->faker->sentence() . "\n\n" .
               "Tutorial step-by-step untuk " . $this->faker->words(3, true) . "\n\n" .
               "### Persiapan\n" . $this->faker->paragraph() . "\n\n" .
               "### Pelaksanaan\n" . $this->faker->paragraphs(2, true) . "\n\n" .
               "### Penyelesaian\n" . $this->faker->paragraph();
    }

    public function article(): static
    {
        return $this->state(fn (array $attributes) => [
            'content_type' => 'article',
            'content' => $this->generateArticleContent(),
        ]);
    }

    public function qaCollection(): static
    {
        return $this->state(fn (array $attributes) => [
            'content_type' => 'qa_collection',
            'content' => $this->generateQAContent(),
        ]);
    }

    public function faq(): static
    {
        return $this->state(fn (array $attributes) => [
            'content_type' => 'faq',
            'content' => $this->generateFAQContent(),
        ]);
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'workflow_status' => 'published',
            'approval_status' => 'approved',
            'is_public' => true,
            'published_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'approved_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'status' => 'active',
        ]);
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'workflow_status' => 'draft',
            'approval_status' => 'pending',
            'is_public' => false,
            'published_at' => null,
            'status' => 'draft',
        ]);
    }

    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
            'priority' => 'high',
            'workflow_status' => 'published',
            'is_public' => true,
        ]);
    }

    public function highQuality(): static
    {
        return $this->state(fn (array $attributes) => [
            'quality_score' => $this->faker->randomFloat(2, 0.8, 1),
            'effectiveness_score' => $this->faker->randomFloat(2, 0.8, 1),
            'helpful_count' => $this->faker->numberBetween(50, 200),
            'view_count' => $this->faker->numberBetween(500, 2000),
        ]);
    }

    public function popular(): static
    {
        return $this->state(fn (array $attributes) => [
            'view_count' => $this->faker->numberBetween(1000, 5000),
            'helpful_count' => $this->faker->numberBetween(100, 500),
            'share_count' => $this->faker->numberBetween(20, 100),
            'search_hit_count' => $this->faker->numberBetween(200, 1000),
        ]);
    }

    public function aiGenerated(): static
    {
        return $this->state(fn (array $attributes) => [
            'ai_generated' => true,
            'ai_confidence_score' => $this->faker->randomFloat(2, 0.7, 0.95),
            'requires_approval' => true,
            'workflow_status' => 'review',
        ]);
    }

    public function withCategory(KnowledgeBaseCategory $category): static
    {
        return $this->state(fn (array $attributes) => [
            'category_id' => $category->id,
            'organization_id' => $category->organization_id,
        ]);
    }
}
