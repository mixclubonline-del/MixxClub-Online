import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LatencyMonitorProps {
  totalLatency: number;
  compensated: boolean;
  className?: string;
}

export const LatencyMonitor = ({ totalLatency, compensated, className }: LatencyMonitorProps) => {
  const latencyMs = totalLatency.toFixed(1);
  const latencyWarning = totalLatency > 20;

  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-1.5 rounded-lg',
      'bg-[hsl(var(--studio-surface))] border border-[hsl(var(--studio-border))]',
      className
    )}>
      <Clock className="w-3 h-3 text-[hsl(var(--studio-text-dim))]" />
      
      <div className="flex items-center gap-2">
        <span className="text-[8px] font-mono text-[hsl(var(--studio-text-dim))] uppercase">
          Latency
        </span>
        <span className={cn(
          'text-[8px] font-mono tabular-nums font-bold',
          latencyWarning ? 'text-[hsl(var(--led-yellow))]' : 'text-[hsl(var(--studio-text))]'
        )}>
          {latencyMs}ms
        </span>
      </div>

      {compensated && (
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-[hsl(var(--led-green))] shadow-[0_0_4px_hsl(var(--led-green))]" />
          <span className="text-[7px] font-mono text-[hsl(var(--led-green))] uppercase">
            Comp
          </span>
        </div>
      )}
    </div>
  );
};
