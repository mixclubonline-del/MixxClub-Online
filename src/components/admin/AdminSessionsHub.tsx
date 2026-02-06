import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Headphones, Clock, Users, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const AdminSessionsHub = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('collaboration_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSessionStatus = async (sessionId: string, newStatus: string) => {
    setActionLoading(sessionId);
    try {
      const { error } = await supabase
        .from('collaboration_sessions')
        .update({ status: newStatus })
        .eq('id', sessionId);

      if (error) throw error;

      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, status: newStatus } : s))
      );
      toast.success(`Session marked as ${newStatus}`);
    } catch (error) {
      console.error(`Failed to ${newStatus} session:`, error);
      toast.error(`Failed to update session status`);
    } finally {
      setActionLoading(null);
    }
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400',
    completed: 'bg-blue-500/20 text-blue-400',
    pending: 'bg-yellow-500/20 text-yellow-400',
    cancelled: 'bg-red-500/20 text-red-400',
    waiting: 'bg-yellow-500/20 text-yellow-400',
  };

  const isActionable = (status: string | null) =>
    status === 'active' || status === 'waiting' || status === 'pending';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{sessions.length} sessions loaded</p>
      </div>

      {sessions.length === 0 ? (
        <Card className="bg-background/50 border-border/50">
          <CardContent className="p-8 text-center">
            <Headphones className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No sessions found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const isBusy = actionLoading === session.id;
            const canAct = isActionable(session.status);

            return (
              <Card key={session.id} className="bg-background/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Headphones className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {session.title || session.session_name || 'Untitled Session'}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(session.created_at), 'MMM d, h:mm a')}
                          </span>
                          {session.session_type && (
                            <span className="capitalize">{session.session_type}</span>
                          )}
                          {session.max_participants && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              Max {session.max_participants}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {canAct && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isBusy}
                            onClick={() => updateSessionStatus(session.id, 'completed')}
                            className="border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500/50"
                          >
                            {isBusy ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3.5 h-3.5" />
                            )}
                            <span className="ml-1.5">Complete</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isBusy}
                            onClick={() => updateSessionStatus(session.id, 'cancelled')}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                          >
                            {isBusy ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" />
                            )}
                            <span className="ml-1.5">Cancel</span>
                          </Button>
                        </>
                      )}
                      <Badge variant="outline" className={statusColors[session.status || 'pending'] || ''}>
                        {session.status || 'pending'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
