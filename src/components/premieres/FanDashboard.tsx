import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Headphones, Award, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FanStats {
  total_votes: number;
  total_listens: number;
  taste_maker_score: number;
  discovery_count: number;
  badges: any;
  weekly_votes: number;
}

export default function FanDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<FanStats>({
    total_votes: 0,
    total_listens: 0,
    taste_maker_score: 0,
    discovery_count: 0,
    badges: [],
    weekly_votes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFanStats();
    }
  }, [user]);

  const fetchFanStats = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('fan_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching fan stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const level = Math.floor(stats.total_votes / 10) + 1;
  const progressToNextLevel = ((stats.total_votes % 10) / 10) * 100;

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent-blue/10 border-accent/20">
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 mb-3">
            <Trophy className="h-8 w-8 text-accent" />
          </div>
          <div className="text-3xl font-bold mb-1">Level {level}</div>
          <p className="text-sm text-muted-foreground">Fan Status</p>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>Progress to Level {level + 1}</span>
            <span className="text-accent">{stats.total_votes % 10}/10 votes</span>
          </div>
          <Progress value={progressToNextLevel} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-background/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Star className="h-4 w-4" />
              <span>Total Votes</span>
            </div>
            <div className="text-2xl font-bold">{stats.total_votes}</div>
          </div>

          <div className="p-3 rounded-lg bg-background/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Headphones className="h-4 w-4" />
              <span>Listens</span>
            </div>
            <div className="text-2xl font-bold">{stats.total_listens}</div>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-card/30 backdrop-blur-sm border-white/10">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-accent" />
          This Week
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Votes Cast</span>
            <span className="font-semibold">{stats.weekly_votes}/10</span>
          </div>
          <Progress value={(stats.weekly_votes / 10) * 100} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Vote on 10 tracks this week to unlock bonus rewards!
          </p>
        </div>
      </Card>

      <Card className="p-6 bg-card/30 backdrop-blur-sm border-white/10">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-accent" />
          Achievements
        </h3>
        <div className="space-y-2">
          {stats.badges && Array.isArray(stats.badges) && stats.badges.length > 0 ? (
            stats.badges.map((badge: any, index: number) => (
              <Badge key={index} variant="secondary" className="mr-2">
                {badge.icon} {badge.name}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Start voting to earn badges!
            </p>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Taste Maker Score</span>
            <span className="font-semibold text-accent">{stats.taste_maker_score}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Vote on tracks that become popular to increase your score!
          </p>
        </div>
      </Card>
    </div>
  );
}
