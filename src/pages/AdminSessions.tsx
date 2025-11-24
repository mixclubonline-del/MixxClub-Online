import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Video, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

interface CollaborationSession {
  id: string;
  session_name: string;
  session_type: string;
  status: string;
  created_at: string;
  started_at?: string | null;
  ended_at?: string | null;
  max_participants: number;
  host_user_id: string;
}

export default function AdminSessions() {
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('collaboration_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error: any) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load collaboration sessions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'waiting': return 'secondary';
      case 'ended': return 'outline';
      default: return 'secondary';
    }
  };

  const filteredSessions = sessions.filter(session => 
    statusFilter === 'all' || session.status === statusFilter
  );

  const sessionStats = {
    total: sessions.length,
    active: sessions.filter(s => s.status === 'active').length,
    waiting: sessions.filter(s => s.status === 'waiting').length,
    ended: sessions.filter(s => s.status === 'ended').length,
    byType: sessions.reduce((acc, s) => {
      acc[s.session_type] = (acc[s.session_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  const getDuration = (session: CollaborationSession) => {
    if (!session.started_at) return 'Not started';
    const start = new Date(session.started_at);
    const end = session.ended_at ? new Date(session.ended_at) : new Date();
    const minutes = Math.floor((end.getTime() - start.getTime()) / 60000);
    return `${minutes} min`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Collaboration Sessions</h1>
            <p className="text-muted-foreground">
              Monitor real-time collaboration sessions
            </p>
          </div>
          <Button onClick={fetchSessions}>Refresh</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{sessionStats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Active Now</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{sessionStats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Waiting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{sessionStats.waiting}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ended</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{sessionStats.ended}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">All ({sessionStats.total})</TabsTrigger>
            <TabsTrigger value="active">Active ({sessionStats.active})</TabsTrigger>
            <TabsTrigger value="waiting">Waiting ({sessionStats.waiting})</TabsTrigger>
            <TabsTrigger value="ended">Ended ({sessionStats.ended})</TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter} className="mt-6">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredSessions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8 text-muted-foreground">
                  No sessions found
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredSessions.map((session) => (
                  <Card key={session.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="flex items-center gap-2">
                            <Video className="h-5 w-5" />
                            {session.session_name}
                          </CardTitle>
                          <CardDescription>
                            {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                          </CardDescription>
                        </div>
                        <Badge variant={getStatusColor(session.status)}>
                          {session.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Video className="h-4 w-4" />
                          {session.session_type}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Max {session.max_participants} participants
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Duration: {getDuration(session)}
                        </div>
                      </div>
                      
                      {session.started_at && (
                        <div className="text-xs text-muted-foreground">
                          Started: {format(new Date(session.started_at), 'MMM d, yyyy h:mm a')}
                        </div>
                      )}
                      {session.ended_at && (
                        <div className="text-xs text-muted-foreground">
                          Ended: {format(new Date(session.ended_at), 'MMM d, yyyy h:mm a')}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
