import { Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useOnlineUsers } from '@/hooks/useOnlineUsers';

/**
 * Displays real-time online user count from database
 * Follows Live Data First doctrine - no Math.random() simulation
 */
export const OnlineNowCounter = () => {
  const { totalOnline, isLoading } = useOnlineUsers();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <Users className="w-3.5 h-3.5 text-green-500" />
      <span className="text-sm font-medium text-green-400">
        {isLoading ? '...' : totalOnline} online
      </span>
    </motion.div>
  );
};
