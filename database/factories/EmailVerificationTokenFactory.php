<?php

namespace Database\Factories;

use App\Models\EmailVerificationToken;
use App\Models\User;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EmailVerificationToken>
 */
class EmailVerificationTokenFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = EmailVerificationToken::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'email' => $this->faker->unique()->safeEmail(),
            'token' => Str::random(64),
            'type' => 'organization_verification',
            'user_id' => null,
            'organization_id' => null,
            'expires_at' => now()->addHours(24),
            'is_used' => false,
            'used_at' => null,
        ];
    }

    /**
     * Indicate that the token is expired.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'expires_at' => now()->subHour(),
        ]);
    }

    /**
     * Indicate that the token is used.
     */
    public function used(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_used' => true,
            'used_at' => now()->subMinutes(30),
        ]);
    }

    /**
     * Indicate that the token is for organization verification.
     */
    public function organizationVerification(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'organization_verification',
        ]);
    }

    /**
     * Indicate that the token is for user verification.
     */
    public function userVerification(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'user_verification',
        ]);
    }

    /**
     * Create a token with a specific user.
     */
    public function forUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'email' => $user->email,
            'user_id' => $user->id,
        ]);
    }

    /**
     * Create a token with a specific organization.
     */
    public function forOrganization(Organization $organization): static
    {
        return $this->state(fn (array $attributes) => [
            'organization_id' => $organization->id,
        ]);
    }

    /**
     * Create a token with both user and organization.
     */
    public function forUserAndOrganization(User $user, Organization $organization): static
    {
        return $this->state(fn (array $attributes) => [
            'email' => $user->email,
            'user_id' => $user->id,
            'organization_id' => $organization->id,
        ]);
    }
}
