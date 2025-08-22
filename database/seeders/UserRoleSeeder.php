<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\UserRole;
use Illuminate\Database\Seeder;

class UserRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        $roles = Role::all();

        // Validate that users and roles exist
        if ($users->isEmpty()) {
            throw new \Exception('No users found. Please run UserSeeder first.');
        }

        if ($roles->isEmpty()) {
            throw new \Exception('No roles found. Please run RoleSeeder first.');
        }

        foreach ($users as $user) {
            $userRoles = [];

            // Find the appropriate role based on user's role field
            $matchingRole = null;

            if ($user->organization_id) {
                // Organization user - find organization-specific role
                $matchingRole = $roles->where('code', $user->role)
                                    ->where('organization_id', $user->organization_id)
                                    ->first();
            } else {
                // System user - find system role
                $matchingRole = $roles->where('code', $user->role)
                                    ->whereNull('organization_id')
                                    ->first();
            }

                        if ($matchingRole) {
                $userRoles[] = [
                    'user_id' => $user->id,
                    'role_id' => $matchingRole->id,
                    'is_active' => true,
                    'is_primary' => true,
                    'scope' => $matchingRole->scope,
                    'scope_context' => [
                        'assigned_via' => 'seeder',
                        'primary_role' => true
                    ],
                    'effective_from' => now(),
                    'effective_until' => null,
                    'assigned_by' => null,
                    'assigned_reason' => 'Initial role assignment via seeder',
                    'metadata' => [
                        'assigned_via' => 'seeder',
                        'primary_role' => true
                    ]
                ];

                // Assign additional roles based on user type
            if ($user->role === 'super_admin') {
                    // Super admin gets all system roles
                    $systemRoles = $roles->whereNull('organization_id')->where('code', '!=', 'super_admin');
                    foreach ($systemRoles as $role) {
                        $userRoles[] = [
                            'user_id' => $user->id,
                            'role_id' => $role->id,
                            'is_active' => true,
                            'is_primary' => false,
                            'scope' => $role->scope,
                            'scope_context' => [
                                'assigned_via' => 'seeder',
                                'additional_role' => true
                            ],
                            'effective_from' => now(),
                            'effective_until' => null,
                            'assigned_by' => null,
                            'assigned_reason' => 'Additional system role for super admin',
                            'metadata' => [
                                'assigned_via' => 'seeder',
                                'additional_role' => true
                            ]
                        ];
                    }
                } elseif ($user->role === 'org_admin') {
                    // Organization admin gets viewer role as secondary
                    $viewerRole = $roles->where('code', 'viewer')
                                      ->where('organization_id', $user->organization_id)
                                      ->first();
                    if ($viewerRole) {
                        $userRoles[] = [
                            'user_id' => $user->id,
                            'role_id' => $viewerRole->id,
                            'is_active' => true,
                            'is_primary' => false,
                            'scope' => $viewerRole->scope,
                            'scope_context' => [
                                'assigned_via' => 'seeder',
                                'additional_role' => true
                            ],
                            'effective_from' => now(),
                            'effective_until' => null,
                            'assigned_by' => null,
                            'assigned_reason' => 'Additional viewer role for organization admin',
                            'metadata' => [
                                'assigned_via' => 'seeder',
                                'additional_role' => true
                            ]
                        ];
                    }
                } elseif ($user->role === 'manager') {
                    // Manager gets agent and viewer roles as secondary
                    $agentRole = $roles->where('code', 'agent')
                                     ->where('organization_id', $user->organization_id)
                                     ->first();
                    $viewerRole = $roles->where('code', 'viewer')
                                      ->where('organization_id', $user->organization_id)
                                      ->first();

                    if ($agentRole) {
                        $userRoles[] = [
                            'user_id' => $user->id,
                            'role_id' => $agentRole->id,
                            'is_active' => true,
                            'is_primary' => false,
                            'scope' => $agentRole->scope,
                            'scope_context' => [
                                'assigned_via' => 'seeder',
                                'additional_role' => true
                            ],
                            'effective_from' => now(),
                            'effective_until' => null,
                            'assigned_by' => null,
                            'assigned_reason' => 'Additional agent role for manager',
                            'metadata' => [
                                'assigned_via' => 'seeder',
                                'additional_role' => true
                            ]
                        ];
                    }

                    if ($viewerRole) {
                        $userRoles[] = [
                            'user_id' => $user->id,
                            'role_id' => $viewerRole->id,
                            'is_active' => true,
                            'is_primary' => false,
                            'scope' => $viewerRole->scope,
                            'scope_context' => [
                                'assigned_via' => 'seeder',
                                'additional_role' => true
                            ],
                            'effective_from' => now(),
                            'effective_until' => null,
                            'assigned_by' => null,
                            'assigned_reason' => 'Additional viewer role for manager',
                            'metadata' => [
                                'assigned_via' => 'seeder',
                                'additional_role' => true
                            ]
                        ];
                    }
                } elseif ($user->role === 'agent') {
                    // Agent gets viewer role as secondary
                    $viewerRole = $roles->where('code', 'viewer')
                                      ->where('organization_id', $user->organization_id)
                                      ->first();
                    if ($viewerRole) {
                        $userRoles[] = [
                            'user_id' => $user->id,
                            'role_id' => $viewerRole->id,
                            'is_active' => true,
                            'is_primary' => false,
                            'scope' => $viewerRole->scope,
                            'scope_context' => [
                                'assigned_via' => 'seeder',
                                'additional_role' => true
                            ],
                            'effective_from' => now(),
                            'effective_until' => null,
                            'assigned_by' => null,
                            'assigned_reason' => 'Additional viewer role for agent',
                            'metadata' => [
                                'assigned_via' => 'seeder',
                                'additional_role' => true
                            ]
                        ];
                    }
                }
            }

            // Create user roles
            foreach ($userRoles as $userRole) {
                UserRole::create($userRole);
            }

            // Log warning if no matching role was found
            if (!$matchingRole) {
                \Log::warning("No matching role found for user {$user->email} with role '{$user->role}' and organization_id: " . ($user->organization_id ?? 'null'));
            }
        }
    }
}
