import { ReactNode, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ServicesDistrictProps {
  backgroundAsset: string;
  children: ReactNode;
}

export function ServicesDistrict({ backgroundAsset, children }: ServicesDistrictProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const overlayOpacity = useTransform(scrollY, [0, 300], [0.4, 0.7]);

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
          className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#0a0a1a]"
          style={{ opacity: overlayOpacity }}
        />
        
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-gradient-radial from-accent/10 via-transparent to-transparent opacity-60" />
      </motion.div>

      {/* Ambient particles */}
      <div className="fixed inset-0 z-10 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-accent/40 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
            }}
            animate={{
              y: [null, -100],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
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
