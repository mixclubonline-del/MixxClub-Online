import { Button } from "@/components/ui/button";
import { ArrowRight, Music, Award, HeartHandshake, Mic } from "lucide-react";
import { Link } from "react-router-dom";
import mixclub3DLogo from "@/assets/mixclub-3d-logo.png";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Subtle gradient orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Content */}
      <div className="container relative z-10 px-6 py-20 text-center">
        {/* 3D Logo */}
        <div className="flex justify-center mb-12">
          <img 
            src={mixclub3DLogo} 
            alt="MixClub 3D Logo" 
            className="w-80 h-60 object-contain animate-float"
          />
        </div>

        {/* Introducing Badge */}
        <div className="mb-8">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-sm">
            <span className="text-sm font-medium text-primary">YOUR SOUND, PERFECTED</span>
          </div>
        </div>

        {/* Main Headline with Gradient */}
        <div className="space-y-8 mb-16">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight max-w-6xl mx-auto">
            <span className="bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
              Turn Your Tracks Into
              Radio-Ready Hits
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Connect with pro engineers who've worked on your favorite songs across hip-hop, pop, rock, and beyond. 
            Get studio-quality mixing and mastering in days, not weeks. Your music deserves to sound as good as the pros.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link to="/auth?mode=signup">
            <Button 
              size="lg" 
              className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white border-0 shadow-2xl hover:shadow-primary/25 transition-all duration-300"
            >
              GET MIXCLUB
            </Button>
          </Link>
          <a href="#instant-demo">
            <Button 
              size="lg" 
              variant="outline"
              className="px-8 py-4 text-lg font-semibold border-2 hover:bg-primary/10"
            >
              Try Free Demo
            </Button>
          </a>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-primary/20 hover:border-primary/40 hover:shadow-glow-sm transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Music className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Instant Mastering Polish</h3>
            </div>
            <p className="text-muted-foreground">AI trained on chart-topping hits makes your tracks streaming-ready with that radio polish.</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-primary/20 hover:border-primary/40 hover:shadow-glow-sm transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <HeartHandshake className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Pro Mixing Engineers</h3>
            </div>
            <p className="text-muted-foreground">Real musicians who've mixed hits you know and love - ready to work on your tracks.</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-primary/20 hover:border-primary/40 hover:shadow-glow-sm transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Live Studio Sessions</h3>
            </div>
            <p className="text-muted-foreground">Collaborate in real-time like you're in the studio together - instant feedback and live edits.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
