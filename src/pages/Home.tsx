import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ProblemStatement from "@/components/ProblemStatement";
import HowItWorks from "@/components/HowItWorks";
import WhyMixClub from "@/components/WhyMixClub";
import Services from "@/components/Services";
import AudioPreview from "@/components/AudioPreview";
import { SuccessStories } from "@/components/SuccessStories";
import { MasteringChatbot } from "@/components/MasteringChatbot";
import Pricing from "@/components/Pricing";
import Contact from "@/components/Contact";
import { StickyUploadButton } from "@/components/StickyUploadButton";
import { PluginShowcase } from "@/components/PluginShowcase";
import { Testimonials } from "@/components/Testimonials";
import { LiveStats } from "@/components/LiveStats";
import { BeforeAfterComparison } from "@/components/BeforeAfterComparison";
import { Button } from "@/components/ui/button";
import { Users, Zap, Music, Sparkles } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <BeforeAfterComparison />
      <ProblemStatement />
      <HowItWorks />
      <WhyMixClub />
      <Services />
      <section id="instant-demo" className="py-20 bg-gradient-to-b from-primary/5 to-muted/30 relative overflow-hidden scroll-mt-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.1),transparent_70%)]" />
        <div className="container px-6 relative z-10">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Try Our Instant Mastering Polish
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload any track and hear what pro mastering can do - get instant feedback and an A/B comparison 
              with that radio-ready polish. <span className="text-primary font-semibold">Totally free!</span>
            </p>
          </div>
          <MasteringChatbot />
        </div>
      </section>
      <AudioPreview />
      <section id="upload" className="py-20 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden scroll-mt-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.1),transparent_70%)]" />
        <div className="container px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-[hsl(220_90%_60%)] to-[hsl(180_100%_50%)] bg-clip-text text-transparent">
              Upload Your Track
            </h2>
            <p className="text-xl text-muted-foreground">
              Get started by uploading your vocals or stems. Our AI will analyze your track and match you with the perfect engineer.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="glass-studio rounded-2xl p-8 border-2 border-primary/30 hover:border-primary/50 transition-all duration-300">
              <div className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-12 text-center hover:border-primary/50 transition-colors duration-300 cursor-pointer">
                <Music className="w-16 h-16 mx-auto mb-4 text-primary" />
                <p className="text-lg font-semibold mb-2">Drop your audio files here</p>
                <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                <Button size="lg" className="shadow-glow-sm">
                  Choose Files
                </Button>
              </div>
              <div className="mt-6 flex justify-center gap-4 text-sm text-muted-foreground">
                <span>✓ WAV, MP3, FLAC</span>
                <span>✓ Up to 500MB</span>
                <span>✓ Instant AI Analysis</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <SuccessStories />
      <Testimonials />
      <LiveStats />
      <PluginShowcase />
      <section id="engineers" className="py-32 bg-gradient-to-b from-background via-[hsl(262_30%_8%)] to-background relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-raven-float" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-[hsl(220_90%_60%)]/15 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[hsl(180_100%_50%)]/10 rounded-full blur-3xl animate-raven-float" style={{ animationDelay: '1s' }} />
        </div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
        
        <div className="container px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Header with dramatic styling */}
            <div className="text-center mb-16 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-studio border-2 border-primary/40 shadow-glow-sm mb-6">
                <Sparkles className="w-4 h-4 text-primary animate-pulse-glow" />
                <span className="text-sm font-semibold bg-gradient-to-r from-foreground via-[hsl(0_0%_90%)] to-foreground bg-clip-text text-transparent">
                  FOR AUDIO PROFESSIONALS
                </span>
              </div>
              
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[1.1]">
                <span className="bg-gradient-to-r from-primary via-[hsl(220_90%_60%)] to-[hsl(180_100%_50%)] bg-clip-text text-transparent drop-shadow-[0_0_40px_hsl(262_83%_58%/0.5)]">
                  Join Our Network of Engineers
                </span>
              </h2>
              
              <p className="text-xl md:text-2xl text-foreground/70 max-w-3xl mx-auto font-light leading-relaxed">
                Turn your passion into profit. Join MixClub's growing community of audio professionals and{" "}
                <span className="text-primary font-bold">earn 70% on every project</span>
              </p>
            </div>
            
            {/* Feature cards with enhanced styling */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="group glass-studio rounded-2xl p-8 border-2 border-primary/30 hover:border-primary/60 transition-all duration-500 hover:scale-[1.05] hover:shadow-glow">
                <div className="relative mb-6">
                  <div className="absolute inset-0 blur-2xl opacity-0 group-hover:opacity-100 bg-primary/40 rounded-full transition-opacity duration-500" />
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Steady Income
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get consistent work from talented artists worldwide. Build your client base with our growing platform.
                </p>
              </div>
              
              <div className="group glass-studio rounded-2xl p-8 border-2 border-[hsl(220_90%_60%)]/30 hover:border-[hsl(220_90%_60%)]/60 transition-all duration-500 hover:scale-[1.05] hover:shadow-glow-blue">
                <div className="relative mb-6">
                  <div className="absolute inset-0 blur-2xl opacity-0 group-hover:opacity-100 bg-[hsl(220_90%_60%)]/40 rounded-full transition-opacity duration-500" />
                  <div className="w-16 h-16 bg-gradient-to-br from-[hsl(220_90%_60%)]/20 to-[hsl(220_90%_60%)]/10 rounded-2xl flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-8 h-8 text-[hsl(220_90%_60%)]" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  70% Revenue
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Keep most of what you earn with our <span className="text-[hsl(220_90%_60%)] font-medium">industry-leading</span> fair split. You do the work, you get paid.
                </p>
              </div>
              
              <div className="group glass-studio rounded-2xl p-8 border-2 border-[hsl(180_100%_50%)]/30 hover:border-[hsl(180_100%_50%)]/60 transition-all duration-500 hover:scale-[1.05] hover:shadow-glow-cyan">
                <div className="relative mb-6">
                  <div className="absolute inset-0 blur-2xl opacity-0 group-hover:opacity-100 bg-[hsl(180_100%_50%)]/40 rounded-full transition-opacity duration-500" />
                  <div className="w-16 h-16 bg-gradient-to-br from-[hsl(180_100%_50%)]/20 to-[hsl(180_100%_50%)]/10 rounded-2xl flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-300">
                    <Music className="w-8 h-8 text-[hsl(180_100%_50%)]" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Build Portfolio
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Showcase your work and grow your reputation with <span className="text-[hsl(180_100%_50%)] font-medium">verified reviews</span> from real artists.
                </p>
              </div>
            </div>
            
            {/* CTA Button */}
            <div className="text-center animate-scale-in">
              <Button 
                onClick={() => window.location.href = '/for-engineers'}
                size="lg"
                className="text-xl px-12 py-8 shadow-glow-raven hover:shadow-glow-lg transition-all duration-300 font-bold group"
              >
                <Sparkles className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                Join as Engineer
              </Button>
              <p className="mt-6 text-sm text-muted-foreground">
                Already a member?{" "}
                <a href="/auth" className="text-primary hover:text-primary-glow transition-colors duration-200 font-medium">
                  Sign in here
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
      <Pricing />
      <Contact />
      <footer className="border-t border-border py-8 bg-card">
        <div className="container px-6 text-center text-sm text-muted-foreground">
          <p>© 2025 MixClubOnline. Make your music sound as good as the pros.</p>
        </div>
      </footer>
      <StickyUploadButton />
    </div>
  );
};

export default Home;
