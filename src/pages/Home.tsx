import { MobileAppDownloadPopup } from "@/components/MobileAppDownloadPopup";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import { HomeShowcaseSlideshow } from "@/components/HomeShowcaseSlideshow";
import { LiveCommunityCounter } from "@/components/home/LiveCommunityCounter";
import { TierShowcase } from "@/components/home/TierShowcase";
import { ValueProposition } from "@/components/home/ValueProposition";
import { LiveActivityFeed } from "@/components/home/LiveActivityFeed";
import { BeforeAfterComparison } from "@/components/BeforeAfterComparison";
import { RecentSuccesses } from "@/components/RecentSuccesses";
import { InstantDemoSection } from "@/components/InstantDemoSection";
import { PackagesShop } from "@/components/crm/PackagesShop";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Mobile App Marketing Pop-up */}
      <MobileAppDownloadPopup />
      
      {/* Slideshow Introduction */}
      <HomeShowcaseSlideshow />
      
      {/* Hero Section */}
      <Hero />

      {/* Value Proposition for Artists & Engineers - Prominent Placement */}
      <section className="py-20 bg-gradient-to-b from-background to-[hsl(262_30%_8%)]">
        <div className="container px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-primary via-accent-blue to-accent-cyan bg-clip-text text-transparent">
                Choose Your Path
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Whether you're creating or engineering, MixClub has your journey covered
            </p>
          </div>
          <ValueProposition />
        </div>
      </section>

      {/* Before/After Comparison - Moved here */}
      <section className="py-20 bg-gradient-to-b from-[hsl(262_30%_8%)] to-background">
        <div className="container px-6">
          <BeforeAfterComparison />
        </div>
      </section>

      {/* AI Mastering Trial */}
      <InstantDemoSection />

      {/* Packages Shop */}
      <section className="py-20 bg-gradient-to-b from-background to-[hsl(262_30%_8%)]">
        <div className="container px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-primary via-accent-blue to-accent-cyan bg-clip-text text-transparent">
                Choose Your Package
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional mixing and mastering services tailored to your needs
            </p>
          </div>
          <PackagesShop />
        </div>
      </section>

      {/* Live Community Status */}
      <section className="py-12 bg-[hsl(262_30%_8%)]">
        <div className="container px-6">
          <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            <div className="lg:col-span-2">
              <LiveCommunityCounter />
            </div>
            <div>
              <LiveActivityFeed />
            </div>
          </div>
        </div>
      </section>

      {/* Tier-Based Feature Showcase */}
      <section className="py-20 bg-gradient-to-b from-[hsl(262_30%_8%)] to-background">
        <div className="container px-6">
          <TierShowcase />
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-gradient-to-b from-[hsl(262_30%_8%)] to-background">
        <div className="container px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-primary via-accent-blue to-accent-cyan bg-clip-text text-transparent">
                Real Results, Real Artists
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of musicians getting professional sound
            </p>
          </div>
          
          <RecentSuccesses />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card">
        <div className="container px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="md:col-span-2">
                <h3 className="text-2xl font-black mb-3 bg-gradient-to-r from-primary to-accent-blue bg-clip-text text-transparent">
                  MixClubOnline
                </h3>
                <p className="text-muted-foreground mb-4">
                  By musicians, for musicians. Join the community that's redefining music collaboration.
                </p>
                <p className="text-sm text-muted-foreground">
                  © 2025 MixClubOnline. All rights reserved.
                </p>
              </div>
              
              <div>
                <h4 className="font-bold mb-3">Platform</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/mixing')}
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Mixing
                  </button>
                  <button
                    onClick={() => navigate('/mastering')}
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Mastering
                  </button>
                  <button
                    onClick={() => navigate('/artist-crm')}
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Artist Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/engineer-crm')}
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Engineer Dashboard
                  </button>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold mb-3">Community</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/leaderboard')}
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Leaderboard
                  </button>
                  <button
                    onClick={() => navigate('/how-it-works')}
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    How It Works
                  </button>
                  <button
                    onClick={() => navigate('/for-engineers')}
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    For Engineers
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
