import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { REVENUE_STREAMS, projectAll, ScenarioKey, SCENARIO_META } from './projectionModels';
import { GlassPanel } from '@/components/crm/design';
import { formatCurrency } from '@/lib/utils';

const SCENARIOS: ScenarioKey[] = ['conservative', 'moderate', 'aggressive'];
const BAR_COLORS: Record<ScenarioKey, string> = { conservative: '#f59e0b', moderate: '#6366f1', aggressive: '#10b981' };

export const ScenarioComparison: React.FC = React.memo(() => {
  const data = useMemo(() => {
    return REVENUE_STREAMS.map(stream => {
      const row: Record<string, string | number> = { name: stream.name };
      SCENARIOS.forEach(s => {
        const proj = projectAll(s);
        const idx = REVENUE_STREAMS.findIndex(r => r.id === stream.id);
        row[s] = proj.streamData[idx].monthly.reduce((a, b) => a + b, 0);
      });
      return row;
    });
  }, []);

  const totals = useMemo(() => {
    const row: Record<string, string | number> = { name: 'TOTAL' };
    SCENARIOS.forEach(s => { row[s] = projectAll(s).annualTotal; });
    return row;
  }, []);

  return (
    <GlassPanel className="w-full" padding="p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-foreground mb-1">Scenario Comparison — Annual Revenue</h3>
      <p className="text-xs text-muted-foreground mb-4">Side-by-side comparison across all 13 streams</p>

      {/* Totals banner */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {SCENARIOS.map(s => (
          <div key={s} className="rounded-xl bg-white/5 border border-white/8 p-3 text-center">
            <p className={`text-xs ${SCENARIO_META[s].colorClass}`}>{SCENARIO_META[s].label}</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(totals[s] as number)}</p>
          </div>
        ))}
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis type="number" tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
            <YAxis type="category" dataKey="name" width={120} tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
              formatter={(value: number, name: string) => [formatCurrency(value), SCENARIO_META[name as ScenarioKey]?.label || name]}
            />
            <Legend formatter={(value: string) => SCENARIO_META[value as ScenarioKey]?.label || value} />
            {SCENARIOS.map(s => (
              <Bar key={s} dataKey={s} fill={BAR_COLORS[s]} radius={[0, 4, 4, 0]} barSize={8} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassPanel>
  );
});

ScenarioComparison.displayName = 'ScenarioComparison';
