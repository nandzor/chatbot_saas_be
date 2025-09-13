<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\OrganizationAnalytics;
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
        $organizations = Organization::all();

        if ($organizations->isEmpty()) {
            $this->command->warn('No organizations found. Please run OrganizationSeeder first.');
            return;
        }

        foreach ($organizations as $organization) {
            $this->createAnalyticsForOrganization($organization);
        }

        $this->command->info('Organization analytics seeded successfully.');
    }

    /**
     * Create analytics data for a specific organization
     */
    private function createAnalyticsForOrganization(Organization $organization): void
    {
        // Generate analytics data for the last 30 days
        $startDate = Carbon::now()->subDays(30);
        $endDate = Carbon::now();

        $analyticsData = [];

        for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
            // Generate realistic analytics data with some randomness
            $baseUsers = rand(50, 200);
            $baseConversations = rand(100, 500);
            $baseRevenue = rand(100, 1000);

            // Add some variation based on day of week (weekends typically lower)
            $dayMultiplier = in_array($date->dayOfWeek, [0, 6]) ? 0.7 : 1.0;

            $analyticsData[] = [
                'id' => \Illuminate\Support\Str::uuid(),
                'organization_id' => $organization->id,
                'date' => $date->format('Y-m-d'),
                'total_users' => (int)($baseUsers * $dayMultiplier),
                'active_users' => (int)($baseUsers * $dayMultiplier * rand(60, 90) / 100),
                'new_users' => (int)($baseUsers * $dayMultiplier * rand(5, 15) / 100),
                'total_conversations' => (int)($baseConversations * $dayMultiplier),
                'completed_conversations' => (int)($baseConversations * $dayMultiplier * rand(80, 95) / 100),
                'avg_response_time' => rand(30, 300) / 10, // 3.0 to 30.0 seconds
                'satisfaction_score' => rand(35, 50) / 10, // 3.5 to 5.0
                'revenue' => $baseRevenue * $dayMultiplier,
                'created_at' => now(),
                'updated_at' => now()
            ];
        }

        // Insert analytics data in batches, skipping duplicates
        $chunks = array_chunk($analyticsData, 100);
        $insertedCount = 0;
        foreach ($chunks as $chunk) {
            foreach ($chunk as $data) {
                // Check if analytics data already exists for this date
                $exists = DB::table('organization_analytics')
                    ->where('organization_id', $data['organization_id'])
                    ->where('date', $data['date'])
                    ->exists();

                if (!$exists) {
                    DB::table('organization_analytics')->insert($data);
                    $insertedCount++;
                }
            }
        }

        $this->command->info("Created {$insertedCount} new analytics records for organization: {$organization->name}");
    }

    /**
     * Alternative method to create more detailed analytics data
     */
    private function createDetailedAnalyticsForOrganization(Organization $organization): void
    {
        // Generate analytics data for the last 30 days with more detailed metrics
        $startDate = Carbon::now()->subDays(30);
        $endDate = Carbon::now();

        $analyticsData = [];

        for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
            // Generate realistic analytics data with trends
            $dayOfWeek = $date->dayOfWeek;
            $isWeekend = in_array($dayOfWeek, [0, 6]);

            // Base metrics with weekend adjustment
            $weekendMultiplier = $isWeekend ? 0.6 : 1.0;

            $totalUsers = (int)(rand(100, 300) * $weekendMultiplier);
            $activeUsers = (int)($totalUsers * rand(70, 90) / 100);
            $newUsers = (int)($totalUsers * rand(8, 20) / 100);

            $totalConversations = (int)(rand(200, 800) * $weekendMultiplier);
            $completedConversations = (int)($totalConversations * rand(85, 98) / 100);

            // Response time varies by day (better on weekdays)
            $avgResponseTime = $isWeekend ? rand(40, 60) / 10 : rand(20, 40) / 10;

            // Satisfaction score with slight variation
            $satisfactionScore = rand(38, 48) / 10;

            // Revenue with business day variation
            $revenue = $isWeekend ? rand(50, 200) : rand(200, 800);

            $analyticsData[] = [
                'id' => \Illuminate\Support\Str::uuid(),
                'organization_id' => $organization->id,
                'date' => $date->format('Y-m-d'),
                'total_users' => $totalUsers,
                'active_users' => $activeUsers,
                'new_users' => $newUsers,
                'total_conversations' => $totalConversations,
                'completed_conversations' => $completedConversations,
                'avg_response_time' => $avgResponseTime,
                'satisfaction_score' => $satisfactionScore,
                'revenue' => $revenue,
                'created_at' => now(),
                'updated_at' => now()
            ];
        }

        // Insert analytics data in batches, skipping duplicates
        $chunks = array_chunk($analyticsData, 100);
        $insertedCount = 0;
        foreach ($chunks as $chunk) {
            foreach ($chunk as $data) {
                // Check if analytics data already exists for this date
                $exists = DB::table('organization_analytics')
                    ->where('organization_id', $data['organization_id'])
                    ->where('date', $data['date'])
                    ->exists();

                if (!$exists) {
                    DB::table('organization_analytics')->insert($data);
                    $insertedCount++;
                }
            }
        }

        $this->command->info("Created {$insertedCount} new detailed analytics records for organization: {$organization->name}");
    }

    /**
     * Create analytics data with specific patterns for testing
     */
    private function createPatternBasedAnalytics(Organization $organization): void
    {
        $patterns = [
            'growth' => ['start' => 100, 'end' => 500, 'trend' => 'up'],
            'stable' => ['start' => 200, 'end' => 200, 'trend' => 'flat'],
            'decline' => ['start' => 400, 'end' => 200, 'trend' => 'down'],
            'seasonal' => ['start' => 200, 'end' => 200, 'trend' => 'seasonal']
        ];

        $selectedPattern = $patterns[array_rand($patterns)];

        $startDate = Carbon::now()->subDays(30);
        $endDate = Carbon::now();
        $totalDays = $startDate->diffInDays($endDate);

        $analyticsData = [];

        for ($i = 0; $i <= $totalDays; $i++) {
            $date = $startDate->copy()->addDays($i);

            // Calculate value based on pattern
            $progress = $totalDays > 0 ? $i / $totalDays : 0;

            switch ($selectedPattern['trend']) {
                case 'up':
                    $baseValue = $selectedPattern['start'] + ($selectedPattern['end'] - $selectedPattern['start']) * $progress;
                    break;
                case 'down':
                    $baseValue = $selectedPattern['start'] - ($selectedPattern['start'] - $selectedPattern['end']) * $progress;
                    break;
                case 'seasonal':
                    $baseValue = $selectedPattern['start'] + sin($progress * 2 * pi()) * 50;
                    break;
                default:
                    $baseValue = $selectedPattern['start'];
            }

            $analyticsData[] = [
                'id' => \Illuminate\Support\Str::uuid(),
                'organization_id' => $organization->id,
                'date' => $date->format('Y-m-d'),
                'total_users' => (int)($baseValue + rand(-20, 20)),
                'active_users' => (int)($baseValue * rand(70, 90) / 100),
                'new_users' => (int)($baseValue * rand(5, 15) / 100),
                'total_conversations' => (int)($baseValue * rand(2, 4)),
                'completed_conversations' => (int)($baseValue * rand(2, 4) * rand(85, 95) / 100),
                'avg_response_time' => rand(20, 50) / 10,
                'satisfaction_score' => rand(35, 50) / 10,
                'revenue' => $baseValue * rand(1, 3),
                'created_at' => now(),
                'updated_at' => now()
            ];
        }

        // Insert analytics data, skipping duplicates
        $chunks = array_chunk($analyticsData, 100);
        $insertedCount = 0;
        foreach ($chunks as $chunk) {
            foreach ($chunk as $data) {
                // Check if analytics data already exists for this date
                $exists = DB::table('organization_analytics')
                    ->where('organization_id', $data['organization_id'])
                    ->where('date', $data['date'])
                    ->exists();

                if (!$exists) {
                    DB::table('organization_analytics')->insert($data);
                    $insertedCount++;
                }
            }
        }

        $this->command->info("Created {$insertedCount} new pattern-based analytics records ({$selectedPattern['trend']}) for organization: {$organization->name}");
    }
}
