import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Headphones, Download, Users, Zap, Music } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <section className="py-20 bg-gradient-to-b from-background via-[hsl(262_30%_8%)] to-background">
        <div className="container px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-primary via-[hsl(220_90%_60%)] to-[hsl(180_100%_50%)] bg-clip-text text-transparent">
              How MixClub Works
            </h1>
            <p className="text-xl text-muted-foreground">
              Three simple paths to get your music radio-ready
            </p>
          </div>

          {/* For Artists */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-10">For Artists</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 glass-studio border-2 border-primary/30">
                <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">1. Upload Your Track</h3>
                <p className="text-muted-foreground">
                  Drag and drop your audio file. We support all major formats (WAV, MP3, AIFF, FLAC).
                </p>
              </Card>

              <Card className="p-8 glass-studio border-2 border-[hsl(220_90%_60%)]/30">
                <div className="w-16 h-16 bg-[hsl(220_90%_60%)]/20 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-[hsl(220_90%_60%)]" />
                </div>
                <h3 className="text-2xl font-bold mb-3">2. Choose Your Path</h3>
                <p className="text-muted-foreground">
                  Get instant AI mastering, connect with a pro engineer, or both for the ultimate polish.
                </p>
              </Card>

              <Card className="p-8 glass-studio border-2 border-[hsl(180_100%_50%)]/30">
                <div className="w-16 h-16 bg-[hsl(180_100%_50%)]/20 rounded-2xl flex items-center justify-center mb-6">
                  <Download className="w-8 h-8 text-[hsl(180_100%_50%)]" />
                </div>
                <h3 className="text-2xl font-bold mb-3">3. Download & Release</h3>
                <p className="text-muted-foreground">
                  Get your radio-ready master and start sharing your music with the world.
                </p>
              </Card>
            </div>
          </div>

          {/* For Engineers */}
          <div>
            <h2 className="text-3xl font-bold text-center mb-10">For Engineers</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 glass-studio border-2 border-primary/30">
                <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">1. Create Your Profile</h3>
                <p className="text-muted-foreground">
                  Showcase your portfolio, set your rates, and highlight your specialties.
                </p>
              </Card>

              <Card className="p-8 glass-studio border-2 border-[hsl(220_90%_60%)]/30">
                <div className="w-16 h-16 bg-[hsl(220_90%_60%)]/20 rounded-2xl flex items-center justify-center mb-6">
                  <Headphones className="w-8 h-8 text-[hsl(220_90%_60%)]" />
                </div>
                <h3 className="text-2xl font-bold mb-3">2. Take on Projects</h3>
                <p className="text-muted-foreground">
                  Browse opportunities or get matched with artists who fit your style.
                </p>
              </Card>

              <Card className="p-8 glass-studio border-2 border-[hsl(180_100%_50%)]/30">
                <div className="w-16 h-16 bg-[hsl(180_100%_50%)]/20 rounded-2xl flex items-center justify-center mb-6">
                  <Zap className="w-8 h-8 text-[hsl(180_100%_50%)]" />
                </div>
                <h3 className="text-2xl font-bold mb-3">3. Get Paid Fair</h3>
                <p className="text-muted-foreground">
                  Keep 70% of your earnings. Build your reputation with verified reviews.
                </p>
              </Card>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Button 
              size="lg"
              onClick={() => navigate('/auth?signup=true')}
              className="text-xl px-12 py-8 shadow-glow-raven"
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 bg-card">
        <div className="container px-6 text-center text-sm text-muted-foreground">
          <p>© 2026 MixClub. Make your music sound as good as the pros.</p>
        </div>
      </footer>
    </div>
  );
};

export default HowItWorks;
