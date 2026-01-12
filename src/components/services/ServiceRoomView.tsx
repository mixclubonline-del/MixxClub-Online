import { ReactNode, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ServiceRoomViewProps {
  backgroundAsset: string;
  title: string;
  subtitle: string;
  accentColor: string;
  children: ReactNode;
  backLink?: string;
}

export function ServiceRoomView({ 
  backgroundAsset, 
  title, 
  subtitle, 
  accentColor,
  children,
  backLink = '/services'
}: ServiceRoomViewProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 100]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const contentY = useTransform(scrollY, [0, 300], [0, -50]);

  useEffect(() => {
    const img = new Image();
    img.src = backgroundAsset;
    img.onload = () => setIsLoaded(true);
  }, [backgroundAsset]);

  return (
    <div className="min-h-screen relative bg-[#0a0a1a]">
      {/* Fixed background with parallax */}
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
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-[#0a0a1a]" />
        <div className={`absolute inset-0 bg-gradient-to-t ${accentColor} opacity-20`} />
      </motion.div>

      {/* Hero section */}
      <motion.div 
        className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6"
        style={{ opacity: heroOpacity }}
      >
        {/* Back button */}
        <motion.div 
          className="absolute top-24 left-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link to={backLink}>
            <Button variant="ghost" className="gap-2 text-white/70 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4" />
              Back to Services
            </Button>
          </Link>
        </motion.div>

        {/* Title */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{ y: contentY }}
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.div
            className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="w-1.5 h-3 bg-white/60 rounded-full" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Content section with glass panels */}
      <div className="relative z-20 bg-gradient-to-b from-transparent via-[#0a0a1a]/80 to-[#0a0a1a]">
        <div className="max-w-7xl mx-auto px-6 py-20">
          {children}
        </div>
      </div>
    </div>
  );
}
