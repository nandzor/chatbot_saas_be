<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement('
            CREATE TABLE messages (
                id UUID NOT NULL,
                session_id UUID NOT NULL,
                organization_id UUID NOT NULL,
                sender_type VARCHAR(20) NOT NULL,
                sender_id UUID,
                sender_name VARCHAR(255),
                message_text TEXT,
                message_type VARCHAR(255) NOT NULL DEFAULT \'text\',
                media_url TEXT,
                media_type VARCHAR(50),
                media_size INTEGER,
                media_metadata JSON NOT NULL DEFAULT \'{}\',
                thumbnail_url VARCHAR(500),
                quick_replies JSON,
                buttons JSON,
                template_data JSON,
                intent VARCHAR(100),
                entities JSON NOT NULL DEFAULT \'{}\',
                confidence_score NUMERIC(3,2),
                ai_generated BOOLEAN NOT NULL DEFAULT false,
                ai_model_used VARCHAR(100),
                sentiment_score NUMERIC(3,2),
                sentiment_label VARCHAR(20),
                emotion_scores JSON NOT NULL DEFAULT \'{}\',
                is_read BOOLEAN NOT NULL DEFAULT false,
                read_at TIMESTAMP(0),
                delivered_at TIMESTAMP(0),
                failed_at TIMESTAMP(0),
                failed_reason TEXT,
                reply_to_message_id UUID,
                thread_id UUID,
                context JSON NOT NULL DEFAULT \'{}\',
                processing_time_ms INTEGER,
                metadata JSON NOT NULL DEFAULT \'{}\',
                created_at TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                waha_session_id VARCHAR(255),
                PRIMARY KEY (id, created_at),
                UNIQUE (id),
                -- FOREIGN KEY (session_id) REFERENCES chat_sessions(id), -- Will be added later
                FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
                CONSTRAINT messages_message_type_check CHECK (message_type IN (\'text\', \'image\', \'audio\', \'video\', \'file\', \'location\', \'contact\', \'sticker\', \'template\', \'quick_reply\', \'button\', \'list\', \'carousel\', \'poll\', \'form\'))
            )
        ');

        // Add unique constraint for WAHA message ID
        DB::statement("CREATE UNIQUE INDEX messages_org_waha_message_id_unique ON messages (organization_id, (metadata ->> 'waha_message_id')) WHERE (metadata ->> 'waha_message_id') IS NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
