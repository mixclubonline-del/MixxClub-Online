import { SlideLayout, SlideTitle, SlideLabel } from './SlideLayout';

const WAVES = [
  {
    phase: 'Wave 1',
    timeline: 'Months 1–3',
    title: 'Engineers & Studios',
    desc: 'Onboard professional mixing/mastering engineers with free tools. They become the supply side — attracting artists who need services.',
    color: 'border-secondary/40 bg-secondary/5',
    accent: 'text-secondary',
    targets: ['50 verified engineers', 'Atlanta + LA + NYC focus', 'Studio partnership program'],
  },
  {
    phase: 'Wave 2',
    timeline: 'Months 3–6',
    title: 'Independent Artists',
    desc: 'Artists join to access engineers, upload music, collaborate in real-time, and distribute. Network effects begin compounding.',
    color: 'border-primary/40 bg-primary/5',
    accent: 'text-primary',
    targets: ['500 active artists', 'Beat marketplace launch', 'First revenue milestone'],
  },
  {
    phase: 'Wave 3',
    timeline: 'Months 6–12',
    title: 'Producers & Fans',
    desc: 'Producers sell beats and track royalties. Fans join via Day-1 recognition, gifting, and premieres. Full ecosystem activated.',
    color: 'border-accent/40 bg-accent/5',
    accent: 'text-accent',
    targets: ['1,000+ total users', 'MixxCoinz economy live', 'Community flywheel spinning'],
  },
];

export function GoToMarketSlide() {
  return (
    <SlideLayout>
      <SlideLabel>Go-to-Market</SlideLabel>
      <SlideTitle>Three-Wave Launch Strategy</SlideTitle>
      <p className="text-[24px] text-muted-foreground mt-2">
        Supply-side first: engineers create gravity that pulls artists, who attract producers and fans.
      </p>

      <div className="flex-1 flex gap-10 mt-10">
        {WAVES.map((wave) => (
          <div key={wave.phase} className={`flex-1 rounded-3xl border-2 ${wave.color} p-10 flex flex-col`}>
            <div className="flex items-center gap-4 mb-6">
              <span className={`text-[16px] font-bold ${wave.accent} tracking-wider uppercase`}>{wave.phase}</span>
              <span className="text-[16px] text-muted-foreground">{wave.timeline}</span>
            </div>
            <h3 className={`text-[32px] font-bold ${wave.accent} mb-4`}>{wave.title}</h3>
            <p className="text-[18px] text-muted-foreground leading-relaxed mb-8">{wave.desc}</p>

            <div className="mt-auto space-y-3">
              {wave.targets.map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${wave.accent.replace('text-', 'bg-')}`} />
                  <span className="text-[16px] text-foreground/70">{t}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SlideLayout>
  );
}
