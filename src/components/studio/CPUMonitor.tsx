import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface CPUMonitorProps {
  className?: string;
}

export const CPUMonitor = ({ className }: CPUMonitorProps) => {
  const [cpuUsage, setCpuUsage] = useState(0);
  const [dspUsage, setDspUsage] = useState(0);

  useEffect(() => {
    // Simulate CPU monitoring (in real implementation, measure actual audio processing load)
    const interval = setInterval(() => {
      const baseCPU = 10 + Math.random() * 20;
      const baseDSP = 15 + Math.random() * 25;
      setCpuUsage(baseCPU);
      setDspUsage(baseDSP);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const cpuWarning = cpuUsage > 70;
  const dspWarning = dspUsage > 80;

  return (
    <div className={cn('flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[hsl(var(--studio-surface))] border border-[hsl(var(--studio-border))]', className)}>
      <Activity className="w-3 h-3 text-[hsl(var(--studio-text-dim))]" />
      
      {/* CPU Usage */}
      <div className="flex flex-col gap-0.5 min-w-[60px]">
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-mono text-[hsl(var(--studio-text-dim))] uppercase">CPU</span>
          <span className={cn(
            'text-[8px] font-mono tabular-nums',
            cpuWarning ? 'text-[hsl(var(--led-red))] font-bold' : 'text-[hsl(var(--studio-text))]'
          )}>
            {Math.round(cpuUsage)}%
          </span>
        </div>
        <div className="h-1 bg-[hsl(var(--studio-black))] rounded-full overflow-hidden">
          <div 
            className={cn(
              'h-full transition-all duration-300',
              cpuWarning ? 'bg-[hsl(var(--led-red))]' : 'bg-[hsl(var(--led-green))]'
            )}
            style={{ width: `${Math.min(100, cpuUsage)}%` }}
          />
        </div>
      </div>

      {/* DSP Usage */}
      <div className="flex flex-col gap-0.5 min-w-[60px]">
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-mono text-[hsl(var(--studio-text-dim))] uppercase">DSP</span>
          <span className={cn(
            'text-[8px] font-mono tabular-nums',
            dspWarning ? 'text-[hsl(var(--led-red))] font-bold' : 'text-[hsl(var(--studio-text))]'
          )}>
            {Math.round(dspUsage)}%
          </span>
        </div>
        <div className="h-1 bg-[hsl(var(--studio-black))] rounded-full overflow-hidden">
          <div 
            className={cn(
              'h-full transition-all duration-300',
              dspWarning ? 'bg-[hsl(var(--led-red))]' : 'bg-primary'
            )}
            style={{ width: `${Math.min(100, dspUsage)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
