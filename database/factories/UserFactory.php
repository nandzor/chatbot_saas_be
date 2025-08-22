<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    protected $model = User::class;

    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $firstName = $this->faker->firstName();
        $lastName = $this->faker->lastName();
        $fullName = $firstName . ' ' . $lastName;

        return [
            'organization_id' => Organization::factory(),
            'email' => $this->faker->unique()->safeEmail(),
            'username' => $this->faker->unique()->userName(),
            'password_hash' => static::$password ??= Hash::make('password'),
            'full_name' => $fullName,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'phone' => $this->faker->optional()->phoneNumber(),
            'avatar_url' => $this->faker->optional()->imageUrl(150, 150, 'people'),
            'role' => $this->faker->randomElement(['org_admin', 'agent', 'customer', 'viewer']),
            'is_email_verified' => $this->faker->boolean(80),
            'is_phone_verified' => $this->faker->boolean(60),
            'two_factor_enabled' => $this->faker->boolean(20),
            'two_factor_secret' => null,
            'backup_codes' => null,
            'last_login_at' => $this->faker->optional()->dateTimeBetween('-30 days', 'now'),
            'last_login_ip' => $this->faker->optional()->ipv4(),
            'login_count' => $this->faker->numberBetween(0, 100),
            'failed_login_attempts' => 0,
            'locked_until' => null,
            'password_changed_at' => $this->faker->dateTimeBetween('-90 days', 'now'),
            'active_sessions' => [],
            'max_concurrent_sessions' => 3,
            'ui_preferences' => [
                'theme' => $this->faker->randomElement(['light', 'dark', 'auto']),
                'language' => 'id',
                'timezone' => 'Asia/Jakarta',
                'notifications' => [
                    'email' => $this->faker->boolean(90),
                    'push' => $this->faker->boolean(70),
                    'sms' => $this->faker->boolean(40),
                ],
            ],
            'dashboard_config' => [
                'widgets' => [
                    'recent_chats' => true,
                    'analytics' => true,
                    'notifications' => true,
                ],
                'layout' => 'default',
            ],
            'notification_preferences' => [
                'chat_assigned' => true,
                'new_message' => true,
                'system_updates' => false,
            ],
            'bio' => $this->faker->optional()->sentence(10),
            'location' => $this->faker->optional()->city(),
            'department' => $this->faker->optional()->randomElement([
                'Customer Service', 'Sales', 'Technical Support', 'Marketing', 'Operations'
            ]),
            'job_title' => $this->faker->optional()->jobTitle(),
            'skills' => $this->faker->optional()->randomElements([
                'Customer Service', 'Sales', 'Technical Support', 'Product Knowledge',
                'Communication', 'Problem Solving', 'Multilingual', 'Data Analysis'
            ], $this->faker->numberBetween(1, 4)),
            'languages' => [$this->faker->randomElement(['indonesia', 'english', 'javanese'])],
            'api_access_enabled' => $this->faker->boolean(30),
            'api_rate_limit' => 100,
            'permissions' => [],
            'status' => 'active',
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_email_verified' => false,
        ]);
    }

    /**
     * Create an admin user.
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'org_admin',
            'api_access_enabled' => true,
            'permissions' => [
                'manage_users' => true,
                'manage_agents' => true,
                'view_analytics' => true,
                'manage_settings' => true,
            ],
        ]);
    }

    /**
     * Create an agent user.
     */
    public function agent(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'agent',
            'department' => 'Customer Service',
            'skills' => ['Customer Service', 'Communication', 'Problem Solving'],
        ]);
    }

    /**
     * Create a customer user.
     */
    public function customer(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'customer',
            'api_access_enabled' => false,
        ]);
    }

    /**
     * Create a user with 2FA enabled.
     */
    public function withTwoFactor(): static
    {
        return $this->state(fn (array $attributes) => [
            'two_factor_enabled' => true,
            'two_factor_secret' => encrypt(Str::random(32)),
            'backup_codes' => array_map(
                fn() => Str::random(8),
                range(1, 8)
            ),
        ]);
    }

    /**
     * Create a locked user.
     */
    public function locked(): static
    {
        return $this->state(fn (array $attributes) => [
            'locked_until' => now()->addMinutes(15),
            'failed_login_attempts' => 5,
        ]);
    }

    /**
     * Create an inactive user.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }

    /**
     * Create a user with API access.
     */
    public function withApiAccess(): static
    {
        return $this->state(fn (array $attributes) => [
            'api_access_enabled' => true,
            'api_rate_limit' => 1000,
        ]);
    }
}
