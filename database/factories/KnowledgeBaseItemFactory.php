<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\KnowledgeBaseCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class KnowledgeBaseItemFactory extends Factory
{
    public function definition(): array
    {
        $contentTypes = ['article', 'faq', 'tutorial', 'guide', 'reference', 'policy'];
        $contentType = $this->faker->randomElement($contentTypes);
        
        $title = $this->generateTitle($contentType);
        $slug = Str::slug($title);
        
        $difficultyLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
        $difficultyLevel = $this->faker->randomElement($difficultyLevels);
        
        $statuses = ['draft', 'published', 'archived', 'review'];
        $status = $this->faker->randomElement($statuses);
        
        $content = $this->generateContent($contentType, $difficultyLevel);
        $excerpt = $this->generateExcerpt($content);
        $tags = $this->generateTags($contentType, $title);
        
        return [
            'organization_id' => Organization::factory(),
            'category_id' => KnowledgeBaseCategory::factory(),
            'author_id' => User::factory(),
            'title' => $title,
            'slug' => $slug,
            'excerpt' => $excerpt,
            'content' => $content,
            'content_type' => $contentType,
            'difficulty_level' => $difficultyLevel,
            'estimated_read_time' => $this->calculateReadTime($content),
            'word_count' => str_word_count(strip_tags($content)),
            'character_count' => strlen(strip_tags($content)),
            
            'meta_title' => $title . ' - Knowledge Base',
            'meta_description' => $excerpt,
            'meta_keywords' => $tags,
            'canonical_url' => $this->faker->optional(0.3)->url(),
            
            'table_of_contents' => $this->generateTableOfContents($content),
            'sections' => $this->generateSections($content),
            'attachments' => $this->generateAttachments($contentType),
            
            'tags' => $tags,
            'related_topics' => $this->faker->randomElements($tags, $this->faker->numberBetween(2, 5)),
            
            'status' => $status,
            'published_at' => $status === 'published' ? $this->faker->dateTimeBetween('-1 year', 'now') : null,
            'scheduled_at' => $status === 'draft' ? $this->faker->optional(0.2)->dateTimeBetween('now', '+1 month') : null,
            'expires_at' => $this->faker->optional(0.1)->dateTimeBetween('+1 month', '+1 year'),
            
            'version' => '1.0.0',
            'version_notes' => $this->faker->optional(0.7)->sentence(),
            'previous_version_id' => $this->faker->optional(0.3)->uuid(),
            'change_log' => $this->faker->optional(0.6)->sentences(3, true),
            
            'is_public' => $this->faker->boolean(80),
            'requires_authentication' => $this->faker->boolean(30),
            'access_level' => $this->faker->randomElement(['public', 'authenticated', 'premium', 'admin']),
            'restricted_roles' => $this->faker->optional(0.2)->randomElements(['agent', 'admin', 'premium'], $this->faker->numberBetween(1, 2)),
            
            'is_ai_trainable' => $this->faker->boolean(70),
            'ai_training_data' => $this->generateAiTrainingData($contentType, $difficultyLevel),
            'ai_embeddings' => $this->generateAiEmbeddings(),
            'ai_processing_priority' => $this->faker->randomElement([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
            
            'view_count' => $this->faker->numberBetween(0, 10000),
            'unique_view_count' => $this->faker->numberBetween(0, 8000),
            'search_count' => $this->faker->numberBetween(0, 5000),
            'bookmark_count' => $this->faker->numberBetween(0, 500),
            'share_count' => $this->faker->numberBetween(0, 200),
            'rating_average' => $this->faker->randomFloat(1, 1.0, 5.0),
            'rating_count' => $this->faker->numberBetween(0, 100),
            
            'content_score' => $this->faker->randomFloat(2, 0.6, 1.0),
            'readability_score' => $this->faker->randomFloat(2, 0.5, 1.0),
            'seo_score' => $this->faker->randomFloat(2, 0.5, 1.0),
            'last_reviewed_at' => $this->faker->optional(0.7)->dateTimeBetween('-6 months', 'now'),
            'reviewed_by' => $this->faker->optional(0.7)->uuid(),
            
            'related_content' => $this->generateRelatedContent($contentType, $tags),
            'prerequisites' => $this->faker->optional(0.3)->randomElements($tags, $this->faker->numberBetween(1, 3)),
            'next_steps' => $this->faker->optional(0.3)->randomElements($tags, $this->faker->numberBetween(1, 3)),
            
            'accessibility_features' => $this->generateAccessibilityInfo($contentType, $difficultyLevel),
            'language' => $this->faker->randomElement(['en', 'id', 'es', 'fr', 'de', 'ja', 'zh']),
            'translation_available' => $this->faker->boolean(20),
            'translated_languages' => $this->faker->optional(0.2)->randomElements(['id', 'es', 'fr'], $this->faker->numberBetween(1, 2)),
            
            'metadata' => [
                'created_by' => 'system',
                'last_updated' => now()->toISOString(),
                'content_quality' => $this->assessContentQuality($content, $difficultyLevel),
                'target_audience' => $this->determineTargetAudience($difficultyLevel, $contentType),
                'content_freshness' => $this->assessContentFreshness($status),
                'compliance_status' => $this->assessComplianceStatus($contentType, $tags),
                'review_schedule' => $this->generateReviewSchedule($contentType, $status),
                'content_goals' => $this->determineContentGoals($contentType, $difficultyLevel)
            ],
        ];
    }
    
    private function generateTitle(string $contentType): string
    {
        $titles = [
            'article' => [
                'How to Optimize Your Chatbot Performance',
                'Understanding AI Model Selection for Your Use Case',
                'Best Practices for Customer Support Automation',
                'Implementing Multi-language Support in Your Bot',
                'Security Considerations for Chatbot Deployments'
            ],
            'faq' => [
                'What is the difference between rule-based and AI chatbots?',
                'How do I reset my chatbot password?',
                'Can I export my conversation data?',
                'What are the system requirements?',
                'How do I contact customer support?'
            ],
            'tutorial' => [
                'Step-by-Step Guide to Setting Up Your First Chatbot',
                'Complete Tutorial: Building a Customer Service Bot',
                'How to Train Your AI Model: A Beginner\'s Guide',
                'Creating Custom Integrations: Step-by-Step Tutorial',
                'Advanced Bot Configuration: Complete Walkthrough'
            ],
            'guide' => [
                'Complete Guide to Chatbot Strategy',
                'User Experience Design Guide for Chatbots',
                'Security Best Practices Guide',
                'Performance Optimization Guide',
                'Integration and API Guide'
            ],
            'reference' => [
                'API Reference Documentation',
                'Configuration Parameters Reference',
                'Error Codes and Troubleshooting Reference',
                'System Requirements Reference',
                'Performance Benchmarks Reference'
            ],
            'policy' => [
                'Terms of Service Policy',
                'Privacy Policy and Data Protection',
                'Acceptable Use Policy',
                'Security Policy and Guidelines',
                'Data Retention Policy'
            ]
        ];
        
        return $this->faker->randomElement($titles[$contentType] ?? ['Knowledge Base Article']);
    }
    
    private function generateContent(string $contentType, string $difficultyLevel): string
    {
        $paragraphs = match($difficultyLevel) {
            'beginner' => $this->faker->numberBetween(3, 5),
            'intermediate' => $this->faker->numberBetween(5, 8),
            'advanced' => $this->faker->numberBetween(8, 12),
            'expert' => $this->faker->numberBetween(12, 20),
        };
        
        $content = '<h2>Introduction</h2>';
        $content .= '<p>' . $this->faker->paragraphs(2, true) . '</p>';
        
        for ($i = 1; $i <= $paragraphs; $i++) {
            $content .= '<h3>Section ' . $i . '</h3>';
            $content .= '<p>' . $this->faker->paragraphs($this->faker->numberBetween(1, 3), true) . '</p>';
            
            if ($this->faker->boolean(30)) {
                $content .= '<ul><li>' . implode('</li><li>', $this->faker->sentences(3)) . '</li></ul>';
            }
        }
        
        $content .= '<h2>Conclusion</h2>';
        $content .= '<p>' . $this->faker->paragraphs(1, true) . '</p>';
        
        return $content;
    }
    
    private function generateExcerpt(string $content): string
    {
        $plainText = strip_tags($content);
        $excerpt = substr($plainText, 0, 200);
        
        if (strlen($plainText) > 200) {
            $excerpt .= '...';
        }
        
        return $excerpt;
    }
    
    private function generateTags(string $contentType, string $title): array
    {
        $baseTags = [
            'chatbot', 'ai', 'automation', 'customer-support', 'technology',
            'integration', 'api', 'documentation', 'guide', 'tutorial'
        ];
        
        $typeTags = [
            'article' => ['article', 'information', 'knowledge'],
            'faq' => ['faq', 'questions', 'answers', 'help'],
            'tutorial' => ['tutorial', 'step-by-step', 'how-to', 'learning'],
            'guide' => ['guide', 'reference', 'manual', 'documentation'],
            'reference' => ['reference', 'api', 'technical', 'specification'],
            'policy' => ['policy', 'legal', 'compliance', 'terms']
        ];
        
        $titleWords = explode(' ', strtolower($title));
        $titleTags = array_filter($titleWords, function($word) {
            return strlen($word) > 3 && !in_array($word, ['the', 'and', 'for', 'with', 'your', 'that', 'this', 'have', 'will', 'from']);
        });
        
        $allTags = array_merge($baseTags, $typeTags[$contentType] ?? [], array_slice($titleTags, 0, 5));
        
        return array_unique(array_slice($allTags, 0, 8));
    }
    
    private function generateAiTrainingData(string $contentType, string $difficultyLevel): array
    {
        return [
            'content_type' => $contentType,
            'difficulty_level' => $difficultyLevel,
            'training_priority' => $this->faker->randomElement(['low', 'medium', 'high', 'critical']),
            'last_trained_at' => $this->faker->optional(0.6)->dateTimeBetween('-6 months', 'now'),
            'training_accuracy' => $this->faker->randomFloat(2, 0.7, 0.98),
            'training_samples' => $this->faker->numberBetween(10, 1000),
            'model_version' => 'v' . $this->faker->numberBetween(1, 5) . '.' . $this->faker->numberBetween(0, 9),
            'training_metadata' => [
                'algorithm' => $this->faker->randomElement(['bert', 'gpt', 't5', 'roberta']),
                'epochs' => $this->faker->numberBetween(10, 100),
                'batch_size' => $this->faker->randomElement([16, 32, 64, 128]),
                'learning_rate' => $this->faker->randomFloat(6, 0.000001, 0.01)
            ]
        ];
    }
    
    private function generateAiEmbeddings(): array
    {
        return [
            'vector_model' => 'text-embedding-ada-002',
            'embedding_dimensions' => 1536,
            'last_updated' => now()->toISOString(),
            'similarity_threshold' => $this->faker->randomFloat(2, 0.7, 0.9),
            'clustering_group' => $this->faker->numberBetween(1, 10),
            'semantic_similarity' => $this->faker->randomFloat(2, 0.6, 0.95)
        ];
    }
    
    private function generateRelatedContent(string $contentType, array $tags): array
    {
        $relatedTypes = ['article', 'tutorial', 'guide', 'faq'];
        $relatedTypes = array_filter($relatedTypes, fn($type) => $type !== $contentType);
        
        $related = [];
        for ($i = 0; $i < $this->faker->numberBetween(3, 8); $i++) {
            $related[] = [
                'id' => $this->faker->uuid(),
                'title' => $this->faker->sentence(),
                'type' => $this->faker->randomElement($relatedTypes),
                'relevance_score' => $this->faker->randomFloat(2, 0.6, 0.95),
                'tags' => $this->faker->randomElements($tags, $this->faker->numberBetween(2, 4))
            ];
        }
        
        return $related;
    }
    
    private function generateTableOfContents(string $content): array
    {
        $toc = [];
        preg_match_all('/<h[2-6]>(.*?)<\/h[2-6]>/', $content, $matches);
        
        foreach ($matches[1] as $index => $heading) {
            $level = substr($matches[0][$index], 2, 1);
            $toc[] = [
                'id' => 'section-' . ($index + 1),
                'title' => strip_tags($heading),
                'level' => (int)$level,
                'anchor' => '#' . Str::slug($heading)
            ];
        }
        
        return $toc;
    }
    
    private function generateSections(string $content): array
    {
        $sections = [];
        preg_match_all('/<h[2-6]>(.*?)<\/h[2-6]>(.*?)(?=<h[2-6]|$)/s', $content, $matches);
        
        foreach ($matches[1] as $index => $heading) {
            $sections[] = [
                'id' => 'section-' . ($index + 1),
                'title' => strip_tags($heading),
                'content' => trim($matches[2][$index]),
                'word_count' => str_word_count(strip_tags($matches[2][$index]))
            ];
        }
        
        return $sections;
    }
    
    private function generateAttachments(string $contentType): array
    {
        $attachments = [];
        $attachmentCount = $this->faker->numberBetween(0, 3);
        
        $fileTypes = [
            'image' => ['png', 'jpg', 'svg', 'gif'],
            'document' => ['pdf', 'docx', 'txt'],
            'code' => ['json', 'xml', 'yaml', 'sql'],
            'archive' => ['zip', 'tar.gz']
        ];
        
        for ($i = 0; $i < $attachmentCount; $i++) {
            $type = $this->faker->randomElement(array_keys($fileTypes));
            $extension = $this->faker->randomElement($fileTypes[$type]);
            
            $attachments[] = [
                'id' => $this->faker->uuid(),
                'name' => $this->faker->words(2, true) . '.' . $extension,
                'type' => $type,
                'size' => $this->faker->numberBetween(1024, 10485760),
                'url' => $this->faker->url(),
                'description' => $this->faker->optional(0.7)->sentence()
            ];
        }
        
        return $attachments;
    }
    
    private function calculateReadTime(string $content): int
    {
        $wordCount = str_word_count(strip_tags($content));
        $wordsPerMinute = 200;
        return max(1, round($wordCount / $wordsPerMinute));
    }
    
    private function generateAccessibilityInfo(string $contentType, string $difficultyLevel): array
    {
        $features = ['screen_reader_friendly', 'keyboard_navigation', 'high_contrast_support'];
        $availableFeatures = $this->faker->randomElements($features, $this->faker->numberBetween(1, 3));
        
        return [
            'features' => $availableFeatures,
            'wcag_compliance' => $this->faker->randomElement(['A', 'AA', 'AAA']),
            'alt_text_available' => $this->faker->boolean(80),
            'transcript_available' => $this->faker->boolean(20),
            'font_size_adjustable' => $this->faker->boolean(90),
            'color_blind_friendly' => $this->faker->boolean(70)
        ];
    }
    
    private function assessContentQuality(string $content, string $difficultyLevel): array
    {
        $wordCount = str_word_count(strip_tags($content));
        $readabilityScore = $this->faker->randomFloat(2, 0.5, 1.0);
        
        return [
            'completeness' => $this->faker->randomFloat(2, 0.7, 1.0),
            'accuracy' => $this->faker->randomFloat(2, 0.8, 1.0),
            'clarity' => $readabilityScore,
            'depth' => match($difficultyLevel) {
                'beginner' => $this->faker->randomFloat(2, 0.6, 0.8),
                'intermediate' => $this->faker->randomFloat(2, 0.7, 0.9),
                'advanced' => $this->faker->randomFloat(2, 0.8, 1.0),
                'expert' => $this->faker->randomFloat(2, 0.9, 1.0),
            },
            'word_count_appropriate' => $wordCount >= 100 && $wordCount <= 5000,
            'structure_quality' => $this->faker->randomFloat(2, 0.7, 1.0)
        ];
    }
    
    private function determineTargetAudience(string $difficultyLevel, string $contentType): array
    {
        $audience = match($difficultyLevel) {
            'beginner' => ['new_users', 'non_technical', 'general_users'],
            'intermediate' => ['experienced_users', 'technical_users', 'power_users'],
            'advanced' => ['developers', 'system_administrators', 'technical_managers'],
            'expert' => ['architects', 'senior_developers', 'technical_leads'],
        };
        
        $audience[] = $contentType . '_seekers';
        
        return $audience;
    }
    
    private function assessContentFreshness(string $status): array
    {
        $lastUpdated = now()->subDays($this->faker->numberBetween(1, 365));
        $daysSinceUpdate = now()->diffInDays($lastUpdated);
        
        return [
            'last_updated' => $lastUpdated->toISOString(),
            'days_since_update' => $daysSinceUpdate,
            'freshness_score' => max(0, 1 - ($daysSinceUpdate / 365)),
            'update_frequency' => $this->faker->randomElement(['daily', 'weekly', 'monthly', 'quarterly', 'annually']),
            'next_review_due' => $this->faker->dateTimeBetween('now', '+6 months')->toISOString()
        ];
    }
    
    private function assessComplianceStatus(string $contentType, array $tags): array
    {
        $complianceStandards = ['gdpr', 'ccpa', 'sox', 'hipaa', 'iso27001'];
        $relevantStandards = $this->faker->randomElements($complianceStandards, $this->faker->numberBetween(0, 3));
        
        return [
            'standards' => $relevantStandards,
            'compliance_score' => $this->faker->randomFloat(2, 0.7, 1.0),
            'last_audit' => $this->faker->optional(0.6)->dateTimeBetween('-1 year', 'now')->toISOString(),
            'next_audit_due' => $this->faker->dateTimeBetween('now', '+1 year')->toISOString(),
            'risk_level' => $this->faker->randomElement(['low', 'medium', 'high'])
        ];
    }
    
    private function generateReviewSchedule(string $contentType, string $status): array
    {
        $reviewFrequencies = [
            'article' => 'quarterly',
            'faq' => 'annually',
            'tutorial' => 'semi_annually',
            'guide' => 'quarterly',
            'reference' => 'annually',
            'policy' => 'annually'
        ];
        
        $frequency = $reviewFrequencies[$contentType] ?? 'quarterly';
        $lastReview = $status === 'published' ? $this->faker->dateTimeBetween('-1 year', 'now') : null;
        
        return [
            'frequency' => $frequency,
            'last_reviewed' => $lastReview?->toISOString(),
            'next_review_due' => $lastReview ? $lastReview->addMonths(match($frequency) {
                'quarterly' => 3,
                'semi_annually' => 6,
                'annually' => 12
            })->toISOString() : null,
            'reviewer_role' => $this->faker->randomElement(['content_editor', 'subject_matter_expert', 'legal_reviewer', 'technical_reviewer'])
        ];
    }
    
    private function determineContentGoals(string $contentType, string $difficultyLevel): array
    {
        $goals = [];
        
        switch ($contentType) {
            case 'article':
                $goals = ['inform', 'educate', 'engage'];
                break;
            case 'faq':
                $goals = ['answer', 'clarify', 'resolve'];
                break;
            case 'tutorial':
                $goals = ['teach', 'guide', 'enable'];
                break;
            case 'guide':
                $goals = ['instruct', 'direct', 'support'];
                break;
            case 'reference':
                $goals = ['document', 'specify', 'clarify'];
                break;
            case 'policy':
                $goals = ['establish', 'define', 'govern'];
                break;
        }
        
        if ($difficultyLevel === 'beginner') {
            $goals[] = 'onboard';
        } elseif ($difficultyLevel === 'expert') {
            $goals[] = 'empower';
        }
        
        return $goals;
    }
    
    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'published',
            'published_at' => $this->faker->dateTimeBetween('-1 year', 'now'),
        ]);
    }
    
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
            'published_at' => null,
        ]);
    }
    
    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'archived',
            'published_at' => $this->faker->dateTimeBetween('-2 years', '-1 year'),
        ]);
    }
    
    public function review(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'review',
            'published_at' => null,
        ]);
    }
    
    public function public(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_public' => true,
            'requires_authentication' => false,
            'access_level' => 'public',
        ]);
    }
    
    public function requiresAuth(): static
    {
        return $this->state(fn (array $attributes) => [
            'requires_authentication' => true,
            'access_level' => 'authenticated',
        ]);
    }
    
    public function premium(): static
    {
        return $this->state(fn (array $attributes) => [
            'access_level' => 'premium',
            'requires_authentication' => true,
        ]);
    }
    
    public function adminOnly(): static
    {
        return $this->state(fn (array $attributes) => [
            'access_level' => 'admin',
            'requires_authentication' => true,
            'restricted_roles' => ['admin', 'super_admin'],
        ]);
    }
    
    public function aiTrainable(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_ai_trainable' => true,
            'ai_processing_priority' => $this->faker->numberBetween(1, 5),
            'ai_training_data' => $this->generateAiTrainingData($attributes['content_type'] ?? 'article', $attributes['difficulty_level'] ?? 'intermediate'),
        ]);
    }
    
    public function notAiTrainable(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_ai_trainable' => false,
            'ai_processing_priority' => $this->faker->numberBetween(6, 10),
            'ai_training_data' => [],
        ]);
    }
    
    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_public' => true,
            'status' => 'published',
            'view_count' => $this->faker->numberBetween(1000, 50000),
            'rating_average' => $this->faker->randomFloat(1, 4.0, 5.0),
        ]);
    }
    
    public function popular(): static
    {
        return $this->state(fn (array $attributes) => [
            'view_count' => $this->faker->numberBetween(5000, 100000),
            'search_count' => $this->faker->numberBetween(1000, 10000),
            'bookmark_count' => $this->faker->numberBetween(100, 1000),
            'share_count' => $this->faker->numberBetween(50, 500),
        ]);
    }
    
    public function new(): static
    {
        return $this->state(fn (array $attributes) => [
            'view_count' => $this->faker->numberBetween(0, 100),
            'search_count' => $this->faker->numberBetween(0, 50),
            'bookmark_count' => 0,
            'share_count' => 0,
            'rating_count' => 0,
        ]);
    }
    
    public function highQuality(): static
    {
        return $this->state(fn (array $attributes) => [
            'content_score' => $this->faker->randomFloat(2, 0.9, 1.0),
            'readability_score' => $this->faker->randomFloat(2, 0.8, 1.0),
            'seo_score' => $this->faker->randomFloat(2, 0.8, 1.0),
            'rating_average' => $this->faker->randomFloat(1, 4.0, 5.0),
        ]);
    }
    
    public function needsReview(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'review',
            'content_score' => $this->faker->randomFloat(2, 0.6, 0.8),
            'readability_score' => $this->faker->randomFloat(2, 0.5, 0.8),
            'seo_score' => $this->faker->randomFloat(2, 0.5, 0.8),
        ]);
    }
}
