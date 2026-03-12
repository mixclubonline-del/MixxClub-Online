import React, { useState } from 'react';
import { HubHeader } from '@/components/crm/design';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScenarioSelector } from './ScenarioSelector';
import { RevenueProjectionChart } from './RevenueProjectionChart';
import { StreamProjectionTable } from './StreamProjectionTable';
import { BreakEvenAnalysis } from './BreakEvenAnalysis';
import { ScenarioComparison } from './ScenarioComparison';
import { UnitEconomicsCard } from './UnitEconomicsCard';
import { ScenarioKey, projectAll } from './projectionModels';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, DollarSign, BarChart3 } from 'lucide-react';

export const FinancialProjectionsDashboard: React.FC = () => {
  const [scenario, setScenario] = useState<ScenarioKey>('moderate');
  const proj = projectAll(scenario);

  return (
    <div className="space-y-6 pb-12">
      <HubHeader
        icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
        title="Financial Projections"
        subtitle="13-stream revenue modeling • 1,000 user base"
        accent="rgba(16, 185, 129, 0.35)"
        action={<ScenarioSelector value={scenario} onChange={setScenario} />}
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Annual Revenue', value: formatCurrency(proj.annualTotal), icon: DollarSign, accent: 'text-emerald-400' },
          { label: 'Month 1', value: formatCurrency(proj.monthlyTotals[0]), icon: BarChart3, accent: 'text-blue-400' },
          { label: 'Month 12', value: formatCurrency(proj.monthlyTotals[11]), icon: TrendingUp, accent: 'text-purple-400' },
          { label: 'Break-Even', value: proj.breakEvenMonth ? `Month ${proj.breakEvenMonth}` : 'Month 1', icon: TrendingUp, accent: 'text-amber-400' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-4">
            <k.icon className={`w-4 h-4 mb-1 ${k.accent}`} />
            <p className={`text-xl font-bold ${k.accent}`}>{k.value}</p>
            <p className="text-[11px] text-muted-foreground">{k.label}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="streams">Streams</TabsTrigger>
          <TabsTrigger value="breakeven">Break-Even</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-4">
          <RevenueProjectionChart scenario={scenario} />
          <UnitEconomicsCard scenario={scenario} />
        </TabsContent>

        <TabsContent value="streams" className="mt-4">
          <StreamProjectionTable scenario={scenario} />
        </TabsContent>

        <TabsContent value="breakeven" className="mt-4">
          <BreakEvenAnalysis scenario={scenario} />
        </TabsContent>

        <TabsContent value="scenarios" className="mt-4">
          <ScenarioComparison />
        </TabsContent>
      </Tabs>
    </div>
  );
};
