import { motion, HTMLMotionProps } from 'framer-motion';
import { Button, ButtonProps } from '@/components/ui/button';
import { useHaptics } from '@/hooks/useHaptics';
import { forwardRef } from 'react';

interface AnimatedButtonProps extends ButtonProps {
  haptic?: boolean;
  hapticStyle?: 'light' | 'medium' | 'heavy';
  pressScale?: number;
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ 
    haptic = true, 
    hapticStyle = 'light',
    pressScale = 0.95,
    onClick,
    children,
    ...props 
  }, ref) => {
    const { trigger } = useHaptics();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (haptic) {
        trigger(hapticStyle);
      }
      onClick?.(e);
    };

    return (
      <motion.div
        whileTap={{ scale: pressScale }}
        transition={{ duration: 0.1 }}
      >
        <Button ref={ref} onClick={handleClick} {...props}>
          {children}
        </Button>
      </motion.div>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';
