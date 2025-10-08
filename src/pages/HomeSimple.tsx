import { Helmet } from 'react-helmet-async';
import { Suspense, lazy } from 'react';
import GlobalHeader from "@/components/GlobalHeader";
import EcosystemSection from "@/components/mixclub/EcosystemSection";
import { SplineBackground } from '@/components/3d/spline/SplineBackground';

const SplineLoader = lazy(() => import('@/components/3d/spline/SplineLoader').then(m => ({ default: m.SplineLoader })));

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

      <main className="min-h-screen bg-gradient-to-b from-background via-[hsl(265_50%_10%)] to-background text-foreground relative overflow-hidden">
        <SplineBackground 
          scene="https://prod.spline.design/Xqw7yqfqzKP01SoH/scene.splinecode"
          className="opacity-20"
        />
        <GlobalHeader />
        
        {/* Hero with 3D Spline Scene */}
        <section className="pt-32 pb-12 text-center relative z-10">
          <div className="mb-8 h-[500px] max-w-4xl mx-auto">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-4xl animate-pulse">🎵</div>
              </div>
            }>
              <SplineLoader 
                scene="https://prod.spline.design/Xqw7yqfqzKP01SoH/scene.splinecode"
                className="w-full h-full"
              />
            </Suspense>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-blue))]">
            Welcome to Mixx Club
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">From bedroom to billboard.</p>
          <a 
            href="/network" 
            className="mt-6 inline-block px-6 py-3 rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-blue))] text-foreground hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)] transition-all hover:scale-105"
          >
            Enter the Hub →
          </a>
        </section>
        
        {/* Ecosystem */}
        <div className="relative z-10">
          <EcosystemSection />
        </div>
      </main>
    </>
  );
}
