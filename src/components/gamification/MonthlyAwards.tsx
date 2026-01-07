import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { 
  Trophy, 
  Crown, 
  Star,
  Users,
  Sparkles,
  Calendar,
  Award
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface MonthlyAward {
  id: string;
  award_month: string;
  category: string;
  winner_id: string;
  runner_up_id: string | null;
  metrics: unknown;
  prize_amount: number | null;
  winner_name?: string;
  winner_avatar?: string;
  runner_up_name?: string;
}

const AWARD_CATEGORIES = [
  { id: 'top_mixer', name: 'Top Mixer', icon: Trophy, color: 'text-yellow-500' },
  { id: 'most_collaborative', name: 'Most Collaborative', icon: Users, color: 'text-blue-500' },
  { id: 'rising_star', name: 'Rising Star', icon: Sparkles, color: 'text-purple-500' },
  { id: 'client_favorite', name: 'Client Favorite', icon: Star, color: 'text-pink-500' }
];

export const MonthlyAwards = () => {
  const [currentAwards, setCurrentAwards] = useState<MonthlyAward[]>([]);
  const [pastAwards, setPastAwards] = useState<MonthlyAward[]>([]);
  const [loading, setLoading] = useState(true);
  const [daysUntilAward, setDaysUntilAward] = useState(0);

  useEffect(() => {
    fetchAwards();
    calculateCountdown();
  }, []);

  const fetchAwards = async () => {
    try {
      const currentMonth = format(new Date(), 'yyyy-MM');
      const previousMonths = [1, 2, 3].map(i => format(subMonths(new Date(), i), 'yyyy-MM'));

      // Fetch current month awards
      const { data: current, error: currentError } = await supabase
        .from('monthly_awards')
        .select('*')
        .eq('award_month', currentMonth);

      if (currentError) throw currentError;

      // Fetch past awards
      const { data: past, error: pastError } = await supabase
        .from('monthly_awards')
        .select('*')
        .in('award_month', previousMonths)
        .order('award_month', { ascending: false });

      if (pastError) throw pastError;

      // Enrich with user data
      const allAwards = [...(current || []), ...(past || [])];
      const userIds = [...new Set(allAwards.flatMap(a => [a.winner_id, a.runner_up_id].filter(Boolean)))];
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      const enrichAward = (award: MonthlyAward) => {
        const winner = profiles?.find(p => p.id === award.winner_id);
        const runnerUp = profiles?.find(p => p.id === award.runner_up_id);
        return {
          ...award,
          winner_name: winner?.username || 'Anonymous',
          winner_avatar: winner?.avatar_url,
          runner_up_name: runnerUp?.username
        };
      };

      setCurrentAwards((current || []).map(enrichAward));
      setPastAwards((past || []).map(enrichAward));
    } catch (error) {
      console.error('Error fetching awards:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCountdown = () => {
    const now = new Date();
    const endOfCurrentMonth = endOfMonth(now);
    const diff = Math.ceil((endOfCurrentMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    setDaysUntilAward(diff);
  };

  const getCategoryInfo = (categoryId: string) => {
    return AWARD_CATEGORIES.find(c => c.id === categoryId) || AWARD_CATEGORIES[0];
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Countdown Banner */}
      <Card className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Next Award Announcement
              </h3>
              <p className="text-muted-foreground mt-1">
                Monthly awards will be announced at the end of the month
              </p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">{daysUntilAward}</p>
              <p className="text-sm text-muted-foreground">days left</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Month Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            {format(new Date(), 'MMMM yyyy')} Awards
          </CardTitle>
          <CardDescription>
            Current standings for this month's awards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AWARD_CATEGORIES.map((cat) => {
              const award = currentAwards.find(a => a.category === cat.id);
              const Icon = cat.icon;
              
              return (
                <div
                  key={cat.id}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-full bg-muted ${cat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">{cat.name}</h4>
                      {award?.prize_amount && (
                        <Badge variant="secondary" className="mt-1">
                          ${award.prize_amount} prize
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {award ? (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-yellow-500">
                        <AvatarImage src={award.winner_avatar || ''} />
                        <AvatarFallback>
                          {award.winner_name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium flex items-center gap-1">
                          <Crown className="h-4 w-4 text-yellow-500" />
                          {award.winner_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Current Leader
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No leader yet - be the first!
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Past Winners */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Past Winners
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pastAwards.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No past awards yet. Be part of history!
            </p>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {pastAwards.map((award) => {
                  const catInfo = getCategoryInfo(award.category);
                  const Icon = catInfo.icon;
                  
                  return (
                    <div
                      key={award.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full bg-muted ${catInfo.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{catInfo.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(award.award_month + '-01'), 'MMMM yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={award.winner_avatar || ''} />
                          <AvatarFallback>
                            {award.winner_name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{award.winner_name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
