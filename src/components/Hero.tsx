import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Users, Music, Zap, Award, Clock, HeartHandshake, Mic, Headphones } from "lucide-react";
import { AudioVisualizer } from "./AudioVisualizer";
import { LiveStats } from "./LiveStats";
import { AudioDemoPlayer } from "./AudioDemoPlayer";
import { EngineerShowcase } from "./EngineerShowcase";
import { CollaborationShowcase } from "./CollaborationShowcase";
import { DynamicLogo } from "./hero/DynamicLogo";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dynamic animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5"></div>
      
      {/* Canvas Audio Visualizer */}
      <AudioVisualizer />
      
      {/* Animated elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-[32rem] h-[32rem] bg-primary/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-primary/15 rounded-full blur-2xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Content */}
      <div className="container relative z-10 px-6 py-20 text-center space-y-16">
        {/* Brand Logo & Badge */}
        <div className="space-y-6">
          <div className="flex justify-center mb-8">
            <DynamicLogo />
          </div>
        </div>

        {/* Main Brand Headline */}
        <div className="space-y-6">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold leading-tight max-w-7xl mx-auto">
            <span className="bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
              MixClub
            </span>
            <br />
            <span className="text-foreground">Online</span>
          </h1>
          
          <p className="text-2xl md:text-3xl font-semibold text-muted-foreground max-w-4xl mx-auto">
            Where Artists &amp; Engineers Create{" "}
            <span className="text-primary">Together</span>
          </p>
        </div>

        {/* Real-time Collaboration Preview */}
        <div className="py-8">
          <CollaborationShowcase />
        </div>

        {/* Collaboration Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          <div className="group p-6 rounded-2xl bg-card/50 border border-primary/20 backdrop-blur-sm hover:border-primary/40 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Music className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Instant Uploads</h3>
            </div>
            <p className="text-muted-foreground text-sm">Upload tracks and watch engineers collaborate in real-time with AI-powered stem separation</p>
          </div>
          
          <div className="group p-6 rounded-2xl bg-card/50 border border-primary/20 backdrop-blur-sm hover:border-primary/40 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <HeartHandshake className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Live Collaboration</h3>
            </div>
            <p className="text-muted-foreground text-sm">Artists and engineers work together with real-time comments, tasks, and progress updates</p>
          </div>
          
          <div className="group p-6 rounded-2xl bg-card/50 border border-primary/20 backdrop-blur-sm hover:border-primary/40 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Award className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <h3 className="font-semibold text-lg">Gamified Workflow</h3>
            </div>
            <p className="text-muted-foreground text-sm">Earn points, unlock badges, and level up through successful collaborations and quality work</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <a href="/auth?mode=signup">
            <Button size="lg" className="gap-3 group text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
              Join the Collaboration
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </a>
          <a href="#demo">
            <Button size="lg" variant="outline" className="gap-3 text-lg px-10 py-6 border-primary/30 hover:border-primary/50 hover:bg-primary/5">
              <Mic className="w-5 h-5" />
              Watch Demo
            </Button>
          </a>
        </div>

        {/* Live Stats */}
        <div className="py-12">
          <LiveStats />
        </div>

        {/* Audio Demo Player */}
        <div id="demo" className="py-12">
          <AudioDemoPlayer />
        </div>

        {/* Engineer Showcase */}
        <div className="py-12">
          <EngineerShowcase />
        </div>

        {/* Trust Indicators */}
        <div className="pt-12 space-y-4">
          <div className="text-sm text-muted-foreground">Trusted by artists at</div>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
            <div className="text-xl font-bold">Universal Music</div>
            <div className="text-xl font-bold">Sony Music</div>
            <div className="text-xl font-bold">Warner Music</div>
            <div className="text-xl font-bold">Atlantic Records</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
