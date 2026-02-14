import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Helmet } from 'react-helmet-async';
import { Plug, Cloud, Workflow, Zap, Bell, Sparkles, ArrowLeft } from 'lucide-react';


export default function Integrations() {
  return (
    <>
      <Helmet>
        <title>Integrations | Mixx Club</title>
        <meta name="description" content="Connect Mixx Club with your favorite tools - DAWs, cloud storage, streaming platforms, and more." />
      </Helmet>

      <div className="min-h-screen bg-background">
        
        <main className="container max-w-4xl mx-auto px-4 py-6">
          {/* Back Link */}
          <Link 
            to="/settings" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Settings
          </Link>

          {/* Coming Soon Card */}
          <Card className="p-8 md:p-12 text-center bg-gradient-to-br from-blue-500/5 via-background to-purple-500/5 border-blue-500/20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Plug className="w-10 h-10 text-white" />
            </div>

            <Badge variant="secondary" className="mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Phase 3 Feature
            </Badge>

            <h1 className="text-3xl font-bold mb-4">Integrations Coming Soon</h1>
            
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Connect your workflow with popular DAWs, cloud storage services, 
              streaming platforms, and collaboration tools for seamless audio production.
            </p>

            {/* Feature Preview */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
              <div className="p-4 rounded-lg bg-background/50 border border-border">
                <Cloud className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <p className="text-sm font-medium">Cloud Storage</p>
                <p className="text-xs text-muted-foreground">Dropbox, Google Drive</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border">
                <Workflow className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                <p className="text-sm font-medium">DAW Plugins</p>
                <p className="text-xs text-muted-foreground">Pro Tools, Logic, Ableton</p>
              </div>
              <div className="p-4 rounded-lg bg-background/50 border border-border">
                <Zap className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                <p className="text-sm font-medium">Streaming</p>
                <p className="text-xs text-muted-foreground">Spotify, Apple Music</p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/services/distribution">
                  Explore Distribution
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
}
