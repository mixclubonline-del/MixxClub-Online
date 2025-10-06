import { Helmet } from 'react-helmet-async';
import GlobalHeader from "@/components/GlobalHeader";

export default function Network() {
  return (
    <>
      <Helmet>
        <title>Mixx Club Hub — Interactive Network Portal</title>
        <meta 
          name="description" 
          content="Enter the Mixx Club Hub - an interactive 3D portal connecting artists, engineers, and fans in a living network." 
        />
      </Helmet>

      <div className="min-h-screen bg-[hsl(var(--background))] text-foreground">
        <GlobalHeader />
        
        {/* Onboarding overlay */}
        <section className="fixed inset-0 z-30 flex items-center justify-center bg-[radial-gradient(circle_at_center,hsl(235_60%_6%)_0%,hsl(235_60%_8%)_100%)] animate-fade-in">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-blue))]">
              Mixx Club Hub
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Connecting to the Mixx Club Hub…</p>
            <div className="mt-4 w-48 h-1 mx-auto rounded-full bg-[hsl(var(--muted)/0.3)] overflow-hidden">
              <div className="h-full w-3/4 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-cyan))] animate-pulse" />
            </div>
          </div>
        </section>

        {/* Spline embed */}
        <div className="pt-16 h-[100vh]">
          <iframe
            src="https://my.spline.design/mixxclublivinghub"
            className="w-full h-full border-0"
            allow="fullscreen"
            title="Mixx Club Interactive Hub"
            onLoad={(e) => {
              const overlay = document.querySelector<HTMLElement>("section.fixed.inset-0.z-30");
              if (overlay) { 
                overlay.style.opacity = "0"; 
                overlay.style.transition = "opacity 600ms ease-out";
                setTimeout(() => overlay.style.display = "none", 600); 
              }
            }}
          />
        </div>
      </div>
    </>
  );
}
