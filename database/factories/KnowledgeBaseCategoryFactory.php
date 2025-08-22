<?php

namespace Database\Factories;

use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\KnowledgeBaseCategory>
 */
class KnowledgeBaseCategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categoryNames = [
            'General FAQ', 'Technical Support', 'Product Information', 'Service Policies',
            'Getting Started', 'Troubleshooting', 'Best Practices', 'Security & Privacy',
            'Billing & Payments', 'Account Management', 'API Documentation', 'Integration Guides',
            'Training & Tutorials', 'Release Notes', 'Community Guidelines', 'Legal Information',
            'Contact Information', 'Emergency Procedures', 'Maintenance Schedules', 'Performance Tips'
        ];
        
        $categoryName = $this->faker->unique()->randomElement($categoryNames);
        $slug = Str::slug($categoryName);
        
        $icons = [
            'help-circle', 'settings', 'package', 'shield', 'play', 'tool', 'star', 'lock',
            'credit-card', 'user', 'code', 'link', 'book-open', 'download', 'users', 'file-text',
            'phone', 'alert-triangle', 'clock', 'trending-up'
        ];
        
        $colors = [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4',
            '#84CC16', '#F97316', '#EC4899', '#6366F1', '#14B8A6', '#F43F5E'
        ];
        
        $contentTypes = [
            'General FAQ' => ['supports_articles' => true, 'supports_qa' => true, 'supports_faq' => true],
            'Technical Support' => ['supports_articles' => true, 'supports_qa' => true, 'supports_faq' => false],
            'Product Information' => ['supports_articles' => true, 'supports_qa' => false, 'supports_faq' => false],
            'Service Policies' => ['supports_articles' => true, 'supports_qa' => true, 'supports_faq' => true],
            'Getting Started' => ['supports_articles' => true, 'supports_qa' => false, 'supports_faq' => false],
            'Troubleshooting' => ['supports_articles' => true, 'supports_qa' => true, 'supports_faq' => false],
            'Best Practices' => ['supports_articles' => true, 'supports_qa' => false, 'supports_faq' => false],
            'Security & Privacy' => ['supports_articles' => true, 'supports_qa' => true, 'supports_faq' => true],
            'Billing & Payments' => ['supports_articles' => true, 'supports_qa' => true, 'supports_faq' => true],
            'Account Management' => ['supports_articles' => true, 'supports_qa' => true, 'supports_faq' => false],
            'API Documentation' => ['supports_articles' => true, 'supports_qa' => false, 'supports_faq' => false],
            'Integration Guides' => ['supports_articles' => true, 'supports_qa' => false, 'supports_faq' => false],
            'Training & Tutorials' => ['supports_articles' => true, 'supports_qa' => false, 'supports_faq' => false],
            'Release Notes' => ['supports_articles' => true, 'supports_qa' => false, 'supports_faq' => false],
            'Community Guidelines' => ['supports_articles' => true, 'supports_qa' => false, 'supports_faq' => true],
            'Legal Information' => ['supports_articles' => true, 'supports_qa' => false, 'supports_faq' => false],
            'Contact Information' => ['supports_articles' => true, 'supports_qa' => false, 'supports_faq' => false],
            'Emergency Procedures' => ['supports_articles' => true, 'supports_qa' => false, 'supports_faq' => false],
            'Maintenance Schedules' => ['supports_articles' => true, 'supports_qa' => false, 'supports_faq' => false],
            'Performance Tips' => ['supports_articles' => true, 'supports_qa' => true, 'supports_faq' => false]
        ];
        
        $contentTypeConfig = $contentTypes[$categoryName] ?? [
            'supports_articles' => true,
            'supports_qa' => true,
            'supports_faq' => true
        ];
        
        // Generate meta information
        $metaTitle = $categoryName . ' - Help & Support';
        $metaDescription = 'Find answers to common questions about ' . strtolower($categoryName) . '. Get help, learn best practices, and access comprehensive documentation.';
        $metaKeywords = $this->generateMetaKeywords($categoryName);
        
        // Generate AI training configuration
        $aiProcessingPriority = $this->faker->randomElement([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        $isAiTrainable = $aiProcessingPriority <= 7; // Higher priority = more trainable
        
        // Generate category rules for auto-categorization
        $categoryRules = $this->generateCategoryRules($categoryName);
        
        return [
            'organization_id' => Organization::factory(),
            'parent_id' => null, // Will be set by seeder if needed
            'name' => $categoryName,
            'slug' => $slug,
            'description' => $this->generateCategoryDescription($categoryName),
            'icon' => $this->faker->randomElement($icons),
            'color' => $this->faker->randomElement($colors),
            'order_index' => $this->faker->numberBetween(1, 100),
            
            // Visibility & Access
            'is_public' => $this->faker->boolean(90),
            'is_featured' => $this->faker->boolean(20),
            'is_system_category' => $this->faker->boolean(10),
            
            // Content Type Support
            'supports_articles' => $contentTypeConfig['supports_articles'],
            'supports_qa' => $contentTypeConfig['supports_qa'],
            'supports_faq' => $contentTypeConfig['supports_faq'],
            
            // SEO & Frontend
            'meta_title' => $metaTitle,
            'meta_description' => $metaDescription,
            'meta_keywords' => $metaKeywords,
            
            // Statistics & Analytics
            'total_content_count' => $this->faker->numberBetween(0, 100),
            'article_count' => $contentTypeConfig['supports_articles'] ? $this->faker->numberBetween(0, 50) : 0,
            'qa_count' => $contentTypeConfig['supports_qa'] ? $this->faker->numberBetween(0, 30) : 0,
            'view_count' => $this->faker->numberBetween(0, 10000),
            'search_count' => $this->faker->numberBetween(0, 5000),
            
            // AI Training & Processing
            'is_ai_trainable' => $isAiTrainable,
            'ai_category_embeddings' => $isAiTrainable ? $this->generateAiEmbeddings() : [],
            'ai_processing_priority' => $aiProcessingPriority,
            
            // Configuration
            'auto_categorize' => $this->faker->boolean(60),
            'category_rules' => $categoryRules,
            
            // System fields
            'metadata' => [
                'created_by' => 'system',
                'last_updated' => now()->toISOString(),
                'category_type' => $this->determineCategoryType($categoryName),
                'difficulty_level' => $this->determineDifficultyLevel($categoryName),
                'estimated_read_time' => $this->faker->numberBetween(2, 15),
                'tags' => $this->generateCategoryTags($categoryName)
            ],
            'status' => 'active',
        ];
    }
    
    /**
     * Generate category description based on name
     */
    private function generateCategoryDescription(string $categoryName): string
    {
        $descriptions = [
            'General FAQ' => 'Frequently asked questions and general information about our services, policies, and common inquiries.',
            'Technical Support' => 'Technical assistance, troubleshooting guides, and solutions for common technical issues.',
            'Product Information' => 'Comprehensive details about our products, features, specifications, and capabilities.',
            'Service Policies' => 'Information about our service terms, policies, procedures, and guidelines.',
            'Getting Started' => 'Step-by-step guides and tutorials to help you get started with our platform.',
            'Troubleshooting' => 'Solutions and fixes for common problems and error messages you may encounter.',
            'Best Practices' => 'Recommended approaches, tips, and guidelines for optimal usage of our platform.',
            'Security & Privacy' => 'Information about security measures, privacy policies, and data protection.',
            'Billing & Payments' => 'Details about pricing, billing cycles, payment methods, and financial policies.',
            'Account Management' => 'Guidance on managing your account, profile settings, and preferences.',
            'API Documentation' => 'Technical documentation for developers integrating with our platform.',
            'Integration Guides' => 'Step-by-step instructions for integrating our services with other platforms.',
            'Training & Tutorials' => 'Educational content and learning resources to master our platform.',
            'Release Notes' => 'Information about new features, updates, and changes in our platform.',
            'Community Guidelines' => 'Rules and guidelines for participating in our community and forums.',
            'Legal Information' => 'Legal documents, terms of service, and compliance information.',
            'Contact Information' => 'Ways to get in touch with our support team and company representatives.',
            'Emergency Procedures' => 'Critical procedures and contact information for urgent situations.',
            'Maintenance Schedules' => 'Information about planned maintenance, updates, and system downtime.',
            'Performance Tips' => 'Advice and techniques to optimize performance and improve efficiency.'
        ];
        
        return $descriptions[$categoryName] ?? 'Comprehensive information and resources about ' . strtolower($categoryName) . '.';
    }
    
    /**
     * Generate meta keywords based on category name
     */
    private function generateMetaKeywords(string $categoryName): array
    {
        $keywordMappings = [
            'General FAQ' => ['FAQ', 'frequently asked questions', 'help', 'support', 'common questions', 'general information'],
            'Technical Support' => ['technical support', 'troubleshooting', 'help desk', 'technical assistance', 'bug fixes', 'error solutions'],
            'Product Information' => ['product details', 'features', 'specifications', 'product guide', 'product manual', 'product overview'],
            'Service Policies' => ['service terms', 'policies', 'procedures', 'guidelines', 'rules', 'terms of service'],
            'Getting Started' => ['getting started', 'beginner guide', 'first steps', 'onboarding', 'tutorial', 'setup guide'],
            'Troubleshooting' => ['troubleshooting', 'problem solving', 'error fixes', 'bug solutions', 'common issues', 'help'],
            'Best Practices' => ['best practices', 'tips', 'guidelines', 'recommendations', 'optimization', 'efficiency'],
            'Security & Privacy' => ['security', 'privacy', 'data protection', 'cybersecurity', 'confidentiality', 'safety'],
            'Billing & Payments' => ['billing', 'payments', 'pricing', 'invoices', 'payment methods', 'financial'],
            'Account Management' => ['account', 'profile', 'settings', 'preferences', 'user management', 'account settings'],
            'API Documentation' => ['API', 'documentation', 'developer', 'integration', 'technical', 'programming'],
            'Integration Guides' => ['integration', 'setup', 'configuration', 'connectors', 'third-party', 'platforms'],
            'Training & Tutorials' => ['training', 'tutorials', 'learning', 'education', 'courses', 'skill development'],
            'Release Notes' => ['release notes', 'updates', 'changelog', 'new features', 'version history', 'improvements'],
            'Community Guidelines' => ['community', 'guidelines', 'rules', 'forum', 'participation', 'standards'],
            'Legal Information' => ['legal', 'terms', 'compliance', 'regulations', 'law', 'legal documents'],
            'Contact Information' => ['contact', 'support', 'help', 'contact us', 'customer service', 'get help'],
            'Emergency Procedures' => ['emergency', 'urgent', 'critical', 'procedures', 'safety', 'immediate help'],
            'Maintenance Schedules' => ['maintenance', 'schedules', 'downtime', 'updates', 'system maintenance', 'planned maintenance'],
            'Performance Tips' => ['performance', 'optimization', 'efficiency', 'tips', 'best practices', 'improvement']
        ];
        
        return $keywordMappings[$categoryName] ?? [strtolower($categoryName), 'information', 'help', 'support'];
    }
    
    /**
     * Generate AI embeddings for the category
     */
    private function generateAiEmbeddings(): array
    {
        return [
            'vector_model' => 'text-embedding-ada-002',
            'embedding_dimensions' => 1536,
            'last_updated' => now()->toISOString(),
            'training_data_count' => $this->faker->numberBetween(10, 1000),
            'accuracy_score' => $this->faker->randomFloat(2, 0.85, 0.98),
            'similarity_threshold' => $this->faker->randomFloat(2, 0.7, 0.9)
        ];
    }
    
    /**
     * Generate category rules for auto-categorization
     */
    private function generateCategoryRules(string $categoryName): array
    {
        $rules = [
            'keywords' => $this->generateMetaKeywords($categoryName),
            'patterns' => [],
            'exclusions' => [],
            'priority' => $this->faker->randomElement(['low', 'medium', 'high']),
            'confidence_threshold' => $this->faker->randomFloat(2, 0.6, 0.9)
        ];
        
        // Add pattern-based rules for certain categories
        switch ($categoryName) {
            case 'Technical Support':
                $rules['patterns'] = ['error', 'bug', 'issue', 'problem', 'broken', 'not working'];
                $rules['exclusions'] = ['feature request', 'enhancement', 'new feature'];
                break;
            case 'Billing & Payments':
                $rules['patterns'] = ['payment', 'billing', 'invoice', 'charge', 'cost', 'price', 'subscription'];
                $rules['exclusions'] = ['product features', 'technical support'];
                break;
            case 'Security & Privacy':
                $rules['patterns'] = ['security', 'privacy', 'password', 'login', 'authentication', 'encryption'];
                $rules['exclusions'] = ['general questions', 'product features'];
                break;
        }
        
        return $rules;
    }
    
    /**
     * Determine category type based on name
     */
    private function determineCategoryType(string $categoryName): string
    {
        if (in_array($categoryName, ['General FAQ', 'Service Policies', 'Community Guidelines'])) {
            return 'policy';
        } elseif (in_array($categoryName, ['Technical Support', 'Troubleshooting', 'Best Practices'])) {
            return 'support';
        } elseif (in_array($categoryName, ['Product Information', 'API Documentation', 'Integration Guides'])) {
            return 'reference';
        } elseif (in_array($categoryName, ['Getting Started', 'Training & Tutorials'])) {
            return 'educational';
        } elseif (in_array($categoryName, ['Security & Privacy', 'Legal Information'])) {
            return 'compliance';
        } else {
            return 'general';
        }
    }
    
    /**
     * Determine difficulty level based on category name
     */
    private function determineDifficultyLevel(string $categoryName): string
    {
        if (in_array($categoryName, ['Getting Started', 'General FAQ', 'Contact Information'])) {
            return 'basic';
        } elseif (in_array($categoryName, ['Product Information', 'Service Policies', 'Best Practices'])) {
            return 'intermediate';
        } elseif (in_array($categoryName, ['Technical Support', 'Troubleshooting', 'API Documentation'])) {
            return 'advanced';
        } elseif (in_array($categoryName, ['Integration Guides', 'Performance Tips'])) {
            return 'expert';
        } else {
            return 'intermediate';
        }
    }
    
    /**
     * Generate category tags
     */
    private function generateCategoryTags(string $categoryName): array
    {
        $tagMappings = [
            'General FAQ' => ['faq', 'general', 'common', 'help'],
            'Technical Support' => ['technical', 'support', 'help', 'troubleshooting'],
            'Product Information' => ['product', 'features', 'specifications', 'guide'],
            'Service Policies' => ['policies', 'terms', 'service', 'legal'],
            'Getting Started' => ['beginner', 'start', 'onboarding', 'tutorial'],
            'Troubleshooting' => ['troubleshooting', 'problems', 'solutions', 'fixes'],
            'Best Practices' => ['best-practices', 'tips', 'guidelines', 'optimization'],
            'Security & Privacy' => ['security', 'privacy', 'protection', 'safety'],
            'Billing & Payments' => ['billing', 'payments', 'financial', 'pricing'],
            'Account Management' => ['account', 'profile', 'settings', 'management'],
            'API Documentation' => ['api', 'developer', 'technical', 'documentation'],
            'Integration Guides' => ['integration', 'setup', 'configuration', 'connectors'],
            'Training & Tutorials' => ['training', 'tutorials', 'learning', 'education'],
            'Release Notes' => ['releases', 'updates', 'changelog', 'features'],
            'Community Guidelines' => ['community', 'guidelines', 'rules', 'participation'],
            'Legal Information' => ['legal', 'compliance', 'regulations', 'terms'],
            'Contact Information' => ['contact', 'support', 'help', 'customer-service'],
            'Emergency Procedures' => ['emergency', 'urgent', 'critical', 'procedures'],
            'Maintenance Schedules' => ['maintenance', 'schedules', 'downtime', 'updates'],
            'Performance Tips' => ['performance', 'optimization', 'efficiency', 'tips']
        ];
        
        return $tagMappings[$categoryName] ?? [strtolower(str_replace(' ', '-', $categoryName))];
    }
    
    /**
     * Indicate that the category is a parent category.
     */
    public function parent(): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_id' => null,
            'is_system_category' => true,
        ]);
    }
    
    /**
     * Indicate that the category is a child category.
     */
    public function child(): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_id' => null, // Will be set by seeder
        ]);
    }
    
    /**
     * Indicate that the category is featured.
     */
    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
            'order_index' => $this->faker->numberBetween(1, 10),
        ]);
    }
    
    /**
     * Indicate that the category is a system category.
     */
    public function system(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_system_category' => true,
            'is_public' => true,
            'auto_categorize' => true,
        ]);
    }
    
    /**
     * Indicate that the category is public.
     */
    public function public(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_public' => true,
        ]);
    }
    
    /**
     * Indicate that the category is private.
     */
    public function private(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_public' => false,
        ]);
    }
    
    /**
     * Indicate that the category supports articles only.
     */
    public function articlesOnly(): static
    {
        return $this->state(fn (array $attributes) => [
            'supports_articles' => true,
            'supports_qa' => false,
            'supports_faq' => false,
        ]);
    }
    
    /**
     * Indicate that the category supports Q&A only.
     */
    public function qaOnly(): static
    {
        return $this->state(fn (array $attributes) => [
            'supports_articles' => false,
            'supports_qa' => true,
            'supports_faq' => false,
        ]);
    }
    
    /**
     * Indicate that the category supports FAQ only.
     */
    public function faqOnly(): static
    {
        return $this->state(fn (array $attributes) => [
            'supports_articles' => false,
            'supports_qa' => false,
            'supports_faq' => true,
        ]);
    }
    
    /**
     * Indicate that the category is AI trainable.
     */
    public function aiTrainable(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_ai_trainable' => true,
            'ai_processing_priority' => $this->faker->numberBetween(1, 5),
            'ai_category_embeddings' => $this->generateAiEmbeddings(),
        ]);
    }
    
    /**
     * Indicate that the category is not AI trainable.
     */
    public function notAiTrainable(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_ai_trainable' => false,
            'ai_processing_priority' => $this->faker->numberBetween(6, 10),
            'ai_category_embeddings' => [],
        ]);
    }
    
    /**
     * Indicate that the category has auto-categorization enabled.
     */
    public function autoCategorize(): static
    {
        return $this->state(fn (array $attributes) => [
            'auto_categorize' => true,
            'category_rules' => $this->generateCategoryRules($attributes['name'] ?? 'General Category'),
        ]);
    }
    
    /**
     * Indicate that the category is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }
}
