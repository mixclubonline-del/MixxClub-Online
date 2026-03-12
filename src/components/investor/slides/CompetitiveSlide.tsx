import { SlideLayout, SlideTitle, SlideLabel } from './SlideLayout';

const COMPETITORS = [
  { name: 'SoundBetter', category: 'Engineer Marketplace', has: ['Engineer discovery', 'Project matching'], lacks: ['Real-time collab', 'Beat marketplace', 'Fan economy'] },
  { name: 'BeatStars', category: 'Beat Marketplace', has: ['Beat sales', 'Licensing'], lacks: ['Mixing/mastering', 'Live sessions', 'Community'] },
  { name: 'DistroKid', category: 'Distribution', has: ['Music distribution', 'Streaming'], lacks: ['Production tools', 'Collaboration', 'Marketplace'] },
  { name: 'Splice', category: 'Samples & Plugins', has: ['Sample library', 'Rent-to-own'], lacks: ['Artist services', 'Fan engagement', 'Commerce'] },
];

export function CompetitiveSlide() {
  return (
    <SlideLayout>
      <SlideLabel>Competitive Landscape</SlideLabel>
      <SlideTitle>Full Stack vs. Point Solutions</SlideTitle>
      <p className="text-[24px] text-muted-foreground mt-2">
        Competitors own fragments. Mixx Club owns the entire creative-to-commerce pipeline.
      </p>

      <div className="flex-1 mt-10">
        <div className="grid grid-cols-4 gap-6 h-full content-start">
          {COMPETITORS.map((c) => (
            <div key={c.name} className="rounded-2xl bg-card/50 border border-border/30 p-8">
              <h3 className="text-[26px] font-bold text-foreground">{c.name}</h3>
              <p className="text-[16px] text-muted-foreground mt-1 mb-6">{c.category}</p>

              <p className="text-[14px] font-semibold text-emerald-400 mb-2 uppercase tracking-wider">They Have</p>
              {c.has.map((h) => (
                <p key={h} className="text-[16px] text-foreground/70 mb-1">✓ {h}</p>
              ))}

              <p className="text-[14px] font-semibold text-destructive mt-5 mb-2 uppercase tracking-wider">They Lack</p>
              {c.lacks.map((l) => (
                <p key={l} className="text-[16px] text-foreground/70 mb-1">✗ {l}</p>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/20 text-center">
          <p className="text-[22px] text-primary font-semibold">
            Mixx Club is the only platform where an artist can discover an engineer, mix a track in a live session, sell it on a marketplace, distribute to Spotify, and reward their fans — all without leaving.
          </p>
        </div>
      </div>
    </SlideLayout>
  );
}
