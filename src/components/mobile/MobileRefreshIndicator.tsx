import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileRefreshIndicatorProps {
  isRefreshing: boolean;
  progress?: number;
}

export const MobileRefreshIndicator = ({ 
  isRefreshing, 
  progress = 0 
}: MobileRefreshIndicatorProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div 
        className={cn(
          'flex items-center justify-center py-3 transition-all duration-300',
          isRefreshing ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
        )}
      >
        <div className="bg-background/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      </div>
      
      {/* Progress bar */}
      {!isRefreshing && progress > 0 && (
        <div className="h-1 bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-200"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};
