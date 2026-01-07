import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Helmet } from 'react-helmet-async';
import { Headphones, Users, AudioWaveform, Video, Bell, Sparkles, ArrowLeft } from 'lucide-react';
import Navigation from '@/components/Navigation';

export const SessionWorkspacePage = () => {
  const { sessionId } = useParams();

  return (
    <>
      <Helmet>
        <title>Session Workspace | Mixx Club</title>
        <meta name="description" content="Real-time collaborative audio workspace for mixing sessions with live streaming and chat." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="container max-w-4xl mx-auto px-4 pt-24 pb-16">
          {/* Back Link */}
          <Link 
            to="/sessions" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sessions
          </Link>

          {/* Coming Soon Card */}
          <Card className="p-8 md:p-12 text-center bg-gradient-to-br from-cyan-500/5 via-background to-primary/5 border-cyan-500/20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500 to-primary flex items-center justify-center">
              <Headphones className="w-10 h-10 text-white" />
            </div>

            <Badge variant="secondary" className="mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Phase 3 Feature
            </Badge>

            <h1 className="text-3xl font-bold mb-4">Session Workspace Coming Soon</h1>
            
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              A real-time collaborative workspace where artists and engineers can work 
              together on mixes with live audio streaming, timestamped comments, and video chat.
            </p>

            {/* Feature Preview */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
              <div className="p-4 rounded-lg bg-background/50 border border-border">
                <AudioWaveform className="w-6 h-6 mx-auto mb-2 text-cyan-500" />
                <p className="text-sm font-medium">Live Waveforms</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border">
                <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Real-time Collab</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border">
                <Video className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <p className="text-sm font-medium">Video Chat</p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/sessions">
                  Browse Sessions
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/coming-soon">
                  <Bell className="w-4 h-4 mr-2" />
                  Get Notified
                </Link>
              </Button>
            </div>
          </Card>
        </main>
      </div>
    </>
  );
};
