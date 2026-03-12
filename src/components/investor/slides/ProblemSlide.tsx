import { SlideLayout, SlideTitle, SlideLabel } from './SlideLayout';
import { DollarSign, Clock, Lock } from 'lucide-react';

const PROBLEMS = [
  {
    icon: DollarSign,
    title: '$1,200+ Average Mix Cost',
    desc: 'Professional mixing is prohibitively expensive for independent artists. 87% of musicians earn less than $15K/year yet need studio-quality production to compete.',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
  },
  {
    icon: Clock,
    title: '3–6 Week Turnaround',
    desc: 'Traditional studio workflows create massive bottlenecks. Artists lose momentum, miss release windows, and pay rush fees for basic iteration cycles.',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
  {
    icon: Lock,
    title: 'Gatekept Ecosystem',
    desc: 'The music industry extracts 70–85% of artist revenue through opaque licensing, unfair splits, and platform lock-in. Creators keep pennies on the dollar.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
];

export function ProblemSlide() {
  return (
    <SlideLayout>
      <SlideLabel>The Problem</SlideLabel>
      <SlideTitle>The Music Industry Is Broken</SlideTitle>
      <p className="text-[28px] text-muted-foreground mt-4 max-w-[1200px]">
        Independent creators face three structural barriers that prevent them from building sustainable careers.
      </p>

      <div className="flex-1 flex items-center">
        <div className="grid grid-cols-3 gap-12 w-full mt-8">
          {PROBLEMS.map((p) => (
            <div key={p.title} className="rounded-3xl border border-border/30 bg-card/50 p-12">
              <div className={`w-16 h-16 rounded-2xl ${p.bg} flex items-center justify-center mb-8`}>
                <p.icon className={`w-8 h-8 ${p.color}`} />
              </div>
              <h3 className={`text-[32px] font-bold ${p.color} mb-4`}>{p.title}</h3>
              <p className="text-[22px] text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </SlideLayout>
  );
}
