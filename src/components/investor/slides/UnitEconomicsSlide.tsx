import { SlideLayout, SlideTitle, SlideLabel } from './SlideLayout';
import { unitEconomics } from '@/components/finance/projectionModels';
import { formatCurrency } from '@/lib/utils';
import { useMemo } from 'react';

export function UnitEconomicsSlide() {
  const ue = useMemo(() => unitEconomics('moderate'), []);

  const metrics = [
    { label: 'Blended ARPU', value: `${formatCurrency(ue.arpu)}/mo`, color: 'text-secondary' },
    { label: 'Paying ARPU', value: `${formatCurrency(ue.payingArpu)}/mo`, color: 'text-primary' },
    { label: 'LTV (12-month)', value: formatCurrency(ue.ltv12), color: 'text-accent' },
    { label: 'CAC Target', value: formatCurrency(ue.cac), color: 'text-amber-400' },
    { label: 'LTV:CAC Ratio', value: `${ue.ltvCac.toFixed(1)}x`, color: ue.ltvCac >= 3 ? 'text-emerald-400' : 'text-amber-400' },
    { label: 'Gross Margin', value: `${ue.grossMargin.toFixed(1)}%`, color: 'text-teal-400' },
    { label: 'Payback Period', value: `${ue.paybackMonths} months`, color: 'text-pink-400' },
    { label: 'Conversion Rate', value: '55%', color: 'text-violet-400' },
  ];

  return (
    <SlideLayout>
      <SlideLabel>Unit Economics</SlideLabel>
      <SlideTitle>Strong Fundamentals at Scale</SlideTitle>
      <p className="text-[24px] text-muted-foreground mt-2">
        Moderate scenario — per 1,000 user cohort. {ue.payingUsers} paying users ({((ue.payingUsers / ue.totalUsers) * 100).toFixed(0)}% conversion).
      </p>

      <div className="flex-1 grid grid-cols-4 gap-8 mt-12 content-center">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-3xl bg-card/50 border border-border/30 p-10 text-center">
            <p className={`text-[48px] font-bold ${m.color}`}>{m.value}</p>
            <p className="text-[20px] text-muted-foreground mt-3">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
        <p className="text-[20px] text-emerald-400">
          <strong>Benchmark:</strong> SaaS industry standard LTV:CAC is 3:1. Our {ue.ltvCac.toFixed(1)}x ratio indicates efficient acquisition with room for aggressive growth investment.
        </p>
      </div>
    </SlideLayout>
  );
}
