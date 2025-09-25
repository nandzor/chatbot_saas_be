<?php

namespace Database\Seeders;

use App\Models\Agent;
use App\Models\ChannelConfig;
use App\Models\ChatSession;
use App\Models\Customer;
use App\Models\Organization;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ChatSessionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🌱 Seeding Chat Sessions...');

        // Get existing organizations
        $organizations = Organization::all();
        
        if ($organizations->isEmpty()) {
            $this->command->warn('No organizations found. Please run OrganizationSeeder first.');
            return;
        }

        foreach ($organizations as $organization) {
            $this->createSessionsForOrganization($organization);
        }

        $this->command->info('✅ Chat Sessions seeded successfully!');
    }

    private function createSessionsForOrganization(Organization $organization): void
    {
        $this->command->info("   Creating sessions for organization: {$organization->name}");

        // Get related data
        $customers = Customer::where('organization_id', $organization->id)->get();
        $agents = Agent::where('organization_id', $organization->id)->get();
        $channelConfigs = ChannelConfig::where('organization_id', $organization->id)->get();

        if ($customers->isEmpty() || $channelConfigs->isEmpty()) {
            $this->command->warn("   Skipping {$organization->name} - missing customers or channel configs");
            return;
        }

        // Create diverse session types
        $this->createActiveSessions($organization, $customers, $agents, $channelConfigs);
        $this->createRecentSessions($organization, $customers, $agents, $channelConfigs);
        $this->createResolvedSessions($organization, $customers, $agents, $channelConfigs);
        $this->createHighPrioritySessions($organization, $customers, $agents, $channelConfigs);
        $this->createBotSessions($organization, $customers, $channelConfigs);
        $this->createAgentSessions($organization, $customers, $agents, $channelConfigs);
        $this->createSatisfactionSessions($organization, $customers, $agents, $channelConfigs);
        $this->createTechnicalSessions($organization, $customers, $agents, $channelConfigs);
        $this->createVipSessions($organization, $customers, $agents, $channelConfigs);
        $this->createUrgentSessions($organization, $customers, $agents, $channelConfigs);

        $totalSessions = ChatSession::where('organization_id', $organization->id)->count();
        $this->command->info("   ✓ Created {$totalSessions} total sessions for {$organization->name}");
    }

    private function createActiveSessions(Organization $organization, $customers, $agents, $channelConfigs): void
    {
        // 5-10 active sessions
        $count = rand(5, 10);
        ChatSession::factory($count)
            ->active()
            ->create([
                'organization_id' => $organization->id,
                'customer_id' => $customers->random()->id,
                'channel_config_id' => $channelConfigs->random()->id,
                'agent_id' => $agents->isNotEmpty() ? $agents->random()->id : null,
                'last_activity_at' => now()->subMinutes(rand(1, 60)),
            ]);
    }

    private function createRecentSessions(Organization $organization, $customers, $agents, $channelConfigs): void
    {
        // 15-25 recent sessions (last 7 days)
        $count = rand(15, 25);
        ChatSession::factory($count)
            ->create([
                'organization_id' => $organization->id,
                'customer_id' => $customers->random()->id,
                'channel_config_id' => $channelConfigs->random()->id,
                'agent_id' => $agents->isNotEmpty() ? $agents->random()->id : null,
                'started_at' => now()->subDays(rand(1, 7)),
                'ended_at' => now()->subHours(rand(1, 24)),
                'is_active' => false,
            ]);
    }

    private function createResolvedSessions(Organization $organization, $customers, $agents, $channelConfigs): void
    {
        // 20-30 resolved sessions
        $count = rand(20, 30);
        ChatSession::factory($count)
            ->resolved()
            ->create([
                'organization_id' => $organization->id,
                'customer_id' => $customers->random()->id,
                'channel_config_id' => $channelConfigs->random()->id,
                'agent_id' => $agents->isNotEmpty() ? $agents->random()->id : null,
                'started_at' => now()->subDays(rand(1, 30)),
            ]);
    }

    private function createHighPrioritySessions(Organization $organization, $customers, $agents, $channelConfigs): void
    {
        // 8-12 high priority sessions
        $count = rand(8, 12);
        ChatSession::factory($count)
            ->create([
                'organization_id' => $organization->id,
                'customer_id' => $customers->random()->id,
                'channel_config_id' => $channelConfigs->random()->id,
                'agent_id' => $agents->isNotEmpty() ? $agents->random()->id : null,
                'priority' => 'high',
                'tags' => ['high_priority', 'escalated'],
                'response_time_avg' => rand(30, 120), // faster response
            ]);
    }

    private function createBotSessions(Organization $organization, $customers, $channelConfigs): void
    {
        // 25-35 bot sessions
        $count = rand(25, 35);
        ChatSession::factory($count)
            ->botSession()
            ->create([
                'organization_id' => $organization->id,
                'customer_id' => $customers->random()->id,
                'channel_config_id' => $channelConfigs->random()->id,
                'session_type' => 'bot_initiated',
            ]);
    }

    private function createAgentSessions(Organization $organization, $customers, $agents, $channelConfigs): void
    {
        if ($agents->isEmpty()) return;

        // 15-20 agent sessions
        $count = rand(15, 20);
        ChatSession::factory($count)
            ->agentSession()
            ->create([
                'organization_id' => $organization->id,
                'customer_id' => $customers->random()->id,
                'channel_config_id' => $channelConfigs->random()->id,
                'agent_id' => $agents->random()->id,
                'session_type' => 'agent_initiated',
            ]);
    }

    private function createSatisfactionSessions(Organization $organization, $customers, $agents, $channelConfigs): void
    {
        // 10-15 high satisfaction sessions
        $count = rand(10, 15);
        ChatSession::factory($count)
            ->withHighSatisfaction()
            ->resolved()
            ->create([
                'organization_id' => $organization->id,
                'customer_id' => $customers->random()->id,
                'channel_config_id' => $channelConfigs->random()->id,
                'agent_id' => $agents->isNotEmpty() ? $agents->random()->id : null,
            ]);

        // 5-8 low satisfaction sessions
        $count = rand(5, 8);
        ChatSession::factory($count)
            ->withLowSatisfaction()
            ->resolved()
            ->create([
                'organization_id' => $organization->id,
                'customer_id' => $customers->random()->id,
                'channel_config_id' => $channelConfigs->random()->id,
                'agent_id' => $agents->isNotEmpty() ? $agents->random()->id : null,
            ]);
    }

    private function createTechnicalSessions(Organization $organization, $customers, $agents, $channelConfigs): void
    {
        // 12-18 technical sessions
        $count = rand(12, 18);
        ChatSession::factory($count)
            ->technical()
            ->create([
                'organization_id' => $organization->id,
                'customer_id' => $customers->random()->id,
                'channel_config_id' => $channelConfigs->random()->id,
                'agent_id' => $agents->isNotEmpty() ? $agents->random()->id : null,
                'category' => 'technical',
                'intent' => 'technical_help',
            ]);
    }

    private function createVipSessions(Organization $organization, $customers, $agents, $channelConfigs): void
    {
        // 5-8 VIP customer sessions
        $count = rand(5, 8);
        ChatSession::factory($count)
            ->vipCustomer()
            ->create([
                'organization_id' => $organization->id,
                'customer_id' => $customers->random()->id,
                'channel_config_id' => $channelConfigs->random()->id,
                'agent_id' => $agents->isNotEmpty() ? $agents->random()->id : null,
            ]);
    }

    private function createUrgentSessions(Organization $organization, $customers, $agents, $channelConfigs): void
    {
        // 3-6 urgent sessions
        $count = rand(3, 6);
        ChatSession::factory($count)
            ->urgent()
            ->create([
                'organization_id' => $organization->id,
                'customer_id' => $customers->random()->id,
                'channel_config_id' => $channelConfigs->random()->id,
                'agent_id' => $agents->isNotEmpty() ? $agents->random()->id : null,
                'priority' => 'urgent',
                'is_active' => rand(0, 1) ? true : false,
            ]);
    }
}
