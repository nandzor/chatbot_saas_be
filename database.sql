--
-- Enhanced PostgreSQL 15 Database Schema for Chatbot AI + Human Multi-tenant SAAS
-- Optimized for performance, security, and scalability
--

-- Drop existing objects if they exist (for clean installation)
DROP SCHEMA IF EXISTS chatbot CASCADE;

-- Create schema explicitly
CREATE SCHEMA chatbot;

-- Set search path to use the chatbot schema
SET search_path TO chatbot, public;

-- Enable required extensions for PostgreSQL 15
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
-- Note: Uncomment if pg_stat_statements is available
-- CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create IMMUTABLE date extraction function for indexes (must be created early)
CREATE OR REPLACE FUNCTION extract_date_immutable(ts TIMESTAMPTZ)
RETURNS DATE AS $$
BEGIN
    RETURN ts::DATE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create ENUMs
CREATE TYPE status_type AS ENUM (
    'active',
    'inactive',
    'suspended',
    'deleted',
    'pending',
    'draft',
    'published',
    'archived'
);

CREATE TYPE user_role AS ENUM (
    'super_admin',
    'org_admin',
    'agent',
    'customer',
    'viewer',
    'moderator',
    'developer'
);

CREATE TYPE channel_type AS ENUM (
    'whatsapp',
    'wordpress_sdk',
    'telegram',
    'webchat',
    'api',
    'facebook',
    'instagram',
    'line',
    'slack',
    'discord',
    'teams',
    'viber',
    'wechat'
);

CREATE TYPE language_type AS ENUM (
    'indonesia',
    'english',
    'javanese',
    'sundanese',
    'balinese',
    'minang',
    'chinese',
    'japanese',
    'korean',
    'spanish',
    'french',
    'german',
    'arabic',
    'thai',
    'vietnamese'
);

CREATE TYPE subscription_tier AS ENUM (
    'trial',
    'starter',
    'professional',
    'enterprise',
    'custom'
);

CREATE TYPE payment_status AS ENUM (
    'pending',
    'processing',
    'success',
    'failed',
    'expired',
    'refunded',
    'cancelled',
    'disputed'
);

CREATE TYPE billing_cycle AS ENUM (
    'monthly',
    'quarterly',
    'yearly',
    'lifetime'
);

CREATE TYPE audit_action AS ENUM (
    'create',
    'update',
    'delete',
    'login',
    'logout',
    'export',
    'import',
    'view',
    'download',
    'api_call',
    'payment',
    'subscription_change'
);

CREATE TYPE objective_level AS ENUM (
    'basic',
    'intermediate',
    'advanced',
    'expert'
);

CREATE TYPE message_type AS ENUM (
    'text',
    'image',
    'audio',
    'video',
    'file',
    'location',
    'contact',
    'sticker',
    'template',
    'quick_reply',
    'button',
    'list',
    'carousel',
    'poll',
    'form'
);

CREATE TYPE ai_model_type AS ENUM (
    'gpt-3.5-turbo',
    'gpt-4',
    'gpt-4-turbo',
    'claude-3-sonnet',
    'claude-3-opus',
    'gemini-pro',
    'custom'
);

CREATE TYPE quota_type AS ENUM (
    'messages',
    'api_calls',
    'storage',
    'agents',
    'channels',
    'knowledge_articles',
    'ai_requests'
);

CREATE TYPE workflow_status AS ENUM (
    'active',
    'inactive',
    'paused',
    'error',
    'testing'
);

CREATE TYPE execution_status AS ENUM (
    'running',
    'success',
    'failed',
    'cancelled',
    'waiting',
    'timeout'
);

CREATE TYPE transaction_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled',
    'refunded',
    'disputed',
    'expired'
);

CREATE TYPE log_level AS ENUM (
    'debug',
    'info',
    'warn',
    'error',
    'fatal'
);

CREATE TYPE metric_type AS ENUM (
    'counter',
    'gauge',
    'histogram',
    'summary'
);

CREATE TYPE permission_scope AS ENUM (
    'global',
    'organization',
    'department',
    'team',
    'personal'
);

CREATE TYPE resource_type AS ENUM (
    'users',
    'agents',
    'customers',
    'chat_sessions',
    'messages',
    'knowledge_articles',
    'knowledge_categories',
    'bot_personalities',
    'channel_configs',
    'ai_models',
    'workflows',
    'analytics',
    'billing',
    'subscriptions',
    'api_keys',
    'webhooks',
    'system_logs',
    'organizations',
    'roles',
    'permissions'
);

CREATE TYPE permission_action AS ENUM (
    'create',
    'read',
    'update',
    'delete',
    'execute',
    'approve',
    'publish',
    'export',
    'import',
    'manage',
    'view_all',
    'view_own',
    'edit_all',
    'edit_own'
);

-- Subscription Plans table
CREATE TABLE subscription_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    tier subscription_tier NOT NULL,

    -- Pricing
    price_monthly DECIMAL(10,2) DEFAULT 0,
    price_quarterly DECIMAL(10,2) DEFAULT 0,
    price_yearly DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'IDR',

    -- Features & Limits
    max_agents INTEGER DEFAULT 1,
    max_channels INTEGER DEFAULT 1,
    max_knowledge_articles INTEGER DEFAULT 100,
    max_monthly_messages INTEGER DEFAULT 1000,
    max_monthly_ai_requests INTEGER DEFAULT 100,
    max_storage_gb INTEGER DEFAULT 1,
    max_api_calls_per_day INTEGER DEFAULT 1000,

    -- Feature Flags
    features JSONB DEFAULT '{
        "ai_assistant": false,
        "sentiment_analysis": false,
        "auto_translation": false,
        "advanced_analytics": false,
        "custom_branding": false,
        "api_access": false,
        "priority_support": false,
        "sso": false,
        "webhook": false,
        "custom_integrations": false
    }',

    -- Plan Configuration
    trial_days INTEGER DEFAULT 14,
    is_popular BOOLEAN DEFAULT FALSE,
    is_custom BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,

    -- System fields
    status status_type DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Organizations table (Enhanced)
CREATE TABLE organizations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    org_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    logo_url VARCHAR(500),
    favicon_url VARCHAR(500),
    website VARCHAR(255),
    tax_id VARCHAR(50),
    business_type VARCHAR(100),
    industry VARCHAR(100),
    company_size VARCHAR(50),
    timezone VARCHAR(100) DEFAULT 'Asia/Jakarta',
    locale VARCHAR(10) DEFAULT 'id',
    currency VARCHAR(3) DEFAULT 'IDR',

    -- Subscription & Billing
    subscription_plan_id UUID REFERENCES subscription_plans(id),
    subscription_status VARCHAR(20) DEFAULT 'trial',
    trial_ends_at TIMESTAMPTZ,
    subscription_starts_at TIMESTAMPTZ,
    subscription_ends_at TIMESTAMPTZ,
    billing_cycle billing_cycle DEFAULT 'monthly',

    -- Usage Tracking
    current_usage JSONB DEFAULT '{
        "messages": 0,
        "ai_requests": 0,
        "api_calls": 0,
        "storage_mb": 0,
        "active_agents": 0,
        "active_channels": 0
    }',

    -- UI/UX Configuration
    theme_config JSONB DEFAULT '{"primaryColor": "#3B82F6", "secondaryColor": "#10B981", "darkMode": false}',
    branding_config JSONB DEFAULT '{}',
    feature_flags JSONB DEFAULT '{}',
    ui_preferences JSONB DEFAULT '{}',

    -- Business Configuration
    business_hours JSONB DEFAULT '{"timezone": "Asia/Jakarta", "days": {}}',
    contact_info JSONB DEFAULT '{}',
    social_media JSONB DEFAULT '{}',

    -- Security Settings
    security_settings JSONB DEFAULT '{
        "password_policy": {"min_length": 8, "require_special": true},
        "session_timeout": 3600,
        "ip_whitelist": [],
        "two_factor_required": false
    }',

    -- API Configuration
    api_enabled BOOLEAN DEFAULT FALSE,
    webhook_url VARCHAR(500),
    webhook_secret VARCHAR(255),

    -- System fields
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    status status_type DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

-- Users table (Enhanced)
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    role user_role DEFAULT 'customer' NOT NULL,

    -- Authentication & Security
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    backup_codes TEXT[],
    last_login_at TIMESTAMPTZ,
    last_login_ip INET,
    login_count INTEGER DEFAULT 0,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- Session Management
    active_sessions JSONB DEFAULT '[]',
    max_concurrent_sessions INTEGER DEFAULT 3,

    -- UI/UX Preferences
    ui_preferences JSONB DEFAULT '{"theme": "light", "language": "id", "timezone": "Asia/Jakarta", "notifications": {"email": true, "push": true}}',
    dashboard_config JSONB DEFAULT '{}',
    notification_preferences JSONB DEFAULT '{}',

    -- Profile & Activity
    bio TEXT,
    location VARCHAR(255),
    department VARCHAR(100),
    job_title VARCHAR(100),
    skills TEXT[],
    languages language_type[] DEFAULT ARRAY['indonesia']::language_type[],

    -- API Access
    api_access_enabled BOOLEAN DEFAULT FALSE,
    api_rate_limit INTEGER DEFAULT 100,

    -- System fields
    permissions JSONB DEFAULT '{}',
    status status_type DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

-- API Keys table
CREATE TABLE api_keys (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    key_prefix VARCHAR(20) NOT NULL,

    -- Permissions & Scope
    scopes TEXT[] DEFAULT ARRAY['read'],
    permissions JSONB DEFAULT '{}',
    rate_limit_per_minute INTEGER DEFAULT 60,
    rate_limit_per_hour INTEGER DEFAULT 1000,
    rate_limit_per_day INTEGER DEFAULT 10000,

    -- Usage Tracking
    last_used_at TIMESTAMPTZ,
    total_requests INTEGER DEFAULT 0,

    -- Expiration & Security
    expires_at TIMESTAMPTZ,
    allowed_ips TEXT[],
    user_agent_restrictions TEXT[],

    -- System fields
    status status_type DEFAULT 'active',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),

    -- Subscription Details
    status payment_status DEFAULT 'pending',
    billing_cycle billing_cycle DEFAULT 'monthly',
    current_period_start TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    current_period_end TIMESTAMPTZ,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,

    -- Pricing
    unit_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'IDR',
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,

    -- Payment Information
    payment_method_id VARCHAR(255),
    last_payment_date TIMESTAMPTZ,
    next_payment_date TIMESTAMPTZ,

    -- Cancellation
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMPTZ,
    cancellation_reason TEXT,

    -- System fields
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Billing Invoices table
CREATE TABLE billing_invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),

    -- Invoice Details
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    status payment_status DEFAULT 'pending',

    -- Amounts
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'IDR',

    -- Dates
    invoice_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMPTZ,
    paid_date TIMESTAMPTZ,

    -- Payment Information
    payment_method VARCHAR(100),
    transaction_id VARCHAR(255),
    payment_gateway VARCHAR(50),

    -- Invoice Data
    line_items JSONB DEFAULT '[]',
    billing_address JSONB DEFAULT '{}',

    -- System fields
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Usage Tracking table
CREATE TABLE usage_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    quota_type quota_type NOT NULL,

    -- Usage Data
    used_amount INTEGER DEFAULT 0,
    quota_limit INTEGER DEFAULT 0,
    overage_amount INTEGER DEFAULT 0,

    -- Billing
    unit_cost DECIMAL(10,4) DEFAULT 0,
    total_cost DECIMAL(10,2) DEFAULT 0,

    -- System fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(organization_id, date, quota_type)
);

-- User Sessions table
CREATE TABLE user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,

    -- Session Details
    ip_address INET,
    user_agent TEXT,
    device_info JSONB DEFAULT '{}',
    location_info JSONB DEFAULT '{}',

    -- Security
    is_active BOOLEAN DEFAULT TRUE,
    last_activity_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- System fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL
);

-- AI Models Configuration table
CREATE TABLE ai_models (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    model_type ai_model_type NOT NULL,

    -- Configuration
    api_endpoint VARCHAR(500),
    api_key_encrypted TEXT,
    model_version VARCHAR(50),

    -- Parameters
    temperature DECIMAL(3,2) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 150,
    top_p DECIMAL(3,2) DEFAULT 1.0,
    frequency_penalty DECIMAL(3,2) DEFAULT 0.0,
    presence_penalty DECIMAL(3,2) DEFAULT 0.0,

    -- System Prompts
    system_prompt TEXT,
    context_prompt TEXT,
    fallback_responses TEXT[],

    -- Usage & Performance
    total_requests INTEGER DEFAULT 0,
    avg_response_time INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    cost_per_request DECIMAL(10,6) DEFAULT 0,

    -- System fields
    is_default BOOLEAN DEFAULT FALSE,
    status status_type DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced Knowledge Base Categories table
CREATE TABLE knowledge_base_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES knowledge_base_categories(id) ON DELETE CASCADE,

    -- Basic Information
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(7),
    order_index INTEGER DEFAULT 0,

    -- Visibility & Access
    is_public BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_system_category BOOLEAN DEFAULT FALSE,

    -- Content Type Support
    supports_articles BOOLEAN DEFAULT TRUE,
    supports_qa BOOLEAN DEFAULT TRUE,
    supports_faq BOOLEAN DEFAULT TRUE,

    -- SEO & Frontend
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT[],

    -- Statistics & Analytics
    total_content_count INTEGER DEFAULT 0,
    article_count INTEGER DEFAULT 0,
    qa_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    search_count INTEGER DEFAULT 0,

    -- AI Training & Processing
    is_ai_trainable BOOLEAN DEFAULT TRUE,
    ai_category_embeddings JSONB DEFAULT '{}',
    ai_processing_priority INTEGER DEFAULT 5, -- 1-10 scale

    -- Configuration
    auto_categorize BOOLEAN DEFAULT FALSE,
    category_rules JSONB DEFAULT '{}', -- Auto-categorization rules

    -- System fields
    metadata JSONB DEFAULT '{}',
    status status_type DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(organization_id, slug)
);

-- Enhanced Knowledge Base Items table (replaces knowledge_articles)
CREATE TABLE knowledge_base_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES knowledge_base_categories(id) ON DELETE CASCADE,

    -- Basic Information
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL,
    description TEXT, -- Short description from UI
    content_type VARCHAR(20) NOT NULL DEFAULT 'article' CHECK (content_type IN ('article', 'qa_collection', 'faq', 'guide', 'tutorial')),

    -- Content (for article type)
    content TEXT,
    summary TEXT,
    excerpt TEXT,

    -- Content Management
    tags TEXT[],
    keywords TEXT[],
    language language_type DEFAULT 'indonesia',
    difficulty_level objective_level DEFAULT 'basic',
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    estimated_read_time INTEGER,
    word_count INTEGER DEFAULT 0,

    -- SEO & Frontend
    meta_title VARCHAR(255),
    meta_description TEXT,
    featured_image_url VARCHAR(500),

    -- Publishing & Visibility
    is_featured BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    is_searchable BOOLEAN DEFAULT TRUE,
    is_ai_trainable BOOLEAN DEFAULT TRUE,
    requires_approval BOOLEAN DEFAULT FALSE,

    -- Workflow & Status
    workflow_status VARCHAR(20) DEFAULT 'draft' CHECK (workflow_status IN ('draft', 'review', 'approved', 'published', 'archived')),
    approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'auto_approved')),

    -- Author & Editorial
    author_id UUID REFERENCES users(id),
    reviewer_id UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    published_at TIMESTAMPTZ,
    last_reviewed_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,

    -- Analytics & Engagement
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    search_hit_count INTEGER DEFAULT 0,
    ai_usage_count INTEGER DEFAULT 0,

    -- AI & Search Enhancement
    embeddings_data JSONB DEFAULT '{}',
    embeddings_vector JSONB DEFAULT '{}', -- OpenAI embeddings (JSON format)
    search_vector TSVECTOR,
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_confidence_score NUMERIC(3,2),
    ai_last_processed_at TIMESTAMPTZ,

    -- Version Control & History
    version INTEGER DEFAULT 1,
    previous_version_id UUID REFERENCES knowledge_base_items(id),
    is_latest_version BOOLEAN DEFAULT TRUE,
    change_summary TEXT,

    -- Performance & Quality Metrics
    quality_score NUMERIC(3,2), -- 0.00 to 1.00
    effectiveness_score NUMERIC(3,2), -- Based on user feedback
    last_effectiveness_update TIMESTAMPTZ,

    -- System fields
    metadata JSONB DEFAULT '{}',
    configuration JSONB DEFAULT '{}',
    status status_type DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(organization_id, slug)
);

-- Q&A Items table (normalized from the UI structure)
CREATE TABLE knowledge_qa_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    knowledge_item_id UUID NOT NULL REFERENCES knowledge_base_items(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Q&A Content
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    question_variations TEXT[], -- Alternative ways to ask the same question
    answer_variations TEXT[], -- Alternative answers for variety

    -- Context & Metadata
    context TEXT, -- When this Q&A should be used
    intent VARCHAR(100), -- Intent classification
    confidence_level VARCHAR(20) DEFAULT 'high' CHECK (confidence_level IN ('low', 'medium', 'high')),

    -- Keywords & Search
    keywords TEXT[],
    search_keywords TEXT[], -- Specific keywords for search matching
    trigger_phrases TEXT[], -- Phrases that should trigger this Q&A

    -- Conditions & Rules
    conditions JSONB DEFAULT '{}', -- When this Q&A should be shown
    response_rules JSONB DEFAULT '{}', -- How the response should be formatted

    -- Performance Metrics
    usage_count INTEGER DEFAULT 0,
    success_rate NUMERIC(5,2) DEFAULT 0,
    user_satisfaction NUMERIC(3,2) DEFAULT 0,
    last_used_at TIMESTAMPTZ,

    -- AI Enhancement
    ai_confidence NUMERIC(3,2),
    ai_embeddings JSONB DEFAULT '{}',
    ai_last_trained_at TIMESTAMPTZ,
    search_vector TSVECTOR, -- Full-text search vector

    -- Order & Priority
    order_index INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE, -- Primary Q&A for the knowledge item
    is_active BOOLEAN DEFAULT TRUE,

    -- System fields
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge Base Tags table (enhanced tagging system)
CREATE TABLE knowledge_base_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Tag Information
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280',
    icon VARCHAR(50),

    -- Tag Classification
    tag_type VARCHAR(20) DEFAULT 'general' CHECK (tag_type IN ('general', 'category', 'topic', 'skill', 'department', 'product', 'service')),
    parent_tag_id UUID REFERENCES knowledge_base_tags(id),

    -- Usage Statistics
    usage_count INTEGER DEFAULT 0,
    item_count INTEGER DEFAULT 0,

    -- Configuration
    is_system_tag BOOLEAN DEFAULT FALSE,
    is_auto_suggested BOOLEAN DEFAULT TRUE,
    auto_apply_rules JSONB DEFAULT '{}',

    -- System fields
    status status_type DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(organization_id, slug)
);

-- Knowledge Base Item Tags junction table
CREATE TABLE knowledge_base_item_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    knowledge_item_id UUID NOT NULL REFERENCES knowledge_base_items(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES knowledge_base_tags(id) ON DELETE CASCADE,

    -- Tag Assignment Details
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_auto_assigned BOOLEAN DEFAULT FALSE,
    confidence_score NUMERIC(3,2), -- For AI-assigned tags

    UNIQUE(knowledge_item_id, tag_id)
);

-- Knowledge Base Item Relationships table
CREATE TABLE knowledge_base_item_relationships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    source_item_id UUID NOT NULL REFERENCES knowledge_base_items(id) ON DELETE CASCADE,
    target_item_id UUID NOT NULL REFERENCES knowledge_base_items(id) ON DELETE CASCADE,

    -- Relationship Details
    relationship_type VARCHAR(50) NOT NULL CHECK (relationship_type IN ('related', 'prerequisite', 'followup', 'alternative', 'supersedes', 'references')),
    strength NUMERIC(3,2) DEFAULT 0.5, -- 0.0 to 1.0
    description TEXT,

    -- Auto-discovery
    is_auto_discovered BOOLEAN DEFAULT FALSE,
    discovery_method VARCHAR(50), -- 'ai_similarity', 'user_behavior', 'manual'
    discovery_confidence NUMERIC(3,2),

    -- System fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(source_item_id, target_item_id, relationship_type)
);

-- Bot Personalities table (Enhanced)
CREATE TABLE bot_personalities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,

    -- AI Model Configuration
    ai_model_id UUID REFERENCES ai_models(id),

    -- Language & Communication
    language language_type NOT NULL,
    tone VARCHAR(50),
    communication_style VARCHAR(50),
    formality_level VARCHAR(20) DEFAULT 'formal',

    -- UI Customization
    avatar_url VARCHAR(500),
    color_scheme JSONB DEFAULT '{"primary": "#3B82F6", "secondary": "#10B981"}',

    -- Messages & Responses
    greeting_message TEXT,
    farewell_message TEXT,
    error_message TEXT,
    waiting_message TEXT,
    transfer_message TEXT,
    fallback_message TEXT,

    -- AI Configuration
    system_message TEXT,
    personality_traits JSONB DEFAULT '{}',
    custom_vocabulary JSONB DEFAULT '{}',
    response_templates JSONB DEFAULT '{}',
    conversation_starters TEXT[],

    -- Behavior Settings
    response_delay_ms INTEGER DEFAULT 1000,
    typing_indicator BOOLEAN DEFAULT TRUE,
    max_response_length INTEGER DEFAULT 1000,
    enable_small_talk BOOLEAN DEFAULT TRUE,
    confidence_threshold DECIMAL(3,2) DEFAULT 0.7,

    -- Learning & Training
    learning_enabled BOOLEAN DEFAULT TRUE,
    training_data_sources TEXT[],
    last_trained_at TIMESTAMPTZ,

    -- Performance Metrics
    total_conversations INTEGER DEFAULT 0,
    avg_satisfaction_score DECIMAL(3,2) DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,

    -- System fields
    is_default BOOLEAN DEFAULT FALSE,
    status status_type DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(organization_id, code)
);

-- Channel Configs table (Enhanced)
CREATE TABLE channel_configs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    channel channel_type NOT NULL,
    channel_identifier VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,

    -- Bot Configuration
    personality_id UUID REFERENCES bot_personalities(id),

    -- Connection Settings
    webhook_url VARCHAR(500),
    api_key_encrypted TEXT,
    api_secret_encrypted TEXT,
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,

    -- Channel-specific Settings
    settings JSONB DEFAULT '{}',
    rate_limits JSONB DEFAULT '{"messages_per_minute": 60, "messages_per_hour": 1000}',

    -- UI Configuration
    widget_config JSONB DEFAULT '{}',
    theme_config JSONB DEFAULT '{}',

    -- Features & Capabilities
    supported_message_types message_type[] DEFAULT ARRAY['text']::message_type[],
    features JSONB DEFAULT '{"typing_indicator": true, "read_receipts": true, "file_upload": false}',

    -- Status & Health
    is_active BOOLEAN DEFAULT TRUE,
    health_status VARCHAR(20) DEFAULT 'unknown',
    last_connected_at TIMESTAMPTZ,
    last_error TEXT,
    connection_attempts INTEGER DEFAULT 0,

    -- Analytics
    total_messages_sent INTEGER DEFAULT 0,
    total_messages_received INTEGER DEFAULT 0,
    uptime_percentage DECIMAL(5,2) DEFAULT 100,

    -- System fields
    status status_type DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(organization_id, channel, channel_identifier)
);

-- Customers table (Enhanced)
CREATE TABLE customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    external_id VARCHAR(255),

    -- Basic Information
    name VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),

    -- Channel Information
    channel channel_type NOT NULL,
    channel_user_id VARCHAR(255) NOT NULL,

    -- Profile & Preferences
    avatar_url VARCHAR(500),
    language language_type DEFAULT 'indonesia',
    timezone VARCHAR(100) DEFAULT 'Asia/Jakarta',
    profile_data JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',

    -- Segmentation & Marketing
    tags TEXT[],
    segments TEXT[],
    source VARCHAR(100),
    utm_data JSONB DEFAULT '{}',

    -- Interaction History
    last_interaction_at TIMESTAMPTZ,
    total_interactions INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    avg_response_time INTEGER,
    satisfaction_score NUMERIC(3,2),

    -- Behavioral Data
    interaction_patterns JSONB DEFAULT '{}',
    interests TEXT[],
    purchase_history JSONB DEFAULT '[]',

    -- AI Insights
    sentiment_history JSONB DEFAULT '[]',
    intent_patterns JSONB DEFAULT '{}',
    engagement_score DECIMAL(3,2) DEFAULT 0,

    -- System fields
    notes TEXT,
    status status_type DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(organization_id, channel, channel_user_id)
);

-- Agents table (Enhanced)
CREATE TABLE agents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    agent_code VARCHAR(50) UNIQUE NOT NULL,

    -- Profile Information
    display_name VARCHAR(255),
    department VARCHAR(100),
    job_title VARCHAR(100),
    specialization TEXT[],
    bio TEXT,

    -- Capacity & Availability
    max_concurrent_chats INTEGER DEFAULT 5,
    current_active_chats INTEGER DEFAULT 0,
    availability_status VARCHAR(20) DEFAULT 'offline',
    auto_accept_chats BOOLEAN DEFAULT FALSE,

    -- Working Schedule
    working_hours JSONB DEFAULT '{}',
    breaks JSONB DEFAULT '[]',
    time_off JSONB DEFAULT '[]',

    -- Skills & Languages
    skills TEXT[],
    languages language_type[] DEFAULT ARRAY['indonesia']::language_type[],
    expertise_areas TEXT[],
    certifications TEXT[],

    -- Performance Metrics
    performance_metrics JSONB DEFAULT '{"response_time": 0, "resolution_rate": 0, "satisfaction": 0}',
    rating NUMERIC(3,2) DEFAULT 0.00,
    total_handled_chats INTEGER DEFAULT 0,
    total_resolved_chats INTEGER DEFAULT 0,
    avg_response_time INTEGER,
    avg_resolution_time INTEGER,

    -- AI Assistance
    ai_suggestions_enabled BOOLEAN DEFAULT TRUE,
    ai_auto_responses_enabled BOOLEAN DEFAULT FALSE,

    -- Gamification & Motivation
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    badges TEXT[],
    achievements JSONB DEFAULT '[]',

    -- System fields
    status status_type DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Chat Sessions table (Enhanced with partitioning support)
CREATE TABLE chat_sessions (
    id UUID DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    channel_config_id UUID NOT NULL REFERENCES channel_configs(id),
    agent_id UUID REFERENCES agents(id),

    -- Session Information
    session_token VARCHAR(255) NOT NULL,
    session_type VARCHAR(20) DEFAULT 'customer_initiated',

    -- Timing
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    first_response_at TIMESTAMPTZ,

    -- Status & Flow
    is_active BOOLEAN DEFAULT TRUE,
    is_bot_session BOOLEAN DEFAULT TRUE,
    handover_reason TEXT,
    handover_at TIMESTAMPTZ,

    -- Analytics & Metrics
    total_messages INTEGER DEFAULT 0,
    customer_messages INTEGER DEFAULT 0,
    bot_messages INTEGER DEFAULT 0,
    agent_messages INTEGER DEFAULT 0,
    response_time_avg INTEGER,
    resolution_time INTEGER,
    wait_time INTEGER,

    -- Quality & Feedback
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    feedback_text TEXT,
    feedback_tags TEXT[],
    csat_submitted_at TIMESTAMPTZ,

    -- Categorization
    intent VARCHAR(100),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'normal',
    tags TEXT[],

    -- Resolution
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolution_type VARCHAR(50),
    resolution_notes TEXT,

    -- AI Analytics
    sentiment_analysis JSONB DEFAULT '{}',
    ai_summary TEXT,
    topics_discussed TEXT[],

    -- System fields
    session_data JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create partitions for chat_sessions (monthly partitions)
CREATE TABLE chat_sessions_2024_01 PARTITION OF chat_sessions
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE chat_sessions_2024_02 PARTITION OF chat_sessions
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
CREATE TABLE chat_sessions_2024_03 PARTITION OF chat_sessions
    FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');
CREATE TABLE chat_sessions_2024_04 PARTITION OF chat_sessions
    FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');
CREATE TABLE chat_sessions_2024_05 PARTITION OF chat_sessions
    FOR VALUES FROM ('2024-05-01') TO ('2024-06-01');
CREATE TABLE chat_sessions_2024_06 PARTITION OF chat_sessions
    FOR VALUES FROM ('2024-06-01') TO ('2024-07-01');
CREATE TABLE chat_sessions_2024_07 PARTITION OF chat_sessions
    FOR VALUES FROM ('2024-07-01') TO ('2024-08-01');
CREATE TABLE chat_sessions_2024_08 PARTITION OF chat_sessions
    FOR VALUES FROM ('2024-08-01') TO ('2024-09-01');
CREATE TABLE chat_sessions_2024_09 PARTITION OF chat_sessions
    FOR VALUES FROM ('2024-09-01') TO ('2024-10-01');
CREATE TABLE chat_sessions_2024_10 PARTITION OF chat_sessions
    FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');
CREATE TABLE chat_sessions_2024_11 PARTITION OF chat_sessions
    FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');
CREATE TABLE chat_sessions_2024_12 PARTITION OF chat_sessions
    FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

-- Messages table (Enhanced with partitioning)
CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL, -- Reference to chat_sessions
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Sender Information
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('customer', 'bot', 'agent', 'system')),
    sender_id UUID,
    sender_name VARCHAR(255),

    -- Message Content
    message_text TEXT,
    message_type message_type DEFAULT 'text',

    -- Rich Media
    media_url VARCHAR(500),
    media_type VARCHAR(50),
    media_size INTEGER,
    media_metadata JSONB DEFAULT '{}',
    thumbnail_url VARCHAR(500),

    -- Interactive Elements
    quick_replies JSONB,
    buttons JSONB,
    template_data JSONB,

    -- AI & Intent
    intent VARCHAR(100),
    entities JSONB DEFAULT '{}',
    confidence_score NUMERIC(3,2),
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_model_used VARCHAR(100),

    -- Sentiment Analysis
    sentiment_score DECIMAL(3,2),
    sentiment_label VARCHAR(20),
    emotion_scores JSONB DEFAULT '{}',

    -- Status & Delivery
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    failed_reason TEXT,

    -- Threading & Context
    reply_to_message_id UUID, -- Self-reference
    thread_id UUID,
    context JSONB DEFAULT '{}',

    -- Performance
    processing_time_ms INTEGER,

    -- System fields
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create partitions for messages (monthly partitions)
CREATE TABLE messages_2024_01 PARTITION OF messages
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE messages_2024_02 PARTITION OF messages
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
CREATE TABLE messages_2024_03 PARTITION OF messages
    FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');
CREATE TABLE messages_2024_04 PARTITION OF messages
    FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');
CREATE TABLE messages_2024_05 PARTITION OF messages
    FOR VALUES FROM ('2024-05-01') TO ('2024-06-01');
CREATE TABLE messages_2024_06 PARTITION OF messages
    FOR VALUES FROM ('2024-06-01') TO ('2024-07-01');
CREATE TABLE messages_2024_07 PARTITION OF messages
    FOR VALUES FROM ('2024-07-01') TO ('2024-08-01');
CREATE TABLE messages_2024_08 PARTITION OF messages
    FOR VALUES FROM ('2024-08-01') TO ('2024-09-01');
CREATE TABLE messages_2024_09 PARTITION OF messages
    FOR VALUES FROM ('2024-09-01') TO ('2024-10-01');
CREATE TABLE messages_2024_10 PARTITION OF messages
    FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');
CREATE TABLE messages_2024_11 PARTITION OF messages
    FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');
CREATE TABLE messages_2024_12 PARTITION OF messages
    FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

-- AI Training Data table
CREATE TABLE ai_training_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    source_type VARCHAR(50) NOT NULL, -- 'conversation', 'knowledge_article', 'manual'
    source_id UUID,

    -- Training Content
    input_text TEXT NOT NULL,
    expected_output TEXT,
    context TEXT,
    intent VARCHAR(100),
    entities JSONB DEFAULT '{}',

    -- Quality & Validation
    is_validated BOOLEAN DEFAULT FALSE,
    validation_score DECIMAL(3,2),
    human_reviewed BOOLEAN DEFAULT FALSE,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,

    -- Training Metadata
    language language_type DEFAULT 'indonesia',
    difficulty_level objective_level DEFAULT 'basic',
    training_tags TEXT[],

    -- System fields
    status status_type DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- AI Conversations Log table
CREATE TABLE ai_conversations_log (
    id UUID DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    session_id UUID,
    message_id UUID,

    -- AI Request Details
    ai_model_id UUID REFERENCES ai_models(id),
    prompt TEXT NOT NULL,
    response TEXT,

    -- Performance Metrics
    response_time_ms INTEGER,
    token_count_input INTEGER,
    token_count_output INTEGER,
    cost_usd DECIMAL(10,6),

    -- Quality Metrics
    confidence_score DECIMAL(3,2),
    user_feedback INTEGER CHECK (user_feedback >= -1 AND user_feedback <= 1), -- -1: negative, 0: neutral, 1: positive

    -- Error Handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,

    -- System fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create partitions for ai_conversations_log (monthly)
CREATE TABLE ai_conversations_log_2024_01 PARTITION OF ai_conversations_log
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE ai_conversations_log_2024_02 PARTITION OF ai_conversations_log
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
CREATE TABLE ai_conversations_log_2024_03 PARTITION OF ai_conversations_log
    FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');

-- Audit Logs table (Enhanced)
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Action Details
    action audit_action NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    resource_name VARCHAR(255),

    -- Change Details
    old_values JSONB,
    new_values JSONB,
    changes JSONB,

    -- Request Context
    ip_address INET,
    user_agent TEXT,
    api_key_id UUID REFERENCES api_keys(id),
    session_id VARCHAR(255),

    -- Additional Context
    description TEXT,
    severity VARCHAR(20) DEFAULT 'info',

    -- System fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create partitions for audit_logs (monthly)
CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE audit_logs_2024_02 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
CREATE TABLE audit_logs_2024_03 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');

-- API Rate Limiting table
CREATE TABLE api_rate_limits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
    ip_address INET,

    -- Rate Limiting
    endpoint VARCHAR(255),
    method VARCHAR(10),
    requests_count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    window_duration_seconds INTEGER DEFAULT 60,

    -- System fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Analytics Daily table (Enhanced)
CREATE TABLE analytics_daily (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    date DATE NOT NULL,

    -- Session Metrics
    total_sessions INTEGER DEFAULT 0,
    bot_sessions INTEGER DEFAULT 0,
    agent_sessions INTEGER DEFAULT 0,
    handover_count INTEGER DEFAULT 0,

    -- Message Metrics
    total_messages INTEGER DEFAULT 0,
    customer_messages INTEGER DEFAULT 0,
    bot_messages INTEGER DEFAULT 0,
    agent_messages INTEGER DEFAULT 0,

    -- User Metrics
    unique_customers INTEGER DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    returning_customers INTEGER DEFAULT 0,
    active_agents INTEGER DEFAULT 0,

    -- Performance Metrics
    avg_session_duration INTEGER,
    avg_response_time INTEGER,
    avg_resolution_time INTEGER,
    avg_wait_time INTEGER,
    first_response_time INTEGER,

    -- Quality Metrics
    satisfaction_avg NUMERIC(3,2),
    satisfaction_count INTEGER DEFAULT 0,
    resolution_rate NUMERIC(5,2),
    escalation_rate NUMERIC(5,2),

    -- AI Metrics
    ai_requests_count INTEGER DEFAULT 0,
    ai_success_rate NUMERIC(5,2),
    ai_avg_confidence NUMERIC(3,2),
    ai_cost_usd DECIMAL(10,2) DEFAULT 0,

    -- Channel Breakdown
    channel_breakdown JSONB DEFAULT '{}',

    -- Popular Content
    top_intents JSONB DEFAULT '[]',
    top_articles JSONB DEFAULT '[]',
    top_searches JSONB DEFAULT '[]',

    -- Agent Performance
    agent_performance JSONB DEFAULT '{}',

    -- Time Analysis
    peak_hours JSONB DEFAULT '{}',
    hourly_distribution JSONB DEFAULT '{}',

    -- Error & Issues
    error_count INTEGER DEFAULT 0,
    bot_fallback_count INTEGER DEFAULT 0,

    -- Usage & Billing
    usage_metrics JSONB DEFAULT '{}',

    -- System fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(organization_id, date)
);

-- Webhooks table
CREATE TABLE webhooks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,

    -- Configuration
    events TEXT[] NOT NULL, -- ['message.sent', 'session.started', etc.]
    secret VARCHAR(255),
    headers JSONB DEFAULT '{}',

    -- Status & Health
    is_active BOOLEAN DEFAULT TRUE,
    last_triggered_at TIMESTAMPTZ,
    last_success_at TIMESTAMPTZ,
    last_failure_at TIMESTAMPTZ,
    failure_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,

    -- System fields
    status status_type DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Webhook Deliveries table
CREATE TABLE webhook_deliveries (
    id UUID DEFAULT uuid_generate_v4(),
    webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,

    -- Delivery Details
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,

    -- HTTP Details
    http_status INTEGER,
    response_body TEXT,
    response_headers JSONB,

    -- Timing
    delivered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    response_time_ms INTEGER,

    -- Retry Logic
    attempt_number INTEGER DEFAULT 1,
    is_success BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    next_retry_at TIMESTAMPTZ,

    -- System fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- N8N Workflows table
CREATE TABLE n8n_workflows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Workflow Identity
    workflow_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    tags TEXT[],

    -- Workflow Definition
    workflow_data JSONB NOT NULL,
    nodes JSONB DEFAULT '[]',
    connections JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',

    -- Execution Configuration
    trigger_type VARCHAR(50), -- 'webhook', 'schedule', 'manual', 'event'
    trigger_config JSONB DEFAULT '{}',
    schedule_expression VARCHAR(100), -- cron expression

    -- Version Control
    version INTEGER DEFAULT 1,
    previous_version_id UUID REFERENCES n8n_workflows(id),
    is_latest_version BOOLEAN DEFAULT TRUE,

    -- Status & Health
    status workflow_status DEFAULT 'inactive',
    is_enabled BOOLEAN DEFAULT FALSE,
    last_execution_at TIMESTAMPTZ,
    next_execution_at TIMESTAMPTZ,

    -- Performance Metrics
    total_executions INTEGER DEFAULT 0,
    successful_executions INTEGER DEFAULT 0,
    failed_executions INTEGER DEFAULT 0,
    avg_execution_time INTEGER, -- milliseconds

    -- Access Control
    created_by UUID REFERENCES users(id),
    shared_with JSONB DEFAULT '[]', -- array of user IDs with access
    permissions JSONB DEFAULT '{"read": [], "write": [], "execute": []}',

    -- Integration
    webhook_url VARCHAR(500),
    webhook_secret VARCHAR(255),
    api_endpoints JSONB DEFAULT '[]',

    -- System fields
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- N8N Executions table (partitioned for performance)
CREATE TABLE n8n_executions (
    id UUID DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES n8n_workflows(id) ON DELETE CASCADE,

    -- Execution Identity
    execution_id VARCHAR(255) NOT NULL,
    parent_execution_id VARCHAR(255), -- for sub-workflows

    -- Execution Details
    status execution_status DEFAULT 'running',
    mode VARCHAR(20) DEFAULT 'trigger', -- 'trigger', 'manual', 'retry'

    -- Timing
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMPTZ,
    duration_ms INTEGER,

    -- Data Flow
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    execution_data JSONB DEFAULT '{}',

    -- Error Handling
    error_message TEXT,
    error_details JSONB DEFAULT '{}',
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,

    -- Node Execution Details
    node_executions JSONB DEFAULT '[]',
    failed_nodes JSONB DEFAULT '[]',

    -- Performance
    memory_usage_mb INTEGER,
    cpu_usage_percent DECIMAL(5,2),

    -- Webhook/Trigger Info
    trigger_data JSONB DEFAULT '{}',
    webhook_response JSONB DEFAULT '{}',

    -- System fields
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Payment Transactions table
CREATE TABLE payment_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),
    invoice_id UUID REFERENCES billing_invoices(id),

    -- Transaction Identity
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    external_transaction_id VARCHAR(255), -- Gateway transaction ID
    reference_number VARCHAR(100),

    -- Payment Details
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'IDR',
    exchange_rate DECIMAL(10,6) DEFAULT 1.0,
    amount_original DECIMAL(12,2), -- in original currency
    currency_original VARCHAR(3),

    -- Payment Method
    payment_method VARCHAR(50) NOT NULL, -- 'credit_card', 'bank_transfer', 'e_wallet', 'crypto'
    payment_gateway VARCHAR(50) NOT NULL, -- 'midtrans', 'xendit', 'stripe', 'paypal'
    payment_channel VARCHAR(50), -- specific channel like 'bca_va', 'gopay', etc.

    -- Card/Account Details (encrypted)
    card_last_four VARCHAR(4),
    card_brand VARCHAR(20),
    account_name VARCHAR(255),
    account_number_masked VARCHAR(50),

    -- Transaction Flow
    status transaction_status DEFAULT 'pending',
    payment_type VARCHAR(20) DEFAULT 'one_time', -- 'one_time', 'recurring', 'refund'

    -- Timing
    initiated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    authorized_at TIMESTAMPTZ,
    captured_at TIMESTAMPTZ,
    settled_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,

    -- Gateway Response
    gateway_response JSONB DEFAULT '{}',
    gateway_fee DECIMAL(10,2) DEFAULT 0,
    gateway_status VARCHAR(50),
    gateway_message TEXT,

    -- Fraud & Security
    fraud_score DECIMAL(3,2),
    risk_assessment JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,

    -- Fees & Charges
    platform_fee DECIMAL(10,2) DEFAULT 0,
    processing_fee DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(12,2),

    -- Refund Information
    refund_amount DECIMAL(12,2) DEFAULT 0,
    refunded_at TIMESTAMPTZ,
    refund_reason TEXT,

    -- System fields
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Realtime Metrics table (partitioned for high-volume data)
CREATE TABLE realtime_metrics (
    id UUID DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

    -- Metric Identity
    metric_name VARCHAR(255) NOT NULL,
    metric_type metric_type NOT NULL,
    namespace VARCHAR(100) DEFAULT 'default',

    -- Metric Value
    value DECIMAL(15,6) NOT NULL,
    unit VARCHAR(20),

    -- Dimensions/Labels
    labels JSONB DEFAULT '{}',
    dimensions JSONB DEFAULT '{}',

    -- Source Information
    source VARCHAR(100), -- 'system', 'application', 'external'
    component VARCHAR(100), -- specific component that generated the metric
    instance_id VARCHAR(100), -- server/container instance

    -- Aggregation Support
    aggregation_period VARCHAR(20), -- '1m', '5m', '1h', '1d'
    aggregation_type VARCHAR(20), -- 'sum', 'avg', 'min', 'max', 'count'

    -- Time Information
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- Additional Context
    context JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',

    -- System fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- System Logs table (partitioned for high-volume logging)
CREATE TABLE system_logs (
    id UUID DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

    -- Log Identity
    level log_level NOT NULL,
    logger_name VARCHAR(255),

    -- Message Content
    message TEXT NOT NULL,
    formatted_message TEXT,

    -- Context Information
    component VARCHAR(100), -- 'api', 'worker', 'scheduler', 'webhook'
    service VARCHAR(100), -- specific service name
    instance_id VARCHAR(100), -- server/container instance

    -- Request Context
    request_id VARCHAR(255),
    session_id VARCHAR(255),
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,

    -- Error Details
    error_code VARCHAR(50),
    error_type VARCHAR(100),
    stack_trace TEXT,

    -- Performance
    duration_ms INTEGER,
    memory_usage_mb INTEGER,
    cpu_usage_percent DECIMAL(5,2),

    -- Additional Data
    extra_data JSONB DEFAULT '{}',
    tags TEXT[],

    -- System fields
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create partitions for new tables (2024 partitions)
CREATE TABLE n8n_executions_2024_01 PARTITION OF n8n_executions
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE n8n_executions_2024_02 PARTITION OF n8n_executions
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
CREATE TABLE n8n_executions_2024_03 PARTITION OF n8n_executions
    FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');
CREATE TABLE n8n_executions_2024_04 PARTITION OF n8n_executions
    FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');
CREATE TABLE n8n_executions_2024_05 PARTITION OF n8n_executions
    FOR VALUES FROM ('2024-05-01') TO ('2024-06-01');
CREATE TABLE n8n_executions_2024_06 PARTITION OF n8n_executions
    FOR VALUES FROM ('2024-06-01') TO ('2024-07-01');
CREATE TABLE n8n_executions_2024_07 PARTITION OF n8n_executions
    FOR VALUES FROM ('2024-07-01') TO ('2024-08-01');
CREATE TABLE n8n_executions_2024_08 PARTITION OF n8n_executions
    FOR VALUES FROM ('2024-08-01') TO ('2024-09-01');
CREATE TABLE n8n_executions_2024_09 PARTITION OF n8n_executions
    FOR VALUES FROM ('2024-09-01') TO ('2024-10-01');
CREATE TABLE n8n_executions_2024_10 PARTITION OF n8n_executions
    FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');
CREATE TABLE n8n_executions_2024_11 PARTITION OF n8n_executions
    FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');
CREATE TABLE n8n_executions_2024_12 PARTITION OF n8n_executions
    FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

CREATE TABLE realtime_metrics_2024_01 PARTITION OF realtime_metrics
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE realtime_metrics_2024_02 PARTITION OF realtime_metrics
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
CREATE TABLE realtime_metrics_2024_03 PARTITION OF realtime_metrics
    FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');
CREATE TABLE realtime_metrics_2024_04 PARTITION OF realtime_metrics
    FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');
CREATE TABLE realtime_metrics_2024_05 PARTITION OF realtime_metrics
    FOR VALUES FROM ('2024-05-01') TO ('2024-06-01');
CREATE TABLE realtime_metrics_2024_06 PARTITION OF realtime_metrics
    FOR VALUES FROM ('2024-06-01') TO ('2024-07-01');
CREATE TABLE realtime_metrics_2024_07 PARTITION OF realtime_metrics
    FOR VALUES FROM ('2024-07-01') TO ('2024-08-01');
CREATE TABLE realtime_metrics_2024_08 PARTITION OF realtime_metrics
    FOR VALUES FROM ('2024-08-01') TO ('2024-09-01');
CREATE TABLE realtime_metrics_2024_09 PARTITION OF realtime_metrics
    FOR VALUES FROM ('2024-09-01') TO ('2024-10-01');
CREATE TABLE realtime_metrics_2024_10 PARTITION OF realtime_metrics
    FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');
CREATE TABLE realtime_metrics_2024_11 PARTITION OF realtime_metrics
    FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');
CREATE TABLE realtime_metrics_2024_12 PARTITION OF realtime_metrics
    FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

CREATE TABLE system_logs_2024_01 PARTITION OF system_logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE system_logs_2024_02 PARTITION OF system_logs
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
CREATE TABLE system_logs_2024_03 PARTITION OF system_logs
    FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');
CREATE TABLE system_logs_2024_04 PARTITION OF system_logs
    FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');
CREATE TABLE system_logs_2024_05 PARTITION OF system_logs
    FOR VALUES FROM ('2024-05-01') TO ('2024-06-01');
CREATE TABLE system_logs_2024_06 PARTITION OF system_logs
    FOR VALUES FROM ('2024-06-01') TO ('2024-07-01');
CREATE TABLE system_logs_2024_07 PARTITION OF system_logs
    FOR VALUES FROM ('2024-07-01') TO ('2024-08-01');
CREATE TABLE system_logs_2024_08 PARTITION OF system_logs
    FOR VALUES FROM ('2024-08-01') TO ('2024-09-01');
CREATE TABLE system_logs_2024_09 PARTITION OF system_logs
    FOR VALUES FROM ('2024-09-01') TO ('2024-10-01');
CREATE TABLE system_logs_2024_10 PARTITION OF system_logs
    FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');
CREATE TABLE system_logs_2024_11 PARTITION OF system_logs
    FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');
CREATE TABLE system_logs_2024_12 PARTITION OF system_logs
    FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

-- Roles table for RBAC system
CREATE TABLE roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Role Identity
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,

    -- Role Configuration
    scope permission_scope DEFAULT 'organization',
    level INTEGER DEFAULT 1, -- hierarchy level (1 = highest)
    is_system_role BOOLEAN DEFAULT FALSE, -- system-defined vs custom
    is_default BOOLEAN DEFAULT FALSE,

    -- Inheritance
    parent_role_id UUID REFERENCES roles(id),
    inherits_permissions BOOLEAN DEFAULT TRUE,

    -- Access Control
    max_users INTEGER, -- limit number of users with this role
    current_users INTEGER DEFAULT 0,

    -- UI/UX
    color VARCHAR(7) DEFAULT '#6B7280',
    icon VARCHAR(50),
    badge_text VARCHAR(20),

    -- System fields
    metadata JSONB DEFAULT '{}',
    status status_type DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(organization_id, code)
);

-- Permissions table for granular access control
CREATE TABLE permissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

    -- Permission Identity
    name VARCHAR(100) NOT NULL,
    code VARCHAR(100) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,

    -- Permission Details
    resource resource_type NOT NULL,
    action permission_action NOT NULL,
    scope permission_scope DEFAULT 'organization',

    -- Conditions & Constraints
    conditions JSONB DEFAULT '{}', -- JSON conditions for dynamic permissions
    constraints JSONB DEFAULT '{}', -- field-level constraints

    -- Grouping
    category VARCHAR(100), -- 'user_management', 'content', 'billing', etc.
    group_name VARCHAR(100),

    -- System fields
    is_system_permission BOOLEAN DEFAULT FALSE,
    is_dangerous BOOLEAN DEFAULT FALSE, -- requires extra confirmation
    requires_approval BOOLEAN DEFAULT FALSE,

    -- UI/UX
    sort_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,

    -- System fields
    metadata JSONB DEFAULT '{}',
    status status_type DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(organization_id, code),
    UNIQUE(resource, action, scope, organization_id)
);

-- Role Permissions junction table
CREATE TABLE role_permissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,

    -- Permission Configuration
    is_granted BOOLEAN DEFAULT TRUE,
    is_inherited BOOLEAN DEFAULT FALSE, -- inherited from parent role

    -- Conditions & Overrides
    conditions JSONB DEFAULT '{}', -- role-specific conditions
    constraints JSONB DEFAULT '{}', -- role-specific constraints

    -- Audit
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- System fields
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(role_id, permission_id)
);

-- User Roles junction table (enhanced)
CREATE TABLE user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,

    -- Assignment Details
    is_active BOOLEAN DEFAULT TRUE,
    is_primary BOOLEAN DEFAULT FALSE, -- primary role for the user

    -- Scope & Context
    scope permission_scope DEFAULT 'organization',
    scope_context JSONB DEFAULT '{}', -- department_id, team_id, etc.

    -- Temporal Control
    effective_from TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    effective_until TIMESTAMPTZ, -- for temporary role assignments

    -- Assignment Audit
    assigned_by UUID REFERENCES users(id),
    assigned_reason TEXT,

    -- System fields
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, role_id, scope)
);

-- Permission Groups table (for organizing permissions)
CREATE TABLE permission_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

    -- Group Identity
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,

    -- Grouping
    category VARCHAR(100),
    parent_group_id UUID REFERENCES permission_groups(id),

    -- UI/UX
    icon VARCHAR(50),
    color VARCHAR(7) DEFAULT '#6B7280',
    sort_order INTEGER DEFAULT 0,

    -- System fields
    status status_type DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(organization_id, code)
);

-- Permission Group Permissions junction table
CREATE TABLE permission_group_permissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES permission_groups(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,

    -- System fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(group_id, permission_id)
);

-- ========================================
-- WAHA (WhatsApp HTTP API) Integration Tables
-- ========================================

-- WAHA Sessions table (Enhanced WhatsApp session management)
CREATE TABLE waha_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    channel_config_id UUID NOT NULL REFERENCES channel_configs(id) ON DELETE CASCADE,

    -- Session Identity
    session_name VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    instance_id VARCHAR(255) UNIQUE NOT NULL,

    -- Connection Status
    status VARCHAR(20) DEFAULT 'connecting' CHECK (status IN ('working', 'not_working', 'connecting', 'disconnected', 'error')),
    is_authenticated BOOLEAN DEFAULT FALSE,
    is_connected BOOLEAN DEFAULT FALSE,
    is_ready BOOLEAN DEFAULT FALSE,

    -- Health & Monitoring
    health_status VARCHAR(20) DEFAULT 'unknown' CHECK (health_status IN ('healthy', 'warning', 'critical', 'unknown')),
    last_health_check TIMESTAMPTZ,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,

    -- Business Features
    has_business_features BOOLEAN DEFAULT FALSE,
    business_name VARCHAR(255),
    business_category VARCHAR(100),
    business_description TEXT,
    business_website VARCHAR(255),
    business_email VARCHAR(255),
    business_address TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR(50),
    business_hours JSONB DEFAULT '{}',
    has_catalog BOOLEAN DEFAULT FALSE,
    catalog_enabled BOOLEAN DEFAULT FALSE,
    product_count INTEGER DEFAULT 0,
    labels JSONB DEFAULT '[]',
    label_colors JSONB DEFAULT '{}',
    quick_replies JSONB DEFAULT '[]',
    greeting_message TEXT,
    away_message TEXT,
    shopping_enabled BOOLEAN DEFAULT FALSE,
    payment_enabled BOOLEAN DEFAULT FALSE,
    cart_enabled BOOLEAN DEFAULT FALSE,

    -- Features & Capabilities
    features JSONB DEFAULT '{
        "media_upload": false,
        "voice_messages": false,
        "video_calls": false,
        "group_chat": false,
        "broadcast": false,
        "templates": false,
        "quick_replies": false,
        "labels": false,
        "catalog": false,
        "shopping": false,
        "payment": false
    }',

    -- Rate Limiting
    rate_limits JSONB DEFAULT '{
        "messages_per_minute": 60,
        "messages_per_hour": 1000,
        "media_per_minute": 10,
        "media_per_hour": 100
    }',

    -- Statistics
    total_messages_sent INTEGER DEFAULT 0,
    total_messages_received INTEGER DEFAULT 0,
    total_media_sent INTEGER DEFAULT 0,
    total_media_received INTEGER DEFAULT 0,
    total_contacts INTEGER DEFAULT 0,
    total_groups INTEGER DEFAULT 0,
    last_message_at TIMESTAMPTZ,
    last_media_at TIMESTAMPTZ,

    -- Configuration
    session_config JSONB DEFAULT '{}',
    webhook_config JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',

    -- System fields
    status_type status_type DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- WAHA Messages table (Enhanced WhatsApp message tracking)
CREATE TABLE waha_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES waha_sessions(id) ON DELETE CASCADE,

    -- Message Identity
    message_id VARCHAR(255) UNIQUE NOT NULL,
    chat_id VARCHAR(255) NOT NULL,
    from_me VARCHAR(10) DEFAULT 'false',
    from_number VARCHAR(20) NOT NULL,
    to_number VARCHAR(20) NOT NULL,
    chat_type VARCHAR(20) DEFAULT 'individual',

    -- Message Content
    message_text TEXT,
    message_type VARCHAR(50) DEFAULT 'text',
    media_data JSONB DEFAULT '{}',
    location_data JSONB DEFAULT '{}',
    contact_data JSONB DEFAULT '{}',
    sticker_data JSONB DEFAULT '{}',
    reaction_data JSONB DEFAULT '{}',
    quoted_message_data JSONB DEFAULT '{}',
    forwarded_message_data JSONB DEFAULT '{}',
    reply_data JSONB DEFAULT '{}',
    button_data JSONB DEFAULT '{}',
    list_data JSONB DEFAULT '{}',
    template_data JSONB DEFAULT '{}',
    interactive_data JSONB DEFAULT '{}',
    order_data JSONB DEFAULT '{}',
    product_data JSONB DEFAULT '{}',
    catalog_data JSONB DEFAULT '{}',
    payment_data JSONB DEFAULT '{}',
    system_data JSONB DEFAULT '{}',
    unknown_data JSONB DEFAULT '{}',

    -- Message Status
    status VARCHAR(50) DEFAULT 'sent',
    timestamp TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    played_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    failure_reason TEXT,

    -- Message Properties
    is_forwarded BOOLEAN DEFAULT FALSE,
    is_reply BOOLEAN DEFAULT FALSE,
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    is_starred BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_broadcast BOOLEAN DEFAULT FALSE,
    is_community BOOLEAN DEFAULT FALSE,
    is_ephemeral BOOLEAN DEFAULT FALSE,
    ephemeral_timer INTEGER,

    -- Group Message Properties
    group_id VARCHAR(255),
    group_name VARCHAR(255),
    group_participant_count VARCHAR(10),
    group_participants TEXT,
    group_admins TEXT,
    group_super_admins TEXT,
    group_invite_code VARCHAR(255),
    group_invite_link VARCHAR(500),
    group_is_announcement BOOLEAN DEFAULT FALSE,
    group_is_community BOOLEAN DEFAULT FALSE,
    group_is_ephemeral BOOLEAN DEFAULT FALSE,
    group_ephemeral_timer INTEGER,
    group_created_at TIMESTAMPTZ,
    group_updated_at TIMESTAMPTZ,

    -- Business Message Properties
    business_phone_number VARCHAR(20),
    business_name VARCHAR(255),
    business_category VARCHAR(100),
    business_description TEXT,
    business_website VARCHAR(255),
    business_email VARCHAR(255),
    business_address TEXT,
    business_hours JSONB DEFAULT '{}',
    business_has_catalog BOOLEAN DEFAULT FALSE,
    business_catalog_enabled BOOLEAN DEFAULT FALSE,
    business_product_count INTEGER DEFAULT 0,
    business_labels JSONB DEFAULT '[]',
    business_label_colors JSONB DEFAULT '{}',
    business_quick_replies JSONB DEFAULT '[]',

    -- Message Processing
    processing_status VARCHAR(20) DEFAULT 'pending',
    ai_processed BOOLEAN DEFAULT FALSE,
    ai_response TEXT,
    ai_confidence DECIMAL(3,2),
    ai_model_used VARCHAR(100),

    -- System fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- WAHA Contacts table (Enhanced WhatsApp contact management)
CREATE TABLE waha_contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES waha_sessions(id) ON DELETE CASCADE,

    -- Contact Identity
    phone_number VARCHAR(20) NOT NULL,
    contact_id VARCHAR(255) UNIQUE NOT NULL,
    push_name VARCHAR(255),
    name VARCHAR(255),
    short_name VARCHAR(100),

    -- Contact Details
    email VARCHAR(255),
    description TEXT,
    company VARCHAR(255),
    job_title VARCHAR(255),
    department VARCHAR(100),

    -- Profile Information
    profile_picture_url VARCHAR(500),
    profile_picture_id VARCHAR(255),
    profile_picture_etag VARCHAR(255),
    profile_picture_status VARCHAR(20),

    -- Contact Status
    is_blocked BOOLEAN DEFAULT FALSE,
    is_contact BOOLEAN DEFAULT FALSE,
    is_my_contact BOOLEAN DEFAULT FALSE,
    is_enterprise_contact BOOLEAN DEFAULT FALSE,
    is_group_contact BOOLEAN DEFAULT FALSE,
    is_wa_contact BOOLEAN DEFAULT FALSE,

    -- Business Information
    business_profile JSONB DEFAULT '{}',
    verified_name VARCHAR(255),
    verified_level VARCHAR(20),
    verified_name_id VARCHAR(255),

    -- Interaction History
    last_seen_at TIMESTAMPTZ,
    last_message_at TIMESTAMPTZ,
    total_messages INTEGER DEFAULT 0,
    total_media INTEGER DEFAULT 0,
    interaction_score DECIMAL(3,2) DEFAULT 0,

    -- Labels & Categorization
    labels JSONB DEFAULT '[]',
    tags TEXT[],
    segments TEXT[],

    -- System fields
    status status_type DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(session_id, phone_number)
);

-- WAHA Groups table (Enhanced WhatsApp group management)
CREATE TABLE waha_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES waha_sessions(id) ON DELETE CASCADE,

    -- Group Identity
    group_id VARCHAR(255) UNIQUE NOT NULL,
    group_name VARCHAR(255),
    group_description TEXT,
    group_invite_code VARCHAR(255),
    group_invite_link VARCHAR(500),

    -- Group Configuration
    group_type VARCHAR(20) DEFAULT 'group',
    is_announcement BOOLEAN DEFAULT FALSE,
    is_community BOOLEAN DEFAULT FALSE,
    is_ephemeral BOOLEAN DEFAULT FALSE,
    ephemeral_timer INTEGER,

    -- Group Statistics
    participant_count INTEGER DEFAULT 0,
    admin_count INTEGER DEFAULT 0,
    super_admin_count INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    total_media INTEGER DEFAULT 0,

    -- Group Members
    participants JSONB DEFAULT '[]',
    admins JSONB DEFAULT '[]',
    super_admins JSONB DEFAULT '[]',

    -- Group Settings
    settings JSONB DEFAULT '{}',
    permissions JSONB DEFAULT '{}',

    -- Group Activity
    last_activity_at TIMESTAMPTZ,

    -- System fields
    status status_type DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- WAHA Webhook Events table (Enhanced webhook event tracking)
CREATE TABLE waha_webhook_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    session_id UUID REFERENCES waha_sessions(id) ON DELETE CASCADE,

    -- Event Identity
    event_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_subtype VARCHAR(100),

    -- Event Data
    event_data JSONB NOT NULL,
    raw_payload JSONB NOT NULL,

    -- Event Processing
    processing_status VARCHAR(20) DEFAULT 'pending',
    processed_at TIMESTAMPTZ,
    processing_duration_ms INTEGER,

    -- Error Handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,

    -- System fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- WAHA API Requests table (Enhanced API request tracking)
CREATE TABLE waha_api_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    session_id UUID REFERENCES waha_sessions(id) ON DELETE CASCADE,

    -- Request Identity
    request_id VARCHAR(255) UNIQUE NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,

    -- Request Details
    request_headers JSONB DEFAULT '{}',
    request_body JSONB DEFAULT '{}',
    request_params JSONB DEFAULT '{}',

    -- Response Details
    response_status INTEGER,
    response_headers JSONB DEFAULT '{}',
    response_body JSONB DEFAULT '{}',

    -- Performance Metrics
    request_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    response_time TIMESTAMPTZ,
    duration_ms INTEGER,

    -- Error Handling
    error_message TEXT,
    error_code VARCHAR(50),

    -- System fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- WAHA Rate Limits table (Enhanced rate limiting for WAHA)
CREATE TABLE waha_rate_limits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    session_id UUID REFERENCES waha_sessions(id) ON DELETE CASCADE,

    -- Rate Limit Identity
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,

    -- Rate Limiting
    requests_count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    window_duration_seconds INTEGER DEFAULT 60,

    -- Limits
    max_requests INTEGER DEFAULT 60,
    max_requests_per_minute INTEGER DEFAULT 60,
    max_requests_per_hour INTEGER DEFAULT 1000,

    -- System fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- WAHA Business Features table (Enhanced business feature tracking)
CREATE TABLE waha_business_features (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES waha_sessions(id) ON DELETE CASCADE,

    -- Feature Identity
    feature_name VARCHAR(100) NOT NULL,
    feature_type VARCHAR(50) NOT NULL,

    -- Feature Status
    is_enabled BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR(50),

    -- Feature Configuration
    configuration JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',

    -- Feature Usage
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,

    -- System fields
    status status_type DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(session_id, feature_name)
);

-- WAHA Analytics Daily table (Enhanced daily analytics for WAHA)
CREATE TABLE waha_analytics_daily (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    session_id UUID REFERENCES waha_sessions(id) ON DELETE CASCADE,
    date DATE NOT NULL,

    -- Message Metrics
    total_messages INTEGER DEFAULT 0,
    messages_sent INTEGER DEFAULT 0,
    messages_received INTEGER DEFAULT 0,
    media_messages INTEGER DEFAULT 0,
    text_messages INTEGER DEFAULT 0,

    -- Contact Metrics
    total_contacts INTEGER DEFAULT 0,
    new_contacts INTEGER DEFAULT 0,
    active_contacts INTEGER DEFAULT 0,

    -- Group Metrics
    total_groups INTEGER DEFAULT 0,
    new_groups INTEGER DEFAULT 0,
    active_groups INTEGER DEFAULT 0,

    -- Performance Metrics
    avg_response_time INTEGER,
    response_rate DECIMAL(5,2),
    uptime_percentage DECIMAL(5,2),

    -- Business Metrics
    business_inquiries INTEGER DEFAULT 0,
    product_views INTEGER DEFAULT 0,
    orders_received INTEGER DEFAULT 0,

    -- Error Metrics
    error_count INTEGER DEFAULT 0,
    webhook_failures INTEGER DEFAULT 0,
    api_failures INTEGER DEFAULT 0,

    -- System fields
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(organization_id, session_id, date)
);

-- ========================================
-- WAHA Functions and Triggers
-- ========================================

-- Function to update WAHA session statistics
CREATE OR REPLACE FUNCTION update_waha_session_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update session message counts
    IF TG_TABLE_NAME = 'waha_messages' THEN
        IF NEW.from_me = 'true' THEN
            UPDATE waha_sessions
            SET
                total_messages_sent = total_messages_sent + 1,
                last_message_at = COALESCE(NEW.timestamp, CURRENT_TIMESTAMP),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.session_id;
        ELSE
            UPDATE waha_sessions
            SET
                total_messages_received = total_messages_received + 1,
                last_message_at = COALESCE(NEW.timestamp, CURRENT_TIMESTAMP),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.session_id;
        END IF;

        -- Update media counts
        IF NEW.media_data IS NOT NULL AND jsonb_typeof(NEW.media_data) = 'object' THEN
            IF NEW.from_me = 'true' THEN
                UPDATE waha_sessions
                SET total_media_sent = total_media_sent + 1,
                    last_media_at = COALESCE(NEW.timestamp, CURRENT_TIMESTAMP),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = NEW.session_id;
            ELSE
                UPDATE waha_sessions
                SET total_media_received = total_media_received + 1,
                    last_media_at = COALESCE(NEW.timestamp, CURRENT_TIMESTAMP),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = NEW.session_id;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update WAHA session health
CREATE OR REPLACE FUNCTION update_waha_session_health()
RETURNS TRIGGER AS $$
BEGIN
    -- Update health status based on error count and last activity
    IF NEW.error_count > 5 THEN
        NEW.health_status := 'critical';
    ELSIF NEW.error_count > 2 THEN
        NEW.health_status := 'warning';
    ELSIF NEW.last_message_at IS NOT NULL AND NEW.last_message_at > CURRENT_TIMESTAMP - INTERVAL '1 hour' THEN
        NEW.health_status := 'healthy';
    ELSE
        NEW.health_status := 'unknown';
    END IF;

    -- Update last health check
    NEW.last_health_check := CURRENT_TIMESTAMP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to track WAHA API usage
CREATE OR REPLACE FUNCTION track_waha_api_usage()
RETURNS TRIGGER AS $$
BEGIN
    -- Update rate limiting
    INSERT INTO waha_rate_limits (organization_id, session_id, endpoint, method, requests_count, window_start)
    VALUES (NEW.organization_id, NEW.session_id, NEW.endpoint, NEW.method, 1, CURRENT_TIMESTAMP)
    ON CONFLICT (organization_id, session_id, endpoint, method)
    DO UPDATE SET
        requests_count = waha_rate_limits.requests_count + 1,
        updated_at = CURRENT_TIMESTAMP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to process WAHA webhook events
CREATE OR REPLACE FUNCTION process_waha_webhook_event()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-process certain event types
    CASE NEW.event_type
        WHEN 'message' THEN
            -- Process incoming messages
            NEW.processing_status := 'processing';
        WHEN 'status' THEN
            -- Process status updates
            NEW.processing_status := 'processing';
        WHEN 'presence' THEN
            -- Process presence updates
            NEW.processing_status := 'processing';
        ELSE
            -- Other event types
            NEW.processing_status := 'pending';
    END CASE;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- WAHA Triggers
-- ========================================

-- Trigger to update WAHA session statistics
CREATE TRIGGER trigger_update_waha_session_stats
    AFTER INSERT OR UPDATE ON waha_messages
    FOR EACH ROW EXECUTE FUNCTION update_waha_session_stats();

-- Trigger to update WAHA session health
CREATE TRIGGER trigger_update_waha_session_health
    BEFORE UPDATE ON waha_sessions
    FOR EACH ROW EXECUTE FUNCTION update_waha_session_health();

-- Trigger to track WAHA API usage
CREATE TRIGGER trigger_track_waha_api_usage
    AFTER INSERT ON waha_api_requests
    FOR EACH ROW EXECUTE FUNCTION track_waha_api_usage();

-- Trigger to process WAHA webhook events
CREATE TRIGGER trigger_process_waha_webhook_event
    BEFORE INSERT ON waha_webhook_events
    FOR EACH ROW EXECUTE FUNCTION process_waha_webhook_event();

-- ========================================
-- WAHA Indexes
-- ========================================

-- WAHA Sessions Indexes
CREATE INDEX CONCURRENTLY idx_waha_sessions_org_status ON waha_sessions(organization_id, status_type) WHERE status_type = 'active';
CREATE INDEX CONCURRENTLY idx_waha_sessions_phone ON waha_sessions(phone_number);
CREATE INDEX CONCURRENTLY idx_waha_sessions_instance ON waha_sessions(instance_id);
CREATE INDEX CONCURRENTLY idx_waha_sessions_health ON waha_sessions(health_status);
CREATE INDEX CONCURRENTLY idx_waha_sessions_authenticated ON waha_sessions(is_authenticated) WHERE is_authenticated = TRUE;
CREATE INDEX CONCURRENTLY idx_waha_sessions_connected ON waha_sessions(is_connected) WHERE is_connected = TRUE;

-- WAHA Messages Indexes
CREATE INDEX CONCURRENTLY idx_waha_messages_session ON waha_messages(session_id);
CREATE INDEX CONCURRENTLY idx_waha_messages_chat ON waha_messages(chat_id);
CREATE INDEX CONCURRENTLY idx_waha_messages_from ON waha_messages(from_number);
CREATE INDEX CONCURRENTLY idx_waha_messages_to ON waha_messages(to_number);
CREATE INDEX CONCURRENTLY idx_waha_messages_type ON waha_messages(message_type);
CREATE INDEX CONCURRENTLY idx_waha_messages_status ON waha_messages(status);
CREATE INDEX CONCURRENTLY idx_waha_messages_timestamp ON waha_messages(timestamp);
CREATE INDEX CONCURRENTLY idx_waha_messages_org_date ON waha_messages(organization_id, extract_date_immutable(timestamp));

-- WAHA Contacts Indexes
CREATE INDEX CONCURRENTLY idx_waha_contacts_session ON waha_contacts(session_id);
CREATE INDEX CONCURRENTLY idx_waha_contacts_phone ON waha_contacts(phone_number);
CREATE INDEX CONCURRENTLY idx_waha_contacts_contact_id ON waha_contacts(contact_id);
CREATE INDEX CONCURRENTLY idx_waha_contacts_name ON waha_contacts(name);
CREATE INDEX CONCURRENTLY idx_waha_contacts_blocked ON waha_contacts(is_blocked) WHERE is_blocked = TRUE;

-- WAHA Groups Indexes
CREATE INDEX CONCURRENTLY idx_waha_groups_session ON waha_groups(session_id);
CREATE INDEX CONCURRENTLY idx_waha_groups_group_id ON waha_groups(group_id);
CREATE INDEX CONCURRENTLY idx_waha_groups_name ON waha_groups(group_name);
CREATE INDEX CONCURRENTLY idx_waha_groups_type ON waha_groups(group_type);

-- WAHA Webhook Events Indexes
CREATE INDEX CONCURRENTLY idx_waha_webhook_events_session ON waha_webhook_events(session_id);
CREATE INDEX CONCURRENTLY idx_waha_webhook_events_type ON waha_webhook_events(event_type);
CREATE INDEX CONCURRENTLY idx_waha_webhook_events_status ON waha_webhook_events(processing_status);
CREATE INDEX CONCURRENTLY idx_waha_webhook_events_created ON waha_webhook_events(created_at);

-- WAHA API Requests Indexes
CREATE INDEX CONCURRENTLY idx_waha_api_requests_session ON waha_api_requests(session_id);
CREATE INDEX CONCURRENTLY idx_waha_api_requests_endpoint ON waha_api_requests(endpoint);
CREATE INDEX CONCURRENTLY idx_waha_api_requests_method ON waha_api_requests(method);
CREATE INDEX CONCURRENTLY idx_waha_api_requests_status ON waha_api_requests(response_status);
CREATE INDEX CONCURRENTLY idx_waha_api_requests_time ON waha_api_requests(request_time);

-- WAHA Rate Limits Indexes
CREATE INDEX CONCURRENTLY idx_waha_rate_limits_session ON waha_rate_limits(session_id);
CREATE INDEX CONCURRENTLY idx_waha_rate_limits_endpoint ON waha_rate_limits(endpoint);
CREATE INDEX CONCURRENTLY idx_waha_rate_limits_window ON waha_rate_limits(window_start);

-- WAHA Business Features Indexes
CREATE INDEX CONCURRENTLY idx_waha_business_features_session ON waha_business_features(session_id);
CREATE INDEX CONCURRENTLY idx_waha_business_features_name ON waha_business_features(feature_name);
CREATE INDEX CONCURRENTLY idx_waha_business_features_enabled ON waha_business_features(is_enabled) WHERE is_enabled = TRUE;

-- WAHA Analytics Daily Indexes
CREATE INDEX CONCURRENTLY idx_waha_analytics_daily_org_date ON waha_analytics_daily(organization_id, date);
CREATE INDEX CONCURRENTLY idx_waha_analytics_daily_session_date ON waha_analytics_daily(session_id, date);

-- ========================================
-- Create comprehensive indexes for better performance
-- ========================================
CREATE INDEX CONCURRENTLY idx_organizations_status ON organizations(status) WHERE status = 'active';
CREATE INDEX CONCURRENTLY idx_organizations_subscription ON organizations(subscription_plan_id, subscription_status);

CREATE INDEX CONCURRENTLY idx_users_organization_id ON users(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY idx_users_role ON users(role);
CREATE INDEX CONCURRENTLY idx_users_status ON users(status);

CREATE INDEX CONCURRENTLY idx_user_sessions_user_active ON user_sessions(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX CONCURRENTLY idx_user_sessions_expires ON user_sessions(expires_at);

CREATE INDEX CONCURRENTLY idx_api_keys_org_status ON api_keys(organization_id, status) WHERE status = 'active';
CREATE INDEX CONCURRENTLY idx_api_keys_hash ON api_keys(key_hash);

CREATE INDEX CONCURRENTLY idx_subscriptions_org_status ON subscriptions(organization_id, status);
CREATE INDEX CONCURRENTLY idx_subscriptions_next_payment ON subscriptions(next_payment_date) WHERE status = 'success';

CREATE INDEX CONCURRENTLY idx_usage_tracking_org_date ON usage_tracking(organization_id, date);
CREATE INDEX CONCURRENTLY idx_usage_tracking_quota ON usage_tracking(quota_type, date);

-- Knowledge Base Categories Indexes
CREATE INDEX CONCURRENTLY idx_knowledge_base_categories_org_parent ON knowledge_base_categories(organization_id, parent_id);
CREATE INDEX CONCURRENTLY idx_knowledge_base_categories_status ON knowledge_base_categories(status) WHERE status = 'active';
CREATE INDEX CONCURRENTLY idx_knowledge_base_categories_public ON knowledge_base_categories(is_public) WHERE is_public = TRUE;
CREATE INDEX CONCURRENTLY idx_knowledge_base_categories_featured ON knowledge_base_categories(is_featured) WHERE is_featured = TRUE;
CREATE INDEX CONCURRENTLY idx_knowledge_base_categories_order ON knowledge_base_categories(order_index);

-- Knowledge Base Items Indexes
CREATE INDEX CONCURRENTLY idx_knowledge_base_items_org_category ON knowledge_base_items(organization_id, category_id);
CREATE INDEX CONCURRENTLY idx_knowledge_base_items_content_type ON knowledge_base_items(content_type);
CREATE INDEX CONCURRENTLY idx_knowledge_base_items_language ON knowledge_base_items(language);
CREATE INDEX CONCURRENTLY idx_knowledge_base_items_status ON knowledge_base_items(status);
CREATE INDEX CONCURRENTLY idx_knowledge_base_items_workflow ON knowledge_base_items(workflow_status);
CREATE INDEX CONCURRENTLY idx_knowledge_base_items_approval ON knowledge_base_items(approval_status);
CREATE INDEX CONCURRENTLY idx_knowledge_base_items_published ON knowledge_base_items(published_at) WHERE status = 'active';
CREATE INDEX CONCURRENTLY idx_knowledge_base_items_author ON knowledge_base_items(author_id);
CREATE INDEX CONCURRENTLY idx_knowledge_base_items_priority ON knowledge_base_items(priority);
CREATE INDEX CONCURRENTLY idx_knowledge_base_items_public ON knowledge_base_items(is_public) WHERE is_public = TRUE;
CREATE INDEX CONCURRENTLY idx_knowledge_base_items_featured ON knowledge_base_items(is_featured) WHERE is_featured = TRUE;
CREATE INDEX CONCURRENTLY idx_knowledge_base_items_latest_version ON knowledge_base_items(is_latest_version) WHERE is_latest_version = TRUE;

-- Full-text search indexes for knowledge base items
CREATE INDEX CONCURRENTLY idx_knowledge_base_items_search ON knowledge_base_items
USING gin(to_tsvector('indonesian', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(content, '')));

CREATE INDEX CONCURRENTLY idx_knowledge_base_items_tags ON knowledge_base_items USING gin(tags);
CREATE INDEX CONCURRENTLY idx_knowledge_base_items_keywords ON knowledge_base_items USING gin(keywords);

-- Q&A Items Indexes
CREATE INDEX CONCURRENTLY idx_knowledge_qa_items_knowledge_item ON knowledge_qa_items(knowledge_item_id);
CREATE INDEX CONCURRENTLY idx_knowledge_qa_items_org ON knowledge_qa_items(organization_id);
CREATE INDEX CONCURRENTLY idx_knowledge_qa_items_active ON knowledge_qa_items(is_active) WHERE is_active = TRUE;
CREATE INDEX CONCURRENTLY idx_knowledge_qa_items_primary ON knowledge_qa_items(is_primary) WHERE is_primary = TRUE;
CREATE INDEX CONCURRENTLY idx_knowledge_qa_items_confidence ON knowledge_qa_items(confidence_level);
CREATE INDEX CONCURRENTLY idx_knowledge_qa_items_order ON knowledge_qa_items(order_index);
CREATE INDEX CONCURRENTLY idx_knowledge_qa_items_usage ON knowledge_qa_items(usage_count);
CREATE INDEX CONCURRENTLY idx_knowledge_qa_items_last_used ON knowledge_qa_items(last_used_at);

-- Full-text search for Q&A items
CREATE INDEX CONCURRENTLY idx_knowledge_qa_items_search ON knowledge_qa_items
USING gin(to_tsvector('indonesian', coalesce(question, '') || ' ' || coalesce(answer, '')));

CREATE INDEX CONCURRENTLY idx_knowledge_qa_items_keywords ON knowledge_qa_items USING gin(keywords);
CREATE INDEX CONCURRENTLY idx_knowledge_qa_items_search_keywords ON knowledge_qa_items USING gin(search_keywords);
CREATE INDEX CONCURRENTLY idx_knowledge_qa_items_trigger_phrases ON knowledge_qa_items USING gin(trigger_phrases);

-- Knowledge Base Tags Indexes
CREATE INDEX CONCURRENTLY idx_knowledge_base_tags_org ON knowledge_base_tags(organization_id);
CREATE INDEX CONCURRENTLY idx_knowledge_base_tags_type ON knowledge_base_tags(tag_type);
CREATE INDEX CONCURRENTLY idx_knowledge_base_tags_parent ON knowledge_base_tags(parent_tag_id) WHERE parent_tag_id IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_knowledge_base_tags_usage ON knowledge_base_tags(usage_count);
CREATE INDEX CONCURRENTLY idx_knowledge_base_tags_system ON knowledge_base_tags(is_system_tag) WHERE is_system_tag = TRUE;

-- Knowledge Base Item Tags Indexes
CREATE INDEX CONCURRENTLY idx_knowledge_base_item_tags_item ON knowledge_base_item_tags(knowledge_item_id);
CREATE INDEX CONCURRENTLY idx_knowledge_base_item_tags_tag ON knowledge_base_item_tags(tag_id);
CREATE INDEX CONCURRENTLY idx_knowledge_base_item_tags_auto ON knowledge_base_item_tags(is_auto_assigned);

-- Knowledge Base Item Relationships Indexes
CREATE INDEX CONCURRENTLY idx_knowledge_base_item_relationships_source ON knowledge_base_item_relationships(source_item_id);
CREATE INDEX CONCURRENTLY idx_knowledge_base_item_relationships_target ON knowledge_base_item_relationships(target_item_id);
CREATE INDEX CONCURRENTLY idx_knowledge_base_item_relationships_type ON knowledge_base_item_relationships(relationship_type);
CREATE INDEX CONCURRENTLY idx_knowledge_base_item_relationships_auto ON knowledge_base_item_relationships(is_auto_discovered);

-- Note: Vector similarity search would require pgvector extension
-- For now, embeddings are stored as JSONB for compatibility

-- Note: For true uniqueness across partitions, we'll add application-level checks
-- Partitioned tables cannot have unique constraints that don't include the partition key

CREATE INDEX idx_chat_sessions_session_token ON chat_sessions(session_token);
CREATE INDEX idx_chat_sessions_org_date ON chat_sessions(organization_id, extract_date_immutable(started_at));
CREATE INDEX idx_chat_sessions_customer ON chat_sessions(customer_id);
CREATE INDEX idx_chat_sessions_agent ON chat_sessions(agent_id);
CREATE INDEX idx_chat_sessions_active ON chat_sessions(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_messages_session_created ON messages(session_id, created_at);
CREATE INDEX idx_messages_sender_type ON messages(sender_type);
CREATE INDEX idx_messages_intent ON messages(intent) WHERE intent IS NOT NULL;
CREATE INDEX idx_messages_org_date ON messages(organization_id, extract_date_immutable(created_at));

CREATE INDEX CONCURRENTLY idx_customers_org_channel ON customers(organization_id, channel);
CREATE INDEX CONCURRENTLY idx_customers_email ON customers(email) WHERE email IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_customers_phone ON customers(phone) WHERE phone IS NOT NULL;

CREATE INDEX CONCURRENTLY idx_agents_org_availability ON agents(organization_id, availability_status);
CREATE INDEX CONCURRENTLY idx_agents_active_chats ON agents(current_active_chats) WHERE current_active_chats > 0;

CREATE INDEX idx_ai_conversations_org_date ON ai_conversations_log(organization_id, extract_date_immutable(created_at));
CREATE INDEX idx_ai_conversations_model ON ai_conversations_log(ai_model_id);

CREATE INDEX idx_audit_logs_org_date ON audit_logs(organization_id, extract_date_immutable(created_at));
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

CREATE INDEX CONCURRENTLY idx_api_rate_limits_key_window ON api_rate_limits(api_key_id, window_start);
CREATE INDEX CONCURRENTLY idx_api_rate_limits_ip_window ON api_rate_limits(ip_address, window_start);

-- Indexes for new tables
CREATE INDEX CONCURRENTLY idx_n8n_workflows_org_status ON n8n_workflows(organization_id, status);
CREATE INDEX CONCURRENTLY idx_n8n_workflows_enabled ON n8n_workflows(is_enabled) WHERE is_enabled = TRUE;
CREATE INDEX CONCURRENTLY idx_n8n_workflows_trigger_type ON n8n_workflows(trigger_type);
CREATE INDEX CONCURRENTLY idx_n8n_workflows_next_execution ON n8n_workflows(next_execution_at) WHERE next_execution_at IS NOT NULL;

CREATE INDEX idx_n8n_executions_workflow_status ON n8n_executions(workflow_id, status);
CREATE INDEX idx_n8n_executions_org_date ON n8n_executions(organization_id, extract_date_immutable(created_at));
CREATE INDEX idx_n8n_executions_status ON n8n_executions(status);
CREATE INDEX idx_n8n_executions_started ON n8n_executions(started_at);

CREATE INDEX CONCURRENTLY idx_payment_transactions_org_status ON payment_transactions(organization_id, status);
CREATE INDEX CONCURRENTLY idx_payment_transactions_subscription ON payment_transactions(subscription_id);
CREATE INDEX CONCURRENTLY idx_payment_transactions_gateway ON payment_transactions(payment_gateway, status);
CREATE INDEX CONCURRENTLY idx_payment_transactions_external_id ON payment_transactions(external_transaction_id);
CREATE INDEX CONCURRENTLY idx_payment_transactions_date ON payment_transactions(extract_date_immutable(created_at));

CREATE INDEX idx_realtime_metrics_name_time ON realtime_metrics(metric_name, created_at);
CREATE INDEX idx_realtime_metrics_org_name ON realtime_metrics(organization_id, metric_name);
CREATE INDEX idx_realtime_metrics_type ON realtime_metrics(metric_type);
CREATE INDEX idx_realtime_metrics_timestamp ON realtime_metrics(timestamp);

CREATE INDEX idx_system_logs_level_time ON system_logs(level, created_at);
CREATE INDEX idx_system_logs_org_component ON system_logs(organization_id, component);
CREATE INDEX idx_system_logs_request_id ON system_logs(request_id) WHERE request_id IS NOT NULL;
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id) WHERE user_id IS NOT NULL;

-- RBAC Indexes
CREATE INDEX CONCURRENTLY idx_roles_org_status ON roles(organization_id, status) WHERE status = 'active';
CREATE INDEX CONCURRENTLY idx_roles_parent ON roles(parent_role_id) WHERE parent_role_id IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_roles_system ON roles(is_system_role) WHERE is_system_role = TRUE;

CREATE INDEX CONCURRENTLY idx_permissions_org_resource ON permissions(organization_id, resource);
CREATE INDEX CONCURRENTLY idx_permissions_resource_action ON permissions(resource, action);
CREATE INDEX CONCURRENTLY idx_permissions_category ON permissions(category);
CREATE INDEX CONCURRENTLY idx_permissions_system ON permissions(is_system_permission) WHERE is_system_permission = TRUE;

CREATE INDEX CONCURRENTLY idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX CONCURRENTLY idx_role_permissions_permission ON role_permissions(permission_id);
CREATE INDEX CONCURRENTLY idx_role_permissions_granted ON role_permissions(is_granted) WHERE is_granted = TRUE;

CREATE INDEX CONCURRENTLY idx_user_roles_user_active ON user_roles(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX CONCURRENTLY idx_user_roles_role ON user_roles(role_id);
CREATE INDEX CONCURRENTLY idx_user_roles_primary ON user_roles(user_id, is_primary) WHERE is_primary = TRUE;
CREATE INDEX CONCURRENTLY idx_user_roles_effective ON user_roles(effective_from, effective_until);

CREATE INDEX CONCURRENTLY idx_permission_groups_org_category ON permission_groups(organization_id, category);
CREATE INDEX CONCURRENTLY idx_permission_groups_parent ON permission_groups(parent_group_id) WHERE parent_group_id IS NOT NULL;

CREATE INDEX CONCURRENTLY idx_permission_group_permissions_group ON permission_group_permissions(group_id);
CREATE INDEX CONCURRENTLY idx_permission_group_permissions_permission ON permission_group_permissions(permission_id);

-- Create functions and triggers

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at column
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billing_invoices_updated_at BEFORE UPDATE ON billing_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_models_updated_at BEFORE UPDATE ON ai_models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_base_categories_updated_at BEFORE UPDATE ON knowledge_base_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_base_items_updated_at BEFORE UPDATE ON knowledge_base_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_qa_items_updated_at BEFORE UPDATE ON knowledge_qa_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_base_tags_updated_at BEFORE UPDATE ON knowledge_base_tags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bot_personalities_updated_at BEFORE UPDATE ON bot_personalities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_channel_configs_updated_at BEFORE UPDATE ON channel_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Note: Triggers for partitioned tables need to be created on each partition individually
CREATE TRIGGER update_ai_training_data_updated_at BEFORE UPDATE ON ai_training_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_rate_limits_updated_at BEFORE UPDATE ON api_rate_limits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_n8n_workflows_updated_at BEFORE UPDATE ON n8n_workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_role_permissions_updated_at BEFORE UPDATE ON role_permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_permission_groups_updated_at BEFORE UPDATE ON permission_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- WAHA Tables updated_at triggers
CREATE TRIGGER update_waha_sessions_updated_at BEFORE UPDATE ON waha_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_waha_messages_updated_at BEFORE UPDATE ON waha_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_waha_contacts_updated_at BEFORE UPDATE ON waha_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_waha_groups_updated_at BEFORE UPDATE ON waha_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_waha_webhook_events_updated_at BEFORE UPDATE ON waha_webhook_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_waha_rate_limits_updated_at BEFORE UPDATE ON waha_rate_limits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_waha_business_features_updated_at BEFORE UPDATE ON waha_business_features FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically process subscription payments
CREATE OR REPLACE FUNCTION trigger_process_subscription_payment()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process if status changed to completed, failed, or cancelled
    IF (TG_OP = 'UPDATE' AND OLD.status != NEW.status AND
        NEW.status IN ('completed', 'failed', 'cancelled') AND
        NEW.subscription_id IS NOT NULL) THEN

        -- Process the subscription payment
        PERFORM process_subscription_payment(NEW.id, NEW.status);

        -- Update invoice status if linked
        IF NEW.invoice_id IS NOT NULL THEN
            UPDATE billing_invoices
            SET status = NEW.status,
                paid_date = CASE WHEN NEW.status = 'completed' THEN CURRENT_TIMESTAMP ELSE NULL END,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.invoice_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_payment_subscription_update
    AFTER UPDATE ON payment_transactions
    FOR EACH ROW EXECUTE FUNCTION trigger_process_subscription_payment();

-- Trigger to validate payment amounts
CREATE OR REPLACE FUNCTION trigger_validate_payment_amount()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate payment amount for subscription payments
    IF NEW.subscription_id IS NOT NULL OR NEW.invoice_id IS NOT NULL THEN
        IF NOT validate_payment_amount(NEW.id) THEN
            RAISE EXCEPTION 'Payment amount does not match subscription or invoice amount';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_payment_amount_validation
    AFTER INSERT ON payment_transactions
    FOR EACH ROW EXECUTE FUNCTION trigger_validate_payment_amount();

-- Enhanced function to update search vector for knowledge base items
CREATE OR REPLACE FUNCTION update_knowledge_base_item_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('indonesian',
        coalesce(NEW.title, '') || ' ' ||
        coalesce(NEW.description, '') || ' ' ||
        coalesce(NEW.content, '') || ' ' ||
        coalesce(array_to_string(NEW.keywords, ' '), '') || ' ' ||
        coalesce(array_to_string(NEW.tags, ' '), '')
    );

    -- Update word count for articles
    IF NEW.content_type = 'article' AND NEW.content IS NOT NULL THEN
        NEW.word_count := array_length(string_to_array(trim(NEW.content), ' '), 1);
        NEW.estimated_read_time := GREATEST(1, CEIL(NEW.word_count / 200.0)); -- 200 words per minute
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Enhanced function to update search vector for Q&A items
CREATE OR REPLACE FUNCTION update_knowledge_qa_item_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    -- Update search vector for Q&A items
    NEW.search_vector := to_tsvector('indonesian',
        coalesce(NEW.question, '') || ' ' ||
        coalesce(NEW.answer, '') || ' ' ||
        coalesce(array_to_string(NEW.keywords, ' '), '') || ' ' ||
        coalesce(array_to_string(NEW.search_keywords, ' '), '') || ' ' ||
        coalesce(array_to_string(NEW.trigger_phrases, ' '), '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Enhanced function to update category content counts
CREATE OR REPLACE FUNCTION update_knowledge_category_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update old category counts if changing category
    IF TG_OP = 'UPDATE' AND OLD.category_id != NEW.category_id THEN
        UPDATE knowledge_base_categories
        SET
            total_content_count = (
                SELECT COUNT(*) FROM knowledge_base_items
                WHERE category_id = OLD.category_id AND status = 'active' AND workflow_status = 'published'
            ),
            article_count = (
                SELECT COUNT(*) FROM knowledge_base_items
                WHERE category_id = OLD.category_id
                AND content_type IN ('article', 'guide', 'tutorial')
                AND status = 'active' AND workflow_status = 'published'
            ),
            qa_count = (
                SELECT COUNT(*) FROM knowledge_base_items
                WHERE category_id = OLD.category_id
                AND content_type = 'qa_collection'
                AND status = 'active' AND workflow_status = 'published'
            )
        WHERE id = OLD.category_id;
    END IF;

    -- Update new category counts
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE knowledge_base_categories
        SET
            total_content_count = (
                SELECT COUNT(*) FROM knowledge_base_items
                WHERE category_id = NEW.category_id AND status = 'active' AND workflow_status = 'published'
            ),
            article_count = (
                SELECT COUNT(*) FROM knowledge_base_items
                WHERE category_id = NEW.category_id
                AND content_type IN ('article', 'guide', 'tutorial')
                AND status = 'active' AND workflow_status = 'published'
            ),
            qa_count = (
                SELECT COUNT(*) FROM knowledge_base_items
                WHERE category_id = NEW.category_id
                AND content_type = 'qa_collection'
                AND status = 'active' AND workflow_status = 'published'
            )
        WHERE id = NEW.category_id;
    END IF;

    -- Update old category counts on delete
    IF TG_OP = 'DELETE' THEN
        UPDATE knowledge_base_categories
        SET
            total_content_count = (
                SELECT COUNT(*) FROM knowledge_base_items
                WHERE category_id = OLD.category_id AND status = 'active' AND workflow_status = 'published'
            ),
            article_count = (
                SELECT COUNT(*) FROM knowledge_base_items
                WHERE category_id = OLD.category_id
                AND content_type IN ('article', 'guide', 'tutorial')
                AND status = 'active' AND workflow_status = 'published'
            ),
            qa_count = (
                SELECT COUNT(*) FROM knowledge_base_items
                WHERE category_id = OLD.category_id
                AND content_type = 'qa_collection'
                AND status = 'active' AND workflow_status = 'published'
            )
        WHERE id = OLD.category_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update tag usage counts
CREATE OR REPLACE FUNCTION update_knowledge_tag_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update tag usage counts
    IF TG_OP = 'INSERT' THEN
        UPDATE knowledge_base_tags
        SET
            usage_count = usage_count + 1,
            item_count = (SELECT COUNT(*) FROM knowledge_base_item_tags WHERE tag_id = NEW.tag_id)
        WHERE id = NEW.tag_id;
    END IF;

    IF TG_OP = 'DELETE' THEN
        UPDATE knowledge_base_tags
        SET
            usage_count = GREATEST(0, usage_count - 1),
            item_count = (SELECT COUNT(*) FROM knowledge_base_item_tags WHERE tag_id = OLD.tag_id)
        WHERE id = OLD.tag_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update Q&A performance metrics
CREATE OR REPLACE FUNCTION update_qa_performance_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update usage count and last used timestamp
    NEW.usage_count := COALESCE(OLD.usage_count, 0) + 1;
    NEW.last_used_at := CURRENT_TIMESTAMP;

    -- Update parent knowledge item's AI usage count
    UPDATE knowledge_base_items
    SET ai_usage_count = ai_usage_count + 1
    WHERE id = NEW.knowledge_item_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for knowledge base items
CREATE TRIGGER trigger_update_knowledge_base_item_search_vector
    BEFORE INSERT OR UPDATE ON knowledge_base_items
    FOR EACH ROW EXECUTE FUNCTION update_knowledge_base_item_search_vector();

CREATE TRIGGER trigger_update_knowledge_category_counts
    AFTER INSERT OR UPDATE OR DELETE ON knowledge_base_items
    FOR EACH ROW EXECUTE FUNCTION update_knowledge_category_counts();

-- Triggers for Q&A items
CREATE TRIGGER trigger_update_knowledge_qa_item_search_vector
    BEFORE INSERT OR UPDATE ON knowledge_qa_items
    FOR EACH ROW EXECUTE FUNCTION update_knowledge_qa_item_search_vector();

-- Triggers for tag management
CREATE TRIGGER trigger_update_knowledge_tag_counts
    AFTER INSERT OR DELETE ON knowledge_base_item_tags
    FOR EACH ROW EXECUTE FUNCTION update_knowledge_tag_counts();

-- Enhanced helper functions for knowledge base management

-- Function to search knowledge base items with ranking
CREATE OR REPLACE FUNCTION search_knowledge_base_items(
    p_organization_id UUID,
    p_search_query TEXT,
    p_content_type VARCHAR(20) DEFAULT NULL,
    p_category_id UUID DEFAULT NULL,
    p_language language_type DEFAULT NULL,
    p_limit INTEGER DEFAULT 10,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
    item_id UUID,
    title VARCHAR(500),
    description TEXT,
    content_type VARCHAR(20),
    category_name VARCHAR(255),
    tags TEXT[],
    search_rank REAL,
    qa_count BIGINT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        kbi.id,
        kbi.title,
        kbi.description,
        kbi.content_type,
        kbc.name,
        kbi.tags,
        ts_rank(kbi.search_vector, plainto_tsquery('indonesian', p_search_query)) as search_rank,
        (SELECT COUNT(*) FROM knowledge_qa_items WHERE knowledge_item_id = kbi.id AND is_active = TRUE) as qa_count,
        kbi.created_at
    FROM knowledge_base_items kbi
    JOIN knowledge_base_categories kbc ON kbi.category_id = kbc.id
    WHERE kbi.organization_id = p_organization_id
    AND kbi.status = 'active'
    AND kbi.workflow_status = 'published'
    AND kbi.is_public = TRUE
    AND (p_content_type IS NULL OR kbi.content_type = p_content_type)
    AND (p_category_id IS NULL OR kbi.category_id = p_category_id)
    AND (p_language IS NULL OR kbi.language = p_language)
    AND (
        p_search_query IS NULL OR
        kbi.search_vector @@ plainto_tsquery('indonesian', p_search_query) OR
        kbi.title ILIKE '%' || p_search_query || '%' OR
        kbi.description ILIKE '%' || p_search_query || '%'
    )
    ORDER BY
        CASE WHEN p_search_query IS NOT NULL THEN ts_rank(kbi.search_vector, plainto_tsquery('indonesian', p_search_query)) ELSE 0 END DESC,
        kbi.priority DESC,
        kbi.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get Q&A items for a specific knowledge item
CREATE OR REPLACE FUNCTION get_knowledge_qa_items(
    p_knowledge_item_id UUID,
    p_organization_id UUID,
    p_active_only BOOLEAN DEFAULT TRUE
)
RETURNS TABLE(
    qa_id UUID,
    question TEXT,
    answer TEXT,
    question_variations TEXT[],
    confidence_level VARCHAR(20),
    keywords TEXT[],
    usage_count INTEGER,
    is_primary BOOLEAN,
    order_index INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        kqa.id,
        kqa.question,
        kqa.answer,
        kqa.question_variations,
        kqa.confidence_level,
        kqa.keywords,
        kqa.usage_count,
        kqa.is_primary,
        kqa.order_index
    FROM knowledge_qa_items kqa
    WHERE kqa.knowledge_item_id = p_knowledge_item_id
    AND kqa.organization_id = p_organization_id
    AND (NOT p_active_only OR kqa.is_active = TRUE)
    ORDER BY kqa.order_index ASC, kqa.is_primary DESC, kqa.created_at ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to find similar Q&A items based on question
CREATE OR REPLACE FUNCTION find_similar_qa_items(
    p_organization_id UUID,
    p_question TEXT,
    p_limit INTEGER DEFAULT 5
)
RETURNS TABLE(
    qa_id UUID,
    knowledge_item_id UUID,
    knowledge_title VARCHAR(500),
    question TEXT,
    answer TEXT,
    similarity_score REAL,
    confidence_level VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        kqa.id,
        kqa.knowledge_item_id,
        kbi.title,
        kqa.question,
        kqa.answer,
        ts_rank(kqa.search_vector, plainto_tsquery('indonesian', p_question)) as similarity_score,
        kqa.confidence_level
    FROM knowledge_qa_items kqa
    JOIN knowledge_base_items kbi ON kqa.knowledge_item_id = kbi.id
    WHERE kqa.organization_id = p_organization_id
    AND kqa.is_active = TRUE
    AND kbi.status = 'active'
    AND kbi.workflow_status = 'published'
    AND kbi.is_public = TRUE
    AND (
        kqa.search_vector @@ plainto_tsquery('indonesian', p_question) OR
        kqa.question ILIKE '%' || p_question || '%' OR
        EXISTS (
            SELECT 1 FROM unnest(kqa.question_variations) AS qv
            WHERE qv ILIKE '%' || p_question || '%'
        )
    )
    ORDER BY ts_rank(kqa.search_vector, plainto_tsquery('indonesian', p_question)) DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get knowledge base statistics
CREATE OR REPLACE FUNCTION get_knowledge_base_statistics(p_organization_id UUID)
RETURNS TABLE(
    total_items BIGINT,
    total_articles BIGINT,
    total_qa_collections BIGINT,
    total_qa_items BIGINT,
    total_categories BIGINT,
    total_tags BIGINT,
    published_items BIGINT,
    draft_items BIGINT,
    avg_qa_per_collection NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM knowledge_base_items WHERE organization_id = p_organization_id) as total_items,
        (SELECT COUNT(*) FROM knowledge_base_items WHERE organization_id = p_organization_id AND content_type IN ('article', 'guide', 'tutorial')) as total_articles,
        (SELECT COUNT(*) FROM knowledge_base_items WHERE organization_id = p_organization_id AND content_type = 'qa_collection') as total_qa_collections,
        (SELECT COUNT(*) FROM knowledge_qa_items WHERE organization_id = p_organization_id) as total_qa_items,
        (SELECT COUNT(*) FROM knowledge_base_categories WHERE organization_id = p_organization_id AND status = 'active') as total_categories,
        (SELECT COUNT(*) FROM knowledge_base_tags WHERE organization_id = p_organization_id AND status = 'active') as total_tags,
        (SELECT COUNT(*) FROM knowledge_base_items WHERE organization_id = p_organization_id AND status = 'active' AND workflow_status = 'published') as published_items,
        (SELECT COUNT(*) FROM knowledge_base_items WHERE organization_id = p_organization_id AND status = 'draft') as draft_items,
        (SELECT ROUND(AVG(qa_count), 2) FROM (
            SELECT COUNT(*) as qa_count
            FROM knowledge_qa_items kqa
            JOIN knowledge_base_items kbi ON kqa.knowledge_item_id = kbi.id
            WHERE kbi.organization_id = p_organization_id AND kbi.content_type = 'qa_collection'
            GROUP BY kbi.id
        ) as avg_calc) as avg_qa_per_collection;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to auto-suggest tags based on content
CREATE OR REPLACE FUNCTION suggest_knowledge_tags(
    p_organization_id UUID,
    p_title TEXT,
    p_description TEXT,
    p_content TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 5
)
RETURNS TABLE(
    tag_id UUID,
    tag_name VARCHAR(100),
    tag_type VARCHAR(20),
    confidence_score NUMERIC(3,2)
) AS $$
DECLARE
    search_text TEXT;
BEGIN
    search_text := COALESCE(p_title, '') || ' ' || COALESCE(p_description, '') || ' ' || COALESCE(p_content, '');

    RETURN QUERY
    SELECT
        kbt.id,
        kbt.name,
        kbt.tag_type,
        CASE
            WHEN search_text ILIKE '%' || kbt.name || '%' THEN 0.9
            WHEN EXISTS (
                SELECT 1 FROM unnest(string_to_array(search_text, ' ')) as word
                WHERE word ILIKE '%' || kbt.name || '%'
            ) THEN 0.7
            ELSE 0.5
        END as confidence_score
    FROM knowledge_base_tags kbt
    WHERE kbt.organization_id = p_organization_id
    AND kbt.status = 'active'
    AND kbt.is_auto_suggested = TRUE
    AND (
        search_text ILIKE '%' || kbt.name || '%' OR
        EXISTS (
            SELECT 1 FROM unnest(string_to_array(search_text, ' ')) as word
            WHERE word ILIKE '%' || kbt.name || '%'
        )
    )
    ORDER BY confidence_score DESC, kbt.usage_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to track organization usage
CREATE OR REPLACE FUNCTION track_organization_usage()
RETURNS TRIGGER AS $$
DECLARE
    usage_date DATE := CURRENT_DATE;
    quota_type_val quota_type;
BEGIN
    -- Determine quota type based on table
    CASE TG_TABLE_NAME
        WHEN 'messages' THEN quota_type_val := 'messages';
        WHEN 'ai_conversations_log' THEN quota_type_val := 'ai_requests';
        ELSE RETURN COALESCE(NEW, OLD);
    END CASE;

    -- Update usage tracking
    INSERT INTO usage_tracking (organization_id, date, quota_type, used_amount)
    VALUES (NEW.organization_id, usage_date, quota_type_val, 1)
    ON CONFLICT (organization_id, date, quota_type)
    DO UPDATE SET used_amount = usage_tracking.used_amount + 1;

    -- Update organization current usage
    UPDATE organizations
    SET current_usage = jsonb_set(
        current_usage,
        ARRAY[quota_type_val::text],
        to_jsonb(COALESCE((current_usage->>quota_type_val::text)::integer, 0) + 1)
    )
    WHERE id = NEW.organization_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply usage tracking triggers
CREATE TRIGGER trigger_track_message_usage
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION track_organization_usage();

CREATE TRIGGER trigger_track_ai_usage
    AFTER INSERT ON ai_conversations_log
    FOR EACH ROW EXECUTE FUNCTION track_organization_usage();

-- Function to clean expired sessions
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to create monthly partitions
CREATE OR REPLACE FUNCTION create_monthly_partitions(table_name TEXT, months_ahead INTEGER DEFAULT 3)
RETURNS VOID AS $$
DECLARE
    start_date DATE;
    end_date DATE;
    partition_name TEXT;
    partition_sql TEXT;
    i INTEGER;
BEGIN
    FOR i IN 1..months_ahead LOOP
        start_date := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month' * i);
        end_date := start_date + INTERVAL '1 month';
        partition_name := table_name || '_' || TO_CHAR(start_date, 'YYYY_MM');

        partition_sql := FORMAT(
            'CREATE TABLE IF NOT EXISTS %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)',
            partition_name, table_name, start_date, end_date
        );

        EXECUTE partition_sql;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to check user permissions
CREATE OR REPLACE FUNCTION check_user_permission(
    p_user_id UUID,
    p_resource resource_type,
    p_action permission_action,
    p_scope permission_scope DEFAULT 'organization'
)
RETURNS BOOLEAN AS $$
DECLARE
    has_permission BOOLEAN := FALSE;
BEGIN
    -- Check if user has the permission through any active role
    SELECT EXISTS(
        SELECT 1
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = p_user_id
        AND ur.is_active = TRUE
        AND (ur.effective_until IS NULL OR ur.effective_until > CURRENT_TIMESTAMP)
        AND rp.is_granted = TRUE
        AND p.resource = p_resource
        AND p.action = p_action
        AND p.scope = p_scope
        AND p.status = 'active'
    ) INTO has_permission;

    RETURN has_permission;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS TABLE(
    permission_code VARCHAR(100),
    resource resource_type,
    action permission_action,
    scope permission_scope,
    role_name VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.code,
        p.resource,
        p.action,
        p.scope,
        r.name
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id
    AND ur.is_active = TRUE
    AND (ur.effective_until IS NULL OR ur.effective_until > CURRENT_TIMESTAMP)
    AND rp.is_granted = TRUE
    AND p.status = 'active'
    AND r.status = 'active';
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to process subscription payment
CREATE OR REPLACE FUNCTION process_subscription_payment(
    p_transaction_id UUID,
    p_payment_status transaction_status
)
RETURNS VOID AS $$
DECLARE
    v_subscription_id UUID;
    v_organization_id UUID;
    v_billing_cycle billing_cycle;
    v_current_period_end TIMESTAMPTZ;
    v_new_period_end TIMESTAMPTZ;
BEGIN
    -- Get subscription details from transaction
    SELECT pt.subscription_id, pt.organization_id, s.billing_cycle, s.current_period_end
    INTO v_subscription_id, v_organization_id, v_billing_cycle, v_current_period_end
    FROM payment_transactions pt
    JOIN subscriptions s ON pt.subscription_id = s.id
    WHERE pt.id = p_transaction_id;

    -- Process based on payment status
    CASE p_payment_status
        WHEN 'completed' THEN
            -- Calculate new period end based on billing cycle
            CASE v_billing_cycle
                WHEN 'monthly' THEN
                    v_new_period_end := v_current_period_end + INTERVAL '1 month';
                WHEN 'quarterly' THEN
                    v_new_period_end := v_current_period_end + INTERVAL '3 months';
                WHEN 'yearly' THEN
                    v_new_period_end := v_current_period_end + INTERVAL '1 year';
                ELSE
                    v_new_period_end := v_current_period_end + INTERVAL '1 month';
            END CASE;

            -- Update subscription
            UPDATE subscriptions SET
                status = 'success',
                current_period_start = v_current_period_end,
                current_period_end = v_new_period_end,
                last_payment_date = CURRENT_TIMESTAMP,
                next_payment_date = v_new_period_end,
                cancel_at_period_end = FALSE,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = v_subscription_id;

            -- Update organization subscription status
            UPDATE organizations SET
                subscription_status = 'active',
                subscription_starts_at = COALESCE(subscription_starts_at, CURRENT_TIMESTAMP),
                subscription_ends_at = v_new_period_end,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = v_organization_id;

        WHEN 'failed' THEN
            -- Handle failed payment
            UPDATE subscriptions SET
                status = 'failed',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = v_subscription_id;

            -- Check if grace period expired
            IF v_current_period_end < CURRENT_TIMESTAMP - INTERVAL '7 days' THEN
                UPDATE organizations SET
                    subscription_status = 'suspended',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = v_organization_id;
            END IF;

        WHEN 'cancelled' THEN
            -- Handle cancelled payment
            UPDATE subscriptions SET
                status = 'cancelled',
                canceled_at = CURRENT_TIMESTAMP,
                cancel_at_period_end = TRUE,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = v_subscription_id;

        ELSE
            -- For pending, processing, etc., no action needed
            NULL;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to create subscription invoice
CREATE OR REPLACE FUNCTION create_subscription_invoice(
    p_subscription_id UUID,
    p_billing_period_start TIMESTAMPTZ,
    p_billing_period_end TIMESTAMPTZ
)
RETURNS UUID AS $$
DECLARE
    v_invoice_id UUID;
    v_organization_id UUID;
    v_plan_id UUID;
    v_unit_amount DECIMAL(10,2);
    v_currency VARCHAR(3);
    v_invoice_number VARCHAR(50);
    v_line_items JSONB;
BEGIN
    -- Get subscription details
    SELECT s.organization_id, s.plan_id, s.unit_amount, s.currency
    INTO v_organization_id, v_plan_id, v_unit_amount, v_currency
    FROM subscriptions s
    WHERE s.id = p_subscription_id;

    -- Generate invoice number
    v_invoice_number := 'INV-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' ||
                       LPAD(EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::TEXT, 10, '0');

    -- Create line items
    v_line_items := jsonb_build_array(
        jsonb_build_object(
            'description', 'Subscription Fee',
            'period_start', p_billing_period_start,
            'period_end', p_billing_period_end,
            'quantity', 1,
            'unit_price', v_unit_amount,
            'total', v_unit_amount
        )
    );

    -- Create invoice
    INSERT INTO billing_invoices (
        organization_id,
        subscription_id,
        invoice_number,
        status,
        subtotal,
        total_amount,
        currency,
        due_date,
        line_items
    ) VALUES (
        v_organization_id,
        p_subscription_id,
        v_invoice_number,
        'pending',
        v_unit_amount,
        v_unit_amount,
        v_currency,
        CURRENT_TIMESTAMP + INTERVAL '7 days',
        v_line_items
    ) RETURNING id INTO v_invoice_id;

    RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql;

-- Function to handle subscription renewal
CREATE OR REPLACE FUNCTION process_subscription_renewal(
    p_subscription_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_invoice_id UUID;
    v_transaction_id UUID;
    v_organization_id UUID;
    v_current_period_end TIMESTAMPTZ;
    v_unit_amount DECIMAL(10,2);
    v_currency VARCHAR(3);
    v_payment_method_id VARCHAR(255);
BEGIN
    -- Get subscription details
    SELECT s.organization_id, s.current_period_end, s.unit_amount, s.currency, s.payment_method_id
    INTO v_organization_id, v_current_period_end, v_unit_amount, v_currency, v_payment_method_id
    FROM subscriptions s
    WHERE s.id = p_subscription_id
    AND s.status = 'success'
    AND s.cancel_at_period_end = FALSE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Subscription not found or not eligible for renewal';
    END IF;

    -- Create invoice for next period
    v_invoice_id := create_subscription_invoice(
        p_subscription_id,
        v_current_period_end,
        v_current_period_end + INTERVAL '1 month'
    );

    -- Create payment transaction
    INSERT INTO payment_transactions (
        organization_id,
        subscription_id,
        invoice_id,
        transaction_id,
        amount,
        currency,
        payment_method,
        payment_gateway,
        status,
        payment_type,
        initiated_at
    ) VALUES (
        v_organization_id,
        p_subscription_id,
        v_invoice_id,
        'TXN-' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::TEXT || '-' ||
        SUBSTRING(p_subscription_id::TEXT FROM 1 FOR 8),
        v_unit_amount,
        v_currency,
        'recurring',
        'auto_billing',
        'pending',
        'recurring',
        CURRENT_TIMESTAMP
    ) RETURNING id INTO v_transaction_id;

    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- Function to validate payment amount against subscription
CREATE OR REPLACE FUNCTION validate_payment_amount(
    p_transaction_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_transaction_amount DECIMAL(12,2);
    v_subscription_amount DECIMAL(10,2);
    v_invoice_amount DECIMAL(10,2);
    v_tolerance DECIMAL(12,2) := 0.01; -- Allow 1 cent tolerance
BEGIN
    -- Get amounts from transaction, subscription, and invoice
    SELECT
        pt.amount,
        s.unit_amount,
        bi.total_amount
    INTO v_transaction_amount, v_subscription_amount, v_invoice_amount
    FROM payment_transactions pt
    LEFT JOIN subscriptions s ON pt.subscription_id = s.id
    LEFT JOIN billing_invoices bi ON pt.invoice_id = bi.id
    WHERE pt.id = p_transaction_id;

    -- Validate against subscription amount
    IF v_subscription_amount IS NOT NULL THEN
        RETURN ABS(v_transaction_amount - v_subscription_amount) <= v_tolerance;
    END IF;

    -- Validate against invoice amount
    IF v_invoice_amount IS NOT NULL THEN
        RETURN ABS(v_transaction_amount - v_invoice_amount) <= v_tolerance;
    END IF;

    -- If no reference amount found, return false
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create materialized views for analytics
CREATE MATERIALIZED VIEW mv_organization_analytics AS
SELECT
    o.id as organization_id,
    o.name as organization_name,
    o.subscription_status,
    sp.name as plan_name,
    COUNT(DISTINCT u.id) as total_users,
    COUNT(DISTINCT a.id) as total_agents,
    COUNT(DISTINCT c.id) as total_customers,
    COUNT(DISTINCT cc.id) as total_channels,
    COUNT(DISTINCT kbi.id) as total_knowledge_items,
    COUNT(DISTINCT kbi.id) FILTER (WHERE kbi.content_type IN ('article', 'guide', 'tutorial')) as total_articles,
    COUNT(DISTINCT kbi.id) FILTER (WHERE kbi.content_type = 'qa_collection') as total_qa_collections,
    COALESCE(SUM(ad.total_sessions), 0) as total_sessions_last_30_days,
    COALESCE(AVG(ad.satisfaction_avg), 0) as avg_satisfaction_last_30_days,
    o.created_at
FROM organizations o
LEFT JOIN subscription_plans sp ON o.subscription_plan_id = sp.id
LEFT JOIN users u ON o.id = u.organization_id AND u.deleted_at IS NULL
LEFT JOIN agents a ON o.id = a.organization_id AND a.status = 'active'
LEFT JOIN customers c ON o.id = c.organization_id AND c.status = 'active'
LEFT JOIN channel_configs cc ON o.id = cc.organization_id AND cc.status = 'active'
LEFT JOIN knowledge_base_items kbi ON o.id = kbi.organization_id AND kbi.status = 'active'
LEFT JOIN analytics_daily ad ON o.id = ad.organization_id AND ad.date >= CURRENT_DATE - INTERVAL '30 days'
WHERE o.status = 'active'
GROUP BY o.id, o.name, o.subscription_status, sp.name, o.created_at;

CREATE UNIQUE INDEX ON mv_organization_analytics (organization_id);

-- Create payment analytics view
CREATE MATERIALIZED VIEW mv_payment_analytics AS
SELECT
    pt.organization_id,
    o.name as organization_name,
    DATE_TRUNC('month', pt.created_at) as payment_month,
    COUNT(*) as total_transactions,
    COUNT(*) FILTER (WHERE pt.status = 'completed') as successful_payments,
    COUNT(*) FILTER (WHERE pt.status = 'failed') as failed_payments,
    SUM(pt.amount) FILTER (WHERE pt.status = 'completed') as total_revenue,
    AVG(pt.amount) FILTER (WHERE pt.status = 'completed') as avg_transaction_amount,
    COUNT(DISTINCT pt.subscription_id) as unique_subscriptions,
    SUM(pt.gateway_fee) FILTER (WHERE pt.status = 'completed') as total_gateway_fees,
    AVG(EXTRACT(EPOCH FROM (pt.captured_at - pt.initiated_at))) FILTER (WHERE pt.status = 'completed') as avg_processing_time_seconds
FROM payment_transactions pt
JOIN organizations o ON pt.organization_id = o.id
WHERE pt.created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY pt.organization_id, o.name, DATE_TRUNC('month', pt.created_at);

CREATE INDEX ON mv_payment_analytics (organization_id, payment_month);

-- Create subscription health view
CREATE MATERIALIZED VIEW mv_subscription_health AS
SELECT
    s.organization_id,
    o.name as organization_name,
    sp.name as plan_name,
    s.status as subscription_status,
    s.billing_cycle,
    s.current_period_end,
    s.next_payment_date,
    CASE
        WHEN s.current_period_end < CURRENT_TIMESTAMP THEN 'expired'
        WHEN s.current_period_end < CURRENT_TIMESTAMP + INTERVAL '7 days' THEN 'expiring_soon'
        WHEN s.cancel_at_period_end = TRUE THEN 'cancelling'
        ELSE 'healthy'
    END as health_status,
    COUNT(pt.id) as total_payments,
    COUNT(pt.id) FILTER (WHERE pt.status = 'completed') as successful_payments,
    COUNT(pt.id) FILTER (WHERE pt.status = 'failed') as failed_payments,
    MAX(pt.created_at) FILTER (WHERE pt.status = 'completed') as last_successful_payment,
    SUM(pt.amount) FILTER (WHERE pt.status = 'completed') as total_paid
FROM subscriptions s
JOIN organizations o ON s.organization_id = o.id
JOIN subscription_plans sp ON s.plan_id = sp.id
LEFT JOIN payment_transactions pt ON s.id = pt.subscription_id
WHERE s.status != 'cancelled'
GROUP BY s.id, s.organization_id, o.name, sp.name, s.status, s.billing_cycle,
         s.current_period_end, s.next_payment_date, s.cancel_at_period_end;

CREATE INDEX ON mv_subscription_health (organization_id, health_status);

-- Insert sample data for development and testing
INSERT INTO subscription_plans (name, display_name, description, tier, price_monthly, price_yearly, max_agents, max_channels, max_knowledge_articles, max_monthly_messages, max_monthly_ai_requests, features) VALUES
('Trial', 'Free Trial', '14-day free trial with basic features', 'trial', 0, 0, 1, 1, 50, 100, 10, '{"ai_assistant": false, "sentiment_analysis": false}'),
('Starter', 'Starter Plan', 'Perfect for small businesses', 'starter', 99000, 990000, 3, 2, 200, 1000, 100, '{"ai_assistant": true, "sentiment_analysis": false}'),
('Professional', 'Professional Plan', 'Advanced features for growing businesses', 'professional', 299000, 2990000, 10, 5, 1000, 10000, 1000, '{"ai_assistant": true, "sentiment_analysis": true, "advanced_analytics": true}'),
('Enterprise', 'Enterprise Plan', 'Full-featured plan for large organizations', 'enterprise', 999000, 9990000, -1, -1, -1, 100000, 10000, '{"ai_assistant": true, "sentiment_analysis": true, "advanced_analytics": true, "custom_branding": true, "api_access": true, "priority_support": true}');

INSERT INTO organizations (org_code, name, display_name, email, phone, website, subscription_plan_id, subscription_status) VALUES
('DEMO001', 'Demo Organization', 'Demo Corp', 'admin@demo.com', '+62812345678', 'https://demo.com', (SELECT id FROM subscription_plans WHERE name = 'Professional'), 'active'),
('TEST001', 'Test Company', 'Test Co.', 'admin@test.com', '+62812345679', 'https://test.com', (SELECT id FROM subscription_plans WHERE name = 'Starter'), 'trial');

INSERT INTO users (organization_id, email, username, password_hash, full_name, role) VALUES
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'admin@demo.com', 'admin', '$2b$10$example_hash', 'Demo Admin', 'org_admin'),
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'agent@demo.com', 'agent1', '$2b$10$example_hash', 'Demo Agent', 'agent');

INSERT INTO ai_models (organization_id, name, model_type, system_prompt) VALUES
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'Default GPT-4', 'gpt-4', 'You are a helpful customer service assistant. Be polite, professional, and concise in your responses.');

-- Insert sample knowledge base categories
INSERT INTO knowledge_base_categories (organization_id, name, slug, description, icon, color, supports_articles, supports_qa, supports_faq) VALUES
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'General FAQ', 'general-faq', 'Frequently asked questions and general information', 'help-circle', '#3B82F6', TRUE, TRUE, TRUE),
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'Technical Support', 'technical-support', 'Technical help and troubleshooting guides', 'settings', '#10B981', TRUE, TRUE, FALSE),
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'Product Information', 'product-info', 'Product features and specifications', 'package', '#8B5CF6', TRUE, FALSE, FALSE),
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'Service Policies', 'service-policies', 'Service policies and procedures', 'shield', '#F59E0B', TRUE, TRUE, TRUE);

-- Insert sample knowledge base tags
INSERT INTO knowledge_base_tags (organization_id, name, slug, description, color, tag_type) VALUES
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'gadai', 'gadai', 'Related to pawn services', '#3B82F6', 'service'),
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'emas', 'emas', 'Gold-related content', '#F59E0B', 'product'),
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'cicilan', 'cicilan', 'Installment payments', '#10B981', 'service'),
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'pembayaran', 'pembayaran', 'Payment methods and procedures', '#8B5CF6', 'service'),
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'dokumen', 'dokumen', 'Required documents', '#EF4444', 'general'),
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'proses', 'proses', 'Process and procedures', '#6B7280', 'general');

-- Insert sample knowledge base items (Q&A Collection and Articles)
INSERT INTO knowledge_base_items (
    organization_id,
    category_id,
    title,
    slug,
    description,
    content_type,
    priority,
    language,
    is_public,
    is_ai_trainable,
    workflow_status,
    approval_status,
    author_id,
    published_at,
    tags,
    keywords,
    status
) VALUES
-- Q&A Collection for Gadai Emas
((SELECT id FROM organizations WHERE org_code = 'DEMO001'),
 (SELECT id FROM knowledge_base_categories WHERE slug = 'general-faq' AND organization_id = (SELECT id FROM organizations WHERE org_code = 'DEMO001')),
 'FAQ Gadai Emas - Pertanyaan Umum',
 'faq-gadai-emas-pertanyaan-umum',
 'Kumpulan pertanyaan dan jawaban seputar layanan gadai emas',
 'qa_collection',
 'high',
 'indonesia',
 TRUE,
 TRUE,
 'published',
 'approved',
 (SELECT id FROM users WHERE email = 'admin@demo.com'),
 CURRENT_TIMESTAMP,
 ARRAY['gadai', 'emas', 'faq'],
 ARRAY['gadai', 'emas', 'pawn', 'gold', 'syarat', 'dokumen'],
 'active'),

-- Article for Technical Support
((SELECT id FROM organizations WHERE org_code = 'DEMO001'),
 (SELECT id FROM knowledge_base_categories WHERE slug = 'technical-support' AND organization_id = (SELECT id FROM organizations WHERE org_code = 'DEMO001')),
 'Panduan Lengkap Proses Gadai Emas',
 'panduan-lengkap-proses-gadai-emas',
 'Panduan step-by-step untuk mengajukan gadai emas dari awal hingga pencairan',
 'article',
 'high',
 'indonesia',
 TRUE,
 TRUE,
 'published',
 'approved',
 (SELECT id FROM users WHERE email = 'admin@demo.com'),
 CURRENT_TIMESTAMP,
 ARRAY['gadai', 'emas', 'panduan', 'proses'],
 ARRAY['gadai', 'emas', 'proses', 'langkah', 'syarat', 'dokumen', 'approval'],
 'active'),

-- Additional Article with content
((SELECT id FROM organizations WHERE org_code = 'DEMO001'),
 (SELECT id FROM knowledge_base_categories WHERE slug = 'product-info' AND organization_id = (SELECT id FROM organizations WHERE org_code = 'DEMO001')),
 'Informasi Lengkap Layanan Gadai Emas',
 'informasi-lengkap-layanan-gadai-emas',
 'Informasi detail mengenai layanan gadai emas termasuk syarat, ketentuan, dan prosedur',
 'article',
 'medium',
 'indonesia',
 TRUE,
 TRUE,
 'published',
 'approved',
 (SELECT id FROM users WHERE email = 'admin@demo.com'),
 CURRENT_TIMESTAMP,
 ARRAY['gadai', 'emas', 'informasi'],
 ARRAY['gadai', 'emas', 'layanan', 'syarat', 'ketentuan'],
 'active');

-- Update articles with actual content
UPDATE knowledge_base_items
SET content = 'Layanan gadai emas merupakan solusi finansial yang memberikan kemudahan akses dana tunai dengan jaminan emas. Berikut informasi lengkap mengenai layanan ini:

## Syarat dan Ketentuan
1. **Usia minimal**: 21 tahun atau sudah menikah
2. **Dokumen yang diperlukan**:
   - KTP/Identitas yang masih berlaku
   - Slip gaji atau bukti penghasilan
   - Rekening koran 3 bulan terakhir
   - Sertifikat emas (jika ada)
   - NPWP (untuk nominal besar)

## Proses Pengajuan
1. **Pengajuan**: Isi formulir aplikasi secara lengkap
2. **Verifikasi**: Tim kami akan memverifikasi dokumen dan emas
3. **Penilaian**: Penilaian nilai emas berdasarkan kadar dan berat
4. **Persetujuan**: Proses approval 1-3 hari kerja
5. **Pencairan**: Dana cair setelah penandatanganan kontrak

## Keunggulan Layanan
- Proses cepat dan mudah
- Bunga kompetitif mulai 1.5% per bulan
- Emas tetap aman tersimpan
- Fleksibilitas tenor pembayaran
- Layanan customer service 24/7

## Ketentuan Pembayaran
- Sistem bunga flat
- Tenor fleksibel: 3, 6, 12, atau 24 bulan
- Pembayaran dapat dilakukan via transfer atau langsung ke kantor
- Tidak ada penalti untuk pelunasan dipercepat

Untuk informasi lebih lanjut, hubungi customer service kami di 1500-123 atau kunjungi cabang terdekat.'
WHERE slug = 'informasi-lengkap-layanan-gadai-emas';

-- Update the technical support article with content
UPDATE knowledge_base_items
SET content = '# Panduan Lengkap Proses Gadai Emas

Panduan ini akan membantu Anda memahami langkah-langkah lengkap untuk mengajukan gadai emas dari awal hingga pencairan dana.

## Persiapan Dokumen

### Dokumen Wajib
1. **Kartu Identitas (KTP/SIM/Paspor)** yang masih berlaku
2. **Bukti penghasilan** (slip gaji, surat keterangan usaha, atau laporan keuangan)
3. **Rekening koran** 3 bulan terakhir
4. **NPWP** (untuk pinjaman di atas Rp 50 juta)

### Dokumen Pendukung
- Sertifikat emas (jika tersedia)
- Bukti kepemilikan emas
- Kartu keluarga
- Surat nikah (jika sudah menikah)

## Langkah-langkah Pengajuan

### Step 1: Pengajuan Awal
1. Kunjungi cabang terdekat atau ajukan online
2. Isi formulir aplikasi dengan lengkap dan benar
3. Serahkan dokumen yang diperlukan
4. Bawa emas yang akan dijaminkan

### Step 2: Verifikasi dan Penilaian
1. **Verifikasi dokumen** oleh tim verifikasi
2. **Pemeriksaan emas** untuk menentukan kadar dan berat
3. **Penilaian nilai emas** berdasarkan harga pasar terkini
4. **Penentuan nilai pinjaman** maksimal 80% dari nilai emas

### Step 3: Proses Persetujuan
1. **Analisis kredit** berdasarkan profil nasabah
2. **Review dokumen** oleh tim credit analyst
3. **Persetujuan pinjaman** dalam 1-3 hari kerja
4. **Notifikasi hasil** via SMS/email/telepon

### Step 4: Pencairan Dana
1. **Penandatanganan kontrak** pinjaman
2. **Penyerahan emas** untuk disimpan dalam brankas
3. **Pencairan dana** via transfer atau tunai
4. **Penerimaan dokumen** bukti gadai

## Tips Penting

### Sebelum Mengajukan
- Pastikan semua dokumen lengkap dan valid
- Periksa kadar emas minimal 16 karat
- Siapkan emas dalam kondisi bersih
- Hitung kemampuan bayar bulanan

### Saat Proses Berlangsung
- Kooperatif saat verifikasi
- Berikan informasi yang akurat
- Simpan semua bukti transaksi
- Catat jadwal pembayaran

### Setelah Pencairan
- Bayar cicilan tepat waktu
- Simpan bukti pembayaran
- Hubungi CS jika ada kendala
- Rencanakan pelunasan dipercepat jika memungkinkan

## Kontak Bantuan

Jika mengalami kesulitan dalam proses pengajuan:
- **Customer Service**: 1500-123 (24 jam)
- **WhatsApp**: 0811-1234-5678
- **Email**: support@example.com
- **Website**: www.example.com/bantuan

Tim customer service kami siap membantu Anda dalam setiap tahap proses pengajuan gadai emas.'
WHERE slug = 'panduan-lengkap-proses-gadai-emas';

-- Insert sample Q&A items for the Q&A collection
INSERT INTO knowledge_qa_items (
    knowledge_item_id,
    organization_id,
    question,
    answer,
    question_variations,
    confidence_level,
    keywords,
    search_keywords,
    trigger_phrases,
    order_index,
    is_primary,
    is_active
) VALUES
-- Q&A for Gadai Emas FAQ
((SELECT id FROM knowledge_base_items WHERE slug = 'faq-gadai-emas-pertanyaan-umum'),
 (SELECT id FROM organizations WHERE org_code = 'DEMO001'),
 'Berapa lama proses persetujuan gadai emas?',
 'Proses persetujuan gadai emas biasanya membutuhkan waktu 1-3 hari kerja setelah semua dokumen lengkap diserahkan. Untuk kasus tertentu, approval bisa lebih cepat dalam 24 jam.',
 ARRAY['Berapa hari proses approval gadai emas?', 'Kapan gadai emas disetujui?', 'Lama waktu persetujuan gadai'],
 'high',
 ARRAY['proses', 'persetujuan', 'approval', 'waktu', 'gadai', 'emas'],
 ARRAY['proses', 'approval', 'persetujuan', 'berapa lama', 'waktu', 'hari'],
 ARRAY['berapa lama', 'proses approval', 'waktu persetujuan', 'kapan disetujui'],
 1,
 TRUE,
 TRUE),

((SELECT id FROM knowledge_base_items WHERE slug = 'faq-gadai-emas-pertanyaan-umum'),
 (SELECT id FROM organizations WHERE org_code = 'DEMO001'),
 'Apa saja dokumen yang diperlukan untuk gadai emas?',
 'Dokumen yang diperlukan: 1) KTP/Identitas yang masih berlaku, 2) Slip gaji atau bukti penghasilan, 3) Rekening koran 3 bulan terakhir, 4) Sertifikat emas (jika ada), 5) NPWP (untuk nominal besar).',
 ARRAY['Dokumen apa saja untuk gadai emas?', 'Syarat dokumen gadai emas', 'Persyaratan gadai emas'],
 'high',
 ARRAY['dokumen', 'syarat', 'persyaratan', 'gadai', 'emas', 'KTP', 'slip gaji'],
 ARRAY['dokumen', 'syarat', 'persyaratan', 'apa saja', 'diperlukan'],
 ARRAY['dokumen apa', 'syarat apa', 'persyaratan apa', 'dokumen diperlukan'],
 2,
 FALSE,
 TRUE),

((SELECT id FROM knowledge_base_items WHERE slug = 'faq-gadai-emas-pertanyaan-umum'),
 (SELECT id FROM organizations WHERE org_code = 'DEMO001'),
 'Berapa bunga yang dikenakan untuk gadai emas?',
 'Bunga gadai emas mulai dari 1.5% per bulan dengan sistem bunga flat. Suku bunga dapat bervariasi tergantung tenor, jumlah pinjaman, dan profil risiko nasabah. Tidak ada biaya tersembunyi.',
 ARRAY['Bunga gadai emas berapa?', 'Suku bunga gadai emas', 'Interest rate gadai emas'],
 'high',
 ARRAY['bunga', 'suku bunga', 'interest', 'rate', 'gadai', 'emas', 'persen'],
 ARRAY['bunga', 'suku bunga', 'berapa', 'persen', 'rate'],
 ARRAY['bunga berapa', 'suku bunga', 'berapa persen', 'interest rate'],
 3,
 FALSE,
 TRUE);

-- Link tags to knowledge base items
INSERT INTO knowledge_base_item_tags (knowledge_item_id, tag_id, assigned_by, is_auto_assigned) VALUES
-- Tags for FAQ Gadai Emas
((SELECT id FROM knowledge_base_items WHERE slug = 'faq-gadai-emas-pertanyaan-umum'),
 (SELECT id FROM knowledge_base_tags WHERE slug = 'gadai' AND organization_id = (SELECT id FROM organizations WHERE org_code = 'DEMO001')),
 (SELECT id FROM users WHERE email = 'admin@demo.com'),
 FALSE),

((SELECT id FROM knowledge_base_items WHERE slug = 'faq-gadai-emas-pertanyaan-umum'),
 (SELECT id FROM knowledge_base_tags WHERE slug = 'emas' AND organization_id = (SELECT id FROM organizations WHERE org_code = 'DEMO001')),
 (SELECT id FROM users WHERE email = 'admin@demo.com'),
 FALSE),

-- Tags for Panduan Gadai Emas
((SELECT id FROM knowledge_base_items WHERE slug = 'panduan-lengkap-proses-gadai-emas'),
 (SELECT id FROM knowledge_base_tags WHERE slug = 'gadai' AND organization_id = (SELECT id FROM organizations WHERE org_code = 'DEMO001')),
 (SELECT id FROM users WHERE email = 'admin@demo.com'),
 FALSE),

((SELECT id FROM knowledge_base_items WHERE slug = 'panduan-lengkap-proses-gadai-emas'),
 (SELECT id FROM knowledge_base_tags WHERE slug = 'proses' AND organization_id = (SELECT id FROM organizations WHERE org_code = 'DEMO001')),
 (SELECT id FROM users WHERE email = 'admin@demo.com'),
 FALSE);

-- Insert sample RBAC data
INSERT INTO roles (organization_id, name, code, display_name, description, level, is_system_role, color, icon) VALUES
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'Super Administrator', 'super_admin', 'Super Admin', 'Full system access with all permissions', 1, TRUE, '#DC2626', 'shield'),
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'Organization Administrator', 'org_admin', 'Org Admin', 'Organization-level administrative access', 2, TRUE, '#EA580C', 'settings'),
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'Agent Manager', 'agent_manager', 'Agent Manager', 'Manage agents and customer interactions', 3, FALSE, '#0EA5E9', 'users'),
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'Customer Agent', 'customer_agent', 'Customer Agent', 'Handle customer conversations and support', 4, FALSE, '#10B981', 'headphones'),
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'Content Manager', 'content_manager', 'Content Manager', 'Manage knowledge base and bot personalities', 4, FALSE, '#8B5CF6', 'edit'),
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'Analyst', 'analyst', 'Analyst', 'View analytics and generate reports', 5, FALSE, '#F59E0B', 'bar-chart'),
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'Viewer', 'viewer', 'Viewer', 'Read-only access to basic information', 6, FALSE, '#6B7280', 'eye');

INSERT INTO permission_groups (organization_id, name, code, display_name, description, category, icon, color) VALUES
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'User Management', 'user_mgmt', 'User Management', 'User and role management permissions', 'administration', 'users', '#DC2626'),
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'Content Management', 'content_mgmt', 'Content Management', 'Knowledge base and content permissions', 'content', 'edit', '#8B5CF6'),
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'Customer Service', 'customer_service', 'Customer Service', 'Chat and customer interaction permissions', 'operations', 'headphones', '#10B981'),
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'Analytics & Reports', 'analytics', 'Analytics & Reports', 'Analytics and reporting permissions', 'insights', 'bar-chart', '#F59E0B'),
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'System Administration', 'system_admin', 'System Administration', 'System configuration and management', 'administration', 'settings', '#EA580C');

INSERT INTO permissions (organization_id, name, code, display_name, description, resource, action, category, is_system_permission) VALUES
-- User Management Permissions
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'Create Users', 'users.create', 'Create Users', 'Create new user accounts', 'users', 'create', 'user_management', TRUE),
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'View All Users', 'users.view_all', 'View All Users', 'View all user accounts in organization', 'users', 'view_all', 'user_management', TRUE),
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'Edit All Users', 'users.edit_all', 'Edit All Users', 'Edit any user account', 'users', 'edit_all', 'user_management', TRUE),
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'Delete Users', 'users.delete', 'Delete Users', 'Delete user accounts', 'users', 'delete', 'user_management', TRUE),

-- Content Management Permissions
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'Manage Knowledge Articles', 'articles.manage', 'Manage Articles', 'Full access to knowledge articles', 'knowledge_articles', 'manage', 'content_management', TRUE),
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'Publish Articles', 'articles.publish', 'Publish Articles', 'Publish knowledge articles', 'knowledge_articles', 'publish', 'content_management', TRUE),
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'Manage Bot Personalities', 'bots.manage', 'Manage Bots', 'Configure bot personalities', 'bot_personalities', 'manage', 'content_management', TRUE),

-- Customer Service Permissions
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'Handle Chats', 'chats.handle', 'Handle Chats', 'Participate in customer chat sessions', 'chat_sessions', 'update', 'customer_service', TRUE),
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'View All Chats', 'chats.view_all', 'View All Chats', 'View all chat sessions', 'chat_sessions', 'view_all', 'customer_service', TRUE),
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'Export Chat Data', 'chats.export', 'Export Chats', 'Export chat session data', 'chat_sessions', 'export', 'customer_service', TRUE),

-- Analytics Permissions
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'View Analytics', 'analytics.view', 'View Analytics', 'Access analytics dashboards', 'analytics', 'read', 'analytics', TRUE),
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'Export Reports', 'analytics.export', 'Export Reports', 'Export analytics reports', 'analytics', 'export', 'analytics', TRUE),

-- System Administration Permissions
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'Manage API Keys', 'api_keys.manage', 'Manage API Keys', 'Create and manage API keys', 'api_keys', 'manage', 'system_administration', TRUE),
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'Manage Webhooks', 'webhooks.manage', 'Manage Webhooks', 'Configure webhook endpoints', 'webhooks', 'manage', 'system_administration', TRUE),
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'View System Logs', 'logs.view', 'View System Logs', 'Access system logs and audit trails', 'system_logs', 'read', 'system_administration', TRUE);

-- Create sample subscription for DEMO001
INSERT INTO subscriptions (organization_id, plan_id, status, billing_cycle, unit_amount, currency, current_period_start, current_period_end, next_payment_date, payment_method_id) VALUES
((SELECT id FROM organizations WHERE org_code = 'DEMO001'),
 (SELECT id FROM subscription_plans WHERE name = 'Professional'),
 'success',
 'monthly',
 299000,
 'IDR',
 CURRENT_TIMESTAMP - INTERVAL '15 days',
 CURRENT_TIMESTAMP + INTERVAL '15 days',
 CURRENT_TIMESTAMP + INTERVAL '15 days',
 'pm_demo_card_123');

-- Create sample WAHA channel configuration
INSERT INTO channel_configs (organization_id, channel, channel_identifier, name, display_name, description, personality_id, is_active, status) VALUES
((SELECT id FROM organizations WHERE org_code = 'DEMO001'), 'whatsapp', '62812345678', 'WhatsApp Business', 'WhatsApp Business Channel', 'Official WhatsApp Business channel for customer support', (SELECT id FROM bot_personalities WHERE organization_id = (SELECT id FROM organizations WHERE org_code = 'DEMO001') LIMIT 1), TRUE, 'active');

-- Create sample WAHA session
INSERT INTO waha_sessions (
    organization_id,
    channel_config_id,
    session_name,
    phone_number,
    instance_id,
    status,
    is_authenticated,
    is_connected,
    health_status,
    has_business_features,
    business_name,
    business_category,
    business_description,
    features,
    rate_limits
) VALUES (
    (SELECT id FROM organizations WHERE org_code = 'DEMO001'),
    (SELECT id FROM channel_configs WHERE channel_identifier = '62812345678' AND organization_id = (SELECT id FROM organizations WHERE org_code = 'DEMO001')),
    'demo_whatsapp_session',
    '62812345678',
    'demo_instance_001',
    'working',
    TRUE,
    TRUE,
    'healthy',
    TRUE,
    'Demo Business',
    'Financial Services',
    'Layanan gadai emas terpercaya',
    '{"media_upload": true, "voice_messages": true, "group_chat": true, "broadcast": true, "templates": true, "quick_replies": true, "labels": true, "catalog": true, "shopping": false, "payment": false}',
    '{"messages_per_minute": 60, "messages_per_hour": 1000, "media_per_minute": 10, "media_per_hour": 100}'
);

-- Create sample WAHA contacts
INSERT INTO waha_contacts (
    organization_id,
    session_id,
    phone_number,
    contact_id,
    push_name,
    name,
    short_name,
    is_contact,
    is_wa_contact,
    labels,
    tags
) VALUES
((SELECT id FROM organizations WHERE org_code = 'DEMO001'),
 (SELECT id FROM waha_sessions WHERE session_name = 'demo_whatsapp_session'),
 '+6281234567890',
 'contact_001',
 'John Doe',
 'John Doe',
 'John',
 TRUE,
 TRUE,
 '["customer", "premium"]',
 ARRAY['customer', 'premium', 'active']),

((SELECT id FROM organizations WHERE org_code = 'DEMO001'),
 (SELECT id FROM waha_sessions WHERE session_name = 'demo_whatsapp_session'),
 '+6281234567891',
 'contact_002',
 'Jane Smith',
 'Jane Smith',
 'Jane',
 TRUE,
 TRUE,
 '["customer", "new"]',
 ARRAY['customer', 'new', 'inquiry']);

-- Create sample WAHA groups
INSERT INTO waha_groups (
    organization_id,
    session_id,
    group_id,
    group_name,
    group_description,
    group_type,
    participant_count,
    admin_count,
    participants,
    admins
) VALUES
((SELECT id FROM organizations WHERE org_code = 'DEMO001'),
 (SELECT id FROM waha_sessions WHERE session_name = 'demo_whatsapp_session'),
 'group_001',
 'Demo Customer Support',
 'Group untuk customer support dan informasi layanan',
 'group',
 25,
 3,
 '["+6281234567890", "+6281234567891", "+6281234567892"]',
 '["+62812345678"]');

-- Create sample WAHA messages
INSERT INTO waha_messages (
    organization_id,
    session_id,
    message_id,
    chat_id,
    from_me,
    from_number,
    to_number,
    chat_type,
    message_text,
    message_type,
    status,
    timestamp,
    is_reply,
    processing_status
) VALUES
-- Customer inquiry message
((SELECT id FROM organizations WHERE org_code = 'DEMO001'),
 (SELECT id FROM waha_sessions WHERE session_name = 'demo_whatsapp_session'),
 'msg_001',
 '+6281234567890',
 'false',
 '+6281234567890',
 '+62812345678',
 'individual',
 'Halo, saya ingin bertanya tentang layanan gadai emas. Bagaimana caranya?',
 'text',
 'delivered',
 CURRENT_TIMESTAMP - INTERVAL '1 hour',
 FALSE,
 'processed'),

-- Bot response message
((SELECT id FROM organizations WHERE org_code = 'DEMO001'),
 (SELECT id FROM waha_sessions WHERE session_name = 'demo_whatsapp_session'),
 'msg_002',
 '+6281234567890',
 'true',
 '+62812345678',
 '+6281234567890',
 'individual',
 'Halo! Terima kasih atas pertanyaannya. Untuk layanan gadai emas, Anda perlu menyiapkan dokumen seperti KTP, slip gaji, dan emas yang akan dijaminkan. Proses approval membutuhkan waktu 1-3 hari kerja. Apakah ada yang ingin ditanyakan lebih lanjut?',
 'text',
 'sent',
 CURRENT_TIMESTAMP - INTERVAL '55 minutes',
 TRUE,
 'sent'),

-- Customer follow-up
((SELECT id FROM organizations WHERE org_code = 'DEMO001'),
 (SELECT id FROM waha_sessions WHERE session_name = 'demo_whatsapp_session'),
 'msg_003',
 '+6281234567890',
 'false',
 '+6281234567890',
 '+62812345678',
 'individual',
 'Berapa bunga yang dikenakan?',
 'text',
 'delivered',
 CURRENT_TIMESTAMP - INTERVAL '50 minutes',
 FALSE,
 'processed'),

-- Bot response with template
((SELECT id FROM organizations WHERE org_code = 'DEMO001'),
 (SELECT id FROM waha_sessions WHERE session_name = 'demo_whatsapp_session'),
 'msg_004',
 '+6281234567890',
 'true',
 '+62812345678',
 '+6281234567890',
 'individual',
 'Bunga gadai emas mulai dari 1.5% per bulan dengan sistem bunga flat. Suku bunga dapat bervariasi tergantung tenor dan jumlah pinjaman. Untuk informasi lebih detail, silakan kunjungi cabang kami atau hubungi customer service di 1500-123.',
 'text',
 'sent',
 CURRENT_TIMESTAMP - INTERVAL '45 minutes',
 TRUE,
 'sent');

-- Create sample WAHA webhook events
INSERT INTO waha_webhook_events (
    organization_id,
    session_id,
    event_id,
    event_type,
    event_subtype,
    event_data,
    raw_payload,
    processing_status
) VALUES
((SELECT id FROM organizations WHERE org_code = 'DEMO001'),
 (SELECT id FROM waha_sessions WHERE session_name = 'demo_whatsapp_session'),
 'webhook_001',
 'message',
 'text',
 '{"from": "+6281234567890", "to": "+62812345678", "text": "Halo, saya ingin bertanya tentang layanan gadai emas. Bagaimana caranya?", "timestamp": "2024-01-15T10:00:00Z"}',
 '{"event": "message", "data": {"from": "+6281234567890", "to": "+62812345678", "text": "Halo, saya ingin bertanya tentang layanan gadai emas. Bagaimana caranya?", "timestamp": "2024-01-15T10:00:00Z"}}',
 'processed'),

((SELECT id FROM organizations WHERE org_code = 'DEMO001'),
 (SELECT id FROM waha_sessions WHERE session_name = 'demo_whatsapp_session'),
 'webhook_002',
 'status',
 'delivered',
 '{"from": "+6281234567890", "to": "+62812345678", "status": "delivered", "timestamp": "2024-01-15T10:05:00Z"}',
 '{"event": "status", "data": {"from": "+6281234567890", "to": "+62812345678", "status": "delivered", "timestamp": "2024-01-15T10:05:00Z"}}',
 'processed');

-- Create sample WAHA business features
INSERT INTO waha_business_features (
    organization_id,
    session_id,
    feature_name,
    feature_type,
    is_enabled,
    is_verified,
    configuration,
    settings
) VALUES
((SELECT id FROM organizations WHERE org_code = 'DEMO001'),
 (SELECT id FROM waha_sessions WHERE session_name = 'demo_whatsapp_session'),
 'catalog',
 'business',
 TRUE,
 TRUE,
 '{"enabled": true, "product_count": 5, "categories": ["Emas", "Perhiasan", "Logam Mulia"]}',
 '{"auto_reply": true, "catalog_links": true}'),

((SELECT id FROM organizations WHERE org_code = 'DEMO001'),
 (SELECT id FROM waha_sessions WHERE session_name = 'demo_whatsapp_session'),
 'labels',
 'business',
 TRUE,
 TRUE,
 '{"enabled": true, "label_count": 8, "colors": {"customer": "#10B981", "inquiry": "#3B82F6", "premium": "#F59E0B"}}',
 '{"auto_labeling": true, "custom_labels": true}'),

((SELECT id FROM organizations WHERE org_code = 'DEMO001'),
 (SELECT id FROM waha_sessions WHERE session_name = 'demo_whatsapp_session'),
 'quick_replies',
 'business',
 TRUE,
 TRUE,
 '{"enabled": true, "reply_count": 12, "categories": ["Greeting", "Information", "Support"]}',
 '{"auto_suggest": true, "custom_replies": true}');

-- Create sample WAHA analytics daily
INSERT INTO waha_analytics_daily (
    organization_id,
    session_id,
    date,
    total_messages,
    messages_sent,
    messages_received,
    media_messages,
    text_messages,
    total_contacts,
    new_contacts,
    active_contacts,
    total_groups,
    new_groups,
    active_groups,
    avg_response_time,
    response_rate,
    uptime_percentage,
    business_inquiries,
    product_views,
    orders_received,
    error_count,
    webhook_failures,
    api_failures
) VALUES
((SELECT id FROM organizations WHERE org_code = 'DEMO001'),
 (SELECT id FROM waha_sessions WHERE session_name = 'demo_whatsapp_session'),
 CURRENT_DATE,
 4,
 2,
 2,
 0,
 4,
 2,
 2,
 2,
 1,
 1,
 1,
 300,
 100.00,
 99.50,
 2,
 0,
 0,
 0,
 0,
 0);

-- Create sample payment transactions
INSERT INTO payment_transactions (
    organization_id,
    subscription_id,
    transaction_id,
    external_transaction_id,
    amount,
    currency,
    payment_method,
    payment_gateway,
    payment_channel,
    status,
    payment_type,
    initiated_at,
    captured_at,
    gateway_response,
    gateway_fee,
    net_amount
) VALUES
-- Successful monthly payment
((SELECT id FROM organizations WHERE org_code = 'DEMO001'),
 (SELECT id FROM subscriptions WHERE organization_id = (SELECT id FROM organizations WHERE org_code = 'DEMO001') LIMIT 1),
 'TXN-' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP - INTERVAL '15 days')::TEXT,
 'midtrans_' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP - INTERVAL '15 days')::TEXT,
 299000,
 'IDR',
 'credit_card',
 'midtrans',
 'credit_card',
 'completed',
 'recurring',
 CURRENT_TIMESTAMP - INTERVAL '15 days',
 CURRENT_TIMESTAMP - INTERVAL '15 days' + INTERVAL '2 minutes',
 '{"status_code": "200", "transaction_status": "capture", "gross_amount": "299000.00"}',
 8970, -- 3% gateway fee
 290030
),
-- Upcoming renewal payment (pending)
((SELECT id FROM organizations WHERE org_code = 'DEMO001'),
 (SELECT id FROM subscriptions WHERE organization_id = (SELECT id FROM organizations WHERE org_code = 'DEMO001') LIMIT 1),
 'TXN-' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP + INTERVAL '14 days')::TEXT,
 NULL,
 299000,
 'IDR',
 'credit_card',
 'midtrans',
 'credit_card',
 'pending',
 'recurring',
 CURRENT_TIMESTAMP + INTERVAL '14 days',
 NULL,
 '{}',
 0,
 299000
);

-- Create scheduled jobs (requires pg_cron extension)
-- SELECT cron.schedule('clean-expired-sessions', '0 2 * * *', 'SELECT chatbot.clean_expired_sessions();');
-- SELECT cron.schedule('refresh-analytics-mv', '*/5 * * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY chatbot.mv_organization_analytics; REFRESH MATERIALIZED VIEW CONCURRENTLY chatbot.mv_payment_analytics; REFRESH MATERIALIZED VIEW CONCURRENTLY chatbot.mv_subscription_health;');
-- SELECT cron.schedule('create-monthly-partitions', '0 0 1 * *', 'SELECT chatbot.create_monthly_partitions(''chat_sessions''); SELECT chatbot.create_monthly_partitions(''messages''); SELECT chatbot.create_monthly_partitions(''ai_conversations_log''); SELECT chatbot.create_monthly_partitions(''audit_logs''); SELECT chatbot.create_monthly_partitions(''n8n_executions''); SELECT chatbot.create_monthly_partitions(''realtime_metrics''); SELECT chatbot.create_monthly_partitions(''system_logs'');');
-- SELECT cron.schedule('process-subscription-renewals', '0 1 * * *', 'SELECT chatbot.process_subscription_renewal(id) FROM chatbot.subscriptions WHERE next_payment_date <= CURRENT_DATE + INTERVAL ''1 day'' AND status = ''success'' AND cancel_at_period_end = FALSE;');

-- Comments for documentation
COMMENT ON SCHEMA chatbot IS 'Enhanced ChatBot AI + Human Multi-tenant SAAS Database Schema for PostgreSQL 15';
COMMENT ON TABLE subscription_plans IS 'SAAS subscription plans with pricing and feature configuration';
COMMENT ON TABLE organizations IS 'Enhanced organization table with subscription, usage tracking, and SAAS features';
COMMENT ON TABLE api_keys IS 'API keys for programmatic access with rate limiting and security controls';
COMMENT ON TABLE subscriptions IS 'Organization subscriptions with billing cycle and payment tracking';
COMMENT ON TABLE billing_invoices IS 'Billing invoices with payment status and transaction details';
COMMENT ON TABLE usage_tracking IS 'Daily usage tracking for quota management and billing';
COMMENT ON TABLE users IS 'Enhanced user table with session management and security features';
COMMENT ON TABLE user_sessions IS 'User session management with security tracking';
COMMENT ON TABLE ai_models IS 'AI model configurations with performance metrics';
COMMENT ON TABLE knowledge_base_categories IS 'Enhanced knowledge base categories with multi-content type support and analytics';
COMMENT ON TABLE knowledge_base_items IS 'Enhanced knowledge base items supporting both articles and Q&A collections with AI integration';
COMMENT ON TABLE knowledge_qa_items IS 'Normalized Q&A items with advanced search and AI capabilities';
COMMENT ON TABLE knowledge_base_tags IS 'Enhanced tagging system with hierarchical support and auto-suggestion';
COMMENT ON TABLE knowledge_base_item_tags IS 'Junction table for knowledge item tagging with AI confidence scoring';
COMMENT ON TABLE knowledge_base_item_relationships IS 'Knowledge item relationships for content discovery and navigation';
COMMENT ON TABLE bot_personalities IS 'Bot personality configurations with AI model integration';
COMMENT ON TABLE channel_configs IS 'Multi-channel integration with enhanced security';
COMMENT ON TABLE customers IS 'Customer profiles with AI insights and behavioral data';
COMMENT ON TABLE agents IS 'Agent profiles with AI assistance and performance metrics';
COMMENT ON TABLE chat_sessions IS 'Enhanced chat sessions with AI analytics (partitioned)';
COMMENT ON TABLE messages IS 'Enhanced message table with AI processing and sentiment analysis (partitioned)';
COMMENT ON TABLE ai_training_data IS 'AI training data collection with quality validation';
COMMENT ON TABLE ai_conversations_log IS 'AI conversation logging with performance metrics (partitioned)';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit logging with API tracking (partitioned)';
COMMENT ON TABLE api_rate_limits IS 'API rate limiting with IP and key-based controls';
COMMENT ON TABLE analytics_daily IS 'Enhanced daily analytics with AI metrics';
COMMENT ON TABLE webhooks IS 'Webhook configuration for real-time event notifications';
COMMENT ON TABLE webhook_deliveries IS 'Webhook delivery tracking with retry logic (partitioned)';
COMMENT ON TABLE n8n_workflows IS 'N8N workflow automation configurations with version control';
COMMENT ON TABLE n8n_executions IS 'N8N workflow execution history with performance metrics (partitioned)';
COMMENT ON TABLE payment_transactions IS 'Detailed payment transaction tracking with gateway integration';
COMMENT ON TABLE realtime_metrics IS 'Real-time system metrics for monitoring and alerting (partitioned)';
COMMENT ON TABLE system_logs IS 'Comprehensive system logging with structured data (partitioned)';

-- WAHA Integration Table Comments
COMMENT ON TABLE waha_sessions IS 'Enhanced WhatsApp session management through WAHA API integration with health monitoring and business features';
COMMENT ON TABLE waha_messages IS 'Enhanced WhatsApp message tracking with AI processing, media support, and business message properties';
COMMENT ON TABLE waha_contacts IS 'Enhanced WhatsApp contact management with business profiles, interaction history, and AI insights';
COMMENT ON TABLE waha_groups IS 'Enhanced WhatsApp group management with participant tracking, admin controls, and group analytics';
COMMENT ON TABLE waha_webhook_events IS 'Enhanced webhook event tracking for real-time WhatsApp event processing with retry logic';
COMMENT ON TABLE waha_api_requests IS 'Enhanced API request tracking for WAHA integration with performance metrics and error handling';
COMMENT ON TABLE waha_rate_limits IS 'Enhanced rate limiting for WAHA API with session-based and endpoint-based controls';
COMMENT ON TABLE waha_business_features IS 'Enhanced business feature tracking for WhatsApp Business API with verification and configuration';
COMMENT ON TABLE waha_analytics_daily IS 'Enhanced daily analytics for WAHA integration with comprehensive WhatsApp metrics and business insights';

-- RBAC System Table Comments
COMMENT ON TABLE roles IS 'RBAC role definitions with hierarchy and inheritance support';
COMMENT ON TABLE permissions IS 'Granular permission definitions with resource-action mapping';
COMMENT ON TABLE role_permissions IS 'Role-permission assignments with inheritance tracking';
COMMENT ON TABLE user_roles IS 'User-role assignments with temporal and scope control';
COMMENT ON TABLE permission_groups IS 'Permission grouping for organized access control management';
COMMENT ON TABLE permission_group_permissions IS 'Permission group membership for bulk permission management';

-- Final optimizations
ANALYZE;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🎉 Enhanced ChatBot SAAS Database Schema Created Successfully!';
    RAISE NOTICE '📊 Schema: chatbot';
    RAISE NOTICE '📋 Tables: 44+ core tables with SAAS features + WAHA integration';
    RAISE NOTICE '🔍 Indexes: Performance indexes with concurrent creation';
    RAISE NOTICE '⚡ Triggers: Auto-update and usage tracking triggers';
    RAISE NOTICE '📈 Partitioning: Enabled for high-volume tables';
    RAISE NOTICE '🤖 AI Features: Model management, training data, conversation logs';
    RAISE NOTICE '💰 SAAS Features: Subscriptions, billing, usage tracking, API management';
    RAISE NOTICE '🔄 Automation: N8N workflow management and execution tracking';
    RAISE NOTICE '💳 Payments: Automated subscription billing with gateway integration';
    RAISE NOTICE '📊 Monitoring: Real-time metrics and comprehensive system logging';
    RAISE NOTICE '🔐 RBAC System: Role-based access control with granular permissions';
    RAISE NOTICE '🔄 Auto-Billing: Subscription renewal and payment processing automation';
    RAISE NOTICE '🔒 Security: Enhanced with audit logs, rate limiting, session management';
    RAISE NOTICE '📱 WAHA Integration: Complete WhatsApp Business API integration with session management, message tracking, contact management, group management, webhook events, API requests, rate limiting, business features, and analytics';
    RAISE NOTICE '✅ PostgreSQL 15 Ready!';
END $$;
