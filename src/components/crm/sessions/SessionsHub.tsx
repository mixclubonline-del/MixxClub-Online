import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import {
  Plus, Search, Radio, History, Clock, Users,
  Headphones, Star, Calendar, Zap, Mic2, Play,
  Filter, ArrowUpRight, Loader2
} from 'lucide-react';
import { SessionCard } from './SessionCard';
import { SessionStats } from './SessionStats';
import { UpcomingSessions } from './UpcomingSessions';
import { SessionHistory } from './SessionHistory';

interface Session {
  id: string;
  title: string;
  description: string | null;
  status: string;
  session_type: string | null;
  visibility: string | null;
  audio_quality: string | null;
  host_user_id: string;
  created_at: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  max_participants: number | null;
  host_profile?: {
    full_name: string;
    avatar_url: string | null;
  };
  participant_count?: number;
}

export function SessionsHub() {
  const { user, activeRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user, activeTab]);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('collaboration_sessions')
        .select(`
          *,
          host_profile:profiles!collaboration_sessions_host_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      // Filter based on active tab
      if (activeTab === 'active') {
        query = query.in('status', ['active', 'waiting']);
      } else if (activeTab === 'scheduled') {
        query = query.not('scheduled_start', 'is', null).eq('status', 'scheduled');
      } else if (activeTab === 'history') {
        query = query.in('status', ['completed', 'ended']);
      }

      // Filter by user's involvement (host or participant)
      if (activeRole === 'artist') {
        query = query.eq('host_user_id', user?.id);
      } else {
        // For engineers and producers, show sessions they host or public ones
        query = query.or(`host_user_id.eq.${user?.id},visibility.eq.public`);
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;

      // Get participant counts (simplified to avoid type issues)
      const sessionsWithCounts: Session[] = [];
      for (const session of data || []) {
        // Simple count query
        const countResult = await supabase
          .from('session_participants')
          .select('id', { count: 'exact', head: true })
          .eq('session_id', session.id);

        const count = countResult.count;

        sessionsWithCounts.push({
          ...session,
          host_profile: Array.isArray(session.host_profile)
            ? session.host_profile[0]
            : session.host_profile,
          participant_count: count || 0
        });
      }

      setSessions(sessionsWithCounts);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateSession = () => {
    navigate('/create-session');
  };

  const handleViewSession = (sessionId: string) => {
    navigate(`/session/${sessionId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Radio className="w-6 h-6 text-accent-cyan" />
            Sessions Hub
          </h2>
          <p className="text-muted-foreground">
            {activeRole === 'artist'
              ? 'Manage your collaboration sessions with engineers'
              : activeRole === 'producer'
                ? 'Manage sessions with artists and engineers'
                : 'Join sessions and collaborate with artists'
            }
          </p>
        </div>
        <Button
          onClick={handleCreateSession}
          className="bg-gradient-to-r from-accent-cyan to-accent-blue hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Session
        </Button>
      </div>

      {/* Stats */}
      <SessionStats userId={user?.id} role={activeRole || undefined} />

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card/50 border-border/30">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="bg-muted/50">
                    <TabsTrigger value="active" className="data-[state=active]:bg-accent-cyan/20">
                      <Zap className="w-4 h-4 mr-1" />
                      Active
                    </TabsTrigger>
                    <TabsTrigger value="scheduled" className="data-[state=active]:bg-accent-cyan/20">
                      <Calendar className="w-4 h-4 mr-1" />
                      Scheduled
                    </TabsTrigger>
                    <TabsTrigger value="history" className="data-[state=active]:bg-accent-cyan/20">
                      <History className="w-4 h-4 mr-1" />
                      History
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search sessions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-muted/30 border-border/30"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-accent-cyan" />
                </div>
              ) : filteredSessions.length > 0 ? (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {filteredSessions.map((session, index) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <SessionCard
                          session={session}
                          onView={() => handleViewSession(session.id)}
                          isHost={session.host_user_id === user?.id}
                        />
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12">
                  <Mic2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No sessions found</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {activeTab === 'active' && "You don't have any active sessions"}
                    {activeTab === 'scheduled' && "No upcoming sessions scheduled"}
                    {activeTab === 'history' && "No completed sessions yet"}
                  </p>
                  <Button onClick={handleCreateSession} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Session
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <UpcomingSessions userId={user?.id} />
          <SessionHistory userId={user?.id} limit={5} />
        </div>
      </div>
    </div>
  );
}
