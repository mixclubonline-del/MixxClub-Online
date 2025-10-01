import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  Volume2, 
  TrendingUp, 
  Zap, 
  Target,
  Sparkles,
  Download,
  Upload,
  BarChart3,
  Waves,
  Music,
  Award,
  Lock
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { MasteringPaywall } from "@/components/mastering/MasteringPaywall";
import { useMasteringAccess } from "@/hooks/useMasteringAccess";
import { useAuth } from "@/hooks/useAuth";

const Mastering = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("spotify");
  const [masteringProgress, setMasteringProgress] = useState(0);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { hasAccess, loading, subscription, refreshAccess } = useMasteringAccess();

  useEffect(() => {
    // Handle successful payment
    const success = searchParams.get('success');
    if (success === 'true') {
      toast.success('Payment successful! Welcome to MixClub Mastering!');
      refreshAccess();
    }
    
    // Handle cancelled payment
    const cancelled = searchParams.get('canceled');
    if (cancelled === 'true') {
      toast.info('Payment was cancelled. You can try again anytime.');
    }
  }, [searchParams, refreshAccess]);

  const platforms = [
    { id: "spotify", name: "Spotify", lufs: "-14 LUFS", description: "Optimized for streaming" },
    { id: "apple", name: "Apple Music", lufs: "-16 LUFS", description: "Hi-res audio ready" },
    { id: "youtube", name: "YouTube", lufs: "-13 LUFS", description: "Video platform optimized" },
    { id: "soundcloud", name: "SoundCloud", lufs: "-12 LUFS", description: "Independent artist focus" },
    { id: "tidal", name: "TIDAL", lufs: "-14 LUFS", description: "HiFi & MQA compatible" },
    { id: "cd", name: "CD Master", lufs: "-9 LUFS", description: "Physical release standard" }
  ];

  const features = [
    {
      title: "AI-Powered Mastering",
      description: "Neural networks trained on Grammy-winning masters",
      icon: <Sparkles className="w-6 h-6" />,
      color: "bg-primary/10 text-primary"
    },
    {
      title: "Platform Optimization",
      description: "Automatically optimize for Spotify, Apple Music, and more",
      icon: <Target className="w-6 h-6" />,
      color: "bg-blue-500/10 text-blue-500"
    },
    {
      title: "Real-Time Analysis",
      description: "Advanced spectral analysis and loudness monitoring",
      icon: <BarChart3 className="w-6 h-6" />,
      color: "bg-green-500/10 text-green-500"
    },
    {
      title: "Industry Standards",
      description: "Meet all modern loudness and quality standards",
      icon: <Award className="w-6 h-6" />,
      color: "bg-purple-500/10 text-purple-500"
    }
  ];

  const analysisData = [
    { label: "Dynamic Range", value: "12.3 LU", status: "good" },
    { label: "Peak Level", value: "-0.1 dBFS", status: "optimal" },
    { label: "RMS Level", value: "-12.5 dBFS", status: "good" },
    { label: "Stereo Width", value: "85%", status: "optimal" },
    { label: "Phase Correlation", value: "+0.92", status: "good" },
    { label: "THD+N", value: "0.003%", status: "optimal" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "optimal": return "text-green-500";
      case "good": return "text-blue-500";
      case "warning": return "text-yellow-500";
      default: return "text-muted-foreground";
    }
  };

  const handleStartMastering = () => {
    if (!hasAccess) {
      toast.error('Please purchase a mastering package to start mastering');
      return;
    }

    setIsProcessing(true);
    setMasteringProgress(0);
    
    const interval = setInterval(() => {
      setMasteringProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          toast.success('Mastering complete! Track processed successfully.');
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading mastering access...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show paywall if user doesn't have access
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-12">
          <div className="container px-6 text-center py-20">
            <Lock className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Please sign in to access our professional mastering suite.
            </p>
            <Link to="/auth">
              <Button size="lg">
                Sign In to Continue
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20">
          <MasteringPaywall onAccessGranted={refreshAccess} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="container px-6">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-4">
                <TrendingUp className="w-4 h-4 mr-2" />
                AI Neural Mastering
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Master with AI Precision
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Get Grammy-quality masters instantly with our AI engine trained on thousands 
                of reference tracks across all genres and platforms.
              </p>
              
              {/* Subscription Status */}
              {subscription && (
                <Card className="max-w-md mx-auto mb-8 bg-primary/5 border-primary/20">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <Badge className="mb-2">{subscription.mastering_packages.name} Plan</Badge>
                      <p className="text-sm text-muted-foreground">
                        {subscription.mastering_packages.track_limit === -1 
                          ? 'Unlimited tracks' 
                          : `${subscription.tracks_used}/${subscription.mastering_packages.track_limit} tracks used`
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="gap-2" onClick={handleStartMastering}>
                  <Zap className="w-5 h-5" />
                  Start Mastering
                </Button>
                <Link to="/artist-crm">
                  <Button variant="outline" size="lg" className="gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Track
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20">
          <div className="container px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Mastering Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Professional mastering tools powered by artificial intelligence
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {features.map((feature, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mx-auto mb-4`}>
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Mastering Interface */}
        <section className="py-20 bg-muted/30">
          <div className="container px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Professional Mastering Suite</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                AI-powered mastering with platform-specific optimization
              </p>
            </div>
            
            <Tabs defaultValue="platforms" className="w-full">
              <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
                <TabsTrigger value="platforms">Platforms</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="processing">Processing</TabsTrigger>
              </TabsList>

              <TabsContent value="platforms" className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
                  {platforms.map((platform) => (
                    <Card 
                      key={platform.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedPlatform === platform.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedPlatform(platform.id)}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{platform.name}</CardTitle>
                          <Badge variant="secondary">{platform.lufs}</Badge>
                        </div>
                        <CardDescription>{platform.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          variant={selectedPlatform === platform.id ? "default" : "outline"} 
                          className="w-full"
                        >
                          {selectedPlatform === platform.id ? "Selected" : "Optimize For"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-6">
                <div className="max-w-4xl mx-auto">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Audio Analysis
                      </CardTitle>
                      <CardDescription>
                        Real-time analysis of your track's technical characteristics
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {analysisData.map((item, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">{item.label}</span>
                              <span className={`text-sm font-mono ${getStatusColor(item.status)}`}>
                                {item.value}
                              </span>
                            </div>
                            <Progress 
                              value={Math.random() * 100} 
                              className="h-2"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="processing" className="space-y-6">
                <div className="max-w-2xl mx-auto">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Waves className="w-5 h-5" />
                        AI Mastering Engine
                      </CardTitle>
                      <CardDescription>
                        Neural processing with real-time preview
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {isProcessing && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Processing...</span>
                            <span>{masteringProgress}%</span>
                          </div>
                          <Progress value={masteringProgress} className="h-2" />
                        </div>
                      )}
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Loudness Target</label>
                          <Slider defaultValue={[-14]} min={-23} max={-6} step={0.1} />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>-23 LUFS</span>
                            <span>-6 LUFS</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-2 block">Dynamic Range</label>
                          <Slider defaultValue={[12]} min={6} max={20} step={0.1} />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>6 LU</span>
                            <span>20 LU</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-2 block">Stereo Enhancement</label>
                          <Slider defaultValue={[85]} min={0} max={100} step={1} />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>Mono</span>
                            <span>Wide</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button 
                          className="flex-1 gap-2" 
                          onClick={handleStartMastering}
                          disabled={isProcessing}
                        >
                          <Music className="w-4 h-4" />
                          {isProcessing ? "Processing..." : "Master Track"}
                        </Button>
                        <Button variant="outline" className="gap-2">
                          <Play className="w-4 h-4" />
                          Preview
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container px-6">
            <Card className="max-w-4xl mx-auto text-center">
              <CardContent className="pt-6">
                <h2 className="text-3xl font-bold mb-4">Master Your Sound</h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Join the AI mastering revolution. Get professional results in seconds, 
                  not hours. Trusted by top artists and labels worldwide.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/auth?mode=signup">
                    <Button size="lg" className="gap-2">
                      <Sparkles className="w-5 h-5" />
                      Try Free Master
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="gap-2" onClick={() => {
                    toast.info("Sample download will be available soon!");
                  }}>
                    <Download className="w-5 h-5" />
                    Download Sample
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

export default Mastering;