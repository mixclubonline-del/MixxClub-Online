import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { PrimeAvatar } from './PrimeAvatar';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface PrimeEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  children?: ReactNode;
}

export const PrimeEmptyState = ({
  icon: Icon,
  title,
  message,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  children,
}: PrimeEmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center"
    >
      <div className="relative mb-6">
        <PrimeAvatar size="xl" animate />
        {Icon && (
          <div className="absolute -bottom-2 -right-2 bg-primary/10 rounded-full p-2">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
      </div>

      <h3 className="text-2xl font-bold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6 leading-relaxed">{message}</p>

      {(actionLabel || secondaryActionLabel || children) && (
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          {actionLabel && onAction && (
            <Button onClick={onAction} size="lg">
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button onClick={onSecondaryAction} variant="outline" size="lg">
              {secondaryActionLabel}
            </Button>
          )}
          {children}
        </div>
      )}
    </motion.div>
  );
};
