/**
 * Financial Projection Models — 13 Revenue Streams
 * Pure data: no side effects, no imports.
 */

export type ScenarioKey = 'conservative' | 'moderate' | 'aggressive';

export interface RevenueStream {
  id: string;
  name: string;
  category: 'core' | 'marketplace' | 'economy' | 'services' | 'growth';
  color: string;
  /** Base monthly revenue per 1,000 users by scenario */
  base: Record<ScenarioKey, number>;
  margin: number; // gross margin %
}

export const REVENUE_STREAMS: RevenueStream[] = [
  { id: 'transaction_fees', name: 'Transaction Fees', category: 'core', color: '#8b5cf6', base: { conservative: 12000, moderate: 15000, aggressive: 18000 }, margin: 0.85 },
  { id: 'subscriptions', name: 'Subscriptions', category: 'core', color: '#6366f1', base: { conservative: 14000, moderate: 18050, aggressive: 22000 }, margin: 0.90 },
  { id: 'beat_marketplace', name: 'Beat Marketplace', category: 'marketplace', color: '#ec4899', base: { conservative: 1500, moderate: 3250, aggressive: 5000 }, margin: 0.85 },
  { id: 'mixxcoinz', name: 'MixxCoinz', category: 'economy', color: '#f59e0b', base: { conservative: 2000, moderate: 3500, aggressive: 5000 }, margin: 0.95 },
  { id: 'live_gifting', name: 'Live Gifting', category: 'economy', color: '#ef4444', base: { conservative: 500, moderate: 1250, aggressive: 2000 }, margin: 0.90 },
  { id: 'mastering_packages', name: 'Mastering Packages', category: 'services', color: '#14b8a6', base: { conservative: 2000, moderate: 5500, aggressive: 8000 }, margin: 0.80 },
  { id: 'mixing_packages', name: 'Mixing Packages', category: 'services', color: '#06b6d4', base: { conservative: 1000, moderate: 2500, aggressive: 4000 }, margin: 0.80 },
  { id: 'course_sales', name: 'Course Sales', category: 'services', color: '#10b981', base: { conservative: 500, moderate: 1250, aggressive: 2000 }, margin: 0.85 },
  { id: 'streaming_royalties', name: 'Streaming Royalties', category: 'growth', color: '#a855f7', base: { conservative: 300, moderate: 750, aggressive: 1200 }, margin: 0.80 },
  { id: 'sync_licensing', name: 'Sync Licensing', category: 'growth', color: '#d946ef', base: { conservative: 200, moderate: 500, aggressive: 800 }, margin: 0.80 },
  { id: 'referral_commissions', name: 'Referral Commissions', category: 'growth', color: '#f97316', base: { conservative: 300, moderate: 600, aggressive: 1000 }, margin: 0.70 },
  { id: 'curator_marketplace', name: 'Curator Marketplace', category: 'marketplace', color: '#e11d48', base: { conservative: 400, moderate: 800, aggressive: 1500 }, margin: 0.90 },
  { id: 'distribution_fees', name: 'Distribution Fees', category: 'services', color: '#0ea5e9', base: { conservative: 300, moderate: 550, aggressive: 800 }, margin: 0.85 },
];

export const SCENARIO_META: Record<ScenarioKey, { label: string; growth: number; colorClass: string; desc: string }> = {
  conservative: { label: 'Conservative', growth: 0.02, colorClass: 'text-amber-400', desc: '2% monthly growth' },
  moderate: { label: 'Moderate', growth: 0.05, colorClass: 'text-blue-400', desc: '5% monthly growth' },
  aggressive: { label: 'Aggressive', growth: 0.08, colorClass: 'text-emerald-400', desc: '8% monthly growth' },
};

export interface MonthlyCosts {
  infrastructure: number;
  stripeFeeRate: number; // as decimal
  aiCosts: number;
  payoutRate: number; // % of service revenue paid to providers
  marketing: number;
  support: number;
}

export const COST_MODEL: Record<ScenarioKey, MonthlyCosts> = {
  conservative: { infrastructure: 800, stripeFeeRate: 0.029, aiCosts: 300, payoutRate: 0.35, marketing: 1500, support: 500 },
  moderate: { infrastructure: 1200, stripeFeeRate: 0.029, aiCosts: 600, payoutRate: 0.35, marketing: 3000, support: 1000 },
  aggressive: { infrastructure: 2000, stripeFeeRate: 0.029, aiCosts: 1000, payoutRate: 0.35, marketing: 5000, support: 2000 },
};

/** Generate 12-month projection for a single stream */
export function projectStream(stream: RevenueStream, scenario: ScenarioKey): number[] {
  const base = stream.base[scenario];
  const growth = SCENARIO_META[scenario].growth;
  return Array.from({ length: 12 }, (_, i) => Math.round(base * Math.pow(1 + growth, i)));
}

/** Generate full 12-month projection across all streams */
export function projectAll(scenario: ScenarioKey) {
  const months = Array.from({ length: 12 }, (_, i) => `Mo ${i + 1}`);
  const streamData = REVENUE_STREAMS.map(s => ({ stream: s, monthly: projectStream(s, scenario) }));

  const monthlyTotals = months.map((_, i) => streamData.reduce((sum, sd) => sum + sd.monthly[i], 0));
  const annualTotal = monthlyTotals.reduce((a, b) => a + b, 0);

  const costs = COST_MODEL[scenario];
  const monthlyCosts = months.map((_, i) => {
    const rev = monthlyTotals[i];
    return Math.round(
      costs.infrastructure +
      rev * costs.stripeFeeRate +
      costs.aiCosts +
      rev * costs.payoutRate +
      costs.marketing +
      costs.support
    );
  });

  // Cumulative for break-even
  let cumRev = 0;
  let cumCost = 0;
  const cumulative = months.map((_, i) => {
    cumRev += monthlyTotals[i];
    cumCost += monthlyCosts[i];
    return { month: months[i], monthIndex: i + 1, revenue: cumRev, costs: cumCost, net: cumRev - cumCost };
  });

  const breakEvenMonth = cumulative.findIndex(c => c.net >= 0) + 1 || null;

  return { months, streamData, monthlyTotals, annualTotal, monthlyCosts, cumulative, breakEvenMonth };
}

/** Unit economics helpers */
export function unitEconomics(scenario: ScenarioKey) {
  const proj = projectAll(scenario);
  const avgMonthlyRev = proj.annualTotal / 12;
  const totalUsers = 1000;
  const payingRatio = scenario === 'conservative' ? 0.45 : scenario === 'moderate' ? 0.55 : 0.65;
  const payingUsers = Math.round(totalUsers * payingRatio);

  const arpu = avgMonthlyRev / totalUsers;
  const payingArpu = avgMonthlyRev / payingUsers;
  const ltv12 = payingArpu * 12;
  const cac = scenario === 'conservative' ? 18 : scenario === 'moderate' ? 15 : 12;
  const ltvCac = ltv12 / cac;

  const totalCosts = proj.monthlyCosts.reduce((a, b) => a + b, 0);
  const grossMargin = ((proj.annualTotal - totalCosts) / proj.annualTotal) * 100;
  const paybackMonths = Math.ceil(cac / payingArpu);

  return { arpu, payingArpu, ltv12, cac, ltvCac, grossMargin, paybackMonths, payingUsers, totalUsers, annualRevenue: proj.annualTotal, annualCosts: totalCosts };
}
