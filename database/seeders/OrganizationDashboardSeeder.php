<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Organization;
use App\Models\User;
use App\Models\ChatSession;
use App\Models\Message;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class OrganizationDashboardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create a test organization
        $organization = Organization::first();
        if (!$organization) {
            $organization = Organization::create([
                'id' => '845e49a7-87db-4eb8-a5b6-6c077d0be712',
                'name' => 'Test Organization',
                'slug' => 'test-org',
                'description' => 'Test organization for dashboard',
                'settings' => json_encode(['timezone' => 'UTC']),
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Get existing agents for sessions
        $agents = \App\Models\Agent::where('organization_id', $organization->id)->limit(5)->get();
        if ($agents->isEmpty()) {
            // Create test agents if none exist
            for ($i = 1; $i <= 5; $i++) {
                $agent = \App\Models\Agent::create([
                    'id' => \Illuminate\Support\Str::uuid(),
                    'organization_id' => $organization->id,
                    'name' => "Agent {$i}",
                    'email' => "agent{$i}@test.com",
                    'status' => 'active',
                    'created_at' => now()->subDays(30),
                    'updated_at' => now(),
                ]);
                $agents->push($agent);
            }
        }

        // Create admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@test.com'],
            [
                'id' => '5b968a06-08b3-4d45-8f3a-8096fa1c8b9d',
                'username' => 'admin',
                'full_name' => 'Test Admin',
                'email' => 'admin@test.com',
                'password_hash' => bcrypt('password'),
                'organization_id' => $organization->id,
                'role' => 'org_admin',
                'status' => 'active',
                'last_login_at' => now()->subMinutes(5),
                'created_at' => now()->subDays(30),
                'updated_at' => now(),
            ]
        );

        // Get existing customer for sessions
        $customer = \App\Models\Customer::where('organization_id', $organization->id)->first();
        if (!$customer) {
            $customer = \App\Models\Customer::create([
                'id' => \Illuminate\Support\Str::uuid(),
                'organization_id' => $organization->id,
                'name' => 'Test Customer',
                'email' => 'customer@test.com',
                'phone' => '+1234567890',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Get existing channel config for sessions
        $channelConfig = \App\Models\ChannelConfig::where('organization_id', $organization->id)->first();
        if (!$channelConfig) {
            $channelConfig = \App\Models\ChannelConfig::create([
                'id' => \Illuminate\Support\Str::uuid(),
                'organization_id' => $organization->id,
                'name' => 'Test Channel',
                'type' => 'web',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Clear existing sessions and messages for clean data
        DB::table('messages')->where('organization_id', $organization->id)->delete();
        DB::table('chat_sessions')->where('organization_id', $organization->id)->delete();

        // Create sessions for the last 24 hours
        $sessions = [];
        $now = now();

        // Create sessions for each hour of the last 24 hours
        for ($hour = 0; $hour < 24; $hour++) {
            $sessionTime = $now->copy()->subHours($hour);
            $hourKey = $sessionTime->format('H:i');

            // Random number of sessions per hour (0-25)
            $sessionCount = rand(0, 25);

            for ($i = 0; $i < $sessionCount; $i++) {
                $sessionStartTime = $sessionTime->copy()->addMinutes($i * 2 + rand(0, 1)); // Make each session unique
                $session = ChatSession::create([
                    'id' => \Illuminate\Support\Str::uuid(),
                    'organization_id' => $organization->id,
                    'customer_id' => $customer->id,
                    'channel_config_id' => $channelConfig->id,
                    'agent_id' => null, // Bot sessions
                    'session_token' => \Illuminate\Support\Str::random(32),
                    'session_type' => 'bot',
                    'started_at' => $sessionStartTime,
                    'ended_at' => $sessionStartTime->copy()->addMinutes(rand(1, 30)),
                    'last_activity_at' => $sessionStartTime->copy()->addMinutes(rand(1, 30)),
                    'is_active' => false,
                    'is_bot_session' => true,
                    'handover_at' => rand(0, 1) ? $sessionTime->copy()->addMinutes(rand(5, 15)) : null, // 50% handover
                    'satisfaction_rating' => rand(0, 1) ? rand(3, 5) : null, // 50% have satisfaction
                    'total_messages' => rand(3, 15),
                    'customer_messages' => rand(1, 8),
                    'bot_messages' => rand(1, 8),
                    'agent_messages' => 0,
                    'created_at' => $sessionStartTime,
                    'updated_at' => $sessionStartTime,
                ]);
                $sessions[] = $session;
            }
        }

        // Create some agent sessions (handover sessions)
        $agentSessions = [];
        foreach ($sessions as $session) {
            if ($session->handover_at) {
                // Create agent session
                $agentSession = ChatSession::create([
                    'id' => \Illuminate\Support\Str::uuid(),
                    'organization_id' => $organization->id,
                    'customer_id' => $customer->id,
                    'channel_config_id' => $channelConfig->id,
                    'agent_id' => $agents->random()->id,
                    'session_token' => \Illuminate\Support\Str::random(32),
                    'session_type' => 'agent',
                    'started_at' => $session->handover_at,
                    'ended_at' => $session->handover_at->copy()->addMinutes(rand(5, 20)),
                    'last_activity_at' => $session->handover_at->copy()->addMinutes(rand(5, 20)),
                    'is_active' => false,
                    'is_bot_session' => false,
                    'handover_at' => null,
                    'satisfaction_rating' => rand(3, 5),
                    'total_messages' => rand(3, 10),
                    'customer_messages' => rand(1, 5),
                    'bot_messages' => 0,
                    'agent_messages' => rand(1, 5),
                    'created_at' => $session->handover_at,
                    'updated_at' => $session->handover_at,
                ]);
                $agentSessions[] = $agentSession;
            }
        }

        // Create messages for sessions
        $allSessions = array_merge($sessions, $agentSessions);
        $intents = [
            'Customer Support',
            'Technical Support',
            'Product Inquiry',
            'Billing Question',
            'Account Access',
            'General Information',
            'Complaint',
            'Feedback'
        ];

        foreach ($allSessions as $session) {
            // Create messages for this session
            $messageCount = rand(3, 15);
            $isBotSession = $session->user_id === null;

            for ($i = 0; $i < $messageCount; $i++) {
                $messageTime = $session->started_at->copy()->addMinutes($i * 2);

                // Alternate between user and bot/agent messages
                $isUserMessage = $i % 2 === 0;

                Message::create([
                    'id' => \Illuminate\Support\Str::uuid(),
                    'organization_id' => $organization->id,
                    'session_id' => $session->id,
                    'user_id' => $isUserMessage ? null : $session->agent_id,
                    'content' => $isUserMessage ?
                        $this->getUserMessage() :
                        $this->getBotAgentMessage($isBotSession),
                    'role' => $isUserMessage ? 'user' : ($isBotSession ? 'bot' : 'agent'),
                    'metadata' => json_encode([
                        'intent' => $intents[array_rand($intents)],
                        'confidence' => rand(70, 95) / 100,
                        'waha_message_id' => 'waha_' . \Illuminate\Support\Str::random(10),
                    ]),
                    'created_at' => $messageTime,
                    'updated_at' => $messageTime,
                ]);
            }
        }

        // Create some recent sessions for real-time data
        for ($i = 0; $i < 44; $i++) {
            $recentTime = now()->subMinutes($i + rand(1, 2)); // Make each session unique
            ChatSession::create([
                'id' => \Illuminate\Support\Str::uuid(),
                'organization_id' => $organization->id,
                'customer_id' => $customer->id,
                'channel_config_id' => $channelConfig->id,
                'agent_id' => null,
                'session_token' => \Illuminate\Support\Str::random(32),
                'session_type' => 'bot',
                'started_at' => $recentTime,
                'ended_at' => null,
                'last_activity_at' => $recentTime,
                'is_active' => true,
                'is_bot_session' => true,
                'handover_at' => null,
                'satisfaction_rating' => null,
                'total_messages' => rand(1, 5),
                'customer_messages' => rand(1, 3),
                'bot_messages' => rand(1, 3),
                'agent_messages' => 0,
                'created_at' => $recentTime,
                'updated_at' => $recentTime,
            ]);
        }

        $this->command->info('Organization Dashboard seeder completed successfully!');
        $this->command->info("Created {$organization->name} with:");
        $this->command->info("- " . $agents->count() . " agents");
        $this->command->info("- " . count($sessions) . " bot sessions");
        $this->command->info("- " . count($agentSessions) . " agent sessions");
        $this->command->info("- 44 active sessions for real-time data");
        $this->command->info("- Messages with various intents");
    }

    private function getUserMessage(): string
    {
        $messages = [
            "Hello, I need help with my account",
            "I'm having trouble logging in",
            "Can you help me with billing?",
            "I want to know about your products",
            "I have a technical issue",
            "How do I reset my password?",
            "I need to update my information",
            "Can you explain your pricing?",
            "I'm not satisfied with the service",
            "Thank you for your help"
        ];
        return $messages[array_rand($messages)];
    }

    private function getBotAgentMessage(bool $isBot): string
    {
        if ($isBot) {
            $messages = [
                "Hello! I'm here to help you. How can I assist you today?",
                "I understand your concern. Let me help you with that.",
                "I can help you with that. Let me check your account.",
                "I'm processing your request. Please wait a moment.",
                "I've found the information you need.",
                "I'm transferring you to a human agent for better assistance.",
                "Thank you for contacting us. Have a great day!",
                "I'm sorry, I need to transfer you to a specialist.",
                "I can see your account details. Let me help you.",
                "Is there anything else I can help you with?"
            ];
        } else {
            $messages = [
                "Hello! I'm a human agent. How can I help you today?",
                "I understand your issue. Let me resolve this for you.",
                "I can see your account. Let me make those changes.",
                "I've updated your information. Is there anything else?",
                "I've resolved your technical issue. Please try again.",
                "I've processed your billing request.",
                "Thank you for your patience. Your issue is now resolved.",
                "I've escalated this to our technical team.",
                "I can help you with that. Let me check our system.",
                "Is there anything else I can assist you with?"
            ];
        }
        return $messages[array_rand($messages)];
    }
}
