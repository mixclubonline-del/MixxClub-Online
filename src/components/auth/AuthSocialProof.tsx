import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, DollarSign, Music, Zap, CheckCircle, TrendingUp } from 'lucide-react';
import { useCommunityStats } from '@/hooks/useCommunityStats';

interface AuthSocialProofProps {
  className?: string;
}

export const AuthSocialProof = ({ className }: AuthSocialProofProps) => {
  const { data: stats, isLoading } = useCommunityStats();
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);

  // Simulated recent activities for the ticker
  const recentActivities = [
    { name: "Marcus W.", action: "just joined as an engineer", time: "2m ago" },
    { name: "Aaliyah J.", action: "started a new mixing session", time: "5m ago" },
    { name: "Devon T.", action: "completed their first project", time: "8m ago" },
    { name: "Jasmine K.", action: "earned their first $500", time: "12m ago" },
    { name: "Tyrell B.", action: "just joined as an artist", time: "15m ago" },
  ];

  // Rotate through activities
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivityIndex((prev) => (prev + 1) % recentActivities.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return null;
  }

  // Use real stats or fallback to demo numbers
  const displayStats = {
    totalUsers: stats?.totalUsers || 847,
    totalEngineers: stats?.totalEngineers || 156,
    activeSessions: stats?.activeSessions || 23,
    totalEarnings: stats?.totalEarnings || 124500,
    projectsCompleted: stats?.projectsCompleted || 2341,
  };

  return (
    <div className={className}>
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center p-3 rounded-lg mg-pill flex-col"
        >
          <Users className="w-5 h-5 text-primary mx-auto mb-1" />
          <div className="text-lg font-bold text-white">{displayStats.totalUsers.toLocaleString()}</div>
          <div className="text-xs text-white/50">Members</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center p-3 rounded-lg mg-pill flex-col"
        >
          <Music className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">{displayStats.projectsCompleted.toLocaleString()}</div>
          <div className="text-xs text-white/50">Projects</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center p-3 rounded-lg mg-pill flex-col"
        >
          <DollarSign className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">${(displayStats.totalEarnings / 1000).toFixed(0)}K+</div>
          <div className="text-xs text-white/50">Earned</div>
        </motion.div>
      </div>

      {/* Live Activity Ticker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative h-10 overflow-hidden rounded-lg mg-pill"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentActivityIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center px-4 gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-white/80 truncate">
              <span className="font-medium text-white">{recentActivities[currentActivityIndex].name}</span>{' '}
              {recentActivities[currentActivityIndex].action}
            </span>
            <span className="text-xs text-white/40 shrink-0">{recentActivities[currentActivityIndex].time}</span>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Active Now Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-2 mt-3"
      >
        <div className="flex -space-x-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/80 to-cyan-500/80 border-2 border-black/50 flex items-center justify-center text-[10px] font-bold text-white"
            >
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>
        <span className="text-xs text-white/60">
          <span className="text-green-400 font-medium">{displayStats.activeSessions}</span> sessions live now
        </span>
      </motion.div>
    </div>
  );
};

export const RoleBenefits = ({ role }: { role: 'artist' | 'engineer' | 'producer' | 'fan' }) => {
  const artistBenefits = [
    { icon: <Zap className="w-4 h-4" />, text: "AI-Powered Mastering" },
    { icon: <Users className="w-4 h-4" />, text: "Smart Engineer Matching" },
    { icon: <Music className="w-4 h-4" />, text: "Distribution to 150+ Platforms" },
  ];

  const engineerBenefits = [
    { icon: <DollarSign className="w-4 h-4" />, text: "Revenue Dashboard & Analytics" },
    { icon: <Users className="w-4 h-4" />, text: "Client CRM System" },
    { icon: <TrendingUp className="w-4 h-4" />, text: "Professional Portfolio" },
  ];

  const producerBenefits = [
    { icon: <Music className="w-4 h-4" />, text: "Beat Catalog & Sales" },
    { icon: <Users className="w-4 h-4" />, text: "Connect with Artists" },
    { icon: <DollarSign className="w-4 h-4" />, text: "Licensing & Revenue" },
  ];

  const fanBenefits = [
    { icon: <Music className="w-4 h-4" />, text: "Exclusive Premieres" },
    { icon: <Zap className="w-4 h-4" />, text: "Earn MixxCoinz" },
    { icon: <Users className="w-4 h-4" />, text: "Day 1 Badges" },
  ];

  const benefits = role === 'artist' ? artistBenefits :
    role === 'engineer' ? engineerBenefits :
      role === 'producer' ? producerBenefits : fanBenefits;
  const accentColor = role === 'artist' ? 'text-primary' :
    role === 'engineer' ? 'text-cyan-400' :
      role === 'producer' ? 'text-amber-400' : 'text-pink-400';

  return (
    <div className="space-y-2 mt-4">
      <p className="text-xs text-white/50 text-center">Unlock with your account:</p>
      <div className="flex flex-wrap justify-center gap-2">
        {benefits.map((benefit, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * idx }}
            className="mg-pill"
          >
            <span className={accentColor}>{benefit.icon}</span>
            <span className="text-xs text-white/70">{benefit.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export const UsernamePreview = ({ username }: { username: string }) => {
  if (!username || username.length < 2) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-2 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-cyan-500/10 border border-primary/20"
    >
      <div className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-green-400" />
        <span className="text-sm text-white/80">Your profile will be:</span>
      </div>
      <div className="mt-1 text-center">
        <span className="text-lg font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
          mixxclub.online/u/{username.toLowerCase().replace(/\s+/g, '')}
        </span>
      </div>
    </motion.div>
  );
};
