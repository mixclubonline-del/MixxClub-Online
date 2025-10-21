import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useHaptics } from '@/hooks/useHaptics';

interface MobileFabProps {
  icon: ReactNode;
  onClick: () => void;
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left';
  className?: string;
  label?: string;
}

export const MobileFab = ({
  icon,
  onClick,
  position = 'bottom-right',
  className,
  label
}: MobileFabProps) => {
  const haptics = useHaptics();

  const positions = {
    'bottom-right': 'bottom-20 right-6',
    'bottom-center': 'bottom-20 left-1/2 -translate-x-1/2',
    'bottom-left': 'bottom-20 left-6'
  };

  const handleClick = () => {
    haptics.light();
    onClick();
  };

  return (
    <Button
      onClick={handleClick}
      size={label ? 'default' : 'icon'}
      className={cn(
        'fixed z-50 shadow-lg h-14 rounded-full',
        'touch-manipulation active:scale-95 transition-transform',
        'bg-primary hover:bg-primary/90',
        positions[position],
        label && 'px-6 gap-2',
        !label && 'w-14',
        className
      )}
    >
      {icon}
      {label && <span className="font-medium">{label}</span>}
    </Button>
  );
};
