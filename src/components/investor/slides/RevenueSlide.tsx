import { SlideLayout, SlideLabel } from './SlideLayout';
import { projectAll, REVENUE_STREAMS } from '@/components/finance/projectionModels';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { useMemo } from 'react';

export function RevenueSlide() {
  const projection = useMemo(() => projectAll('moderate'), []);

  const chartData = projection.months.map((month, i) => {
    const point: Record<string, string | number> = { month };
    projection.streamData.forEach(({ stream, monthly }) => {
      point[stream.name] = monthly[i];
    });
    point['Total'] = projection.monthlyTotals[i];
    return point;
  });

  const annualFormatted = formatCurrency(projection.annualTotal);

  return (
    <SlideLayout>
      <div className="flex items-start justify-between">
        <div>
          <SlideLabel>Revenue Projections</SlideLabel>
          <h1 className="text-[64px] font-bold text-foreground leading-tight">
            {annualFormatted} <span className="text-[36px] text-muted-foreground font-normal">Year 1 (Moderate)</span>
          </h1>
        </div>
        <div className="text-right">
          <p className="text-[20px] text-muted-foreground">5% Monthly Growth</p>
          <p className="text-[20px] text-muted-foreground">Per 1,000 Users</p>
        </div>
      </div>

      <div className="flex-1 mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
            <defs>
              {REVENUE_STREAMS.map((s) => (
                <linearGradient key={s.id} id={`grad-${s.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.6} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0.05} />
                </linearGradient>
              ))}
            </defs>
            <XAxis dataKey="month" tick={{ fill: 'hsl(0 0% 60%)', fontSize: 16 }} />
            <YAxis tick={{ fill: 'hsl(0 0% 60%)', fontSize: 16 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: 'hsl(262 30% 6%)', border: '1px solid hsl(262 30% 18%)', borderRadius: 12, fontSize: 14 }}
              formatter={(value: number) => formatCurrency(value)}
            />
            {REVENUE_STREAMS.map((s) => (
              <Area
                key={s.id}
                type="monotone"
                dataKey={s.name}
                stackId="1"
                stroke={s.color}
                fill={`url(#grad-${s.id})`}
                strokeWidth={1}
              />
            ))}
            <Legend wrapperStyle={{ fontSize: 13, paddingTop: 8 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </SlideLayout>
  );
}
