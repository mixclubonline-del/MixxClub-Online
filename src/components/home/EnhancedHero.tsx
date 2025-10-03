import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play, Star, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

export const EnhancedHero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 md:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-white/10 bg-grid-16 [mask-image:radial-gradient(white,transparent_70%)]" />
      
      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Hero content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <Zap className="w-3 h-3 mr-1" />
              AI-Powered Matching
            </Badge>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Your Music.
                <br />
                <span className="text-primary">World-Class</span> Engineers.
                <br />
                Perfect Match.
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                Connect with top audio engineers, collaborate in real-time, and bring your tracks to professional quality. Join 5,000+ artists and engineers.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="gap-2 group"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/how-it-works')}
                className="gap-2"
              >
                <Play className="w-4 h-4" />
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
            className="relative"
          >
            <div className="space-y-4">
              <Card className="p-6 bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold">AI Matching Score</h3>
                    <Badge variant="secondary">98% Match</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Genre Match</span>
                      <span className="font-bold">95%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[95%] rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Style Compatibility</span>
                      <span className="font-bold">100%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-full rounded-full" />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold">Real-Time Collaboration</p>
                    <p className="text-sm text-muted-foreground">Work together live with low-latency audio</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Star className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold">Quality Guaranteed</p>
                    <p className="text-sm text-muted-foreground">Money-back if not satisfied with results</p>
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
