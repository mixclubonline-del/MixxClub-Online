import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Sparkles, 
  Users, 
  Download, 
  Headphones,
  Award,
  TrendingUp,
  Zap,
  Music,
  Share2,
  Crown,
  Star,
  Trophy,
  ArrowRight,
  Play
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SessionPreview } from "@/components/home/SessionPreview";
import { TransformationDemo } from "@/components/home/TransformationDemo";

const ForArtists = () => {
  const journeySteps = [
    {
      number: 1,
      icon: <Upload className="w-6 h-6" />,
      title: "Upload Your Track",
      description: "Drop your stems or mixdown into our secure cloud workspace",
      color: "bg-primary/10 text-primary border-primary/20"
    },
    {
      number: 2,
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI Session Prep",
      description: "Our AI analyzes your track and prepares detailed session notes",
      color: "bg-secondary/10 text-secondary border-secondary/20"
    },
    {
      number: 3,
      icon: <Users className="w-6 h-6" />,
      title: "Perfect Match",
      description: "Get paired with an engineer who specializes in your genre",
      color: "bg-accent/10 text-accent border-accent/20"
    },
    {
      number: 4,
      icon: <Headphones className="w-6 h-6" />,
      title: "Real-Time Collaboration",
      description: "Work together in our live studio workspace with instant feedback",
      color: "bg-green-500/10 text-green-500 border-green-500/20"
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
      color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    }
  ];

  const stats = [
    { value: "10,000+", label: "Artists Trust MixClub" },
    { value: "2.3 sec", label: "Average Match Time" },
    { value: "98%", label: "Satisfaction Rate" },
    { value: "24/7", label: "Global Collaboration" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20">
        {/* Founding Member Banner */}
        <section className="py-4 bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-amber-500/20 border-b border-amber-500/30">
          <div className="container px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left"
            >
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-amber-400" />
                <p className="font-bold text-amber-100">
                  🚀 Founding Artist Program - First 100 get <span className="text-amber-300">lifetime 20% discount</span>
                </p>
              </div>
              <Badge className="bg-amber-500/30 text-amber-100 border-amber-400/50 animate-pulse">
                73 spots left
              </Badge>
            </motion.div>
          </div>
        </section>

        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.1),transparent_70%)]" />
          
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
              
              <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                Turn Bedroom Beats Into Billboard Bangers
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Professional mixing, AI-powered mastering, and real-time collaboration with world-class engineers.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12">
                {stats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth?mode=signup">
                  <Button size="lg" className="gap-2 text-lg px-8 py-6">
                    <Sparkles className="w-5 h-5" />
                    Start Your Journey Free
                  </Button>
                </Link>
                <Link to="/showcase">
                  <Button variant="outline" size="lg" className="gap-2 text-lg px-8 py-6">
                    <Play className="w-5 h-5" />
                    See The Technology
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Live Session Preview */}
        <SessionPreview />

        {/* Before/After Transformation */}
        <TransformationDemo />

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
                We've streamlined the entire production process.
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
                    <Card className={`relative border-2 ${step.color} hover:shadow-xl transition-all duration-300 group h-full`}>
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

        {/* CRM Preview Section */}
        <section className="py-20 bg-muted/20">
          <div className="container px-6">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                <Star className="w-4 h-4 mr-2" />
                Your Command Center
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                This is YOUR Artist CRM
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to manage your music career in one place.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                { icon: TrendingUp, title: "Dashboard", description: "Track your career momentum and key metrics" },
                { icon: Users, title: "Sessions", description: "Manage all your collaboration sessions" },
                { icon: Sparkles, title: "AI Matching", description: "Find the perfect engineer for your sound" },
                { icon: Headphones, title: "Projects", description: "Track every project from upload to release" },
                { icon: Award, title: "Achievements", description: "Earn badges and unlock rewards" },
                { icon: Trophy, title: "Community", description: "Connect with other artists and grow together" },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                    <feature.icon className="w-10 h-10 text-primary mb-4" />
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

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
                  Join thousands of artists who've transformed their sound.
                </p>
                <Link to="/auth?mode=signup">
                  <Button size="lg" className="gap-2 text-lg px-8 py-6">
                    <Sparkles className="w-5 h-5" />
                    Start Free Today
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                
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
