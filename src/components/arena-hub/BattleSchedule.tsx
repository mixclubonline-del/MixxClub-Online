import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, DollarSign } from 'lucide-react';

export default function BattleSchedule() {
  const { data: schedule, isLoading } = useQuery({
    queryKey: ['battle-schedule'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('battle_tournaments')
        .select('*')
        .eq('status', 'upcoming')
        .order('start_date', { ascending: true })
        .limit(5);

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
          <Calendar className="w-5 h-5 text-primary" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {schedule?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No upcoming events</p>
          </div>
        ) : (
          schedule?.map((event) => (
            <Card key={event.id} className="bg-background/50 border-white/5">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{event.tournament_name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(event.start_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {event.prize_pool && (
                    <Badge variant="outline" className="gap-1">
                      <DollarSign className="w-3 h-3" />
                      {event.prize_pool}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {event.current_participants}/{event.max_participants} registered
                  </span>
                  <Button size="sm" variant="outline">
                    Register
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
}
