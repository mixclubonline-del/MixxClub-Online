import { ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

interface OnboardingPortalProps {
  role: 'artist' | 'engineer' | 'producer' | 'fan';
  backgroundImage: string;
  currentStep: number;
  totalSteps: number;
  isCompleting?: boolean;
  destinationPath: string;
  children: ReactNode;
}

export function OnboardingPortal({
  role,
  backgroundImage,
  currentStep,
  totalSteps,
  isCompleting = false,
  destinationPath,
  children,
}: OnboardingPortalProps) {
  const navigate = useNavigate();
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Calculate parallax offset based on step progress
  const progressPercent = currentStep / (totalSteps - 1);
  const parallaxOffset = progressPercent * 5; // Subtle zoom effect
  
  // Handle completion celebration
  useEffect(() => {
    if (isCompleting) {
      setShowCelebration(true);
      
      // Trigger confetti
      confetti({
        particleCount: role === 'engineer' || role === 'producer' ? 150 : 100,
        spread: 100,
        origin: { y: 0.6 },
        colors: role === 'engineer'
          ? ['#FFD700', '#FFA500', '#FF6347']
          : role === 'producer'
            ? ['#FFD700', '#F59E0B', '#D97706']
            : role === 'fan'
              ? ['#EC4899', '#F472B6', '#F9A8D4']
              : ['#A855F7', '#EC4899', '#8B5CF6'],
      });
      
      // Navigate after celebration
      const timer = setTimeout(() => {
        navigate(destinationPath);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isCompleting, destinationPath, navigate, role]);

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Cinematic background with parallax */}
      <motion.div
        className="absolute inset-0"
        animate={{
          scale: 1 + parallaxOffset * 0.02,
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <img
          src={backgroundImage}
          alt=""
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
      </motion.div>
      
      {/* Ambient particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 rounded-full ${
              role === 'artist' ? 'bg-primary/40' : 'bg-accent/40'
            }`}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0,
            }}
            animate={{
              y: [null, -100],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: 'linear',
            }}
          />
        ))}
      </div>
      
      {/* Completion celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ 
                  duration: 0.6,
                  repeat: 2,
                }}
                className="text-6xl mb-4"
              >
                {role === 'artist' ? '🎤' : role === 'engineer' ? '🎛️' : role === 'producer' ? '🎹' : '💜'}
              </motion.div>
              <h2 className="text-3xl font-bold mb-2">Welcome to MIXXCLUB!</h2>
              <p className="text-muted-foreground">
                Entering your {
                  role === 'artist' ? 'Creative Hub' : 
                  role === 'engineer' ? 'Engineering Bay' : 
                  role === 'producer' ? 'Beat Forge' : 
                  'Fan Zone'
                }...
              </p>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className={`h-1 mt-4 rounded-full mx-auto max-w-xs ${
                  role === 'artist' ? 'bg-primary' : 'bg-accent'
                }`}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main content */}
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
}
