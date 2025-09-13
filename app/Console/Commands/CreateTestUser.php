<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateTestUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:create-test';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a test user for development';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Creating test user...');

        // Check if user already exists
        $existingUser = User::where('email', 'demo@example.com')->first();
        if ($existingUser) {
            $this->warn('User with email demo@example.com already exists!');
            return;
        }

        // Create test user
        $user = User::create([
            'email' => 'demo@example.com',
            'password_hash' => Hash::make('Demo123!'),
            'first_name' => 'Demo',
            'last_name' => 'User',
            'username' => 'demo',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $this->info('Test user created successfully!');
        $this->info('Email: demo@example.com');
        $this->info('Password: Demo123!');
        $this->info('User ID: ' . $user->id);

        return 0;
    }
}
