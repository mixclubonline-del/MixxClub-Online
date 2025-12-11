import { Helmet } from 'react-helmet-async';
import GlobalHeader from "@/components/GlobalHeader";
import EcosystemSection from "@/components/mixclub/EcosystemSection";

export default function HomeSimple() {
  return (
    <>
      <Helmet>
        <title>Mixx Club Online — From Bedroom to Billboard</title>
        <meta 
          name="description" 
          content="Transform your music from bedroom recordings to radio-ready tracks. Connect with engineers, access AI tools, and join the future of music collaboration." 
        />
      </Helmet>

      <main className="min-h-screen text-foreground relative overflow-hidden">
        {/* Prime Studio Background */}
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/assets/prime-pointing.jpg)',
            filter: 'brightness(0.4) saturate(1.2)',
          }}
        />
        <div className="fixed inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="fixed inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
        
        <div className="relative z-10">
          <GlobalHeader />
          
          {/* Hero */}
          <section className="pt-32 pb-12 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-blue))]">
              Welcome to Mixx Club
            </h1>
            <p className="mt-3 text-xl text-foreground/80">From bedroom to billboard.</p>
            <div className="flex gap-4 justify-center mt-8">
              <a 
                href="/network" 
                className="px-8 py-4 rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-blue))] text-foreground font-semibold hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)] transition-all"
              >
                Enter the Hub →
              </a>
              <a 
                href="/brand-forge" 
                className="px-8 py-4 rounded-full border border-primary/50 text-foreground font-semibold hover:bg-primary/10 transition-all"
              >
                Brand Forge
              </a>
            </div>
          </section>
          
          {/* Ecosystem */}
          <EcosystemSection />
        </div>
      </main>
    </>
  );
}
