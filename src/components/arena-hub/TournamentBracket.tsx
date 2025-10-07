import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Calendar, DollarSign, Users } from 'lucide-react';

export default function TournamentBracket() {
  const { data: tournaments, isLoading } = useQuery({
    queryKey: ['active-tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('battle_tournaments')
        .select('*')
        .in('status', ['upcoming', 'active'])
        .order('start_date', { ascending: true })
        .limit(3);

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
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-white/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Active Tournaments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tournaments?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No active tournaments</p>
          </div>
        ) : (
          tournaments?.map((tournament) => (
            <Card key={tournament.id} className="bg-background/50 border-white/5">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{tournament.tournament_name}</h3>
                    <Badge variant="outline" className="mt-2">
                      {tournament.status}
                    </Badge>
                  </div>
                  {tournament.prize_pool && (
                    <div className="flex items-center gap-1 text-green-500">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-bold">{tournament.prize_pool}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{new Date(tournament.start_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{tournament.current_participants}/{tournament.max_participants}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
}
