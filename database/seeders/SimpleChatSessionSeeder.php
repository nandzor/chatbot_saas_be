<?php

namespace Database\Seeders;

use App\Models\BotPersonality;
use App\Models\ChatSession;
use App\Models\Customer;
use App\Models\Organization;
use Illuminate\Database\Seeder;

class SimpleChatSessionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🌱 Seeding Simple Chat Sessions...');

        // Get first organization that has customers
        $organization = Organization::whereHas('customers')->first();

        if (!$organization) {
            $this->command->warn('No organizations found. Please run OrganizationSeeder first.');
            return;
        }

        // Get customers for this organization
        $customers = Customer::where('organization_id', $organization->id)->get();

        if ($customers->isEmpty()) {
            $this->command->warn("No customers found for organization: {$organization->name}");
            return;
        }

        // Get bot personalities (use any organization that has them)
        $botPersonalities = BotPersonality::first();

        if (!$botPersonalities) {
            $this->command->warn("No bot personalities found. Please run SimpleBotPersonalitySeeder first.");
            return;
        }

        // Get channel config
        $channelConfig = \App\Models\ChannelConfig::first();

        if (!$channelConfig) {
            $this->command->warn("No channel configs found. Please create one first.");
            return;
        }

        $this->createSessionsForOrganization($organization, $customers, $botPersonalities, $channelConfig);

        $this->command->info('✅ Simple Chat Sessions seeded successfully!');
    }

    private function createSessionsForOrganization(Organization $organization, $customers, $botPersonalities, $channelConfig): void
    {
        $this->command->info("   Creating sessions for organization: {$organization->name}");

        // Create diverse session types
        $this->createActiveSessions($organization, $customers, $botPersonalities, $channelConfig);
        $this->createRecentSessions($organization, $customers, $botPersonalities, $channelConfig);
        $this->createResolvedSessions($organization, $customers, $botPersonalities, $channelConfig);
        $this->createHighPrioritySessions($organization, $customers, $botPersonalities, $channelConfig);
        $this->createBotSessions($organization, $customers, $botPersonalities, $channelConfig);
        $this->createSatisfactionSessions($organization, $customers, $botPersonalities, $channelConfig);
        $this->createTechnicalSessions($organization, $customers, $botPersonalities, $channelConfig);
        $this->createVipSessions($organization, $customers, $botPersonalities, $channelConfig);
        $this->createUrgentSessions($organization, $customers, $botPersonalities, $channelConfig);

        $totalSessions = ChatSession::where('organization_id', $organization->id)->count();
        $this->command->info("   ✓ Created {$totalSessions} total sessions for {$organization->name}");
    }

    private function createActiveSessions(Organization $organization, $customers, $botPersonalities, $channelConfig): void
    {
        // 5-10 active sessions
        $count = rand(5, 10);
        for ($i = 0; $i < $count; $i++) {
            ChatSession::create([
                'organization_id' => $organization->id,
                'customer_id' => $customers->random()->id,
                'channel_config_id' => $channelConfig->id,
                'agent_id' => null,
                'session_token' => 'sess_' . uniqid(),
                'session_type' => 'customer_initiated',
                'started_at' => now()->subMinutes(rand(1, 60))->addSeconds(rand(0, 59)),
                'ended_at' => null,
                'last_activity_at' => now()->subMinutes(rand(1, 30)),
                'first_response_at' => now()->subMinutes(rand(1, 15)),
                'is_active' => true,
                'is_bot_session' => true,
                'handover_reason' => null,
                'handover_at' => null,
                'total_messages' => rand(5, 25),
                'customer_messages' => rand(3, 15),
                'bot_messages' => rand(2, 10),
                'agent_messages' => 0,
                'response_time_avg' => rand(30, 120),
                'resolution_time' => null,
                'wait_time' => rand(0, 300),
                'satisfaction_rating' => null,
                'feedback_text' => null,
                'feedback_tags' => null,
                'csat_submitted_at' => null,
                'intent' => $this->getRandomIntent(),
                'category' => $this->getRandomCategory(),
                'subcategory' => $this->getRandomSubcategory(),
                'priority' => $this->getRandomPriority(),
                'tags' => $this->getRandomTags(),
                'is_resolved' => false,
                'resolved_at' => null,
                'resolution_type' => null,
                'resolution_notes' => null,
                'sentiment_analysis' => $this->getRandomSentimentAnalysis(),
                'ai_summary' => $this->getRandomSummary(),
                'topics_discussed' => $this->getRandomTopics(),
                'session_data' => $this->getRandomSessionData(),
                'metadata' => $this->getRandomMetadata(),
            ]);
        }
    }

    private function createRecentSessions(Organization $organization, $customers, $botPersonalities, $channelConfig): void
    {
        // 15-25 recent sessions (last 7 days)
        $count = rand(15, 25);
        for ($i = 0; $i < $count; $i++) {
            $startedAt = now()->subDays(rand(1, 7))->addMinutes(rand(0, 59));
            $endedAt = $startedAt->copy()->addMinutes(rand(10, 120));

            ChatSession::create([
                'organization_id' => $organization->id,
                'customer_id' => $customers->random()->id,
                'channel_config_id' => $channelConfig->id,
                'agent_id' => null,
                'session_token' => 'sess_' . uniqid(),
                'session_type' => 'customer_initiated',
                'started_at' => $startedAt,
                'ended_at' => $endedAt,
                'last_activity_at' => $endedAt,
                'first_response_at' => $startedAt->copy()->addMinutes(rand(1, 5)),
                'is_active' => false,
                'is_bot_session' => true,
                'handover_reason' => null,
                'handover_at' => null,
                'total_messages' => rand(8, 35),
                'customer_messages' => rand(4, 20),
                'bot_messages' => rand(4, 15),
                'agent_messages' => 0,
                'response_time_avg' => rand(45, 180),
                'resolution_time' => $endedAt->diffInMinutes($startedAt),
                'wait_time' => rand(0, 600),
                'satisfaction_rating' => rand(1, 5),
                'feedback_text' => $this->getRandomFeedback(),
                'feedback_tags' => $this->getRandomFeedbackTags(),
                'csat_submitted_at' => $endedAt->copy()->addMinutes(rand(1, 30)),
                'intent' => $this->getRandomIntent(),
                'category' => $this->getRandomCategory(),
                'subcategory' => $this->getRandomSubcategory(),
                'priority' => $this->getRandomPriority(),
                'tags' => $this->getRandomTags(),
                'is_resolved' => rand(0, 1) ? true : false,
                'resolved_at' => rand(0, 1) ? $endedAt->copy()->addMinutes(rand(1, 10)) : null,
                'resolution_type' => $this->getRandomResolutionType(),
                'resolution_notes' => $this->getRandomResolutionNotes(),
                'sentiment_analysis' => $this->getRandomSentimentAnalysis(),
                'ai_summary' => $this->getRandomSummary(),
                'topics_discussed' => $this->getRandomTopics(),
                'session_data' => $this->getRandomSessionData(),
                'metadata' => $this->getRandomMetadata(),
            ]);
        }
    }

    private function createResolvedSessions(Organization $organization, $customers, $botPersonalities, $channelConfig): void
    {
        // 20-30 resolved sessions
        $count = rand(20, 30);
        for ($i = 0; $i < $count; $i++) {
            $startedAt = now()->subDays(rand(1, 30))->addMinutes(rand(0, 59))->addSeconds(rand(0, 59));
            $endedAt = $startedAt->copy()->addMinutes(rand(15, 180));
            $resolvedAt = $endedAt->copy()->addMinutes(rand(1, 30));

            ChatSession::create([
                'organization_id' => $organization->id,
                'customer_id' => $customers->random()->id,
                'channel_config_id' => $channelConfig->id,
                'agent_id' => null,
                'session_token' => 'sess_' . uniqid(),
                'session_type' => 'customer_initiated',
                'started_at' => $startedAt,
                'ended_at' => $endedAt,
                'last_activity_at' => $endedAt,
                'first_response_at' => $startedAt->copy()->addMinutes(rand(1, 5)),
                'is_active' => false,
                'is_bot_session' => true,
                'handover_reason' => null,
                'handover_at' => null,
                'total_messages' => rand(10, 40),
                'customer_messages' => rand(5, 25),
                'bot_messages' => rand(5, 15),
                'agent_messages' => 0,
                'response_time_avg' => rand(30, 150),
                'resolution_time' => $endedAt->diffInMinutes($startedAt),
                'wait_time' => rand(0, 300),
                'satisfaction_rating' => rand(3, 5),
                'feedback_text' => $this->getRandomFeedback(),
                'feedback_tags' => $this->getRandomFeedbackTags(),
                'csat_submitted_at' => $resolvedAt,
                'intent' => $this->getRandomIntent(),
                'category' => $this->getRandomCategory(),
                'subcategory' => $this->getRandomSubcategory(),
                'priority' => $this->getRandomPriority(),
                'tags' => $this->getRandomTags(),
                'is_resolved' => true,
                'resolved_at' => $resolvedAt,
                'resolution_type' => $this->getRandomResolutionType(),
                'resolution_notes' => $this->getRandomResolutionNotes(),
                'sentiment_analysis' => $this->getRandomSentimentAnalysis(),
                'ai_summary' => $this->getRandomSummary(),
                'topics_discussed' => $this->getRandomTopics(),
                'session_data' => $this->getRandomSessionData(),
                'metadata' => $this->getRandomMetadata(),
            ]);
        }
    }

    private function createHighPrioritySessions(Organization $organization, $customers, $botPersonalities, $channelConfig): void
    {
        // 8-12 high priority sessions
        $count = rand(8, 12);
        for ($i = 0; $i < $count; $i++) {
            ChatSession::create([
                'organization_id' => $organization->id,
                'customer_id' => $customers->random()->id,
                'channel_config_id' => $channelConfig->id,
                'agent_id' => null,
                'session_token' => 'sess_' . uniqid(),
                'session_type' => 'customer_initiated',
                'started_at' => now()->subHours(rand(1, 24))->addMinutes(rand(0, 59))->addSeconds(rand(0, 59)),
                'ended_at' => rand(0, 1) ? now()->subMinutes(rand(1, 60)) : null,
                'last_activity_at' => now()->subMinutes(rand(1, 30)),
                'first_response_at' => now()->subMinutes(rand(1, 5)),
                'is_active' => rand(0, 1) ? true : false,
                'is_bot_session' => true,
                'handover_reason' => null,
                'handover_at' => null,
                'total_messages' => rand(8, 30),
                'customer_messages' => rand(4, 18),
                'bot_messages' => rand(4, 12),
                'agent_messages' => 0,
                'response_time_avg' => rand(15, 60), // faster response
                'resolution_time' => null,
                'wait_time' => rand(0, 120),
                'satisfaction_rating' => null,
                'feedback_text' => null,
                'feedback_tags' => null,
                'csat_submitted_at' => null,
                'intent' => $this->getRandomIntent(),
                'category' => $this->getRandomCategory(),
                'subcategory' => $this->getRandomSubcategory(),
                'priority' => 'high',
                'tags' => array_merge($this->getRandomTags(), ['high_priority']),
                'is_resolved' => false,
                'resolved_at' => null,
                'resolution_type' => null,
                'resolution_notes' => null,
                'sentiment_analysis' => $this->getRandomSentimentAnalysis(),
                'ai_summary' => $this->getRandomSummary(),
                'topics_discussed' => $this->getRandomTopics(),
                'session_data' => $this->getRandomSessionData(),
                'metadata' => $this->getRandomMetadata(),
            ]);
        }
    }

    private function createBotSessions(Organization $organization, $customers, $botPersonalities, $channelConfig): void
    {
        // 25-35 bot sessions
        $count = rand(25, 35);
        for ($i = 0; $i < $count; $i++) {
            $startedAt = now()->subDays(rand(1, 14))->addMinutes(rand(0, 59))->addSeconds(rand(0, 59));
            $endedAt = rand(0, 1) ? $startedAt->copy()->addMinutes(rand(10, 90)) : null;

            ChatSession::create([
                'organization_id' => $organization->id,
                'customer_id' => $customers->random()->id,
                'channel_config_id' => $channelConfig->id,
                'agent_id' => null,
                'session_token' => 'sess_' . uniqid(),
                'session_type' => 'bot_initiated',
                'started_at' => $startedAt,
                'ended_at' => $endedAt,
                'last_activity_at' => $endedAt ?? now()->subMinutes(rand(1, 60)),
                'first_response_at' => $startedAt->copy()->addMinutes(rand(1, 3)),
                'is_active' => $endedAt ? false : true,
                'is_bot_session' => true,
                'handover_reason' => null,
                'handover_at' => null,
                'total_messages' => rand(6, 25),
                'customer_messages' => rand(3, 15),
                'bot_messages' => rand(3, 10),
                'agent_messages' => 0,
                'response_time_avg' => rand(20, 90),
                'resolution_time' => $endedAt ? $endedAt->diffInMinutes($startedAt) : null,
                'wait_time' => rand(0, 180),
                'satisfaction_rating' => $endedAt ? rand(1, 5) : null,
                'feedback_text' => $endedAt ? $this->getRandomFeedback() : null,
                'feedback_tags' => $endedAt ? $this->getRandomFeedbackTags() : null,
                'csat_submitted_at' => $endedAt ? $endedAt->copy()->addMinutes(rand(1, 15)) : null,
                'intent' => $this->getRandomIntent(),
                'category' => $this->getRandomCategory(),
                'subcategory' => $this->getRandomSubcategory(),
                'priority' => $this->getRandomPriority(),
                'tags' => $this->getRandomTags(),
                'is_resolved' => $endedAt ? rand(0, 1) : false,
                'resolved_at' => $endedAt ? ($endedAt->copy()->addMinutes(rand(1, 10))) : null,
                'resolution_type' => $endedAt ? $this->getRandomResolutionType() : null,
                'resolution_notes' => $endedAt ? $this->getRandomResolutionNotes() : null,
                'sentiment_analysis' => $this->getRandomSentimentAnalysis(),
                'ai_summary' => $this->getRandomSummary(),
                'topics_discussed' => $this->getRandomTopics(),
                'session_data' => $this->getRandomSessionData(),
                'metadata' => $this->getRandomMetadata(),
            ]);
        }
    }

    private function createSatisfactionSessions(Organization $organization, $customers, $botPersonalities, $channelConfig): void
    {
        // 10-15 high satisfaction sessions
        $count = rand(10, 15);
        for ($i = 0; $i < $count; $i++) {
            $startedAt = now()->subDays(rand(1, 21))->addMinutes(rand(0, 59))->addSeconds(rand(0, 59));
            $endedAt = $startedAt->copy()->addMinutes(rand(20, 120));

            ChatSession::create([
                'organization_id' => $organization->id,
                'customer_id' => $customers->random()->id,
                'channel_config_id' => $channelConfig->id,
                'agent_id' => null,
                'session_token' => 'sess_' . uniqid(),
                'session_type' => 'customer_initiated',
                'started_at' => $startedAt,
                'ended_at' => $endedAt,
                'last_activity_at' => $endedAt,
                'first_response_at' => $startedAt->copy()->addMinutes(rand(1, 3)),
                'is_active' => false,
                'is_bot_session' => true,
                'handover_reason' => null,
                'handover_at' => null,
                'total_messages' => rand(12, 35),
                'customer_messages' => rand(6, 20),
                'bot_messages' => rand(6, 15),
                'agent_messages' => 0,
                'response_time_avg' => rand(20, 80),
                'resolution_time' => $endedAt->diffInMinutes($startedAt),
                'wait_time' => rand(0, 120),
                'satisfaction_rating' => rand(4, 5),
                'feedback_text' => $this->getHighSatisfactionFeedback(),
                'feedback_tags' => ['helpful', 'quick_response', 'friendly'],
                'csat_submitted_at' => $endedAt->copy()->addMinutes(rand(1, 20)),
                'intent' => $this->getRandomIntent(),
                'category' => $this->getRandomCategory(),
                'subcategory' => $this->getRandomSubcategory(),
                'priority' => $this->getRandomPriority(),
                'tags' => $this->getRandomTags(),
                'is_resolved' => true,
                'resolved_at' => $endedAt->copy()->addMinutes(rand(1, 10)),
                'resolution_type' => 'agent_resolved',
                'resolution_notes' => 'Customer issue resolved successfully',
                'sentiment_analysis' => [
                    'overall_sentiment' => 'positive',
                    'sentiment_score' => rand(50, 100) / 100,
                    'emotion_detected' => 'satisfied',
                    'confidence' => rand(80, 100) / 100,
                    'analysis_timestamp' => now()->toISOString(),
                ],
                'ai_summary' => $this->getRandomSummary(),
                'topics_discussed' => $this->getRandomTopics(),
                'session_data' => $this->getRandomSessionData(),
                'metadata' => $this->getRandomMetadata(),
            ]);
        }
    }

    private function createTechnicalSessions(Organization $organization, $customers, $botPersonalities, $channelConfig): void
    {
        // 12-18 technical sessions
        $count = rand(12, 18);
        for ($i = 0; $i < $count; $i++) {
            $startedAt = now()->subDays(rand(1, 14))->addMinutes(rand(0, 59))->addSeconds(rand(0, 59));
            $endedAt = $startedAt->copy()->addMinutes(rand(30, 180));

            ChatSession::create([
                'organization_id' => $organization->id,
                'customer_id' => $customers->random()->id,
                'channel_config_id' => $channelConfig->id,
                'agent_id' => null,
                'session_token' => 'sess_' . uniqid(),
                'session_type' => 'customer_initiated',
                'started_at' => $startedAt,
                'ended_at' => $endedAt,
                'last_activity_at' => $endedAt,
                'first_response_at' => $startedAt->copy()->addMinutes(rand(1, 5)),
                'is_active' => false,
                'is_bot_session' => true,
                'handover_reason' => null,
                'handover_at' => null,
                'total_messages' => rand(15, 40),
                'customer_messages' => rand(8, 25),
                'bot_messages' => rand(7, 15),
                'agent_messages' => 0,
                'response_time_avg' => rand(60, 200),
                'resolution_time' => $endedAt->diffInMinutes($startedAt),
                'wait_time' => rand(0, 300),
                'satisfaction_rating' => rand(2, 5),
                'feedback_text' => $this->getRandomFeedback(),
                'feedback_tags' => $this->getRandomFeedbackTags(),
                'csat_submitted_at' => $endedAt->copy()->addMinutes(rand(1, 30)),
                'intent' => 'technical_help',
                'category' => 'technical',
                'subcategory' => $this->getRandomSubcategory(),
                'priority' => $this->getRandomPriority(),
                'tags' => array_merge($this->getRandomTags(), ['technical']),
                'is_resolved' => rand(0, 1) ? true : false,
                'resolved_at' => rand(0, 1) ? $endedAt->copy()->addMinutes(rand(1, 15)) : null,
                'resolution_type' => $this->getRandomResolutionType(),
                'resolution_notes' => $this->getRandomResolutionNotes(),
                'sentiment_analysis' => $this->getRandomSentimentAnalysis(),
                'ai_summary' => $this->getRandomSummary(),
                'topics_discussed' => ['technical_problem', 'troubleshooting'],
                'session_data' => $this->getRandomSessionData(),
                'metadata' => $this->getRandomMetadata(),
            ]);
        }
    }

    private function createVipSessions(Organization $organization, $customers, $botPersonalities, $channelConfig): void
    {
        // 5-8 VIP customer sessions
        $count = rand(5, 8);
        for ($i = 0; $i < $count; $i++) {
            $startedAt = now()->subDays(rand(1, 7))->addMinutes(rand(0, 59))->addSeconds(rand(0, 59));
            $endedAt = $startedAt->copy()->addMinutes(rand(15, 90));

            ChatSession::create([
                'organization_id' => $organization->id,
                'customer_id' => $customers->random()->id,
                'channel_config_id' => $channelConfig->id,
                'agent_id' => null,
                'session_token' => 'sess_' . uniqid(),
                'session_type' => 'customer_initiated',
                'started_at' => $startedAt,
                'ended_at' => $endedAt,
                'last_activity_at' => $endedAt,
                'first_response_at' => $startedAt->copy()->addMinutes(rand(1, 2)),
                'is_active' => false,
                'is_bot_session' => true,
                'handover_reason' => null,
                'handover_at' => null,
                'total_messages' => rand(10, 30),
                'customer_messages' => rand(5, 18),
                'bot_messages' => rand(5, 12),
                'agent_messages' => 0,
                'response_time_avg' => rand(15, 60),
                'resolution_time' => $endedAt->diffInMinutes($startedAt),
                'wait_time' => rand(0, 60),
                'satisfaction_rating' => rand(4, 5),
                'feedback_text' => $this->getHighSatisfactionFeedback(),
                'feedback_tags' => ['vip_customer', 'excellent_service'],
                'csat_submitted_at' => $endedAt->copy()->addMinutes(rand(1, 10)),
                'intent' => $this->getRandomIntent(),
                'category' => $this->getRandomCategory(),
                'subcategory' => $this->getRandomSubcategory(),
                'priority' => rand(0, 1) ? 'high' : 'urgent',
                'tags' => array_merge($this->getRandomTags(), ['vip_customer']),
                'is_resolved' => true,
                'resolved_at' => $endedAt->copy()->addMinutes(rand(1, 5)),
                'resolution_type' => 'agent_resolved',
                'resolution_notes' => 'VIP customer issue resolved with priority',
                'sentiment_analysis' => [
                    'overall_sentiment' => 'positive',
                    'sentiment_score' => rand(70, 100) / 100,
                    'emotion_detected' => 'satisfied',
                    'confidence' => rand(85, 100) / 100,
                    'analysis_timestamp' => now()->toISOString(),
                ],
                'ai_summary' => $this->getRandomSummary(),
                'topics_discussed' => $this->getRandomTopics(),
                'session_data' => $this->getRandomSessionData(),
                'metadata' => $this->getRandomMetadata(),
            ]);
        }
    }

    private function createUrgentSessions(Organization $organization, $customers, $botPersonalities, $channelConfig): void
    {
        // 3-6 urgent sessions
        $count = rand(3, 6);
        for ($i = 0; $i < $count; $i++) {
            $startedAt = now()->subHours(rand(1, 12))->addMinutes(rand(0, 59))->addSeconds(rand(0, 59));
            $endedAt = rand(0, 1) ? $startedAt->copy()->addMinutes(rand(5, 60)) : null;

            ChatSession::create([
                'organization_id' => $organization->id,
                'customer_id' => $customers->random()->id,
                'channel_config_id' => $channelConfig->id,
                'agent_id' => null,
                'session_token' => 'sess_' . uniqid(),
                'session_type' => 'customer_initiated',
                'started_at' => $startedAt,
                'ended_at' => $endedAt,
                'last_activity_at' => $endedAt ?? now()->subMinutes(rand(1, 30)),
                'first_response_at' => $startedAt->copy()->addMinutes(rand(1, 2)),
                'is_active' => $endedAt ? false : true,
                'is_bot_session' => true,
                'handover_reason' => null,
                'handover_at' => null,
                'total_messages' => rand(8, 25),
                'customer_messages' => rand(4, 15),
                'bot_messages' => rand(4, 10),
                'agent_messages' => 0,
                'response_time_avg' => rand(10, 45),
                'resolution_time' => $endedAt ? $endedAt->diffInMinutes($startedAt) : null,
                'wait_time' => rand(0, 30),
                'satisfaction_rating' => $endedAt ? rand(1, 5) : null,
                'feedback_text' => $endedAt ? $this->getRandomFeedback() : null,
                'feedback_tags' => $endedAt ? $this->getRandomFeedbackTags() : null,
                'csat_submitted_at' => $endedAt ? $endedAt->copy()->addMinutes(rand(1, 10)) : null,
                'intent' => $this->getRandomIntent(),
                'category' => $this->getRandomCategory(),
                'subcategory' => $this->getRandomSubcategory(),
                'priority' => 'urgent',
                'tags' => array_merge($this->getRandomTags(), ['urgent']),
                'is_resolved' => $endedAt ? rand(0, 1) : false,
                'resolved_at' => $endedAt ? ($endedAt->copy()->addMinutes(rand(1, 5))) : null,
                'resolution_type' => $endedAt ? $this->getRandomResolutionType() : null,
                'resolution_notes' => $endedAt ? $this->getRandomResolutionNotes() : null,
                'sentiment_analysis' => $this->getRandomSentimentAnalysis(),
                'ai_summary' => $this->getRandomSummary(),
                'topics_discussed' => $this->getRandomTopics(),
                'session_data' => $this->getRandomSessionData(),
                'metadata' => $this->getRandomMetadata(),
            ]);
        }
    }

    // Helper methods for generating random data
    private function getRandomIntent(): string
    {
        $intents = ['support', 'information', 'complaint', 'compliment', 'purchase_inquiry', 'technical_help', 'billing_question', 'general_inquiry'];
        return $intents[array_rand($intents)];
    }

    private function getRandomCategory(): string
    {
        $categories = ['general', 'technical', 'billing', 'product', 'service', 'complaint'];
        return $categories[array_rand($categories)];
    }

    private function getRandomSubcategory(): string
    {
        $subcategories = ['account_issue', 'payment_problem', 'feature_request', 'bug_report', 'how_to'];
        return $subcategories[array_rand($subcategories)];
    }

    private function getRandomPriority(): string
    {
        $priorities = ['low', 'normal', 'high', 'urgent'];
        return $priorities[array_rand($priorities)];
    }

    private function getRandomTags(): array
    {
        $allTags = ['urgent', 'vip_customer', 'technical', 'billing', 'follow_up_needed', 'escalated', 'resolved', 'pending'];
        $count = rand(0, 3);
        if ($count === 0) {
            return [];
        }
        $selectedKeys = array_rand(array_flip($allTags), $count);
        return is_array($selectedKeys) ? $selectedKeys : [$selectedKeys];
    }

    private function getRandomFeedback(): string
    {
        $feedbacks = [
            'Very helpful and quick response!',
            'Excellent service, thank you!',
            'Problem solved quickly and efficiently.',
            'Great customer service experience.',
            'Could be better, but acceptable.',
            'Slow response time.',
            'Not very helpful.',
            'Good service overall.',
        ];
        return $feedbacks[array_rand($feedbacks)];
    }

    private function getHighSatisfactionFeedback(): string
    {
        $feedbacks = [
            'Outstanding service! Very helpful and professional.',
            'Excellent! Problem solved quickly and efficiently.',
            'Amazing customer service! Thank you so much.',
            'Perfect! Exactly what I needed.',
            'Fantastic support! Highly recommended.',
        ];
        return $feedbacks[array_rand($feedbacks)];
    }

    private function getRandomFeedbackTags(): array
    {
        $allTags = ['helpful', 'quick_response', 'knowledgeable', 'friendly', 'patient', 'slow_response', 'unhelpful', 'rude', 'unclear'];
        $count = rand(0, 3);
        if ($count === 0) {
            return [];
        }
        $selectedKeys = array_rand(array_flip($allTags), $count);
        return is_array($selectedKeys) ? $selectedKeys : [$selectedKeys];
    }

    private function getRandomResolutionType(): string
    {
        $types = ['self_service', 'agent_resolved', 'escalated', 'transferred', 'abandoned'];
        return $types[array_rand($types)];
    }

    private function getRandomResolutionNotes(): string
    {
        $notes = [
            'Customer issue resolved successfully',
            'Problem fixed with provided solution',
            'Escalated to technical team',
            'Customer satisfied with resolution',
            'Issue resolved after escalation',
        ];
        return $notes[array_rand($notes)];
    }

    private function getRandomSentimentAnalysis(): array
    {
        $sentiments = ['positive', 'negative', 'neutral'];
        $emotions = ['happy', 'frustrated', 'confused', 'satisfied', 'angry'];
        $sentiment = $sentiments[array_rand($sentiments)];

        return [
            'overall_sentiment' => $sentiment,
            'sentiment_score' => rand(-100, 100) / 100,
            'emotion_detected' => $emotions[array_rand($emotions)],
            'confidence' => rand(50, 100) / 100,
            'analysis_timestamp' => now()->toISOString(),
        ];
    }

    private function getRandomSummary(): string
    {
        $summaries = [
            'Customer inquired about product features and pricing.',
            'Technical issue reported and resolved.',
            'Billing question answered successfully.',
            'General information provided about services.',
            'Complaint handled and resolved.',
        ];
        return $summaries[array_rand($summaries)];
    }

    private function getRandomTopics(): array
    {
        $allTopics = ['account_setup', 'payment_issue', 'technical_problem', 'feature_question', 'billing_inquiry', 'product_information', 'service_complaint'];
        $count = rand(1, 3);
        $selectedKeys = array_rand(array_flip($allTopics), $count);
        return is_array($selectedKeys) ? $selectedKeys : [$selectedKeys];
    }

    private function getRandomSessionData(): array
    {
        return [
            'browser' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'device' => ['desktop', 'mobile', 'tablet'][array_rand(['desktop', 'mobile', 'tablet'])],
            'referrer' => 'https://example.com',
            'utm_source' => ['google', 'facebook', 'direct'][array_rand(['google', 'facebook', 'direct'])],
        ];
    }

    private function getRandomMetadata(): array
    {
        return [
            'created_via' => ['widget', 'api', 'mobile_app'][array_rand(['widget', 'api', 'mobile_app'])],
            'session_quality' => ['good', 'average', 'poor'][array_rand(['good', 'average', 'poor'])],
            'automated_actions' => ['knowledge_base_suggested', 'agent_assigned', 'escalation_triggered'],
        ];
    }
}
