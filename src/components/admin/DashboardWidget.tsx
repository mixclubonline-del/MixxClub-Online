import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, X, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardWidgetProps {
  id: string;
  title: string;
  children: ReactNode;
  onRemove?: (id: string) => void;
  onExpand?: (id: string) => void;
  className?: string;
  isDragging?: boolean;
}

export function DashboardWidget({
  id,
  title,
  children,
  onRemove,
  onExpand,
  className,
  isDragging,
}: DashboardWidgetProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden transition-shadow',
        isDragging && 'opacity-50',
        className
      )}
    >
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        <div className="flex items-center gap-1">
          {onExpand && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onExpand(id)}
              className="h-7 w-7 p-0"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
          )}
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(id)}
              className="h-7 w-7 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </Card>
  );
}
