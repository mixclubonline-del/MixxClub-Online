import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { ProjectsGridHero } from './ProjectsGridHero';
import { LiveActivityFeed } from './LiveActivityFeed';
import { QuickActionLauncher } from './QuickActionLauncher';
import { useMoodTheming } from '@/hooks/useMoodTheming';
import { cn } from '@/lib/utils';
import { CollapsibleCard } from '@/components/ui/collapsible-card';
import { Command, FolderKanban, Radio } from 'lucide-react';
import { useAudioReactivity } from '@/hooks/useAudioReactivity';

export const RevolutionaryDashboard = () => {
  const { user } = useAuth();
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const { theme, updateMood } = useMoodTheming();
  const { amplitude } = useAudioReactivity();
  const intensity = amplitude / 100; // Normalize to 0-1

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
      {/* Morphing Background with Audio Reactivity */}
      <motion.div
        className="fixed inset-0 -z-10"
        animate={{
          background: [
            `radial-gradient(circle at 20% 50%, hsl(var(--ember) / ${0.15 + intensity * 0.1}) 0%, transparent 50%), 
             radial-gradient(circle at 80% 50%, hsl(var(--midnight-light) / 0.3) 0%, transparent 50%), 
             linear-gradient(135deg, hsl(var(--midnight)) 0%, hsl(var(--midnight-dark)) 100%)`,
            `radial-gradient(circle at 80% 50%, hsl(var(--ember) / ${0.15 + intensity * 0.1}) 0%, transparent 50%), 
             radial-gradient(circle at 20% 50%, hsl(var(--midnight-light) / 0.3) 0%, transparent 50%), 
             linear-gradient(225deg, hsl(var(--midnight)) 0%, hsl(var(--midnight-dark)) 100%)`,
            `radial-gradient(circle at 20% 50%, hsl(var(--ember) / ${0.15 + intensity * 0.1}) 0%, transparent 50%), 
             radial-gradient(circle at 80% 50%, hsl(var(--midnight-light) / 0.3) 0%, transparent 50%), 
             linear-gradient(135deg, hsl(var(--midnight)) 0%, hsl(var(--midnight-dark)) 100%)`,
          ]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      {/* Audio-Reactive Particle Effects */}
      <div className="fixed inset-0 -z-5 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-ember/30 to-ember-light/20"
            style={{
              width: `${2 + intensity * 4}px`,
              height: `${2 + intensity * 4}px`,
              filter: 'blur(1px)',
            }}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: 0.3 + intensity * 0.3,
            }}
            animate={{
              x: [null, Math.random() * window.innerWidth],
              y: [null, Math.random() * window.innerHeight],
              opacity: [0.3 + intensity * 0.3, 0.5 + intensity * 0.5, 0.3 + intensity * 0.3],
              scale: [1, 1 + intensity * 0.5, 1],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Dashboard Content */}
      <div className="container px-4 md:px-6 py-6 space-y-6">
        <CollapsibleCard
          title="Quick Actions"
          icon={<Command className="w-5 h-5" />}
          defaultOpen={true}
          storageKey="crm-quick-actions"
          contentClassName="p-0"
        >
          <QuickActionLauncher onOpenPalette={() => setShowCommandPalette(true)} />
        </CollapsibleCard>

        <CollapsibleCard
          title="Active Projects"
          icon={<FolderKanban className="w-5 h-5" />}
          defaultOpen={true}
          storageKey="crm-active-projects"
          contentClassName="p-0"
        >
          <ProjectsGridHero userRole="artist" />
        </CollapsibleCard>

        <CollapsibleCard
          title="Live Activity"
          icon={<Radio className="w-5 h-5" />}
          defaultOpen={true}
          storageKey="crm-live-activity"
          contentClassName="p-0"
        >
          <LiveActivityFeed />
        </CollapsibleCard>
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