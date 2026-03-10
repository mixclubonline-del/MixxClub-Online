/**
 * SessionsHub — Migrated to GlassPanel/HubHeader/HubSkeleton/EmptyState design tokens.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import {
  Plus, Search, Radio, History, Clock, Users,
  Headphones, Star, Calendar, Zap, Mic2, Play,
  Filter, ArrowUpRight
} from 'lucide-react';
import { SessionCard } from './SessionCard';
import { SessionStats } from './SessionStats';
import { UpcomingSessions } from './UpcomingSessions';
import { SessionHistory } from './SessionHistory';
import { EngineerSessionFeed } from '@/components/engineer/EngineerSessionFeed';
import { GlassPanel, HubHeader, HubSkeleton, EmptyState } from '../design';

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
  const [activeTab, setActiveTab] = useState(activeRole === 'engineer' ? 'marketplace' : 'active');
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

      if (activeTab === 'active') {
        query = query.in('status', ['active', 'waiting']);
      } else if (activeTab === 'scheduled') {
        query = query.not('scheduled_start', 'is', null).eq('status', 'scheduled');
      } else if (activeTab === 'history') {
        query = query.in('status', ['completed', 'ended']);
      }

      if (activeRole === 'artist') {
        query = query.eq('host_user_id', user?.id);
      } else {
        query = query.or(`host_user_id.eq.${user?.id},visibility.eq.public`);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;

      const sessionsWithCounts: Session[] = [];
      for (const session of data || []) {
        const countResult = await supabase
          .from('session_participants')
          .select('id', { count: 'exact', head: true })
          .eq('session_id', session.id);

        sessionsWithCounts.push({
          ...session,
          host_profile: Array.isArray(session.host_profile)
            ? session.host_profile[0]
            : session.host_profile,
          participant_count: countResult.count || 0
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

  const handleCreateSession = () => navigate('/create-session');
  const handleViewSession = (sessionId: string) => navigate(`/session/${sessionId}`);

  return (
    <div className="space-y-6">
      {/* Header */}
      <HubHeader
        icon={<Radio className="w-5 h-5 text-cyan-400" />}
        title="Sessions Hub"
        subtitle={activeRole === 'artist'
          ? 'Manage your collaboration sessions with engineers'
          : activeRole === 'producer'
            ? 'Manage sessions with artists and engineers'
            : 'Join sessions and collaborate with artists'}
        accent="rgba(6, 182, 212, 0.5)"
        action={
          <Button onClick={handleCreateSession} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            New Session
          </Button>
        }
      />

      {/* Stats */}
      <SessionStats userId={user?.id} role={activeRole || undefined} />

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <div className="lg:col-span-2 space-y-4">
          <GlassPanel padding="p-5" glow accent="rgba(6, 182, 212, 0.3)">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-white/5 border border-white/8">
                  {(activeRole === 'engineer' || activeRole === 'producer') && (
                    <TabsTrigger value="marketplace" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500">
                      <Radio className="w-4 h-4 mr-1" />
                      Marketplace
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="active">
                    <Zap className="w-4 h-4 mr-1" />
                    My Sessions
                  </TabsTrigger>
                  <TabsTrigger value="scheduled">
                    <Calendar className="w-4 h-4 mr-1" />
                    Scheduled
                  </TabsTrigger>
                  <TabsTrigger value="history">
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
                  className="pl-10 bg-white/5 border-white/10"
                />
              </div>
            </div>

            {activeTab === 'marketplace' ? (
              <EngineerSessionFeed />
            ) : isLoading ? (
              <HubSkeleton variant="list" count={4} />
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
              <EmptyState
                icon={Mic2}
                title="No sessions found"
                description={
                  activeTab === 'active' ? "You don't have any active sessions"
                    : activeTab === 'scheduled' ? 'No upcoming sessions scheduled'
                      : 'No completed sessions yet'
                }
                cta={{ label: 'Create Your First Session', onClick: handleCreateSession }}
              />
            )}
          </GlassPanel>
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
