import React, { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFlowNavigation } from '@/core/fabric/useFlow';
import { cn } from '@/lib/utils';
import Navigation from '@/components/Navigation';
import { RoleSwitcher } from './RoleSwitcher';
import { ProactivePrimeBot } from './ai/ProactivePrimeBot';
import { CRMHubGrid } from './CRMHubGrid';
import { CRMActivePanel } from './CRMActivePanel';
import { CRMStatusBar } from './CRMStatusBar';
import { useIsMobile } from '@/hooks/use-mobile';

// Import backgrounds
import artistBg from '@/assets/crm-artist-bg.jpg';
import engineerBg from '@/assets/crm-engineer-bg.jpg';

interface CRMPortalProps {
  children: ReactNode;
  userType: 'artist' | 'engineer';
  profile: any;
  stats: Array<{
    icon: ReactNode;
    label: string;
    value: number | string;
    color: string;
  }>;
  quickActions: Array<{
    label: string;
    icon: ReactNode;
    onClick: () => void;
    variant?: 'default' | 'outline';
  }>;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const CRMPortal: React.FC<CRMPortalProps> = ({
  children,
  userType,
  profile,
  stats,
  quickActions,
  activeTab,
  onTabChange,
}) => {
  const { navigateTo } = useFlowNavigation();
  const isMobile = useIsMobile();
  const [isHubGridVisible, setIsHubGridVisible] = useState(activeTab === 'dashboard' || activeTab === '');
  
  const backgroundImage = userType === 'artist' ? artistBg : engineerBg;
  const glowColor = userType === 'artist' ? 'hsl(280 70% 50%)' : 'hsl(30 90% 50%)';
  
  const handleHubSelect = (hubId: string) => {
    onTabChange(hubId);
    setIsHubGridVisible(false);
  };
  
  const handleBackToGrid = () => {
    onTabChange('dashboard');
    setIsHubGridVisible(true);
  };
  
  const handleNavigate = (path: string) => {
    navigateTo(path);
  };

  return (
    <>
      <RoleSwitcher />
      <div className="min-h-screen relative overflow-hidden">
        {/* Immersive Background */}
        <motion.div 
          className="fixed inset-0 -z-20"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          <img 
            src={backgroundImage}
            alt=""
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay for readability */}
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, 
                hsla(var(--background) / 0.3) 0%,
                hsla(var(--background) / 0.6) 50%,
                hsla(var(--background) / 0.85) 100%
              )`
            }}
          />
        </motion.div>
        
        {/* Ambient glow effect */}
        <div 
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${glowColor} / 0.15 0%, transparent 60%)`
          }}
        />
        
        {/* Subtle animated particles */}
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, -100, -20],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 4,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
        
        <Navigation />
        
        <div className={cn(
          "relative z-10",
          isMobile ? "pt-20 pb-24 px-4" : "pt-20 px-6"
        )}>
          {/* Status Bar */}
          <CRMStatusBar 
            userType={userType} 
            profile={profile} 
            stats={stats}
            onBackToGrid={!isHubGridVisible ? handleBackToGrid : undefined}
          />
          
          {/* Main Content Area */}
          <div className="mt-6 max-w-[1800px] mx-auto">
            <AnimatePresence mode="wait">
              {isHubGridVisible ? (
                <motion.div
                  key="hub-grid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CRMHubGrid 
                    userType={userType} 
                    onHubSelect={handleHubSelect}
                    quickActions={quickActions}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="active-panel"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.4 }}
                >
                  <CRMActivePanel 
                    hubId={activeTab} 
                    userType={userType}
                    onClose={handleBackToGrid}
                  >
                    {children}
                  </CRMActivePanel>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Proactive Prime Bot */}
        <ProactivePrimeBot userType={userType} onNavigate={handleNavigate} />
      </div>
    </>
  );
};
