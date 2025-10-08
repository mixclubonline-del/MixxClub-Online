import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Music2, Wand2, Zap, ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const AIStudio = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="glass border-b border-border/50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4" variant="outline">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered Audio Tools
            </Badge>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Studio
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Professional-grade AI tools integrated directly into your DAW workflow
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/hybrid-daw')}
                className="gap-2"
              >
                <Music2 className="w-5 h-5" />
                {user ? 'Go to Studio' : 'Get Started'}
                <ArrowRight className="w-4 h-4" />
              </Button>
              {!user && (
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/auth')}
                >
                  Sign Up Free
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">AI Tools Available</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Stem Separation Card */}
            <Card className="glass p-8 hover:shadow-glass-lg transition-all">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <Wand2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Stem Separation</h3>
                  <Badge variant="secondary" className="mb-4">Available Now</Badge>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6">
                Separate any audio file into individual stems using advanced BS-RoFormer AI technology. 
                Extract vocals, drums, bass, and more from any mix.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>4-stem separation (Free tier available)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>9-stem professional separation (Credit-based)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Automatic track import into DAW</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>High-quality audio output</span>
                </div>
              </div>

              <div className="glass-hover p-4 rounded-lg border border-border/50">
                <div className="text-sm font-semibold mb-2">How to Access:</div>
                <p className="text-sm text-muted-foreground">
                  Open the DAW and click the "SEPARATE STEMS" button in the toolbar. 
                  Upload your audio, process it, and the stems will automatically appear as tracks.
                </p>
              </div>
            </Card>

            {/* Coming Soon Card */}
            <Card className="glass p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-50" />
              <div className="relative">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-muted border border-border">
                    <Zap className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">More AI Tools</h3>
                    <Badge variant="outline" className="mb-4">Coming Soon</Badge>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-6">
                  We're constantly developing new AI-powered tools to enhance your music production workflow.
                </p>
                
                <div className="space-y-3 mb-6 opacity-60">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4" />
                    <span>AI Mastering Assistant</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4" />
                    <span>Intelligent Mix Suggestions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4" />
                    <span>Vocal Pitch Correction</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4" />
                    <span>Audio Enhancement & Restoration</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground italic">
                  Stay tuned for updates as we roll out new features!
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="glass border-t border-border/50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="glass-hover p-8">
                <h3 className="text-xl font-bold mb-2">Free Tier</h3>
                <div className="text-4xl font-bold mb-4">$0</div>
                <p className="text-muted-foreground mb-6">
                  Perfect for trying out stem separation
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">1 free 4-stem separation per day</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">Basic quality output</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">Automatic DAW integration</span>
                  </li>
                </ul>
              </Card>

              <Card className="glass-hover p-8 border-primary/50">
                <Badge className="mb-2">Pro</Badge>
                <h3 className="text-xl font-bold mb-2">Credit-Based</h3>
                <div className="text-4xl font-bold mb-4">Pay as you go</div>
                <p className="text-muted-foreground mb-6">
                  Professional 9-stem separation with credits
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">9-stem professional separation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">Highest quality output</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">No daily limits</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">Priority processing</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <Card className="glass-hover p-12 text-center max-w-3xl mx-auto">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h2 className="text-3xl font-bold mb-4">Ready to Experience AI-Powered Audio?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start separating stems and enhancing your workflow today
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/hybrid-daw')}
            className="gap-2"
          >
            <Music2 className="w-5 h-5" />
            Open Studio
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default AIStudio;
