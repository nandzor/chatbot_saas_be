<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Insert modern inbox permissions
        $permissions = [
            // Inbox Management Permissions
            [
                'id' => Str::uuid(),
                'code' => 'inbox.view',
                'name' => 'inbox.view',
                'display_name' => 'View Inbox',
                'description' => 'View modern inbox dashboard and conversations',
                'resource' => 'chat_sessions',
                'action' => 'read',
                'category' => 'inbox_management',
                'scope' => 'organization',
                'is_system_permission' => true,
                'is_visible' => true,
                'status' => 'active',
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'code' => 'inbox.conversations.assign',
                'name' => 'inbox.conversations.assign',
                'display_name' => 'Assign Conversations',
                'description' => 'Assign conversations to agents',
                'resource' => 'chat_sessions',
                'action' => 'update',
                'category' => 'inbox_management',
                'scope' => 'organization',
                'is_system_permission' => true,
                'is_visible' => true,
                'status' => 'active',
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'code' => 'inbox.conversations.bulk_actions',
                'name' => 'inbox.conversations.bulk_actions',
                'display_name' => 'Bulk Actions',
                'description' => 'Perform bulk actions on conversations',
                'resource' => 'chat_sessions',
                'action' => 'update',
                'category' => 'inbox_management',
                'scope' => 'organization',
                'is_system_permission' => true,
                'is_visible' => true,
                'status' => 'active',
                'sort_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'code' => 'inbox.agents.view',
                'name' => 'inbox.agents.view',
                'display_name' => 'View Agents',
                'description' => 'View available agents and their status',
                'resource' => 'chat_sessions',
                'action' => 'read',
                'category' => 'inbox_management',
                'scope' => 'organization',
                'is_system_permission' => true,
                'is_visible' => true,
                'status' => 'active',
                'sort_order' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'code' => 'inbox.agents.performance',
                'name' => 'inbox.agents.performance',
                'display_name' => 'View Agent Performance',
                'description' => 'View agent performance metrics and analytics',
                'resource' => 'chat_sessions',
                'action' => 'read',
                'category' => 'inbox_management',
                'scope' => 'organization',
                'is_system_permission' => true,
                'is_visible' => true,
                'status' => 'active',
                'sort_order' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'code' => 'inbox.templates.view',
                'name' => 'inbox.templates.view',
                'display_name' => 'View Templates',
                'description' => 'View conversation templates',
                'resource' => 'chat_sessions',
                'action' => 'read',
                'category' => 'inbox_management',
                'scope' => 'organization',
                'is_system_permission' => true,
                'is_visible' => true,
                'status' => 'active',
                'sort_order' => 6,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'code' => 'inbox.templates.create',
                'name' => 'inbox.templates.create',
                'display_name' => 'Create Templates',
                'description' => 'Create and manage conversation templates',
                'resource' => 'chat_sessions',
                'action' => 'create',
                'category' => 'inbox_management',
                'scope' => 'organization',
                'is_system_permission' => true,
                'is_visible' => true,
                'status' => 'active',
                'sort_order' => 7,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'code' => 'inbox.analytics.cost_statistics',
                'name' => 'inbox.analytics.cost_statistics',
                'display_name' => 'View Cost Statistics',
                'description' => 'View AI cost statistics and optimization metrics',
                'resource' => 'chat_sessions',
                'action' => 'read',
                'category' => 'inbox_management',
                'scope' => 'organization',
                'is_system_permission' => true,
                'is_visible' => true,
                'status' => 'active',
                'sort_order' => 8,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'code' => 'inbox.ai.suggestions',
                'name' => 'inbox.ai.suggestions',
                'display_name' => 'AI Suggestions',
                'description' => 'Access AI-powered conversation suggestions',
                'resource' => 'chat_sessions',
                'action' => 'read',
                'category' => 'inbox_management',
                'scope' => 'organization',
                'is_system_permission' => true,
                'is_visible' => true,
                'status' => 'active',
                'sort_order' => 9,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'code' => 'inbox.ai.coaching',
                'name' => 'inbox.ai.coaching',
                'display_name' => 'AI Coaching',
                'description' => 'Access AI-powered agent coaching and feedback',
                'resource' => 'chat_sessions',
                'action' => 'read',
                'category' => 'inbox_management',
                'scope' => 'organization',
                'is_system_permission' => true,
                'is_visible' => true,
                'status' => 'active',
                'sort_order' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Insert permissions for each organization
        $organizations = DB::table('organizations')->select('id')->get();

        foreach ($organizations as $organization) {
            foreach ($permissions as $permission) {
                $permission['organization_id'] = $organization->id;
                $permission['id'] = Str::uuid(); // Generate new UUID for each insert

                // Check if permission already exists based on unique constraint
                $exists = DB::table('permissions')
                    ->where('resource', $permission['resource'])
                    ->where('action', $permission['action'])
                    ->where('scope', $permission['scope'])
                    ->where('organization_id', $organization->id)
                    ->exists();

                if (!$exists) {
                    DB::table('permissions')->insert($permission);
                }
            }
        }

        // Also insert global permissions (for super admin)
        foreach ($permissions as $permission) {
            $permission['organization_id'] = null;
            $permission['id'] = Str::uuid(); // Generate new UUID for each insert

            // Check if global permission already exists based on unique constraint
            $exists = DB::table('permissions')
                ->where('resource', $permission['resource'])
                ->where('action', $permission['action'])
                ->where('scope', $permission['scope'])
                ->whereNull('organization_id')
                ->exists();

            if (!$exists) {
                DB::table('permissions')->insert($permission);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove modern inbox permissions
        $permissionIds = [
            'inbox.view',
            'inbox.conversations.assign',
            'inbox.conversations.bulk_actions',
            'inbox.agents.view',
            'inbox.agents.performance',
            'inbox.templates.view',
            'inbox.templates.create',
            'inbox.analytics.cost_statistics',
            'inbox.ai.suggestions',
            'inbox.ai.coaching',
        ];

        DB::table('permissions')->whereIn('id', $permissionIds)->delete();
    }
};
