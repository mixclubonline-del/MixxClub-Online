import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlazaZoneProps {
  id: string;
  title: string;
  icon: ReactNode;
  children: ReactNode;
  glowColor?: string;
  delay?: number;
}

export const PlazaZone = ({ id, title, icon, children, glowColor = 'primary', delay = 0 }: PlazaZoneProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <>
      {/* Collapsed zone card */}
      <motion.div
        layoutId={`zone-${id}`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay }}
        className={cn(
          "relative group cursor-pointer",
          isExpanded && "pointer-events-none opacity-0"
        )}
        onClick={() => setIsExpanded(true)}
      >
        {/* Glass container */}
        <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-card/30 border border-white/10 p-6 transition-all duration-300 group-hover:border-primary/40 group-hover:bg-card/40">
          {/* Glow effect on hover */}
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              boxShadow: `0 0 40px hsl(var(--${glowColor}) / 0.3), inset 0 0 40px hsl(var(--${glowColor}) / 0.05)`,
            }}
          />
          
          {/* Header */}
          <div className="relative flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`text-${glowColor === 'primary' ? 'primary' : glowColor}`}>
                {icon}
              </div>
              <h3 className="text-lg font-bold">{title}</h3>
            </div>
            <Maximize2 className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          {/* Preview content */}
          <div className="relative max-h-[300px] overflow-hidden">
            {children}
            {/* Fade out at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card/80 to-transparent pointer-events-none" />
          </div>
        </div>
      </motion.div>
      
      {/* Expanded modal */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              onClick={() => setIsExpanded(false)}
            />
            
            {/* Expanded content */}
            <motion.div
              layoutId={`zone-${id}`}
              className="fixed inset-4 md:inset-8 lg:inset-16 z-50 overflow-auto"
            >
              <div className="relative min-h-full rounded-2xl backdrop-blur-xl bg-card/90 border border-white/20 p-6 md:p-8">
                {/* Close button */}
                <button
                  onClick={() => setIsExpanded(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`text-${glowColor === 'primary' ? 'primary' : glowColor}`}>
                    {icon}
                  </div>
                  <h2 className="text-2xl font-bold">{title}</h2>
                </div>
                
                {/* Full content */}
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default PlazaZone;
