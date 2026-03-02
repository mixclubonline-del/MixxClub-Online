import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Zap, Users, Radio, Music, Mic } from 'lucide-react';
import mixxclub3DLogo from '@/assets/mixxclub-3d-logo.png';
import { LogoAnimations } from './LogoAnimations';
import { useAudioReactivity } from '@/hooks/useAudioReactivity';
import { useCollaborationStatus } from '@/hooks/useCollaborationStatus';

export const DynamicLogo = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const audioState = useAudioReactivity();
  const collaborationData = useCollaborationStatus();

  useEffect(() => {
    // Show activity notifications periodically
    const interval = setInterval(() => {
      setShowActivity(true);
      setTimeout(() => setShowActivity(false), 3000);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    if (audioState.isPlaying) return <Music className="w-3 h-3" />;
    if (collaborationData.isLive) return <Radio className="w-3 h-3" />;
    return <Users className="w-3 h-3" />;
  };

  const getStatusText = () => {
    if (audioState.isPlaying) return 'Audio Playing';
    if (collaborationData.isLive) return 'Live Session';
    return `${collaborationData.activeUsers} Online`;
  };

  const getStatusColor = () => {
    if (audioState.isPlaying) return 'text-green-500';
    if (collaborationData.isLive) return 'text-red-500';
    return 'text-primary';
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Dynamic Logo Container */}
      <div className="relative">
        <motion.div
          className="relative group cursor-pointer"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="relative w-32 h-32">
            {/* Base glow effect */}
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse-glow"></div>
            
            {/* Audio-reactive animations */}
            <LogoAnimations
              isActive={audioState.isPlaying || collaborationData.isLive}
              amplitude={audioState.amplitude}
              frequency={audioState.frequency}
              beats={audioState.beats}
            />
            
            {/* Main logo */}
            <motion.img
              src={mixxclub3DLogo}
              alt="Mixxclub 3D Logo"
              className="w-full h-full relative z-10 rounded-full"
              animate={{
                rotateY: isHovered ? 360 : 0,
                filter: audioState.isPlaying 
                  ? `hue-rotate(${audioState.frequency / 100}deg) saturate(${1 + audioState.amplitude / 200})` 
                  : 'none'
              }}
              transition={{
                rotateY: { duration: 1, ease: "easeInOut" },
                filter: { duration: 0.3 }
              }}
            />

            {/* Real-time status indicator */}
            <motion.div
              className="absolute -top-2 -right-2 z-20"
              animate={{
                scale: collaborationData.isLive ? [1, 1.2, 1] : 1,
              }}
              transition={{
                scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <div className={`w-6 h-6 rounded-full border-2 border-background flex items-center justify-center ${
                audioState.isPlaying ? 'bg-green-500' :
                collaborationData.isLive ? 'bg-red-500' : 'bg-primary'
              }`}>
                {getStatusIcon()}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Activity notification */}
        <AnimatePresence>
          {showActivity && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 z-30"
            >
              <div className="bg-background/90 backdrop-blur-sm border border-primary/20 rounded-lg px-3 py-2 shadow-lg">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-muted-foreground">
                    {collaborationData.recentActivity[Math.floor(Math.random() * collaborationData.recentActivity.length)]}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dynamic status badge */}
      <motion.div
        animate={{
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Badge variant="outline" className={`gap-2 px-3 py-1 ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="font-medium">{getStatusText()}</span>
          {collaborationData.isLive && (
            <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
          )}
        </Badge>
      </motion.div>

      {/* Live collaboration indicators */}
      {collaborationData.activeSessions > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 text-xs text-muted-foreground"
        >
          <div className="flex items-center gap-1">
            <Mic className="w-3 h-3" />
            <span>{collaborationData.activeSessions} sessions</span>
          </div>
          <div className="w-1 h-1 bg-muted-foreground/50 rounded-full" />
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{collaborationData.onlineEngineers} engineers</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};