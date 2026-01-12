import { ReactNode, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface MarketplaceBazaarProps {
  backgroundAsset: string;
  children: ReactNode;
}

export function MarketplaceBazaar({ backgroundAsset, children }: MarketplaceBazaarProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 100]);
  const overlayOpacity = useTransform(scrollY, [0, 300], [0.5, 0.8]);

  useEffect(() => {
    const img = new Image();
    img.src = backgroundAsset;
    img.onload = () => setIsLoaded(true);
  }, [backgroundAsset]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a1a]">
      {/* Background layer with parallax */}
      <motion.div 
        className="fixed inset-0 z-0"
        style={{ y: backgroundY }}
      >
        <motion.img
          src={backgroundAsset}
          alt=""
          className="w-full h-[120vh] object-cover"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ 
            opacity: isLoaded ? 1 : 0, 
            scale: isLoaded ? 1 : 1.1 
          }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        
        {/* Gradient overlay */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-[#0a0a1a]"
          style={{ opacity: overlayOpacity }}
        />
        
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-gradient-radial from-orange-500/10 via-transparent to-transparent opacity-40" />
      </motion.div>

      {/* Bazaar ambient particles */}
      <div className="fixed inset-0 z-10 pointer-events-none overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() > 0.7 ? 3 : 2,
              height: Math.random() > 0.7 ? 3 : 2,
              background: i % 3 === 0 
                ? 'rgba(249, 115, 22, 0.6)' 
                : i % 3 === 1 
                  ? 'rgba(168, 85, 247, 0.6)' 
                  : 'rgba(34, 211, 238, 0.6)',
            }}
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
            }}
            animate={{
              y: [null, -50, null],
              x: [null, Math.random() * 30 - 15, null],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Content layer */}
      <div className="relative z-20">
        {children}
      </div>
    </div>
  );
}
