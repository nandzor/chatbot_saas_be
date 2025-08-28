<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\User;
use App\Models\KnowledgeBaseCategory;
use App\Models\KnowledgeBaseItem;
use App\Models\KnowledgeBaseTag;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class KnowledgeBaseSeeder extends Seeder
{
    protected $faker;

    public function __construct()
    {
        $this->faker = Faker::create('id_ID');
    }

    public function run(): void
    {
        $this->command->info('📚 Starting Knowledge Base Seeder...');

        $organizations = Organization::all();

        if ($organizations->isEmpty()) {
            $this->command->warn('No organizations found. Please run OrganizationSeeder first.');
            return;
        }

        foreach ($organizations as $organization) {
            $this->command->info("Creating Knowledge Base for: {$organization->name}");

            $categories = $this->createCategories($organization);
            $tags = $this->createTags($organization);
            $this->createKnowledgeItems($organization, $categories, $tags);

            $this->command->info("✓ Completed Knowledge Base for: {$organization->name}");
        }

        $this->command->info('🎉 Knowledge Base Seeder completed successfully!');
    }

    private function createCategories(Organization $organization): array
    {
        $categories = [];

        $mainCategories = [
            [
                'name' => 'Getting Started',
                'slug' => 'getting-started',
                'description' => 'Panduan lengkap untuk memulai menggunakan platform',
                'icon' => 'play',
                'color' => '#10B981',
            ],
            [
                'name' => 'Technical Support',
                'slug' => 'technical-support',
                'description' => 'Bantuan teknis dan troubleshooting',
                'icon' => 'settings',
                'color' => '#3B82F6',
            ],
            [
                'name' => 'Product Information',
                'slug' => 'product-information',
                'description' => 'Informasi lengkap tentang produk dan fitur',
                'icon' => 'package',
                'color' => '#F59E0B',
            ],
            [
                'name' => 'API Documentation',
                'slug' => 'api-documentation',
                'description' => 'Dokumentasi API dan integrasi',
                'icon' => 'code',
                'color' => '#8B5CF6',
            ],
            [
                'name' => 'Billing & Payments',
                'slug' => 'billing-payments',
                'description' => 'Informasi tentang tagihan dan pembayaran',
                'icon' => 'credit-card',
                'color' => '#EF4444',
            ],
            [
                'name' => 'Security & Privacy',
                'slug' => 'security-privacy',
                'description' => 'Keamanan dan privasi data',
                'icon' => 'shield',
                'color' => '#06B6D4',
            ],
            [
                'name' => 'Integration Guides',
                'slug' => 'integration-guides',
                'description' => 'Panduan integrasi dengan platform lain',
                'icon' => 'link',
                'color' => '#84CC16',
            ],
            [
                'name' => 'Best Practices',
                'slug' => 'best-practices',
                'description' => 'Praktik terbaik untuk penggunaan optimal',
                'icon' => 'star',
                'color' => '#F97316',
            ],
        ];

        foreach ($mainCategories as $categoryData) {
            $category = KnowledgeBaseCategory::create([
                'organization_id' => $organization->id,
                'name' => $categoryData['name'],
                'slug' => $categoryData['slug'],
                'description' => $categoryData['description'],
                'icon' => $categoryData['icon'],
                'color' => $categoryData['color'],
                'order_index' => count($categories) + 1,
                'is_public' => true,
                'is_featured' => in_array($categoryData['slug'], ['getting-started', 'technical-support']),
                'supports_articles' => true,
                'supports_qa' => true,
                'supports_faq' => true,
                'is_ai_trainable' => true,
                'ai_processing_priority' => $this->faker->numberBetween(1, 5),
                'status' => 'active',
            ]);

            $categories[$categoryData['slug']] = $category;
        }

        return $categories;
    }

    private function createTags(Organization $organization): array
    {
        $tags = [];

        $tagNames = [
            'beginner', 'advanced', 'tutorial', 'guide', 'faq', 'troubleshooting',
            'api', 'integration', 'security', 'billing', 'performance', 'setup',
            'configuration', 'deployment', 'monitoring', 'analytics', 'automation',
            'chatbot', 'ai', 'machine-learning', 'nlp', 'webhook', 'authentication',
        ];

        foreach ($tagNames as $tagName) {
            $tag = KnowledgeBaseTag::firstOrCreate([
                'organization_id' => $organization->id,
                'name' => $tagName,
            ], [
                'slug' => \Illuminate\Support\Str::slug($tagName),
                'description' => "Tag untuk {$tagName}",
                'color' => $this->faker->randomElement(['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']),
                'is_featured' => in_array($tagName, ['beginner', 'advanced', 'tutorial', 'faq']),
                'usage_count' => 0,
                'status' => 'active',
            ]);

            $tags[$tagName] = $tag;
        }

        return $tags;
    }

    private function createKnowledgeItems(Organization $organization, array $categories, array $tags): void
    {
        $users = User::where('organization_id', $organization->id)->get();

        if ($users->isEmpty()) {
            $this->command->warn("No users found for organization: {$organization->name}");
            return;
        }

        foreach ($categories as $category) {
            $this->createArticlesForCategory($organization, $category, $users, $tags);
        }

        $this->createQaItems($organization, $categories, $users, $tags);
        $this->createFeaturedContent($organization, $categories, $users, $tags);
        $this->createQaItemsForKnowledgeItems($organization, $categories, $users);
    }

    private function createArticlesForCategory(Organization $organization, KnowledgeBaseCategory $category, $users, array $tags): void
    {
        $articleCount = 5;

        for ($i = 0; $i < $articleCount; $i++) {
            $title = $this->generateTitle($category, $i);
            $content = $this->generateContent($category);

            $item = KnowledgeBaseItem::create([
                'organization_id' => $organization->id,
                'category_id' => $category->id,
                'author_id' => $users->random()->id,
                'title' => $title,
                'slug' => \Illuminate\Support\Str::slug($title),
                'description' => $this->faker->sentence(),
                'content_type' => 'article',
                'content' => $content,
                'excerpt' => $this->generateExcerpt($content),
                'tags' => $this->generateTagsForItem($category, $tags),
                'keywords' => $this->generateKeywords($title, $content),
                'language' => 'id',
                'difficulty_level' => $this->faker->randomElement(['beginner', 'intermediate', 'advanced']),
                'priority' => $this->faker->randomElement(['low', 'medium', 'high']),
                'estimated_read_time' => $this->calculateReadTime($content),
                'word_count' => str_word_count(strip_tags($content)),
                'meta_title' => $title . ' - Knowledge Base',
                'meta_description' => $this->faker->sentence(),
                'is_featured' => $this->faker->boolean(20),
                'is_public' => $this->faker->boolean(90),
                'is_searchable' => true,
                'is_ai_trainable' => $this->faker->boolean(80),
                'requires_approval' => $this->faker->boolean(30),
                'workflow_status' => $this->faker->randomElement(['draft', 'published', 'review']),
                'approval_status' => $this->faker->randomElement(['pending', 'approved', 'rejected']),
                'published_at' => $this->faker->optional(0.8)->dateTimeBetween('-1 year', 'now'),
                'view_count' => $this->faker->numberBetween(0, 5000),
                'helpful_count' => $this->faker->numberBetween(0, 200),
                'not_helpful_count' => $this->faker->numberBetween(0, 50),
                'share_count' => $this->faker->numberBetween(0, 100),
                'search_hit_count' => $this->faker->numberBetween(0, 1000),
                'ai_usage_count' => $this->faker->numberBetween(0, 500),
                'ai_generated' => $this->faker->boolean(10),
                'ai_confidence_score' => $this->faker->randomFloat(2, 0.7, 1.0),
                'version' => '1.0.0',
                'is_latest_version' => true,
                'quality_score' => $this->faker->randomFloat(2, 0.6, 1.0),
                'effectiveness_score' => $this->faker->randomFloat(2, 0.5, 1.0),
                'status' => 'active',
            ]);
        }
    }

    private function createQaItems(Organization $organization, array $categories, $users, array $tags): void
    {
        $qaCount = 10;

        for ($i = 0; $i < $qaCount; $i++) {
            $category = $categories[array_rand($categories)];

            $question = $this->generateQuestion($category);
            $answer = $this->generateAnswer($category);

            $item = KnowledgeBaseItem::create([
                'organization_id' => $organization->id,
                'category_id' => $category->id,
                'author_id' => $users->random()->id,
                'title' => $question,
                'slug' => \Illuminate\Support\Str::slug($question),
                'description' => $this->faker->sentence(),
                'content_type' => 'faq',
                'content' => $answer,
                'excerpt' => $this->generateExcerpt($answer),
                'tags' => $this->generateTagsForItem($category, $tags),
                'keywords' => $this->generateKeywords($question, $answer),
                'language' => 'id',
                'difficulty_level' => $this->faker->randomElement(['beginner', 'intermediate']),
                'priority' => $this->faker->randomElement(['low', 'medium']),
                'estimated_read_time' => $this->calculateReadTime($answer),
                'word_count' => str_word_count(strip_tags($answer)),
                'meta_title' => $question . ' - FAQ',
                'meta_description' => $this->faker->sentence(),
                'is_featured' => $this->faker->boolean(15),
                'is_public' => true,
                'is_searchable' => true,
                'is_ai_trainable' => true,
                'requires_approval' => false,
                'workflow_status' => 'published',
                'approval_status' => 'approved',
                'published_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
                'view_count' => $this->faker->numberBetween(0, 3000),
                'helpful_count' => $this->faker->numberBetween(0, 150),
                'not_helpful_count' => $this->faker->numberBetween(0, 30),
                'share_count' => $this->faker->numberBetween(0, 80),
                'search_hit_count' => $this->faker->numberBetween(0, 800),
                'ai_usage_count' => $this->faker->numberBetween(0, 300),
                'ai_generated' => false,
                'ai_confidence_score' => $this->faker->randomFloat(2, 0.8, 1.0),
                'version' => '1.0.0',
                'is_latest_version' => true,
                'quality_score' => $this->faker->randomFloat(2, 0.7, 1.0),
                'effectiveness_score' => $this->faker->randomFloat(2, 0.6, 1.0),
                'status' => 'active',
            ]);
        }
    }

    private function createFeaturedContent(Organization $organization, array $categories, $users, array $tags): void
    {
        $featuredCategories = ['getting-started', 'technical-support'];

        foreach ($featuredCategories as $categorySlug) {
            if (isset($categories[$categorySlug])) {
                $category = $categories[$categorySlug];

                $item = KnowledgeBaseItem::create([
                    'organization_id' => $organization->id,
                    'category_id' => $category->id,
                    'author_id' => $users->random()->id,
                    'title' => "Panduan Lengkap: {$category->name}",
                    'slug' => "panduan-lengkap-{$category->slug}",
                    'description' => "Panduan komprehensif untuk {$category->name}",
                    'content_type' => 'article',
                    'content' => $this->generateFeaturedContent($category),
                    'excerpt' => "Panduan lengkap dan detail untuk {$category->name}",
                    'tags' => ['featured', 'guide', 'comprehensive'],
                    'keywords' => ['panduan', 'lengkap', 'tutorial', 'guide'],
                    'language' => 'id',
                    'difficulty_level' => 'beginner',
                    'priority' => 'high',
                    'estimated_read_time' => 15,
                    'word_count' => 2500,
                    'meta_title' => "Panduan Lengkap {$category->name} - Knowledge Base",
                    'meta_description' => "Panduan komprehensif untuk {$category->name}",
                    'is_featured' => true,
                    'is_public' => true,
                    'is_searchable' => true,
                    'is_ai_trainable' => true,
                    'requires_approval' => false,
                    'workflow_status' => 'published',
                    'approval_status' => 'approved',
                    'published_at' => $this->faker->dateTimeBetween('-6 months', 'now'),
                    'view_count' => $this->faker->numberBetween(5000, 20000),
                    'helpful_count' => $this->faker->numberBetween(200, 800),
                    'not_helpful_count' => $this->faker->numberBetween(0, 50),
                    'share_count' => $this->faker->numberBetween(100, 500),
                    'search_hit_count' => $this->faker->numberBetween(2000, 8000),
                    'ai_usage_count' => $this->faker->numberBetween(500, 2000),
                    'ai_generated' => false,
                    'ai_confidence_score' => 0.95,
                    'version' => '1.0.0',
                    'is_latest_version' => true,
                    'quality_score' => 0.95,
                    'effectiveness_score' => 0.90,
                    'status' => 'active',
                ]);
            }
        }
    }

    private function generateTitle(KnowledgeBaseCategory $category, int $index): string
    {
        $templates = [
            'getting-started' => [
                'Cara Memulai dengan Platform',
                'Panduan Pertama Kali',
                'Setup Awal yang Benar',
                'Langkah-langkah Awal',
                'Tutorial Dasar',
            ],
            'technical-support' => [
                'Troubleshooting Masalah Umum',
                'Solusi Error Code',
                'Perbaikan Performance',
                'Debugging Guide',
                'Technical FAQ',
            ],
            'product-information' => [
                'Fitur Terbaru Platform',
                'Perbandingan Paket',
                'Release Notes v2.0',
                'Overview Produk',
                'Product Guide',
            ],
            'api-documentation' => [
                'Autentikasi API',
                'Endpoint Reference',
                'Webhook Setup',
                'API Best Practices',
                'Integration Guide',
            ],
            'billing-payments' => [
                'Cara Membayar Tagihan',
                'Metode Pembayaran',
                'Invoice Management',
                'Billing FAQ',
                'Payment Guide',
            ],
        ];

        $categoryTemplates = $templates[$category->slug] ?? $templates['getting-started'];
        $baseTitle = $categoryTemplates[$index % count($categoryTemplates)];

        return $baseTitle . ($index > 0 ? " #" . ($index + 1) : "");
    }

    private function generateContent(KnowledgeBaseCategory $category): string
    {
        $content = "<h1>Panduan {$category->name}</h1>\n\n";

        $content .= "<p>Artikel ini akan membantu Anda memahami {$category->name} dengan mudah.</p>\n\n";

        $content .= "<h2>Apa yang akan Anda pelajari</h2>\n";
        $content .= "<ul>\n";
        $content .= "<li>Konsep dasar {$category->name}</li>\n";
        $content .= "<li>Langkah-langkah implementasi</li>\n";
        $content .= "<li>Best practices</li>\n";
        $content .= "<li>Troubleshooting</li>\n";
        $content .= "</ul>\n\n";

        $content .= "<h2>Persiapan</h2>\n";
        $content .= "<p>Sebelum memulai, pastikan Anda telah menyiapkan:</p>\n";
        $content .= "<ul>\n";
        $content .= "<li>Akun yang sudah terverifikasi</li>\n";
        $content .= "<li>Koneksi internet yang stabil</li>\n";
        $content .= "<li>Browser terbaru</li>\n";
        $content .= "</ul>\n\n";

        $content .= "<h2>Langkah-langkah</h2>\n";
        $content .= "<h3>Langkah 1: Persiapan</h3>\n";
        $content .= "<p>Mulai dengan mempersiapkan semua kebutuhan dasar.</p>\n\n";

        $content .= "<h3>Langkah 2: Implementasi</h3>\n";
        $content .= "<p>Implementasikan sesuai dengan panduan yang diberikan.</p>\n\n";

        $content .= "<h3>Langkah 3: Testing</h3>\n";
        $content .= "<p>Lakukan testing untuk memastikan semuanya berjalan dengan baik.</p>\n\n";

        $content .= "<h2>Kesimpulan</h2>\n";
        $content .= "<p>Dengan mengikuti panduan ini, Anda seharusnya sudah bisa memahami {$category->name} dengan baik.</p>\n";

        return $content;
    }

    private function generateExcerpt(string $content): string
    {
        $text = strip_tags($content);
        return substr($text, 0, 200) . (strlen($text) > 200 ? '...' : '');
    }

    private function generateTagsForItem(KnowledgeBaseCategory $category, array $tags): array
    {
        $selectedTags = [];

        switch ($category->slug) {
            case 'getting-started':
                $selectedTags = ['beginner', 'tutorial', 'setup'];
                break;
            case 'technical-support':
                $selectedTags = ['troubleshooting', 'debugging', 'error-handling'];
                break;
            case 'api-documentation':
                $selectedTags = ['api', 'integration', 'authentication'];
                break;
            default:
                $selectedTags = ['guide', 'documentation'];
        }

        return array_unique($selectedTags);
    }

    private function generateKeywords(string $title, string $content): array
    {
        $text = $title . ' ' . strip_tags($content);
        $words = str_word_count(strtolower($text), 1);
        $words = array_filter($words, function($word) {
            return strlen($word) > 3;
        });

        $wordCount = array_count_values($words);
        arsort($wordCount);

        return array_slice(array_keys($wordCount), 0, 10);
    }

    private function generateQuestion(KnowledgeBaseCategory $category): string
    {
        $questions = [
            'Bagaimana cara mengatasi error yang sering terjadi?',
            'Apa perbedaan antara fitur A dan B?',
            'Kapan sebaiknya menggunakan opsi ini?',
            'Berapa lama waktu yang dibutuhkan untuk setup?',
            'Apakah ada batasan dalam penggunaan?',
            'Bagaimana cara mengoptimalkan performance?',
            'Apa yang harus dilakukan jika terjadi masalah?',
            'Bagaimana cara backup data?',
            'Apakah ada integrasi dengan platform lain?',
            'Bagaimana cara mengatur notifikasi?',
        ];

        return $this->faker->randomElement($questions);
    }

    private function generateAnswer(KnowledgeBaseCategory $category): string
    {
        $answers = [
            'Untuk mengatasi masalah ini, Anda perlu mengikuti langkah-langkah berikut...',
            'Perbedaan utamanya terletak pada fitur dan kapasitas yang disediakan...',
            'Opsi ini sebaiknya digunakan ketika Anda membutuhkan...',
            'Waktu setup biasanya membutuhkan 15-30 menit tergantung kompleksitas...',
            'Ya, ada beberapa batasan yang perlu diperhatikan...',
            'Optimasi dapat dilakukan dengan beberapa cara berikut...',
            'Jika terjadi masalah, segera hubungi support team kami...',
            'Backup data dapat dilakukan secara otomatis atau manual...',
            'Platform kami mendukung integrasi dengan berbagai layanan...',
            'Notifikasi dapat diatur melalui menu pengaturan...',
        ];

        return $this->faker->randomElement($answers);
    }

    private function generateFeaturedContent(KnowledgeBaseCategory $category): string
    {
        $content = "<h1>Panduan Lengkap: {$category->name}</h1>\n\n";

        $content .= "<div class='alert alert-info'>\n";
        $content .= "<strong>Panduan Komprehensif:</strong> Artikel ini akan memberikan pemahaman mendalam tentang {$category->name}.\n";
        $content .= "</div>\n\n";

        $content .= "<h2>Daftar Isi</h2>\n";
        $content .= "<ol>\n";
        $content .= "<li><a href='#pengenalan'>Pengenalan</a></li>\n";
        $content .= "<li><a href='#konsep-dasar'>Konsep Dasar</a></li>\n";
        $content .= "<li><a href='#implementasi'>Implementasi</a></li>\n";
        $content .= "<li><a href='#best-practices'>Best Practices</a></li>\n";
        $content .= "<li><a href='#troubleshooting'>Troubleshooting</a></li>\n";
        $content .= "<li><a href='#kesimpulan'>Kesimpulan</a></li>\n";
        $content .= "</ol>\n\n";

        $content .= "<h2 id='pengenalan'>1. Pengenalan</h2>\n";
        $content .= "<p>Bagian ini akan menjelaskan secara detail tentang {$category->name} dan mengapa penting untuk dipahami.</p>\n\n";

        $content .= "<h2 id='konsep-dasar'>2. Konsep Dasar</h2>\n";
        $content .= "<p>Memahami konsep dasar adalah langkah penting sebelum melakukan implementasi.</p>\n\n";

        $content .= "<h2 id='implementasi'>3. Implementasi</h2>\n";
        $content .= "<p>Langkah-langkah detail untuk mengimplementasikan {$category->name}.</p>\n\n";

        $content .= "<h2 id='best-practices'>4. Best Practices</h2>\n";
        $content .= "<p>Praktik terbaik yang direkomendasikan untuk hasil optimal.</p>\n\n";

        $content .= "<h2 id='troubleshooting'>5. Troubleshooting</h2>\n";
        $content .= "<p>Solusi untuk masalah-masalah yang sering terjadi.</p>\n\n";

        $content .= "<h2 id='kesimpulan'>6. Kesimpulan</h2>\n";
        $content .= "<p>Ringkasan dan langkah selanjutnya setelah memahami {$category->name}.</p>\n";

        return $content;
    }

    private function createQaItemsForKnowledgeItems(Organization $organization, array $categories, $users): void
    {
        // Get some knowledge items to add Q&A items to
        $knowledgeItems = KnowledgeBaseItem::where('organization_id', $organization->id)
            ->where('content_type', 'article')
            ->limit(10)
            ->get();

        foreach ($knowledgeItems as $item) {
            $qaCount = $this->faker->numberBetween(3, 8);

            for ($i = 0; $i < $qaCount; $i++) {
                \App\Models\KnowledgeQaItem::create([
                    'organization_id' => $organization->id,
                    'knowledge_item_id' => $item->id,
                    'question' => $this->generateQuestion($item->category),
                    'answer' => $this->generateAnswer($item->category),
                    'question_type' => $this->faker->randomElement(['text', 'multiple_choice', 'true_false']),
                    'difficulty_level' => $this->faker->randomElement(['beginner', 'intermediate', 'advanced']),
                    'is_active' => true,
                    'is_featured' => $this->faker->boolean(20),
                    'view_count' => $this->faker->numberBetween(0, 1000),
                    'helpful_count' => $this->faker->numberBetween(0, 100),
                    'not_helpful_count' => $this->faker->numberBetween(0, 20),
                    'ai_usage_count' => $this->faker->numberBetween(0, 200),
                    'metadata' => [
                        'source' => 'manual',
                        'verified' => $this->faker->boolean(80),
                        'last_verified' => $this->faker->dateTimeBetween('-6 months', 'now'),
                    ],
                ]);
            }
        }
    }

    private function calculateReadTime(string $content): int
    {
        $wordCount = str_word_count(strip_tags($content));
        return max(1, round($wordCount / 200)); // 200 words per minute
    }
}
