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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1">
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary to-accent-blue bg-clip-text text-transparent">
                MixClub
              </h3>
              <p className="text-muted-foreground text-sm">
                Connecting artists with world-class audio engineers for professional mixing and mastering.
              </p>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => navigate("/mixing")}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    Mixing
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/mastering")}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    Mastering
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/for-engineers")}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    For Engineers
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/engineers")}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    Find Engineers
                  </button>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => navigate("/how-it-works")}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    How It Works
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/faq")}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    FAQ
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/terms")}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/privacy")}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="mailto:support@mixclubonline.com"
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    Support
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:legal@mixclubonline.com"
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    Legal
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 MixClub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
