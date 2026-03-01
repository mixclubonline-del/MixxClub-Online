import { DoorOpen, Headphones, LayoutGrid, WandSparkles, Rocket } from 'lucide-react';
import type { PathfinderStep as StepType } from '@/config/pathfinderJourneys';

const ICON_MAP: Record<string, React.ElementType> = {
  'door-open': DoorOpen,
  'headphones': Headphones,
  'layout-grid': LayoutGrid,
  'wand-sparkles': WandSparkles,
  'rocket': Rocket,
};

interface PathfinderStepCardProps {
  step: StepType;
  stepIndex: number;
  totalSteps: number;
  onGo: () => void;
  onSkip: () => void;
}

export const PathfinderStepCard = ({ step, stepIndex, totalSteps, onGo, onSkip }: PathfinderStepCardProps) => {
  const Icon = ICON_MAP[step.icon] || Rocket;

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-white/90 leading-tight">{step.title}</h4>
          <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{step.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onGo}
          className="flex-1 h-8 rounded-lg bg-gradient-to-r from-primary to-primary-glow text-primary-foreground text-xs font-medium
            hover:shadow-[0_0_16px_hsl(var(--primary)/0.4)] transition-all active:scale-[0.97]"
        >
          {step.actionLabel || 'Go'}
        </button>
        <button
          onClick={onSkip}
          className="h-8 px-3 rounded-lg text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
        >
          Skip
        </button>
      </div>

      {/* Mini progress dots */}
      <div className="flex items-center justify-center gap-1.5 pt-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              i === stepIndex
                ? 'bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.6)]'
                : i < stepIndex
                  ? 'bg-white/30'
                  : 'bg-white/10'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
