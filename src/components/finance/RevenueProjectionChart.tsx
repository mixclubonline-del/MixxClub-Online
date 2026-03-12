import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ScenarioKey, REVENUE_STREAMS, projectStream } from './projectionModels';
import { GlassPanel } from '@/components/crm/design';
import { formatCurrency } from '@/lib/utils';

interface Props {
  scenario: ScenarioKey;
}

export const RevenueProjectionChart: React.FC<Props> = React.memo(({ scenario }) => {
  const data = useMemo(() => {
    const projections = REVENUE_STREAMS.map(s => ({ stream: s, monthly: projectStream(s, scenario) }));
    return Array.from({ length: 12 }, (_, i) => {
      const point: Record<string, string | number> = { month: `Mo ${i + 1}` };
      projections.forEach(p => { point[p.stream.id] = p.monthly[i]; });
      point.total = projections.reduce((sum, p) => sum + p.monthly[i], 0);
      return point;
    });
  }, [scenario]);

  return (
    <GlassPanel className="w-full" padding="p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">12-Month Revenue Projection</h3>
      <div className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
              formatter={(value: number, name: string) => {
                const stream = REVENUE_STREAMS.find(s => s.id === name);
                return [formatCurrency(value), stream?.name || name];
              }}
              labelFormatter={l => `Month ${String(l).replace('Mo ', '')}`}
            />
            <Legend
              wrapperStyle={{ fontSize: 11 }}
              formatter={(value: string) => REVENUE_STREAMS.find(s => s.id === value)?.name || value}
            />
            {REVENUE_STREAMS.map(s => (
              <Area
                key={s.id}
                type="monotone"
                dataKey={s.id}
                stackId="1"
                stroke={s.color}
                fill={s.color}
                fillOpacity={0.3}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassPanel>
  );
});

RevenueProjectionChart.displayName = 'RevenueProjectionChart';
