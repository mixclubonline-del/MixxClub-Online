import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  Zap, 
  Target,
  BarChart3,
  Waves,
  Music,
  Award,
  Play,
  Pause,
  Brain,
  Headphones,
  TrendingUp,
  Lock,
  ArrowDown,
  CheckCircle,
  Volume2,
  Settings
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { MasteringPaywall } from "@/components/mastering/MasteringPaywall";
import { MasteringChatbot } from "@/components/MasteringChatbot";
import { useMasteringAccess } from "@/hooks/useMasteringAccess";
import { useAuth } from "@/hooks/useAuth";

const MasteringShowcase = () => {
  const [activeDemo, setActiveDemo] = useState(0);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { hasAccess, loading, subscription, refreshAccess } = useMasteringAccess();

  useEffect(() => {
    // Handle successful payment
    const success = searchParams.get('success');
    if (success === 'true') {
      toast.success('Payment successful! Welcome to MixClub AI Mastering!');
      refreshAccess();
    }
    
    // Handle cancelled payment
    const cancelled = searchParams.get('canceled');
    if (cancelled === 'true') {
      toast.info('Payment was cancelled. You can try again anytime.');
    }
  }, [searchParams, refreshAccess]);

  const demoSteps = [
    {
      title: "AI Analysis Begins",
      description: "Our neural network analyzes your track's frequency spectrum, dynamics, and stereo field",
      icon: <Brain className="w-6 h-6" />,
      active: true
    },
    {
      title: "Platform Optimization",
      description: "Automatically optimizes for Spotify, Apple Music, YouTube, and other streaming platforms",
      icon: <Target className="w-6 h-6" />,
      active: false
    },
    {
      title: "Professional Processing",
      description: "Applies industry-standard EQ, compression, limiting, and stereo enhancement",
      icon: <Settings className="w-6 h-6" />,
      active: false
    },
    {
      title: "Final Master Ready",
      description: "Your track is now mastered to professional standards and ready for release",
      icon: <Award className="w-6 h-6" />,
      active: false
    }
  ];

  const features = [
    {
      title: "AI Neural Networks",
      description: "Trained on 100,000+ Grammy-winning masters across all genres",
      icon: <Brain className="w-8 h-8" />,
      color: "bg-purple-500/10 text-purple-500",
      details: [
        "Deep learning models trained on professional masters",
        "Genre-specific processing algorithms",
        "Real-time spectral analysis and correction"
      ]
    },
    {
      title: "Instant Processing",
      description: "Get professional masters in under 30 seconds, not hours",
      icon: <Zap className="w-8 h-8" />,
      color: "bg-yellow-500/10 text-yellow-500",
      details: [
        "Cloud-based processing power",
        "No queue times or delays",
        "Instant A/B comparisons available"
      ]
    },
    {
      title: "Platform Optimization", 
      description: "Automatically optimized for every major streaming platform",
      icon: <Target className="w-8 h-8" />,
      color: "bg-blue-500/10 text-blue-500",
      details: [
        "Spotify (-14 LUFS) optimization",
        "Apple Music Hi-Res ready",
        "YouTube and TikTok compatible"
      ]
    },
    {
      title: "Professional Quality",
      description: "Meet industry standards with every master",
      icon: <Award className="w-8 h-8" />,
      color: "bg-green-500/10 text-green-500",
      details: [
        "True Peak limiting to -1dBFS",
        "Optimal dynamic range preservation",
        "Professional loudness standards"
      ]
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % demoSteps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-purple/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container px-6 relative">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <Badge variant="secondary" className="mb-4">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI-Powered Mastering
                  </Badge>
                  <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                    Master Your Music with AI
                  </h1>
                  <p className="text-xl text-muted-foreground mb-8 max-w-lg">
                    Get Grammy-quality masters instantly with our revolutionary AI technology. 
                    Trained on thousands of professional masters, optimized for every platform.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <Link to={hasAccess ? "/mastering-studio" : "#packages"}>
                      <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90">
                        <Play className="w-5 h-5" />
                        {hasAccess ? "Go to Studio" : "Try Free Demo"}
                      </Button>
                    </Link>
                    <Button variant="outline" size="lg" className="gap-2">
                      <Volume2 className="w-5 h-5" />
                      Listen to Examples
                    </Button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border/50">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">100K+</div>
                      <div className="text-sm text-muted-foreground">Training Tracks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">&lt;30s</div>
                      <div className="text-sm text-muted-foreground">Processing Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">Pro</div>
                      <div className="text-sm text-muted-foreground">Quality</div>
                    </div>
                  </div>
                </div>

                {/* Interactive Demo */}
                <div className="relative">
                  <Card className="bg-gradient-to-br from-background/50 to-primary/5 backdrop-blur border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Waves className="w-5 h-5 text-primary" />
                        AI Mastering Process
                      </CardTitle>
                      <CardDescription>
                        Watch how our AI transforms your audio in real-time
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {demoSteps.map((step, index) => (
                        <div 
                          key={index}
                          className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-500 ${
                            activeDemo === index 
                              ? 'bg-primary/10 border border-primary/20 scale-105' 
                              : 'bg-muted/30'
                          }`}
                        >
                          <div className={`p-2 rounded-lg transition-colors ${
                            activeDemo === index ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          }`}>
                            {step.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{step.title}</h4>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                          </div>
                          {activeDemo === index && (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">How Our AI Mastering Works</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Revolutionary technology that delivers professional mastering results instantly
              </p>
            </div>

            <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                  <CardContent className="pt-6">
                    <div className={`w-16 h-16 rounded-xl ${feature.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-center">{feature.title}</h3>
                    <p className="text-muted-foreground mb-4 text-center">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive AI Assistant */}
        <section className="py-20 bg-gradient-to-br from-muted/30 to-primary/5">
          <div className="container px-6">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Brain className="w-4 h-4 mr-2" />
                Try Our AI Assistant
              </Badge>
              <h2 className="text-4xl font-bold mb-4">Experience AI Mastering Now</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Upload a track and get instant professional feedback plus a before/after comparison. 
                See the power of our AI mastering technology in action.
              </p>
            </div>

            <MasteringChatbot />

            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground mb-4">
                Want to access the full mastering suite? Choose your plan below.
              </p>
              <ArrowDown className="w-6 h-6 text-primary mx-auto animate-bounce" />
            </div>
          </div>
        </section>

        {/* Packages Section */}
        <section className="py-20" id="packages">
          <div className="container px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Choose Your Mastering Plan</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Professional AI mastering for every artist, from bedroom producers to major labels
              </p>
            </div>

            {!user ? (
              <div className="text-center py-20">
                <Lock className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
                <h3 className="text-2xl font-bold mb-4">Sign In Required</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Please sign in to view our mastering packages and start creating professional masters.
                </p>
                <Link to="/auth">
                  <Button size="lg" className="gap-2">
                    <Headphones className="w-5 h-5" />
                    Sign In to Continue
                  </Button>
                </Link>
              </div>
            ) : (
              <MasteringPaywall onAccessGranted={refreshAccess} />
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10">
          <div className="container px-6">
            <Card className="max-w-4xl mx-auto text-center bg-gradient-to-br from-background/90 to-primary/5 backdrop-blur border-primary/20">
              <CardContent className="pt-8 pb-8">
                <h2 className="text-3xl font-bold mb-4">Ready to Master Your Music?</h2>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">
                  Join thousands of artists who trust our AI mastering technology. 
                  Get professional results instantly, every time.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/auth?mode=signup">
                    <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90">
                      <Sparkles className="w-5 h-5" />
                      Start Free Trial
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="gap-2">
                    <Music className="w-5 h-5" />
                    Listen to Examples
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MasteringShowcase;