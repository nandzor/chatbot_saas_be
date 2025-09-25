<?php

namespace Database\Seeders;

use App\Models\AiModel;
use App\Models\BotPersonality;
use App\Models\Organization;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BotPersonalitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🤖 Seeding Bot Personalities...');

        // Get existing organizations
        $organizations = Organization::all();

        if ($organizations->isEmpty()) {
            $this->command->warn('No organizations found. Please run OrganizationSeeder first.');
            return;
        }

        foreach ($organizations as $organization) {
            $this->createPersonalitiesForOrganization($organization);
        }

        $this->command->info('✅ Bot Personalities seeded successfully!');
    }

    private function createPersonalitiesForOrganization(Organization $organization): void
    {
        $this->command->info("   Creating personalities for organization: {$organization->name}");

        // Get AI models for this organization
        $aiModels = AiModel::where('organization_id', $organization->id)->get();

        if ($aiModels->isEmpty()) {
            $this->command->warn("   Skipping {$organization->name} - no AI models found");
            return;
        }

        // Create diverse personality types
        $this->createDefaultPersonalities($organization, $aiModels);
        $this->createHighPerformancePersonalities($organization, $aiModels);
        $this->createLanguageSpecificPersonalities($organization, $aiModels);
        $this->createSpecializedPersonalities($organization, $aiModels);
        $this->createLowPerformancePersonalities($organization, $aiModels);
        $this->createInactivePersonalities($organization, $aiModels);

        $totalPersonalities = BotPersonality::where('organization_id', $organization->id)->count();
        $this->command->info("   ✓ Created {$totalPersonalities} personalities for {$organization->name}");
    }

    private function createDefaultPersonalities(Organization $organization, $aiModels): void
    {
        // 2-3 default personalities per organization
        $count = rand(2, 3);
        BotPersonality::factory($count)
            ->active()
            ->create([
                'organization_id' => $organization->id,
                'ai_model_id' => $aiModels->random()->id,
                'is_default' => true,
                'status' => 'active',
            ]);
    }

    private function createHighPerformancePersonalities(Organization $organization, $aiModels): void
    {
        // 3-5 high performance personalities
        $count = rand(3, 5);
        BotPersonality::factory($count)
            ->highPerformance()
            ->active()
            ->create([
                'organization_id' => $organization->id,
                'ai_model_id' => $aiModels->random()->id,
                'is_default' => false,
            ]);
    }

    private function createLanguageSpecificPersonalities(Organization $organization, $aiModels): void
    {
        // Indonesian personalities
        BotPersonality::factory(2)
            ->indonesian()
            ->active()
            ->create([
                'organization_id' => $organization->id,
                'ai_model_id' => $aiModels->random()->id,
                'name' => 'Asisten Indonesia ' . uniqid(),
            ]);

        // English personalities
        BotPersonality::factory(2)
            ->english()
            ->active()
            ->create([
                'organization_id' => $organization->id,
                'ai_model_id' => $aiModels->random()->id,
                'name' => 'English Assistant ' . uniqid(),
            ]);

        // Professional personalities
        BotPersonality::factory(2)
            ->professional()
            ->active()
            ->create([
                'organization_id' => $organization->id,
                'ai_model_id' => $aiModels->random()->id,
                'name' => 'Professional Bot ' . uniqid(),
            ]);

        // Friendly personalities
        BotPersonality::factory(2)
            ->friendly()
            ->active()
            ->create([
                'organization_id' => $organization->id,
                'ai_model_id' => $aiModels->random()->id,
                'name' => 'Friendly Bot ' . uniqid(),
            ]);
    }

    private function createSpecializedPersonalities(Organization $organization, $aiModels): void
    {
        // Customer Support Bot
        BotPersonality::factory(1)
            ->active()
            ->create([
                'organization_id' => $organization->id,
                'ai_model_id' => $aiModels->random()->id,
                'name' => 'Customer Support Bot',
                'code' => 'customer_support',
                'display_name' => 'Customer Support Assistant',
                'description' => 'Specialized bot for handling customer support inquiries and issues',
                'tone' => 'empathetic',
                'communication_style' => 'supportive',
                'formality_level' => 'semi-formal',
                'personality_traits' => ['empathetic', 'patient', 'helpful', 'understanding', 'solution-oriented'],
                'intent' => 'customer_support',
                'category' => 'support',
                'priority' => 'high',
            ]);

        // Sales Bot
        BotPersonality::factory(1)
            ->active()
            ->create([
                'organization_id' => $organization->id,
                'ai_model_id' => $aiModels->random()->id,
                'name' => 'Sales Bot',
                'code' => 'sales_bot',
                'display_name' => 'Sales Assistant',
                'description' => 'Bot specialized in sales inquiries and product recommendations',
                'tone' => 'enthusiastic',
                'communication_style' => 'persuasive',
                'formality_level' => 'semi-formal',
                'personality_traits' => ['enthusiastic', 'persuasive', 'knowledgeable', 'confident', 'results-oriented'],
                'intent' => 'sales',
                'category' => 'sales',
                'priority' => 'high',
            ]);

        // Technical Support Bot
        BotPersonality::factory(1)
            ->active()
            ->create([
                'organization_id' => $organization->id,
                'ai_model_id' => $aiModels->random()->id,
                'name' => 'Technical Support Bot',
                'code' => 'tech_support',
                'display_name' => 'Technical Support Assistant',
                'description' => 'Bot specialized in technical support and troubleshooting',
                'tone' => 'technical',
                'communication_style' => 'analytical',
                'formality_level' => 'formal',
                'personality_traits' => ['technical', 'precise', 'methodical', 'detailed', 'problem-solving'],
                'intent' => 'technical_help',
                'category' => 'technical',
                'priority' => 'high',
            ]);

        // General Information Bot
        BotPersonality::factory(1)
            ->active()
            ->create([
                'organization_id' => $organization->id,
                'ai_model_id' => $aiModels->random()->id,
                'name' => 'Information Bot',
                'code' => 'info_bot',
                'display_name' => 'Information Assistant',
                'description' => 'Bot for providing general information and answering FAQs',
                'tone' => 'friendly',
                'communication_style' => 'informative',
                'formality_level' => 'semi-formal',
                'personality_traits' => ['informative', 'clear', 'helpful', 'knowledgeable', 'accessible'],
                'intent' => 'information',
                'category' => 'general',
                'priority' => 'normal',
            ]);
    }

    private function createLowPerformancePersonalities(Organization $organization, $aiModels): void
    {
        // 2-3 low performance personalities for testing
        $count = rand(2, 3);
        BotPersonality::factory($count)
            ->lowPerformance()
            ->active()
            ->create([
                'organization_id' => $organization->id,
                'ai_model_id' => $aiModels->random()->id,
                'name' => 'Test Bot ' . uniqid(),
                'description' => 'Low performance bot for testing purposes',
            ]);
    }

    private function createInactivePersonalities(Organization $organization, $aiModels): void
    {
        // 1-2 inactive personalities
        $count = rand(1, 2);
        BotPersonality::factory($count)
            ->inactive()
            ->create([
                'organization_id' => $organization->id,
                'ai_model_id' => $aiModels->random()->id,
                'name' => 'Inactive Bot ' . uniqid(),
                'description' => 'Inactive bot for testing purposes',
            ]);
    }
}
