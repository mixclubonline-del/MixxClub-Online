import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import GlobalHeader from '@/components/GlobalHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { 
  Music2, Users, Clock, DollarSign, MessageSquare, FileAudio, 
  CheckCircle, AlertCircle, Play, Upload, ArrowLeft, Send,
  Loader2, Headphones, Calendar, Zap
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { SessionChat } from '@/components/session/SessionChat';
import { SessionDeliverables } from '@/components/session/SessionDeliverables';
import { SessionParticipants } from '@/components/session/SessionParticipants';

interface SessionData {
  id: string;
  title: string;
  description: string;
  status: string;
  session_type: string;
  visibility: string;
  audio_quality: string;
  host_user_id: string;
  created_at: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  max_participants: number;
}

interface HostProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  role: string;
}

export default function SessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [session, setSession] = useState<SessionData | null>(null);
  const [hostProfile, setHostProfile] = useState<HostProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isJoining, setIsJoining] = useState(false);

  const isHost = user?.id === session?.host_user_id;
  const isParticipant = false; // TODO: Check if user is a participant

  useEffect(() => {
    if (!sessionId) {
      navigate('/sessions');
      return;
    }
    fetchSessionDetails();
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    try {
      setIsLoading(true);
      
      // Fetch session
      const { data: sessionData, error: sessionError } = await supabase
        .from('collaboration_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError || !sessionData) {
        throw new Error('Session not found');
      }

      setSession(sessionData);

      // Fetch host profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role')
        .eq('id', sessionData.host_user_id)
        .single();

      if (profileData) {
        setHostProfile(profileData);
      }
    } catch (err) {
      console.error('Error fetching session:', err);
      toast({
        title: 'Session not found',
        description: 'The session you are looking for does not exist.',
        variant: 'destructive'
      });
      navigate('/sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinSession = async () => {
    if (!user) {
      navigate('/auth?redirect=' + encodeURIComponent(`/session/${sessionId}`));
      return;
    }

    setIsJoining(true);
    try {
      // Create a session join request
      const { error } = await supabase
        .from('session_join_requests')
        .insert({
          session_id: sessionId!,
          user_id: user.id,
          engineer_id: user.id,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Request sent!',
        description: 'The session host will review your request.',
      });
    } catch (err: any) {
      if (err.code === '23505') {
        toast({
          title: 'Already requested',
          description: 'You have already sent a join request for this session.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to send join request. Please try again.',
          variant: 'destructive'
        });
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handleEnterWorkspace = () => {
    navigate(`/collaborate/${sessionId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><Zap className="w-3 h-3 mr-1" />Active</Badge>;
      case 'waiting':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Clock className="w-3 h-3 mr-1" />Waiting</Badge>;
      case 'completed':
        return <Badge className="bg-muted text-muted-foreground"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>{session.title} — MixClub Session</title>
        <meta name="description" content={session.description || 'Collaboration session on MixClub'} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <GlobalHeader />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Button variant="ghost" size="sm" asChild>
              <Link to="/sessions">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sessions
              </Link>
            </Button>
          </motion.div>

          {/* Session Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-card/50 border-border/30 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500/10 via-accent-cyan/10 to-primary/10 p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusBadge(session.status)}
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                        {session.session_type || 'Mixing'}
                      </Badge>
                      {session.visibility === 'public' && (
                        <Badge variant="outline">Public</Badge>
                      )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">{session.title}</h1>
                    <p className="text-muted-foreground max-w-2xl">{session.description}</p>
                  </div>
                  
                  <div className="flex gap-3">
                    {isHost || isParticipant ? (
                      <Button 
                        onClick={handleEnterWorkspace}
                        className="bg-gradient-to-r from-green-500 to-accent-cyan hover:opacity-90"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Enter Workspace
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleJoinSession}
                        disabled={isJoining}
                        className="bg-gradient-to-r from-green-500 to-accent-cyan hover:opacity-90"
                      >
                        {isJoining ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Request to Join
                      </Button>
                    )}
                  </div>
                </div>

                {/* Session Meta */}
                <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-border/30">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={hostProfile?.avatar_url} alt={hostProfile?.full_name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent-blue text-white">
                        {hostProfile?.full_name?.charAt(0) || 'H'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{hostProfile?.full_name || 'Host'}</p>
                      <p className="text-xs text-muted-foreground capitalize">{hostProfile?.role || 'Artist'}</p>
                    </div>
                  </div>
                  <Separator orientation="vertical" className="h-10" />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Headphones className="w-4 h-4" />
                    <span>{session.audio_quality || 'High Quality'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>Max {session.max_participants || 5} participants</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Created {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-card/50 border border-border/30 p-1">
                <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Music2 className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="deliverables" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <FileAudio className="w-4 h-4 mr-2" />
                  Deliverables
                </TabsTrigger>
                <TabsTrigger value="messages" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Messages
                </TabsTrigger>
                <TabsTrigger value="participants" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Users className="w-4 h-4 mr-2" />
                  Team
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-card/50 border-border/30">
                    <CardHeader>
                      <CardTitle className="text-lg">Session Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-medium">{session.session_type || 'Mixing'}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Audio Quality</span>
                        <span className="font-medium">{session.audio_quality || 'High'}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Visibility</span>
                        <span className="font-medium capitalize">{session.visibility || 'Public'}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        {getStatusBadge(session.status)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 border-border/30">
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {(isHost || isParticipant) && (
                        <>
                          <Button className="w-full justify-start" variant="outline" onClick={handleEnterWorkspace}>
                            <Play className="w-4 h-4 mr-2" />
                            Enter Collaboration Workspace
                          </Button>
                          <Button className="w-full justify-start" variant="outline">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Files
                          </Button>
                        </>
                      )}
                      <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('messages')}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="deliverables">
                <SessionDeliverables sessionId={sessionId!} isHost={isHost} />
              </TabsContent>

              <TabsContent value="messages">
                <SessionChat sessionId={sessionId!} currentUserId={user?.id} />
              </TabsContent>

              <TabsContent value="participants">
                <SessionParticipants sessionId={sessionId!} hostId={session.host_user_id} />
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
      </div>
    </>
  );
}
