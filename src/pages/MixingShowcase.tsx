import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Zap, 
  Sliders,
  Headphones,
  Mic,
  Music,
  Settings,
  Play,
  Brain,
  TrendingUp,
  Lock,
  ArrowDown,
  CheckCircle,
  Volume2,
  UserCheck,
  MessageSquare,
  Share2,
  GitBranch
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { MixingPackages } from "@/components/mixing/MixingPackages";
import { useAuth } from "@/hooks/useAuth";

const MixingShowcase = () => {
  const [activeDemo, setActiveDemo] = useState(0);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    // Handle successful payment
    const success = searchParams.get('success');
    if (success === 'true') {
      toast.success('Payment successful! Welcome to MixClub Professional Mixing!');
    }
    
    // Handle cancelled payment
    const cancelled = searchParams.get('canceled');
    if (cancelled === 'true') {
      toast.info('Payment was cancelled. You can try again anytime.');
    }
  }, [searchParams]);

  const collaborationSteps = [
    {
      title: "Artist Uploads",
      description: "Artist uploads stems and shares vision with mixing engineer",
      icon: <Music className="w-6 h-6" />,
      role: "Artist",
      color: "bg-blue-500"
    },
    {
      title: "AI Analysis",
      description: "AI analyzes tracks and suggests optimal mixing approach",
      icon: <Brain className="w-6 h-6" />,
      role: "AI",
      color: "bg-purple-500"
    },
    {
      title: "Engineer Mixes",
      description: "Professional engineer creates the mix using AI insights",
      icon: <Sliders className="w-6 h-6" />,
      role: "Engineer",
      color: "bg-green-500"
    },
    {
      title: "Real-time Feedback",
      description: "Artist and engineer collaborate with instant communication",
      icon: <MessageSquare className="w-6 h-6" />,
      role: "Collaboration",
      color: "bg-orange-500"
    }
  ];

  const features = [
    {
      title: "Three-Way Collaboration",
      description: "Artist, Engineer, and AI working together for the perfect mix",
      icon: <Users className="w-8 h-8" />,
      color: "bg-blue-500/10 text-blue-500",
      details: [
        "Real-time communication between all parties",
        "Shared workspace with version control",
        "AI provides intelligent suggestions throughout"
      ]
    },
    {
      title: "AI-Powered Insights",
      description: "Machine learning that enhances human creativity",
      icon: <Brain className="w-8 h-8" />,
      color: "bg-purple-500/10 text-purple-500",
      details: [
        "Automatic stem separation and analysis",
        "Genre-specific mixing suggestions",
        "Real-time frequency and dynamic analysis"
      ]
    },
    {
      title: "Professional Engineers", 
      description: "Vetted professionals with proven track records",
      icon: <UserCheck className="w-8 h-8" />,
      color: "bg-green-500/10 text-green-500",
      details: [
        "Industry-certified mixing engineers",
        "Specialized in multiple genres",
        "Portfolio of successful releases"
      ]
    },
    {
      title: "Real-Time Studio",
      description: "Virtual mixing studio with professional tools",
      icon: <Headphones className="w-8 h-8" />,
      color: "bg-orange-500/10 text-orange-500",
      details: [
        "Cloud-based mixing console",
        "Professional plugins and effects",
        "Instant preview and sharing"
      ]
    }
  ];

  const processFlow = [
    {
      step: 1,
      title: "Project Setup",
      description: "Artist creates project and uploads stems",
      icon: <Music className="w-5 h-5" />
    },
    {
      step: 2,
      title: "Engineer Matching",
      description: "AI matches you with the perfect engineer",
      icon: <UserCheck className="w-5 h-5" />
    },
    {
      step: 3,
      title: "AI Analysis",
      description: "Tracks are analyzed for optimal mixing approach",
      icon: <Brain className="w-5 h-5" />
    },
    {
      step: 4,
      title: "Collaborative Mixing",
      description: "Real-time mixing with feedback and revisions",
      icon: <Sliders className="w-5 h-5" />
    },
    {
      step: 5,
      title: "Final Delivery",
      description: "Professional mix delivered in all formats",
      icon: <Share2 className="w-5 h-5" />
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % collaborationSteps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);


  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-blue-500/10 via-background to-green-500/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container px-6 relative">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <Badge variant="secondary" className="mb-4">
                    <Users className="w-4 h-4 mr-2" />
                    Collaborative Mixing
                  </Badge>
                  <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-500 via-green-500 to-blue-500 bg-clip-text text-transparent">
                    The Future of Mixing
                  </h1>
                  <p className="text-xl text-muted-foreground mb-8 max-w-lg">
                    Where artist vision meets engineering expertise, enhanced by AI intelligence. 
                    Experience collaborative mixing that delivers professional results every time.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <Button 
                      size="lg" 
                      className="gap-2 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-500/90 hover:to-green-500/90"
                      onClick={() => document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      <Play className="w-5 h-5" />
                      View Packages
                    </Button>
                    <Button variant="outline" size="lg" className="gap-2">
                      <Volume2 className="w-5 h-5" />
                      Hear Examples
                    </Button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border/50">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">500+</div>
                      <div className="text-sm text-muted-foreground">Pro Engineers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">24/7</div>
                      <div className="text-sm text-muted-foreground">Collaboration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-500">AI</div>
                      <div className="text-sm text-muted-foreground">Enhanced</div>
                    </div>
                  </div>
                </div>

                {/* Interactive Collaboration Demo */}
                <div className="relative">
                  <Card className="bg-gradient-to-br from-background/50 to-blue-500/5 backdrop-blur border-blue-500/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GitBranch className="w-5 h-5 text-blue-500" />
                        Collaborative Workflow
                      </CardTitle>
                      <CardDescription>
                        Watch how artists, engineers, and AI work together
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {collaborationSteps.map((step, index) => (
                        <div 
                          key={index}
                          className={`flex items-start gap-3 p-4 rounded-lg transition-all duration-500 ${
                            activeDemo === index 
                              ? 'bg-blue-500/10 border border-blue-500/20 scale-105' 
                              : 'bg-muted/30'
                          }`}
                        >
                          <div className={`p-2 rounded-lg text-white transition-all duration-500 ${
                            activeDemo === index ? step.color : 'bg-muted'
                          }`}>
                            {step.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{step.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {step.role}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                          </div>
                          {activeDemo === index && (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
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

        {/* How Our Process Works */}
        <section className="py-20">
          <div className="container px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">How Our Unique Process Works</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Revolutionary three-way collaboration between artist vision, engineering expertise, and AI intelligence
              </p>
            </div>

            <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-8 mb-16">
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

            {/* Process Flow */}
            <div className="max-w-4xl mx-auto">
              <Card className="bg-gradient-to-br from-muted/30 to-blue-500/5">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Step-by-Step Process</CardTitle>
                  <CardDescription>From upload to professional mix delivery</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-5 gap-4">
                    {processFlow.map((item, index) => (
                      <div key={index} className="text-center group">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                          {item.icon}
                        </div>
                        <div className="text-sm font-medium mb-1">Step {item.step}</div>
                        <div className="text-xs font-semibold mb-2">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                        {index < processFlow.length - 1 && (
                          <div className="hidden md:block absolute top-6 left-full w-full h-0.5 bg-gradient-to-r from-primary to-transparent transform translate-x-2"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Interactive Demo */}
        <section className="py-20 bg-gradient-to-br from-muted/30 to-green-500/5">
          <div className="container px-6">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Mic className="w-4 h-4 mr-2" />
                Interactive Experience
              </Badge>
              <h2 className="text-4xl font-bold mb-4">Experience Our Mixing Studio</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Get a taste of our collaborative mixing environment. Upload stems, 
                communicate with engineers, and see AI suggestions in real-time.
              </p>
            </div>

            <div className="max-w-6xl mx-auto">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto mb-8">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="console">Mixing Console</TabsTrigger>
                  <TabsTrigger value="ai">AI Assistant</TabsTrigger>
                  <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <Card className="max-w-4xl mx-auto">
                    <CardContent className="pt-6">
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Music className="w-8 h-8 text-blue-500" />
                          </div>
                          <h3 className="font-semibold mb-2">Artist Vision</h3>
                          <p className="text-sm text-muted-foreground">Upload stems, share references, communicate your creative vision clearly</p>
                        </div>
                        <div className="text-center">
                          <div className="w-16 h-16 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Sliders className="w-8 h-8 text-green-500" />
                          </div>
                          <h3 className="font-semibold mb-2">Engineering Expertise</h3>
                          <p className="text-sm text-muted-foreground">Professional engineers bring technical excellence and creative insight</p>
                        </div>
                        <div className="text-center">
                          <div className="w-16 h-16 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Brain className="w-8 h-8 text-purple-500" />
                          </div>
                          <h3 className="font-semibold mb-2">AI Intelligence</h3>
                          <p className="text-sm text-muted-foreground">Machine learning enhances decisions with data-driven insights</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="console">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="aspect-video bg-gradient-to-br from-muted/50 to-primary/5 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Sliders className="w-16 h-16 text-primary mx-auto mb-4" />
                          <h3 className="text-xl font-semibold mb-2">Professional Mixing Console</h3>
                          <p className="text-muted-foreground">Cloud-based mixing studio with industry-standard tools</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="ai">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="aspect-video bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Brain className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold mb-2">AI Mixing Assistant</h3>
                          <p className="text-muted-foreground">Real-time suggestions and automatic stem analysis</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="collaboration">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="aspect-video bg-gradient-to-br from-green-500/5 to-blue-500/5 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Users className="w-16 h-16 text-green-500 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold mb-2">Real-Time Collaboration</h3>
                          <p className="text-muted-foreground">Instant communication and feedback between all parties</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground mb-4">
                Ready to start your mixing project? Choose your plan below.
              </p>
              <ArrowDown className="w-6 h-6 text-primary mx-auto animate-bounce" />
            </div>
          </div>
        </section>

        {/* Packages Section */}
        <section className="py-20" id="packages">
          <div className="container px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Choose Your Mixing Plan</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Professional mixing services that scale with your needs, from single tracks to full albums
              </p>
            </div>

            <MixingPackages />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-500/10 via-green-500/10 to-blue-500/10">
          <div className="container px-6">
            <Card className="max-w-4xl mx-auto text-center bg-gradient-to-br from-background/90 to-blue-500/5 backdrop-blur border-blue-500/20">
              <CardContent className="pt-8 pb-8">
                <h2 className="text-3xl font-bold mb-4">Ready to Create Your Next Hit?</h2>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">
                  Join the revolution in collaborative mixing. Where your vision meets professional expertise, 
                  enhanced by cutting-edge AI technology.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/auth?mode=signup">
                    <Button size="lg" className="gap-2 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-500/90 hover:to-green-500/90">
                      <Users className="w-5 h-5" />
                      Start Collaborating
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="gap-2">
                    <Headphones className="w-5 h-5" />
                    Listen to Portfolio
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

export default MixingShowcase;