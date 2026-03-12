import { SlideLayout, SlideTitle, SlideLabel } from './SlideLayout';
import { REVENUE_STREAMS } from '@/components/finance/projectionModels';

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  core: { label: 'Core Platform', color: 'bg-primary/20 text-primary border-primary/30' },
  marketplace: { label: 'Marketplace', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  economy: { label: 'Virtual Economy', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  services: { label: 'Professional Services', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
  growth: { label: 'Growth & Expansion', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
};

const categories = ['core', 'marketplace', 'economy', 'services', 'growth'] as const;

export function BusinessModelSlide() {
  return (
    <SlideLayout>
      <SlideLabel>Business Model</SlideLabel>
      <SlideTitle>13 Diversified Revenue Streams</SlideTitle>
      <p className="text-[24px] text-muted-foreground mt-2">
        Revenue diversity reduces single-point-of-failure risk. No single stream exceeds 30% of total revenue.
      </p>

      <div className="flex-1 grid grid-cols-5 gap-6 mt-10">
        {categories.map((cat) => {
          const meta = CATEGORY_META[cat];
          const streams = REVENUE_STREAMS.filter((s) => s.category === cat);
          return (
            <div key={cat} className={`rounded-2xl border p-6 ${meta.color}`}>
              <h3 className="text-[18px] font-bold mb-4">{meta.label}</h3>
              <div className="space-y-3">
                {streams.map((s) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-[16px] text-foreground/80">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center gap-8 text-[18px] text-muted-foreground">
        <span>💰 Platform take rate: <strong className="text-foreground">15–30%</strong></span>
        <span>📈 Avg gross margin: <strong className="text-foreground">83%</strong></span>
        <span>🔄 Recurring revenue: <strong className="text-foreground">65%+</strong></span>
      </div>
    </SlideLayout>
  );
}
