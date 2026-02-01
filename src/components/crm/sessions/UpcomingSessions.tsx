import { useState, useEffect } from 'react';
import { useFlowNavigation } from '@/core/fabric/useFlow';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, Users, ArrowRight, Loader2 } from 'lucide-react';
import { format, formatDistanceToNow, isFuture } from 'date-fns';

interface UpcomingSession {
  id: string;
  title: string;
  scheduled_start: string;
  host_user_id: string;
  host_profile?: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface UpcomingSessionsProps {
  userId?: string;
}

export function UpcomingSessions({ userId }: UpcomingSessionsProps) {
  const { navigateTo } = useFlowNavigation();
  const [sessions, setSessions] = useState<UpcomingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUpcomingSessions();
    }
  }, [userId]);

  const fetchUpcomingSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('collaboration_sessions')
        .select(`
          id,
          title,
          scheduled_start,
          host_user_id,
          host_profile:profiles!collaboration_sessions_host_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .not('scheduled_start', 'is', null)
        .gte('scheduled_start', new Date().toISOString())
        .order('scheduled_start', { ascending: true })
        .limit(3);

      if (error) throw error;

      const formatted = (data || []).map(session => ({
        ...session,
        host_profile: Array.isArray(session.host_profile) 
          ? session.host_profile[0] 
          : session.host_profile
      }));

      setSessions(formatted);
    } catch (error) {
      console.error('Error fetching upcoming sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-card/50 border-border/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4 text-accent-cyan" />
          Upcoming Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length > 0 ? (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div 
                key={session.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                onClick={() => navigateTo(`/session/${session.id}`)}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={session.host_profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-accent-cyan to-accent-blue text-white text-xs">
                    {session.host_profile?.full_name?.charAt(0) || 'H'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session.title}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(session.scheduled_start), { addSuffix: true })}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <Calendar className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No upcoming sessions</p>
            <Button 
              variant="link" 
              size="sm" 
              className="mt-1 text-accent-cyan"
              onClick={() => navigateTo('/create-session')}
            >
              Schedule one now
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
