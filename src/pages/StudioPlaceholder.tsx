import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import GlobalHeader from '@/components/GlobalHeader';
import { usePrime } from '@/contexts/PrimeContext';
import PrimeGlow from '@/components/prime/PrimeGlow';

export default function StudioPlaceholder() {
  const { systemMode } = usePrime();
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Helmet>
        <title>Studio Loading — MixClub Online</title>
        <meta 
          name="description" 
          content="Loading Mixx Club Studio - Professional collaborative audio workspace" 
        />
      </Helmet>

      <div className="min-h-screen bg-[#0a0a1a]">
        <GlobalHeader />
        
        <main className="max-w-7xl mx-auto px-6 py-16">
          <div className="min-h-[70vh] flex flex-col items-center justify-center">
            <PrimeGlow intensity={0.8}>
              <div className="text-center">
                {/* Liquid light animation */}
                <div className="relative w-32 h-32 mx-auto mb-8">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent via-accent-blue to-accent-cyan animate-spin-slow opacity-20 blur-xl" />
                  <div className="absolute inset-4 rounded-full bg-gradient-to-br from-accent-cyan via-accent to-accent-blue animate-pulse opacity-40 blur-lg" />
                  <div className="absolute inset-8 rounded-full bg-gradient-to-br from-accent to-accent-cyan animate-spin opacity-60" />
                </div>

                <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent-blue to-accent-cyan">
                  Initializing Studio{dots}
                </h1>
                
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                  Preparing your collaborative audio workspace
                </p>

                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card/30 backdrop-blur-sm border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-sm font-mono text-accent-cyan">
                    PRIME STATUS: {systemMode.toUpperCase()}
                  </span>
                </div>

                <div className="mt-12 space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-accent-blue animate-pulse" />
                    <span>Loading audio engine</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <span>Establishing real-time connection</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-accent-cyan animate-pulse" style={{ animationDelay: '0.4s' }} />
                    <span>Preparing workspace</span>
                  </div>
                </div>
              </div>
            </PrimeGlow>
          </div>
        </main>
      </div>
    </>
  );
}
