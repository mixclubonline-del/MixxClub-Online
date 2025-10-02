import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import { InstantDemoSection } from "@/components/InstantDemoSection";
import { RecentSuccesses } from "@/components/RecentSuccesses";
import { LiveStats } from "@/components/LiveStats";
import { BeforeAfterComparison } from "@/components/BeforeAfterComparison";
import { FreemiumBanner } from "@/components/FreemiumBanner";
import { CommunityShowcase } from "@/components/home/CommunityShowcase";
import { CommunityMilestoneTracker } from "@/components/CommunityMilestoneTracker";
import { Button } from "@/components/ui/button";
import { Users, Award, Music2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* SECTION 1: Hero + Instant Demo */}
      <Hero />
      <InstantDemoSection />

      {/* SECTION 2: Social Proof + Trust */}
      <section className="py-20 bg-gradient-to-b from-background to-[hsl(262_30%_8%)]">
        <div className="container px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-primary via-[hsl(220_90%_60%)] to-[hsl(180_100%_50%)] bg-clip-text text-transparent">
                Real Artists, Real Results
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of musicians getting radio-ready sound
            </p>
          </div>
          
          <RecentSuccesses />
          <div className="mt-12">
            <LiveStats />
          </div>
          <div className="mt-12">
            <BeforeAfterComparison />
          </div>
        </div>
      </section>

      {/* Beat Battles Teaser */}
      <section className="py-16 bg-[hsl(262_30%_8%)]">
        <div className="container px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-studio border-2 border-primary/40 mb-6">
              <Award className="w-4 h-4 text-primary animate-pulse-glow" />
              <span className="text-sm font-semibold">THIS MONTH'S CHALLENGE</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-primary via-[hsl(220_90%_60%)] to-[hsl(180_100%_50%)] bg-clip-text text-transparent">
                Beat Battles Live
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Compete with other producers, win prizes, and get discovered
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/mix-battles')}
              className="text-lg px-10 py-7 shadow-glow-raven"
            >
              View Current Battles
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 3: Community + Conversion */}
      <section className="py-20 bg-gradient-to-b from-[hsl(262_30%_8%)] to-background">
        <div className="container px-6">
          <FreemiumBanner />
          
          {/* Engineer Spotlight */}
          <div className="mt-20 max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                <span className="bg-gradient-to-r from-primary via-[hsl(220_90%_60%)] to-[hsl(180_100%_50%)] bg-clip-text text-transparent">
                  For Engineers: Your Craft, Your Rules
                </span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Fair pay for great work. Build your reputation, grow your client base.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="glass-studio rounded-2xl p-8 border-2 border-primary/30 text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Find Your Artists</h3>
                <p className="text-muted-foreground">
                  Get matched with artists who need your specific expertise and style.
                </p>
              </div>

              <div className="glass-studio rounded-2xl p-8 border-2 border-[hsl(220_90%_60%)]/30 text-center">
                <div className="w-16 h-16 bg-[hsl(220_90%_60%)]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Music2 className="w-8 h-8 text-[hsl(220_90%_60%)]" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Keep 70%</h3>
                <p className="text-muted-foreground">
                  Industry-leading revenue share. You do the work, you get paid fairly.
                </p>
              </div>

              <div className="glass-studio rounded-2xl p-8 border-2 border-[hsl(180_100%_50%)]/30 text-center">
                <div className="w-16 h-16 bg-[hsl(180_100%_50%)]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Award className="w-8 h-8 text-[hsl(180_100%_50%)]" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Build Your Name</h3>
                <p className="text-muted-foreground">
                  Verified reviews and portfolio growth with every completed project.
                </p>
              </div>
            </div>

            <div className="text-center">
              <Button
                size="lg"
                onClick={() => navigate('/for-engineers')}
                className="text-lg px-10 py-7 shadow-glow-raven"
              >
                Join as Engineer
              </Button>
              <p className="mt-4 text-sm text-muted-foreground">
                Already a member?{" "}
                <button
                  onClick={() => navigate('/auth')}
                  className="text-primary hover:text-primary-glow transition-colors"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </div>
      </section>

      <CommunityShowcase />

      {/* Community Milestones */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container px-6">
          <CommunityMilestoneTracker />
        </div>
      </section>

      <footer className="border-t border-border py-8 bg-card">
        <div className="container px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 MixClubOnline. By musicians, for musicians.</p>
            <div className="flex gap-6">
              <button
                onClick={() => navigate('/how-it-works')}
                className="hover:text-primary transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => navigate('/for-engineers')}
                className="hover:text-primary transition-colors"
              >
                For Engineers
              </button>
              <button
                onClick={() => navigate('/leaderboard')}
                className="hover:text-primary transition-colors"
              >
                Community
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
