import { Loader2, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  isReady: boolean;
}

export function PullToRefreshIndicator({ pullDistance, isRefreshing, isReady }: PullToRefreshIndicatorProps) {
  if (pullDistance === 0 && !isRefreshing) return null;

  const opacity = Math.min(pullDistance / 80, 1);
  const rotation = Math.min((pullDistance / 80) * 180, 180);

  return (
    <div
      className="flex items-center justify-center overflow-hidden transition-[height] duration-200 ease-out"
      style={{ height: isRefreshing ? 48 : pullDistance }}
    >
      <div
        className={cn(
          'flex items-center gap-2 text-xs font-medium transition-colors',
          isReady || isRefreshing ? 'text-primary' : 'text-muted-foreground'
        )}
        style={{ opacity: isRefreshing ? 1 : opacity }}
      >
        {isRefreshing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Refreshing…</span>
          </>
        ) : (
          <>
            <ArrowDown
              className="w-4 h-4 transition-transform"
              style={{ transform: `rotate(${rotation}deg)` }}
            />
            <span>{isReady ? 'Release to refresh' : 'Pull to refresh'}</span>
          </>
        )}
      </div>
    </div>
  );
}
