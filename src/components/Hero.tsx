import { Button } from "@/components/ui/button";
import { ArrowRight, Music, Award, HeartHandshake, Mic } from "lucide-react";
import { Link } from "react-router-dom";
import mixclub3DLogo from "@/assets/mixclub-3d-logo.png";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Dynamic gradient orbs - Google Glass style */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-secondary/40 to-primary/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-primary/40 to-accent/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-accent/20 to-primary-glow/25 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] bg-gradient-to-br from-primary-glow/30 to-secondary/25 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
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
          <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/15 to-accent/15 border-2 border-primary/40 backdrop-blur-md shadow-glow-sm">
            <span className="text-sm font-bold text-primary animate-pulse-glow">YOUR SOUND, PERFECTED</span>
          </div>
        </div>

        {/* Main Headline with Gradient */}
        <div className="space-y-8 mb-16">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight max-w-6xl mx-auto">
            <span className="bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent animate-shimmer">
              Turn Your Tracks Into
              Radio-Ready Hits
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-foreground/80 max-w-4xl mx-auto leading-relaxed font-medium">
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
          <div className="p-6 rounded-2xl bg-card/60 backdrop-blur-xl border-2 border-primary/30 hover:border-primary/60 hover:shadow-glow-sm transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary-glow/20 shadow-glow-sm">
                <Music className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Instant Mastering Polish</h3>
            </div>
            <p className="text-foreground/70 font-medium">AI trained on chart-topping hits makes your tracks streaming-ready with that radio polish.</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-card/60 backdrop-blur-xl border-2 border-secondary/30 hover:border-secondary/60 hover:shadow-glow-cyan transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 shadow-glow-cyan">
                <HeartHandshake className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Pro Mixing Engineers</h3>
            </div>
            <p className="text-foreground/70 font-medium">Real musicians who've mixed hits you know and love - ready to work on your tracks.</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-card/60 backdrop-blur-xl border-2 border-accent/30 hover:border-accent/60 hover:shadow-glow-pink transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 shadow-glow-pink">
                <Award className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Live Studio Sessions</h3>
            </div>
            <p className="text-foreground/70 font-medium">Collaborate in real-time like you're in the studio together - instant feedback and live edits.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
