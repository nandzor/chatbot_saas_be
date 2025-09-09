<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Agent>
 */
class AgentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $departments = ['Customer Support', 'Sales', 'Technical Support', 'Billing', 'General'];
        $jobTitles = ['Customer Service Representative', 'Support Agent', 'Technical Specialist', 'Sales Representative', 'Team Lead'];
        $specializations = ['General Support', 'Technical Issues', 'Billing Questions', 'Product Information', 'Account Management'];

        return [
            'user_id' => \App\Models\User::factory(),
            'organization_id' => \App\Models\Organization::factory(),
            'agent_code' => 'AGT' . str_pad($this->faker->numberBetween(1, 999), 3, '0', STR_PAD_LEFT),
            'display_name' => $this->faker->name(),
            'department' => $this->faker->randomElement($departments),
            'job_title' => $this->faker->randomElement($jobTitles),
            'specialization' => $this->faker->randomElements($specializations, $this->faker->numberBetween(1, 3)),
            'bio' => $this->faker->optional(0.7)->paragraph(),
            'max_concurrent_chats' => $this->faker->numberBetween(3, 10),
            'current_active_chats' => $this->faker->numberBetween(0, 5),
            'availability_status' => $this->faker->randomElement(['online', 'offline', 'busy', 'away']),
            'auto_accept_chats' => $this->faker->boolean(60),
            'working_hours' => [
                'monday' => ['start' => '09:00', 'end' => '17:00'],
                'tuesday' => ['start' => '09:00', 'end' => '17:00'],
                'wednesday' => ['start' => '09:00', 'end' => '17:00'],
                'thursday' => ['start' => '09:00', 'end' => '17:00'],
                'friday' => ['start' => '09:00', 'end' => '17:00'],
                'saturday' => null,
                'sunday' => null,
            ],
            'breaks' => [
                'lunch' => ['start' => '12:00', 'end' => '13:00'],
                'morning_break' => ['start' => '10:30', 'end' => '10:45'],
                'afternoon_break' => ['start' => '15:00', 'end' => '15:15'],
            ],
            'time_off' => [],
            'skills' => $this->faker->randomElements([
                'Customer Service', 'Problem Solving', 'Communication', 'Technical Support',
                'Sales', 'Product Knowledge', 'Multitasking', 'Patience', 'Empathy'
            ], $this->faker->numberBetween(3, 6)),
            'languages' => $this->faker->randomElements([
                'English', 'Indonesian', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'
            ], $this->faker->numberBetween(1, 3)),
            'expertise_areas' => $this->faker->randomElements([
                'Technical Issues', 'Billing Problems', 'Account Management', 'Product Support',
                'Sales Inquiries', 'General Questions', 'Complaints', 'Refunds'
            ], $this->faker->numberBetween(2, 4)),
            'certifications' => $this->faker->optional(0.4)->randomElements([
                'Customer Service Certification', 'Technical Support Certificate',
                'Sales Training Certificate', 'Communication Skills Certificate'
            ], $this->faker->numberBetween(1, 3)),
            'performance_metrics' => [
                'response_time' => $this->faker->randomFloat(2, 0.7, 0.95),
                'resolution_rate' => $this->faker->randomFloat(2, 0.8, 0.98),
                'satisfaction' => $this->faker->randomFloat(2, 0.75, 0.95),
                'first_call_resolution' => $this->faker->randomFloat(2, 0.6, 0.9),
            ],
            'rating' => $this->faker->randomFloat(2, 3.5, 5.0),
            'total_handled_chats' => $this->faker->numberBetween(50, 1000),
            'total_resolved_chats' => $this->faker->numberBetween(40, 950),
            'avg_response_time' => $this->faker->numberBetween(30, 300), // seconds
            'avg_resolution_time' => $this->faker->numberBetween(300, 1800), // seconds
            'ai_suggestions_enabled' => $this->faker->boolean(70),
            'ai_auto_responses_enabled' => $this->faker->boolean(40),
            'points' => $this->faker->numberBetween(100, 5000),
            'level' => $this->faker->numberBetween(1, 10),
            'badges' => $this->faker->randomElements([
                'Fast Responder', 'Problem Solver', 'Customer Favorite', 'Team Player',
                'Knowledge Expert', 'Top Performer', 'Mentor', 'Rookie of the Month'
            ], $this->faker->numberBetween(1, 4)),
            'achievements' => $this->faker->randomElements([
                '100 Chats Resolved', 'Perfect Week', 'Customer Compliment',
                'Team Collaboration', 'Skill Mastery', 'Consistency Award'
            ], $this->faker->numberBetween(1, 3)),
            'status' => $this->faker->randomElement(['active', 'inactive', 'suspended']),
        ];
    }
}
