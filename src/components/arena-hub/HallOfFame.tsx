import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Crown, Trophy, Medal } from 'lucide-react';

export default function HallOfFame() {
  const { data: topBattlers, isLoading } = useQuery({
    queryKey: ['hall-of-fame'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('battler_stats')
        .select('*')
        .order('overall_score', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card className="bg-card/30 backdrop-blur-sm border-white/5">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-60 w-full" />
        </CardContent>
      </Card>
    );
  }

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-orange-600" />;
    return null;
  };

  const getRankColor = (index: number) => {
    if (index === 0) return 'text-yellow-500';
    if (index === 1) return 'text-gray-400';
    if (index === 2) return 'text-orange-600';
    return 'text-muted-foreground';
  };

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-white/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Hall of Fame
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {topBattlers?.map((battler, index) => (
          <div
            key={battler.id}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
              index < 3 ? 'bg-background/80' : 'bg-background/50'
            } hover:bg-background/60`}
          >
            <div className={`flex items-center justify-center w-8 font-bold ${getRankColor(index)}`}>
              {getRankIcon(index) || `#${index + 1}`}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{battler.battler_name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{battler.total_battles} battles</span>
                <span>•</span>
                <span className="text-green-500">{battler.wins}W</span>
                <span className="text-red-500">{battler.losses}L</span>
              </div>
            </div>

            <Badge variant="outline" className="flex-shrink-0">
              {battler.overall_score.toFixed(1)}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
