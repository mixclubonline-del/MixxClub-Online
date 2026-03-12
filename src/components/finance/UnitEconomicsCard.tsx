import React, { useMemo } from 'react';
import { ScenarioKey, unitEconomics } from './projectionModels';
import { GlassPanel } from '@/components/crm/design';
import { formatCurrency } from '@/lib/utils';
import { Users, DollarSign, TrendingUp, Target, BarChart3, Clock, PieChart } from 'lucide-react';

interface Props { scenario: ScenarioKey; }

export const UnitEconomicsCard: React.FC<Props> = React.memo(({ scenario }) => {
  const ue = useMemo(() => unitEconomics(scenario), [scenario]);

  const cards = [
    { icon: Users, label: 'ARPU (blended)', value: `${formatCurrency(ue.arpu)}/mo`, accent: 'text-blue-400' },
    { icon: DollarSign, label: 'Paying ARPU', value: `${formatCurrency(ue.payingArpu)}/mo`, accent: 'text-purple-400' },
    { icon: TrendingUp, label: 'LTV (12-mo)', value: formatCurrency(ue.ltv12), accent: 'text-emerald-400' },
    { icon: Target, label: 'CAC Target', value: formatCurrency(ue.cac), accent: 'text-amber-400' },
    { icon: BarChart3, label: 'LTV:CAC Ratio', value: `${ue.ltvCac.toFixed(1)}x`, accent: ue.ltvCac >= 3 ? 'text-emerald-400' : 'text-amber-400' },
    { icon: PieChart, label: 'Gross Margin', value: `${ue.grossMargin.toFixed(1)}%`, accent: 'text-cyan-400' },
    { icon: Clock, label: 'Payback Period', value: `${ue.paybackMonths} mo`, accent: 'text-pink-400' },
    { icon: Users, label: 'Paying Users', value: `${ue.payingUsers} / ${ue.totalUsers}`, accent: 'text-violet-400' },
  ];

  return (
    <GlassPanel className="w-full" padding="p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">Unit Economics</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map(c => (
          <div key={c.label} className="rounded-xl bg-white/5 border border-white/8 p-3">
            <c.icon className={`w-4 h-4 mb-1.5 ${c.accent}`} />
            <p className={`text-lg font-bold ${c.accent}`}>{c.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
});

UnitEconomicsCard.displayName = 'UnitEconomicsCard';
