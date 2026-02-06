import React, { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import Navigation from '@/components/Navigation';
import { RoleSwitcher } from './RoleSwitcher';
import { ProactivePrimeBot } from './ai/ProactivePrimeBot';
import { CRMHubGrid } from './CRMHubGrid';
import { CRMActivePanel } from './CRMActivePanel';
import { CRMStatusBar } from './CRMStatusBar';
import { useIsMobile } from '@/hooks/use-mobile';
import { AdminRolePreview } from '@/components/admin/AdminRolePreview';
import { useAdminPreview } from '@/stores/useAdminPreview';

// Import role-specific backgrounds
import artistBg from '@/assets/crm-artist-bg.jpg';
import engineerBg from '@/assets/crm-engineer-bg.jpg';
import producerBg from '@/assets/crm-producer-bg.jpg';
import fanBg from '@/assets/crm-fan-bg.jpg';

interface CRMPortalProps {
  children: ReactNode;
   userType: 'artist' | 'engineer' | 'producer' | 'fan' | 'admin';
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

// Each role gets a unique background and glow palette
const ROLE_VISUALS: Record<string, {
  bg: string;
  glow: string;
  overlayGradient: string;
}> = {
  artist: {
    bg: artistBg,
    glow: 'hsl(280 70% 50%)',
    overlayGradient: 'linear-gradient(180deg, rgba(10,0,20,0.3) 0%, rgba(10,0,20,0.65) 50%, rgba(10,0,20,0.88) 100%)',
  },
  engineer: {
    bg: engineerBg,
    glow: 'hsl(30 90% 50%)',
    overlayGradient: 'linear-gradient(180deg, rgba(15,8,0,0.3) 0%, rgba(15,8,0,0.65) 50%, rgba(15,8,0,0.88) 100%)',
  },
  producer: {
    bg: producerBg,
    glow: 'hsl(45 90% 50%)',
    overlayGradient: 'linear-gradient(180deg, rgba(12,10,0,0.3) 0%, rgba(12,10,0,0.65) 50%, rgba(12,10,0,0.88) 100%)',
  },
  fan: {
    bg: fanBg,
    glow: 'hsl(330 80% 60%)',
    overlayGradient: 'linear-gradient(180deg, rgba(15,0,10,0.3) 0%, rgba(15,0,10,0.65) 50%, rgba(15,0,10,0.88) 100%)',
  },
  admin: {
    bg: engineerBg,
    glow: 'hsl(200 80% 50%)',
    overlayGradient: 'linear-gradient(180deg, rgba(0,8,15,0.3) 0%, rgba(0,8,15,0.65) 50%, rgba(0,8,15,0.88) 100%)',
  },
};

export const CRMPortal: React.FC<CRMPortalProps> = ({
  children,
  userType,
  profile,
  stats,
  quickActions,
  activeTab,
  onTabChange,
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isPreviewMode } = useAdminPreview();
  const [isHubGridVisible, setIsHubGridVisible] = useState(activeTab === 'dashboard' || activeTab === '');
  
  const visuals = ROLE_VISUALS[userType] || ROLE_VISUALS.artist;
  
  const handleHubSelect = (hubId: string) => {
    onTabChange(hubId);
    setIsHubGridVisible(false);
  };
  
  const handleBackToGrid = () => {
    onTabChange('dashboard');
    setIsHubGridVisible(true);
  };
  
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <>
      <RoleSwitcher />
      {isPreviewMode && <AdminRolePreview />}
      <div className="min-h-screen relative overflow-hidden">
        {/* Immersive Cinematic Background */}
        <motion.div 
          className="fixed inset-0 -z-20"
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, ease: 'easeOut' }}
        >
          <img 
            src={visuals.bg}
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
          />
          {/* Cinematic gradient overlay */}
          <div 
            className="absolute inset-0"
            style={{ background: visuals.overlayGradient }}
          />
          {/* Secondary noise texture for depth */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence baseFrequency=\'0.9\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")',
              backgroundSize: '128px 128px',
            }}
          />
        </motion.div>
        
        {/* Ambient glow — role-tinted radial */}
        <div 
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse at 30% -10%, ${visuals.glow} / 0.12 0%, transparent 55%),
              radial-gradient(ellipse at 80% 110%, ${visuals.glow} / 0.08 0%, transparent 50%)
            `,
          }}
        />
        
        {/* Floating particles */}
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                width: `${1.5 + Math.random() * 2}px`,
                height: `${1.5 + Math.random() * 2}px`,
                backgroundColor: visuals.glow,
                opacity: 0,
              }}
              animate={{
                y: [-10, -60, -10],
                opacity: [0, 0.4, 0],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 5,
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
        {userType !== 'admin' && <ProactivePrimeBot userType={userType} onNavigate={handleNavigate} />}
      </div>
    </>
  );
};
