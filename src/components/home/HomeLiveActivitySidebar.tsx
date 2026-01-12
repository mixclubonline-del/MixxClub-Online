/**
 * Home Live Activity Sidebar
 * 
 * A floating sidebar showing real-time platform activity.
 * Desktop only, collapsible.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  ChevronRight, 
  ChevronLeft,
  UserPlus,
  Upload,
  Radio,
  Trophy,
  Star
} from 'lucide-react';
import { useLiveActivity } from '@/hooks/useLiveActivity';

const ACTIVITY_ICONS = {
  signup: UserPlus,
  upload: Upload,
  session: Radio,
  achievement: Trophy,
  collaboration: Star,
};

const ACTIVITY_COLORS = {
  signup: 'text-emerald-400',
  upload: 'text-secondary',
  session: 'text-primary',
  achievement: 'text-yellow-400',
  collaboration: 'text-accent',
};

export function HomeLiveActivitySidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const { activities, isLive } = useLiveActivity();
  
  // Only show on desktop
  const [isDesktop, setIsDesktop] = useState(false);
  
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1280);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  
  if (!isDesktop) return null;
  
  const recentActivities = activities.slice(0, 5);
  
  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40"
    >
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            {/* Sidebar panel */}
            <div className="w-72 bg-card/95 backdrop-blur-lg border-l border-t border-b 
                            border-border/50 rounded-l-xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 
                              border-b border-border/50 bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Activity className="w-4 h-4 text-primary" />
                    {isLive && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 
                                       bg-emerald-400 rounded-full animate-pulse" />
                    )}
                  </div>
                  <span className="text-sm font-medium">Live Activity</span>
                </div>
                
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 rounded hover:bg-muted/50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              
              {/* Activity list */}
              <div className="p-3 space-y-2 max-h-80 overflow-y-auto hide-scrollbar">
                <AnimatePresence mode="popLayout">
                  {recentActivities.map((activity, index) => {
                    const IconComponent = ACTIVITY_ICONS[activity.type as keyof typeof ACTIVITY_ICONS] || Activity;
                    const colorClass = ACTIVITY_COLORS[activity.type as keyof typeof ACTIVITY_COLORS] || 'text-muted-foreground';
                    
                    return (
                      <motion.div
                        key={activity.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="flex items-start gap-3 p-2 rounded-lg 
                                   bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className={`p-1.5 rounded-md bg-background/50 ${colorClass}`}>
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {activity.user}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {activity.message || activity.action}
                          </p>
                        </div>
                        
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {activity.time || 'now'}
                        </span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                
                {recentActivities.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    Waiting for activity...
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2 px-3 py-4 bg-card/95 backdrop-blur-lg
                       border-l border-t border-b border-border/50 rounded-l-xl
                       hover:bg-muted/50 transition-colors shadow-lg"
          >
            <div className="relative">
              <Activity className="w-4 h-4 text-primary" />
              {isLive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 
                                 bg-emerald-400 rounded-full animate-pulse" />
              )}
            </div>
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
