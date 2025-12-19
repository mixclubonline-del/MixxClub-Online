import React from 'react';
import { Lock, Unlock, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TrackLockIndicatorProps {
  trackId: string;
  isLocked: boolean;
  isLockedByMe: boolean;
  lockedByName?: string;
  canLock: boolean;
  onLock: () => void;
  onUnlock: () => void;
}

export const TrackLockIndicator: React.FC<TrackLockIndicatorProps> = ({
  isLocked,
  isLockedByMe,
  lockedByName,
  canLock,
  onLock,
  onUnlock,
}) => {
  if (!canLock && !isLocked) {
    return null;
  }

  const handleClick = () => {
    if (isLockedByMe) {
      onUnlock();
    } else if (!isLocked && canLock) {
      onLock();
    }
  };

  const getTooltipContent = () => {
    if (isLockedByMe) {
      return 'Click to unlock this track';
    }
    if (isLocked) {
      return `Locked by ${lockedByName || 'another user'}`;
    }
    return 'Click to lock this track for exclusive editing';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-6 w-6 transition-colors',
              isLockedByMe && 'text-primary bg-primary/10',
              isLocked && !isLockedByMe && 'text-destructive bg-destructive/10 cursor-not-allowed'
            )}
            onClick={handleClick}
            disabled={isLocked && !isLockedByMe}
          >
            {isLocked ? (
              isLockedByMe ? (
                <LockKeyhole className="h-3.5 w-3.5" />
              ) : (
                <Lock className="h-3.5 w-3.5" />
              )
            ) : (
              <Unlock className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">{getTooltipContent()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
