<?php

namespace Database\Seeders;

use App\Models\AiModel;
use App\Models\Organization;
use Illuminate\Database\Seeder;

class AiModelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🤖 Seeding AI Models...');

        // Get existing organizations
        $organizations = Organization::all();

        if ($organizations->isEmpty()) {
            $this->command->warn('No organizations found. Please run OrganizationSeeder first.');
            return;
        }

        foreach ($organizations as $organization) {
            $this->createAiModelsForOrganization($organization);
        }

        $this->command->info('✅ AI Models seeded successfully!');
    }

    private function createAiModelsForOrganization(Organization $organization): void
    {
        $this->command->info("   Creating AI models for organization: {$organization->name}");

        // Create 3-5 AI models per organization
        $count = rand(3, 5);

        // Create default model
        AiModel::factory(1)
            ->default()
            ->gpt35Turbo()
            ->create([
                'organization_id' => $organization->id,
                'name' => 'Default Assistant',
                'is_default' => true,
            ]);

        // Create GPT-4 model
        AiModel::factory(1)
            ->gpt4()
            ->highPerformance()
            ->create([
                'organization_id' => $organization->id,
                'name' => 'Advanced Assistant',
                'is_default' => false,
            ]);

        // Create Claude model
        AiModel::factory(1)
            ->claude3Sonnet()
            ->create([
                'organization_id' => $organization->id,
                'name' => 'Claude Assistant',
                'is_default' => false,
            ]);

        // Create Gemini model
        AiModel::factory(1)
            ->geminiPro()
            ->costOptimized()
            ->create([
                'organization_id' => $organization->id,
                'name' => 'Gemini Assistant',
                'is_default' => false,
            ]);

        // Create custom model
        AiModel::factory(1)
            ->custom()
            ->create([
                'organization_id' => $organization->id,
                'name' => 'Custom Assistant',
                'is_default' => false,
            ]);

        $totalModels = AiModel::where('organization_id', $organization->id)->count();
        $this->command->info("   ✓ Created {$totalModels} AI models for {$organization->name}");
    }
}
