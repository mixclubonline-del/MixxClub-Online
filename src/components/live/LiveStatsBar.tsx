import React from 'react';
import { Eye, Radio, Gift, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLiveStreams } from '@/hooks/useLiveStream';

interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  delay: number;
}

const StatItem: React.FC<StatItemProps> = ({ icon, value, label, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
    className="flex items-center gap-2.5 px-4 py-2"
  >
    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-lg font-bold text-foreground leading-none">
        {value.toLocaleString()}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  </motion.div>
);

export const LiveStatsBar: React.FC = () => {
  const { data: liveStreams } = useLiveStreams({ isLive: true });

  const activeStreams = liveStreams?.length || 0;
  const totalViewers = liveStreams?.reduce((sum, s) => sum + (s.viewer_count || 0), 0) || 0;
  const totalGiftsValue = liveStreams?.reduce((sum, s) => sum + (s.total_gifts_value || 0), 0) || 0;
  const totalHosts = new Set(liveStreams?.map(s => s.host_id)).size || 0;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/50 bg-muted/30 backdrop-blur-sm divide-x divide-border/30">
      <StatItem
        icon={<Radio className="h-4 w-4 text-destructive" />}
        value={activeStreams}
        label="Live Now"
        delay={0}
      />
      <StatItem
        icon={<Eye className="h-4 w-4 text-primary" />}
        value={totalViewers}
        label="Watching"
        delay={0.05}
      />
      <StatItem
        icon={<Users className="h-4 w-4 text-accent" />}
        value={totalHosts}
        label="Creators"
        delay={0.1}
      />
      <StatItem
        icon={<Gift className="h-4 w-4 text-warning" />}
        value={totalGiftsValue}
        label="Gifts Sent"
        delay={0.15}
      />
    </div>
  );
};

export default LiveStatsBar;
