import { SlideLayout, SlideTitle, SlideLabel } from './SlideLayout';

const RINGS = [
  { label: 'TAM', value: '$42B', desc: 'Global music production & distribution market', size: 600, color: 'border-primary/20 bg-primary/5' },
  { label: 'SAM', value: '$8.2B', desc: 'Online collaboration, beats, mixing, mastering', size: 420, color: 'border-primary/40 bg-primary/10' },
  { label: 'SOM', value: '$410M', desc: 'Independent creators actively spending on production tools', size: 240, color: 'border-primary/60 bg-primary/20' },
];

export function MarketSlide() {
  return (
    <SlideLayout>
      <div className="flex h-full gap-16">
        {/* Left — concentric circles */}
        <div className="flex-1 flex items-center justify-center relative">
          {RINGS.map((ring) => (
            <div
              key={ring.label}
              className={`absolute rounded-full border-2 ${ring.color} flex items-end justify-center`}
              style={{ width: ring.size, height: ring.size }}
            >
              {ring.label === 'TAM' && (
                <span className="text-[16px] text-muted-foreground mb-4">{ring.label}</span>
              )}
            </div>
          ))}
          <div className="relative z-10 text-center">
            <span className="text-[48px] font-bold text-primary">$410M</span>
            <br />
            <span className="text-[20px] text-muted-foreground">SOM</span>
          </div>
        </div>

        {/* Right — details */}
        <div className="flex-1 flex flex-col justify-center">
          <SlideLabel>Market Opportunity</SlideLabel>
          <SlideTitle>A $42B Market Ready for Disruption</SlideTitle>
          <div className="mt-12 space-y-8">
            {RINGS.map((ring) => (
              <div key={ring.label} className="flex items-start gap-6">
                <span className="text-[40px] font-bold text-primary min-w-[160px]">{ring.value}</span>
                <div>
                  <h3 className="text-[24px] font-semibold text-foreground">{ring.label}</h3>
                  <p className="text-[20px] text-muted-foreground">{ring.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 rounded-2xl bg-accent/5 border border-accent/20">
            <p className="text-[20px] text-accent">
              <strong>Key Insight:</strong> 67% of music creators are under 35 and digital-native — demanding collaborative, mobile-first tools.
            </p>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}
