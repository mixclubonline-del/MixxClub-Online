import { Button } from "@/components/ui/button";
import { ArrowRight, Music, Users, Zap, Sparkles, Play } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import mixclub3DLogo from "@/assets/mixclub-3d-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { GetStartedWizard } from "./GetStartedWizard";
import { useState } from "react";

const Hero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wizardOpen, setWizardOpen] = useState(false);

  const handleGetStarted = () => {
    if (!user) {
      navigate('/auth?signup=true');
    } else {
      setWizardOpen(true);
    }
  };

  return (
    <>
      <GetStartedWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dynamic gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-[hsl(262_30%_8%)] to-[hsl(220_40%_10%)]" />
      
      {/* Animated gradient orbs with raven-inspired colors */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[32rem] h-[32rem] bg-primary/30 rounded-full blur-3xl animate-raven-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] bg-[hsl(220_90%_60%)]/25 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-[24rem] h-[24rem] bg-[hsl(180_100%_50%)]/20 rounded-full blur-3xl animate-raven-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-3/4 left-1/3 w-[20rem] h-[20rem] bg-primary/15 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '3s' }} />
      </div>

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />

      {/* Audio wave effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 opacity-20">
        <div className="flex items-end justify-around h-full gap-1">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="w-1 bg-gradient-to-t from-primary to-[hsl(220_90%_60%)] rounded-t animate-audio-wave"
              style={{
                height: `${Math.random() * 60 + 20}%`,
                animationDelay: `${i * 0.05}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4">
        <div className="flex flex-col items-center text-center space-y-8 animate-fade-in">
          {/* Badge with metallic accent */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-studio border-2 border-primary/40 shadow-glow-sm hover:shadow-glow transition-all duration-300">
            <Sparkles className="w-4 h-4 text-primary animate-pulse-glow" />
            <span className="text-sm font-semibold bg-gradient-to-r from-foreground via-[hsl(0_0%_90%)] to-foreground bg-clip-text text-transparent">
              Introducing MixClub 2.0
            </span>
          </div>

          {/* Logo with enhanced glow */}
          <div className="relative">
            <div className="absolute inset-0 blur-3xl opacity-50 bg-gradient-to-r from-primary via-[hsl(220_90%_60%)] to-[hsl(180_100%_50%)]" />
            <img 
              src={mixclub3DLogo} 
              alt="MixClub 3D Logo" 
              className="w-80 h-60 object-contain animate-raven-float relative z-10"
            />
          </div>

          {/* Main headline with dramatic typography */}
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter max-w-5xl leading-[1.1]">
            <span className="bg-gradient-to-r from-primary via-primary-glow via-[hsl(220_90%_60%)] to-[hsl(180_100%_50%)] bg-clip-text text-transparent drop-shadow-[0_0_40px_hsl(262_83%_58%/0.5)]">
              Turn Your Tracks Into Radio-Ready Hits
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-foreground/70 max-w-2xl font-light">
            Professional mixing and mastering powered by AI and{" "}
            <span className="text-primary font-medium">award-winning engineers</span>
          </p>

          {/* CTA Buttons with enhanced styling */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              size="lg" 
              className="text-lg px-10 py-7 shadow-glow-raven hover:shadow-glow-lg transition-all duration-300 font-bold"
              onClick={handleGetStarted}
            >
              GET STARTED
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-10 py-7 glass-studio border-2 border-primary/40 hover:border-primary/70 hover:bg-card/90 hover:shadow-glow-sm transition-all duration-300 font-semibold" 
              asChild
            >
              <a href="#demo">
                Try Free Demo
                <Play className="ml-2 w-5 h-5" />
              </a>
            </Button>
          </div>

          {/* Feature highlights with dramatic studio aesthetic */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 max-w-5xl">
            <div className="group flex flex-col items-center p-8 rounded-2xl glass-studio border-2 border-primary/30 hover:border-primary/60 transition-all duration-500 hover:scale-[1.02] hover:shadow-glow">
              <div className="relative mb-4">
                <div className="absolute inset-0 blur-2xl opacity-0 group-hover:opacity-100 bg-primary/40 rounded-full transition-opacity duration-500" />
                <Zap className="w-12 h-12 text-primary relative z-10 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Instant Mastering Polish
              </h3>
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                AI-powered mastering in seconds with <span className="text-primary font-medium">studio-grade quality</span>
              </p>
            </div>
            <div className="group flex flex-col items-center p-8 rounded-2xl glass-studio border-2 border-[hsl(220_90%_60%)]/30 hover:border-[hsl(220_90%_60%)]/60 transition-all duration-500 hover:scale-[1.02] hover:shadow-glow-blue">
              <div className="relative mb-4">
                <div className="absolute inset-0 blur-2xl opacity-0 group-hover:opacity-100 bg-[hsl(220_90%_60%)]/40 rounded-full transition-opacity duration-500" />
                <Users className="w-12 h-12 text-[hsl(220_90%_60%)] relative z-10 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Pro Mixing Engineers
              </h3>
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                Connect with <span className="text-[hsl(220_90%_60%)] font-medium">top industry talent</span> worldwide
              </p>
            </div>
            <div className="group flex flex-col items-center p-8 rounded-2xl glass-studio border-2 border-[hsl(180_100%_50%)]/30 hover:border-[hsl(180_100%_50%)]/60 transition-all duration-500 hover:scale-[1.02] hover:shadow-glow-cyan">
              <div className="relative mb-4">
                <div className="absolute inset-0 blur-2xl opacity-0 group-hover:opacity-100 bg-[hsl(180_100%_50%)]/40 rounded-full transition-opacity duration-500" />
                <Music className="w-12 h-12 text-[hsl(180_100%_50%)] relative z-10 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Live Studio Sessions
              </h3>
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                Real-time collaboration with <span className="text-[hsl(180_100%_50%)] font-medium">professional tools</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

export default Hero;
