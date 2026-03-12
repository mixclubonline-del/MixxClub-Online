import { SlideLayout, SlideTitle, SlideLabel } from './SlideLayout';
import { Zap, Layers, Users, Code2 } from 'lucide-react';

const METRICS = [
  { icon: Layers, value: '160+', label: 'Platform Features Built', desc: 'Full-stack: CRM, DAW, marketplace, streaming, economy, AI tools' },
  { icon: Code2, value: '13', label: 'Revenue Streams Implemented', desc: 'Subscriptions, beats, mixing, mastering, coins, gifting, distribution' },
  { icon: Users, value: '4', label: 'Role-Based CRMs', desc: 'Artist, Engineer, Producer, Fan — each with tailored workflows' },
  { icon: Zap, value: 'Live', label: 'Real-Time Collaboration', desc: 'Session rooms, audio streaming, chat, file sharing — production ready' },
];

const MILESTONES = [
  'AI Audio Intelligence engine operational',
  'Beat marketplace with licensing & royalty tracking',
  'MixxCoinz virtual economy with gifting',
  'Hybrid DAW with real-time session recording',
  'Brand Forge AI for marketing asset generation',
  'Mobile-responsive progressive web app',
];

export function TractionSlide() {
  return (
    <SlideLayout>
      <SlideLabel>Traction & Progress</SlideLabel>
      <SlideTitle>Built, Not Pitched</SlideTitle>

      <div className="flex-1 flex gap-12 mt-10">
        {/* Left — big metrics */}
        <div className="flex-1 grid grid-cols-2 gap-8 content-center">
          {METRICS.map((m) => (
            <div key={m.label} className="rounded-2xl bg-card/50 border border-border/30 p-8">
              <m.icon className="w-8 h-8 text-primary mb-4" />
              <p className="text-[48px] font-bold text-foreground">{m.value}</p>
              <p className="text-[22px] text-primary mt-1">{m.label}</p>
              <p className="text-[16px] text-muted-foreground mt-2">{m.desc}</p>
            </div>
          ))}
        </div>

        {/* Right — milestone list */}
        <div className="w-[600px] flex flex-col justify-center">
          <h3 className="text-[28px] font-semibold text-foreground mb-6">Key Milestones Achieved</h3>
          <div className="space-y-5">
            {MILESTONES.map((m, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-1">
                  <span className="text-emerald-400 text-[14px]">✓</span>
                </div>
                <p className="text-[20px] text-foreground/80">{m}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}
