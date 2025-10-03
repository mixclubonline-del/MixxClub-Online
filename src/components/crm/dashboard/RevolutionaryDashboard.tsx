import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { AICopilotSidebar } from './AICopilotSidebar';
import { AudioVisualization3D } from './AudioVisualization3D';
import { SmartStatsGrid } from './SmartStatsGrid';
import { GamificationHub } from './GamificationHub';
import { AIProjectRecommender } from './AIProjectRecommender';
import { LiveActivityFeed } from './LiveActivityFeed';
import { QuickActionLauncher } from './QuickActionLauncher';
import { useMoodTheming } from '@/hooks/useMoodTheming';
import { useAIDashboardInsights } from '@/hooks/useAIDashboardInsights';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import { cn } from '@/lib/utils';

export const RevolutionaryDashboard = () => {
  const { user } = useAuth();
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(true);
  const { theme, updateMood } = useMoodTheming();
  const { insights, isLoading: insightsLoading } = useAIDashboardInsights();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open command palette with Cmd+K or /
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* AI Copilot Sidebar */}
      <AICopilotSidebar 
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(!copilotOpen)}
        insights={insights}
        isLoading={insightsLoading}
      />

      {/* Morphing Background */}
      <motion.div
        className="fixed inset-0 -z-10"
        animate={{
          background: [
            `linear-gradient(135deg, ${theme.primary}15 0%, ${theme.secondary}15 100%)`,
            `linear-gradient(225deg, ${theme.secondary}15 0%, ${theme.primary}15 100%)`,
            `linear-gradient(135deg, ${theme.primary}15 0%, ${theme.secondary}15 100%)`,
          ]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      {/* Particle Effects */}
      <div className="fixed inset-0 -z-5 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight 
            }}
            animate={{
              x: [null, Math.random() * window.innerWidth],
              y: [null, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Main Content with Dynamic Padding */}
      <div className={cn(
        "transition-all duration-300 container px-4 md:px-6 py-6 space-y-6",
        copilotOpen ? "ml-80" : "ml-0"
      )}>
        {/* Gamification Bar */}
        <GamificationHub />

        {/* Smart Stats Grid */}
        <SmartStatsGrid />

        {/* Main Grid: Projects + Activity Feed */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* AI Recommended Projects (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <AIProjectRecommender />
            
            {/* 3D Audio Visualization */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <AudioVisualization3D />
            </motion.div>
          </div>

          {/* Live Activity Feed (1/3 width) */}
          <div className="lg:col-span-1">
            <LiveActivityFeed />
          </div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <QuickActionLauncher onOpenPalette={() => setShowCommandPalette(true)} />
        </motion.div>
      </div>

      {/* Command Palette Modal */}
      <AnimatePresence>
        {showCommandPalette && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-32"
            onClick={() => setShowCommandPalette(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <QuickActionLauncher 
                fullScreen 
                onClose={() => setShowCommandPalette(false)} 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};