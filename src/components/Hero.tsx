import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Zap, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DynamicLogo } from "./hero/DynamicLogo";
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
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-studio border-2 border-primary/40 animate-scale-in">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-sm font-semibold tracking-wide">THE MUSIC COMMUNITY THAT GROWS WITH YOU</span>
          </div>

          {/* Logo */}
          <DynamicLogo />

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight animate-fade-in">
            <span className="bg-gradient-to-r from-primary via-accent-blue to-accent-cyan bg-clip-text text-transparent">
              Connect With Your Perfect Engineer
            </span>
            <br />
            <span className="text-foreground">From Bedroom Producers to Studio Veterans</span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Find the right engineer for your budget and vision — from rising talent to seasoned pros, 
            all enhanced by AI-powered matching. Your sound, your choice, your budget.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in pt-4" style={{ animationDelay: '0.4s' }}>
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="text-lg px-10 py-7 shadow-glow-raven group"
            >
              Join as Artist
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/for-engineers')}
              className="text-lg px-10 py-7 border-2"
            >
              Join as Engineer
            </Button>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-4 justify-center pt-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            {[
              { icon: Users, label: 'Engineers at Every Level', color: 'primary' },
              { icon: Zap, label: 'AI-Powered Matching', color: 'accent' },
              { icon: TrendingUp, label: 'Match Confidence Scoring', color: 'success' },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 px-6 py-3 rounded-full glass border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 cursor-pointer group"
              >
                <feature.icon className="w-5 h-5 text-primary group-hover:animate-pulse-glow" />
                <span className="text-sm font-medium">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

export default Hero;
