import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Play, Users, Hash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import SessionCreationWizard from './SessionCreationWizard';

export const SessionManager = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessionCode, setSessionCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  const handleCreateSession = async (sessionData: any) => {
    try {
      const { data: session, error } = await supabase
        .from('collaboration_sessions')
        .insert({
          host_user_id: user?.id,
          session_name: sessionData.name,
          session_type: sessionData.type,
          status: 'active',
          audio_quality: sessionData.audioQuality,
          max_participants: sessionData.maxParticipants,
          session_state: {
            description: sessionData.description,
            genre: sessionData.genre
          }
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Session created successfully!");
      navigate(`/session/${session.id}`);
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error("Failed to create session");
    }
  };

  const handleJoinSession = async () => {
    if (!sessionCode.trim()) {
      toast.error("Please enter a session code");
      return;
    }

    setIsJoining(true);
    try {
      // Try to find session by ID
      const { data: session, error } = await supabase
        .from('collaboration_sessions')
        .select('*')
        .eq('id', sessionCode)
        .eq('status', 'active')
        .single();

      if (error) throw error;

      // Add participant
      await supabase
        .from('session_participants')
        .insert({
          session_id: session.id,
          user_id: user?.id,
          is_active: true
        });

      toast.success("Joined session successfully!");
      navigate(`/session/${session.id}`);
    } catch (error) {
      console.error('Error joining session:', error);
      toast.error("Session not found or inactive");
    } finally {
      setIsJoining(false);
    }
  };

  if (showWizard) {
    return (
      <SessionCreationWizard
        onComplete={handleCreateSession}
        onCancel={() => setShowWizard(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent-cyan to-accent-blue bg-clip-text text-transparent">
            Session Manager
          </h1>
          <p className="text-muted-foreground">Create or join a collaboration session</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Session */}
          <Card className="bloom-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                Create New Session
              </CardTitle>
              <CardDescription>
                Start a new collaboration workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => setShowWizard(true)}
                className="w-full"
              >
                Create Session
              </Button>
            </CardContent>
          </Card>

          {/* Join Session */}
          <Card className="bloom-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent-cyan" />
                Join Session
              </CardTitle>
              <CardDescription>
                Enter a session code to join
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session-code">Session Code</Label>
                <Input
                  id="session-code"
                  placeholder="Enter session ID"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinSession()}
                />
              </div>
              <Button
                onClick={handleJoinSession}
                disabled={isJoining}
                className="w-full"
                variant="secondary"
              >
                {isJoining ? "Joining..." : "Join Session"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Help Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Hash className="w-5 h-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium">How to share a session</p>
                <p className="text-sm text-muted-foreground">
                  After creating a session, copy the session ID from the URL and share it with collaborators.
                  They can paste it in the "Join Session" field to connect.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
