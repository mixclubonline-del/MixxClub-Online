/**
 * CareerManagerConfig — Tiers, modules, health metrics, career milestones.
 * 
 * The DNA of the AI Career Manager. Defines what artists unlock,
 * when they unlock it, and what it costs to boost.
 */

// ═══════════════════════════════════════════
// CAREER TIERS
// ═══════════════════════════════════════════

export type CareerTier = 'scout' | 'advisor' | 'strategist' | 'producer' | 'mogul';

export interface CareerTierConfig {
    tier: CareerTier;
    label: string;
    emoji: string;
    color: string;
    bgColor: string;
    borderColor: string;
    gradientFrom: string;
    gradientTo: string;
    /** Minimum gamification level required */
    levelRequired: number;
    /** Additional unlock conditions */
    unlockConditions: UnlockCondition[];
    /** Which modules become available */
    modules: CareerModuleId[];
    description: string;
    tagline: string;
}

export interface UnlockCondition {
    metric: string;
    label: string;
    target: number;
    icon: string;
}

export const CAREER_TIERS: Record<CareerTier, CareerTierConfig> = {
    scout: {
        tier: 'scout', label: 'Scout', emoji: '🔍',
        color: 'text-gray-300', bgColor: 'bg-gray-500/10', borderColor: 'border-gray-500/20',
        gradientFrom: 'from-gray-500', gradientTo: 'to-slate-600',
        levelRequired: 1,
        unlockConditions: [], // Free for everyone
        modules: ['career_pulse'],
        description: 'Basic career insights and health monitoring',
        tagline: 'See where you stand',
    },
    advisor: {
        tier: 'advisor', label: 'Advisor', emoji: '📊',
        color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20',
        gradientFrom: 'from-blue-500', gradientTo: 'to-indigo-600',
        levelRequired: 3,
        unlockConditions: [
            { metric: 'uploads', label: 'Tracks Uploaded', target: 3, icon: '🎵' },
            { metric: 'sales', label: 'First Sale', target: 1, icon: '💰' },
            { metric: 'streams', label: 'Total Streams', target: 50, icon: '▶️' },
        ],
        modules: ['release_planner', 'audience_oracle'],
        description: 'AI-powered release strategy and audience insights',
        tagline: 'Plan smarter, not harder',
    },
    strategist: {
        tier: 'strategist', label: 'Strategist', emoji: '🧠',
        color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20',
        gradientFrom: 'from-purple-500', gradientTo: 'to-violet-600',
        levelRequired: 5,
        unlockConditions: [
            { metric: 'sales', label: 'Total Sales', target: 10, icon: '💰' },
            { metric: 'streams', label: 'Total Streams', target: 500, icon: '▶️' },
            { metric: 'collabs', label: 'Collaborations', target: 5, icon: '🤝' },
        ],
        modules: ['revenue_optimizer', 'growth_engine'],
        description: 'Revenue intelligence and growth optimization',
        tagline: 'Turn data into dollars',
    },
    producer: {
        tier: 'producer', label: 'Producer', emoji: '🎯',
        color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20',
        gradientFrom: 'from-amber-500', gradientTo: 'to-orange-600',
        levelRequired: 7,
        unlockConditions: [
            { metric: 'revenue', label: 'Total Revenue', target: 500, icon: '💵' },
            { metric: 'coinz_earned', label: 'Coinz Earned', target: 2000, icon: '🪙' },
        ],
        modules: ['campaign_manager', 'content_calendar'],
        description: 'Full campaign orchestration and content scheduling',
        tagline: 'Run your career like a business',
    },
    mogul: {
        tier: 'mogul', label: 'Mogul', emoji: '👑',
        color: 'text-cyan-300', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20',
        gradientFrom: 'from-cyan-400', gradientTo: 'to-teal-600',
        levelRequired: 9,
        unlockConditions: [
            { metric: 'revenue', label: 'Total Revenue', target: 2000, icon: '💵' },
            { metric: 'sales', label: 'Total Sales', target: 50, icon: '📦' },
            { metric: 'community_contribution', label: 'Community Milestone', target: 1, icon: '🌍' },
        ],
        modules: ['empire_mode'],
        description: 'Multi-artist empire management and mentorship',
        tagline: 'Build your empire',
    },
};

export const TIER_ORDER: CareerTier[] = ['scout', 'advisor', 'strategist', 'producer', 'mogul'];

// ═══════════════════════════════════════════
// AI MODULES
// ═══════════════════════════════════════════

export type CareerModuleId =
    | 'career_pulse'
    | 'release_planner'
    | 'audience_oracle'
    | 'revenue_optimizer'
    | 'growth_engine'
    | 'campaign_manager'
    | 'content_calendar'
    | 'empire_mode';

export interface CareerModuleConfig {
    id: CareerModuleId;
    name: string;
    emoji: string;
    description: string;
    tier: CareerTier;
    /** Coinz cost per use (0 = free) */
    coinzPerUse: number;
    /** Coinz cost for "boost" (deeper analysis) */
    boostCost: number;
    /** Boost description */
    boostDescription: string;
    /** Cooldown between uses in hours (0 = no cooldown) */
    cooldownHours: number;
    /** Achievement unlocked when first used */
    firstUseAchievement: string;
    /** Icon name for lucide */
    iconName: string;
}

export const CAREER_MODULES: Record<CareerModuleId, CareerModuleConfig> = {
    career_pulse: {
        id: 'career_pulse', name: 'Career Pulse', emoji: '💓',
        description: 'Real-time career health score with actionable insights',
        tier: 'scout', coinzPerUse: 0, boostCost: 0,
        boostDescription: '', cooldownHours: 0,
        firstUseAchievement: 'First Pulse Check',
        iconName: 'Activity',
    },
    release_planner: {
        id: 'release_planner', name: 'Release Planner', emoji: '📅',
        description: 'AI-optimized release strategy and rollout timelines',
        tier: 'advisor', coinzPerUse: 0, boostCost: 500,
        boostDescription: 'Deep Analysis — reveals competitor timing data and optimal windows',
        cooldownHours: 0,
        firstUseAchievement: 'Strategic Mind',
        iconName: 'CalendarDays',
    },
    audience_oracle: {
        id: 'audience_oracle', name: 'Audience Oracle', emoji: '🔮',
        description: 'Fan demographics, superfan identification, engagement patterns',
        tier: 'advisor', coinzPerUse: 0, boostCost: 300,
        boostDescription: 'Audience DNA — deep psychographic profiling of your fanbase',
        cooldownHours: 24,
        firstUseAchievement: 'Fan Whisperer',
        iconName: 'Users',
    },
    revenue_optimizer: {
        id: 'revenue_optimizer', name: 'Revenue Optimizer', emoji: '💎',
        description: 'Revenue intelligence, pricing recommendations, and forecasting',
        tier: 'strategist', coinzPerUse: 50, boostCost: 1000,
        boostDescription: 'Revenue X-Ray — per-fan lifetime value and upsell opportunities',
        cooldownHours: 12,
        firstUseAchievement: 'Money Moves',
        iconName: 'TrendingUp',
    },
    growth_engine: {
        id: 'growth_engine', name: 'Growth Engine', emoji: '🚀',
        description: 'Growth report cards, collab matching, and viral potential scoring',
        tier: 'strategist', coinzPerUse: 50, boostCost: 800,
        boostDescription: 'Growth Accelerator — personalized 30-day viral strategy',
        cooldownHours: 24,
        firstUseAchievement: 'Growth Hacker',
        iconName: 'Rocket',
    },
    campaign_manager: {
        id: 'campaign_manager', name: 'Campaign Manager', emoji: '🎯',
        description: 'Full campaign orchestration with AI task generation',
        tier: 'producer', coinzPerUse: 200, boostCost: 1500,
        boostDescription: 'Campaign Autopilot — AI auto-executes your marketing tasks',
        cooldownHours: 0,
        firstUseAchievement: 'Campaign Commander',
        iconName: 'Target',
    },
    content_calendar: {
        id: 'content_calendar', name: 'Content Calendar', emoji: '🗓️',
        description: 'AI-scheduled content pipeline with auto-generated suggestions',
        tier: 'producer', coinzPerUse: 100, boostCost: 300,
        boostDescription: '30-Day Autopilot — AI generates a full month of caption drafts',
        cooldownHours: 0,
        firstUseAchievement: 'Content Machine',
        iconName: 'Calendar',
    },
    empire_mode: {
        id: 'empire_mode', name: 'Empire Mode', emoji: '👑',
        description: 'Multi-artist roster management, cross-promo, and mentorship',
        tier: 'mogul', coinzPerUse: 500, boostCost: 2000,
        boostDescription: 'Industry Intel — market positioning analysis and trend forecasting',
        cooldownHours: 0,
        firstUseAchievement: 'Empire Builder',
        iconName: 'Crown',
    },
};

// ═══════════════════════════════════════════
// CAREER HEALTH METRICS
// ═══════════════════════════════════════════

export type HealthMetric = 'release_cadence' | 'revenue_trend' | 'audience_growth' | 'engagement' | 'consistency';

export interface HealthMetricConfig {
    id: HealthMetric;
    label: string;
    emoji: string;
    weight: number;
    description: string;
    levels: { min: number; label: string; color: string }[];
}

export const HEALTH_METRICS: Record<HealthMetric, HealthMetricConfig> = {
    release_cadence: {
        id: 'release_cadence', label: 'Release Cadence', emoji: '📀', weight: 0.25,
        description: 'How consistently you release new content',
        levels: [
            { min: 0, label: 'Dormant', color: 'text-red-400' },
            { min: 30, label: 'Sporadic', color: 'text-amber-400' },
            { min: 60, label: 'Consistent', color: 'text-green-400' },
            { min: 85, label: 'Machine', color: 'text-cyan-400' },
        ],
    },
    revenue_trend: {
        id: 'revenue_trend', label: 'Revenue Trend', emoji: '📈', weight: 0.25,
        description: 'Month-over-month revenue trajectory',
        levels: [
            { min: 0, label: 'Declining', color: 'text-red-400' },
            { min: 30, label: 'Flat', color: 'text-amber-400' },
            { min: 60, label: 'Growing', color: 'text-green-400' },
            { min: 85, label: 'Exploding', color: 'text-cyan-400' },
        ],
    },
    audience_growth: {
        id: 'audience_growth', label: 'Audience Growth', emoji: '👥', weight: 0.2,
        description: 'Fan base growth rate',
        levels: [
            { min: 0, label: 'Stagnant', color: 'text-red-400' },
            { min: 30, label: 'Organic', color: 'text-amber-400' },
            { min: 60, label: 'Accelerating', color: 'text-green-400' },
            { min: 85, label: 'Viral', color: 'text-cyan-400' },
        ],
    },
    engagement: {
        id: 'engagement', label: 'Engagement', emoji: '🔥', weight: 0.15,
        description: 'How actively your audience interacts with your content',
        levels: [
            { min: 0, label: 'Cold', color: 'text-red-400' },
            { min: 30, label: 'Warm', color: 'text-amber-400' },
            { min: 60, label: 'Hot', color: 'text-green-400' },
            { min: 85, label: 'On Fire', color: 'text-cyan-400' },
        ],
    },
    consistency: {
        id: 'consistency', label: 'Consistency', emoji: '⚡', weight: 0.15,
        description: 'How regularly you engage with the platform',
        levels: [
            { min: 0, label: 'Ghosting', color: 'text-red-400' },
            { min: 30, label: 'Casual', color: 'text-amber-400' },
            { min: 60, label: 'Dedicated', color: 'text-green-400' },
            { min: 85, label: 'Grinder', color: 'text-cyan-400' },
        ],
    },
};

// ═══════════════════════════════════════════
// CAREER MILESTONES
// ═══════════════════════════════════════════

export interface CareerMilestone {
    id: string;
    label: string;
    emoji: string;
    description: string;
    metric: string;
    target: number;
    coinzReward: number;
    xpReward: number;
}

export const CAREER_MILESTONES: CareerMilestone[] = [
    { id: 'first_upload', label: 'First Upload', emoji: '🎵', description: 'Upload your first track', metric: 'uploads', target: 1, coinzReward: 50, xpReward: 100 },
    { id: 'first_sale', label: 'First Sale', emoji: '💰', description: 'Make your first sale', metric: 'sales', target: 1, coinzReward: 100, xpReward: 200 },
    { id: 'first_100_streams', label: 'Century Club', emoji: '💯', description: 'Reach 100 streams', metric: 'streams', target: 100, coinzReward: 75, xpReward: 150 },
    { id: 'first_100_revenue', label: 'Triple Digits', emoji: '💵', description: 'Earn $100 in revenue', metric: 'revenue', target: 100, coinzReward: 200, xpReward: 300 },
    { id: '1k_streams', label: 'Thousand Club', emoji: '🔥', description: 'Reach 1,000 streams', metric: 'streams', target: 1000, coinzReward: 150, xpReward: 250 },
    { id: '10_sales', label: 'Consistent Seller', emoji: '📦', description: 'Make 10 sales', metric: 'sales', target: 10, coinzReward: 250, xpReward: 350 },
    { id: 'first_1k_revenue', label: 'Four Digits', emoji: '🤑', description: 'Earn $1,000 in revenue', metric: 'revenue', target: 1000, coinzReward: 500, xpReward: 500 },
    { id: '10k_streams', label: '10K Club', emoji: '🏆', description: 'Reach 10,000 streams', metric: 'streams', target: 10000, coinzReward: 300, xpReward: 400 },
    { id: '5_collabs', label: 'Networker', emoji: '🤝', description: 'Complete 5 collaborations', metric: 'collabs', target: 5, coinzReward: 200, xpReward: 300 },
    { id: '50_sales', label: 'Fan Favorite', emoji: '⭐', description: 'Make 50 sales', metric: 'sales', target: 50, coinzReward: 500, xpReward: 600 },
    { id: '5k_revenue', label: 'Professional', emoji: '💎', description: 'Earn $5,000 in revenue', metric: 'revenue', target: 5000, coinzReward: 1000, xpReward: 800 },
    { id: 'mogul_status', label: 'Mogul Status', emoji: '👑', description: 'Unlock the Mogul career tier', metric: 'tier', target: 5, coinzReward: 2000, xpReward: 1500 },
];

// ═══════════════════════════════════════════
// AI ADVICE CATEGORIES
// ═══════════════════════════════════════════

export type AdviceCategory = 'release' | 'audience' | 'revenue' | 'growth' | 'content' | 'general';

export interface AIAdvice {
    category: AdviceCategory;
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    action?: string;
    moduleId?: CareerModuleId;
}

export const ADVICE_PRIORITY_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
    low: { color: 'text-gray-400', bgColor: 'bg-gray-500/10', label: 'Suggestion' },
    medium: { color: 'text-blue-400', bgColor: 'bg-blue-500/10', label: 'Recommended' },
    high: { color: 'text-amber-400', bgColor: 'bg-amber-500/10', label: 'Important' },
    critical: { color: 'text-red-400', bgColor: 'bg-red-500/10', label: 'Urgent' },
};
