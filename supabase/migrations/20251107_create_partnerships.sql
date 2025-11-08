-- ===================================================================
-- PHASE 2: Collaborative Earnings Dashboard - Database Migration
-- Date: 2025-11-07
-- Purpose: Create tables for partnerships, revenue tracking, and payments
-- ===================================================================

-- ===================================================================
-- 1. PARTNERSHIPS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS partnerships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    engineer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Partnership Status
    status TEXT NOT NULL DEFAULT 'proposed' CHECK (
        status IN ('proposed', 'accepted', 'active', 'paused', 'completed', 'dissolved')
    ),
    
    -- Revenue Split Configuration
    revenue_split TEXT NOT NULL DEFAULT 'equal' CHECK (
        revenue_split IN ('equal', 'custom', 'percentage', 'milestone')
    ),
    artist_split DECIMAL(5, 2) NOT NULL DEFAULT 50.00 CHECK (artist_split >= 0 AND artist_split <= 100),
    engineer_split DECIMAL(5, 2) NOT NULL DEFAULT 50.00 CHECK (engineer_split >= 0 AND engineer_split <= 100),
    
    -- Revenue Tracking
    total_earnings DECIMAL(12, 2) NOT NULL DEFAULT 0,
    artist_earnings DECIMAL(12, 2) NOT NULL DEFAULT 0,
    engineer_earnings DECIMAL(12, 2) NOT NULL DEFAULT 0,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_artist_engineer CHECK (artist_id != engineer_id),
    CONSTRAINT valid_split_total CHECK (artist_split + engineer_split = 100.00)
);

-- Indexes for partnerships
CREATE INDEX idx_partnerships_artist_id ON partnerships(artist_id);
CREATE INDEX idx_partnerships_engineer_id ON partnerships(engineer_id);
CREATE INDEX idx_partnerships_status ON partnerships(status);
CREATE INDEX idx_partnerships_created_at ON partnerships(created_at DESC);
-- Composite index for finding partnerships between two users
CREATE INDEX idx_partnerships_pair ON partnerships(
    LEAST(artist_id, engineer_id),
    GREATEST(artist_id, engineer_id)
);

-- ===================================================================
-- 2. COLLABORATIVE PROJECTS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS collaborative_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partnership_id UUID NOT NULL REFERENCES partnerships(id) ON DELETE CASCADE,
    
    -- Project Info
    title TEXT NOT NULL,
    description TEXT,
    project_type TEXT NOT NULL CHECK (
        project_type IN ('track', 'remix', 'mastering', 'production', 'feature', 'other')
    ),
    
    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (
        status IN ('draft', 'in_progress', 'review', 'completed', 'released')
    ),
    
    -- Timeline
    start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    target_completion TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    
    -- Revenue
    total_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
    artist_earnings DECIMAL(12, 2) NOT NULL DEFAULT 0,
    engineer_earnings DECIMAL(12, 2) NOT NULL DEFAULT 0,
    
    -- Communication
    messages_count INTEGER NOT NULL DEFAULT 0,
    last_message_at TIMESTAMP WITH TIME ZONE,
    
    -- Milestones
    milestone_count INTEGER NOT NULL DEFAULT 0,
    completed_milestones INTEGER NOT NULL DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_collaborative_projects_partnership_id ON collaborative_projects(partnership_id);
CREATE INDEX idx_collaborative_projects_status ON collaborative_projects(status);
CREATE INDEX idx_collaborative_projects_created_at ON collaborative_projects(created_at DESC);

-- ===================================================================
-- 3. REVENUE SPLITS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS revenue_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partnership_id UUID NOT NULL REFERENCES partnerships(id) ON DELETE CASCADE,
    project_id UUID REFERENCES collaborative_projects(id) ON DELETE SET NULL,
    transaction_id TEXT,
    
    -- Amount Breakdown
    total_amount DECIMAL(12, 2) NOT NULL,
    artist_amount DECIMAL(12, 2) NOT NULL,
    engineer_amount DECIMAL(12, 2) NOT NULL,
    artist_percentage DECIMAL(5, 2) NOT NULL,
    engineer_percentage DECIMAL(5, 2) NOT NULL,
    
    -- Status
    split_status TEXT NOT NULL DEFAULT 'pending' CHECK (
        split_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')
    ),
    
    -- Metadata
    notes TEXT,
    split_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_split_amounts CHECK (
        artist_amount + engineer_amount <= total_amount + 0.01  -- small buffer for rounding
    )
);

CREATE INDEX idx_revenue_splits_partnership_id ON revenue_splits(partnership_id);
CREATE INDEX idx_revenue_splits_project_id ON revenue_splits(project_id);
CREATE INDEX idx_revenue_splits_status ON revenue_splits(split_status);
CREATE INDEX idx_revenue_splits_split_date ON revenue_splits(split_date DESC);

-- ===================================================================
-- 4. PAYMENT LINKS TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS payment_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Link Info
    token TEXT NOT NULL UNIQUE,
    url TEXT NOT NULL UNIQUE,
    
    -- Participants
    creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Association
    partnership_id UUID REFERENCES partnerships(id) ON DELETE SET NULL,
    project_id UUID REFERENCES collaborative_projects(id) ON DELETE SET NULL,
    
    -- Payment Details
    amount DECIMAL(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    description TEXT,
    
    -- Payment Method
    payment_method TEXT NOT NULL DEFAULT 'stripe' CHECK (
        payment_method IN ('stripe', 'paypal', 'bank_transfer')
    ),
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'processing', 'completed', 'failed', 'refunded')
    ),
    
    -- Expiration
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Completion
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_creator_recipient CHECK (creator_id != recipient_id)
);

CREATE INDEX idx_payment_links_token ON payment_links(token);
CREATE INDEX idx_payment_links_creator_id ON payment_links(creator_id);
CREATE INDEX idx_payment_links_recipient_id ON payment_links(recipient_id);
CREATE INDEX idx_payment_links_status ON payment_links(status);
CREATE INDEX idx_payment_links_partnership_id ON payment_links(partnership_id);

-- ===================================================================
-- 5. PROJECT MILESTONES TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES collaborative_projects(id) ON DELETE CASCADE,
    
    -- Milestone Info
    title TEXT NOT NULL,
    description TEXT,
    deliverables TEXT[], -- array of deliverable descriptions
    
    -- Assignment
    assigned_to TEXT NOT NULL CHECK (assigned_to IN ('artist', 'engineer')),
    
    -- Timeline
    target_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_date TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (
        status IN ('not_started', 'in_progress', 'completed', 'delayed')
    ),
    
    -- Payment
    payment_trigger BOOLEAN DEFAULT FALSE,
    triggered_payment DECIMAL(12, 2),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_project_milestones_project_id ON project_milestones(project_id);
CREATE INDEX idx_project_milestones_status ON project_milestones(status);
CREATE INDEX idx_project_milestones_target_date ON project_milestones(target_date);

-- ===================================================================
-- 6. MESSAGE REVENUE LINKS TABLE
-- ===================================================================
-- Links direct messages to revenue they generated
CREATE TABLE IF NOT EXISTS message_revenue_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES direct_messages(id) ON DELETE CASCADE,
    partnership_id UUID NOT NULL REFERENCES partnerships(id) ON DELETE CASCADE,
    project_id UUID REFERENCES collaborative_projects(id) ON DELETE SET NULL,
    revenue_id UUID REFERENCES revenue_splits(id) ON DELETE SET NULL,
    
    -- Link Type
    link_type TEXT NOT NULL CHECK (
        link_type IN ('discussion', 'agreement', 'milestone', 'payment')
    ),
    
    -- Optional Amount
    amount DECIMAL(12, 2),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_message_revenue_links_message_id ON message_revenue_links(message_id);
CREATE INDEX idx_message_revenue_links_partnership_id ON message_revenue_links(partnership_id);
CREATE INDEX idx_message_revenue_links_project_id ON message_revenue_links(project_id);

-- ===================================================================
-- 7. PARTNERSHIP METRICS TABLE (denormalized for performance)
-- ===================================================================
CREATE TABLE IF NOT EXISTS partnership_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partnership_id UUID NOT NULL UNIQUE REFERENCES partnerships(id) ON DELETE CASCADE,
    
    -- Project Metrics
    total_projects INTEGER NOT NULL DEFAULT 0,
    completed_projects INTEGER NOT NULL DEFAULT 0,
    
    -- Revenue Metrics
    total_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
    artist_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
    engineer_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
    
    -- Communication
    active_conversations INTEGER NOT NULL DEFAULT 0,
    average_response_time DECIMAL(10, 2), -- in hours
    
    -- Activity
    collaboration_frequency DECIMAL(10, 2), -- projects per month
    success_rate DECIMAL(5, 2), -- percentage
    
    -- Metadata
    last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_partnership_metrics_partnership_id ON partnership_metrics(partnership_id);

-- ===================================================================
-- 8. PARTNERSHIP HEALTH SCORES TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS partnership_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partnership_id UUID NOT NULL UNIQUE REFERENCES partnerships(id) ON DELETE CASCADE,
    
    -- Score Components (0-100)
    health_score INTEGER NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
    activity_level INTEGER NOT NULL CHECK (activity_level >= 0 AND activity_level <= 100),
    payment_reliability INTEGER NOT NULL CHECK (payment_reliability >= 0 AND payment_reliability <= 100),
    communication_quality INTEGER NOT NULL CHECK (communication_quality >= 0 AND communication_quality <= 100),
    milestone_completion INTEGER NOT NULL CHECK (milestone_completion >= 0 AND milestone_completion <= 100),
    
    -- Risk Assessment
    risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
    
    -- Recommendations
    recommendations TEXT[],
    
    -- Metadata
    last_assessed TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_partnership_health_partnership_id ON partnership_health(partnership_id);

-- ===================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================================================

-- Enable RLS on all tables
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborative_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_revenue_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_health ENABLE ROW LEVEL SECURITY;

-- Partnerships: Users can see/modify partnerships they're involved in
CREATE POLICY partnerships_select ON partnerships FOR SELECT
    USING (artist_id = auth.uid() OR engineer_id = auth.uid());

CREATE POLICY partnerships_insert ON partnerships FOR INSERT
    WITH CHECK (artist_id = auth.uid() OR engineer_id = auth.uid());

CREATE POLICY partnerships_update ON partnerships FOR UPDATE
    USING (artist_id = auth.uid() OR engineer_id = auth.uid())
    WITH CHECK (artist_id = auth.uid() OR engineer_id = auth.uid());

-- Projects: Users can access projects from their partnerships
CREATE POLICY projects_select ON collaborative_projects FOR SELECT
    USING (
        partnership_id IN (
            SELECT id FROM partnerships
            WHERE artist_id = auth.uid() OR engineer_id = auth.uid()
        )
    );

-- Revenue Splits: Users can see splits from their partnerships
CREATE POLICY revenue_splits_select ON revenue_splits FOR SELECT
    USING (
        partnership_id IN (
            SELECT id FROM partnerships
            WHERE artist_id = auth.uid() OR engineer_id = auth.uid()
        )
    );

-- Payment Links: Users can see links they created or received
CREATE POLICY payment_links_select ON payment_links FOR SELECT
    USING (creator_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY payment_links_insert ON payment_links FOR INSERT
    WITH CHECK (creator_id = auth.uid());

-- Message Revenue Links: Access through partnership visibility
CREATE POLICY message_revenue_links_select ON message_revenue_links FOR SELECT
    USING (
        partnership_id IN (
            SELECT id FROM partnerships
            WHERE artist_id = auth.uid() OR engineer_id = auth.uid()
        )
    );

-- ===================================================================
-- 10. HELPER FUNCTIONS
-- ===================================================================

-- Get partnership metrics for a user
CREATE OR REPLACE FUNCTION get_partnership_metrics(user_id UUID)
RETURNS TABLE (
    partnership_id UUID,
    total_projects INTEGER,
    completed_projects INTEGER,
    total_revenue DECIMAL,
    artist_total DECIMAL,
    engineer_total DECIMAL,
    active_conversations INTEGER,
    average_response_time DECIMAL,
    collaboration_frequency DECIMAL,
    success_rate DECIMAL,
    last_activity TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        COUNT(DISTINCT cp.id)::INTEGER,
        COUNT(DISTINCT cp.id) FILTER (WHERE cp.status = 'completed')::INTEGER,
        COALESCE(SUM(rs.total_amount), 0),
        COALESCE(SUM(rs.artist_amount), 0),
        COALESCE(SUM(rs.engineer_amount), 0),
        COUNT(DISTINCT dm.id)::INTEGER,
        0::DECIMAL,
        0::DECIMAL,
        CASE 
            WHEN COUNT(cp.id) > 0 THEN
                (COUNT(DISTINCT cp.id) FILTER (WHERE cp.status = 'completed')::DECIMAL / COUNT(DISTINCT cp.id) * 100)::DECIMAL
            ELSE 0::DECIMAL
        END,
        MAX(GREATEST(p.updated_at, COALESCE(MAX(cp.updated_at), p.updated_at)))
    FROM partnerships p
    LEFT JOIN collaborative_projects cp ON p.id = cp.partnership_id
    LEFT JOIN revenue_splits rs ON p.id = rs.partnership_id
    LEFT JOIN direct_messages dm ON (
        (p.artist_id = dm.sender_id AND p.engineer_id = dm.recipient_id) OR
        (p.engineer_id = dm.sender_id AND p.artist_id = dm.recipient_id)
    )
    WHERE p.artist_id = user_id OR p.engineer_id = user_id
    GROUP BY p.id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Calculate partnership health score
CREATE OR REPLACE FUNCTION calculate_partnership_health(partnership_id UUID)
RETURNS TABLE (
    health_score INTEGER,
    activity_level INTEGER,
    payment_reliability INTEGER,
    communication_quality INTEGER,
    milestone_completion INTEGER,
    risk_level TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        GREATEST(0, LEAST(100, (
            COALESCE((SELECT activity_level FROM partnership_metrics WHERE partnership_id = $1), 50) +
            COALESCE((SELECT payment_reliability FROM partnership_metrics WHERE partnership_id = $1), 50) +
            COALESCE((SELECT communication_quality FROM partnership_metrics WHERE partnership_id = $1), 50) +
            COALESCE((SELECT milestone_completion FROM partnership_metrics WHERE partnership_id = $1), 50)
        ) / 4))::INTEGER as health_score,
        COALESCE((SELECT activity_level FROM partnership_metrics WHERE partnership_id = $1), 50)::INTEGER,
        COALESCE((SELECT payment_reliability FROM partnership_metrics WHERE partnership_id = $1), 50)::INTEGER,
        COALESCE((SELECT communication_quality FROM partnership_metrics WHERE partnership_id = $1), 50)::INTEGER,
        COALESCE((SELECT milestone_completion FROM partnership_metrics WHERE partnership_id = $1), 50)::INTEGER,
        CASE
            WHEN GREATEST(0, LEAST(100, (
                COALESCE((SELECT activity_level FROM partnership_metrics WHERE partnership_id = $1), 50) +
                COALESCE((SELECT payment_reliability FROM partnership_metrics WHERE partnership_id = $1), 50) +
                COALESCE((SELECT communication_quality FROM partnership_metrics WHERE partnership_id = $1), 50) +
                COALESCE((SELECT milestone_completion FROM partnership_metrics WHERE partnership_id = $1), 50)
            ) / 4)) >= 75 THEN 'low'
            WHEN GREATEST(0, LEAST(100, (
                COALESCE((SELECT activity_level FROM partnership_metrics WHERE partnership_id = $1), 50) +
                COALESCE((SELECT payment_reliability FROM partnership_metrics WHERE partnership_id = $1), 50) +
                COALESCE((SELECT communication_quality FROM partnership_metrics WHERE partnership_id = $1), 50) +
                COALESCE((SELECT milestone_completion FROM partnership_metrics WHERE partnership_id = $1), 50)
            ) / 4)) >= 50 THEN 'medium'
            ELSE 'high'
        END as risk_level;
END;
$$ LANGUAGE plpgsql STABLE;

-- Auto-update partnership metrics on revenue split
CREATE OR REPLACE FUNCTION update_partnership_on_revenue_split()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE partnerships
    SET 
        total_earnings = total_earnings + NEW.total_amount,
        artist_earnings = artist_earnings + NEW.artist_amount,
        engineer_earnings = engineer_earnings + NEW.engineer_amount,
        updated_at = NOW()
    WHERE id = NEW.partnership_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_partnership_revenue
AFTER INSERT ON revenue_splits
FOR EACH ROW
EXECUTE FUNCTION update_partnership_on_revenue_split();

-- ===================================================================
-- END OF MIGRATION
-- ===================================================================
