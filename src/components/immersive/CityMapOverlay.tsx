/**
 * City Map Overlay
 * 
 * Spatial Interface: An immersive aerial view of Mixxclub City.
 * Districts are glowing hotspots on an AI-generated cityscape.
 * Text appears only on hover.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VisualHotspot } from '@/components/ui/VisualHotspot';
import { DISTRICT_HOTSPOTS } from '@/lib/spatial-interface';
import cityMapBg from '@/assets/city-map-overview.jpg';

interface CityMapOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CityMapOverlay = ({ isOpen, onClose }: CityMapOverlayProps) => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[75] flex items-center justify-center overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mixxclub City Map"
        >
          {/* AI-Generated City Background */}
          <motion.img
            src={cityMapBg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            onLoad={() => setIsLoaded(true)}
          />

          {/* Dark overlay for depth */}
          <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]" />

          {/* Ambient fog overlay */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 30%, hsl(var(--background) / 0.6) 100%)',
            }}
          />

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-primary/30"
                style={{
                  width: Math.random() * 3 + 1,
                  height: Math.random() * 3 + 1,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: Math.random() * 10 + 15,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          {/* Backdrop click to close */}
          <div
            className="absolute inset-0"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Close button - minimal */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 bg-background/50 backdrop-blur-sm hover:bg-background/70"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* District Hotspots */}
          <div className="relative w-full h-full max-w-6xl max-h-[85vh] mx-4">
            <AnimatePresence mode="sync">
              {isLoaded && DISTRICT_HOTSPOTS.map((district, index) => (
                <motion.div
                  key={district.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    delay: 0.3 + index * 0.08,
                    type: 'spring',
                    damping: 20,
                  }}
                >
                  <VisualHotspot
                    position={district.position}
                    size={district.size}
                    glowColor={district.glowColor}
                    label={district.name}
                    description={district.description}
                    highlight={district.highlight}
                    state={district.highlight ? 'active' : 'idle'}
                    onClick={() => handleNavigate(district.path)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Minimal corner hint - keyboard shortcut */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-4 right-4 text-xs text-muted-foreground/50"
          >
            <kbd className="px-1.5 py-0.5 bg-muted/30 rounded text-[10px]">ESC</kbd>
            <span className="ml-1">to close</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
