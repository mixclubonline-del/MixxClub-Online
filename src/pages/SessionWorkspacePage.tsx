import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, Music, MessageSquare, FileAudio, 
  TrendingUp, Zap, Volume2, ArrowLeft, Upload
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export const SessionWorkspacePage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState<any>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId && user) {
      fetchSessionData();
      fetchAISuggestions();
    }
  }, [sessionId, user]);

  const fetchSessionData = async () => {
    try {
      const { data, error } = await supabase
        .from('collaboration_sessions')
        .select(`
          *,
          host:profiles!collaboration_sessions_host_user_id_fkey(full_name, avatar_url),
          participants:session_participants(
            user_id,
            profiles(full_name, avatar_url)
          )
        `)
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      setSessionData(data);
    } catch (error: any) {
      console.error('Error fetching session:', error);
      toast.error('Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const fetchAISuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_mixing_suggestions')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setAiSuggestions(data || []);
    } catch (error: any) {
      console.error('Error fetching AI suggestions:', error);
    }
  };

  const applySuggestion = async (suggestionId: string) => {
    try {
      const { error } = await supabase
        .from('ai_mixing_suggestions')
        .update({ applied: true, applied_by: user?.id })
        .eq('id', suggestionId);

      if (error) throw error;
      toast.success('AI suggestion applied!');
      fetchAISuggestions();
    } catch (error: any) {
      console.error('Error applying suggestion:', error);
      toast.error('Failed to apply suggestion');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Session Not Found</h3>
          <p className="text-muted-foreground mb-6">This session doesn't exist or you don't have access.</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{sessionData.session_name}</h1>
              <p className="text-muted-foreground">
                Host: {sessionData.host?.full_name || 'Unknown'}
              </p>
            </div>
          </div>
          <Badge className="bg-success animate-pulse">
            <span className="w-2 h-2 bg-white rounded-full mr-2 animate-ping" />
            Live Session
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Copilot Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                <div className="p-6 border-b border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">AI Mixing Copilot</h3>
                      <p className="text-sm text-muted-foreground">Real-time suggestions to enhance your mix</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                  {aiSuggestions.length === 0 ? (
                    <div className="text-center py-8">
                      <Zap className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No AI suggestions yet</p>
                      <p className="text-sm text-muted-foreground">Upload audio to get intelligent mixing advice</p>
                    </div>
                  ) : (
                    aiSuggestions.map((suggestion, index) => (
                      <motion.div
                        key={suggestion.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className={`p-4 ${suggestion.applied ? 'bg-success/5 border-success/20' : ''}`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={suggestion.applied ? "default" : "outline"}>
                                {suggestion.suggestion_type}
                              </Badge>
                              {suggestion.confidence_score && (
                                <span className="text-xs text-muted-foreground">
                                  {Math.round(suggestion.confidence_score * 100)}% confidence
                                </span>
                              )}
                            </div>
                            {suggestion.applied && (
                              <Badge className="bg-success">Applied</Badge>
                            )}
                          </div>
                          <h4 className="font-semibold mb-1">{suggestion.suggestion_title}</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {suggestion.suggestion_description}
                          </p>
                          {!suggestion.applied && (
                            <Button
                              size="sm"
                              onClick={() => applySuggestion(suggestion.id)}
                              className="w-full"
                            >
                              <Zap className="w-4 h-4 mr-2" />
                              Apply Suggestion
                            </Button>
                          )}
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Session Workspace */}
            <Card>
              <Tabs defaultValue="mix" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="mix">Mix Console</TabsTrigger>
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                </TabsList>
                <TabsContent value="mix" className="p-6">
                  <div className="text-center py-12">
                    <Volume2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Mix Console</h3>
                    <p className="text-muted-foreground">Real-time mixing workspace coming soon</p>
                  </div>
                </TabsContent>
                <TabsContent value="chat" className="p-6">
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Session Chat</h3>
                    <p className="text-muted-foreground">Collaborate in real-time with your team</p>
                  </div>
                </TabsContent>
                <TabsContent value="files" className="p-6">
                  <div className="text-center py-12">
                    <FileAudio className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Session Files</h3>
                    <p className="text-muted-foreground">Access all session audio files here</p>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Session Stats */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Session Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="font-medium">2h 15m</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Participants</span>
                  <span className="font-medium">{sessionData.participants?.length || 0}</span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Audio
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Open Chat
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};