import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Trophy, Users, Clock } from 'lucide-react';
import { format, formatDistanceToNow, isFuture } from 'date-fns';

export default function EventCalendar() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['event-calendar'],
    queryFn: async () => {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('battle_tournaments')
        .select('*')
        .gte('start_date', now)
        .order('start_date', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-card/30 backdrop-blur-sm border-white/5">
            <CardHeader>
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Card className="bg-card/30 backdrop-blur-sm border-white/5">
        <CardContent className="p-8 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No upcoming events</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => {
        const isUpcoming = isFuture(new Date(event.start_date));
        
        return (
          <Card key={event.id} className="bg-card/30 backdrop-blur-sm border-white/5 hover:border-primary/30 transition-all">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <CardTitle className="text-base mb-2 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-primary" />
                    {event.tournament_name}
                  </CardTitle>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(event.start_date), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDistanceToNow(new Date(event.start_date), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
                {isUpcoming && (
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    Upcoming
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm">
                {event.prize_pool && (
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Trophy className="w-4 h-4" />
                    <span className="font-semibold">${event.prize_pool}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{event.current_participants || 0}/{event.max_participants || 16}</span>
                </div>
                {event.entry_fee && event.entry_fee > 0 && (
                  <Badge variant="outline" className="text-xs">
                    ${event.entry_fee} entry
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="w-full gap-2">
                <Trophy className="w-4 h-4" />
                Register Now
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
