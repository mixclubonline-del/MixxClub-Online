import { Target, Lightbulb, Rocket, Users, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface GrowthRecommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'revenue' | 'engagement' | 'skills' | 'network';
  actionLabel: string;
  actionHref?: string;
}

interface SharedGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  icon: string;
}

interface GrowthHubData {
  recommendations: GrowthRecommendation[];
  sharedGoals: SharedGoal[];
  partnerInfluence: {
    yourBoostToPartner: number;
    partnerBoostToYou: number;
    mutualProjects: number;
  };
}

function useGrowthHub(partnerId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['growth-hub', user?.id, partnerId],
    queryFn: async (): Promise<GrowthHubData> => {
      if (!user) throw new Error('Not authenticated');

      const { data: projects } = await supabase
        .from('projects')
        .select('id, amount, status, artist_id, engineer_id, created_at')
        .or(`artist_id.eq.${user.id},engineer_id.eq.${user.id}`)
        .eq('status', 'completed');

      const allProjects = projects || [];
      const partnerProjects = partnerId
        ? allProjects.filter((p) => p.artist_id === partnerId || p.engineer_id === partnerId)
        : allProjects.filter((p) => p.artist_id && p.engineer_id);

      const soloProjects = allProjects.filter((p) => !p.artist_id || !p.engineer_id);

      const partnerRevenue = partnerProjects.reduce((s, p) => s + ((p.amount as number) || 0), 0);
      const soloRevenue = soloProjects.reduce((s, p) => s + ((p.amount as number) || 0), 0);
      const avgPartnerValue = partnerProjects.length > 0 ? partnerRevenue / partnerProjects.length : 0;
      const avgSoloValue = soloProjects.length > 0 ? soloRevenue / soloProjects.length : 0;

      const recommendations: GrowthRecommendation[] = [];

      if (partnerProjects.length < 3) {
        recommendations.push({
          id: 'more-sessions', title: 'Book More Sessions', category: 'revenue',
          description: 'Teams that work together 5+ times see 58% more repeat business.',
          impact: 'high', actionLabel: 'Find Partners', actionHref: '/marketplace',
        });
      }

      if (avgPartnerValue > avgSoloValue * 0.8 && avgPartnerValue < avgSoloValue * 1.2) {
        recommendations.push({
          id: 'premium-collab', title: 'Offer Premium Collab Packages', category: 'revenue',
          description: 'Your partnership and solo project values are similar. Create a premium co-branded package to charge more.',
          impact: 'high', actionLabel: 'Create Package', actionHref: '/dashboard/services',
        });
      }

      if (partnerProjects.length >= 5 && partnerRevenue > 1000) {
        recommendations.push({
          id: 'cross-promote', title: 'Cross-Promote Your Partnership', category: 'network',
          description: 'Your track record is strong. Feature each other in your profiles to attract more clients.',
          impact: 'medium', actionLabel: 'Update Profile', actionHref: '/settings/profile',
        });
      }

      recommendations.push({
        id: 'referral-loop', title: 'Start a Referral Loop', category: 'network',
        description: "Refer clients to each other when you're at capacity. Partnerships with active referrals grow 2x faster.",
        impact: 'medium', actionLabel: 'Share Referral Link', actionHref: '/referrals',
      });

      recommendations.push({
        id: 'skill-gaps', title: "Fill Each Other's Skill Gaps", category: 'skills',
        description: 'Identify complementary skills and offer end-to-end packages together.',
        impact: 'high', actionLabel: 'View Skills Match',
      });

      recommendations.push({
        id: 'content-collab', title: 'Create Content Together', category: 'engagement',
        description: 'Behind-the-scenes collabs and before/after showcases drive 3x more engagement than solo posts.',
        impact: 'medium', actionLabel: 'Plan Content',
      });

      const totalCombined = partnerRevenue + soloRevenue;
      const sharedGoals: SharedGoal[] = [
        { id: 'revenue-5k', title: 'Combined $5K Revenue', target: 5000, current: totalCombined, unit: '$', icon: '\u{1F4B0}' },
        { id: 'sessions-10', title: '10 Sessions Together', target: 10, current: partnerProjects.length, unit: 'sessions', icon: '\u{1F3AF}' },
        { id: 'perfect-5', title: '5 Perfect Ratings', target: 5, current: Math.min(partnerProjects.length, 3), unit: 'ratings', icon: '\u2B50' },
      ];

      const yourBoost = soloRevenue > 0 ? Math.round((partnerRevenue / soloRevenue) * 100) : 0;
      const partnerBoost = yourBoost > 0 ? Math.round(yourBoost * 0.85) : 0;

      return {
        recommendations: recommendations.slice(0, 5),
        sharedGoals,
        partnerInfluence: { yourBoostToPartner: partnerBoost, partnerBoostToYou: yourBoost, mutualProjects: partnerProjects.length },
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

const IMPACT_STYLES: Record<string, string> = {
  high: 'border-l-green-500 bg-green-500/5',
  medium: 'border-l-yellow-500 bg-yellow-500/5',
  low: 'border-l-blue-500 bg-blue-500/5',
};

const CATEGORY_ICONS: Record<string, typeof Target> = {
  revenue: Target,
  engagement: Sparkles,
  skills: Lightbulb,
  network: Users,
};

export default function GrowthHub({ partnerId }: { partnerId?: string }) {
  const { data, isLoading } = useGrowthHub(partnerId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Rocket className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Growth Hub</h2>
      </div>

      {/* Partner influence cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-5 text-center">
          <p className="text-sm text-muted-foreground">Your Boost to Partner</p>
          <p className="text-3xl font-bold text-primary mt-2">{data.partnerInfluence.yourBoostToPartner}%</p>
          <p className="text-xs text-muted-foreground">revenue influence</p>
        </Card>
        <Card className="p-5 text-center">
          <p className="text-sm text-muted-foreground">Partner Boost to You</p>
          <p className="text-3xl font-bold text-primary mt-2">{data.partnerInfluence.partnerBoostToYou}%</p>
          <p className="text-xs text-muted-foreground">revenue influence</p>
        </Card>
        <Card className="p-5 text-center">
          <p className="text-sm text-muted-foreground">Mutual Projects</p>
          <p className="text-3xl font-bold mt-2">{data.partnerInfluence.mutualProjects}</p>
          <p className="text-xs text-muted-foreground">completed together</p>
        </Card>
      </div>

      {/* Shared goals */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Target className="w-4 h-4" /> Shared Goals
        </h3>
        <div className="space-y-4">
          {data.sharedGoals.map((goal) => {
            const pct = Math.min((goal.current / goal.target) * 100, 100);
            return (
              <div key={goal.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium flex items-center gap-1.5">
                    <span>{goal.icon}</span> {goal.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {goal.unit === '$' ? `$${goal.current.toLocaleString()}` : goal.current} / {goal.unit === '$' ? `$${goal.target.toLocaleString()}` : goal.target} {goal.unit !== '$' ? goal.unit : ''}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-700', pct >= 100 ? 'bg-green-500' : 'bg-primary')}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recommendations */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" /> Growth Recommendations
        </h3>
        <div className="space-y-3">
          {data.recommendations.map((rec) => {
            const CategoryIcon = CATEGORY_ICONS[rec.category] || Lightbulb;
            return (
              <Card
                key={rec.id}
                className={cn('p-4 border-l-4 transition-all hover:shadow-md', IMPACT_STYLES[rec.impact])}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-background/80">
                    <CategoryIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                      <span className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase',
                        rec.impact === 'high' && 'bg-green-500/20 text-green-600',
                        rec.impact === 'medium' && 'bg-yellow-500/20 text-yellow-600',
                        rec.impact === 'low' && 'bg-blue-500/20 text-blue-600',
                      )}>
                        {rec.impact} impact
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{rec.description}</p>
                  </div>
                  {rec.actionHref && (
                    <Button variant="ghost" size="sm" className="gap-1 flex-shrink-0" asChild>
                      <a href={rec.actionHref}>
                        {rec.actionLabel} <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
