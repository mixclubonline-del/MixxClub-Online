import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Sparkles, 
  Users, 
  Download, 
  Headphones,
  Mic2,
  Award,
  TrendingUp,
  Zap,
  Music,
  Play,
  Share2,
  Crown,
  Star,
  Trophy
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CommunityMilestonesShowcase } from "@/components/home/CommunityMilestonesShowcase";
import { TierShowcase } from "@/components/home/TierShowcase";
import { AISessionPrepShowcase } from "@/components/home/AISessionPrepShowcase";
import { AIMasteringCTA } from "@/components/home/AIMasteringCTA";
import { SimplePackagePreview } from "@/components/home/SimplePackagePreview";

const ForArtists = () => {
  const journeySteps = [
    {
      number: 1,
      icon: <Upload className="w-6 h-6" />,
      title: "Upload Your Track",
      description: "Drop your stems or mixdown into our secure cloud workspace",
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20"
    },
    {
      number: 2,
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI Session Prep",
      description: "Our AI analyzes your track and prepares detailed session notes",
      color: "bg-purple-500/10 text-purple-500 border-purple-500/20"
    },
    {
      number: 3,
      icon: <Users className="w-6 h-6" />,
      title: "Perfect Match",
      description: "Get paired with an engineer who specializes in your genre",
      color: "bg-green-500/10 text-green-500 border-green-500/20"
    },
    {
      number: 4,
      icon: <Headphones className="w-6 h-6" />,
      title: "Real-Time Collaboration",
      description: "Work together in our live studio workspace with instant feedback",
      color: "bg-orange-500/10 text-orange-500 border-orange-500/20"
    },
    {
      number: 5,
      icon: <Download className="w-6 h-6" />,
      title: "Professional Delivery",
      description: "Receive your polished mix/master in all required formats",
      color: "bg-pink-500/10 text-pink-500 border-pink-500/20"
    },
    {
      number: 6,
      icon: <Share2 className="w-6 h-6" />,
      title: "Release & Grow",
      description: "Distribute to all platforms and track your success",
      color: "bg-primary/10 text-primary border-primary/20"
    }
  ];

  const aiFeatures = [
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "Smart Genre Detection",
      description: "AI automatically identifies your style and matches you with the right engineer"
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Quality Analysis",
      description: "Real-time feedback on mix balance, dynamics, and frequency response"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Instant Session Prep",
      description: "Automated technical analysis saves hours of prep time"
    },
    {
      icon: <Award className="w-5 h-5" />,
      title: "Reference Matching",
      description: "Compare your track to industry standards in your genre"
    }
  ];

  const communityFeatures = [
    {
      icon: <Trophy className="w-5 h-5" />,
      title: "Mix Battles Arena",
      description: "Compete with other artists, win prizes, get discovered",
      badge: "Coming Soon"
    },
    {
      icon: <Star className="w-5 h-5" />,
      title: "Achievement System",
      description: "Earn badges for uploads, collaborations, and milestones",
      badge: "Active"
    },
    {
      icon: <Crown className="w-5 h-5" />,
      title: "Tier Progression",
      description: "Unlock features as the community grows together",
      badge: "Active"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Leaderboards",
      description: "See top artists, most active creators, trending tracks",
      badge: "Active"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20">
        {/* Founding Member Banner */}
        <section className="py-6 bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-amber-500/20 border-b border-amber-500/30">
          <div className="container px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-lg text-amber-100">
                    🚀 Founding Artist Program
                  </p>
                  <p className="text-amber-200/80 text-sm">
                    First 100 artists get <span className="font-bold text-amber-100">lifetime 20% discount</span> + exclusive badge
                  </p>
                </div>
              </div>
              <Badge className="bg-amber-500/30 text-amber-100 border-amber-400/50 animate-pulse">
                <Sparkles className="w-3 h-3 mr-1" />
                73 spots left
              </Badge>
            </motion.div>
          </div>
        </section>

        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utb3BhY2l0eT0iMC4wNSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
          
          <div className="container px-6 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <Badge variant="secondary" className="mb-6 text-base px-4 py-2">
                <Music className="w-4 h-4 mr-2" />
                For Artists
              </Badge>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient-shift_3s_ease-in-out_infinite]">
                Turn Bedroom Beats Into Billboard Bangers
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                Join <span className="text-primary font-bold">10,000+ artists</span> getting professional mixes, AI-powered mastering, 
                and real-time collaboration with world-class engineers.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth?mode=signup">
                  <Button size="lg" className="gap-2 text-lg px-8 py-6">
                    <Sparkles className="w-5 h-5" />
                    Start Your Journey Free
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button variant="outline" size="lg" className="gap-2 text-lg px-8 py-6">
                    <Crown className="w-5 h-5" />
                    View Pricing
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* The Journey Section */}
        <section className="py-20 bg-background">
          <div className="container px-6">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                Your Path to Success
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                From Upload to Release
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                We've streamlined the entire production process. Here's how it works.
              </p>
            </div>

            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {journeySteps.map((step, index) => (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className={`relative border-2 ${step.color} hover:shadow-xl transition-all duration-300 group`}>
                      <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {step.number}
                      </div>
                      
                      <CardHeader>
                        <div className={`w-14 h-14 rounded-xl ${step.color} border-2 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          {step.icon}
                        </div>
                        <CardTitle className="text-xl mb-2">{step.title}</CardTitle>
                        <CardDescription className="text-base">
                          {step.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* AI Features Section */}
        <AISessionPrepShowcase />
        <AIMasteringCTA />

        {/* AI Feature Cards */}
        <section className="py-20 bg-muted/30">
          <div className="container px-6">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                Powered by AI
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Intelligent Production Assistant
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Our AI doesn't replace humans—it empowers them with superhuman capabilities
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {aiFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                        {feature.icon}
                      </div>
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Community & Gamification */}
        <section className="py-20 bg-background">
          <div className="container px-6">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">
                <Trophy className="w-4 h-4 mr-2" />
                Community & Growth
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Grow Together, Unlock Together
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Every artist who joins unlocks features for the entire community. 
                Your success is our success.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-20">
              {communityFeatures.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        {feature.icon}
                      </div>
                      <Badge variant={feature.badge === "Active" ? "default" : "secondary"} className="text-xs">
                        {feature.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mb-2">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Community Milestones & Tiers */}
        <CommunityMilestonesShowcase />
        <TierShowcase />

        {/* Pricing Preview */}
        <SimplePackagePreview />

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="container px-6">
            <Card className="max-w-4xl mx-auto text-center border-2 border-primary/20 shadow-xl">
              <CardContent className="pt-12 pb-12">
                <Crown className="w-16 h-16 mx-auto mb-6 text-primary" />
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Ready to Elevate Your Music?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join thousands of artists who've transformed their sound with professional 
                  mixing, AI mastering, and real-time collaboration.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/auth?mode=signup">
                    <Button size="lg" className="gap-2 text-lg px-8 py-6">
                      <Sparkles className="w-5 h-5" />
                      Start Free Today
                    </Button>
                  </Link>
                  <Link to="/mixing">
                    <Button variant="outline" size="lg" className="gap-2 text-lg px-8 py-6">
                      <Headphones className="w-5 h-5" />
                      Explore Mixing Studio
                    </Button>
                  </Link>
                  <Link to="/mastering">
                    <Button variant="outline" size="lg" className="gap-2 text-lg px-8 py-6">
                      <Mic2 className="w-5 h-5" />
                      Try AI Mastering
                    </Button>
                  </Link>
                </div>
                
                <div className="mt-8 pt-8 border-t border-border/50">
                  <p className="text-sm text-muted-foreground">
                    No credit card required • Cancel anytime • 30-day money-back guarantee
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ForArtists;
