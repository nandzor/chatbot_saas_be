<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop the existing check constraint
        DB::statement('ALTER TABLE permissions DROP CONSTRAINT IF EXISTS permissions_resource_check');

        // Add the new check constraint with 'inbox' included
        DB::statement("ALTER TABLE permissions ADD CONSTRAINT permissions_resource_check CHECK (((resource)::text = ANY ((ARRAY['users'::character varying, 'agents'::character varying, 'customers'::character varying, 'chat_sessions'::character varying, 'messages'::character varying, 'knowledge_articles'::character varying, 'knowledge_categories'::character varying, 'bot_personalities'::character varying, 'channel_configs'::character varying, 'ai_models'::character varying, 'workflows'::character varying, 'analytics'::character varying, 'billing'::character varying, 'subscriptions'::character varying, 'api_keys'::character varying, 'webhooks'::character varying, 'system_logs'::character varying, 'organizations'::character varying, 'roles'::character varying, 'permissions'::character varying, 'inbox'::character varying])::text[])))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the new check constraint
        DB::statement('ALTER TABLE permissions DROP CONSTRAINT IF EXISTS permissions_resource_check');

        // Restore the original check constraint without 'inbox'
        DB::statement("ALTER TABLE permissions ADD CONSTRAINT permissions_resource_check CHECK (((resource)::text = ANY ((ARRAY['users'::character varying, 'agents'::character varying, 'customers'::character varying, 'chat_sessions'::character varying, 'messages'::character varying, 'knowledge_articles'::character varying, 'knowledge_categories'::character varying, 'bot_personalities'::character varying, 'channel_configs'::character varying, 'ai_models'::character varying, 'workflows'::character varying, 'analytics'::character varying, 'billing'::character varying, 'subscriptions'::character varying, 'api_keys'::character varying, 'webhooks'::character varying, 'system_logs'::character varying, 'organizations'::character varying, 'roles'::character varying, 'permissions'::character varying])::text[])))");
    }
};
