/**
 * Partnership Types - Artist-Engineer Collaboration Data Models
 * 
 * Defines all data structures for tracking partnerships, shared revenue,
 * collaborative projects, and payment links between artists and engineers.
 */

export type UserType = 'artist' | 'engineer';
export type PartnershipStatus = 'proposed' | 'accepted' | 'active' | 'paused' | 'completed' | 'dissolved';
export type RevenueSplitType = 'equal' | 'custom' | 'percentage' | 'milestone';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

/**
 * Partnership Agreement between Artist and Engineer
 */
export interface Partnership {
    id: string;
    artist_id: string;
    engineer_id: string;
    artist?: {
        id: string;
        display_name: string;
        avatar_url?: string;
    };
    engineer?: {
        id: string;
        display_name: string;
        avatar_url?: string;
    };
    status: PartnershipStatus;
    revenue_split: RevenueSplitType;
    artist_split: number; // percentage: 0-100
    engineer_split: number; // percentage: 0-100
    total_earnings: number; // total revenue from this partnership
    artist_earnings: number; // artist's share
    engineer_earnings: number; // engineer's share
    created_at: string;
    accepted_at?: string;
    completed_at?: string;
    notes?: string;
}

/**
 * Individual Transaction/Project within Partnership
 */
export interface CollaborativeProject {
    id: string;
    partnership_id: string;
    title: string;
    description?: string;
    project_type: 'track' | 'remix' | 'mastering' | 'production' | 'feature' | 'other';
    status: 'draft' | 'in_progress' | 'review' | 'completed' | 'released';
    start_date: string;
    target_completion?: string;
    completed_date?: string;
    total_revenue: number;
    artist_earnings: number;
    engineer_earnings: number;
    messages_count: number;
    last_message_at?: string;
    milestone_count: number;
    completed_milestones: number;
}

/**
 * Revenue Split Details for a Transaction
 */
export interface RevenueSplit {
    id: string;
    partnership_id: string;
    project_id?: string;
    transaction_id?: string;
    total_amount: number;
    artist_amount: number;
    engineer_amount: number;
    artist_percentage: number;
    engineer_percentage: number;
    split_date: string;
    split_status: PaymentStatus;
    notes?: string;
}

/**
 * Payment Link for Sharing Between Partners
 */
export interface PaymentLink {
    id: string;
    partnership_id?: string;
    project_id?: string;
    creator_id: string;
    recipient_id: string;
    amount: number;
    description: string;
    currency: string;
    payment_method: 'stripe' | 'paypal' | 'bank_transfer';
    status: PaymentStatus;
    token: string; // unique link token
    url: string; // full shareable URL
    expires_at?: string;
    paid_at?: string;
    created_at: string;
}

/**
 * Milestone Tracker for Projects
 */
export interface ProjectMilestone {
    id: string;
    project_id: string;
    title: string;
    description?: string;
    target_date: string;
    completed_date?: string;
    deliverables?: string[];
    assigned_to: UserType; // 'artist' or 'engineer'
    status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
    payment_trigger?: boolean;
    triggered_payment?: number;
}

/**
 * Partnership Metrics & Analytics
 */
export interface PartnershipMetrics {
    partnership_id: string;
    total_projects: number;
    completed_projects: number;
    total_revenue: number;
    artist_total: number;
    engineer_total: number;
    active_conversations: number;
    average_response_time: number; // hours
    collaboration_frequency: number; // projects per month
    success_rate: number; // completed / total projects
    last_activity: string;
}

/**
 * Partnership Health Score (0-100)
 * Combines: activity level, payment status, communication, milestone completion
 */
export interface PartnershipHealth {
    partnership_id: string;
    health_score: number; // 0-100
    activity_level: number; // based on recent projects
    payment_reliability: number; // on-time payment rate
    communication_quality: number; // message response rate
    milestone_completion: number; // completed on time
    risk_level: 'low' | 'medium' | 'high';
    last_assessed: string;
    recommendations?: string[];
}

/**
 * Message-to-Revenue Link
 * Tracks which conversations generated which revenue
 */
export interface MessageRevenueLink {
    id: string;
    message_id: string;
    partnership_id: string;
    project_id?: string;
    revenue_id?: string;
    link_type: 'discussion' | 'agreement' | 'milestone' | 'payment';
    amount?: number;
    created_at: string;
}

/**
 * Partnership Earning Stream Summary (for Revenue Hub)
 */
export interface PartnershipEarnings {
    partnership_id: string;
    partner_name: string;
    partner_avatar?: string;
    partner_type: UserType;
    this_month: number;
    last_month: number;
    year_to_date: number;
    active_projects: number;
    pending_payments: number;
    health_score: number;
    last_activity: string;
}

/**
 * Collaborative Earnings Dashboard Data
 */
export interface CollaborativeEarningsSummary {
    total_partnership_revenue: number;
    active_partnerships: number;
    pending_payments_total: number;
    top_partners: PartnershipEarnings[];
    recent_projects: CollaborativeProject[];
    month_over_month_growth: number; // percentage
    average_partnership_value: number;
    total_milestone_revenue: number;
}
