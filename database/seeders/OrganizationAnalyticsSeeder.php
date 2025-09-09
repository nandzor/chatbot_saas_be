<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OrganizationAnalyticsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all organizations
        $organizations = DB::table('organizations')->get();

        if ($organizations->isEmpty()) {
            $this->command->info('No organizations found. Please run organization seeder first.');
            return;
        }

        $this->command->info('Seeding analytics data for ' . $organizations->count() . ' organizations...');

        foreach ($organizations as $organization) {
            $this->seedOrganizationAnalytics($organization->id);
        }

        $this->command->info('Analytics data seeded successfully!');
    }

    private function seedOrganizationAnalytics($organizationId)
    {
        // Generate analytics data for the last 30 days
        $endDate = Carbon::now();
        $startDate = $endDate->copy()->subDays(30);

        // Generate daily analytics data
        for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
            $this->insertDailyAnalytics($organizationId, $date);
        }

        // Generate user activity data
        $this->insertUserActivity($organizationId);

        // Generate conversation data
        $this->insertConversationData($organizationId);

        // Generate revenue data
        $this->insertRevenueData($organizationId);
    }

    private function insertDailyAnalytics($organizationId, $date)
    {
        $baseUsers = rand(10, 100);
        $baseConversations = rand(50, 500);
        $baseRevenue = rand(100, 1000);

        // Add some variation based on day of week
        $dayOfWeek = $date->dayOfWeek;
        $multiplier = $dayOfWeek >= 1 && $dayOfWeek <= 5 ? 1.2 : 0.8; // Higher on weekdays

        $data = [
            'organization_id' => $organizationId,
            'date' => $date->format('Y-m-d'),
            'total_users' => (int)($baseUsers * $multiplier),
            'active_users' => (int)($baseUsers * $multiplier * 0.7),
            'new_users' => rand(0, 5),
            'total_conversations' => (int)($baseConversations * $multiplier),
            'completed_conversations' => (int)($baseConversations * $multiplier * 0.85),
            'avg_response_time' => rand(1, 10),
            'satisfaction_score' => round(rand(30, 50) / 10, 1),
            'revenue' => (int)($baseRevenue * $multiplier),
            'created_at' => now(),
            'updated_at' => now(),
        ];

        DB::table('organization_analytics')->upsert($data, ['organization_id', 'date'], [
            'total_users', 'active_users', 'new_users', 'total_conversations',
            'completed_conversations', 'avg_response_time', 'satisfaction_score',
            'revenue', 'updated_at'
        ]);
    }

    private function insertUserActivity($organizationId)
    {
        $activities = [
            'user_login',
            'user_logout',
            'conversation_started',
            'conversation_ended',
            'message_sent',
            'file_uploaded',
            'settings_updated',
            'profile_updated'
        ];

        $users = DB::table('users')->where('organization_id', $organizationId)->get();

        foreach ($users as $user) {
            $activityCount = rand(5, 20);

            for ($i = 0; $i < $activityCount; $i++) {
                $activity = $activities[array_rand($activities)];
                $timestamp = Carbon::now()->subDays(rand(0, 30))->subHours(rand(0, 23))->subMinutes(rand(0, 59));

                DB::table('user_activities')->insert([
                    'organization_id' => $organizationId,
                    'user_id' => $user->id,
                    'activity_type' => $activity,
                    'activity_data' => json_encode(['timestamp' => $timestamp->toISOString()]),
                    'ip_address' => '127.0.0.1',
                    'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ]);
            }
        }
    }

    private function insertConversationData($organizationId)
    {
        // Skip conversation data for now as tables don't exist
        // This would be implemented when conversation tables are available
        return;
    }

    private function insertRevenueData($organizationId)
    {
        $revenueCount = rand(5, 20);

        for ($i = 0; $i < $revenueCount; $i++) {
            $transactionDate = Carbon::now()->subDays(rand(0, 30))->subHours(rand(0, 23));

            DB::table('revenue_transactions')->insert([
                'organization_id' => $organizationId,
                'transaction_type' => 'subscription',
                'amount' => rand(1000, 10000) / 100, // $10.00 to $100.00
                'currency' => 'USD',
                'status' => 'completed',
                'transaction_date' => $transactionDate,
                'description' => 'Monthly subscription payment',
                'created_at' => $transactionDate,
                'updated_at' => $transactionDate,
            ]);
        }
    }
}
