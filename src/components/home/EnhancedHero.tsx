import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play, Star, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { usePageContent } from '@/hooks/usePageContent';

export const EnhancedHero = () => {
  const navigate = useNavigate();
  const { content: badgeText } = usePageContent('home', 'enhanced_hero_badge');
  const { content: heroTitle } = usePageContent('home', 'enhanced_hero_title');

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Dynamic gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      <div className="absolute inset-0" 
        style={{ 
          backgroundImage: `radial-gradient(circle at 20% 30%, hsl(var(--primary) / 0.15) 0%, transparent 50%),
                           radial-gradient(circle at 80% 70%, hsl(var(--accent) / 0.1) 0%, transparent 50%)` 
        }} 
      />
      
      <div className="container relative z-10 px-4 md:px-6">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-center">
          {/* Left column - Hero content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Badge className="glass-morphic backdrop-blur-xl text-primary border-primary/30 px-4 py-2">
                <Zap className="w-4 h-4 mr-2" />
                AI-Powered Matching
              </Badge>
            </motion.div>

            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tight">
                Your Music.
                <br />
                <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                  World-Class
                </span>
                <br />
                Engineers.
              </h1>
              
              <p className="text-lg md:text-2xl text-foreground/80 max-w-2xl leading-relaxed">
                Connect with top audio engineers, collaborate in real-time, and bring your tracks to professional quality.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="gap-2 group text-lg px-8 py-6 shadow-glow-sm hover:shadow-glow transition-all duration-300"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/home')}
                className="gap-2 glass-morphic backdrop-blur-xl border-primary/20 hover:border-primary/40 text-lg px-8 py-6"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex flex-wrap items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 border-2 border-background"
                    />
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">4.9/5</span>
                  </div>
                  <p className="text-xs text-muted-foreground">from 1,200+ reviews</p>
                </div>
              </div>

              <div className="h-8 w-px bg-border" />

              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <div className="text-sm">
                  <p className="font-bold">5,000+</p>
                  <p className="text-xs text-muted-foreground">Active users</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right column - Feature showcase */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative lg:block hidden"
          >
            <div className="space-y-6">
              <Card className="glass-morphic-card p-8 border-primary/30 backdrop-blur-xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">AI Matching Score</h3>
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-sm px-3 py-1">98% Match</Badge>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-base">
                      <span className="text-foreground/70">Genre Match</span>
                      <span className="font-bold text-primary">95%</span>
                    </div>
                    <div className="h-3 bg-muted/30 rounded-full overflow-hidden backdrop-blur-sm">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "95%" }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-primary to-primary-glow rounded-full shadow-glow-sm" 
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-base">
                      <span className="text-foreground/70">Style Compatibility</span>
                      <span className="font-bold text-primary">100%</span>
                    </div>
                    <div className="h-3 bg-muted/30 rounded-full overflow-hidden backdrop-blur-sm">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1, delay: 0.7 }}
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full shadow-glow-sm" 
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="glass-morphic-card p-6 border-accent/30 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center backdrop-blur-sm">
                    <Zap className="w-7 h-7 text-accent" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">Real-Time Collaboration</p>
                    <p className="text-sm text-foreground/70">Work together live with low-latency audio</p>
                  </div>
                </div>
              </Card>

              <Card className="glass-morphic-card p-6 border-primary/30 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center backdrop-blur-sm">
                    <Star className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">Quality Guaranteed</p>
                    <p className="text-sm text-foreground/70">Money-back if not satisfied with results</p>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
