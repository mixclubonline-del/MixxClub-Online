import { motion } from 'framer-motion';
import { Activity, Users, Radio, Zap } from 'lucide-react';
import { useCommunityStats } from '@/hooks/useCommunityStats';
import { useLiveActivity } from '@/hooks/useLiveActivity';
import { Badge } from '@/components/ui/badge';

export const LivePulseHero = () => {
  const { data: stats, isLoading } = useCommunityStats();
  const { activities, isLive } = useLiveActivity();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card/80 to-background border border-white/5 p-8 md:p-12">
      {/* Animated Background Pulse */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary/5"
            style={{
              width: 200 + i * 100,
              height: 200 + i * 100,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3]
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <Activity className="w-8 h-8 text-primary" />
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent-blue to-accent-cyan">
              Community Pulse
            </h1>
          </motion.div>

          <Badge variant="outline" className="gap-2 px-4 py-2 bg-green-500/10 border-green-500/30">
            <motion.div
              className="w-2 h-2 bg-green-500 rounded-full"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            {isLive ? 'Live' : 'Connecting...'}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center p-4 rounded-xl bg-background/30 backdrop-blur-sm border border-white/5"
          >
            <Users className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-3xl font-bold text-foreground">
              {isLoading ? '...' : stats?.totalUsers.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Members</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center p-4 rounded-xl bg-background/30 backdrop-blur-sm border border-white/5"
          >
            <Radio className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <div className="text-3xl font-bold text-green-500">
              {isLoading ? '...' : stats?.activeNow}
            </div>
            <div className="text-sm text-muted-foreground">Active Now</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center p-4 rounded-xl bg-background/30 backdrop-blur-sm border border-white/5"
          >
            <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <div className="text-3xl font-bold text-yellow-500">
              {isLoading ? '...' : stats?.activeSessions}
            </div>
            <div className="text-sm text-muted-foreground">Live Sessions</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center p-4 rounded-xl bg-background/30 backdrop-blur-sm border border-white/5"
          >
            <Activity className="w-6 h-6 text-accent-cyan mx-auto mb-2" />
            <div className="text-3xl font-bold text-accent-cyan">
              {isLoading ? '...' : stats?.activeBattles}
            </div>
            <div className="text-sm text-muted-foreground">Active Battles</div>
          </motion.div>
        </div>

        {/* Live Activity Ticker */}
        <div className="relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-muted-foreground">Happening Now</span>
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
          </div>

          <div className="flex gap-4 overflow-hidden">
            <motion.div
              className="flex gap-4"
              animate={{ x: [0, -1000] }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            >
              {[...activities, ...activities].slice(0, 10).map((activity, i) => (
                <div
                  key={`${activity.id}-${i}`}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 border border-white/5 text-sm"
                >
                  <span className="font-medium">{activity.user}</span>
                  <span className="text-muted-foreground">{activity.message || activity.type}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePulseHero;
