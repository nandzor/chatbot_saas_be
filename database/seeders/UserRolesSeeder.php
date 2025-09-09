<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserRolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all users
        $users = DB::table('users')->get();

        if ($users->isEmpty()) {
            $this->command->info('No users found. Please run user seeder first.');
            return;
        }

        $this->command->info('Seeding user roles for ' . $users->count() . ' users...');

        foreach ($users as $user) {
            $this->assignUserRole($user);
        }

        $this->command->info('User roles seeded successfully!');
    }

    private function assignUserRole($user)
    {
        // Get organization roles
        $roles = DB::table('organization_roles')
            ->where('organization_id', $user->organization_id)
            ->where('is_active', true)
            ->get();

        if ($roles->isEmpty()) {
            return;
        }

        // Assign random role to user (with preference for admin role)
        $role = $roles->where('slug', 'organization_admin')->first()
            ?? $roles->where('slug', 'agent')->first()
            ?? $roles->random();

        // Check if user already has a role
        $existingRole = DB::table('user_roles')
            ->where('user_id', $user->id)
            ->first();

        if (!$existingRole) {
            DB::table('user_roles')->insert([
                'user_id' => $user->id,
                'role_id' => $role->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
