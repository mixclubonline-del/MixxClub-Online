import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface StudioPanelProps {
  children: ReactNode;
  visible: boolean;
  onClose: () => void;
  title?: string;
  position?: 'left' | 'right' | 'bottom';
}

export const StudioPanel = ({ 
  children, 
  visible, 
  onClose, 
  title,
  position = 'right' 
}: StudioPanelProps) => {
  const positionStyles = {
    left: 'left-4 top-24 bottom-4 w-96',
    right: 'right-4 top-24 bottom-4 w-96',
    bottom: 'left-4 right-4 bottom-4 h-80',
  };

  const slideVariants = {
    left: { initial: { x: -400, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -400, opacity: 0 } },
    right: { initial: { x: 400, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: 400, opacity: 0 } },
    bottom: { initial: { y: 400, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: 400, opacity: 0 } },
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`
            fixed z-40 ${positionStyles[position]}
            bg-background/80 backdrop-blur-xl
            border border-primary/20
            rounded-2xl
            shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_60px_hsl(var(--primary)/0.1)]
            overflow-hidden
          `}
          initial={slideVariants[position].initial}
          animate={slideVariants[position].animate}
          exit={slideVariants[position].exit}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Holographic border effect */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none">
            <div className="absolute inset-0 rounded-2xl border border-primary/10" />
            <div 
              className="absolute -inset-px rounded-2xl opacity-50"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, transparent 50%, hsl(var(--accent) / 0.1) 100%)',
              }}
            />
          </div>
          
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
              <h3 className="text-sm font-bold text-foreground">{title}</h3>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-muted/50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          {/* Content */}
          <div className={`overflow-auto ${title ? 'h-[calc(100%-52px)]' : 'h-full'}`}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
