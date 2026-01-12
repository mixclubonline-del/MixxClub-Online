import { motion } from 'framer-motion';
import { Users, Zap, Music, Radio } from 'lucide-react';
import { useCommunityStats } from '@/hooks/useCommunityStats';
import { useLiveActivity } from '@/hooks/useLiveActivity';

export const PlazaCore = () => {
  const { data: stats, isLoading } = useCommunityStats();
  const { activities } = useLiveActivity();
  
  const coreStats = [
    { label: 'Active Now', value: stats?.activeNow || 0, icon: Radio, color: 'text-green-400' },
    { label: 'Members', value: stats?.totalUsers || 0, icon: Users, color: 'text-primary' },
    { label: 'Sessions', value: stats?.activeSessions || 0, icon: Zap, color: 'text-accent-cyan' },
    { label: 'Tracks', value: stats?.projectsCompleted || 0, icon: Music, color: 'text-accent' },
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      {/* Glass orb container */}
      <div className="relative backdrop-blur-xl bg-card/40 rounded-3xl border border-white/10 p-6 overflow-hidden">
        {/* Animated glow */}
        <motion.div
          className="absolute inset-0 rounded-3xl"
          animate={{
            boxShadow: [
              '0 0 30px hsl(var(--primary) / 0.2)',
              '0 0 50px hsl(var(--primary) / 0.3)',
              '0 0 30px hsl(var(--primary) / 0.2)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        {/* Stats grid */}
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {coreStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="text-center"
            >
              <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
              <motion.div
                className="text-2xl md:text-3xl font-bold"
                key={stat.value}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
              >
                {isLoading ? '—' : stat.value.toLocaleString()}
              </motion.div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
        
        {/* Activity ticker */}
        <div className="relative overflow-hidden h-8">
          <motion.div
            className="flex gap-8 whitespace-nowrap"
            animate={{ x: [0, -1000] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          >
            {[...activities, ...activities].slice(0, 20).map((activity, i) => (
              <span key={i} className="text-sm text-muted-foreground">
                <span className="text-primary">{activity.user}</span>
                {' '}{activity.message || activity.action || 'joined the plaza'}
              </span>
            ))}
          </motion.div>
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-card/40 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-card/40 to-transparent pointer-events-none" />
        </div>
      </div>
    </motion.div>
  );
};

export default PlazaCore;
