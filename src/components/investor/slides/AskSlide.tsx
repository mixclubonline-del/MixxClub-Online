import { SlideLayout, SlideTitle, SlideLabel } from './SlideLayout';
import { formatCurrency } from '@/lib/utils';

const USE_OF_FUNDS = [
  { label: 'Engineering & Infrastructure', pct: 40, amount: 200000, color: 'bg-primary' },
  { label: 'Creator Acquisition & Marketing', pct: 25, amount: 125000, color: 'bg-secondary' },
  { label: 'Key Hires (3 roles)', pct: 20, amount: 100000, color: 'bg-accent' },
  { label: 'Operations & Legal', pct: 15, amount: 75000, color: 'bg-amber-500' },
];

const MILESTONES_18MO = [
  '1,000 active creators on platform',
  '100 verified engineers onboarded',
  '$50K MRR across 13 revenue streams',
  'Mobile app launched (iOS + Android via Capacitor)',
  'Series A readiness with proven unit economics',
];

export function AskSlide() {
  return (
    <SlideLayout>
      <div className="flex h-full gap-16">
        {/* Left — the ask */}
        <div className="flex-1 flex flex-col justify-center">
          <SlideLabel>The Ask</SlideLabel>
          <SlideTitle>$500K Pre-Seed Round</SlideTitle>
          <p className="text-[24px] text-muted-foreground mt-4 mb-10">
            SAFE note — 18-month runway to hit Series A milestones.
          </p>

          <h3 className="text-[24px] font-semibold text-foreground mb-6">Use of Funds</h3>
          <div className="space-y-4">
            {USE_OF_FUNDS.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-[18px] mb-2">
                  <span className="text-foreground">{item.label}</span>
                  <span className="text-muted-foreground">{formatCurrency(item.amount)} ({item.pct}%)</span>
                </div>
                <div className="h-3 rounded-full bg-muted/30 overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — milestones */}
        <div className="w-[650px] flex flex-col justify-center">
          <h3 className="text-[28px] font-semibold text-foreground mb-8">18-Month Milestones</h3>
          <div className="space-y-6">
            {MILESTONES_18MO.map((m, i) => (
              <div key={i} className="flex items-start gap-5 p-6 rounded-2xl bg-card/50 border border-border/30">
                <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
                  <span className="text-[16px] font-bold text-primary">{i + 1}</span>
                </div>
                <p className="text-[20px] text-foreground/80 pt-1.5">{m}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <p className="text-[24px] text-primary font-bold">ravenis@mixxclub.com</p>
            <p className="text-[18px] text-muted-foreground mt-2">Let's build the future of music together.</p>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}
