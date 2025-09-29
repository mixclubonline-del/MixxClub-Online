import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Cpu, Users, Wand2, Radio, Shield, Headphones } from "lucide-react";
import robotLogo from "@/assets/mixclub-robot-logo.png";
import { AudioVisualizer } from "./AudioVisualizer";
import { LiveStats } from "./LiveStats";
import { InteractiveFeatureCard } from "./InteractiveFeatureCard";
import { AudioDemoPlayer } from "./AudioDemoPlayer";
import { EngineerShowcase } from "./EngineerShowcase";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dynamic animated background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-card/80"></div>
      
      {/* Canvas Audio Visualizer */}
      <AudioVisualizer />
      
      {/* Animated blobs */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-[32rem] h-[32rem] bg-accent/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-primary/20 rounded-full blur-3xl animate-pulse-glow"></div>
      </div>

      {/* Content */}
      <div className="container relative z-10 px-6 py-20 text-center space-y-12">
        {/* Robot Logo with enhanced glow */}
        <div className="flex justify-center mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-3xl animate-pulse-glow group-hover:bg-primary/40 transition-colors"></div>
            <img 
              src={robotLogo} 
              alt="MixClub AI Robot" 
              className="w-32 h-32 relative z-10 group-hover:scale-110 transition-transform duration-300" 
            />
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 backdrop-blur-sm animate-pulse-glow">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <span className="text-sm font-semibold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
            AI Intelligence + Human Artistry
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight max-w-6xl mx-auto">
          Where{" "}
          <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent animate-pulse-glow">
            AI Precision
          </span>
          <br />
          Meets{" "}
          <span className="text-foreground">Human Touch</span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
          The future of music production. <span className="text-primary font-semibold">12 AI models</span> working alongside{" "}
          <span className="text-primary font-semibold">2,500+ pro engineers</span> to transform your tracks into radio-ready hits—with{" "}
          <span className="text-primary font-semibold">real-time collaboration</span> and{" "}
          <span className="text-primary font-semibold">intelligent coaching</span>.
        </p>

        {/* Interactive Feature Pills */}
        <div className="flex flex-wrap gap-3 justify-center mb-12 max-w-5xl mx-auto">
          <InteractiveFeatureCard
            icon={Cpu}
            title="Neural AI Processing"
            description="12 advanced AI models analyze and enhance your audio in real-time with studio-grade precision"
            isAI
          />
          <InteractiveFeatureCard
            icon={Users}
            title="Expert Engineers"
            description="Work with 2,500+ professional audio engineers who use cutting-edge AI tools"
          />
          <InteractiveFeatureCard
            icon={Radio}
            title="Live Collaboration"
            description="Real-time studio sessions with high-fidelity audio and screen sharing"
            isAI
          />
          <InteractiveFeatureCard
            icon={Wand2}
            title="AI Voice Coach"
            description="Intelligent vocal training and feedback powered by advanced machine learning"
            isAI
          />
          <InteractiveFeatureCard
            icon={Shield}
            title="Quality Guaranteed"
            description="99.9% client satisfaction with unlimited revisions until perfect"
          />
          <InteractiveFeatureCard
            icon={Headphones}
            title="Studio-Grade Audio"
            description="Professional mixing and mastering with AI-assisted precision"
          />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <a href="/auth?mode=signup">
            <Button size="lg" className="gap-2 group text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all">
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </a>
          <a href="#demo">
            <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6">
              <Sparkles className="w-5 h-5" />
              Try AI Demo
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
