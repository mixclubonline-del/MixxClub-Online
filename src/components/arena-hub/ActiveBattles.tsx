import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Swords, Users, Trophy } from 'lucide-react';

export default function ActiveBattles() {
  const { data: battles, isLoading } = useQuery({
    queryKey: ['active-battles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('battles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card/30 backdrop-blur-sm border-white/5">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Active Battles</h2>
        <Badge variant="outline" className="gap-1">
          <Swords className="w-3 h-3" />
          {battles?.length || 0} Live
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {battles?.map((battle) => (
          <Card key={battle.id} className="bg-card/30 backdrop-blur-sm border-white/5 hover:border-primary/20 transition-all">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="truncate">{battle.title}</span>
                {battle.battle_type === 'tournament' && (
                  <Trophy className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{battle.rapper1} vs {battle.rapper2}</span>
                </div>
              </div>

              {battle.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {battle.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>{battle.votes_count} votes</span>
                  <span>•</span>
                  <span>{battle.views_count} views</span>
                </div>
                <Button size="sm" className="gap-2">
                  <Swords className="w-3 h-3" />
                  Vote Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
