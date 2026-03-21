import React from 'react';
import { UserPlus, Music, Trophy, Sparkles, Radio, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveActivity, LiveActivity } from '@/hooks/useLiveActivity';

const typeConfig: Record<string, { icon: typeof Radio; colorClass: string; bgClass: string }> = {
  session: { icon: Radio, colorClass: 'text-destructive', bgClass: 'bg-destructive/15' },
  signup: { icon: UserPlus, colorClass: 'text-primary', bgClass: 'bg-primary/15' },
  upload: { icon: Upload, colorClass: 'text-accent', bgClass: 'bg-accent/15' },
  achievement: { icon: Trophy, colorClass: 'text-warning', bgClass: 'bg-warning/15' },
  collaboration: { icon: Sparkles, colorClass: 'text-success', bgClass: 'bg-success/15' },
};

const ActivityItem: React.FC<{ activity: LiveActivity; index: number }> = ({ activity, index }) => {
  const config = typeConfig[activity.type] || typeConfig.session;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1 - index * 0.12, x: 0 }}
      exit={{ opacity: 0, x: 16, height: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
    >
      <div className={`h-8 w-8 rounded-lg ${config.bgClass} flex items-center justify-center shrink-0`}>
        <Icon className={`h-4 w-4 ${config.colorClass}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">
          <span className="font-semibold">{activity.user}</span>{' '}
          {activity.action}
        </p>
        <p className="text-[11px] text-muted-foreground">{activity.time} ago</p>
      </div>
    </motion.div>
  );
};

export const LiveActivitySidebar: React.FC = () => {
  const { activities, isLive } = useLiveActivity();

  return (
    <div className="rounded-xl border border-border/50 bg-muted/20 backdrop-blur-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2.5">
        <div className="relative">
          <div className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
          {isLive && <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-success animate-ping" />}
        </div>
        <h3 className="text-sm font-bold text-foreground">Live Activity</h3>
      </div>

      <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
        <AnimatePresence mode="popLayout">
          {activities.slice(0, 8).map((activity, index) => (
            <ActivityItem key={activity.id} activity={activity} index={index} />
          ))}
        </AnimatePresence>
      </div>

      <div className="px-4 py-2.5 border-t border-border/30">
        <p className="text-[11px] text-center text-muted-foreground">
          Real-time community pulse
        </p>
      </div>
    </div>
  );
};

export default LiveActivitySidebar;
