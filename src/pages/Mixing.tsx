import React, { useState, useEffect } from "react";
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
  Headphones, 
  Sliders, 
  Waves,
  Sparkles,
  Users,
  Download,
  Upload,
  Settings,
  LogIn
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { AdvancedMixingStudio } from "@/components/mixing/AdvancedMixingStudio";
import { AIAudioProcessor } from "@/components/mixing/AIAudioProcessor";
import { MixingPaywall } from "@/components/mixing/MixingPaywall";
import { useMixingAccess } from "@/hooks/useMixingAccess";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Mixing = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("studio-standard");
  const { user } = useAuth();
  const { hasAccess, loading, refreshAccess } = useMixingAccess();

  useEffect(() => {
    // Check for Stripe success/cancel parameters
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');

    if (success === 'true') {
      toast.success('Payment successful! Your mixing package is now active.');
      refreshAccess();
      // Clean up URL
      window.history.replaceState({}, document.title, '/mixing');
    } else if (canceled === 'true') {
      toast.error('Payment was canceled.');
      // Clean up URL
      window.history.replaceState({}, document.title, '/mixing');
    }
  }, [refreshAccess]);

  const mixingPresets = [
    { id: "studio-standard", name: "Studio Standard", description: "Balanced mix for all genres" },
    { id: "hip-hop", name: "Hip-Hop", description: "Punchy drums and bass-forward" },
    { id: "rock", name: "Rock", description: "Wide stereo guitars, powerful drums" },
    { id: "electronic", name: "Electronic", description: "Crystal clear highs, tight low-end" },
    { id: "acoustic", name: "Acoustic", description: "Natural, warm, intimate sound" },
    { id: "podcast", name: "Podcast", description: "Clear vocals, noise reduction" }
  ];

  const features = [
    {
      title: "AI-Powered Mixing",
      description: "Let our AI analyze your tracks and suggest optimal mix settings",
      icon: <Sparkles className="w-6 h-6" />,
      color: "bg-primary/10 text-primary"
    },
    {
      title: "Real-Time Collaboration",
      description: "Mix with your team in real-time, anywhere in the world",
      icon: <Users className="w-6 h-6" />,
      color: "bg-blue-500/10 text-blue-500"
    },
    {
      title: "Professional Templates",
      description: "Start with industry-standard mixing templates",
      icon: <Settings className="w-6 h-6" />,
      color: "bg-green-500/10 text-green-500"
    },
    {
      title: "Advanced Processing",
      description: "High-quality effects and processors for professional results",
      icon: <Sliders className="w-6 h-6" />,
      color: "bg-purple-500/10 text-purple-500"
    }
  ];

  // Show sign-in prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <LogIn className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to access our professional mixing services.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.location.href = '/auth'}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show paywall if user doesn't have access
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <MixingPaywall onPurchaseComplete={refreshAccess} />
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
                <Waves className="w-4 h-4 mr-2" />
                Professional Mixing Studio
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Mix Like a Pro
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Create professional-quality mixes with our AI-powered mixing studio. 
                Collaborate in real-time and access industry-standard tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/artist-crm">
                  <Button size="lg" className="gap-2">
                    <Play className="w-5 h-5" />
                    Start Mixing
                  </Button>
                </Link>
                <Link to="/artist-crm">
                  <Button variant="outline" size="lg" className="gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Tracks
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
              <h2 className="text-3xl font-bold mb-4">Mixing Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to create professional mixes
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

        {/* Mixing Studio */}
        <section className="py-20 bg-muted/30">
          <div className="container px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Professional Mixing Console</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Full-featured mixing board with AI assistance and real-time collaboration
              </p>
            </div>
            
            <Tabs defaultValue="mixer" className="w-full">
              <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
                <TabsTrigger value="mixer">Mixer</TabsTrigger>
                <TabsTrigger value="ai-tools">AI Tools</TabsTrigger>
                <TabsTrigger value="presets">Presets</TabsTrigger>
              </TabsList>

              <TabsContent value="mixer" className="space-y-6">
                <AdvancedMixingStudio />
              </TabsContent>

              <TabsContent value="ai-tools" className="space-y-6">
                <AIAudioProcessor />
              </TabsContent>

              <TabsContent value="presets" className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mixingPresets.map((preset) => (
                    <Card 
                      key={preset.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedPreset === preset.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedPreset(preset.id)}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">{preset.name}</CardTitle>
                        <CardDescription>{preset.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          variant={selectedPreset === preset.id ? "default" : "outline"} 
                          className="w-full"
                        >
                          {selectedPreset === preset.id ? "Selected" : "Apply Preset"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
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
                <h2 className="text-3xl font-bold mb-4">Ready to Mix?</h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Join thousands of producers and engineers who trust our platform for professional mixing.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/auth?mode=signup">
                    <Button size="lg" className="gap-2">
                      <Headphones className="w-5 h-5" />
                      Start Free Trial
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="gap-2" onClick={() => {
                    toast.info("Demo download will be available soon!");
                  }}>
                    <Download className="w-5 h-5" />
                    Download Demo
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

export default Mixing;