import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Mic, Radio, Cpu, Headphones } from "lucide-react";
import robotLogo from "@/assets/mixclub-robot-logo.png";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card"></div>
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="container relative z-10 px-6 py-32 text-center">
        {/* Robot Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse-glow"></div>
            <img src={robotLogo} alt="MixClub AI Robot" className="w-32 h-32 relative z-10" />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-pulse-glow">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary font-medium">Next-Gen AI Music Technology</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Intelligent{" "}
          <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
            Music Production
          </span>
          {" "}Platform
        </h1>

        <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
          The world's most advanced AI music production suite. Transform bedroom recordings into radio-ready hits with professional mixing, mastering, real-time collaboration, and intelligent voice coaching—all powered by cutting-edge artificial intelligence.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">AI Assistant</span>
          </div>
          <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2">
            <Radio className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">Live Collaboration</span>
          </div>
          <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">Neural Processing</span>
          </div>
          <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2">
            <Mic className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">Voice AI Coach</span>
          </div>
        </div>

        {/* AI Neural Processing Badge */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">AI Neural Processing</span>
          </div>
          <p className="text-sm text-muted-foreground">Real-time audio analysis and enhancement</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/auth?mode=signup">
            <Button size="lg" className="gap-2 group">
              Experience AI Magic
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </a>
          <a href="#preview">
            <Button size="lg" variant="outline" className="gap-2">
              See AI in Action
            </Button>
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-20">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">50M+</div>
            <div className="text-sm text-muted-foreground">AI-Enhanced Tracks</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">99.7%</div>
            <div className="text-sm text-muted-foreground">AI Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">∞</div>
            <div className="text-sm text-muted-foreground">Learning & Evolving</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
