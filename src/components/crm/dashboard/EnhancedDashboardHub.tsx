import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useUserProjects } from '@/hooks/useUserProjects';
import { useUserEarnings } from '@/hooks/useUserEarnings';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  DollarSign,
  Music,
  Users,
  Zap,
  Target,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  MessageSquare,
  ShoppingCart,
  Radio,
  BookOpen,
  Gift,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HipHopPulse } from './HipHopPulse';
import { StreakTracker } from '../gamification/StreakTracker';
import { AchievementsBadges } from '../gamification/AchievementsBadges';
import { RevenueAnalyticsDashboard } from '../revenue/RevenueAnalyticsDashboard';
import { WhosLiveWidget } from '@/components/live/WhosLiveWidget';
import { WhoToFollowWidget } from '@/components/social/WhoToFollowWidget';
import { WelcomeExperience, RecommendedEngineers, OpenSessionsForEngineers } from '../WelcomeExperience';
import { CommunityUnlocksWidget } from '@/components/unlock/CommunityUnlocksWidget';
import { PersonalUnlocksWidget } from '@/components/unlock/PersonalUnlocksWidget';
import { useArtistUnlockables, useEngineerUnlockables } from '@/hooks/useUnlockables';
import PerformanceBadges from '@/components/crm/badges/PerformanceBadges';
import CollectiveAnalytics from '@/components/crm/analytics/CollectiveAnalytics';
import GrowthHub from '@/components/crm/growth/GrowthHub';

// Role-specific visual accent system
const ROLE_ACCENTS = {
  artist: {
    glow: 'rgba(168, 85, 247, 0.35)',
    gradient: 'from-purple-500/20 via-fuchsia-500/10 to-transparent',
    border: 'rgba(168, 85, 247, 0.2)',
    iconBg: 'rgba(168, 85, 247, 0.15)',
    label: 'Artist',
  },
  engineer: {
    glow: 'rgba(249, 115, 22, 0.35)',
    gradient: 'from-orange-500/20 via-amber-500/10 to-transparent',
    border: 'rgba(249, 115, 22, 0.2)',
    iconBg: 'rgba(249, 115, 22, 0.15)',
    label: 'Engineer',
  },
};

const STAT_PALETTES = [
  { accent: 'hsl(var(--primary))', bg: 'hsl(var(--primary) / 0.12)', border: 'hsl(var(--primary) / 0.2)' },
  { accent: 'rgb(34, 197, 94)', bg: 'rgba(34, 197, 94, 0.12)', border: 'rgba(34, 197, 94, 0.2)' },
  { accent: 'rgb(59, 130, 246)', bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.2)' },
  { accent: 'rgb(249, 115, 22)', bg: 'rgba(249, 115, 22, 0.12)', border: 'rgba(249, 115, 22, 0.2)' },
];

interface DashboardMetrics {
  careerMomentum: {
    totalSessions: number;
    completionRate: number;
    growthTrend: number;
    activeProjects: number;
  };
  revenue: {
    total: number;
    streams: {
      subscriptions: number;
      referrals: number;
      marketplace: number;
      services: number;
      trackSales: number;
      courses: number;
      partnerships: number;
      promotions: number;
      enterprise: number;
      other: number;
    };
    monthlyGrowth: number;
  };
  aiInsights: {
    recommendations: string[];
    priorityActions: string[];
    opportunities: number;
  };
}

interface EnhancedDashboardHubProps {
  userType: 'artist' | 'engineer';
}

export const EnhancedDashboardHub = ({ userType }: EnhancedDashboardHubProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: artistUnlockables } = useArtistUnlockables();
  const { data: engineerUnlockables } = useEngineerUnlockables();
  const personalUnlockables = userType === 'artist' ? artistUnlockables : engineerUnlockables;
  const accent = ROLE_ACCENTS[userType];

  // Shared cached hooks — deduplicated across CRM hubs
  const role = userType === 'artist' ? 'artist' : 'engineer';
  const { data: projects = [], isLoading: projectsLoading } = useUserProjects(user?.id, role);
  const { data: earningsData, isLoading: earningsLoading } = useUserEarnings(user?.id);

  // Dashboard-specific queries (achievements, audit logs, jobs)
  const { data: dashboardExtra, isLoading: extraLoading } = useQuery({
    queryKey: ['dashboard-extra', user?.id],
    queryFn: async () => {
      if (!user?.id) return { achievements: [], activity: [], jobCount: 0 };

      const [achievementsRes, activityRes, jobsRes] = await Promise.all([
        supabase.from('achievements').select('*').eq('user_id', user.id),
        supabase.from('audit_logs').select('*').eq('user_id', user.id)
          .order('created_at', { ascending: false }).limit(5),
        supabase.from('job_postings').select('id').eq('status', 'open'),
      ]);

      return {
        achievements: achievementsRes.data || [],
        activity: activityRes.data || [],
        jobCount: jobsRes.data?.length || 0,
      };
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  const loading = projectsLoading || earningsLoading || extraLoading;

  // Derive metrics from shared hook data
  const totalSessions = projects.length;
  const completedSessions = projects.filter((p: any) => p.status === 'completed').length;
  const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
  const activeProjects = projects.filter((p: any) => p.status === 'in_progress').length;

  const totalEarnings = earningsData?.totalEarnings || 0;
  const marketplaceRevenue = earningsData?.totalSales || 0;
  const achievements = dashboardExtra?.achievements || [];
  const recentActivity = dashboardExtra?.activity || [];
  const jobCount = dashboardExtra?.jobCount || 0;

  const metrics: DashboardMetrics = {
    careerMomentum: {
      totalSessions,
      completionRate,
      growthTrend: 15,
      activeProjects,
    },
    revenue: {
      total: totalEarnings + marketplaceRevenue,
      streams: {
        subscriptions: totalEarnings * 0.4,
        referrals: totalEarnings * 0.1,
        marketplace: marketplaceRevenue,
        services: totalEarnings * 0.2,
        trackSales: 0,
        courses: 0,
        partnerships: totalEarnings * 0.1,
        promotions: 0,
        enterprise: 0,
        other: totalEarnings * 0.2,
      },
      monthlyGrowth: 12,
    },
    aiInsights: {
      recommendations: [
        `You've completed ${completionRate.toFixed(0)}% of your projects - ${completionRate < 70 ? 'focus on finishing active work' : 'great job!'}`,
        `${jobCount} new opportunities available in your genre`,
        achievements.length ? `Unlock your next badge by completing 2 more projects` : 'Complete your first project to earn badges',
      ],
      priorityActions: [
        activeProjects > 0 ? 'Review active project milestones' : 'Browse new opportunities',
        'Update your profile to attract more matches',
        'Check unread messages from collaborators',
      ],
      opportunities: jobCount,
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { icon: Music, label: userType === 'artist' ? 'Sessions' : 'Projects', value: metrics.careerMomentum.totalSessions, sub: 'Total completed' },
    { icon: CheckCircle2, label: 'Rate', value: `${metrics.careerMomentum.completionRate.toFixed(0)}%`, sub: 'Completion rate', progress: metrics.careerMomentum.completionRate },
    { icon: TrendingUp, label: 'Growth', value: `+${metrics.careerMomentum.growthTrend}%`, sub: 'This month' },
    { icon: Clock, label: 'Active', value: metrics.careerMomentum.activeProjects, sub: 'In progress' },
  ];

  const revenueStreams = [
    { icon: <DollarSign className="w-4 h-4" />, label: 'Subscriptions', value: metrics.revenue.streams.subscriptions },
    { icon: <Share2 className="w-4 h-4" />, label: 'Referrals', value: metrics.revenue.streams.referrals },
    { icon: <ShoppingCart className="w-4 h-4" />, label: 'Marketplace', value: metrics.revenue.streams.marketplace },
    { icon: <Music className="w-4 h-4" />, label: 'Services', value: metrics.revenue.streams.services },
    { icon: <Radio className="w-4 h-4" />, label: 'Track Sales', value: metrics.revenue.streams.trackSales },
    { icon: <BookOpen className="w-4 h-4" />, label: 'Courses', value: metrics.revenue.streams.courses },
    { icon: <Users className="w-4 h-4" />, label: 'Partnerships', value: metrics.revenue.streams.partnerships },
    { icon: <Gift className="w-4 h-4" />, label: 'Promotions', value: metrics.revenue.streams.promotions },
  ];

  const isNewUser = metrics.careerMomentum.totalSessions === 0;

  return (
    <div className="space-y-8">
      {/* Ambient role glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${accent.glow}, transparent 70%)`,
        }}
      />

      {/* Welcome Experience for New Users */}
      {isNewUser && (
        <WelcomeExperience userType={userType} userName={user?.user_metadata?.full_name?.split(' ')[0]} />
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/80 to-foreground/50 bg-clip-text text-transparent">
            {userType === 'artist' ? 'Your Music Career Command Center' : 'Your Audio Business HQ'}
          </h1>
          <p className="text-muted-foreground mt-1">Track your momentum, revenue, and growth</p>
        </div>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          size="sm"
          className="backdrop-blur-sm border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
        >
          <Zap className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </motion.div>

      {/* Recommended Content for New Users */}
      {isNewUser && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {userType === 'artist' ? <RecommendedEngineers limit={3} /> : <OpenSessionsForEngineers limit={3} />}
        </div>
      )}

      {/* Who's Live + Gamification + Social Discovery */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <WhosLiveWidget limit={4} />
        <StreakTracker />
        <AchievementsBadges />
        <WhoToFollowWidget limit={4} />
      </div>

      {/* Hip-Hop Pulse */}
      <HipHopPulse />

      {/* Career Momentum — Glassmorphic Stat Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div
          className="relative rounded-2xl p-6 overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: `1px solid ${accent.border}`,
          }}
        >
          {/* Ambient glow orb */}
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none blur-3xl opacity-30"
            style={{ background: accent.glow }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: accent.iconBg }}>
                <Target className="w-5 h-5" style={{ color: accent.glow.replace('0.35', '1') }} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Career Momentum</h2>
                <p className="text-xs text-muted-foreground">Your performance metrics at a glance</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {statCards.map((stat, idx) => {
                const palette = STAT_PALETTES[idx];
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08 }}
                    className="relative rounded-xl p-4 overflow-hidden group"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: `1px solid rgba(255,255,255,0.06)`,
                    }}
                  >
                    {/* Hover glow */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
                      style={{ boxShadow: `inset 0 0 40px ${palette.bg}` }}
                    />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: palette.bg }}>
                          <stat.icon className="w-4 h-4" style={{ color: palette.accent }} />
                        </div>
                        <Badge variant="secondary" className="bg-white/[0.06] border-white/[0.08] text-[10px]">
                          {stat.label}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                      <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                      {stat.progress !== undefined && (
                        <Progress value={stat.progress} className="mt-3 h-1.5" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Revenue Analytics Dashboard */}
      <RevenueAnalyticsDashboard />

      {/* 🏆 Performance Badges — Real achievements from projects & referrals */}
      <PerformanceBadges />

      {/* 📊 Collective Analytics — Solo vs Partnership revenue comparison */}
      <CollectiveAnalytics />

      {/* 🚀 Growth Hub — Shared goals & smart recommendations */}
      <GrowthHub />

      {/* Unlock Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CommunityUnlocksWidget />
        <PersonalUnlocksWidget
          unlockables={personalUnlockables || []}
          title={userType === 'artist' ? 'Session Journey' : 'Project Progress'}
          description={userType === 'artist' ? 'Your path to session mastery' : 'Your engineering milestones'}
        />
      </div>

      {/* AI Insights — PrimeBot 4.0 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Ambient glow */}
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full pointer-events-none blur-3xl opacity-20" style={{ background: 'hsl(var(--primary))' }} />

          <div className="relative z-10 p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'hsl(var(--primary) / 0.15)' }}>
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">PrimeBot 4.0 Insights</h2>
                <p className="text-xs text-muted-foreground">AI-powered recommendations for your career</p>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Recommendations</h4>
              <div className="space-y-2">
                {metrics.aiInsights.recommendations.map((rec, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.08 }}
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground/80">{rec}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Priority Actions */}
            <div>
              <h4 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Priority Actions</h4>
              <div className="space-y-2">
                {metrics.aiInsights.priorityActions.map((action, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + idx * 0.08 }}
                    className="flex items-center justify-between p-3 rounded-xl cursor-pointer group/action transition-all duration-300"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                    onClick={() => {
                      if (action.includes('opportunities')) navigate('?tab=opportunities');
                      else if (action.includes('profile')) navigate('?tab=profile');
                      else if (action.includes('messages')) navigate('?tab=messages');
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground/80">{action}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover/action:text-primary transition-colors" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Opportunities CTA */}
            <div
              className="p-4 rounded-xl flex items-center justify-between"
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(168,85,247,0.1))',
                border: '1px solid rgba(59,130,246,0.2)',
              }}
            >
              <div>
                <p className="text-sm font-medium text-foreground">New Opportunities</p>
                <p className="text-2xl font-bold text-foreground">{metrics.aiInsights.opportunities}</p>
              </div>
              <Button
                onClick={() => navigate('?tab=opportunities')}
                className="backdrop-blur-sm"
              >
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="relative z-10 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'hsl(var(--primary) / 0.15)' }}>
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            </div>

            {recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No recent activity</p>
            ) : (
              <div className="space-y-2">
                {recentActivity.map((activity, idx) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.06 }}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground/90 truncate">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
