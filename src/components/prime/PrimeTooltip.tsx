import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PrimeAvatar } from './PrimeAvatar';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PrimeTooltipProps {
  children: ReactNode;
  message: string;
  show: boolean;
  onDismiss?: () => void;
  position?: 'top' | 'bottom' | 'left' | 'right';
  persistent?: boolean;
}

export const PrimeTooltip = ({
  children,
  message,
  show,
  onDismiss,
  position = 'top',
  persistent = false,
}: PrimeTooltipProps) => {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-block">
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 10 : position === 'bottom' ? -10 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`absolute ${positionClasses[position]} z-50 w-max max-w-xs`}
          >
            <div className="relative bg-card border border-primary/20 rounded-lg shadow-elegant p-3">
              <div className="absolute -top-1 -left-1">
                <PrimeAvatar size="sm" />
              </div>
              <div className="pl-8 pr-6">
                <p className="text-sm text-foreground leading-relaxed">{message}</p>
              </div>
              {!persistent && onDismiss && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-1 -right-1 h-6 w-6"
                  onClick={onDismiss}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
