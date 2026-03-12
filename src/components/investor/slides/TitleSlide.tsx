import { Music } from 'lucide-react';

export function TitleSlide() {
  return (
    <div className="w-[1920px] h-[1080px] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/8 blur-[200px]" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[150px]" />
      </div>

      <div className="relative z-10 text-center">
        <div className="w-[120px] h-[120px] rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-12">
          <Music className="w-16 h-16 text-primary-foreground" />
        </div>

        <h1 className="text-[96px] font-bold text-foreground tracking-tight leading-none">
          Mixx Club
        </h1>
        <p className="text-[40px] text-primary mt-6 font-light tracking-wide">
          From Bedroom to Billboard
        </p>
        <p className="text-[24px] text-muted-foreground mt-8 max-w-[800px] mx-auto leading-relaxed">
          The all-in-one music creation, collaboration, and commerce platform connecting artists, engineers, producers, and fans.
        </p>

        <div className="mt-16 flex items-center gap-8 justify-center">
          <span className="text-[18px] text-muted-foreground/60">Mixxed AI Technology Company</span>
          <span className="text-[18px] text-muted-foreground/40">•</span>
          <span className="text-[18px] text-muted-foreground/60">Investor Presentation 2026</span>
        </div>
      </div>
    </div>
  );
}
