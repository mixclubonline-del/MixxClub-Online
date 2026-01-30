import { useState, useEffect, ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// District portal backgrounds
import districtTower from '@/assets/district-tower.jpg';
import districtRsd from '@/assets/district-rsd.jpg';
import districtCreator from '@/assets/district-creator.jpg';
import districtNeural from '@/assets/district-neural.jpg';
import districtArena from '@/assets/district-arena.jpg';
import districtCommerce from '@/assets/district-commerce.jpg';
import districtData from '@/assets/district-data.jpg';
import districtBroadcast from '@/assets/district-broadcast.jpg';
import cityGates from '@/assets/city-gates.jpg';

export const DISTRICT_PORTALS: Record<string, { image: string; glowColor: string }> = {
  gates: { image: cityGates, glowColor: '280 65% 60%' },
  tower: { image: districtTower, glowColor: '262 83% 58%' },
  rsd: { image: districtRsd, glowColor: '25 95% 53%' },
  creator: { image: districtCreator, glowColor: '280 65% 60%' },
  neural: { image: districtNeural, glowColor: '190 95% 50%' },
  arena: { image: districtArena, glowColor: '350 80% 55%' },
  commerce: { image: districtCommerce, glowColor: '40 95% 55%' },
  data: { image: districtData, glowColor: '160 84% 40%' },
  broadcast: { image: districtBroadcast, glowColor: '250 75% 60%' },
  dream: { image: districtNeural, glowColor: '270 75% 55%' },
};

interface DistrictPortalProps {
  districtId: keyof typeof DISTRICT_PORTALS;
  children: ReactNode;
  className?: string;
}

export function DistrictPortal({ districtId, children, className }: DistrictPortalProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const { scrollY } = useScroll();
  
  const portal = DISTRICT_PORTALS[districtId];
  
  // Parallax effect for the background
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const overlayOpacity = useTransform(scrollY, [0, 300], [0.3, 0.8]);
  const titleOpacity = useTransform(scrollY, [0, 200], [1, 0]);
  const titleY = useTransform(scrollY, [0, 200], [0, -50]);
  
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' });
  };

  return (
    <div className={cn("min-h-screen", className)}>
      {/* Portal Hero - Full viewport cinematic background */}
      <div className="relative h-screen overflow-hidden">
        {/* Background Image with Parallax */}
        <motion.div 
          className="absolute inset-0 w-full h-[120%]"
          style={{ y: backgroundY }}
        >
          <img
            src={portal.image}
            alt=""
            className={cn(
              "w-full h-full object-cover transition-opacity duration-1000",
              isLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setIsLoaded(true)}
          />
          
          {/* Placeholder gradient while loading */}
          <div 
            className={cn(
              "absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background transition-opacity duration-1000",
              isLoaded ? "opacity-0" : "opacity-100"
            )}
            style={{
              background: `radial-gradient(circle at center, hsl(${portal.glowColor} / 0.2), hsl(var(--background)))`
            }}
          />
        </motion.div>
        
        {/* Ambient Glow Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 30%, hsl(${portal.glowColor} / 0.15) 0%, transparent 60%)`
          }}
        />
        
        {/* Bottom Fade to Content */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"
          style={{ opacity: overlayOpacity }}
        />
        
        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 4 + 1,
                height: Math.random() * 4 + 1,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: `hsl(${portal.glowColor} / ${Math.random() * 0.4 + 0.1})`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        
        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer z-10"
          style={{ opacity: titleOpacity }}
          onClick={scrollToContent}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown 
              className="w-8 h-8 text-foreground/50"
              style={{ filter: `drop-shadow(0 0 10px hsl(${portal.glowColor} / 0.5))` }}
            />
          </motion.div>
        </motion.div>
      </div>
      
      {/* Content Container */}
      <div className="relative z-10 -mt-32">
        <div className="container mx-auto px-4">
          {/* Glass panel that content sits in */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="rounded-t-3xl bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl overflow-hidden"
            style={{
              boxShadow: `0 -20px 60px -10px hsl(${portal.glowColor} / 0.1)`
            }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
