import React, { useMemo } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ScenarioKey, projectAll } from './projectionModels';
import { GlassPanel } from '@/components/crm/design';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, DollarSign, Calendar } from 'lucide-react';

interface Props { scenario: ScenarioKey; }

export const BreakEvenAnalysis: React.FC<Props> = React.memo(({ scenario }) => {
  const proj = useMemo(() => projectAll(scenario), [scenario]);

  const chartData = proj.cumulative.map(c => ({
    month: c.month,
    revenue: c.revenue,
    costs: c.costs,
    net: c.net,
  }));

  const lastMonth = proj.cumulative[11];
  const avgBurn = Math.round(proj.monthlyCosts.reduce((a, b) => a + b, 0) / 12);

  const metrics = [
    { icon: Calendar, label: 'Break-Even', value: proj.breakEvenMonth ? `Month ${proj.breakEvenMonth}` : 'N/A', accent: 'text-emerald-400' },
    { icon: DollarSign, label: 'Avg Monthly Burn', value: formatCurrency(avgBurn), accent: 'text-amber-400' },
    { icon: TrendingUp, label: 'Year-End Net', value: formatCurrency(lastMonth.net), accent: lastMonth.net >= 0 ? 'text-emerald-400' : 'text-red-400' },
  ];

  return (
    <GlassPanel className="w-full" padding="p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">Break-Even Analysis</h3>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {metrics.map(m => (
          <div key={m.label} className="rounded-xl bg-white/5 border border-white/8 p-3 text-center">
            <m.icon className={`w-4 h-4 mx-auto mb-1 ${m.accent}`} />
            <p className={`text-lg font-bold ${m.accent}`}>{m.value}</p>
            <p className="text-[10px] text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
              formatter={(value: number, name: string) => [formatCurrency(value), name === 'revenue' ? 'Cumulative Revenue' : name === 'costs' ? 'Cumulative Costs' : 'Net']}
            />
            {proj.breakEvenMonth && (
              <ReferenceLine x={`Mo ${proj.breakEvenMonth}`} stroke="rgba(16,185,129,0.6)" strokeDasharray="4 4" label={{ value: 'Break-Even', fill: '#10b981', fontSize: 10, position: 'top' }} />
            )}
            <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} name="revenue" />
            <Line type="monotone" dataKey="costs" stroke="#ef4444" strokeWidth={2} dot={false} name="costs" />
            <Line type="monotone" dataKey="net" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" dot={false} name="net" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </GlassPanel>
  );
});

BreakEvenAnalysis.displayName = 'BreakEvenAnalysis';
