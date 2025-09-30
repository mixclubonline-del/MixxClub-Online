import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import AudioPreview from "@/components/AudioPreview";
import { SuccessStories } from "@/components/SuccessStories";
import { MasteringChatbot } from "@/components/MasteringChatbot";
import Pricing from "@/components/Pricing";
import Contact from "@/components/Contact";
import { Button } from "@/components/ui/button";
import { Users, Zap, Music, Sparkles } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <Services />
      <AudioPreview />
      <section className="py-20 bg-gradient-to-b from-muted/30 to-primary/5 relative overflow-hidden">
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
      <SuccessStories />
      <section className="py-20 bg-gradient-to-b from-background to-card relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.1),transparent_70%)]" />
        <div className="container px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Join Our Network of Engineers
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Turn your passion into profit. Join MixClub's growing community of audio professionals and earn 70% on every project.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-primary/20">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Steady Income</h3>
                <p className="text-sm text-muted-foreground">Get consistent work from talented artists worldwide</p>
              </div>
              
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-primary/20">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">70% Revenue</h3>
                <p className="text-sm text-muted-foreground">Keep most of what you earn with our fair split</p>
              </div>
              
              <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-primary/20">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Music className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Build Portfolio</h3>
                <p className="text-sm text-muted-foreground">Showcase your work and grow your reputation</p>
              </div>
            </div>
            
            <div className="text-center">
              <Button 
                onClick={() => window.location.href = '/auth?mode=signup'}
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Join as Engineer
              </Button>
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
    </div>
  );
};

export default Home;
