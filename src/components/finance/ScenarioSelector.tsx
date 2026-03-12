import React from 'react';
import { ScenarioKey, SCENARIO_META } from './projectionModels';
import { cn } from '@/lib/utils';

interface Props {
  value: ScenarioKey;
  onChange: (s: ScenarioKey) => void;
}

const SCENARIOS: ScenarioKey[] = ['conservative', 'moderate', 'aggressive'];
const BG_MAP: Record<ScenarioKey, string> = {
  conservative: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
  moderate: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
  aggressive: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
};
const INACTIVE = 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10';

export const ScenarioSelector: React.FC<Props> = React.memo(({ value, onChange }) => (
  <div className="flex items-center gap-2">
    {SCENARIOS.map(s => (
      <button
        key={s}
        onClick={() => onChange(s)}
        className={cn(
          'px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200',
          value === s ? BG_MAP[s] : INACTIVE,
        )}
      >
        <span className="block">{SCENARIO_META[s].label}</span>
        <span className="text-[10px] opacity-70">{SCENARIO_META[s].desc}</span>
      </button>
    ))}
  </div>
));

ScenarioSelector.displayName = 'ScenarioSelector';
