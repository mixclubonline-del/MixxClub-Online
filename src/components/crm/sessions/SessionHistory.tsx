import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { History, Clock, CheckCircle, Star, ArrowRight, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface HistorySession {
  id: string;
  title: string;
  status: string;
  created_at: string;
  session_type: string | null;
  host_profile?: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface SessionHistoryProps {
  userId?: string;
  limit?: number;
}

export function SessionHistory({ userId, limit = 5 }: SessionHistoryProps) {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchSessionHistory();
    }
  }, [userId]);

  const fetchSessionHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('collaboration_sessions')
        .select(`
          id,
          title,
          status,
          created_at,
          session_type,
          host_profile:profiles!collaboration_sessions_host_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .in('status', ['completed', 'ended'])
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const formatted = (data || []).map(session => ({
        ...session,
        host_profile: Array.isArray(session.host_profile) 
          ? session.host_profile[0] 
          : session.host_profile
      }));

      setSessions(formatted);
    } catch (error) {
      console.error('Error fetching session history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-card/50 border-border/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <History className="w-4 h-4 text-accent-blue" />
          Recent Sessions
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
                onClick={() => navigate(`/session/${session.id}`)}
              >
                <div className="p-2 rounded-lg bg-muted/50">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{session.session_type || 'Mixing'}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-muted-foreground hover:text-foreground"
              onClick={() => navigate('/sessions')}
            >
              View All History
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <History className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No completed sessions yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
