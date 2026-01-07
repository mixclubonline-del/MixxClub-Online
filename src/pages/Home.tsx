import { SEOHead } from "@/components/SEOHead";
import { organizationSchema, serviceSchema } from "@/lib/seo-schema";
import Navigation from "@/components/Navigation";
import { AudioReactiveHero } from "@/components/landing/AudioReactiveHero";
import { RolePortals } from "@/components/landing/RolePortals";
import { BedroomToBillboard } from "@/components/home/BedroomToBillboard";
import { AIMasteringCTA } from "@/components/home/AIMasteringCTA";
import { SimplePackagePreview } from "@/components/home/SimplePackagePreview";
import { StudioHallway } from "@/components/scene/StudioHallway";
import { CommunityPulseDisplay } from "@/components/scene/CommunityPulseDisplay";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Professional Audio Mixing & Mastering Services"
        description="Transform your tracks into modern hits with MixClub's professional audio engineers. AI-enhanced mixing, mastering, and music production services starting at $29. Get studio-quality sound from anywhere."
        keywords="music mixing, mastering services, audio engineering, music production, mixing engineer, mastering engineer, online mixing, professional mixing, AI mixing"
        schema={{
          "@context": "https://schema.org",
          "@graph": [organizationSchema, serviceSchema]
        }}
      />
      
      <div className="relative min-h-screen flex flex-col overflow-hidden bg-background">
        {/* Navigation */}
        <div className="relative z-50">
          <Navigation />
        </div>
        
        {/* Content */}
        <main className="relative z-10">
          {/* Audio-Reactive Hero - Immersive entry experience */}
          <AudioReactiveHero />

          {/* Studio Hallway - Real-time session visualization */}
          <StudioHallway />

          {/* Community Pulse - Real progress toward unlockables */}
          <CommunityPulseDisplay />

          {/* Role Selection Portals */}
          <RolePortals />

          {/* Mission Statement */}
          <section>
            <BedroomToBillboard />
          </section>

          {/* AI Mastering */}
          <section>
            <AIMasteringCTA />
          </section>

          {/* Packages Preview */}
          <section>
            <SimplePackagePreview />
          </section>
      
          {/* Footer */}
          <footer className="bg-muted/30 border-t mt-20 relative">
            <div className="container mx-auto px-4 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Brand */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">MixClub</h3>
                  <p className="text-sm text-muted-foreground">
                    Professional mixing from $29 to $149+. Find your perfect engineer match.
                  </p>
                </div>

                {/* Services */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Services</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><button onClick={() => navigate('/services/mixing')} className="hover:text-primary transition-colors">Mixing</button></li>
                    <li><button onClick={() => navigate('/services/mastering')} className="hover:text-primary transition-colors">Mastering</button></li>
                    <li><button onClick={() => navigate('/services/ai-mastering')} className="hover:text-primary transition-colors">AI Mastering</button></li>
                    <li><button onClick={() => navigate('/services/distribution')} className="hover:text-primary transition-colors">Distribution</button></li>
                  </ul>
                </div>

                {/* Company */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Company</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><button onClick={() => navigate('/how-it-works')} className="hover:text-primary transition-colors">How It Works</button></li>
                    <li><button onClick={() => navigate('/for-engineers')} className="hover:text-primary transition-colors">For Engineers</button></li>
                    <li><button onClick={() => navigate('/faq')} className="hover:text-primary transition-colors">FAQ</button></li>
                  </ul>
                </div>

                {/* Connect */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Connect</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><a href="mailto:support@mixclub.com" className="hover:text-primary transition-colors">Support</a></li>
                    <li><a href="mailto:legal@mixclub.com" className="hover:text-primary transition-colors">Legal</a></li>
                  </ul>
                </div>
              </div>

              <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
                <p>&copy; 2026 MixClub. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
};

export default Home;
