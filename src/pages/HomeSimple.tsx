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

      <main className="min-h-screen bg-gradient-to-b from-background via-[hsl(265_50%_10%)] to-background text-foreground">
        <GlobalHeader />
        
        {/* Hero */}
        <section className="pt-32 pb-12 text-center relative">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-blue))]">
            Welcome to Mixx Club
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">From bedroom to billboard.</p>
          <a 
            href="/network" 
            className="mt-6 inline-block px-6 py-3 rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-blue))] text-foreground hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)] transition-all"
          >
            Enter the Hub →
          </a>
        </section>
        
        {/* Ecosystem */}
        <EcosystemSection />
      </main>
    </>
  );
}
