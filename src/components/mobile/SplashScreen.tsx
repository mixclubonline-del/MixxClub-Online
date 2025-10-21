import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogoGlow } from '@/components/brand/LogoGlow';
import { AudioWaveformBg } from '@/components/brand/AudioWaveformBg';

export const SplashScreen = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    
    if (hasSeenSplash) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      sessionStorage.setItem('hasSeenSplash', 'true');
      setIsVisible(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[200] bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center"
        >
          <div className="relative">
            <LogoGlow intensity="high" />
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative z-10"
            >
              <div className="text-center">
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-5xl font-bold bg-gradient-to-r from-mixx-pink via-mixx-lavender to-mixx-cyan bg-clip-text text-transparent mb-4"
                >
                  MixClub
                </motion.h1>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <AudioWaveformBg bars={30} height={40} className="mb-4" />
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="text-muted-foreground text-sm"
                >
                  Professional Audio Engineering
                </motion.p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
