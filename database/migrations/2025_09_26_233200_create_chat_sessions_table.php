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
        // Drop the table if it exists (in case it was created with wrong schema)
        DB::statement('DROP TABLE IF EXISTS chat_sessions CASCADE');
        
        DB::statement('
            CREATE TABLE chat_sessions (
                id UUID NOT NULL,
                organization_id UUID NOT NULL,
                customer_id UUID NOT NULL,
                channel_config_id UUID NOT NULL,
                agent_id UUID,
                session_token VARCHAR(255) NOT NULL,
                session_type VARCHAR(20) NOT NULL DEFAULT \'customer_initiated\',
                started_at TIMESTAMP(0) NOT NULL DEFAULT \'2025-09-26 12:58:42\',
                ended_at TIMESTAMP(0),
                last_activity_at TIMESTAMP(0) NOT NULL DEFAULT \'2025-09-26 12:58:42\',
                first_response_at TIMESTAMP(0),
                is_active BOOLEAN NOT NULL DEFAULT true,
                is_bot_session BOOLEAN NOT NULL DEFAULT true,
                handover_reason TEXT,
                handover_at TIMESTAMP(0),
                total_messages INTEGER NOT NULL DEFAULT 0,
                customer_messages INTEGER NOT NULL DEFAULT 0,
                bot_messages INTEGER NOT NULL DEFAULT 0,
                agent_messages INTEGER NOT NULL DEFAULT 0,
                response_time_avg INTEGER,
                resolution_time INTEGER,
                wait_time INTEGER,
                satisfaction_rating INTEGER,
                feedback_text TEXT,
                feedback_tags JSON,
                csat_submitted_at TIMESTAMP(0),
                intent VARCHAR(100),
                category VARCHAR(100),
                subcategory VARCHAR(100),
                priority VARCHAR(20) NOT NULL DEFAULT \'normal\',
                tags JSON,
                is_resolved BOOLEAN NOT NULL DEFAULT false,
                resolved_at TIMESTAMP(0),
                resolution_type VARCHAR(50),
                resolution_notes TEXT,
                sentiment_analysis JSON NOT NULL DEFAULT \'{}\',
                ai_summary TEXT,
                topics_discussed JSON,
                session_data JSON NOT NULL DEFAULT \'{}\',
                metadata JSON NOT NULL DEFAULT \'{}\',
                created_at TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id, created_at),
                UNIQUE (id),
                UNIQUE (organization_id, customer_id, started_at),
                UNIQUE (session_token),
                FOREIGN KEY (agent_id) REFERENCES agents(id),
                FOREIGN KEY (channel_config_id) REFERENCES channel_configs(id),
                FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
                FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
            )
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_sessions');
    }
};
