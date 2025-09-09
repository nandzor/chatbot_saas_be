<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AuthTestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating test organization and users...');

        // Create test organization using updateOrCreate to handle existing data
        $organization = Organization::updateOrCreate(
            ['org_code' => 'TEST001'],
            [
                'name' => 'Test Organization',
                'display_name' => 'Test Organization for Development',
                'email' => 'admin@testorg.com',
                'phone' => '+6281234567890',
                'address' => 'Jl. Test No. 123, Jakarta',
                'website' => 'https://testorg.com',
                'business_type' => 'Technology',
                'industry' => 'Software Development',
                'company_size' => '10-50',
                'status' => 'active',
                'subscription_status' => 'trial',
                'timezone' => 'Asia/Jakarta',
                'locale' => 'id',
                'currency' => 'IDR',
            ]
        );

        // Create default role for organization
        $defaultRole = Role::firstOrCreate(
            [
                'organization_id' => $organization->id,
                'code' => 'customer'
            ],
            [
                'name' => 'Customer',
                'display_name' => 'Customer Role',
                'description' => 'Default role for new users',
                'is_default' => true,
                'is_system_role' => false,
                'level' => 1,
                'status' => 'active',
            ]
        );

        // Create test users
        $this->createTestUsers($organization);

        $this->command->info('Auth test data seeded successfully!');
    }

    /**
     * Create test users for different scenarios.
     */
    private function createTestUsers(Organization $organization): void
    {
        // Super Admin
        User::updateOrCreate(
            [
                'organization_id' => $organization->id,
                'email' => 'superadmin@test.com',
            ],
            [
                'username' => 'superadmin',
                'password_hash' => Hash::make('Password123!'),
                'full_name' => 'Super Administrator',
                'first_name' => 'Super',
                'last_name' => 'Administrator',
                'role' => 'super_admin',
                'status' => 'active',
                'is_email_verified' => true,
                'phone' => '+6281234567890',
                'ui_preferences' => [
                    'theme' => 'light',
                    'language' => 'id',
                    'timezone' => 'Asia/Jakarta',
                    'notifications' => ['email' => true, 'push' => true]
                ],
            ]
        );

        // Organization Admin
        User::updateOrCreate(
            [
                'organization_id' => $organization->id,
                'email' => 'admin@test.com',
            ],
            [
                'username' => 'admin',
                'password_hash' => Hash::make('Password123!'),
                'full_name' => 'Organization Administrator',
                'first_name' => 'Organization',
                'last_name' => 'Administrator',
                'role' => 'org_admin',
                'status' => 'active',
                'is_email_verified' => true,
                'phone' => '+6281234567891',
                'ui_preferences' => [
                    'theme' => 'light',
                    'language' => 'id',
                    'timezone' => 'Asia/Jakarta',
                    'notifications' => ['email' => true, 'push' => true]
                ],
            ]
        );

        // Regular Customer
        User::updateOrCreate(
            [
                'organization_id' => $organization->id,
                'email' => 'customer@test.com',
            ],
            [
                'username' => 'customer',
                'password_hash' => Hash::make('Password123!'),
                'full_name' => 'Test Customer',
                'first_name' => 'Test',
                'last_name' => 'Customer',
                'role' => 'customer',
                'status' => 'active',
                'is_email_verified' => true,
                'phone' => '+6281234567892',
                'ui_preferences' => [
                    'theme' => 'light',
                    'language' => 'id',
                    'timezone' => 'Asia/Jakarta',
                    'notifications' => ['email' => true, 'push' => true]
                ],
            ]
        );

        // Agent
        User::updateOrCreate(
            [
                'organization_id' => $organization->id,
                'email' => 'agent@test.com',
            ],
            [
                'username' => 'agent',
                'password_hash' => Hash::make('Password123!'),
                'full_name' => 'Test Agent',
                'first_name' => 'Test',
                'last_name' => 'Agent',
                'role' => 'agent',
                'status' => 'active',
                'is_email_verified' => true,
                'phone' => '+6281234567893',
                'ui_preferences' => [
                    'theme' => 'light',
                    'language' => 'id',
                    'timezone' => 'Asia/Jakarta',
                    'notifications' => ['email' => true, 'push' => true]
                ],
            ]
        );

        // Locked User (for testing)
        User::updateOrCreate(
            [
                'organization_id' => $organization->id,
                'email' => 'locked@test.com',
            ],
            [
                'username' => 'locked',
                'password_hash' => Hash::make('Password123!'),
                'full_name' => 'Locked User',
                'first_name' => 'Locked',
                'last_name' => 'User',
                'role' => 'customer',
                'status' => 'suspended',
                'is_email_verified' => true,
                'locked_until' => now()->addHours(1),
                'failed_login_attempts' => 5,
                'phone' => '+6281234567894',
                'ui_preferences' => [
                    'theme' => 'light',
                    'language' => 'id',
                    'timezone' => 'Asia/Jakarta',
                    'notifications' => ['email' => true, 'push' => true]
                ],
            ]
        );

        $this->command->info('Test users created:');
        $this->command->info('- superadmin@test.com (Password123!)');
        $this->command->info('- admin@test.com (Password123!)');
        $this->command->info('- customer@test.com (Password123!)');
        $this->command->info('- agent@test.com (Password123!)');
        $this->command->info('- locked@test.com (Password123!) - LOCKED');
    }
}
