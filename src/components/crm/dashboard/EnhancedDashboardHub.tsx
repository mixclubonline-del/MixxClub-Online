import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Music, 
  Users, 
  Award,
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
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch projects/sessions
      const projectQuery = userType === 'artist' 
        ? supabase.from('projects').select('*').eq('client_id', user?.id)
        : supabase.from('projects').select('*').eq('engineer_id', user?.id);

      const { data: projects } = await projectQuery;

      // Fetch earnings
      const { data: earnings } = await supabase
        .from('engineer_earnings')
        .select('*')
        .eq('engineer_id', user?.id);

      // Fetch marketplace purchases
      const { data: marketplaceSales } = await supabase
        .from('marketplace_purchases')
        .select('purchase_amount')
        .eq('seller_id', user?.id);

      // Fetch achievements
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user?.id);

      // Fetch recent activity (audit logs)
      const { data: activity } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentActivity(activity || []);

      // Calculate metrics
      const totalSessions = projects?.length || 0;
      const completedSessions = projects?.filter(p => p.status === 'completed').length || 0;
      const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
      const activeProjects = projects?.filter(p => p.status === 'in_progress').length || 0;

      // Calculate revenue
      const totalEarnings = earnings?.reduce((sum, e) => sum + Number(e.total_amount || 0), 0) || 0;
      const marketplaceRevenue = marketplaceSales?.reduce((sum, s) => sum + Number(s.purchase_amount || 0), 0) || 0;

      // Fetch job opportunities
      const { data: jobs } = await supabase
        .from('job_postings')
        .select('id')
        .eq('status', 'open');

      setMetrics({
        careerMomentum: {
          totalSessions,
          completionRate,
          growthTrend: 15, // Placeholder - calculate from historical data
          activeProjects
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
            other: totalEarnings * 0.2
          },
          monthlyGrowth: 12 // Placeholder
        },
        aiInsights: {
          recommendations: [
            `You've completed ${completionRate.toFixed(0)}% of your projects - ${completionRate < 70 ? 'focus on finishing active work' : 'great job!'}`,
            `${jobs?.length || 0} new opportunities available in your genre`,
            achievements?.length ? `Unlock your next badge by completing 2 more projects` : 'Complete your first project to earn badges'
          ],
          priorityActions: [
            activeProjects > 0 ? 'Review active project milestones' : 'Browse new opportunities',
            'Update your profile to attract more matches',
            'Check unread messages from collaborators'
          ],
          opportunities: jobs?.length || 0
        }
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const revenueStreams = [
    { icon: <DollarSign className="w-4 h-4" />, label: 'Subscriptions', value: metrics.revenue.streams.subscriptions, color: 'text-blue-500' },
    { icon: <Share2 className="w-4 h-4" />, label: 'Referrals', value: metrics.revenue.streams.referrals, color: 'text-green-500' },
    { icon: <ShoppingCart className="w-4 h-4" />, label: 'Marketplace', value: metrics.revenue.streams.marketplace, color: 'text-purple-500' },
    { icon: <Music className="w-4 h-4" />, label: 'Services', value: metrics.revenue.streams.services, color: 'text-pink-500' },
    { icon: <Radio className="w-4 h-4" />, label: 'Track Sales', value: metrics.revenue.streams.trackSales, color: 'text-orange-500' },
    { icon: <BookOpen className="w-4 h-4" />, label: 'Courses', value: metrics.revenue.streams.courses, color: 'text-cyan-500' },
    { icon: <Users className="w-4 h-4" />, label: 'Partnerships', value: metrics.revenue.streams.partnerships, color: 'text-indigo-500' },
    { icon: <Gift className="w-4 h-4" />, label: 'Promotions', value: metrics.revenue.streams.promotions, color: 'text-yellow-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {userType === 'artist' ? 'Your Music Career Command Center' : 'Your Audio Business HQ'}
          </h1>
          <p className="text-muted-foreground mt-1">Track your momentum, revenue, and growth</p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline" size="sm">
          <Zap className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Gamification - Streaks & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StreakTracker />
        <AchievementsBadges />
      </div>

      {/* Hip-Hop Pulse - Real-time Activity */}
      <HipHopPulse />

      {/* Career Momentum Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Career Momentum
          </CardTitle>
          <CardDescription>Your performance metrics at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
            >
              <div className="flex items-center justify-between mb-2">
                <Music className="w-5 h-5 text-primary" />
                <Badge variant="secondary">{userType === 'artist' ? 'Sessions' : 'Projects'}</Badge>
              </div>
              <div className="text-2xl font-bold">{metrics.careerMomentum.totalSessions}</div>
              <p className="text-xs text-muted-foreground mt-1">Total completed</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20"
            >
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <Badge variant="secondary">Rate</Badge>
              </div>
              <div className="text-2xl font-bold">{metrics.careerMomentum.completionRate.toFixed(0)}%</div>
              <p className="text-xs text-muted-foreground mt-1">Completion rate</p>
              <Progress value={metrics.careerMomentum.completionRate} className="mt-2" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20"
            >
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <Badge variant="secondary">Growth</Badge>
              </div>
              <div className="text-2xl font-bold">+{metrics.careerMomentum.growthTrend}%</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20"
            >
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <Badge variant="secondary">Active</Badge>
              </div>
              <div className="text-2xl font-bold">{metrics.careerMomentum.activeProjects}</div>
              <p className="text-xs text-muted-foreground mt-1">In progress</p>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Analytics Dashboard - Full 10 Stream System */}
      <RevenueAnalyticsDashboard />

      {/* AI Insights from PrimeBot 4.0 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            PrimeBot 4.0 Insights
          </CardTitle>
          <CardDescription>AI-powered recommendations for your career</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Recommendations</h4>
              <div className="space-y-2">
                {metrics.aiInsights.recommendations.map((rec, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10"
                  >
                    <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{rec}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Priority Actions</h4>
              <div className="space-y-2">
                {metrics.aiInsights.priorityActions.map((action, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={() => {
                      // Navigate based on action type
                      if (action.includes('opportunities')) navigate('?tab=opportunities');
                      else if (action.includes('profile')) navigate('?tab=profile');
                      else if (action.includes('messages')) navigate('?tab=messages');
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="text-sm">{action}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">New Opportunities</p>
                  <p className="text-2xl font-bold">{metrics.aiInsights.opportunities}</p>
                </div>
                <Button onClick={() => navigate('?tab=opportunities')}>
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50"
                >
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};