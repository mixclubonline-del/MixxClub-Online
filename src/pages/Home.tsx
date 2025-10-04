import { SEOHead } from "@/components/SEOHead";
import { organizationSchema, serviceSchema } from "@/lib/seo-schema";
import Navigation from "@/components/Navigation";
import { PrimeHero } from "@/components/home/PrimeHero";
import { AIShowcase } from "@/components/home/AIShowcase";
import { AISessionPrepShowcase } from "@/components/home/AISessionPrepShowcase";
import { CommunityMilestonesShowcase } from "@/components/home/CommunityMilestonesShowcase";
import { UserJourneys } from "@/components/home/UserJourneys";
import { AIMasteringCTA } from "@/components/home/AIMasteringCTA";
import { ValueProposition } from "@/components/home/ValueProposition";
import { TierShowcase } from "@/components/home/TierShowcase";
import { RecentSuccesses } from "@/components/RecentSuccesses";
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
      
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <PrimeHero />
        <AISessionPrepShowcase />
        <AIShowcase />
        <CommunityMilestonesShowcase />
        <UserJourneys />
        <ValueProposition />
        <AIMasteringCTA />
        <TierShowcase />
        <RecentSuccesses />
        
        {/* Footer */}
        <footer className="bg-muted/30 border-t mt-20">
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
                  <li><button onClick={() => navigate('/mixing')} className="hover:text-primary transition-colors">Mixing</button></li>
                  <li><button onClick={() => navigate('/mastering')} className="hover:text-primary transition-colors">Mastering</button></li>
                  <li><button onClick={() => navigate('/studio-directory')} className="hover:text-primary transition-colors">Studio Sessions</button></li>
                  <li><button onClick={() => navigate('/distribution-hub')} className="hover:text-primary transition-colors">Distribution</button></li>
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
              <p>&copy; 2024 MixClub. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;
