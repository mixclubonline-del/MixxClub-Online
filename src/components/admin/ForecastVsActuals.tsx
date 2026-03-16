import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { projectAll, SCENARIO_META, type ScenarioKey } from '@/components/finance/projectionModels';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { format, startOfMonth, subMonths, addMonths } from 'date-fns';

interface ForecastVsActualsProps {
  payments: Array<{ amount: number; status: string; created_at: string }>;
}

export function ForecastVsActuals({ payments }: ForecastVsActualsProps) {
  const [scenario, setScenario] = useState<ScenarioKey>('moderate');
  const projection = useMemo(() => projectAll(scenario), [scenario]);

  const chartData = useMemo(() => {
    const now = new Date();
    const months: { label: string; start: Date; end: Date }[] = [];

    // Build 12-month window: 6 past + current + 5 future
    for (let i = -6; i < 6; i++) {
      const start = startOfMonth(addMonths(now, i));
      const end = startOfMonth(addMonths(now, i + 1));
      months.push({ label: format(start, 'MMM yyyy'), start, end });
    }

    const completed = payments.filter(p => p.status === 'completed');

    return months.map((m, idx) => {
      // Actual revenue for this month
      const actual = completed
        .filter(p => {
          const d = new Date(p.created_at);
          return d >= m.start && d < m.end;
        })
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      // Projected: use month index offset (projection starts at month 0)
      const projIdx = idx; // 0-11 maps to Mo 1-12
      const projected = projIdx < projection.monthlyTotals.length
        ? projection.monthlyTotals[projIdx]
        : null;

      const isPast = m.end <= now;

      return {
        month: m.label,
        actual: isPast ? Math.round(actual * 100) / 100 : null,
        projected: projected != null ? Math.round(projected * 100) / 100 : null,
      };
    });
  }, [payments, projection]);

  return (
    <Card className="bg-background/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base">Forecast vs Actuals</CardTitle>
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          {(Object.keys(SCENARIO_META) as ScenarioKey[]).map(key => (
            <Button
              key={key}
              variant={scenario === key ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2.5 text-xs"
              onClick={() => setScenario(key)}
            >
              {SCENARIO_META[key].label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number | null) => value != null ? [`$${value.toLocaleString()}`] : ['—']}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual Revenue"
              stroke="hsl(142 71% 45%)"
              strokeWidth={2.5}
              dot={{ fill: 'hsl(142 71% 45%)', r: 4 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="projected"
              name={`Projected (${SCENARIO_META[scenario].label})`}
              stroke="hsl(262 83% 58%)"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Variance summary for past months */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {chartData
            .filter(d => d.actual != null && d.projected != null)
            .slice(-3)
            .map(d => {
              const variance = d.actual! - d.projected!;
              const pct = d.projected! > 0 ? ((variance / d.projected!) * 100).toFixed(1) : '0';
              return (
                <div key={d.month} className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">{d.month}</p>
                  <p className={`text-sm font-bold ${variance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {variance >= 0 ? '+' : ''}{pct}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ${d.actual!.toLocaleString()} vs ${d.projected!.toLocaleString()}
                  </p>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}
