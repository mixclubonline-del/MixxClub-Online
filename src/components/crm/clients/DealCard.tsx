import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Calendar, User, MoreVertical, GripVertical } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface DealCardProps {
  deal: {
    id: string;
    title: string;
    value: number | null;
    currency: string | null;
    stage: string;
    probability: number | null;
    expected_close_date: string | null;
    created_at: string;
    client?: {
      id: string;
      name: string;
      avatar_url: string | null;
    };
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStageChange: (id: string, stage: string) => void;
  isDragging?: boolean;
}

const probabilityColors: Record<string, string> = {
  high: 'text-emerald-400',
  medium: 'text-amber-400',
  low: 'text-red-400',
};

export const DealCard: React.FC<DealCardProps> = ({
  deal,
  onEdit,
  onDelete,
  onStageChange,
  isDragging,
}) => {
  const getProbabilityLevel = (prob: number | null) => {
    if (!prob) return 'low';
    if (prob >= 70) return 'high';
    if (prob >= 40) return 'medium';
    return 'low';
  };

  const clientInitials = deal.client?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'group p-3 rounded-lg border border-border bg-card cursor-grab active:cursor-grabbing',
        'hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all',
        isDragging && 'opacity-50 rotate-2 scale-105'
      )}
    >
      {/* Drag Handle */}
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground/50 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm text-foreground truncate">
              {deal.title}
            </h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(deal.id)}>
                  Edit Deal
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onStageChange(deal.id, 'won')}>
                  Mark as Won
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStageChange(deal.id, 'lost')}>
                  Mark as Lost
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => onDelete(deal.id)}
                >
                  Delete Deal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Value */}
          <div className="flex items-center gap-2 mt-2">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            <span className="text-lg font-bold text-foreground">
              {(deal.value || 0).toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">{deal.currency || 'USD'}</span>
          </div>

          {/* Client */}
          {deal.client && (
            <div className="flex items-center gap-2 mt-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={deal.client.avatar_url || undefined} />
                <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                  {clientInitials}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate">
                {deal.client.name}
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
            {deal.probability !== null && (
              <Badge 
                variant="outline" 
                className={cn('text-xs', probabilityColors[getProbabilityLevel(deal.probability)])}
              >
                {deal.probability}% likely
              </Badge>
            )}
            {deal.expected_close_date && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>
                  {formatDistanceToNow(new Date(deal.expected_close_date), { addSuffix: true })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
