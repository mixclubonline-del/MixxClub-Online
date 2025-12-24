import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Users, Mic2, Sliders, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RoleCounts {
  artist: number;
  engineer: number;
  fan: number;
  total: number;
}

export function SocialProofCounter() {
  const [counts, setCounts] = useState<RoleCounts>({
    artist: 0,
    engineer: 0,
    fan: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const { data, error } = await supabase
          .from('waitlist_signups')
          .select('role');

        if (error) throw error;

        const roleCounts = {
          artist: 0,
          engineer: 0,
          fan: 0,
          total: data?.length || 0,
        };

        data?.forEach((signup) => {
          if (signup.role === 'artist') roleCounts.artist++;
          else if (signup.role === 'engineer') roleCounts.engineer++;
          else if (signup.role === 'fan') roleCounts.fan++;
        });

        setCounts(roleCounts);
      } catch (error) {
        console.error('Error fetching counts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('waitlist-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'waitlist_signups',
        },
        (payload) => {
          const role = payload.new.role as 'artist' | 'engineer' | 'fan';
          setCounts((prev) => ({
            ...prev,
            [role]: prev[role] + 1,
            total: prev.total + 1,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const roleStats = [
    { id: 'artist', label: 'Artists', count: counts.artist, icon: Mic2, color: 'text-primary' },
    { id: 'engineer', label: 'Engineers', count: counts.engineer, icon: Sliders, color: 'text-accent-blue' },
    { id: 'fan', label: 'Fans', count: counts.fan, icon: Heart, color: 'text-accent-magenta' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 text-muted-foreground">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main counter */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Users className="w-4 h-4 text-muted-foreground" />
        <motion.span
          key={counts.total}
          className="text-lg font-semibold text-foreground"
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {counts.total.toLocaleString()}
        </motion.span>
        <span className="text-muted-foreground text-sm">creators waiting</span>
      </div>

      {/* Role breakdown */}
      {counts.total > 0 && (
        <motion.div
          className="flex items-center justify-center gap-4 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {roleStats.map((stat) => (
            <div key={stat.id} className="flex items-center gap-1">
              <stat.icon className={`w-3 h-3 ${stat.color}`} />
              <span className="text-muted-foreground">
                {stat.count} {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
